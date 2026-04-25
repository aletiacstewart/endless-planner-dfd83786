# Mobile layout fix — split month grids into two halves

## Problem

On mobile (390px), the wide month-based grids (Daily×Month tracker, Yearly Habit grid, MonthTracker, HabitGrid 31-day, MeasurementGrid) require horizontal scrolling. The sticky left "Day"/"Month" column visually conflicts with the page title when the table scrolls vertically inside its own container, producing the artifact in the screenshot (numbers 3–24 appear on top of the page header).

Two issues to fix:
1. Day/row labels stay pinned via `sticky left-0` while the **page** scrolls vertically, causing the labels to bleed over the page header (because the table's overflow container creates a scroll context that is taller than the viewport).
2. 12 month columns + label + checks + notes simply don't fit at 390px and are uncomfortable to scroll horizontally.

## Solution

On mobile only, stack two half-year tables (Jan–Jun, then Jul–Dec) so each fits the viewport with no horizontal scroll. On `sm+` keep the current single-table layout.

Also remove the visual artifact by dropping `sticky left-0` on the row-label cells (no longer needed once the table fits) and switching the wrapper from `overflow-x-auto` to non-scrolling on mobile.

### Components to update in `src/components/FieldRenderer.tsx`

1. **`DailyMonthGrid`** (Blood Sugar, Blood Pressure, O2, Cleaning, Self-Care)
   - Mobile (`<sm`): render two stacked tables — one with months J F M A M J, one with J A S O N D — each with the Day column, ✓ column, and Note column. Both halves share the same underlying `cells`, `achieved`, `notes` state (achieved + note shown in the second half only, or duplicated under each half — see decision below).
   - Desktop (`sm+`): unchanged single table.

2. **`YearlyHabitGrid`**
   - Mobile: split into two cards — **Jan–Jun** and **Jul–Dec**, each as its own vertical block. Each month becomes one row with its Begin/Break + Habit input and a 31-day strip below (wrapping into ~5 rows of 7 cells), instead of cramming everything into one wide table.
   - Desktop: unchanged.

3. **`MonthTracker`** (Activities by month)
   - Mobile: split the 12 month columns into two tables (J F M A M J / J A S O N D) stacked vertically. Activity name column repeats in each.
   - Desktop: unchanged.

4. **`HabitGrid`** (31-day habit grid)
   - Mobile: split the 31 day columns into two tables: days 1–16 and 17–31, stacked. Habit name column repeats.
   - Desktop: unchanged.

5. **`MeasurementGrid`** (Bi-Monthly Weight / Measurements)
   - Already narrow enough; just remove the `sticky left-0` artifact and let it scroll horizontally cleanly. No splitting needed.

### Decision needed for DailyMonthGrid (Achieved + Note columns)

When split into two halves, the Achieved checkbox and Note column belong to the **day**, not to a half-year. Plan: show Achieved + Note **only in the bottom (Jul–Dec) half**, with a small caption "Achieved & note apply to the whole year for that day". This keeps the top table compact and avoids duplicating the same input twice. Alternative would be to show them in both halves bound to the same state.

### Sticky-column artifact fix

Remove `sticky left-0 bg-card z-10` from all grid first-column cells. Once the tables fit the viewport on mobile, sticky is unnecessary and on desktop it isn't causing the artifact (the artifact only manifests when the row is taller than the viewport because the `overflow-x-auto` wrapper still allows the inner content to be vertically taller than the page header that sits above it on mobile). On desktop tables, keep the wrapper as `overflow-x-auto` for graceful degradation but drop `sticky` since the row label fits in view.

### Implementation pattern

Add a small `useIsMobile` check (already exists at `src/hooks/use-mobile.tsx`) to each grid component, then conditionally render the half-year split layout vs. the existing single table.

```tsx
const isMobile = useIsMobile();
if (isMobile) return <SplitView ... />;
return <FullTable ... />;
```

The split view shares all state with the single table — it only changes which subset of months/days is rendered.

## Files changed

- `src/components/FieldRenderer.tsx` — update the five grid components above

## Out of scope

- Monthly calendar popup grid (already mobile-friendly, uses Dialog)
- Other field types (text, mood-rating, etc.)
- Visual redesign — only structural split, existing styling preserved
