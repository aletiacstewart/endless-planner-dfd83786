import type { PlannerEntry } from "./db";

const ACTIVE_KEY = "planner-active-year";
const SIM_KEY = "planner-sim-year"; // testing only: pretend the calendar year is this

/** The real calendar year (can be overridden for testing via localStorage). */
export function calendarYear(): number {
  const sim = Number(localStorage.getItem(SIM_KEY) || 0);
  return sim >= 2000 && sim <= 9999 ? sim : new Date().getFullYear();
}

/** The planner year the user is currently viewing / writing in. */
export function getActiveYear(): number {
  const n = Number(localStorage.getItem(ACTIVE_KEY) || 0);
  return n >= 2000 && n <= 9999 ? n : calendarYear();
}

export function setActiveYearLocal(year: number) {
  localStorage.setItem(ACTIVE_KEY, String(year));
  window.dispatchEvent(new CustomEvent("planner-year-changed", { detail: year }));
}

export async function setActiveYear(year: number) {
  setActiveYearLocal(year);
  const { saveSettings } = await import("./settings");
  await saveSettings({ plannerYear: year });
}

/** Which planner year an entry belongs to. */
export function entryYear(e: PlannerEntry): number {
  const v = e.values ?? {};
  const tag = Number(v.__year);
  if (tag >= 2000 && tag <= 9999) return tag;
  const date = typeof v.date === "string" ? v.date : "";
  const m = /^(\d{4})-\d{2}-\d{2}/.exec(date);
  if (m) return Number(m[1]);
  const y = parseInt(String(v.year ?? ""), 10);
  if (y >= 2000 && y <= 9999) return y;
  return new Date(e.createdAt || Date.now()).getFullYear();
}
