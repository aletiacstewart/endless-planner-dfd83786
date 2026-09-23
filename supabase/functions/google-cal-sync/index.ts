import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import {
  appUserReconnectRequired,
  callAsAppUser,
  disconnectAppUser,
} from "../_shared/appUserConnector.ts";
import {
  deleteConnectionForUser,
  getConnectionKeyForUser,
} from "../_shared/appUserConnections.ts";
import { GOOGLE_CALENDAR_SCOPES } from "../_shared/googleScopes.ts";

/**
 * Two-way Google Calendar sync.
 *
 * GET    → connection status (connected, email, last sync).
 * POST   → full sync: push planner dates to Google, pull Google events into
 *          the planner's monthly calendar pages, remove orphans on both sides.
 * DELETE → disconnect: revoke the user's Google connection and clear state.
 */

const GATEWAY = "https://connector-gateway.lovable.dev";
const CONNECTOR = "google_calendar";
const ICS_SUFFIX = "@endless-planner";
const PAGE_TYPES = ["monthly-calendar", "medical-records", "important-dates"];

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function userClient(req: Request) {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization")! } },
  });
}

function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

// ---------- planner event collection (port of src/lib/calendarExport.ts) ----------

interface PlannerEvent {
  uid: string;
  date: string; // YYYYMMDD
  title: string;
  description?: string;
}

function monthIndex(month: unknown): number | null {
  const m = String(month ?? "").trim().toLowerCase();
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

function nextDay(date: string): string {
  const d = new Date(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6, 8)) + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

type V = Record<string, unknown>;

function eventsFromCalendarMap(entry: { id: string; values: V }, key: string, typePrefix: string): PlannerEvent[] {
  const map = entry.values[key] as Record<string, string> | undefined;
  if (!map) return [];
  const mi = monthIndex(entry.values.month);
  const year = parseInt(String(entry.values.year ?? ""), 10);
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

function eventsFromImportantDates(entry: { id: string; values: V }): PlannerEvent[] {
  const grid = entry.values.date_details as Record<string, string> | undefined;
  if (!grid) return [];
  const fallbackYear = parseInt(String(entry.values.year ?? ""), 10);
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

function collectPlannerEvents(
  entries: { id: string; pageType: string; values: V }[],
): PlannerEvent[] {
  const out: PlannerEvent[] = [];
  for (const entry of entries) {
    if (entry.pageType === "monthly-calendar") out.push(...eventsFromCalendarMap(entry, "calendar", ""));
    else if (entry.pageType === "medical-records") {
      out.push(...eventsFromCalendarMap(entry, "medical_calendar", "Medical: "));
    } else if (entry.pageType === "important-dates") out.push(...eventsFromImportantDates(entry));
  }
  const seen = new Set<string>();
  return out.filter((e) => (seen.has(e.uid) ? false : (seen.add(e.uid), true)));
}

// ---------- Google helpers ----------

async function gcal(
  key: string,
  path: string,
  init?: RequestInit,
): Promise<{ res: Response; reconnect: boolean }> {
  const res = await callAsAppUser({
    gatewayBaseUrl: GATEWAY,
    connectionAPIKey: key,
    connectorId: CONNECTOR,
    path,
    init,
    requiredScopes: GOOGLE_CALENDAR_SCOPES,
  });
  const reconnect = await appUserReconnectRequired(res);
  return { res, reconnect };
}

interface ListedEvents {
  items: any[];
  error?: string;
  reconnect?: boolean;
}

async function listAllEvents(key: string): Promise<ListedEvents> {
  const now = new Date();
  const timeMin = `${now.getFullYear() - 1}-01-01T00:00:00Z`;
  const timeMax = `${now.getFullYear() + 2}-01-01T00:00:00Z`;
  const items: any[] = [];
  let pageToken = "";
  for (let page = 0; page < 5; page++) {
    const qs = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });
    if (pageToken) qs.set("pageToken", pageToken);
    const { res, reconnect } = await gcal(key, `/calendar/v3/calendars/primary/events?${qs}`);
    if (reconnect) return { items, reconnect: true };
    if (!res.ok) return { items, error: `Google Calendar list failed (${res.status})` };
    const body = await res.json();
    items.push(...(body.items ?? []));
    pageToken = body.nextPageToken ?? "";
    if (!pageToken) break;
  }
  return { items };
}

// ---------- handlers ----------

async function handleStatus(req: Request, userId: string) {
  const key = await getConnectionKeyForUser(userId, CONNECTOR);
  const { data: st } = await adminClient()
    .from("google_sync_state")
    .select("google_email, last_sync_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (!key) return json({ connected: false, email: st?.google_email ?? null, lastSyncAt: st?.last_sync_at ?? null });
  return json({ connected: true, email: st?.google_email ?? null, lastSyncAt: st?.last_sync_at ?? null });
}

async function handleDisconnect(userId: string) {
  try {
    const key = await getConnectionKeyForUser(userId, CONNECTOR);
    if (key) {
      try {
        await disconnectAppUser({ gatewayBaseUrl: GATEWAY, connectionAPIKey: key, connectorId: CONNECTOR });
      } catch (err) {
        console.warn("gateway disconnect failed", err);
      }
    }
    await deleteConnectionForUser(userId, CONNECTOR);
    await adminClient().from("google_sync_state").delete().eq("user_id", userId);
    return json({ ok: true });
  } catch (err) {
    console.error("google disconnect failed", err);
    return json({ error: "Could not disconnect. Please try again." }, 500);
  }
}

async function handleSync(req: Request, userId: string) {
  const key = await getConnectionKeyForUser(userId, CONNECTOR);
  if (!key) return json({ connected: false });

  // Which Google account is connected (also validates the credential).
  const primary = await gcal(key, "/calendar/v3/calendars/primary");
  if (primary.reconnect) return json({ connected: false, reconnectRequired: true });
  if (!primary.res.ok) {
    return json({ error: `Google Calendar check failed (${primary.res.status})` }, 502);
  }
  const googleEmail = ((await primary.res.json()).id as string) ?? null;

  // Read the planner's dated pages.
  const supabase = userClient(req);
  const { data: rows, error } = await supabase
    .from("planner_entries")
    .select("id, page_type, values")
    .eq("user_id", userId)
    .in("page_type", PAGE_TYPES)
    .is("deleted_at", null);
  if (error) return json({ error: "Could not read your planner entries." }, 500);

  const entries = (rows ?? []).map((r: any) => ({
    id: r.id as string,
    pageType: r.page_type as string,
    values: (r.values ?? {}) as V,
  }));
  const plannerEvents = collectPlannerEvents(entries);
  const plannerUids = new Set(plannerEvents.map((e) => e.uid));

  const now = new Date();
  const winStart = `${now.getFullYear() - 1}0101`;
  const winEnd = `${now.getFullYear() + 1}1231`;
  const isoWinStart = `${now.getFullYear() - 1}-01-01`;
  const isoWinEnd = `${now.getFullYear() + 1}-12-31`;

  const listed = await listAllEvents(key);
  if (listed.reconnect) return json({ connected: false, reconnectRequired: true });
  if (listed.error) return json({ error: listed.error }, 502);
  const items: any[] = listed.items;

  // ---- push: planner → Google ----
  // Map our previously pushed events by planner uid. Cancelled events stay in
  // the map so orphan cleanup can delete them instead of recreating them.
  const oursByUid = new Map<string, any>();
  for (const it of items) {
    if (typeof it.iCalUID === "string" && it.iCalUID.endsWith(ICS_SUFFIX)) {
      oursByUid.set(it.iCalUID.slice(0, -ICS_SUFFIX.length), it);
    }
  }

  let created = 0;
  let updated = 0;
  let removed = 0;
  const pushErrors: string[] = [];

  const pushList = plannerEvents.filter((e) => e.date >= winStart && e.date <= winEnd);
  await mapLimit(pushList, 5, async (e) => {
    const existing = oursByUid.get(e.uid);
    const body = {
      summary: e.title || "Planner note",
      description: e.description ?? "",
      start: { date: e.date },
      end: { date: nextDay(e.date) },
    };
    try {
      if (existing) {
        const changed =
          existing.summary !== body.summary ||
          (existing.description ?? "") !== body.description ||
          existing.start?.date !== e.date ||
          existing.status === "cancelled";
        if (!changed) return;
        const { res } = await gcal(
          key,
          `/calendar/v3/calendars/primary/events/${existing.id}`,
          { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
        );
        if (res.ok) updated += 1;
        else pushErrors.push(`update ${res.status}`);
      } else {
        const { res } = await gcal(key, "/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, iCalUID: `${e.uid}${ICS_SUFFIX}` }),
        });
        if (res.ok) {
          created += 1;
          oursByUid.set(e.uid, {});
        } else pushErrors.push(`create ${res.status}`);
      }
    } catch {
      pushErrors.push("network");
    }
  });

  // Orphan cleanup — only after a previous sync, so a first run can never wipe
  // events it hasn't actually mirrored yet.
  const { data: prevState } = await adminClient()
    .from("google_sync_state")
    .select("last_sync_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (prevState?.last_sync_at) {
    const orphans = [...oursByUid.entries()].filter(([uid]) => !plannerUids.has(uid));
    await mapLimit(orphans, 5, async ([, it]) => {
      if (!it?.id) return;
      try {
        const { res } = await gcal(
          key,
          `/calendar/v3/calendars/primary/events/${it.id}`,
          { method: "DELETE" },
        );
        if (res.ok || res.status === 410 || res.status === 404) removed += 1;
      } catch {
        /* keep going */
      }
    });
  }

  // ---- pull: Google → planner monthly calendar pages ----
  const fetchedIds = new Set<string>();
  const monthly = entries.filter((e) => e.pageType === "monthly-calendar");
  const createdEntries: { id: string; pageType: string; title: string; values: V; isNew: true }[] = [];
  const byMonth = new Map<string, any>();
  let pulled = 0;

  for (const it of items) {
    if (it.status === "cancelled") continue;
    if (typeof it.iCalUID === "string" && it.iCalUID.endsWith(ICS_SUFFIX)) continue;
    const start = it.start ?? {};
    const date = typeof start.date === "string"
      ? start.date
      : typeof start.dateTime === "string"
      ? start.dateTime.slice(0, 10)
      : "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (date < isoWinStart || date > isoWinEnd) continue;
    const time = typeof start.dateTime === "string" ? start.dateTime.slice(11, 16) : "";
    const summary = String(it.summary ?? "").trim().slice(0, 200);
    const [y, m, d] = date.split("-");
    const mkey = `${y}-${m}`;
    let entry = byMonth.get(mkey);
    if (!entry) {
      const existing = monthly.find(
        (e) => String(e.values.year ?? "") === y && monthIndex(e.values.month) === Number(m) - 1,
      );
      if (existing) {
        entry = existing;
      } else {
        const monthName = MONTHS[Number(m) - 1];
        entry = {
          id: crypto.randomUUID(),
          pageType: "monthly-calendar",
          title: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${y}`,
          values: { month: monthName, year: y, calendar: {} } as V,
          isNew: true,
        };
        createdEntries.push(entry);
      }
      byMonth.set(mkey, entry);
    }
    const cal = (entry.values.calendar = (entry.values.calendar ?? {}) as Record<string, string>);
    // Registry: g:<googleEventId> = "<date>|<HH:MM>|<summary>"
    cal[`g:${it.id}`] = `${date}|${time}|${summary}`;
    fetchedIds.add(it.id);
    pulled += 1;
  }

  // Rebuild the per-day display strings and prune registry entries whose Google
  // event no longer exists (within the window we just fetched).
  let pulledRemoved = 0;
  const touched: any[] = [];
  for (const entry of [...monthly, ...createdEntries]) {
    const cal = entry.values.calendar as Record<string, string> | undefined;
    if (!cal) continue;
    const before = JSON.stringify(cal);
    for (const [k, v] of Object.entries(cal)) {
      if (!k.startsWith("g:")) continue;
      const id = k.slice(2);
      const dstr = String(v).split("|")[0];
      const inWindow = dstr >= isoWinStart && dstr <= isoWinEnd;
      if (!fetchedIds.has(id) && inWindow) {
        delete cal[k];
        pulledRemoved += 1;
      }
    }
    const byDay = new Map<string, string[]>();
    for (const [k, v] of Object.entries(cal)) {
      if (!k.startsWith("g:")) continue;
      const [, ...rest] = String(v).split("|");
      const dstr = String(v).split("|")[0];
      const time = rest[0] ?? "";
      const text = rest.slice(1).join("|");
      const day = dstr.slice(8, 10);
      const line = `${time ? `${time} ` : ""}${text}`.trim();
      if (!line) continue;
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day)!.push(line);
    }
    for (const k of Object.keys(cal)) if (/^g\d+$/.test(k)) delete cal[k];
    for (const [day, lines] of byDay) cal[`g${day}`] = lines.join("\n");
    if (JSON.stringify(cal) !== before || (entry as any).isNew) touched.push(entry);
  }

  if (touched.length) {
    const upsertRows = touched.map((e) => ({
      id: e.id,
      user_id: userId,
      page_type: e.pageType,
      title: e.title ?? null,
      values: e.values,
      client_created_at: Date.now(),
      client_updated_at: Date.now(),
      deleted_at: null,
    }));
    const { error: upErr } = await supabase.from("planner_entries").upsert(upsertRows, { onConflict: "id" });
    if (upErr) return json({ error: "Could not save Google events into your planner." }, 500);
  }

  const lastSyncAt = new Date().toISOString();
  const lastResult = { created, updated, removed, pulled, pulledRemoved };
  await adminClient().from("google_sync_state").upsert({
    user_id: userId,
    google_email: googleEmail,
    last_sync_at: lastSyncAt,
    last_result: lastResult,
    updated_at: lastSyncAt,
  });

  return json({ connected: true, email: googleEmail, lastSyncAt, ...lastResult });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = userClient(req);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Sign in required", { status: 401, headers: corsHeaders });

    if (req.method === "GET") return await handleStatus(req, user.id);
    if (req.method === "POST") return await handleSync(req, user.id);
    if (req.method === "DELETE") return await handleDisconnect(user.id);
    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    console.error("google-cal-sync failed", err);
    return json({ error: err instanceof Error ? err.message : "Sync failed" }, 500);
  }
});
