# Two free-access tester accounts

## Goal
RyeLee Lang (ryelee.lang1@gmail.com) and Kelly Smith (mint4yu@yahoo.com) get every planner, cover, matching page-icon set, sticker set and library image without paying — but none of the owner/admin tools.

## What gets built

1. A new account type called **tester**, stored in the protected account-role table (same secure place admin lives — not editable from the browser).
2. Both accounts created with the emails and passwords you gave, already confirmed so they can sign in immediately.
3. Testers unlock everything inside the planner: all planners, all covers, all page icons, stickers, library art. The Packs shop shows "Included · tester" instead of a price, and no checkout appears for them.
4. Testers are **not** admin: the owner-only admin planner page and any admin-only tooling stay closed to them.
5. Sign-in with a password is added alongside the existing "Continue with Google" and email-code options, since the accounts use passwords. Everyone else keeps using whichever option they prefer.

## Verification
- Sign in as each tester: open the planner, switch covers freely, confirm themed page icons, stickers and library art all work with no payment prompt.
- Confirm the Packs page shows the tester banner and no checkout bar.
- Confirm the admin-only planner page rejects both tester accounts.
- Confirm a normal account still sees paid covers locked at $5.

## Technical notes
- Add `tester` to the `app_role` enum; insert one `user_roles` row per new user. RLS unchanged (self-read only).
- Create the two auth users via a one-time service-role edge function using the admin API (email confirmed, password set), then grant the role; delete/lock the function after use.
- `entitlements.ts`: add `tester: boolean` to state (from `user_roles`), derive `fullAccess = admin || tester`, and use `fullAccess` in `hasPlanner`, `hasPack`, `ownedPackIds`. Keep `hasPurchasedPack` purchase-only so the shop catalogue still renders. Expose `isAdmin()` unchanged for admin-only gates; add `hasFullAccess()`.
- `useEntitlements`, `CoverPackPicker` (`adminAll` → `fullAccess`), and `Packs.tsx` banner/labels updated to the new flag with tester wording. `AdminPlanner.tsx` keeps checking `admin` only.
- Enable email+password auth on the backend and add a password mode to `Auth.tsx` (`signInWithPassword`).
