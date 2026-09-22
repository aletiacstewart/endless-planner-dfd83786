# Admin access to all covers and icon sets + centred book cover

## 1. Admin should never be asked to pay

Your account does hold the admin role, and admin already unlocks covers inside the planner. The shop page (Covers & icon packs) was deliberately built to ignore admin status so the catalogue and prices stay testable — that is why every card still shows "Add · $5.00" and a checkout bar appears.

Change it so the shop reflects admin access:

- Each cover card shows "Included · admin" instead of "Add · $5.00", and cannot be added to the cart.
- If a card is somehow selected, the checkout bar stays hidden for admins (nothing to pay for).
- A short line at the top of the shop says all covers and their matching page-icon sets are unlocked on this account.
- Keep a small "Preview prices" toggle so you can still see the normal $5.00 buyer view for testing.

Also audit the places that still gate on purchase history rather than access, so an admin can select any cover, its page icons, sticker set and library set during setup, cover switching, and from Settings.

## 2. Centre the book cover

The opening cover is taller than many screens, so it sits off-centre and needs scrolling.

- Limit the cover height to the visible screen (with a little breathing room) and keep the 2:3 book shape, so it is always fully visible.
- Centre it horizontally and vertically, with the "Open planner" button and hint directly beneath it.
- Check it on a phone-sized screen, a laptop, and a short window.

## Technical notes

- `src/lib/entitlements.ts`: keep `hasPack`/`ownedPackIds` admin-aware; expose admin state to the shop.
- `src/pages/Packs.tsx`: replace `isPackPurchased` gating with an admin-aware check plus a local `previewPrices` toggle; suppress the sticky checkout panel when admin and not previewing.
- `src/components/cover/CoverCard.tsx`, `CoverPackPicker.tsx`, `CoverPicker.tsx`, `CoverIconPreviewDialog.tsx`: use `isPackUnlocked` (admin-aware) for lock state; `CoverPackPicker` should not offer already-accessible packs as paid add-ons.
- `src/components/SplashScreen.tsx`: cover sizing becomes `h-[min(78vh,calc(100vw*1.5))]`-style clamp with `aspect-[2/3]`, wrapper `min-h-screen flex items-center justify-center`.
- Verify with the test browser at desktop and mobile widths; run typecheck and tests.
