# Planner fixes: habits, meals, contacts, fitness and tablet layout

## 1. Monthly habits grid
The "Habits this month" grid starts with no habit rows, so only the day numbers and a scrollbar appear. It will be rebuilt to look and work like the yearly "begin or break" grid: one habit row ready to type in, a wide habit name field, round day bubbles that fill in when tapped, and days split into readable blocks instead of one sideways-scrolling strip. "Add habit" keeps adding rows.

## 2. Day thumbnails covering Prev / Next
The strip of day thumbnails sits over the Prev / Next buttons at the bottom of a page. The page will reserve enough room beneath its content on every screen size so Prev, Next and the thumbnails never overlap, on all page types.

## 3. Tablet pages cut off
On tablet widths the wide tables (meals, contacts, trackers) keep desktop column widths, so later columns fall outside the page and a bottom scrollbar appears. Tablet will use the same compact treatment already built for phones: readable rows that fit the page, with the row popup for the full set of fields, so nothing is hidden behind a sideways scrollbar. Genuinely wide calendars keep controlled scrolling inside their card only.

## 4. Recipe ingredients and temperature
Ingredient rows become two fields: Amount and Ingredient. A Cooking temperature field is added beside Cooking time. Existing saved ingredient text is kept as the ingredient name.

## 5. Sketch reset
The sketch/drawing clear button will reliably empty the drawing (and its undo history) instead of doing nothing.

## 6. One workout page
The two overlapping pages are merged, as chosen: the detailed workout session log stays, and the year-at-a-glance grid becomes a section inside it. The separate Yearly Workout Tracker page is removed from the sections list, and existing yearly workout entries still open through the merged page so nothing saved is lost.

## 7. Meals and groceries split by meal
Meal Plan & Grocery gets separate Breakfast, Lunch and Dinner sections — each with the seven days and a roomy space to type — and the grocery list does the same, one section per meal plus staples. No more three narrow columns squeezed side by side.

## 8. Emergency contacts
The ICE contacts list gets the same behaviour as the Address Book: compact rows on tablet and phone plus a "View details" popup showing and editing Name, Relationship, Phone and Notes.

## 9. Complete Tracker blank page
The Complete Tracker showed an empty page below the header in the screenshot. The cause is not yet confirmed, so the first step is to open that exact entry at tablet and phone widths, capture the error, and fix what it turns out to be; then confirm every section of the Complete Tracker renders at phone, tablet and desktop.

## Technical notes
- `src/components/FieldRenderer.tsx`: rewrite `HabitGrid` (seed one row, bubble cells, chunked day blocks); extend the row-details/compact breakpoint from `lg` to cover tablet; `IngredientsList` becomes amount+name pairs with backward-compatible parsing of existing string values.
- `src/lib/pageTypes.ts`: recipe `cook_temp` field; meal-planning split into per-meal sections; `ice_contacts` gets `rowDetails: true`; merge `workout-tracker` sections into `fitness-tracker` and drop the standalone page while keeping its id resolving to the merged definition.
- `src/components/DrawingCanvas.tsx`: fix clear to reset strokes and history.
- `src/pages/Entry.tsx` / `EntryThumbnailRail.tsx`: bottom spacing so the rail never overlaps the Prev/Next row.
- `src/lib/linkedEntries.ts`: keep sync keys working for the merged workout page and the new meal keys.
- Verify with Playwright at 393px, 834px and 1280px, plus typecheck and tests.
