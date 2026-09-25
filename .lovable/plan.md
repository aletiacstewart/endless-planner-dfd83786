# Fix the Complete Tracker page loading slowly or staying blank

## What's happening
On your screen, the Complete Tracker opens its header, style buttons and day thumbnails. The page body underneath stays empty. The cause isn't confirmed yet. My signed-out test only reached the sign-in screen, so step 1 is to reproduce it on your own account.

## Steps
1. **Reproduce it on your account.** Open your real Day 1 and Day 2 of the Complete Tracker in a test browser signed in as you. Record how long the body takes to appear, any errors, and what the page is busy doing while it's blank.
2. **Find the exact hold-up.** Check the likely suspects in order and confirm which one it is:
   - The page waits on the linked-page update (the ~19 connected pages such as fitness, meals, budget and journal) before it shows anything.
   - The cloud sync reloads the page again and again while it opens (a refresh loop from the account-switch change).
   - One of the heavy sections (the month calendar, water grid, medication list or journal photo) gets stuck or errors, which blanks the rest of the page.
   - The page flip/spread layout never gets told the content is ready.
3. **Fix the real cause**, including these safeguards:
   - The page body always shows right away from what's saved on the device. Linked-page updates and cloud syncing happen in the background afterwards.
   - A section that fails shows a small "couldn't load this section" note instead of blanking the whole page.
   - Opening a day no longer triggers repeated reloads.
4. **Verify.** Open Day 1 and Day 2, switch between them, type in a few sections, and confirm the page appears within about a second, with no errors on desktop, tablet and phone sizes.

## Technical details
- Instrument `Entry.tsx` (`getEntry` → `setEntry`), `useAutoSave`/`linkedEntries.ts` (scaffold and forward sync on mount), `PlannerSpread`/`PageFlip` render gating, and `onDataChanged` emissions from `sync.ts` (the account switch plus `applyPendingCoverText`, which can emit and reload settings in a loop).
- Add a per-section error boundary in `PageRenderer`.
- Defer linked-entry work with `requestIdleCallback`/`setTimeout`, and never block the first render.
