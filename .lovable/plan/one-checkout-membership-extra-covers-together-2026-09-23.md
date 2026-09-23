# One checkout: membership + extra covers together

Right now, starting a membership charges only the $21.97/month. Any extra covers in the cart are set aside and the buyer is sent to the covers shop afterwards to pay a second time. This fixes that: everything is paid in one checkout, and returning members can still buy more covers any time with a covers-only payment (never a second membership).

## What changes for the buyer

**First purchase**
- One payment screen shows: membership $21.97/month (includes the planner and the cover they picked) plus each extra cover at $5 one-time, with the discount line (10% off 2–5, 20% off 6 or more).
- The card is charged once for membership + covers on day one, then $21.97 every month after. Covers never recur.
- After paying, every cover they bought is unlocked immediately — no second trip to the shop, no "add your extra covers" prompt on the thank-you page.

**Coming back for more covers**
- The Cover & Icon Packs shop stays a simple one-time purchase: pick covers, pay once, unlocked. No membership charge, no change to their renewal date.
- A clear line on that page: "You're a member — covers are a one-time $5 each and won't change your monthly plan."
- Links into the shop from the planner's cover picker and Settings so it's easy to find.

## Technical details

**`supabase/functions/create-checkout/index.ts`**
- In subscription mode, add the extra covers to the same session as one-time line items: `cover_pack_flat` price with `quantity = extras.length`. Stripe bills one-time line items on the first invoice of a subscription session, so the first charge is $21.97 + covers and renewals are $21.97 only.
- Apply the volume discount so it touches covers only: create/reuse the percent-off coupon with `applies_to: { products: [<cover pack product id>] }` (resolved from the expanded `cover_pack_flat` price). Without `applies_to`, the coupon would also discount the membership.
- `grantedPackIds` for a subscription session becomes the chosen cover plus the extras, so the webhook unlocks all of them.
- Coupon IDs change to a scoped form (e.g. `cover_packs_10_off_covers_only`) so the existing unscoped coupons aren't reused with the wrong scope.
- Pack-only sessions (the shop) keep working exactly as today: `mode: "payment"`, flat price × count, discount coupon, no subscription.

**`src/pages/PlannerDetail.tsx`**
- Pass `packIds: extraPackIds` into `openCheckout` alongside `priceId`, and drop the `sessionStorage.pendingPackIds` stash.

**`src/pages/ThankYou.tsx`**
- Remove the pending-covers branch and its `/packs?pre=…` hand-off; confirm all purchased covers are unlocked instead.

**`src/components/cover/CartSummary.tsx`**
- Reword the totals so the first charge is explicit: "Today: $21.97 + $24.00 covers", then "Then $21.97/month". Keep the subtotal/discount/total cover lines.

**`src/pages/Packs.tsx`**
- Keep the one-time flow; add the member-facing note that buying covers doesn't affect the monthly plan. Leave the `pre` param support in place (harmless).

## Verification
- Typecheck and Vitest.
- Test-mode checkout runs: membership alone; membership + 1 cover; membership + 3 covers (10% off covers only, membership full price); membership + 7 covers (20%); and a covers-only purchase from the shop as an existing member.
