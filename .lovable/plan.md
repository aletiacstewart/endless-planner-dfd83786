## Priority 0 — Close the payment bypass (ships first)

Confirmed today: `isUnlocked()` / `isPackUnlocked()` in `src/lib/unlock.ts` read only `localStorage`, `RequireUnlock` in `src/App.tsx` trusts that, and `src/pages/AdminPlanner.tsx` contains the literal key `let-me-in-2026`. `purchases` and `pack_purchases` are keyed by `email` + `unlock_code` with no `user_id`, so nothing today ties a purchase to a logged-in account.

Chosen model: **sign-in required to open the planner**, with a **7-day offline grace period**.

Database work (one migration):
- Add `user_id` to `purchases` and `pack_purchases`, backfilled by the existing `link_user_purchases` routine (matches purchase email to the signed-in account); run linking automatically on every sign-in.
- New `entitlements` view/table read path so a signed-in user can read only their own rows (row-level security scoped to `auth.uid()`), with grants for `authenticated` and `service_role`. No anonymous read.
- New `app_role` enum + `user_roles` table + `has_role()` security-definer function. Roles live in their own table, never on profiles.

Backend:
- New `verify-entitlements` edge function: reads the caller's session from the bearer token (never from request body), returns the planner IDs and pack IDs that account actually owns, plus an admin flag from `has_role`. Redeeming a code becomes a server action that links the code to the caller's `user_id`.
- Audit `validate-unlock`, `finalize-purchase`, `payments-webhook`, `resend-unlock-code`, and `src/lib/sync.ts` so all unlock/purchase writes happen server-side only.

Frontend:
- `src/lib/unlock.ts` becomes a cache in front of the server: it stores the last verified entitlement set with a timestamp; `localStorage` is never the source of truth. Cache older than 7 days without a successful re-verify → locked.
- `RequireUnlock` awaits auth + entitlement fetch, shows a loading state, redirects unauthenticated users to `/auth`, and purchasers-without-account to a "sign in with your purchase email" flow.
- All pack gates (`CoverPicker`, `CoverCard`, `CoverPackPicker`, `CoverIconPreviewDialog`, `Packs`) read from the same verified entitlement store.
- `AdminPlanner.tsx` loses the hardcoded key; it renders only for accounts with the `admin` role, and it grants preview access in the UI without inventing fake purchase rows.

Plain-language answer after this ships: **No.** Editing `localStorage` or calling client functions cannot grant access — the cache is validated against server-owned records on every load and the gate fails closed.

## Priority 1 — Themed page icons in planner navigation

`src/components/planner/SideTabs.tsx` renders generic Lucide icons. Update both the desktop rail and mobile strip to resolve the active cover's icon via `getCoverIconPack(settings.coverId)` (same source `CoverIconStrip` uses), render at ~22px, keep active/inactive styling, and fall back to Lucide only when that cover's pack lacks that page. Icons for the active cover get preloaded once on mount; images use `loading="eager"` for tabs, `decoding="async"`.

## Priority 2 — Sticker tray, layering, snapping

- `StickerLibraryDialog` becomes a persistent side tray that stays open across placements, with a "Recently used" row (last ~12, persisted per user).
- `Sticker` in `src/lib/entryMeta.ts` gains `z`; the floating toolbar in `StickerLayer.tsx` gains Bring-to-front / Send-to-back; render order sorts by `z`.
- Drag shows soft magnetic guides at page center lines and at other stickers' centers (~1.5% pull, draggable past it).
- Two-finger pinch resizes the selected sticker on touch, alongside the existing +/− buttons.

## Priority 3 — Custom colors and saved palette

- Each color popover in `EntryPersonalization.tsx` keeps the 6 themed swatches and adds "Custom…" opening a hue/sat/light picker with hex and HSL input.
- Saved colors persist per user alongside settings and appear as swatches on every page.
- Everything stays in the `"H S% L%"` token format via the existing `toCss()` helper — no raw hex reaches components.

## Priority 4 — Page thumbnails and undo/redo

- Collapsible thumbnail rail on `src/pages/Entry.tsx` listing every entry of the current page type, click to jump, with drag-to-reorder backed by an `order` field added to entries in `src/lib/db.ts` (defaults preserve current ordering).
- In-memory undo/redo stack (last 20 `EntryMeta` patches) with buttons plus Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z, keeping "Reset all" as a separate action.

## Technical notes

- Sequenced: Priority 0 lands and is verified (signed-in fetch shows only that account's entitlements; a forged `localStorage` entry does not unlock) before Priorities 1–4.
- The migration requires approval before the dependent frontend code is written, so P0 arrives in two steps.
- Existing customers who bought without an account keep access by signing in with the purchase email or re-entering their unlock code once while signed in.
- Sticker `z` and the new entry `order` field are optional and backward-compatible with existing stored entries.
