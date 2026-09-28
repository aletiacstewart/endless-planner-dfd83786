// Runs hourly; emails each opted-in member once a day at 7 AM in their own time zone.
import { createClient } from "npm:@supabase/supabase-js@2";
import { collectEvents, EVENT_PAGE_TYPES } from "../_shared/plannerEvents.ts";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const APP_LINK = "https://brandedbydigital.com/app";
const SEND_HOUR = 7;
const QUOTES = [
  "Small steps every day.",
  "Begin where you are.",
  "Today is a fresh page.",
  "Be gentle with yourself — you're doing better than you think.",
  "Make room for what matters.",
  "Progress, not perfection.",
  "Your ritual, your pace.",
];

function localParts(tz: string, d = new Date()) {
  let zone = tz;
  try { new Intl.DateTimeFormat("en-US", { timeZone: zone }); } catch { zone = "America/Chicago"; }
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return { ymd: `${p.year}${p.month}${p.day}`, iso: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

function addDays(ymd: string, n: number): string {
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8) + n));
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

function label(ymd: string, today: string): string {
  if (ymd === today) return "Today";
  if (ymd === addDays(today, 1)) return "Tomorrow";
  const d = new Date(Date.UTC(+ymd.slice(0, 4), +ymd.slice(4, 6) - 1, +ymd.slice(6, 8)));
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

Deno.serve(async () => {
  const { data: prefs, error } = await admin
    .from("reminder_preferences")
    .select("user_id, timezone, last_digest_date")
    .eq("morning_digest", true);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  let sent = 0;
  for (const p of prefs ?? []) {
    const now = localParts(p.timezone);
    if (now.hour < SEND_HOUR || p.last_digest_date === now.iso) continue;

    // Mark first so a retry can never double-send.
    await admin.from("reminder_preferences").update({ last_digest_date: now.iso }).eq("user_id", p.user_id);

    const { data: u } = await admin.auth.admin.getUserById(p.user_id);
    const email = u?.user?.email;
    if (!email) continue;

    const { data: rows } = await admin
      .from("planner_entries")
      .select("id, page_type, values")
      .eq("user_id", p.user_id)
      .is("deleted_at", null)
      .in("page_type", EVENT_PAGE_TYPES);
    const events = collectEvents(rows ?? []);
    const t = now.ymd;
    const in3 = addDays(t, 3), in7 = addDays(t, 7);
    const today = events.filter((e) => e.date === t && e.kind !== "bill" && e.kind !== "celebration");
    const bills = events.filter((e) => e.kind === "bill" && e.date >= t && e.date <= in3);
    const celebrations = events.filter((e) => e.kind === "celebration" && e.date >= t && e.date <= in7);
    if (!today.length && !bills.length && !celebrations.length) continue;

    const map = (list: typeof events) => list.slice(0, 10).map((e) => ({ title: e.title, when: label(e.date, t) }));
    const dateLabel = new Date(Date.UTC(+t.slice(0, 4), +t.slice(4, 6) - 1, +t.slice(6, 8)))
      .toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

    const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "morning-digest",
        recipientEmail: email,
        idempotencyKey: `digest-${p.user_id}-${now.iso}`,
        templateData: {
          dateLabel,
          quote: QUOTES[Number(t) % QUOTES.length],
          today: map(today),
          bills: map(bills),
          celebrations: map(celebrations),
          appLink: APP_LINK,
        },
      },
    });
    if (sendErr) console.error("digest send failed", p.user_id, sendErr);
    else sent++;
  }
  return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
});
