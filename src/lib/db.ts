import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type FieldValue = string | number | boolean | string[] | Record<string, unknown> | null;

export interface PlannerEntry {
  id: string;
  pageType: string; // matches a key in PAGE_TYPES
  title?: string;
  createdAt: number;
  updatedAt: number;
  /** Manual sort position within its page type (drag-to-reorder in the rail). */
  order?: number;
  values: Record<string, FieldValue>;
}

interface PlannerDB extends DBSchema {
  entries: {
    key: string;
    value: PlannerEntry;
    indexes: { "by-pageType": string; "by-updatedAt": number };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = "change-of-life-planner";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PlannerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PlannerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("entries")) {
          const store = db.createObjectStore("entries", { keyPath: "id" });
          store.createIndex("by-pageType", "pageType");
          store.createIndex("by-updatedAt", "updatedAt");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function listEntries(pageType?: string): Promise<PlannerEntry[]> {
  const db = await getDB();
  if (pageType) {
    const items = await db.getAllFromIndex("entries", "by-pageType", pageType);
    return sortEntries(items);
  }
  const all = await db.getAll("entries");
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Manually ordered entries come first (ascending), everything else falls back
 * to most-recently-updated so untouched sections behave exactly as before.
 */
export function sortEntries(items: PlannerEntry[]): PlannerEntry[] {
  return [...items].sort((a, b) => {
    const ao = a.order, bo = b.order;
    if (ao != null && bo != null) return ao - bo;
    if (ao != null) return -1;
    if (bo != null) return 1;
    return b.updatedAt - a.updatedAt;
  });
}

/** Persist a drag-to-reorder result: writes `order` for each id in sequence. */
export async function setEntryOrder(ids: string[]): Promise<void> {
  const db = await getDB();
  for (let i = 0; i < ids.length; i++) {
    const e = await db.get("entries", ids[i]);
    if (!e || e.order === i) continue;
    await db.put("entries", { ...e, order: i });
    import("./sync").then((m) => m.pushEntry({ ...e, order: i })).catch(() => {});
  }
}

export async function getEntry(id: string): Promise<PlannerEntry | undefined> {
  const db = await getDB();
  return db.get("entries", id);
}

export async function saveEntry(entry: PlannerEntry): Promise<void> {
  const db = await getDB();
  await db.put("entries", entry);
  // Fire-and-forget cloud mirror (no-op if not signed in). Dynamic import avoids a circular dep.
  import("./sync").then((m) => m.pushEntry(entry)).catch(() => {});
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("entries", id);
  import("./sync").then((m) => m.pushDelete(id)).catch(() => {});
}

export async function createEntry(pageType: string, defaults: Record<string, FieldValue> = {}): Promise<PlannerEntry> {
  const now = Date.now();
  const entry: PlannerEntry = {
    id: newId(),
    pageType,
    createdAt: now,
    updatedAt: now,
    values: defaults,
  };
  await saveEntry(entry);
  return entry;
}

export async function exportAll(): Promise<string> {
  const db = await getDB();
  const entries = await db.getAll("entries");
  return JSON.stringify({ version: 1, exportedAt: Date.now(), entries }, null, 2);
}

export async function getAllEntries(): Promise<PlannerEntry[]> {
  const db = await getDB();
  return db.getAll("entries");
}

export async function importAll(json: string, mode: "merge" | "replace" = "merge"): Promise<number> {
  const data = JSON.parse(json) as { entries?: PlannerEntry[] };
  if (!data?.entries || !Array.isArray(data.entries)) throw new Error("Invalid backup file");
  const db = await getDB();
  if (mode === "replace") {
    await db.clear("entries");
  }
  const tx = db.transaction("entries", "readwrite");
  let count = 0;
  for (const entry of data.entries) {
    if (entry?.id && entry?.pageType) {
      await tx.store.put(entry);
      count++;
    }
  }
  await tx.done;
  return count;
}

/**
 * First-entry timestamp — used to show the user the date range their backup covers.
 */
export async function getFirstEntryDate(): Promise<number | null> {
  const db = await getDB();
  const all = await db.getAll("entries");
  if (!all.length) return null;
  return all.reduce((min, e) => Math.min(min, e.createdAt), Infinity);
}
