import { INCLUDED_PACK_IDS } from "@/data/coverPacks";

const KEY = (plannerId: string) => `planner-unlock:${plannerId}`;
const PACK_KEY = (coverId: string) => `cover-pack-unlock:${coverId}`;
const DEVICE_KEY = "planner-device-id";

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "anonymous-device";
  }
}

export function setUnlocked(plannerId: string, code: string) {
  try { localStorage.setItem(KEY(plannerId), code); } catch {}
  import("./sync").then((m) => m.pushPlannerUnlock(plannerId, code)).catch(() => {});
}

export function isUnlocked(plannerId: string): boolean {
  try { return Boolean(localStorage.getItem(KEY(plannerId))); }
  catch { return false; }
}

export function clearUnlock(plannerId: string) {
  try { localStorage.removeItem(KEY(plannerId)); } catch {}
}

// ----- Cover & icon packs -----

export function setPackUnlocked(coverId: string, code: string) {
  try { localStorage.setItem(PACK_KEY(coverId), code); } catch {}
  import("./sync").then((m) => m.pushPackUnlock(coverId, code)).catch(() => {});
}

export function isPackUnlocked(coverId: string): boolean {
  if ((INCLUDED_PACK_IDS as readonly string[]).includes(coverId)) return true;
  try { return Boolean(localStorage.getItem(PACK_KEY(coverId))); }
  catch { return false; }
}

export function listOwnedPacks(): string[] {
  const owned = new Set<string>(INCLUDED_PACK_IDS as readonly string[]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("cover-pack-unlock:")) {
        owned.add(k.slice("cover-pack-unlock:".length));
      }
    }
  } catch {}
  return Array.from(owned);
}
