# Water Tracker: full-spread grid, no side scroll

The "Glasses per day" grid currently sits on the left page only, so all 31 days don't fit and it gets a horizontal scrollbar. It should stretch across both pages of the spread and fit without scrolling.

## What changes

- The Glasses-per-day grid renders full width across the whole spread (both pages), the same way the calendar and habit grids already do.
- The grid fits the available width: the day columns share the space evenly and the tap circles shrink slightly so all days (1–31) are visible at once.
- The horizontal scrollbar disappears on desktop/tablet. On phones the existing two-block split (Days 1–16 / 17–end) stays, since a 31-column grid can't fit a phone screen.
- Nothing else on the page moves: Month, Daily goal and Notes stay where they are.

## Technical notes

- `src/components/planner/PlannerSpread.tsx`: add `water-grid` to `WIDE_TYPES` so the section is treated as full-bleed across the spread.
- `src/components/FieldRenderer.tsx` (`WaterGrid`): switch the desktop table to `table-fixed w-full` with a fixed narrow first column, remove the `overflow-x-auto` wrapper for the desktop path, and size the toggle circles responsively (roughly 1rem–1.25rem, centred in each cell) so 31 columns plus the Glass label fit the spread width. The Total row keeps the same column alignment.
- No data-shape or sync changes — the `marks` keys (`glass-day`) stay identical.
