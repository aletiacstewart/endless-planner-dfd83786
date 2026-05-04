/**
 * Cross-write helper: when a Complete Tracker entry is saved, fan out
 * its values into the matching individual tracker entries.
 *
 * Linked entries are looked up by a deterministic key derived from the
 * Complete Tracker's `date` field, so re-saving the same day always
 * updates the same linked entry instead of creating new ones.
 */

import {
  createEntry,
  listEntries,
  saveEntry,
  type FieldValue,
  type PlannerEntry,
} from "./db";

interface ParsedDate {
  year: number;
  /** 0-based month index (Jan = 0) */
  monthIndex: number;
  /** 1-based day-of-month */
  day: number;
  /** YYYY-MM-DD */
  iso: string;
}

function parseDate(raw: unknown): ParsedDate | null {
  if (typeof raw !== "string" || !raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    monthIndex: d.getMonth(),
    day: d.getDate(),
    iso: raw.slice(0, 10),
  };
}

/** Returns the Monday on or before the given local date. */
function mondayOf(year: number, monthIndex: number, day: number): Date {
  const d = new Date(year, monthIndex, day);
  const dow = d.getDay(); // Sun=0..Sat=6
  const diff = (dow + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return d;
}

async function findOrCreate(
  pageType: string,
  match: (e: PlannerEntry) => boolean,
  defaults: Record<string, FieldValue> = {},
): Promise<PlannerEntry> {
  const existing = await listEntries(pageType);
  const found = existing.find(match);
  if (found) return found;
  return createEntry(pageType, defaults);
}

async function persist(entry: PlannerEntry, mutator: (vals: Record<string, FieldValue>) => void) {
  const next = { ...entry.values };
  mutator(next);
  await saveEntry({ ...entry, values: next, updatedAt: Date.now() });
}

/** Copy plain same-named keys from source to target. Empty/undefined values clear the target. */
function copyKeys(src: Record<string, FieldValue>, dst: Record<string, FieldValue>, keys: string[]) {
  for (const k of keys) {
    const v = src[k];
    if (v === undefined || v === null || v === "") {
      delete dst[k];
    } else {
      dst[k] = v;
    }
  }
}

/** Merge a single day's value into a calendar-grid record (`{ [day]: string }`). */
function mergeCalendarCell(
  dst: Record<string, FieldValue>,
  field: string,
  day: number,
  value: string,
) {
  const existing = (dst[field] as Record<string, string> | undefined) ?? {};
  const next = { ...existing };
  if (value && value.trim()) {
    next[String(day)] = value;
  } else {
    delete next[String(day)];
  }
  dst[field] = next;
}

/** Body parts that have per-day "today" fields on the Complete Tracker. */
const BODY_PARTS = ["body_fat", "neck", "chest", "bicep", "waist", "hips", "thigh", "calf"] as const;
const BODY_PART_COLUMNS: Record<string, string> = {
  body_fat: "Fat %",
  neck: "Neck",
  chest: "Chest",
  bicep: "Bicep",
  waist: "Waist",
  hips: "Hips",
  thigh: "Thigh",
  calf: "Calf",
};

/** Compute 1..26 week index from a start date to today; null if out of range. */
function weekIndexFromStart(startIso: string | undefined, target: ParsedDate): number | null {
  if (!startIso) return null;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const t = new Date(target.year, target.monthIndex, target.day);
  const days = Math.floor((t.getTime() - start.getTime()) / 86_400_000);
  if (days < 0) return null;
  const wk = Math.floor(days / 7) + 1;
  if (wk < 1 || wk > 26) return null;
  return wk;
}

/** Merge a single cell into a measurement-grid value (Record<string,string>, key `${row}-${col}`). */
function mergeMeasurementCell(
  dst: Record<string, FieldValue>,
  field: string,
  row: number,
  col: string,
  value: string,
) {
  const existing = (dst[field] as Record<string, string> | undefined) ?? {};
  const next = { ...existing };
  if (value && value.trim()) next[`${row}-${col}`] = value;
  else delete next[`${row}-${col}`];
  dst[field] = next;
}

/** Pad date as YYYY-MM-DD. */
function isoOf(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Merge into a daily-month-grid value: `{ cells: { [day-monthIndex]: string }, achieved, notes }`. */
function mergeDailyMonthCell(
  dst: Record<string, FieldValue>,
  field: string,
  day: number,
  monthIndex: number,
  value: string,
) {
  const existing =
    (dst[field] as { cells?: Record<string, string>; achieved?: Record<string, boolean>; notes?: Record<string, string> } | undefined) ?? {};
  const cells = { ...(existing.cells ?? {}) };
  const cellKey = `${day}-${monthIndex}`;
  if (value && value.trim()) {
    cells[cellKey] = value;
  } else {
    delete cells[cellKey];
  }
  dst[field] = { ...existing, cells };
}

/** Combine the four meal values into a single readable cell ("B 110 / L 130 / D 120 / S 90"). */
function combineMeals(src: Record<string, FieldValue>, prefixes: [string, string, string, string]): string {
  const labels = ["B", "L", "D", "S"];
  const parts: string[] = [];
  prefixes.forEach((key, i) => {
    const v = src[key];
    if (typeof v === "string" && v.trim()) parts.push(`${labels[i]} ${v.trim()}`);
  });
  return parts.join(" / ");
}

/** True if the source has any meaningful value across the listed keys. */
function anyFilled(src: Record<string, FieldValue>, keys: string[]): boolean {
  return keys.some((k) => {
    const v = src[k];
    return typeof v === "string" ? v.trim().length > 0 : v != null && v !== false;
  });
}

/**
 * Sync the given Complete Tracker entry into all linked individual tracker entries.
 * Safe to call from auto-save — never throws; failures are logged.
 */
export async function syncLinkedEntries(complete: PlannerEntry): Promise<string[]> {
  if (complete.pageType !== "complete-tracker") return [];
  const synced: string[] = [];
  try {
    const date = parseDate(complete.values.date);
    if (!date) return [];
    const yearStr = String(date.year);
    const v = complete.values;

    // 1. Daily Tracker — same-keyed fields, looked up by `date`.
    const dailyKeys = [
      "date", "weekday", "daily_goal", "daily_habit",
      "breakfast", "breakfast_notes",
      "lunch", "lunch_notes",
      "dinner", "dinner_notes",
      "snacks", "snacks_notes",
      "daily_notes",
    ];
    if (anyFilled(v, dailyKeys)) {
      const daily = await findOrCreate(
        "daily-tracker",
        (e) => (e.values.date as string | undefined)?.slice(0, 10) === date.iso,
        { date: date.iso },
      );
      await persist(daily, (dst) => copyKeys(v, dst, dailyKeys));
      synced.push("Daily Tracker");
    }

    // 2-4. Yearly daily-month grids: blood sugar, blood pressure, oxygen.
    type Vital = { id: string; field: string; prefixes: [string, string, string, string]; label: string };
    const vitals: Vital[] = [
      { id: "blood-sugar-tracker", field: "blood_sugar", prefixes: ["breakfast_bs", "lunch_bs", "dinner_bs", "snacks_bs"], label: `Blood Sugar (${yearStr})` },
      { id: "blood-pressure-tracker", field: "blood_pressure", prefixes: ["breakfast_bp", "lunch_bp", "dinner_bp", "snacks_bp"], label: `Blood Pressure (${yearStr})` },
      { id: "oxygen-tracker", field: "oxygen", prefixes: ["breakfast_o2", "lunch_o2", "dinner_o2", "snacks_o2"], label: `Oxygen (${yearStr})` },
    ];
    for (const vital of vitals) {
      if (!anyFilled(v, vital.prefixes)) continue;
      const entry = await findOrCreate(
        vital.id,
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      const combined = combineMeals(v, vital.prefixes);
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        mergeDailyMonthCell(dst, vital.field, date.day, date.monthIndex, combined);
      });
      synced.push(vital.label);
    }

    // 5. Self-Care Check List (year, three daily-month-grids).
    const selfCare: { src: string; field: string }[] = [
      { src: "self_physical", field: "physical" },
      { src: "self_emotional", field: "emotional" },
      { src: "self_spiritual", field: "spiritual" },
    ];
    if (anyFilled(v, selfCare.map((s) => s.src))) {
      const entry = await findOrCreate(
        "self-care-checklist",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        for (const { src, field } of selfCare) {
          const text = (v[src] as string | undefined) ?? "";
          mergeDailyMonthCell(dst, field, date.day, date.monthIndex, text);
        }
      });
      synced.push(`Self-Care (${yearStr})`);
    }

    // 6. Monthly Calendar — keyed by month + year, mirrors month_calendar values.
    const cal = v.month_calendar as Record<string, string> | undefined;
    if (cal && Object.keys(cal).length > 0) {
      const monthName = new Date(date.year, date.monthIndex, 1)
        .toLocaleString("en-US", { month: "long" })
        .toLowerCase();
      const entry = await findOrCreate(
        "monthly-calendar",
        (e) => String(e.values.year ?? "") === yearStr && String(e.values.month ?? "").toLowerCase() === monthName,
        { year: yearStr, month: monthName },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        if (!dst.month) dst.month = monthName;
        // Replace whole calendar with the source (Complete Tracker is the source of truth here).
        dst.calendar = { ...cal };
      });
      const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      synced.push(`Monthly Calendar (${monthCap} ${yearStr})`);
    }

    // 7. Cleaning Check List — daily-month-grid `cleaning`, year-scoped.
    const cleaningToday = (v.cleaning_today as string | undefined) ?? "";
    if (cleaningToday.trim()) {
      const entry = await findOrCreate(
        "cleaning-checklist",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        mergeDailyMonthCell(dst, "cleaning", date.day, date.monthIndex, cleaningToday);
      });
      synced.push(`Cleaning (${yearStr})`);
    }

    // 8. Yearly Calendar — month_<name> textarea per year.
    const monthNote = (v.month_note_today as string | undefined) ?? "";
    if (monthNote.trim()) {
      const monthName = new Date(date.year, date.monthIndex, 1)
        .toLocaleString("en-US", { month: "long" })
        .toLowerCase();
      const entry = await findOrCreate(
        "yearly-calendar",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        dst[`month_${monthName}`] = monthNote;
      });
      synced.push(`Yearly Calendar (${yearStr})`);
    }

    // 9. Weekly Calendar — write today's note into the matching weekday textarea
    //    of the weekly entry whose `week_of` falls in the same Mon–Sun window.
    const weekNote = (v.week_note_today as string | undefined) ?? "";
    if (weekNote.trim()) {
      const weekStart = mondayOf(date.year, date.monthIndex, date.day);
      const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][
        new Date(date.year, date.monthIndex, date.day).getDay()
      ];
      const weekIso = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,"0")}-${String(weekStart.getDate()).padStart(2,"0")}`;
      const entry = await findOrCreate(
        "weekly-calendar",
        (e) => (e.values.week_of as string | undefined)?.slice(0,10) === weekIso,
        { week_of: weekIso },
      );
      await persist(entry, (dst) => {
        if (!dst.week_of) dst.week_of = weekIso;
        dst[weekday] = weekNote;
      });
      synced.push(`Weekly Calendar (${weekIso})`);
    }

    // 10. Habit Tracker (monthly grid) — fan out habit_1/2/3 success state.
    const habitItems: { label: string; success: boolean }[] = [];
    for (let n = 1; n <= 3; n++) {
      const label = (v[`habit_${n}_label`] as string | undefined) ?? "";
      const status = (v[`habit_${n}`] as string | undefined) ?? "";
      if (!label.trim() && !status) continue;
      habitItems.push({ label: label.trim() || `Habit ${n}`, success: status === "success" });
    }
    if (habitItems.length > 0) {
      const monthName = new Date(date.year, date.monthIndex, 1)
        .toLocaleString("en-US", { month: "long" })
        .toLowerCase();
      const entry = await findOrCreate(
        "habit-tracker",
        (e) => String(e.values.year ?? "") === yearStr && String(e.values.month ?? "").toLowerCase() === monthName,
        { year: yearStr, month: monthName },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        if (!dst.month) dst.month = monthName;
        const existing = (dst.habits as { habits?: string[]; marks?: Record<string, boolean> } | undefined) ?? {};
        const habits = [...(existing.habits ?? [])];
        const marks = { ...(existing.marks ?? {}) };
        habitItems.forEach((h, i) => {
          // Find or assign a row index for this habit label.
          let idx = habits.findIndex((x) => x.trim().toLowerCase() === h.label.toLowerCase());
          if (idx < 0) { idx = habits.length; habits.push(h.label); }
          else habits[idx] = h.label;
          const k = `${idx}-${date.day}`;
          if (h.success) marks[k] = true;
          else delete marks[k];
        });
        dst.habits = { habits, marks };
      });
      synced.push(`Habit Tracker (${monthName} ${yearStr})`);
    }

    // 11. Yearly Habit Tracker — habit_N_label, habit_N_mode + success per day.
    const yhRows: { idx: number; label: string; mode: "begin" | "break" | ""; success: boolean }[] = [];
    for (let n = 1; n <= 3; n++) {
      const label = (v[`habit_${n}_label`] as string | undefined) ?? "";
      const mode = (v[`habit_${n}_mode`] as string | undefined) ?? "";
      const status = (v[`habit_${n}`] as string | undefined) ?? "";
      if (!label.trim() && !mode && !status) continue;
      yhRows.push({
        idx: n - 1,
        label: label.trim() || `Habit ${n}`,
        mode: (mode === "begin" || mode === "break") ? mode : "",
        success: status === "success",
      });
    }
    if (yhRows.length > 0) {
      const entry = await findOrCreate(
        "yearly-habit-tracker",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        const existing = (dst.yearly_habits as { rows?: { mode: "begin"|"break"|""; label: string }[]; marks?: Record<string, boolean> } | undefined) ?? {};
        const rows = existing.rows && existing.rows.length === 12
          ? [...existing.rows]
          : Array.from({ length: 12 }, () => ({ mode: "" as const, label: "" }));
        const marks = { ...(existing.marks ?? {}) };
        // Use the current month's row for today's habits.
        const row = rows[date.monthIndex] ?? { mode: "" as const, label: "" };
        // If multiple habits share the row, last one wins for label/mode (kept simple).
        const last = yhRows[yhRows.length - 1];
        rows[date.monthIndex] = { mode: last.mode, label: last.label };
        const anySuccess = yhRows.some((r) => r.success);
        const k = `${date.monthIndex}-${date.day}`;
        if (anySuccess) marks[k] = true;
        else delete marks[k];
        dst.yearly_habits = { rows, marks };
        void row;
      });
      synced.push(`Yearly Habit Tracker (${yearStr})`);
    }

    // 12. Fun Tracker — month-tracker boolean: any fun_N success this month → mark.
    const funItems: { label: string; success: boolean }[] = [];
    for (let n = 1; n <= 3; n++) {
      const label = (v[`fun_${n}_label`] as string | undefined) ?? "";
      const status = (v[`fun_${n}`] as string | undefined) ?? "";
      if (!label.trim() && !status) continue;
      funItems.push({ label: label.trim() || `Fun ${n}`, success: status === "success" });
    }
    if (funItems.some((f) => f.success || f.label)) {
      const entry = await findOrCreate(
        "fun-tracker",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        const existing = (dst.fun_grid as { items?: string[]; marks?: Record<string, boolean> } | undefined) ?? {};
        const items = [...(existing.items ?? [])];
        const marks = { ...(existing.marks ?? {}) };
        funItems.forEach((f) => {
          let idx = items.findIndex((x) => x.trim().toLowerCase() === f.label.toLowerCase());
          if (idx < 0) { idx = items.length; items.push(f.label); }
          else items[idx] = f.label;
          if (f.success) marks[`${idx}-${date.monthIndex}`] = true;
        });
        dst.fun_grid = { items, marks };
      });
      synced.push(`Fun Tracker (${yearStr})`);
    }

    // 13. Weekly Calendar — also push weekly goals + reflection to that week's entry.
    const weeklyGoals = (v.weekly_goals as string | undefined) ?? "";
    const weeklyReflection = (v.weekly_reflection as string | undefined) ?? "";
    if (weeklyGoals.trim() || weeklyReflection.trim()) {
      const weekStart = mondayOf(date.year, date.monthIndex, date.day);
      const weekIso = isoOf(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
      const entry = await findOrCreate(
        "weekly-calendar",
        (e) => (e.values.week_of as string | undefined)?.slice(0, 10) === weekIso,
        { week_of: weekIso },
      );
      await persist(entry, (dst) => {
        if (!dst.week_of) dst.week_of = weekIso;
        if (weeklyGoals.trim()) dst.weekly_goals = weeklyGoals;
        if (weeklyReflection.trim()) dst.reflection = weeklyReflection;
      });
      synced.push(`Weekly Calendar — goals/reflection`);
    }

    // 14. Yearly Calendar — yearly_focus prefixes the matching month note ("Focus: …").
    //     Also mirror to standalone Yearly Focus page.
    const yearlyFocus = (v.yearly_focus as string | undefined) ?? "";
    if (yearlyFocus.trim()) {
      const monthName = new Date(date.year, date.monthIndex, 1)
        .toLocaleString("en-US", { month: "long" })
        .toLowerCase();
      const entry = await findOrCreate(
        "yearly-calendar",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        const focusLine = `Focus: ${yearlyFocus.trim()}`;
        const cur = (dst[`month_${monthName}`] as string | undefined) ?? "";
        // Replace any existing leading "Focus:" line; otherwise prepend.
        const stripped = cur.replace(/^Focus:[^\n]*\n?/i, "").trimStart();
        dst[`month_${monthName}`] = stripped ? `${focusLine}\n${stripped}` : focusLine;
      });
      synced.push(`Yearly Calendar focus`);

      // Standalone Yearly Focus page (one per year).
      const focusEntry = await findOrCreate(
        "yearly-focus",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(focusEntry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        dst.yearly_focus = yearlyFocus.trim();
      });
      synced.push(`Yearly Focus (${yearStr})`);
    }

    // 15. Wellness Tracker — six daily-month-grids of numeric ratings.
    const wellnessFields = ["water", "caffeine", "sweets", "sleep", "smoking", "mood"];
    if (wellnessFields.some((k) => v[k] != null && v[k] !== "")) {
      const entry = await findOrCreate(
        "wellness-tracker",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        for (const k of wellnessFields) {
          const raw = v[k];
          const txt = raw == null || raw === "" ? "" : String(raw);
          mergeDailyMonthCell(dst, k, date.day, date.monthIndex, txt);
        }
      });
      synced.push(`Wellness Tracker (${yearStr})`);
    }

    // 16. Workout Tracker — daily-month-grid per category.
    const workoutFields = ["cardio", "weights", "yoga", "stretch", "rest_day", "other"];
    if (workoutFields.some((k) => v[k] != null && v[k] !== "" && v[k] !== false)) {
      const entry = await findOrCreate(
        "workout-tracker",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        for (const k of workoutFields) {
          const raw = v[k];
          let txt = "";
          if (typeof raw === "boolean") txt = raw ? "✓" : "";
          else if (raw != null) txt = String(raw);
          mergeDailyMonthCell(dst, k, date.day, date.monthIndex, txt);
        }
      });
      synced.push(`Workout Tracker (${yearStr})`);
    }

    // 17. Daily Goal Tracker — yearly grid of daily goals + habit success.
    const dGoal = (v.daily_goal as string | undefined) ?? "";
    const dHabit = (v.daily_habit as string | undefined) ?? "";
    if (dGoal.trim() || dHabit) {
      const entry = await findOrCreate(
        "daily-goal-tracker",
        (e) => String(e.values.year ?? "") === yearStr,
        { year: yearStr },
      );
      await persist(entry, (dst) => {
        if (!dst.year) dst.year = yearStr;
        mergeDailyMonthCell(dst, "daily_goal", date.day, date.monthIndex, dGoal);
        const mark = dHabit === "success" ? "✓" : dHabit === "failed" ? "✗" : "";
        mergeDailyMonthCell(dst, "daily_habit", date.day, date.monthIndex, mark);
      });
      synced.push(`Daily Goal Tracker (${yearStr})`);
    }

    // 18. Medical Records — per-date entry mirroring the three textareas.
    const medicalFields = ["medical_appointment_notes", "test_results", "lab_result_notes", "doctor_id"];
    if (medicalFields.some((k) => typeof v[k] === "string" && (v[k] as string).trim())) {
      const entry = await findOrCreate(
        "medical-records",
        (e) => (e.values.date as string | undefined)?.slice(0, 10) === date.iso,
        { date: date.iso },
      );
      await persist(entry, (dst) => {
        if (!dst.date) dst.date = date.iso;
        copyKeys(v, dst, medicalFields);
      });
      synced.push(`Medical Records (${date.iso})`);
    }

    // 19. Weight Tracker — write today's weight into the active 26-week log.
    const weightToday = (v.weight_today as string | undefined) ?? "";
    if (weightToday.trim()) {
      const all = await listEntries("weight-tracker");
      // Pick the most recent entry whose start_date is on/before today.
      const candidates = all
        .map((e) => ({ e, start: (e.values.start_date as string | undefined) ?? "" }))
        .filter((x) => x.start && new Date(x.start).getTime() <= new Date(date.iso).getTime())
        .sort((a, b) => b.start.localeCompare(a.start));
      const wt = candidates[0]?.e ?? await createEntry("weight-tracker", { start_date: date.iso });
      const startIso = (wt.values.start_date as string | undefined) ?? date.iso;
      const wk = weekIndexFromStart(startIso, date);
      if (wk != null) {
        await persist(wt, (dst) => {
          if (!dst.start_date) dst.start_date = startIso;
          mergeMeasurementCell(dst, "weight_log", wk, "Date", date.iso);
          mergeMeasurementCell(dst, "weight_log", wk, "Weight", weightToday);
          const notes = (v.weight_today_notes as string | undefined) ?? "";
          mergeMeasurementCell(dst, "weight_log", wk, "Notes", notes);
          // Compute Difference vs previous week if numeric.
          const prev = (dst.weight_log as Record<string, string> | undefined)?.[`${wk - 1}-Weight`];
          const a = parseFloat(weightToday);
          const b = parseFloat(prev ?? "");
          if (!Number.isNaN(a) && !Number.isNaN(b)) {
            const diff = (a - b).toFixed(1);
            mergeMeasurementCell(dst, "weight_log", wk, "Difference", diff);
          }
        });
        synced.push(`Weight Tracker (wk ${wk})`);
      }
    }

    // 20. Measurement Tracker — per-body-part `m_<part>_today` → 26-week grid.
    const partTodays = BODY_PARTS.filter((p) => {
      const x = v[`m_${p}_today`];
      return typeof x === "string" && x.trim();
    });
    if (partTodays.length > 0) {
      const all = await listEntries("measurement-tracker");
      const candidates = all
        .map((e) => ({ e, start: (e.values.start_date as string | undefined) ?? "" }))
        .filter((x) => x.start && new Date(x.start).getTime() <= new Date(date.iso).getTime())
        .sort((a, b) => b.start.localeCompare(a.start));
      const mt = candidates[0]?.e ?? await createEntry("measurement-tracker", { start_date: date.iso });
      const startIso = (mt.values.start_date as string | undefined) ?? date.iso;
      const wk = weekIndexFromStart(startIso, date);
      if (wk != null) {
        await persist(mt, (dst) => {
          if (!dst.start_date) dst.start_date = startIso;
          for (const p of partTodays) {
            const col = BODY_PART_COLUMNS[p];
            const val = String(v[`m_${p}_today`] ?? "");
            mergeMeasurementCell(dst, "measurements", wk, col, val);
          }
        });
        synced.push(`Measurement Tracker (wk ${wk})`);
      }
    }

    // 21. Medications — mirror the med_list grid into the master Medications entry.
    const completeMedList = v.med_list as Record<string, string> | undefined;
    if (completeMedList && Object.values(completeMedList).some((x) => typeof x === "string" && x.trim())) {
      const all = await listEntries("medications");
      const meds = all[0] ?? await createEntry("medications", {});
      await persist(meds, (dst) => {
        dst.med_list = { ...completeMedList };
      });
      synced.push("Medications");
    }

  } catch (err) {
    console.error("[syncLinkedEntries] failed:", err);
  }
  return synced;
}

// ---------------------------------------------------------------------------
// Reverse sync: when an individual tracker entry is saved, mirror its values
// back into matching Complete Tracker entries.
//
// Daily Tracker (per-day) → creates/updates the Complete Tracker for that
// exact date. Per-year / per-month grids only update Complete Tracker
// entries that already exist for affected dates (never create new ones).
// ---------------------------------------------------------------------------

const DAILY_KEYS = [
  "date", "weekday", "daily_goal", "daily_habit",
  "breakfast", "breakfast_notes",
  "lunch", "lunch_notes",
  "dinner", "dinner_notes",
  "snacks", "snacks_notes",
  "daily_notes",
];

/** Split "B 110 / L 130 / D 120 / S 90" back into the four meal-prefix keys. */
function splitMealCell(value: string, prefixes: [string, string, string, string], dst: Record<string, FieldValue>) {
  const labelToIdx: Record<string, number> = { B: 0, L: 1, D: 2, S: 3 };
  prefixes.forEach((k) => delete dst[k]);
  if (!value) return;
  for (const part of value.split("/")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = /^([BLDS])\s+(.*)$/.exec(trimmed);
    if (!m) continue;
    const idx = labelToIdx[m[1]];
    if (idx == null) continue;
    dst[prefixes[idx]] = m[2].trim();
  }
}

async function listCompleteByDate(iso: string): Promise<PlannerEntry[]> {
  const all = await listEntries("complete-tracker");
  return all.filter((e) => (e.values.date as string | undefined)?.slice(0, 10) === iso);
}

async function updateCompleteForDate(iso: string, mutate: (vals: Record<string, FieldValue>) => void) {
  const matches = await listCompleteByDate(iso);
  for (const c of matches) await persist(c, mutate);
  return matches.length;
}

export async function syncFromIndividual(entry: PlannerEntry): Promise<string[]> {
  const synced: string[] = [];
  try {
    const v = entry.values;

    // Daily Tracker → Complete Tracker (create if missing for that date).
    if (entry.pageType === "daily-tracker") {
      const date = parseDate(v.date);
      if (!date) return [];
      const complete = await findOrCreate(
        "complete-tracker",
        (e) => (e.values.date as string | undefined)?.slice(0, 10) === date.iso,
        { date: date.iso },
      );
      await persist(complete, (dst) => copyKeys(v, dst, DAILY_KEYS));
      synced.push("Complete Tracker");
      return synced;
    }

    // Yearly daily-month grids — vitals.
    type Vital = { id: string; field: string; prefixes: [string, string, string, string]; label: string };
    const vitals: Vital[] = [
      { id: "blood-sugar-tracker", field: "blood_sugar", prefixes: ["breakfast_bs", "lunch_bs", "dinner_bs", "snacks_bs"], label: "Complete Tracker (blood sugar)" },
      { id: "blood-pressure-tracker", field: "blood_pressure", prefixes: ["breakfast_bp", "lunch_bp", "dinner_bp", "snacks_bp"], label: "Complete Tracker (blood pressure)" },
      { id: "oxygen-tracker", field: "oxygen", prefixes: ["breakfast_o2", "lunch_o2", "dinner_o2", "snacks_o2"], label: "Complete Tracker (oxygen)" },
    ];
    const vital = vitals.find((x) => x.id === entry.pageType);
    if (vital) {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const grid = (v[vital.field] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
      let touched = 0;
      for (const [cellKey, cellVal] of Object.entries(grid)) {
        const m = /^(\d+)-(\d+)$/.exec(cellKey);
        if (!m) continue;
        const day = Number(m[1]);
        const monthIndex = Number(m[2]);
        const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        touched += await updateCompleteForDate(iso, (dst) => splitMealCell(cellVal, vital.prefixes, dst));
      }
      if (touched > 0) synced.push(vital.label);
      return synced;
    }

    // Self-Care Checklist.
    if (entry.pageType === "self-care-checklist") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const fields: { src: string; field: string }[] = [
        { src: "self_physical", field: "physical" },
        { src: "self_emotional", field: "emotional" },
        { src: "self_spiritual", field: "spiritual" },
      ];
      const cellSet = new Set<string>();
      for (const f of fields) {
        const grid = (v[f.field] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
        for (const k of Object.keys(grid)) cellSet.add(k);
      }
      let touched = 0;
      for (const cellKey of cellSet) {
        const m = /^(\d+)-(\d+)$/.exec(cellKey);
        if (!m) continue;
        const day = Number(m[1]);
        const monthIndex = Number(m[2]);
        const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        touched += await updateCompleteForDate(iso, (dst) => {
          for (const f of fields) {
            const grid = (v[f.field] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
            const cellVal = grid[cellKey];
            if (cellVal && cellVal.trim()) dst[f.src] = cellVal;
            else delete dst[f.src];
          }
        });
      }
      if (touched > 0) synced.push("Complete Tracker (self-care)");
      return synced;
    }

    // Monthly Calendar → mirror calendar into Complete entries in that month.
    if (entry.pageType === "monthly-calendar") {
      const year = Number(v.year ?? "");
      const monthName = String(v.month ?? "").toLowerCase();
      if (!year || !monthName) return [];
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
      if (Number.isNaN(monthIndex)) return [];
      const cal = (v.calendar as Record<string, string> | undefined) ?? {};
      const completes = (await listEntries("complete-tracker")).filter((e) => {
        const d = parseDate(e.values.date);
        return d && d.year === year && d.monthIndex === monthIndex;
      });
      for (const c of completes) {
        await persist(c, (dst) => { dst.month_calendar = { ...cal }; });
      }
      if (completes.length > 0) synced.push("Complete Tracker (calendar)");
      return synced;
    }

    // Cleaning Check List → mirror per-day cell into matching Complete entries.
    if (entry.pageType === "cleaning-checklist") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const grid = (v.cleaning as { cells?: Record<string, string> } | undefined)?.cells ?? {};
      let touched = 0;
      for (const [cellKey, cellVal] of Object.entries(grid)) {
        const m = /^(\d+)-(\d+)$/.exec(cellKey);
        if (!m) continue;
        const day = Number(m[1]);
        const monthIndex = Number(m[2]);
        const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        touched += await updateCompleteForDate(iso, (dst) => {
          if (cellVal && cellVal.trim()) dst.cleaning_today = cellVal;
          else delete dst.cleaning_today;
        });
      }
      if (touched > 0) synced.push("Complete Tracker (cleaning)");
      return synced;
    }

    // Yearly Calendar → push month note into Complete entries on dates in that month/year.
    if (entry.pageType === "yearly-calendar") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const completes = (await listEntries("complete-tracker")).filter((e) => {
        const d = parseDate(e.values.date);
        return d && d.year === year;
      });
      let touched = 0;
      for (const c of completes) {
        const d = parseDate(c.values.date);
        if (!d) continue;
        const monthName = new Date(year, d.monthIndex, 1)
          .toLocaleString("en-US", { month: "long" })
          .toLowerCase();
        const note = (v[`month_${monthName}`] as string | undefined) ?? "";
        await persist(c, (dst) => {
          if (note.trim()) dst.month_note_today = note;
          else delete dst.month_note_today;
        });
        touched++;
      }
      if (touched > 0) synced.push("Complete Tracker (month notes)");
      return synced;
    }

    // Weekly Calendar → push weekday note + weekly goals/reflection into Complete entries in that week.
    if (entry.pageType === "weekly-calendar") {
      const weekOf = parseDate(v.week_of);
      if (!weekOf) return [];
      const start = mondayOf(weekOf.year, weekOf.monthIndex, weekOf.day);
      const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
      const wGoals = (v.weekly_goals as string | undefined) ?? "";
      const wReflect = (v.reflection as string | undefined) ?? "";
      let touched = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const note = (v[days[i]] as string | undefined) ?? "";
        touched += await updateCompleteForDate(iso, (dst) => {
          if (note.trim()) dst.week_note_today = note;
          else delete dst.week_note_today;
          if (wGoals.trim()) dst.weekly_goals = wGoals;
          else delete dst.weekly_goals;
          if (wReflect.trim()) dst.weekly_reflection = wReflect;
          else delete dst.weekly_reflection;
        });
      }
      if (touched > 0) synced.push("Complete Tracker (week)");
      return synced;
    }

    // Habit Tracker (monthly grid) → set habit_1..3 + label + success on each marked day.
    if (entry.pageType === "habit-tracker") {
      const year = Number(v.year ?? "");
      const monthName = String(v.month ?? "").toLowerCase();
      if (!year || !monthName) return [];
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
      if (Number.isNaN(monthIndex)) return [];
      const grid = (v.habits as { habits?: string[]; marks?: Record<string, boolean> } | undefined) ?? {};
      const habits = grid.habits ?? [];
      const marks = grid.marks ?? {};
      const byDay = new Map<number, number[]>();
      for (const [k, on] of Object.entries(marks)) {
        if (!on) continue;
        const m = /^(\d+)-(\d+)$/.exec(k);
        if (!m) continue;
        const hi = Number(m[1]);
        const day = Number(m[2]);
        if (!byDay.has(day)) byDay.set(day, []);
        byDay.get(day)!.push(hi);
      }
      let touched = 0;
      for (const [day, his] of byDay) {
        const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        touched += await updateCompleteForDate(iso, (dst) => {
          his.slice(0, 3).forEach((hi, slot) => {
            const n = slot + 1;
            const label = habits[hi] ?? "";
            if (label.trim()) dst[`habit_${n}_label`] = label;
            dst[`habit_${n}`] = "success";
          });
        });
      }
      if (touched > 0) synced.push("Complete Tracker (habits)");
      return synced;
    }

    // Yearly Habit Tracker → for each marked day, set habit_1's mode/label + success.
    if (entry.pageType === "yearly-habit-tracker") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const data = (v.yearly_habits as { rows?: { mode: "begin"|"break"|""; label: string }[]; marks?: Record<string, boolean> } | undefined) ?? {};
      const rows = data.rows ?? [];
      const marks = data.marks ?? {};
      let touched = 0;
      for (const [k, on] of Object.entries(marks)) {
        if (!on) continue;
        const m = /^(\d+)-(\d+)$/.exec(k);
        if (!m) continue;
        const monthIndex = Number(m[1]);
        const day = Number(m[2]);
        const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const row = rows[monthIndex] ?? { mode: "" as const, label: "" };
        touched += await updateCompleteForDate(iso, (dst) => {
          if (row.label.trim()) dst.habit_1_label = row.label;
          if (row.mode) dst.habit_1_mode = row.mode;
          dst.habit_1 = "success";
        });
      }
      if (touched > 0) synced.push("Complete Tracker (yearly habits)");
      return synced;
    }

    // Wellness Tracker → numeric ratings on Complete Tracker for each marked day.
    if (entry.pageType === "wellness-tracker") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const fields = ["water", "caffeine", "sweets", "sleep", "smoking", "mood"];
      const cellSet = new Set<string>();
      for (const f of fields) {
        const grid = (v[f] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
        for (const k of Object.keys(grid)) cellSet.add(k);
      }
      let touched = 0;
      for (const cellKey of cellSet) {
        const m = /^(\d+)-(\d+)$/.exec(cellKey);
        if (!m) continue;
        const day = Number(m[1]);
        const monthIndex = Number(m[2]);
        const iso = isoOf(year, monthIndex, day);
        touched += await updateCompleteForDate(iso, (dst) => {
          for (const f of fields) {
            const grid = (v[f] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
            const cellVal = grid[cellKey];
            if (cellVal && String(cellVal).trim()) {
              const n = Number(cellVal);
              dst[f] = Number.isNaN(n) ? cellVal : n;
            } else {
              delete dst[f];
            }
          }
        });
      }
      if (touched > 0) synced.push("Complete Tracker (wellness)");
      return synced;
    }

    // Workout Tracker → category text on Complete Tracker for each marked day.
    if (entry.pageType === "workout-tracker") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const fields = ["cardio", "weights", "yoga", "stretch", "rest_day", "other"];
      const cellSet = new Set<string>();
      for (const f of fields) {
        const grid = (v[f] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
        for (const k of Object.keys(grid)) cellSet.add(k);
      }
      let touched = 0;
      for (const cellKey of cellSet) {
        const m = /^(\d+)-(\d+)$/.exec(cellKey);
        if (!m) continue;
        const day = Number(m[1]);
        const monthIndex = Number(m[2]);
        const iso = isoOf(year, monthIndex, day);
        touched += await updateCompleteForDate(iso, (dst) => {
          for (const f of fields) {
            const grid = (v[f] as { cells?: Record<string, string> } | undefined)?.cells ?? {};
            const cellVal = grid[cellKey];
            if (cellVal && String(cellVal).trim()) {
              if (f === "rest_day") dst[f] = cellVal === "✓" || cellVal === "true" || cellVal === "1";
              else dst[f] = cellVal;
            } else {
              delete dst[f];
            }
          }
        });
      }
      if (touched > 0) synced.push("Complete Tracker (workout)");
      return synced;
    }

    // Daily Goal Tracker → daily_goal text + daily_habit success/fail.
    if (entry.pageType === "daily-goal-tracker") {
      const year = Number(v.year ?? "");
      if (!year) return [];
      const goalGrid = (v.daily_goal as { cells?: Record<string, string> } | undefined)?.cells ?? {};
      const habitGrid = (v.daily_habit as { cells?: Record<string, string> } | undefined)?.cells ?? {};
      const cellSet = new Set<string>([...Object.keys(goalGrid), ...Object.keys(habitGrid)]);
      let touched = 0;
      for (const cellKey of cellSet) {
        const m = /^(\d+)-(\d+)$/.exec(cellKey);
        if (!m) continue;
        const day = Number(m[1]);
        const monthIndex = Number(m[2]);
        const iso = isoOf(year, monthIndex, day);
        touched += await updateCompleteForDate(iso, (dst) => {
          const g = goalGrid[cellKey];
          if (g && g.trim()) dst.daily_goal = g; else delete dst.daily_goal;
          const h = habitGrid[cellKey];
          if (h === "✓") dst.daily_habit = "success";
          else if (h === "✗") dst.daily_habit = "failed";
          else delete dst.daily_habit;
        });
      }
      if (touched > 0) synced.push("Complete Tracker (daily goal)");
      return synced;
    }

    // Medical Records → mirror three textareas into Complete Tracker for that date.
    if (entry.pageType === "medical-records") {
      const date = parseDate(v.date);
      if (!date) return [];
      const touched = await updateCompleteForDate(date.iso, (dst) => {
        copyKeys(v, dst, ["medical_appointment_notes", "test_results", "lab_result_notes", "doctor_id"]);
      });
      if (touched > 0) synced.push("Complete Tracker (medical)");
      return synced;
    }

    // Weight Tracker → for each filled row, push Date+Weight+Notes back to that day's Complete Tracker.
    if (entry.pageType === "weight-tracker") {
      const grid = (v.weight_log as Record<string, string> | undefined) ?? {};
      // Group by row.
      const byRow = new Map<number, Record<string, string>>();
      for (const [k, val] of Object.entries(grid)) {
        const m = /^(\d+)-(.+)$/.exec(k);
        if (!m) continue;
        const row = Number(m[1]);
        if (!byRow.has(row)) byRow.set(row, {});
        byRow.get(row)![m[2]] = val;
      }
      let touched = 0;
      for (const [, row] of byRow) {
        const iso = (row.Date ?? "").slice(0, 10);
        const weight = row.Weight ?? "";
        if (!iso || !weight.trim()) continue;
        touched += await updateCompleteForDate(iso, (dst) => {
          dst.weight_today = weight;
          if (row.Notes && row.Notes.trim()) dst.weight_today_notes = row.Notes;
          else delete dst.weight_today_notes;
        });
      }
      if (touched > 0) synced.push("Complete Tracker (weight)");
      return synced;
    }

    // Measurement Tracker → push per-part values back to that day's Complete Tracker
    // (only when the matching weight-tracker has a Date for that row, since this grid has no Date col).
    if (entry.pageType === "measurement-tracker") {
      const startIso = (v.start_date as string | undefined) ?? "";
      if (!startIso) return [];
      const start = new Date(startIso);
      if (Number.isNaN(start.getTime())) return [];
      const grid = (v.measurements as Record<string, string> | undefined) ?? {};
      const byRow = new Map<number, Record<string, string>>();
      for (const [k, val] of Object.entries(grid)) {
        const m = /^(\d+)-(.+)$/.exec(k);
        if (!m) continue;
        const row = Number(m[1]);
        if (!byRow.has(row)) byRow.set(row, {});
        byRow.get(row)![m[2]] = val;
      }
      const colToPart: Record<string, string> = Object.fromEntries(
        Object.entries(BODY_PART_COLUMNS).map(([p, c]) => [c, p]),
      );
      let touched = 0;
      for (const [row, cols] of byRow) {
        const d = new Date(start);
        d.setDate(d.getDate() + (row - 1) * 7);
        const iso = isoOf(d.getFullYear(), d.getMonth(), d.getDate());
        touched += await updateCompleteForDate(iso, (dst) => {
          for (const [col, val] of Object.entries(cols)) {
            const part = colToPart[col];
            if (!part) continue;
            if (val && val.trim()) dst[`m_${part}_today`] = val;
            else delete dst[`m_${part}_today`];
          }
        });
      }
      if (touched > 0) synced.push("Complete Tracker (measurements)");
      return synced;
    }

    // Medications → only seed Complete Tracker entries whose med_list is empty
    // (don't clobber per-day med tracking the user already filled in).
    if (entry.pageType === "medications") {
      const list = (v.med_list as Record<string, string> | undefined) ?? {};
      if (Object.values(list).some((x) => typeof x === "string" && x.trim())) {
        const completes = await listEntries("complete-tracker");
        let touched = 0;
        for (const c of completes) {
          const cur = c.values.med_list as Record<string, string> | undefined;
          const hasAny = cur && Object.values(cur).some((x) => typeof x === "string" && x.trim());
          if (hasAny) continue;
          await persist(c, (dst) => { dst.med_list = { ...list }; });
          touched++;
        }
        if (touched > 0) synced.push("Complete Tracker (medications)");
      }
      return synced;
    }

    // Fun Tracker → for each marked (item, month) cell, write into the earliest
    // existing Complete Tracker entry of that month (never creates new entries).
    if (entry.pageType === "fun-tracker") {
      const year = Number(v.year ?? "");
      if (!year) return synced;
      const grid = (v.fun_grid as { items?: string[]; marks?: Record<string, boolean> } | undefined) ?? {};
      const items = grid.items ?? [];
      const marks = grid.marks ?? {};
      // Group marked items by month.
      const byMonth = new Map<number, string[]>();
      for (const [k, on] of Object.entries(marks)) {
        if (!on) continue;
        const m = /^(\d+)-(\d+)$/.exec(k);
        if (!m) continue;
        const itemIdx = Number(m[1]);
        const monthIndex = Number(m[2]);
        const label = (items[itemIdx] ?? "").trim();
        if (!label) continue;
        if (!byMonth.has(monthIndex)) byMonth.set(monthIndex, []);
        byMonth.get(monthIndex)!.push(label);
      }
      const completes = await listEntries("complete-tracker");
      let touched = 0;
      for (const [monthIndex, labels] of byMonth) {
        // Earliest Complete Tracker entry in that month.
        const inMonth = completes
          .map((e) => ({ e, d: parseDate(e.values.date) }))
          .filter((x) => x.d && x.d.year === year && x.d.monthIndex === monthIndex)
          .sort((a, b) => (a.d!.iso < b.d!.iso ? -1 : 1));
        const target = inMonth[0]?.e;
        if (!target) continue;
        await persist(target, (dst) => {
          // Reuse existing slots when label matches, else fill next free.
          for (const label of labels) {
            let placed = false;
            for (let n = 1; n <= 3; n++) {
              const cur = (dst[`fun_${n}_label`] as string | undefined) ?? "";
              if (cur.trim().toLowerCase() === label.toLowerCase()) {
                dst[`fun_${n}`] = "success";
                placed = true;
                break;
              }
            }
            if (placed) continue;
            for (let n = 1; n <= 3; n++) {
              const cur = (dst[`fun_${n}_label`] as string | undefined) ?? "";
              if (!cur.trim()) {
                dst[`fun_${n}_label`] = label;
                dst[`fun_${n}`] = "success";
                placed = true;
                break;
              }
            }
          }
        });
        touched++;
      }
      if (touched > 0) synced.push("Complete Tracker (fun)");
      return synced;
    }

    // Yearly Focus → mirror yearly_focus into all Complete Tracker entries of that year.
    if (entry.pageType === "yearly-focus") {
      const year = Number(v.year ?? "");
      if (!year) return synced;
      const focus = ((v.yearly_focus as string | undefined) ?? "").trim();
      const completes = (await listEntries("complete-tracker")).filter((e) => {
        const d = parseDate(e.values.date);
        return d && d.year === year;
      });
      for (const c of completes) {
        await persist(c, (dst) => {
          if (focus) dst.yearly_focus = focus;
          else delete dst.yearly_focus;
        });
      }
      // Also mirror into Yearly Calendar month notes for visibility.
      if (focus) {
        const yc = await findOrCreate(
          "yearly-calendar",
          (e) => String(e.values.year ?? "") === String(year),
          { year: String(year) },
        );
        await persist(yc, (dst) => {
          if (!dst.year) dst.year = String(year);
          // Refresh "Focus:" prefix on every month note.
          const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
          for (const mn of months) {
            const cur = (dst[`month_${mn}`] as string | undefined) ?? "";
            const stripped = cur.replace(/^Focus:[^\n]*\n?/i, "").trimStart();
            const focusLine = `Focus: ${focus}`;
            dst[`month_${mn}`] = stripped ? `${focusLine}\n${stripped}` : focusLine;
          }
        });
      }
      if (completes.length > 0 || focus) synced.push("Complete Tracker (focus)");
      return synced;
    }

  } catch (err) {
    console.error("[syncFromIndividual] failed:", err);
  }
  return synced;
}
