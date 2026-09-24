# Create account inside checkout

## What changes for the customer
1. On the planner page, a visitor who isn't signed in sees a short **"Create your account"** box in the cart: email, password, confirm password. (Signed-in visitors skip this box.)
2. Tapping **Start membership** creates their account and opens payment straight away. They don't go to a separate sign-in page first.
3. After paying, the thank-you page says: "Check your email and tap the link to activate your account."
4. The activation email link signs them in and opens their planner, with their membership and covers already unlocked.
5. After that they sign in with the same email and password they chose at checkout ("Sign in with a password").
6. If the email already has an account, the box says so and offers "Sign in instead". Their cover picks are kept.

## Check
Start logged out, pick a cover + extras, fill in the account box, and pay with a test card. Then confirm the thank-you message, confirm the activation link opens the planner, and sign in again with the password.

## Technical details
- `CartSummary.tsx`: optional account fields (email, password ≥8, confirm) shown when `!user`; validation errors inline.
- `PlannerDetail.tsx` `buy()`: if no user → `supabase.auth.signUp({ email, password, options: { emailRedirectTo: origin + '/auth?next=/app' } })`. Use `data.user.id` (confirmation pending, no session) as `userId` for `openCheckout`. If `data.user.identities` is empty, the email already exists, so show "Sign in instead" (existing `/auth?next=` flow with the saved selection). Remove the forced redirect to /auth.
- `create-checkout` already attaches the Stripe customer and metadata to `userId`. The webhook grants the planner and packs by userId, and `link_user_purchases` also backfills by email on first sign-in.
- `ThankYou.tsx`: when `sub=1` and there is no session, show the "check your email to activate" state. When signed in, keep the current "open my planner" state.
- `Auth.tsx`: already honours `?next=/app` after the email link, so the customer lands in the planner.
- Make sure email/password sign-in is on (idempotent), and leave auto-confirm off so the activation email is sent.
- Subscribe page: same inline account fields for logged-out visitors, instead of redirecting.
