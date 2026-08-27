# Planner fixes: empty grids, calendars, add-row buttons, layout

## What's behind items 3, 4, 7, 11 and 12

Those sections (Utilities & services, Important accounts, Income, Fixed expenses, Variable spending, Debts, This week's meals) use the table field but were never given column names, so the page renders only a bare row-number list with nothing to type in. Each one gets real columns:

| Section | Columns | Rows |
|---|---|---|
| Income | Source, Amount | 12 |
| Fixed expenses | Bill, Due, Amount, Paid | 16 |
| Variable spending | Category, Budgeted, Actual | 14 |
| Debts | Creditor, Balance, APR, Min payment, Paid | 12 |
| Utilities & services | Service, Provider, Account #, Due date | 14 |
| Important accounts | Account, Contact, Notes | 12 |
| This week's meals | Day, Breakfast, Lunch, Dinner | 7 (Mon–Sun day labels) |

All become growable with an "+ Add row" button.

## The rest of the list

1. **Yearly Calendar (item 1 & 2)** — page 1 gets a pop-out calendar (month/day/year) plus a note box. Saving a note appends it to that month's box on page 2, and the month boxes stay editable. Yearly Calendar keeps its existing two-way sync with the Complete Tracker's "This year" fields.
2. **Medical Records (item 2)** — same field set and behavior as the Complete Tracker's medical block (date, doctor picker, per-doctor Appointment Notes / Test Results / Lab Result Notes) with sync flowing both ways, so notes typed on either page appear on the other for that date and doctor.
3. **Gift Tracker (item 5)** — "+ Add person" button at the bottom, and the columns resized so "Gift idea" no longer runs past the page edge (Purchased/Wrapped become compact tick columns).
4. **Monthly Calendar (item 6)** — the day-note panel moves to page 2 with its own titled section ("Day notes"), and the grid stays on page 1.
5. **Weekly Cleaning (item 8)** — new "Cleaning supplies" section: a checklist of common supplies (all-purpose, glass, bathroom, floor cleaner, disinfectant wipes, sponges, scrub brush, microfiber cloths, paper towels, trash bags, laundry detergent, dryer sheets, gloves, mop/broom, vacuum bags/filters) plus a "Need to buy" notes line.
6. **Emergency Contacts (item 9)** — becomes a yearly page: one sheet with an "Update contacts" button instead of "New day", cards read "1 Year" instead of "Day 1".
7. **Self-Care (item 10)** — Physical, Emotional, Spiritual and Social stack full width one under the other instead of sitting in four columns.
8. **Meal Plan grocery list (item 13)** — grocery list is organised by day and meal: a row per day (Mon–Sun) with Breakfast / Lunch / Dinner ingredient boxes, so what you need is tied to the meal it belongs to, with the existing Produce/Protein/Pantry/Other lists kept as a "Staples" block.
9. **Sleep Tracker (item 14)** — Bedtime and Wake time become 15-minute dropdowns, Hours a 1–24 dropdown, Quality a 1–5 dropdown; Notes stays free text.
10. **Contacts (item 15)** — "+ Add contact" button at the bottom of the list.

## Technical notes

- `src/lib/pageTypes.ts`: add `columns`/`rowCount`/`growable`/`addLabel` to the column-less `measurement-grid` fields; new Yearly Calendar day-picker section; Medical Records aligned to the complete-tracker medical fields; `cadence: "year"` on `emergency-contacts`; self-care groups switched to stacked full-width; cleaning-supplies section; meal grocery restructure; new column kinds on the sleep grid.
- `src/components/FieldRenderer.tsx`: extend `columnKinds` with `time`, `select` (options per column) and `check` kinds for the sleep/gift grids; per-column width hints so wide text columns stay inside the page; new `month-note-picker` field for the Yearly Calendar.
- `src/components/planner/PlannerSpread.tsx` / section `page` flags: move the Monthly Calendar note panel to page 2.
- `src/lib/linkedEntries.ts`: extend the existing medical + yearly-calendar sync paths so both directions carry the same keys.
- No database changes; existing entry values are read forward so nothing already typed is lost.
