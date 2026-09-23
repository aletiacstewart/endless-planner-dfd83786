/**
 * Turns planner calendar pages into calendar events, an .ics file for Apple/Google
 * Calendar, and one-tap "add this to my calendar" links.
 */

import type { PlannerEntry } from "./db";

export interface PlannerEvent {
  uid: string;
  /** YYYYMMDD */
  date: string;
  title: string;
  description?: string;
}

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function monthIndex(month: string | undefined): number | null {
  const m = (month ?? "").trim().toLowerCase();
  if (!m) return null;
  const byName = MONTHS.findIndex((n) => n.startsWith(m.slice(0, 3)));
  if (byName >= 0) return byName;
  const n = parseInt(m, 10);
  return n >= 1 && n <= 12 ? n - 1 : null;
}

const pad = (n: number) => String(n).padStart(2, "0");

function ymd(year: number, monthIdx: number, day: number): string {
  return `${year}${pad(monthIdx + 1)}${pad(day)}`;
}

function eventsFromCalendarMap(
  entry: PlannerEntry,
  key: string,
  typePrefix: string,
): PlannerEvent[] {
  const v = entry.values as Record<string, unknown>;
  const map = v[key] as Record<string, string> | undefined;
  if (!map) return [];
  const mi = monthIndex(v.month as string);
  const year = parseInt(String(v.year ?? ""), 10);
  if (mi === null || !Number.isFinite(year) || year < 1000) return [];

  const out: PlannerEvent[] = [];
  for (const [k, note] of Object.entries(map)) {
    if (!/^\d+$/.test(k)) continue;
    const text = (note ?? "").trim();
    if (!text) continue;
    const day = Number(k);
    if (day < 1 || day > 31) continue;
    const type = (map[`t${k}`] ?? "").trim();
    out.push({
      uid: `${entry.id}-${key}-${k}`,
      date: ymd(year, mi, day),
      title: text.split("\n")[0].slice(0, 120),
      description: [type && `${typePrefix}${type}`, text].filter(Boolean).join("\n"),
    });
  }
  return out;
}

function eventsFromImportantDates(entry: PlannerEntry): PlannerEvent[] {
  const v = entry.values as Record<string, unknown>;
  const grid = v.date_details as Record<string, string> | undefined;
  if (!grid) return [];
  const fallbackYear = parseInt(String(v.year ?? ""), 10);
  const rows = Math.max(8, Number(grid.__rows ?? "") || 0);
  const out: PlannerEvent[] = [];
  for (let r = 1; r <= rows; r += 1) {
    const who = (grid[`${r}-Name/Activity`] ?? "").trim();
    const occasion = (grid[`${r}-Occasion`] ?? "").trim();
    const raw = (grid[`${r}-Date`] ?? "").trim();
    if (!raw || (!who && !occasion)) continue;
    let date = "";
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const md = raw.match(/^(\d{1,2})[/-](\d{1,2})$/);
    if (iso) date = `${iso[1]}${iso[2]}${iso[3]}`;
    else if (md && Number.isFinite(fallbackYear)) date = ymd(fallbackYear, Number(md[1]) - 1, Number(md[2]));
    if (!date) continue;
    out.push({
      uid: `${entry.id}-dates-${r}`,
      date,
      title: [who, occasion].filter(Boolean).join(" — ").slice(0, 120),
      description: (grid[`${r}-Notes`] ?? "").trim() || undefined,
    });
  }
  return out;
}

/** Collect every dated item the planner knows about. */
export function collectPlannerEvents(entries: PlannerEntry[]): PlannerEvent[] {
  const out: PlannerEvent[] = [];
  for (const entry of entries) {
    if (entry.pageType === "monthly-calendar") out.push(...eventsFromCalendarMap(entry, "calendar", ""));
    else if (entry.pageType === "medical-records") {
      out.push(...eventsFromCalendarMap(entry, "medical_calendar", "Medical: "));
    } else if (entry.pageType === "important-dates") out.push(...eventsFromImportantDates(entry));
  }
  const seen = new Set<string>();
  return out
    .filter((e) => (seen.has(e.uid) ? false : (seen.add(e.uid), true)))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const escapeIcs = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function fold(line: string): string {
  if (line.length <= 73) return line;
  const parts: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73));
    rest = rest.slice(73);
  }
  parts.push(rest);
  return parts.join("\r\n ");
}

function nextDay(date: string): string {
  const d = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)) + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

/** Build an .ics calendar (all-day events) that Apple, Google and Outlook can read. */
export function buildIcs(events: PlannerEvent[], calendarName = "Endless Planner"): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Endless Planner//Planner Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
    "X-PUBLISHED-TTL:PT6H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@endless-planner`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${e.date}`,
      `DTEND;VALUE=DATE:${nextDay(e.date)}`,
      fold(`SUMMARY:${escapeIcs(e.title || "Planner note")}`),
    );
    if (e.description) lines.push(fold(`DESCRIPTION:${escapeIcs(e.description)}`));
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcs(events: PlannerEvent[], filename = "endless-planner.ics") {
  const blob = new Blob([buildIcs(events)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** One-tap link that opens Google Calendar with a single event ready to save. */
export function googleCalendarLink(event: PlannerEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title || "Planner note",
    dates: `${event.date}/${nextDay(event.date)}`,
  });
  if (event.description) params.set("details", event.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
