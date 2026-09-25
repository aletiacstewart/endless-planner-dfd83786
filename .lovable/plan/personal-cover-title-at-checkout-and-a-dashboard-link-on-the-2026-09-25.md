# Personal cover title at checkout, and a dashboard link on the cover

## 1. New customers never see your details on their cover
- When a different account signs in, the planner title and name are cleared. New accounts start with an empty title and name, not the ones saved on this device.
- The cover shows "My Planner" and no name until the customer sets their own.

## 2. Customize the cover at checkout
- The checkout box gets two optional fields above Start membership:
  - **Cover title** (for example "Sarah's Wellness Planner")
  - **Your name**
- A small live preview on the selected cover shows the text as they type.
- The values are saved to the new customer's account. The first time they open their planner, the cover already shows their title and name.
- Signed-in customers who check out get the same fields, and their settings are updated.
- Both fields can still be changed later in Settings.

## 3. Dashboard link on your cover
- On the opening cover screen, right below "Swipe or tap to open", a small "Owner dashboard" link appears. It only shows for your admin account and opens the owner dashboard.

## Technical details
- `PlannerDetail.tsx` / `CartSummary.tsx` gain `coverTitle` and `ownerName` inputs (max 60 chars).
- On `signUp`, both values go into `options.data` (`planner_name`, `owner_name`). They are also stashed in `sessionStorage.pendingCoverText` for the signed-in path.
- After the first sign-in, the settings bootstrap in `useUserSettings` / `sync.ts` fills them in when the cloud `user_settings` row is empty. The values come from `user.user_metadata` or the pending stash.
- The per-account settings switch in `sync.ts` resets `plannerName`/`ownerName` to defaults for a new account instead of carrying over local values.
- `SplashScreen.tsx`: under the hint, render the link when `useEntitlements().admin`. It uses `stopPropagation` so tapping it doesn't open the planner, then navigates to `/admin/dashboard`.
