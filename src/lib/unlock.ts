/**
 * Thin compatibility layer over the server-verified entitlement store.
 *
 * IMPORTANT: nothing here grants access. Every check reads state that was
 * fetched from the database for the signed-in account (see lib/entitlements).
 * Writing to localStorage cannot unlock anything.
 */

import { hasPack, hasPlanner, ownedPackIds, refreshEntitlements } from "./entitlements";

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

export function isUnlocked(plannerId: string): boolean {
  return hasPlanner(plannerId);
}

export function isPackUnlocked(coverId: string): boolean {
  return hasPack(coverId);
}

export function listOwnedPacks(): string[] {
  return ownedPackIds();
}

/** Re-read entitlements from the server (after a purchase or code redemption). */
export async function refreshUnlocks() {
  await refreshEntitlements(true);
}

/** Remove any legacy client-side "unlock" keys left over from older builds. */
export function purgeLegacyUnlockKeys() {
  try {
    const stale: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith("planner-unlock:") || k?.startsWith("cover-pack-unlock:")) stale.push(k);
    }
    stale.forEach((k) => localStorage.removeItem(k));
  } catch {}
}
