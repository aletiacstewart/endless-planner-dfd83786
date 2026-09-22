# Stripe checkout health check

## What I found

Payment plumbing is in place and wired to the three things you sell:

- One-time setup, $19.97 — Planner detail page, price `wellness_journey_setup`
- Cloud backup & sync, $10/month — Subscribe page, price `endless_planner_cloud_monthly`
- Extra cover/icon packs, $5 each flat — Packs page and Planner detail add-ons, price `cover_pack_flat` with quantity = number of packs (no discounts)

Checkout runs inside the page (no redirect), creates/reuses a Stripe customer tied to your user, and after payment the app issues an unlock code and records the purchase.

Two real problems:

1. **Your Stripe account is still on test mode.** Step 1 of go-live ("connect your sandbox to a Stripe account") is still open, so nothing can take real money yet. Every payment in preview is a test payment.
2. **The published site has no payment key.** Only the test key file exists. Once you go live, the published app would try live checkout with no live key and fail with a confusing server error instead of a clear message.

## What I'll do

1. Run a live-fire test of all three purchase paths in test mode and confirm the three prices actually exist in your Stripe catalog: the $19.97 setup, the $10/month subscription, and packs at $5 each with the right quantity and total. If any price is missing, create it.
2. Verify the after-payment flow: purchase is recorded, unlock code is issued and emailed, subscription shows as active on the account, and the manage-billing link opens.
3. Make the missing-key case fail clearly: instead of silently assuming live mode, the app will say "payments aren't set up for this build yet" and the test-mode notice will stay accurate.
4. Report back a short pass/fail list for each of the three purchases, plus exactly what you still need to do in Stripe to accept real money.

## Technical notes

- `create-checkout` uses `ui_mode: "embedded_page"`, resolves prices by `lookup_keys`, and stamps `planner_id`, `pack_ids`, `selected_cover_id`, `userId` into session and subscription metadata.
- `src/lib/stripe.ts` currently derives env as `pk_test_` prefix → sandbox, else live — including when the token is absent. Change to derive from prefix and throw on missing/unknown so production surfaces a go-live message.
- No `.env.production` exists; that file is written automatically when Stripe go-live provisions live keys, so this is expected until go-live finishes.
- Verification via a Playwright pass on `/planner/...`, `/packs`, `/subscribe` with Stripe test card `4242 4242 4242 4242`, plus edge-function logs for `create-checkout`, `payments-webhook`, `finalize-purchase`.

## You need to do this part

Go-live steps 1-3 happen inside Stripe and only you can complete them (claim the account, submit the go-live form, install the Lovable app on the live account).

<presentation-actions><presentation-open-payments>Go to payments</presentation-open-payments></presentation-actions>
