# Add the Monthly Calendar, This Week, and Daily Spend to the Complete Tracker

## 1. Monthly Calendar (page 1, right after the date)
- Shows the full month for the tracker's date. Tap a day to see or add a note.
- Uses the same calendar notes as before, so any dates you already added show up again.
- Take Monthly Calendar out of the links at the top, since it now appears on the page.

## 2. This Week (page 1, after the hourly schedule)
- Shows the week that includes the tracker's date: Monday–Sunday boxes, Weekly Goals and "How did your week go?"
- Syncs both ways with the Weekly Calendar page for that week. Writing in either place updates the other.
- Weekly Calendar stays in the links too, so the full page is still one tap away.

## 3. New Daily Spend page, plus a "Today's Spending" section (page 2)
New page: **Daily Spend**
- Date
- Spending list with rows you can add: Item, Category (Groceries, Dining, Gas, Bills, Shopping, Health, Kids, Pets, Fun, Other), Amount ($), Paid with (Cash, Debit, Credit, Other), Notes
- Total spent today, added up automatically
- Notes

On the Complete Tracker, the same list and total appear as "Today's Spending" and sync both ways with the Daily Spend page by date.
- Daily Spend gets its own icon on every cover.

## Balance
Page 1 gets two new sections and page 2 gets one, so I'll move the Self-Care and Cleaning sections to page 2. That keeps both pages about the same length.

## Technical details
- `src/lib/pageTypes.ts`: bring back the `month_calendar` calendar-grid section (compact). Add a "This Week" section using keys `week_monday`…`week_sunday`, `week_goals` and `week_reflection`. Add a new page type `daily-spend` with a growable measurement-grid `spend_items` (select and computed columns) and `spend_total`/`spend_notes`. Add a `spend_items` section on the tracker.
- `src/lib/linkedEntries.ts` + `useAutoSave.ts`: add a weekly handler that finds or creates the weekly-calendar entry whose `week_of` is the Monday of the tracker's date and maps the keys both ways. Add a daily-spend handler matched by date, and add both types to REVERSE_SYNC_TYPES.
- Add a `daily-spend` icon prompt, run the icon backfill for all covers, then run the manifest and validate it (0 gaps).
- Confirm the build, then test typing and sync on a real day.
