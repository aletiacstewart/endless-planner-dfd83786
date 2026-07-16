
## Overview

Rework the Wellness Journey planner detail page and pricing model:
- Replace the static hero image with a slideshow cycling through all covers
- Change pricing to subscription-based: $19.97 initial + $10/month
- Restructure cover packs: no included cover; every cover is $10, with volume discounts
- Update copy/description throughout
- Add device access / restore-from-cloud install flow tied to subscription

---

## 1. Cover slideshow (hero area)

In `src/pages/PlannerDetail.tsx`, replace the single `<img src={planner.heroImage}>` block with a new `CoverSlideshow` component (`src/components/cover/CoverSlideshow.tsx`):
- Auto-advances every ~3.5s through all `COVERS` from `src/data/covers.ts`
- Uses existing `CoverImage` renderer so the planner name/owner overlays render correctly
- Fade/crossfade transition; pause on hover; dot indicators + prev/next arrows
- Respects `prefers-reduced-motion`

---

## 2. New pricing model

### Planner subscription
- Initial purchase: **$19.97** (one-time activation)
- Then **$10/month** for updates, cloud hosting, backup/restore, and multi-device sync
- Update `src/data/planners.ts`: add `monthlyPriceUSD: 10`, keep `priceUSD: 19.97` as the activation fee, and rewrite `highlights` + `description` to reflect the new model
- Update `PlannerDetail.tsx` CTA + price line: "$19.97 today, then $10/month"
- Landing card price display gets the same treatment

### Cover packs (add-ons)
Rewrite `src/data/coverPacks.ts`:
- Remove `INCLUDED_PACK_IDS` (no free/included cover anymore)
- Flat price: **$10 per pack**
- Volume discount rules applied to the pack subtotal:
  - 1–2 packs: full price
  - 3 packs: 10% off
  - 4 packs: buy 4, cheapest one is free (effectively 5th free is odd wording since 4 = 5th free; interpreting as "pick 4, get one free" → charge for 3)
  - 5 packs: 4 paid + 1 free (same rule extended)
  - 6+ packs: 25% off total
- Expose `calcPackTotalUSD(packIds)` returning the discounted subtotal + a `getDiscountLabel()` helper for UI
- Update `CoverPackSummary` and `CoverPackPicker` copy accordingly ("$10 each · 3+ save 10% · 4 packs = 1 free · 6+ save 25%")

> Clarification needed on "4 they get 5th free": I'll implement it as **buy 4, get the 5th free** (so at 5 packs, pay for 4). Please confirm or correct in the plan feedback.

### Checkout
- `supabase/functions/create-checkout/index.ts`:
  - Switch planner line item to `mode: "subscription"` with a $10/mo recurring price + a one-time $19.97 setup fee via `subscription_data.add_invoice_items` (or a combined session with the setup fee as a separate line)
  - Pack line items stay one-time; replace the two lookup keys (`cover_pack_first`, `cover_pack_additional`) with a single `cover_pack_flat` ($10) and apply the volume discount server-side via a Stripe `coupon`/`discount` created on the fly, or by adjusting quantities and adding a negative-amount line (simplest: compute discounted total client+server, use a one-off coupon)
- Update Stripe product/price setup notes in `docs/ADDING_A_PACK.md`

---

## 3. Download / install for selected cover

- After purchase (existing `/thank-you` flow), surface a **"Download your planner"** button that:
  - Confirms which single cover+icon set was selected (persisted in checkout metadata `selected_cover_id`)
  - Triggers PWA install prompt (existing offline install path) and stores the selected cover in `useUserSettings`
- On `PlannerDetail.tsx`, add a "Selected cover" indicator above the buy box so the user knows which cover will be downloaded (they pick from the slideshow or the cover packs section)
- Cloud restore: leverage existing `initSync()` in `src/lib/sync.ts` — add UI note "Sign in on any device to restore" (no new backend needed; sync already exists)

---

## 4. Copy updates

- `planner.description`: rewrite to mention subscription, cloud backup, multi-device restore, monthly updates
- `planner.highlights`: replace "One-time payment, lifetime access" with "$19.97 to start, $10/month for updates + cloud backup + restore on any device"
- Pack picker header on `PlannerDetail.tsx`: "$10 per pack · 3+ save 10% · buy 4 get 1 free · 6+ save 25%"

---

## Technical details

**Files touched**
- `src/pages/PlannerDetail.tsx` — slideshow, pricing UI, copy
- `src/pages/Landing.tsx` — price display on planner card
- `src/components/cover/CoverSlideshow.tsx` — new
- `src/data/planners.ts` — pricing fields + copy
- `src/data/coverPacks.ts` — new discount tiers, remove included pack
- `src/components/cover/CoverPackPicker.tsx` — updated pricing labels + discount preview
- `supabase/functions/create-checkout/index.ts` — subscription mode + coupon-based discount
- `supabase/functions/payments-webhook/index.ts` — handle `invoice.paid` / `customer.subscription.*` events for the monthly recurring
- `supabase/functions/finalize-purchase/index.ts` — persist `selected_cover_id` from metadata
- `docs/ADDING_A_PACK.md` — updated pricing note

**Stripe products to create** (one-time task after code lands)
- Planner monthly recurring price with `lookup_key: wellness_journey_monthly` ($10/mo)
- Setup fee one-time price `wellness_journey_setup` ($19.97)
- Flat cover pack price `cover_pack_flat` ($10)
- Keep existing `wellness_journey_lifetime` around for legacy purchases but stop using it in new checkouts

---

## Open question

"4 they get 5th free" — confirm interpretation: **buy 4 packs, the 5th is free** (so charge for 4 when 5 are selected). If instead you meant "select 4, one of the 4 is free" (charge for 3), tell me and I'll flip it.
