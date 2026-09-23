# New pricing: $21.97/month all-in, tiered cover discounts

## What changes for customers

- One plan: **$21.97/month** — the planner, cloud backup, cross-device sync and Google Calendar two-way sync, all included. Cancel anytime.
- The old **$19.97 one-time activation** and the separate **$10/month cloud sync** go away. There is only one thing to buy.
- **Everyone moves to monthly**, including people who already paid the one-time fee: when they open the planner they are asked to subscribe.
- **If the subscription stops, the planner locks.** Their writing, photos and settings are kept safe and come straight back when they resubscribe — nothing is deleted.
- **Extra covers stay one-time purchases** at $5 each, with a discount for buying several at once:
  - 1 cover: $5.00
  - 2-5 covers: 10% off the cart (e.g. 5 covers = $22.50)
  - 6-10 covers: 20% off the cart (e.g. 10 covers = $40.00)
  - More than 10 in one cart: stays at 20% off
- Covers already bought stay owned forever, even if the monthly plan lapses (they just can't open the planner until they resubscribe).

## Where the new price shows up

- Landing page: hero, pricing steps, the cloud-sync section, and the FAQ answers — rewritten around one $21.97/month plan.
- Subscribe page: becomes the single "Start your planner — $21.97/month" page.
- Settings: the billing card shows the one plan, renewal date, and the card-update link.
- Cover shop / pack picker: per-cover $5, running cart total with the discount tier shown ("10% off — 2-5 covers").
- A locked screen for lapsed or never-subscribed accounts: a short explanation, a subscribe button, and reassurance that their data is safe.

## Stripe side

- Create one new subscription product, **Endless Planner — $21.97/month**, in test; it syncs to live on publish. The existing $19.97 and $10/month prices stay in place (untouched) so past records still read correctly, but nothing new points at them.
- Cover packs keep the existing flat $5 price; the discount is applied at checkout as a percentage coupon, so receipts show the discount clearly.

## Technical notes

- `src/data/planners.ts`: `priceUSD` 19.97 → 21.97, `priceId` → the new recurring lookup key (`endless_planner_all_access_monthly`), description rewritten; planner purchase becomes a subscription checkout, so it requires a signed-in user.
- `src/data/coverPacks.ts`: replace the flat helpers with tiered logic — `discountRateForCount(n)` (0 / 0.10 / 0.20), `calcPackTotalUSD` applying it, `getDiscountLabel(n)` returning the tier text. Keep `PACK_PRICE_USD = 5`.
- `supabase/functions/create-checkout/index.ts`: drop the `discounts === undefined` comment/branch and attach a Stripe coupon (`percent_off` 10 or 20, `duration: once`, created/reused per rate) to cover-pack line items; keep subscriptions and one-time cover carts as separate sessions (Stripe can't mix a coupon-discounted one-time item into a subscription session cleanly) — if a cart has both, run the subscription first, then the covers.
- `supabase/functions/payments-webhook/index.ts`: on `checkout.session.completed` / `customer.subscription.*` for the new price, grant the planner unlock row (so `user_planner_unlocks` follows the subscription) and revoke/expire it when the subscription reaches `canceled` / `unpaid`; keep pack grants permanent.
- `src/lib/entitlements.ts` + `src/hooks/useSubscription.ts`: planner access = active subscription (`active`/`trialing`/`past_due`, or `canceled` with a future period end) OR admin OR tester. Offline grace stays at 7 days so a plane trip doesn't lock anyone out.
- Add a `SubscriptionGate` around the planner routes that renders the locked screen instead of the spread when access is false; `past_due` shows a dunning banner rather than a lock.
- `src/lib/sync.ts` keeps gating cloud reconciliation on an active subscription — now the same flag as planner access.
- Copy sweep for "$19.97", "$10/month", "one-time", "Optional cloud sync" across `Landing.tsx`, `Subscribe.tsx`, `Settings.tsx`, `planners.ts`, and the cart/FAQ strings.
- Project memory currently records "packs are $5 each, flat — never add volume discounts"; that rule gets replaced with the new tiered rule.
- Verify with typecheck, Vitest, and a test-mode checkout run for: subscription alone, 1 cover, 3 covers (10%), 7 covers (20%).
