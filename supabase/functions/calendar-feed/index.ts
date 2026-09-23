// Private calendar feed: Apple Calendar, Google Calendar and Outlook subscribe to
// this URL and keep showing the planner's dated notes and appointments.
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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

interface Event { uid: string; date: string; title: string; description?: string }

function fromCalendarMap(id: string, values: Record<string, unknown>, key: string, prefix: string): Event[] {
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
    });
  }
  return out;
}

function fromImportantDates(id: string, values: Record<string, unknown>): Event[] {
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

function nextDay(date: string): string {
  const d = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)) + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function buildIcs(events: Event[]): string {
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
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" },
    });
  }

  const url = new URL(req.url);
  const token = (url.searchParams.get("token") ?? "").trim();
  if (!token) return new Response("Missing calendar token", { status: 400 });

  const { data: row } = await admin
    .from("calendar_feed_tokens")
    .select("user_id")
    .eq("token", token)
    .maybeSingle();

  if (!row) return new Response("This calendar link is no longer active", { status: 404 });

  const { data: entries, error } = await admin
    .from("planner_entries")
    .select("id, page_type, values")
    .eq("user_id", row.user_id)
    .is("deleted_at", null)
    .in("page_type", ["monthly-calendar", "medical-records", "important-dates"]);

  if (error) {
    console.error("feed query failed", error);
    return new Response("Could not build the calendar", { status: 500 });
  }

  const events: Event[] = [];
  for (const e of entries ?? []) {
    const values = (e.values ?? {}) as Record<string, unknown>;
    if (e.page_type === "monthly-calendar") events.push(...fromCalendarMap(e.id, values, "calendar", ""));
    else if (e.page_type === "medical-records") {
      events.push(...fromCalendarMap(e.id, values, "medical_calendar", "Medical: "));
    } else if (e.page_type === "important-dates") events.push(...fromImportantDates(e.id, values));
  }

  const seen = new Set<string>();
  const unique = events
    .filter((e) => (seen.has(e.uid) ? false : (seen.add(e.uid), true)))
    .sort((a, b) => a.date.localeCompare(b.date));

  return new Response(buildIcs(unique), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=1800",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
