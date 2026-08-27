# Day labels + auto-created tracker pages

## What changes

1. **"Day" wording everywhere**
   - Section pages: the count line becomes "1 Day" / "12 Days" instead of "1 sheet" / "12 sheets".
   - Each card's small script label becomes "Day 1", "Day 2" (no zero padding) instead of "sheet 01".
   - Same wording in the Entry page's "New sheet" affordances and the thumbnail rail caption so the app reads consistently ("New Day", "Day 3").

2. **Day numbers follow the date**
   - Cards are numbered by their date value (oldest date = Day 1). Entries with no date fall to the end, numbered after the dated ones.
   - Display order in the section grid follows the same date order so numbers read top-to-bottom.

3. **Creating a Complete Tracker day scaffolds its linked pages**
   - When a new Complete Tracker entry is created, all pages it normally feeds get their shell entry created immediately (Daily Tracker for that date, the weekly/monthly/yearly calendars for that date, plus the year-scoped trackers: blood sugar, blood pressure, oxygen, self-care, cleaning, workout, yearly habits, yearly focus, weight/measurement, medications, medical records).
   - Scaffolding is idempotent: it reuses an existing entry for the same date/year instead of creating duplicates, so opening or re-saving a day never adds extra pages.
   - Existing value fan-out on save is unchanged; this only guarantees the pages exist up front.

## Technical notes

- `src/pages/Section.tsx`: replace the sheet count and `sheet NN` label with day wording; compute a date-sorted index for numbering.
- `src/lib/db.ts` / `sortEntries`: leave as-is; date ordering for display is derived in the Section page (and the rail keeps its manual drag order).
- `src/lib/linkedEntries.ts`: add an exported `scaffoldLinkedEntries(complete)` that runs the same find-or-create lookups used by `syncLinkedEntries` but without requiring filled values, seeding only the identity fields (`date`, `week_of`, `year`, `month`).
- Call it from the Complete Tracker creation paths (`Section.tsx` add-new and `Entry.tsx` addSheet) when `pageType === "complete-tracker"`.
- `src/pages/Entry.tsx` and `src/components/entry/EntryThumbnailRail.tsx`: label text only ("New Day", "Day N").
