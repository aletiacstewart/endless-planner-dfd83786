# Fix the Water Intake Tracker page

The Water page currently reuses the habit grid, so it shows editable habit rows, an "Add habit" button and a remove X per row. Glasses aren't habits — the rows should be fixed glasses, tied to the daily goal.

## What changes

1. **New grid built for water** (replaces the habit grid on this page only):
   - Rows are glasses, labelled "Glass 1 … Glass N" — not editable, no X, no "Add habit" button.
   - Number of rows follows the "Daily goal (glasses)" field (default 8, allowed 1–12); changing the goal adds/removes rows and keeps existing ticks.
   - Columns are days 1–31, trimmed to the real day count of the selected month (so February shows 28/29).
   - Tap a cell to tick a glass. A per-day total row at the bottom shows "x/goal", and days that hit the goal get a filled marker.
   - Mobile keeps the existing split view (days 1–16 / 17–31) so nothing overflows the page.
2. **Header wording** stays "Glasses per day", with the helper line "Tick a glass for each cup you drink."
3. **Month coverage** — one Water page per month. When a Water sheet is created it is stamped with the current month, and the section's create button reads "New month" instead of "New day", so twelve sheets cover the year. Existing water sheets keep their data.

## Technical notes

- `src/components/FieldRenderer.tsx`: add a `WaterGrid` component and a `water-grid` field case (reads sibling `daily_goal` and `month` values for row count and day count). Habit grid is left untouched for the real habit pages.
- `src/lib/pageTypes.ts`: change `water-tracker`'s `water_grid` field from `habit-grid` to `water-grid`, and give the page type `cadence: "month"`.
- `src/pages/Section.tsx` / `src/pages/Entry.tsx`: extend the existing cadence label logic with the `month` case ("New month", "Month 1", "N Months").
- Existing values stored under the habit-grid shape (`{ habits, marks }`) are read as marks so already-ticked cells survive.
