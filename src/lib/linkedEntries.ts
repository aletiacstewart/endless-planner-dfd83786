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

    // Weekly Calendar → push weekday note into Complete entries in that week.
    if (entry.pageType === "weekly-calendar") {
      const weekOf = parseDate(v.week_of);
      if (!weekOf) return [];
      const start = mondayOf(weekOf.year, weekOf.monthIndex, weekOf.day);
      const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
      let touched = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        const iso = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
        const note = (v[days[i]] as string | undefined) ?? "";
        touched += await updateCompleteForDate(iso, (dst) => {
          if (note.trim()) dst.week_note_today = note;
          else delete dst.week_note_today;
        });
      }
      if (touched > 0) synced.push("Complete Tracker (week notes)");
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

    // Fun Tracker uses month-level marks (no specific day) — skip reverse sync.
  } catch (err) {
    console.error("[syncFromIndividual] failed:", err);
  }
  return synced;
}
