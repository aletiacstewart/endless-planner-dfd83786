/**
 * Cross-device sync engine.
 *
 * Local IndexedDB stays the source of truth on each device. When the user
 * is signed in, every local write is mirrored to Lovable Cloud and remote
 * changes are mirrored back via Realtime. Offline writes queue in IDB and
 * drain on reconnect.
 */

import { supabase } from "@/integrations/supabase/client";
import { getDB, type PlannerEntry } from "./db";
import type { UserSettings } from "./settings";

type QueueOp =
  | { kind: "entry-upsert"; entry: PlannerEntry }
  | { kind: "entry-delete"; id: string }
  | { kind: "settings"; settings: UserSettings }
  ;

interface QueueRow {
  key: string;
  value: { id: string; op: QueueOp; ts: number };
}

const QUEUE_STORE = "sync_queue";
const META_LAST_SYNC = "sync:last-sync";
const META_CURRENT_USER = "sync:current-user";

const DATA_CHANGED_EVENT = "planner-data-changed";

let currentUserId: string | null = null;
let hasActiveSub = false;
let inboundIds = new Set<string>(); // entry ids we just received via realtime — don't re-push
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null;
let subChannel: ReturnType<typeof supabase.channel> | null = null;

async function refreshSubStatus(userId: string): Promise<boolean> {
  try {
    const env = (await import("./stripe")).getStripeEnvironmentSafe();
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .eq("environment", env)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data) return (hasActiveSub = false);
    const end = data.current_period_end ? new Date(data.current_period_end).getTime() : null;
    const within = end === null || end > Date.now();
    hasActiveSub =
      (["active", "trialing", "past_due"].includes(data.status) && within) ||
      (data.status === "canceled" && end !== null && end > Date.now());
    return hasActiveSub;
  } catch {
    return (hasActiveSub = false);
  }
}

export function hasCloudSyncEntitlement(): boolean {
  return hasActiveSub;
}

// ---------- public API ----------

export function onDataChanged(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(DATA_CHANGED_EVENT, handler);
  return () => window.removeEventListener(DATA_CHANGED_EVENT, handler);
}

function emitDataChanged() {
  window.dispatchEvent(new Event(DATA_CHANGED_EVENT));
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export async function getLastSyncAt(): Promise<number | null> {
  try {
    const db = await getDB();
    const row = await (db as any).get("meta", META_LAST_SYNC);
    return (row?.value as number) ?? null;
  } catch {
    return null;
  }
}

async function setLastSyncAt(ts: number) {
  try {
    const db = await getDB();
    await (db as any).put("meta", { key: META_LAST_SYNC, value: ts });
  } catch {}
}

// ---------- queue ----------

async function ensureQueueStore(): Promise<IDBDatabase | null> {
  // Use a separate raw IDB so we don't need to bump the planner DB version.
  return new Promise((resolve) => {
    const req = indexedDB.open("planner-sync", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function enqueue(op: QueueOp) {
  const db = await ensureQueueStore();
  if (!db) return;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).put({ key: id, value: { id, op, ts: Date.now() } } satisfies QueueRow);
  await new Promise((r) => (tx.oncomplete = () => r(null)));
}

async function listQueue(): Promise<QueueRow[]> {
  const db = await ensureQueueStore();
  if (!db) return [];
  return new Promise((resolve) => {
    const tx = db.transaction(QUEUE_STORE, "readonly");
    const req = tx.objectStore(QUEUE_STORE).getAll();
    req.onsuccess = () => resolve(req.result as QueueRow[]);
    req.onerror = () => resolve([]);
  });
}

async function removeQueueItem(key: string) {
  const db = await ensureQueueStore();
  if (!db) return;
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  tx.objectStore(QUEUE_STORE).delete(key);
  await new Promise((r) => (tx.oncomplete = () => r(null)));
}

// ---------- push helpers ----------

async function pushOp(op: QueueOp, userId: string): Promise<boolean> {
  try {
    if (op.kind === "entry-upsert") {
      const e = op.entry;
      const { error } = await supabase.from("planner_entries").upsert(
        {
          id: e.id,
          user_id: userId,
          page_type: e.pageType,
          title: e.title ?? null,
          values: e.values as any,
          client_created_at: e.createdAt,
          client_updated_at: e.updatedAt,
          deleted_at: null,
        },
        { onConflict: "id" }
      );
      if (error) throw error;
    } else if (op.kind === "entry-delete") {
      const { error } = await supabase
        .from("planner_entries")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", op.id)
        .eq("user_id", userId);
      if (error) throw error;
    } else if (op.kind === "settings") {
      const s = op.settings;
      const { error } = await supabase.from("user_settings").upsert(
        {
          user_id: userId,
          planner_name: s.plannerName,
          owner_name: s.ownerName,
          cover_id: s.coverId,
          onboarded: s.onboarded,
          data: (await (await import("./plannerExtras")).collectExtras()) as any,
          client_updated_at: s.updatedAt || Date.now(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.warn("sync push failed", err);
    return false;
  }
}

async function flushQueue() {
  if (!currentUserId || !navigator.onLine) return;
  const items = await listQueue();
  for (const item of items) {
    const ok = await pushOp(item.value.op, currentUserId);
    if (ok) await removeQueueItem(item.key);
    else break;
  }
}

// ---------- public push API ----------

/**
 * A single Complete Tracker save fans out to dozens of linked pages.
 * Pushing each one separately floods the network, so pushes are coalesced
 * into one batched upsert per short window (last write per id wins).
 */
const pendingPush = new Map<string, PlannerEntry>();
let pushTimer: number | null = null;

function rowFor(e: PlannerEntry, userId: string) {
  return {
    id: e.id,
    user_id: userId,
    page_type: e.pageType,
    title: e.title ?? null,
    values: e.values as any,
    client_created_at: e.createdAt,
    client_updated_at: e.updatedAt,
    deleted_at: null,
  };
}

async function flushPending() {
  pushTimer = null;
  const userId = currentUserId;
  const batch = [...pendingPush.values()];
  pendingPush.clear();
  if (!userId || batch.length === 0) return;
  if (batch.length === 1) {
    const entry = batch[0];
    const ok = navigator.onLine && (await pushOp({ kind: "entry-upsert", entry }, userId));
    if (!ok) await enqueue({ kind: "entry-upsert", entry });
    return;
  }
  let ok = navigator.onLine;
  if (ok) {
    try {
      const { error } = await supabase
        .from("planner_entries")
        .upsert(batch.map((e) => rowFor(e, userId)), { onConflict: "id" });
      if (error) throw error;
    } catch (err) {
      console.warn("sync batch push failed", err);
      ok = false;
    }
  }
  if (!ok) {
    for (const entry of batch) await enqueue({ kind: "entry-upsert", entry });
  }
}

export async function pushEntry(entry: PlannerEntry) {
  if (!currentUserId || !hasActiveSub) return;
  if (inboundIds.has(entry.id)) return;
  pendingPush.set(entry.id, entry);
  if (pushTimer !== null) return;
  pushTimer = window.setTimeout(() => {
    void flushPending();
  }, 400);
}

export async function pushDelete(id: string) {
  if (!currentUserId || !hasActiveSub) return;
  const ok = navigator.onLine && (await pushOp({ kind: "entry-delete", id }, currentUserId));
  if (!ok) await enqueue({ kind: "entry-delete", id });
}

export async function pushSettings(settings: UserSettings) {
  if (!currentUserId || !hasActiveSub) return;
  const ok = navigator.onLine && (await pushOp({ kind: "settings", settings }, currentUserId));
  if (!ok) await enqueue({ kind: "settings", settings });
}


// ---------- reconciliation ----------

async function reconcileEntries(userId: string) {
  const db = await getDB();
  const { data: remote, error } = await supabase
    .from("planner_entries")
    .select("*")
    .eq("user_id", userId);
  if (error) {
    console.warn("reconcile entries failed", error);
    return;
  }
  const remoteMap = new Map(remote.map((r) => [r.id, r]));
  const local = await db.getAll("entries");
  const localMap = new Map(local.map((e) => [e.id, e]));

  // Apply remote → local
  for (const r of remote) {
    if (r.deleted_at) {
      if (localMap.has(r.id)) await db.delete("entries", r.id);
      continue;
    }
    const l = localMap.get(r.id);
    if (!l || (r.client_updated_at ?? 0) > l.updatedAt) {
      inboundIds.add(r.id);
      await db.put("entries", {
        id: r.id,
        pageType: r.page_type,
        title: r.title ?? undefined,
        createdAt: Number(r.client_created_at),
        updatedAt: Number(r.client_updated_at),
        values: (r.values as any) ?? {},
      });
      setTimeout(() => inboundIds.delete(r.id), 2000);
    }
  }

  // Push local entries newer than remote (or missing remotely)
  for (const l of local) {
    const r = remoteMap.get(l.id);
    if (!r || (r.client_updated_at ?? 0) < l.updatedAt) {
      await pushOp({ kind: "entry-upsert", entry: l }, userId);
    }
  }
}

async function reconcileSettings(userId: string) {
  const db = await getDB();
  const { data: remote, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.warn("reconcile settings failed", error);
    return;
  }
  const localRow = await db.get("meta", "user-settings");
  const local = (localRow?.value as UserSettings) || null;
  const localTs = local?.updatedAt || 0;
  if (remote && (!local || Number(remote.client_updated_at) > localTs)) {
    await applyRemoteSettings(remote, local);
  } else if (local) {
    await pushOp({ kind: "settings", settings: local }, userId);
  }
}

async function applyRemoteSettings(r: any, local: UserSettings | null) {
  const db = await getDB();
  const extras = (r.data ?? {}) as import("./plannerExtras").PlannerExtras;
  const next: UserSettings = {
    ...(local ?? ({} as UserSettings)),
    ...(extras.settings ?? {}),
    plannerName: r.planner_name,
    ownerName: r.owner_name,
    coverId: r.cover_id || (local?.coverId ?? ""),
    onboarded: r.onboarded,
    createdAt: local?.createdAt || extras.settings?.createdAt || Date.now(),
    updatedAt: Number(r.client_updated_at) || Date.now(),
  };
  await db.put("meta", { key: "user-settings", value: next });
  const { applyExtras } = await import("./plannerExtras");
  await applyExtras(extras, { settings: false });
}

async function reconcileEntitlements() {
  // Entitlements are owned by the server (Stripe webhook / redeem-code
  // function). The client only refreshes its verified cache.
  const { refreshEntitlements } = await import("./entitlements");
  await refreshEntitlements(true);
}

async function fullReconcile(userId: string) {
  // Always sync paid-for unlocks (planners + cover packs) so users can restore
  // purchases on any device without an active Cloud subscription.
  await reconcileEntitlements();
  // Entries + settings + queue flush are gated behind an active subscription.
  if (hasActiveSub) {
    await reconcileEntries(userId);
    await reconcileSettings(userId);
    await flushQueue();
  }
  await setLastSyncAt(Date.now());
  emitDataChanged();
}

// ---------- realtime ----------

function startRealtime(userId: string) {
  stopRealtime();
  realtimeChannel = supabase
    .channel(`sync-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "planner_entries", filter: `user_id=eq.${userId}` },
      async (payload: any) => {
        const r = payload.new || payload.old;
        if (!r) return;
        const db = await getDB();
        if (payload.eventType === "DELETE" || r.deleted_at) {
          await db.delete("entries", r.id);
        } else {
          inboundIds.add(r.id);
          await db.put("entries", {
            id: r.id,
            pageType: r.page_type,
            title: r.title ?? undefined,
            createdAt: Number(r.client_created_at),
            updatedAt: Number(r.client_updated_at),
            values: r.values ?? {},
          });
          setTimeout(() => inboundIds.delete(r.id), 2000);
        }
        emitDataChanged();
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${userId}` },
      async (payload: any) => {
        const r = payload.new;
        if (!r) return;
        const db = await getDB();
        const localRow = await db.get("meta", "user-settings");
        const local = (localRow?.value as UserSettings) || null;
        if (local?.updatedAt && Number(r.client_updated_at) <= local.updatedAt) return;
        await applyRemoteSettings(r, local);
        emitDataChanged();
      }
    )
    .subscribe();
}

function stopRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

// ---------- init ----------

let initialized = false;

export function initSync() {
  if (initialized) return;
  initialized = true;

  supabase.auth.getSession().then(({ data }) => {
    const uid = data.session?.user?.id ?? null;
    if (uid) handleSignIn(uid);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    const uid = session?.user?.id ?? null;
    if (uid && uid !== currentUserId) handleSignIn(uid);
    else if (!uid && currentUserId) handleSignOut();
  });

  window.addEventListener("online", () => {
    flushQueue();
  });
}

/**
 * This device's planner data belongs to one account at a time. When a
 * different account signs in, park the previous account's pages + settings
 * under a per-account stash and load the new account's own stash (if any),
 * so one person's planner never shows up in someone else's account.
 */
async function switchLocalAccount(userId: string) {
  const db = await getDB();
  const prevRow = await db.get("meta", META_CURRENT_USER);
  const prev = (prevRow?.value as string | undefined) ?? null;
  if (prev === userId) return;

  const entries = await db.getAll("entries");
  const settingsRow = await db.get("meta", "user-settings");
  if (prev || entries.length || settingsRow) {
    await db.put("meta", {
      key: `stash:${prev ?? "signed-out"}`,
      value: { entries, settings: settingsRow?.value ?? null },
    });
  }

  const tx = db.transaction(["entries", "meta"], "readwrite");
  await tx.objectStore("entries").clear();
  await tx.objectStore("meta").delete("user-settings");
  await tx.objectStore("meta").delete(META_LAST_SYNC);
  const stash = (await tx.objectStore("meta").get(`stash:${userId}`))?.value as
    | { entries: PlannerEntry[]; settings: unknown }
    | undefined;
  if (stash) {
    for (const e of stash.entries ?? []) await tx.objectStore("entries").put(e);
    if (stash.settings) await tx.objectStore("meta").put({ key: "user-settings", value: stash.settings });
    await tx.objectStore("meta").delete(`stash:${userId}`);
  }
  await tx.objectStore("meta").put({ key: META_CURRENT_USER, value: userId });
  await tx.done;

  // Drop queued uploads from the previous account.
  const qdb = await ensureQueueStore();
  if (qdb) {
    const qtx = qdb.transaction(QUEUE_STORE, "readwrite");
    qtx.objectStore(QUEUE_STORE).clear();
    await new Promise((r) => (qtx.oncomplete = () => r(null)));
  }
  emitDataChanged();
}

/** Cover title/name chosen at checkout fill a brand-new account's empty settings. */
async function applyPendingCoverText() {
  try {
    const { loadSettings, saveSettings } = await import("./settings");
    const cur = await loadSettings();
    if (cur.plannerName || cur.ownerName) { sessionStorage.removeItem("pendingCoverText"); return; }
    let text: { plannerName?: string; ownerName?: string } = {};
    const raw = sessionStorage.getItem("pendingCoverText");
    if (raw) text = JSON.parse(raw);
    else {
      const meta = (await supabase.auth.getUser()).data.user?.user_metadata ?? {};
      text = { plannerName: meta.planner_name ?? "", ownerName: meta.owner_name ?? "" };
    }
    sessionStorage.removeItem("pendingCoverText");
    if (!text.plannerName && !text.ownerName) return;
    await saveSettings({ plannerName: text.plannerName ?? "", ownerName: text.ownerName ?? "" });
    emitDataChanged();
  } catch { /* non-fatal */ }
}

async function handleSignIn(userId: string) {
  currentUserId = userId;
  try {
    await switchLocalAccount(userId);
  } catch (e) {
    console.warn("account switch failed", e);
  }
  await refreshSubStatus(userId);
  await fullReconcile(userId);
  await applyPendingCoverText();
  if (hasActiveSub) startRealtime(userId);

  // React to subscription changes without needing a page reload.
  // Remove any previous channel first — re-adding callbacks to an already
  // subscribed channel throws ("cannot add postgres_changes callbacks after subscribe").
  if (subChannel) {
    supabase.removeChannel(subChannel);
    subChannel = null;
  }
  subChannel = supabase
    .channel(`sync-sub-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${userId}` },
      async () => {
        const wasActive = hasActiveSub;
        await refreshSubStatus(userId);
        if (hasActiveSub && !wasActive) {
          await fullReconcile(userId);
          startRealtime(userId);
        } else if (!hasActiveSub && wasActive) {
          stopRealtime();
        }
      },
    )
    .subscribe();
}

function handleSignOut() {
  currentUserId = null;
  hasActiveSub = false;
  stopRealtime();
  if (subChannel) {
    supabase.removeChannel(subChannel);
    subChannel = null;
  }
}

export async function signOut() {
  await supabase.auth.signOut();
  handleSignOut();
}

export async function reconcileNow() {
  if (!currentUserId) return;
  await fullReconcile(currentUserId);
}
