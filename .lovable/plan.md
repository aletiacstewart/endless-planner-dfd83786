# Yearly planner rollover with an optional page-by-page move

## What customers get
- **Every planner opens on the current year.** Year boxes, calendars and yearly trackers start with this year's dates (2027, 2028, and so on) instead of a fixed year. New members always start on the current year.
- **Each year is its own planner.** Pages you create are saved under that year. Past years stay safe and read-only-friendly: a "Year" switcher on Home (for example 2026 / 2027) lets you open older years at any time.
- **New Year welcome (members only).** The first time an active member opens the planner in a new year, a "Start your 2027 planner" page appears:
  - A checkbox list of every page that holds last year's data, with how many entries each one has. For example: Contacts (12), Medications (3), Important Dates (8), Recipes (5).
  - Pages that usually carry over well are pre-ticked: Contacts, Emergency Contacts, Important Dates, Gift Tracker, Medications, Doctors, Recipes, Household Info, Debt Tracker, Savings Goals and My Goals. Day-by-day pages (Complete Tracker days, journals, meals, mood, sleep, and so on) start unticked.
  - "Select all", "Clear all", "Move selected", and "Start fresh" (move nothing).
  - Moved pages are copied into the new year, with year fields updated to the new year. The originals stay in last year.
  - You can reopen this page any time from Settings: "Move pages from last year".
- **Lapsed members.** If the membership isn't active, the planner stays locked as it is now. When they renew, they get the same New Year page for the current year.

## Technical details
- Store the active year per user in `user_settings.data.plannerYear`, plus `rolloverDone: { "2027": true }`. No schema change is needed because `data` is already jsonb.
- Tag entries with `values.__year`. When the app loads, existing entries without a tag are backfilled once, using their own date or year field and falling back to the year they were created. Section lists and the Complete Tracker filter by the active year.
- Replace the hardcoded `placeholder: "2025"/"2026"` year fields, and default every `year` field to the active year when a new page is created.
- New page `/new-year` (YearRollover.tsx): groups last year's entries by page type, shows the checkboxes, and copies the selected ones with new ids, `__year` set to the new year, and the `year` field bumped. Copies go through the existing save/sync path, so they reach the cloud and other devices.
- A gate on Home sends the member there when `currentYear > plannerYear`, `rolloverDone[currentYear]` isn't set, and access is active (existing entitlements check).
- The Year switcher on Home changes `plannerYear`. Settings gets a link to reopen the move page.
- Verify with a simulated date of Jan 1 2027 on a test account: the prompt appears, selected pages copy over, and 2026 stays intact.
