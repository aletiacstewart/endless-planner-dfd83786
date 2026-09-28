// Shared planner → calendar event builders (feed + morning digest).
const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const pad = (n: number) => String(n).padStart(2, "0");

function monthIndex(month: unknown): number | null {
  const m = String(month ?? "").trim().toLowerCase();
  if (!m) return null;
  const byName = MONTHS.findIndex((n) => n.startsWith(m.slice(0, 3)));
  if (byName >= 0) return byName;
  const n = parseInt(m, 10);
  return n >= 1 && n <= 12 ? n - 1 : null;
}

const ymd = (year: number, mi: number, day: number) => `${year}${pad(mi + 1)}${pad(day)}`;

export type EventKind = "bill" | "celebration" | "medical" | "note";
export interface Event { uid: string; date: string; title: string; description?: string; kind?: EventKind }

export function fromCalendarMap(id: string, values: Record<string, unknown>, key: string, prefix: string): Event[] {
  const map = values[key] as Record<string, string> | undefined;
  if (!map || typeof map !== "object") return [];
  const mi = monthIndex(values.month);
  const year = parseInt(String(values.year ?? ""), 10);
  if (mi === null || !Number.isFinite(year) || year < 1000) return [];
  const out: Event[] = [];
  for (const [k, note] of Object.entries(map)) {
    if (!/^\d+$/.test(k)) continue;
    const text = String(note ?? "").trim();
    if (!text) continue;
    const day = Number(k);
    if (day < 1 || day > 31) continue;
    const type = String(map[`t${k}`] ?? "").trim();
    out.push({
      uid: `${id}-${key}-${k}`,
      date: ymd(year, mi, day),
      title: text.split("\n")[0].slice(0, 120),
      description: [type && `${prefix}${type}`, text].filter(Boolean).join("\n"),
      kind: prefix ? "medical" : "note",
    });
  }
  return out;
}

export function fromImportantDates(id: string, values: Record<string, unknown>): Event[] {
  const grid = values.date_details as Record<string, string> | undefined;
  if (!grid || typeof grid !== "object") return [];
  const fallbackYear = parseInt(String(values.year ?? ""), 10);
  const rows = Math.max(8, Number(grid.__rows ?? "") || 0);
  const out: Event[] = [];
  for (let r = 1; r <= rows; r += 1) {
    const who = String(grid[`${r}-Name/Activity`] ?? "").trim();
    const occasion = String(grid[`${r}-Occasion`] ?? "").trim();
    const raw = String(grid[`${r}-Date`] ?? "").trim();
    if (!raw || (!who && !occasion)) continue;
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const md = raw.match(/^(\d{1,2})[/-](\d{1,2})$/);
    let date = "";
    if (iso) date = `${iso[1]}${iso[2]}${iso[3]}`;
    else if (md && Number.isFinite(fallbackYear)) date = ymd(fallbackYear, Number(md[1]) - 1, Number(md[2]));
    if (!date) continue;
    out.push({
      uid: `${id}-dates-${r}`,
      date,
      title: [who, occasion].filter(Boolean).join(" — ").slice(0, 120),
      description: String(grid[`${r}-Notes`] ?? "").trim() || undefined,
      kind: "celebration",
    });
  }
  return out;
}


export function fromBills(id: string, v: Record<string, unknown>): Event[] {
  const grid = v.fixed as Record<string, string> | undefined;
  if (!grid || typeof grid !== "object") return [];
  const mi = monthIndex(v.month as string);
  const year = parseInt(String(v.year ?? v.__year ?? ""), 10);
  const rows = Math.max(16, Number(grid.__rows ?? "") || 0);
  const out: Event[] = [];
  for (let r = 1; r <= rows; r += 1) {
    const bill = (grid[`${r}-Bill`] ?? "").trim();
    const due = (grid[`${r}-Due`] ?? "").trim();
    if (!bill || !due) continue;
    const date = billDate(due, mi, year);
    if (!date) continue;
    const amount = (grid[`${r}-Amount`] ?? "").trim();
    out.push({
      uid: `${id}-bill-${r}`,
      date,
      title: `Bill due: ${bill}${amount ? ` (${amount})` : ""}`.slice(0, 120),
      kind: "bill",
    });
  }
  return out;
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


/** Bill "Due" cells are free text: "15", "15th", "3/15" or "2026-03-15". */
function billDate(raw: string, mi: number | null, year: number): string {
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;
  const y = Number.isFinite(year) && year > 1000 ? year : new Date().getFullYear();
  const md = raw.match(/^(\d{1,2})[/-](\d{1,2})/);
  if (md) return ymd(y, Number(md[1]) - 1, Number(md[2]));
  const d = raw.match(/^(\d{1,2})/);
  if (d && mi !== null) {
    const day = Number(d[1]);
    if (day >= 1 && day <= 31) return ymd(y, mi, day);
  }
  return "";
}

/** Reminder alarms per kind, relative to the all-day event's midnight start. */
const ALARMS: Record<string, { trigger: string; label: string }[]> = {
  bill: [{ trigger: "-PT63H", label: "due in 3 days" }, { trigger: "PT9H", label: "due today" }],
  celebration: [{ trigger: "-PT15H", label: "tomorrow" }, { trigger: "PT9H", label: "today" }],
  medical: [{ trigger: "-PT15H", label: "appointment tomorrow" }, { trigger: "PT8H", label: "appointment today" }],
  note: [{ trigger: "PT9H", label: "today" }],
};

function alarmLines(kind: string | undefined, title: string): string[] {
  const out: string[] = [];
  for (const a of ALARMS[kind ?? "note"] ?? ALARMS.note) {
    out.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `TRIGGER:${a.trigger}`,
      fold(`DESCRIPTION:${escapeIcs(`${title || "Planner note"} — ${a.label}`)}`),
      "END:VALARM",
    );
  }
  return out;
}

function nextDay(date: string): string {
  const d = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)) + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function buildIcs(events: Event[]): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Endless Planner//Planner Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Endless Planner",
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
    lines.push(...alarmLines(e.kind, e.title));
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}


/** Every dated event across a user's planner rows (page_type + values). */
export function collectEvents(rows: { id: string; page_type: string; values: unknown }[]): Event[] {
  const events: Event[] = [];
  for (const e of rows) {
    const values = (e.values ?? {}) as Record<string, unknown>;
    if (e.page_type === "monthly-calendar") events.push(...fromCalendarMap(e.id, values, "calendar", ""));
    else if (e.page_type === "medical-records") events.push(...fromCalendarMap(e.id, values, "medical_calendar", "Medical: "));
    else if (e.page_type === "important-dates") events.push(...fromImportantDates(e.id, values));
    else if (e.page_type === "budget-monthly") events.push(...fromBills(e.id, values));
  }
  const seen = new Set<string>();
  return events
    .filter((e) => (seen.has(e.uid) ? false : (seen.add(e.uid), true)))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const EVENT_PAGE_TYPES = ["monthly-calendar", "medical-records", "important-dates", "budget-monthly"];
