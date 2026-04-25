## Problem

On the **Monthly Calendar** page, the day grid (`calendar-grid` field) always renders a fixed 31 cells starting at column 1, regardless of the **Month** and **Year** chosen above. It should:

- Show only the actual number of days in the selected month (28/29/30/31).
- Start the first day of the month under the correct weekday column (Sun–Sat).
- Show weekday headers (Sun, Mon, …, Sat).
- Update live whenever the user changes Month or Year.

The **Yearly Calendar** page does not have a date grid (it's just 12 month textareas), so no change is needed there. The user mentioned "yearly, monthly calendars that have dates on the grids" — the only date grid is the Monthly Calendar. We'll also handle the leap-year case via the selected Year.

## Changes

### 1. Pass sibling field values into `FieldRenderer`

Currently `FieldRenderer` only receives a single `value`. To make the calendar grid month/year-aware, it needs access to the page's other field values.

- `src/components/PageRenderer.tsx`: pass `values` down to `<FieldRenderer />` as a new optional `allValues` prop.
- `src/components/FieldRenderer.tsx`: accept `allValues?: Record<string, FieldValue>` and forward it into `<CalendarGrid />`.

### 2. Make `CalendarGrid` month/year-aware

In `src/components/FieldRenderer.tsx`:

- Read `month` (string like "April") and `year` (string/number) from `allValues`.
- Compute:
  - `monthIndex` from the month name (fallback: current month if unset/invalid).
  - `yearNum` (fallback: current year if unset/invalid).
  - `daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate()`.
  - `startWeekday = new Date(yearNum, monthIndex, 1).getDay()` (0 = Sun).
- Render a 7-column grid with:
  - A header row of weekday labels: Sun, Mon, Tue, Wed, Thu, Fri, Sat.
  - `startWeekday` empty leading cells.
  - `daysInMonth` day cells (each still keyed by day number 1..N so existing saved notes survive).
- Keep the existing textarea-per-day editing behavior and the `data[day]` storage shape (no data migration needed).

### 3. Keep storage backward compatible

Saved entries keyed by day number (1..31) continue to work. If the user switches from a 31-day month to a 30-day month, the day-31 note is hidden but not deleted (it'll reappear if they switch back).

## Out of scope

- Yearly Calendar layout (no day grid present).
- Weekly Calendar (already day-named, no dates to compute).
- Other 31×12 trackers (Blood Sugar, Cleaning, etc.) — these are intentionally year-spanning grids per the source PDFs and don't depend on a selected month.

## Technical summary

```text
PageRenderer ──(values)──▶ FieldRenderer ──(allValues)──▶ CalendarGrid
                                                            │
                                                            ├─ reads allValues.month, allValues.year
                                                            ├─ computes daysInMonth + startWeekday
                                                            └─ renders weekday header + offset + N day cells
```

Files touched:
- `src/components/PageRenderer.tsx` — pass `allValues` prop.
- `src/components/FieldRenderer.tsx` — thread `allValues`, rewrite `CalendarGrid` to use month/year.
