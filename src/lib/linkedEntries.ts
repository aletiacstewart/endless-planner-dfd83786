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
  } catch (err) {
    console.error("[syncLinkedEntries] failed:", err);
  }
  return synced;
}
