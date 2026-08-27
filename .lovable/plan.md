# Stack Complete Tracker sections full width

Four sections on the Complete Tracker currently use two- or three-column grids, which leaves the third item hanging beside empty space and makes the fields half-width. Each becomes a single full-width column so items stack top to bottom.

## Changes

1. **Begin / Break Habits (page 1)** — one habit per row, each row (Begin/Break, habit text, Success/Failed) spanning the full page width; habit 3 sits under habits 1 and 2.
2. **Fun Activity Tracker (page 1)** — same: three stacked full-width rows.
3. **Workout (page 1)** — stacked full-width fields in order: Cardio, Yoga, Weights, Stretch, Other, then the Rest day checkbox.
4. **Medical notes block (page 2)** — Appointment Notes, then Test Results, then Lab Result Notes, each a full-width textarea stacked vertically.

## Technical detail

All edits are in `src/lib/pageTypes.ts` on the `complete-tracker` section definitions: set `columns: 1` (and `span: 2` on fields where the grid needs it) for the Workout, Fun Activity Tracker, Begin / Break Habits, and Appointment/Test/Lab sections, and reorder the Workout fields so Weights and Stretch follow Yoga. No changes to stored data keys, so existing entries keep their values.
