# Fix the planner PDF export so it includes everything you wrote

## What you're seeing

The exported PDF lists your pages, but each page only shows its date — the writing, checklists, tables, photos and sketches you filled in are missing.

## Honest status of the diagnosis

I read the export code and it does have handling for every kind of field (typed text, checkboxes, tables/grids, sketches, photos, stickers). Nothing I read proves why your content is dropping out, and your pages live on your own device rather than in the cloud, so I could not inspect your actual data. I will not guess at a cause. The fix starts with reproducing the empty export against real filled-in pages.

## Plan

1. **Reproduce it.** Fill several different page types in the running app (a daily page with typed text and checkboxes, a contacts table, a journal page with photo + sketch, a monthly habit grid), run the export, and convert the resulting PDF to images to see exactly what lands on each page.
2. **Find where the content is lost.** Compare what is actually saved for those pages against what the export looks for, and log which fields the export considers empty. The most likely places are a mismatch between saved field names and the names the export reads, or the export treating filled values as empty and skipping them.
3. **Fix the real cause** found in step 2, rather than patching symptoms.
4. **Re-verify page by page.** Export again and inspect every page image: typed text present, checkboxes shown as ticks, tables with their rows, journal photos and sketches embedded, stickers in place, and each page still labelled with its date and title.
5. **Confirm the edge cases** while I'm in there: pages you partly filled, pages with only a table, and long entries that need to flow onto a second PDF page.

## Notes

- Your cloud photos only come out if you're signed in on the device doing the export; the PDF marks any it can't fetch instead of failing.
- Once it's fixed I'll ask you to run one export on your own device, since that's the only place your full planner data exists.

## Technical detail

Reproduce via a headless browser against the dev server, seeding entries into IndexedDB (`entries` store) across several `pageType`s, then calling `exportPlannerPdf` from `src/lib/plannerPdf.ts` and rendering the output with `pdftoppm` for inspection. Suspects to confirm or rule out: `isEmptyValue`/`isEntryFilled` filtering, `renderSection`'s `values[f.key]` lookup versus the keys `PageRenderer` writes (including `scopeByKey` doctor-scoped fields and `measurement-grid` `row-col` keys), and whether a thrown error inside `renderField` silently truncates a page. Fix at the lookup/emptiness layer, then re-run typecheck and Vitest.
