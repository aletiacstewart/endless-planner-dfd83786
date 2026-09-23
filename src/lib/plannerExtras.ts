/**
 * Everything the user creates that isn't a page entry: full planner settings
 * (including planner-wide style), the shared Doctors directory and saved
 * custom colors. Used by both the JSON backup file and cloud sync so nothing
 * the user adds is left behind.
 */
import { getDB } from "./db";
import type { UserSettings } from "./settings";

const PALETTE_KEY = "planner-custom-colors";

export interface PlannerExtras {
  settings?: UserSettings;
  doctors?: unknown[];
  customColors?: string[];
  /** Any other meta rows (future features) keyed by name. */
  meta?: Record<string, unknown>;
}

const SKIP_META = new Set(["last-sync-at", "lastSyncAt"]);

export async function collectExtras(): Promise<PlannerExtras> {
  const db = await getDB();
  const rows = await db.getAll("meta");
  const meta: Record<string, unknown> = {};
  let settings: UserSettings | undefined;
  let doctors: unknown[] | undefined;
  for (const r of rows) {
    if (r.key === "user-settings") settings = r.value as UserSettings;
    else if (r.key === "doctors") doctors = r.value as unknown[];
    else if (!SKIP_META.has(r.key) && !/sync/i.test(r.key)) meta[r.key] = r.value;
  }
  let customColors: string[] = [];
  try { customColors = JSON.parse(localStorage.getItem(PALETTE_KEY) || "[]"); } catch {}
  return { settings, doctors, customColors, meta };
}

export async function applyExtras(x: PlannerExtras | null | undefined, opts: { settings?: boolean } = { settings: true }) {
  if (!x || typeof x !== "object") return;
  const db = await getDB();
  if (opts.settings !== false && x.settings) await db.put("meta", { key: "user-settings", value: x.settings });
  if (Array.isArray(x.doctors)) {
    const row = await db.get("meta", "doctors");
    const local = ((row?.value as { id: string }[]) ?? []);
    const byId = new Map(local.map((d) => [d.id, d]));
    for (const d of x.doctors as { id: string }[]) if (d?.id) byId.set(d.id, d);
    await db.put("meta", { key: "doctors", value: [...byId.values()] });
  }
  if (Array.isArray(x.customColors) && x.customColors.length) {
    let local: string[] = [];
    try { local = JSON.parse(localStorage.getItem(PALETTE_KEY) || "[]"); } catch {}
    const merged = [...new Set([...x.customColors, ...local])].slice(0, 18);
    try { localStorage.setItem(PALETTE_KEY, JSON.stringify(merged)); } catch {}
  }
  if (x.meta && typeof x.meta === "object") {
    for (const [key, value] of Object.entries(x.meta)) await db.put("meta", { key, value });
  }
}

/** Ask cloud sync to upload the latest extras (no-op when signed out). */
export function scheduleExtrasPush() {
  import("./settings")
    .then(async (s) => {
      const cur = await s.loadSettings();
      const m = await import("./sync");
      await m.pushSettings({ ...cur, updatedAt: Date.now() });
    })
    .catch(() => {});
}
