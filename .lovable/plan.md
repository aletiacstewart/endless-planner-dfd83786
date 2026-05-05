## Finish Cover Pack rollout — Steps 1–4

Complete the remaining work from the paid Cover & Icon packs feature.

### 1. Lock badges in Settings CoverPicker
- Update `src/components/cover/CoverPicker.tsx` (or wherever the in-app cover switcher lives) to:
  - Read pack ownership via `isPackUnlocked(packId)` from `src/lib/unlock.ts`.
  - Show a lock icon + price badge on covers belonging to unowned packs.
  - On tap of a locked cover: show a small sheet/dialog with "Unlock this cover pack" CTA → routes to `/packs?focus=<packId>`.
  - Owned/free covers behave as today (instant switch).

### 2. "✨ Try a new cover" prompt on Home
- Add a dismissible chip/banner in `src/pages/Home.tsx`:
  - Only render when planner is unlocked AND user owns ≥1 pack OR there are unowned packs available.
  - Copy: "✨ Try a new cover" → links to Settings → Cover & Theme (or `/packs` if none owned yet).
  - Dismissal stored in `localStorage` (`home.coverNudge.dismissed`), with a soft re-show after 30 days.

### 3. Register `cover_pack` Stripe product
- Use `payments--create_product` to register one product `cover_pack` with two lookup-key prices:
  - `cover_pack_first` → $4.99 one-time
  - `cover_pack_additional` → $2.99 one-time
- Update `supabase/functions/create-checkout/index.ts` to use these lookup keys via `price_data` override OR direct price lookup, keeping the existing $4.99 / $2.99 dynamic logic.
- Benefit: clean Stripe dashboard reporting by product.

### 4. Visual QA
- After webhook redeploys:
  - Walk Planner Detail → select 2 packs → verify total = $4.99 + $2.99 = $7.98.
  - Test checkout with card `4242 4242 4242 4242` in sandbox.
  - Confirm unlock email arrives, code redeems, locked covers in Settings unlock, icons swap on pages.
  - Verify Home nudge appears + dismisses correctly.

### Files to touch
- `src/components/cover/CoverPicker.tsx` (lock UI)
- `src/pages/Home.tsx` (nudge)
- `src/pages/Packs.tsx` (handle `?focus=` query param scroll)
- `supabase/functions/create-checkout/index.ts` (use lookup keys)
- New: `src/components/home/CoverNudge.tsx`

### Out of scope
- No new pack content (still only Forget-Me-Nots free + existing covers as paid).
- No refund / restore-purchase flow changes.
