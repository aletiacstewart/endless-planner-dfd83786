# Important Dates page: smarter rows, no month grid

## What changes

1. **Occasion becomes a dropdown** — each row's Occasion cell is a select with common options: Birthday, Anniversary, Wedding, Graduation, Holiday, Memorial, Work, Other. Picking "Other" reveals a small text box on that row so any custom occasion can still be typed.
2. **Date becomes a pop-out calendar** — tapping the Date cell opens a calendar popover to pick day/month/year (with year/month navigation), storing the chosen date and showing it formatted in the cell.
3. **"+ Add person" button** — the table starts with a reasonable number of rows and grows one row at a time from a button under the grid, instead of a fixed 16-row block. Existing filled rows are preserved.
4. **"Dates by month" section removed** — the Activities-by-month grid with the J F M A M J J A S O N D bubbles goes away entirely from this page.
5. **"Name" column renamed to "Name/Activity"**, so the row works for both people and activities.

The Year field, Notes column, and page navigation stay as they are.

## Technical notes

- `src/lib/pageTypes.ts`: in the `important-dates` page type, delete the `dates_grid` (`month-tracker`) section; update `date_details` columns to `["Name/Activity", "Occasion", "Date", "Notes"]`, add new optional field props `columnKinds: ["text", "occasion", "date", "text"]`, `growable: true`, `addLabel: "Add person"`, and lower the starting `rowCount`.
- Extend the field definition type with the optional `columnKinds`, `growable`, and `addLabel` props (additive, so no other page type is affected). The `month-tracker` field type itself stays available for other pages.
- `src/components/FieldRenderer.tsx`: extend `MeasurementGrid` to honor `columnKinds` — render a `Select` for `occasion` (plus an inline "Other" text input stored in a sibling key) and a `Popover` + shadcn `Calendar` (with `pointer-events-auto`) for `date`; other columns keep today's `Input` / `MobileEditButton` behavior. When `growable`, the visible row count comes from a `__rows` entry in the field's value (defaulting to the configured `rowCount`) and the "+ Add person" button increments it.
- Values keep the existing `"<row>-<Column>"` string keys, so already-entered data stays readable; the renamed Name column means old `1-Name` values won't show under `1-Name/Activity` — a small one-time read fallback maps the old `Name` key to the new column so nothing appears lost.
- Verify with a typecheck and a quick preview check of the Important Dates page.
