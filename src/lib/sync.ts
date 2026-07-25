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
  | { kind: "pack-unlock"; packId: string; code: string }
  | { kind: "planner-unlock"; plannerId: string; code: string };

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

async function refreshSubStatus(userId: string): Promise<boolean> {
  try {
    const env = (await import("./stripe")).getStripeEnvironment();
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
          client_updated_at: Date.now(),
        },
        { onConflict: "user_id" }
      );
      if (error) throw error;
    } else if (op.kind === "pack-unlock") {
      const { error } = await supabase
        .from("user_packs")
        .upsert({ user_id: userId, pack_id: op.packId, unlock_code: op.code }, { onConflict: "user_id,pack_id" });
      if (error) throw error;
    } else if (op.kind === "planner-unlock") {
      const { error } = await supabase
        .from("user_planner_unlocks")
        .upsert(
          { user_id: userId, planner_id: op.plannerId, unlock_code: op.code },
          { onConflict: "user_id,planner_id" }
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

export async function pushEntry(entry: PlannerEntry) {
  if (!currentUserId) return;
  if (inboundIds.has(entry.id)) return; // came from realtime, don't echo
  const ok = navigator.onLine && (await pushOp({ kind: "entry-upsert", entry }, currentUserId));
  if (!ok) await enqueue({ kind: "entry-upsert", entry });
}

export async function pushDelete(id: string) {
  if (!currentUserId) return;
  const ok = navigator.onLine && (await pushOp({ kind: "entry-delete", id }, currentUserId));
  if (!ok) await enqueue({ kind: "entry-delete", id });
}

export async function pushSettings(settings: UserSettings) {
  if (!currentUserId) return;
  const ok = navigator.onLine && (await pushOp({ kind: "settings", settings }, currentUserId));
  if (!ok) await enqueue({ kind: "settings", settings });
}

export async function pushPackUnlock(packId: string, code: string) {
  if (!currentUserId) return;
  const ok = navigator.onLine && (await pushOp({ kind: "pack-unlock", packId, code }, currentUserId));
  if (!ok) await enqueue({ kind: "pack-unlock", packId, code });
}

export async function pushPlannerUnlock(plannerId: string, code: string) {
  if (!currentUserId) return;
  const ok = navigator.onLine && (await pushOp({ kind: "planner-unlock", plannerId, code }, currentUserId));
  if (!ok) await enqueue({ kind: "planner-unlock", plannerId, code });
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
  if (remote && (!local || Number(remote.client_updated_at) > (local.createdAt || 0))) {
    const next: UserSettings = {
      plannerName: remote.planner_name,
      ownerName: remote.owner_name,
      coverId: remote.cover_id || (local?.coverId ?? ""),
      onboarded: remote.onboarded,
      createdAt: local?.createdAt || Date.now(),
    };
    await db.put("meta", { key: "user-settings", value: next });
  } else if (local) {
    await pushOp({ kind: "settings", settings: local }, userId);
  }
}

async function reconcilePacks(userId: string) {
  const { data, error } = await supabase.from("user_packs").select("pack_id, unlock_code").eq("user_id", userId);
  if (error) return;
  for (const row of data ?? []) {
    if (row.unlock_code) {
      try {
        localStorage.setItem(`cover-pack-unlock:${row.pack_id}`, row.unlock_code);
      } catch {}
    }
  }
  // Push any local packs not yet on server
  try {
    const localPacks: { id: string; code: string }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("cover-pack-unlock:")) {
        const id = k.slice("cover-pack-unlock:".length);
        const code = localStorage.getItem(k) || "";
        if (code) localPacks.push({ id, code });
      }
    }
    const have = new Set((data ?? []).map((r) => r.pack_id));
    for (const p of localPacks) {
      if (!have.has(p.id)) await pushOp({ kind: "pack-unlock", packId: p.id, code: p.code }, userId);
    }
  } catch {}
}

async function reconcilePlannerUnlocks(userId: string) {
  const { data, error } = await supabase
    .from("user_planner_unlocks")
    .select("planner_id, unlock_code")
    .eq("user_id", userId);
  if (error) return;
  for (const row of data ?? []) {
    try {
      localStorage.setItem(`planner-unlock:${row.planner_id}`, row.unlock_code);
    } catch {}
  }
  // Push local unlocks not on server
  try {
    const have = new Set((data ?? []).map((r) => r.planner_id));
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("planner-unlock:")) {
        const id = k.slice("planner-unlock:".length);
        const code = localStorage.getItem(k) || "";
        if (code && !have.has(id)) {
          await pushOp({ kind: "planner-unlock", plannerId: id, code }, userId);
        }
      }
    }
  } catch {}
}

async function fullReconcile(userId: string) {
  await reconcileEntries(userId);
  await reconcileSettings(userId);
  await reconcilePacks(userId);
  await reconcilePlannerUnlocks(userId);
  await flushQueue();
  await setLastSyncAt(Date.now());
  emitDataChanged();
}

// ---------- realtime ----------

function startRealtime(userId: string) {
  stopRealtime();
  realtimeChannel = supabase
    .channel(`sync-${userId}`)
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
        const next: UserSettings = {
          plannerName: r.planner_name,
          ownerName: r.owner_name,
          coverId: r.cover_id,
          onboarded: r.onboarded,
          createdAt: local?.createdAt || Date.now(),
        };
        await db.put("meta", { key: "user-settings", value: next });
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

async function handleSignIn(userId: string) {
  currentUserId = userId;
  try {
    const db = await getDB();
    await db.put("meta", { key: META_CURRENT_USER, value: userId });
  } catch {}
  await fullReconcile(userId);
  startRealtime(userId);
}

function handleSignOut() {
  currentUserId = null;
  stopRealtime();
}

export async function signOut() {
  await supabase.auth.signOut();
  handleSignOut();
}

export async function reconcileNow() {
  if (!currentUserId) return;
  await fullReconcile(currentUserId);
}
