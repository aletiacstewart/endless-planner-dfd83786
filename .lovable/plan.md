## Goal

Turn the planner page into a creative shopping cart. The $19.97 one-time activation **includes 1 cover of the buyer's choice** (and its matching icon set). Every additional cover is a $10 one-time add-on with its own preview and "Add to cart" button. A sticky cart summary sits alongside the grid and totals the order in real time. The monthly subscription is removed.

## Pricing model (agreed)

- Planner activation: **$19.97 one-time**, includes **1 cover + icon set of the buyer's choice**.
- Each additional cover + matching icon set: **$10 one-time**.
- Volume discounts apply to the **extra** covers only (the included cover is not counted):
  - 3+ extras: 10% off extras subtotal
  - Exactly 5 extras: 5th extra free
  - 6+ extras: 25% off extras subtotal
- Monthly $10 subscription: **removed** from checkout, UI, and data.

## Page layout — PlannerDetail

```text
+-------------------------------------------------------------+
| Header: Endless Planner              All planners           |
+-------------------------------------------------------------+
| Planner name + tagline + highlights                         |
| "Your activation includes 1 cover. Add more for $10 each."  |
+---------------------------------+---------------------------+
| Cover grid (2 / 3 / 4 columns)  |  Sticky cart summary      |
|  [cover card] [cover card] ...  |  - Activation   $19.97    |
|   preview                       |    (incl. cover: <name>)  |
|   name                          |  - Extra: name   $10.00 x |
|   icon strip                    |  - Extra: name   $10.00 x |
|   [Included] / [Add $10] /      |  - Discount    -$x.xx     |
|   [Make this the included one]  |  Total          $xx.xx    |
|                                 |  email input              |
|                                 |  [Checkout]               |
+---------------------------------+---------------------------+
| What's inside (existing page list)                          |
+-------------------------------------------------------------+
```

- Each `CoverCard` shows one of three states:
  - **Included** (this is the free-with-activation cover) — outlined/primary badge, button reads "Included with activation" and is disabled.
  - **In cart as extra** — button reads "Remove ($10)".
  - **Not selected** — buttons: primary "Add for $10", secondary link "Make this the included one" (swaps this cover into the included slot; the previously included cover, if it was pinned, moves out of the cart entirely).
- The included cover always exists — one is auto-selected on load (first cover) so activation is fulfillable.
- Sidebar is `sticky top-6` on `md+`; on mobile it collapses to a bottom bar showing total + Checkout.

## Files touched

### New

- `src/components/cover/CoverCard.tsx` — product tile: preview + name + icon strip + state-aware button(s) + "Included" badge.
- `src/components/cover/CartSummary.tsx` — activation row (with included cover name), one row per extra, discount row, total, email input, Checkout button. Uses `calcPackTotalUSD` for the extras subtotal.

### Modified

- `src/pages/PlannerDetail.tsx`
  - Remove `CoverSlideshow`, `CoverSelect`, hero `CoverIconStrip`, and the separate "Add more covers" section.
  - State: `includedCoverId` (defaults to `COVERS[0].id`), `extraPackIds: string[]` (excludes `includedCoverId`).
  - Render responsive grid of `CoverCard`s over all `COVERS`, wired to those two state pieces.
  - `CartSummary` in a sticky column receives `includedCoverId`, `extraPackIds`, `email`, `onCheckout`.
  - `buy()` sends `priceId: planner.priceId` (activation), `packIds: extraPackIds`, `plannerId`, `selectedCoverId: includedCoverId`, `customerEmail`. No `monthlyPriceId`.
- `src/components/cover/CoverPackPicker.tsx` — delete (replaced by grid of `CoverCard`s). Drop the `CoverPackSummary` export too.
- `src/data/planners.ts` — drop `monthlyPriceId` / `monthlyPriceUSD` fields. `priceId` remains the activation lookup key; `priceUSD` stays at 19.97.
- `src/data/coverPacks.ts` — `calcPackTotalUSD` unchanged; add a small `calcPackDiscountLabel(n)` helper for the cart's discount row.

### Stripe / backend

- `supabase/functions/create-checkout/index.ts`
  - Always `mode: "payment"`; remove the `monthlyPriceId` / subscription branch.
  - Line items: activation price (`planner.priceId`) + `cover_pack_flat` × count of **extras** (the included cover is not billed).
  - Volume-discount coupon logic unchanged, applied to the extras only.
  - Metadata: `planner_id`, `includes_planner: "true"`, `pack_ids: <extras>`, `selected_cover_id: <includedCoverId>`.
- `supabase/functions/payments-webhook/index.ts`
  - Fulfillment unchanged in shape. The planner purchase row is written as today; the included cover is tracked via existing `selected_cover_id` metadata (already read in webhook and stored). Extras continue to write to `pack_purchases`.
- No product/price changes in Stripe. Existing activation price + `cover_pack_flat` cover this model.

### Content copy

- Landing planner card and PlannerDetail hero: "One-time $19.97 activation includes 1 cover of your choice. Add more for $10 each — 3+ save 10%, 5th free, 6+ save 25%."
- Discount row in cart: existing tiered labels.
- Checkout button: `Checkout — $YY.YY` (disabled until email valid; activation + included cover mean the cart is never truly empty).

## Behaviour details

- On load, the first cover is auto-marked as included; user can promote any other cover with "Make this the included one".
- Promoting a new included cover: the previously included cover reverts to "Not selected" (not auto-added as an extra).
- If a cover is currently an extra and the user promotes it, it leaves the extras list.
- Discounts recompute live from `extraPackIds.length`.
- `AdminPlanner` bypass still opens the planner without purchase.

## Out of scope

- Schema changes for `purchases` / `pack_purchases`.
- Personalization, entry, or sync system changes.
- Bringing back a monthly subscription (can be added later as a separate optional line item).

## Technical notes

- Volume discounts remain computed **server-side** in `create-checkout` via an on-the-fly Stripe coupon; the client shows an estimate.
- `includedCoverId` and `extraPackIds` are the cart's single source of truth. Invariant enforced in state setters: `includedCoverId ∉ extraPackIds`.
- Mobile bottom bar uses `fixed bottom-0` with safe-area padding; hidden on `md+`.
