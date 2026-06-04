## Goal

Let people install the planner on any device, sign in, and see their entries, settings, cover, and unlocked packs everywhere — while still working offline.

## Approach

Keep the current local-first IndexedDB store as the source of truth on each device, and add a thin cloud layer that mirrors it. When signed in and online, changes push up and pull down in the background. Offline edits queue and sync on reconnect. Last-write-wins per entry, using the `updatedAt` timestamp already on every entry.

## User-facing flow

1. After unlock, a one-time prompt: "Sync across your devices?" with **Sign in with Google** or **Continue with email**.
2. Email path uses a 6-digit code sent to the user's email (no password to remember, no separate `/reset-password` page needed). Google path uses Lovable Cloud's managed Google sign-in.
3. Account menu lives in Settings: shows email, "Last synced 2 min ago", **Sign out**, **Sync now**.
4. On a new device: install → unlock with their code (existing flow) → sign in → entries, settings, cover, and packs appear within a few seconds.
5. Offline: app works exactly as today. A small "Offline – changes will sync" pill appears in the header. On reconnect, queued changes flush automatically.

## What syncs

- All planner entries (the `entries` IndexedDB store)
- User settings (planner name, owner name, selected cover, onboarded flag)
- Unlocked cover/icon packs (so paid packs follow the account, not just the device)
- The primary planner unlock itself (so a fresh install only needs sign-in, not re-entering the unlock code)

## Conflict handling

- Per-entry last-write-wins by `updatedAt`.
- Deletes are soft (a `deleted_at` column) so a delete on phone propagates to laptop even if laptop edited the same entry earlier.
- Settings are a single row keyed by user — last write wins.

## Technical details

**Auth**
- Enable Email + Google via `supabase--configure_social_auth` and `configure_auth` (no anonymous sign-ups, no auto-confirm).
- Use the existing `lovable.auth` client. Add a small `useAuth()` hook and an `AccountGate` shown after `RequireUnlock`.

**Database (single migration)**
- `profiles(user_id pk → auth.users, email, created_at, updated_at)` — auto-created by trigger on signup.
- `planner_entries(id pk, user_id, page_type, title, values jsonb, created_at, updated_at, deleted_at)` — `id` is the existing client-generated ID so local and cloud rows match.
- `user_settings(user_id pk, planner_name, owner_name, cover_id, onboarded, updated_at)`.
- `user_packs(user_id, pack_id, unlocked_at, pk(user_id, pack_id))`.
- `user_planner_unlocks(user_id, planner_id, unlock_code, pk(user_id, planner_id))`.
- RLS on every table: each user reads/writes only `auth.uid() = user_id`. GRANTs in same migration.
- Enable Realtime on `planner_entries` and `user_settings` so a second device updates live.

**Sync engine (`src/lib/sync.ts`)**
- On sign-in: initial reconcile — pull all server rows, merge by `updatedAt`, push anything newer locally.
- Ongoing: subscribe to `auth.onAuthStateChange` + `postgres_changes`. Wrap `saveEntry` / `deleteEntry` / `saveSettings` so every local write also enqueues a cloud upsert.
- Outbox: a small IndexedDB store `sync_queue` holds pending ops while offline; a `navigator.onLine` listener drains it.
- `useAutoSave` keeps its current local save; it just gains a `queueCloudSync(entry)` call after `saveEntry`.

**Existing code touched**
- `src/App.tsx`: add `<AccountGate>` and a `/auth` route.
- `src/lib/db.ts`: add `deletedAt`, expose change events.
- `src/lib/settings.ts`, `src/lib/unlock.ts`: wrap writes to also push to cloud when signed in.
- `src/pages/Settings.tsx`: account section + sync status.
- `src/hooks/useAutoSave.ts`: hook in cloud queue.

**Offline & PWA**
- No changes to existing service-worker setup beyond making sure `/auth` and Supabase auth callbacks bypass the SW navigation fallback.

## Out of scope

- Multi-user shared planners (only one account per planner).
- Selective sync / per-section sync toggles.
- Real-time collaborative editing (it's mirror sync, not OT/CRDT).

## Open question

The unlock code currently authorizes a device. With accounts, do you want sign-in to **replace** the unlock-code step entirely on new devices (smoother), or **keep both** (sign-in + unlock code, more secure against account sharing)? Default in this plan: sign-in replaces it, since the purchase email is the same identity.
