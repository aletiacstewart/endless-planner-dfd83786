/**
 * Entitlements — the single source of truth for "what has this account paid for".
 *
 * Rules:
 *  - The server owns entitlement rows (`user_planner_unlocks`, `user_packs`).
 *    They are written ONLY by service-role code (Stripe webhook / redeem-code
 *    edge function). The browser has SELECT-only access.
 *  - localStorage is a *cache* so the app works offline, never a grant.
 *    A cache entry is bound to the user id it was fetched for and expires after
 *    a 7-day offline grace period.
 */

import { supabase } from "@/integrations/supabase/client";
import { INCLUDED_PACK_IDS } from "@/data/coverPacks";

const CACHE_KEY = "entitlements:v2";
const GRACE_MS = 7 * 24 * 60 * 60 * 1000;

export interface EntitlementState {
  userId: string | null;
  planners: string[];
  packs: string[];
  admin: boolean;
  /** When the state was last confirmed by the server. */
  verifiedAt: number;
  /** True once we've attempted at least one resolution this session. */
  resolved: boolean;
  /** Cached data being served while offline / server unreachable. */
  stale: boolean;
}

const EMPTY: EntitlementState = {
  userId: null,
  planners: [],
  packs: [],
  admin: false,
  verifiedAt: 0,
  resolved: false,
  stale: false,
};

let state: EntitlementState = { ...EMPTY, ...readCache() };

type Listener = (s: EntitlementState) => void;
const listeners = new Set<Listener>();

function readCache(): Partial<EntitlementState> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as EntitlementState;
    if (!parsed || typeof parsed !== "object") return {};
    if (Date.now() - (parsed.verifiedAt ?? 0) > GRACE_MS) return {};
    return {
      userId: parsed.userId ?? null,
      planners: Array.isArray(parsed.planners) ? parsed.planners : [],
      packs: Array.isArray(parsed.packs) ? parsed.packs : [],
      admin: Boolean(parsed.admin),
      verifiedAt: parsed.verifiedAt ?? 0,
      stale: true,
    };
  } catch {
    return {};
  }
}

function writeCache(s: EntitlementState) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        userId: s.userId,
        planners: s.planners,
        packs: s.packs,
        admin: s.admin,
        verifiedAt: s.verifiedAt,
      }),
    );
  } catch {}
}

function setState(next: EntitlementState) {
  state = next;
  listeners.forEach((l) => l(state));
}

export function getEntitlements(): EntitlementState {
  return state;
}

export function subscribeEntitlements(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function clearEntitlements() {
  try { localStorage.removeItem(CACHE_KEY); } catch {}
  setState({ ...EMPTY, resolved: true });
}

let inFlight: Promise<EntitlementState> | null = null;

/** Fetch entitlements for the currently signed-in account. */
export async function refreshEntitlements(force = false): Promise<EntitlementState> {
  if (inFlight && !force) return inFlight;
  inFlight = (async () => {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user?.id ?? null;

    if (!userId) {
      // Signed out: no entitlements, and drop any cache from a previous account.
      clearEntitlements();
      inFlight = null;
      return state;
    }

    // A cache belonging to a different account must never leak across users.
    if (state.userId && state.userId !== userId) clearEntitlements();

    try {
      // Link any purchases made with this email before the account existed.
      try { await supabase.rpc("link_user_purchases"); } catch {}

      const [planners, packs, roles] = await Promise.all([
        supabase.from("user_planner_unlocks").select("planner_id").eq("user_id", userId),
        supabase.from("user_packs").select("pack_id").eq("user_id", userId),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (planners.error || packs.error) throw planners.error ?? packs.error;

      const next: EntitlementState = {
        userId,
        planners: (planners.data ?? []).map((r) => r.planner_id),
        packs: (packs.data ?? []).map((r) => r.pack_id),
        admin: (roles.data ?? []).some((r) => r.role === "admin"),
        verifiedAt: Date.now(),
        resolved: true,
        stale: false,
      };
      setState(next);
      writeCache(next);
    } catch {
      // Offline / server unreachable: serve the cache if it's within grace and
      // belongs to this user; otherwise fail closed.
      const usable =
        state.userId === userId && Date.now() - state.verifiedAt <= GRACE_MS && state.verifiedAt > 0;
      setState(
        usable
          ? { ...state, resolved: true, stale: true }
          : { ...EMPTY, userId, resolved: true },
      );
    }
    inFlight = null;
    return state;
  })();
  return inFlight;
}

// ---------- synchronous reads (from verified state only) ----------

export function hasPlanner(plannerId: string): boolean {
  if (state.admin) return true;
  return state.planners.includes(plannerId);
}

export function hasPack(packId: string): boolean {
  if ((INCLUDED_PACK_IDS as readonly string[]).includes(packId)) return true;
  if (state.admin) return true;
  return state.packs.includes(packId);
}

export function ownedPackIds(): string[] {
  const owned = new Set<string>(INCLUDED_PACK_IDS as readonly string[]);
  state.packs.forEach((p) => owned.add(p));
  return Array.from(owned);
}

export function isAdmin(): boolean {
  return state.admin;
}

// Keep entitlements in step with auth.
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) clearEntitlements();
  else void refreshEntitlements(true);
});
