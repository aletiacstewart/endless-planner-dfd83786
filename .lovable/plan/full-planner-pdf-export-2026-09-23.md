# Full Planner PDF export

Add an "Export full planner (PDF)" button in Settings that produces one complete PDF book of everything in the planner: the cover, every page you have filled in, all your text, and all the artwork — page graphics, stickers, uploaded photos and sketches.

## What the user gets

- A new button in the Backup & Restore card on Settings, beside the existing export/restore buttons.
- While it builds, the button shows progress ("Preparing page 12 of 58…") since photos take a moment to fetch.
- The finished file downloads as `my-planner-<date>.pdf`.

Structure of the PDF:

1. **Cover page** — the chosen cover art full-page with planner name and owner name, exactly as the app shows it.
2. **Contents** — a list of every section and page with page numbers.
3. **One or more pages per planner page**, in the same order as the planner sections, each with:
   - the page's themed graphic at the top and the page title/date,
   - every section and field heading in reading order,
   - all typed text, including rich text (bold/italic/colour kept as plain styled text),
   - grids and tables (habits, water, calendars, contacts, medications) drawn as real tables,
   - checkboxes shown as ticked/unticked marks,
   - uploaded journal photos and sketches embedded as images,
   - stickers placed on the page drawn at their saved positions and sizes.
4. **Appendix** — anything that has no page template (raw leftover values), so nothing is silently dropped.

Empty pages you never touched are skipped by default.

## Technical notes

- New module `src/lib/plannerPdf.ts` built on the existing `jspdf` + `jspdf-autotable` dependencies (no new packages needed for layout).
- Data source: `getAllEntries()` from `src/lib/db.ts` plus `loadSettings()`; ordering follows `PAGE_TYPES` / section order in `src/lib/pageTypes.ts` so the PDF mirrors the planner.
- A field-to-PDF renderer mirrors the `FieldType` union in `pageTypes.ts`: text/note/rich-text → wrapped paragraphs; measurement-grid / paired-compact / calendar / habit grids → `autoTable`; checkbox/toggle → glyphs; `drawing` → embedded data-URL image; `image` (journal photos) → fetched through a signed URL from the private `journal-photos` bucket and embedded; stickers from entry meta → drawn as emoji text or images at scaled coordinates.
- Cover art and page icons come from `src/data/covers.ts` / `src/lib/coverIcons.ts`; bundled assets are loaded via `fetch` → data URL, then added with `doc.addImage`. Images are downscaled (max ~1400px, JPEG quality 0.8) so the file stays reasonable.
- Remote/private images are fetched with concurrency limits and individually guarded — a photo that fails to load leaves a "photo unavailable" placeholder instead of aborting the export.
- Signed-out users still get everything except cloud-stored photos (those need a session); the export notes that inline.
- Progress is reported via a callback so the Settings button can show page counts; export runs fully client-side.
- QA: generate an export from a seeded planner, convert every page to images and inspect for clipped text, overlapping tables, missing artwork and blank pages; fix and re-run until clean.
