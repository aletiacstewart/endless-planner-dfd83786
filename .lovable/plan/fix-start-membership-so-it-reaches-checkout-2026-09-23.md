# Fix "Start membership" so it reaches checkout

## What's wrong
When someone who isn't signed in taps "Start membership", they're sent to sign in (expected), but afterwards they land on the planner or home page instead of back at checkout. The sign-in page only looks for a return address in the web address (`?next=`), while the planner and Subscribe pages hand it over a different way that gets ignored (and is lost entirely with Google sign-in). Their chosen cover and extra covers are also forgotten.

## Fix
1. Planner page and Subscribe page send people to `/auth?next=...` so the return address survives email-code and Google sign-in.
2. Before leaving for sign-in, the planner page saves the chosen cover and extra covers for this visit.
3. On return (signed in), the planner page restores the selection and opens checkout straight away, then clears the saved selection.
4. Subscribe page opens checkout automatically when returning with `?checkout=1`.
5. Signed-in visitors keep the current behavior: checkout opens immediately.

## Check
Sign out, pick a cover + 2 extras, tap Start membership, sign in, confirm checkout opens with the right total. Repeat from the Subscribe page.

## Technical details
- `PlannerDetail.tsx` `buy()`: `sessionStorage.pendingCheckout = {plannerId, includedCoverId, extraPackIds}`; `navigate('/auth?next=' + encodeURIComponent('/planner/'+id+'?checkout=1'))`. Effect: when `user` and `checkout=1`, hydrate state and call `buy()`.
- `Subscribe.tsx`: redirect to `/auth?next=%2Fsubscribe%3Fcheckout%3D1`; auto-call `subscribe()` when param present and not active.
- `Auth.tsx`: also accept `location.state.next` as fallback; ensure Google OAuth redirect preserves `next` (store in sessionStorage before redirect).
