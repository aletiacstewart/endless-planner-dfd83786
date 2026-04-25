## Goals

Five fixes across mobile UX, page interactions, and data backup:

1. Fix mobile layout issues across all tracker pages (overflow / clipped grids).
2. Add a per-day note column to Yearly Daily-Reading grids (next to the ✓ circle).
3. Make the Monthly Calendar day boxes tappable, opening a popup that shows the typed-in note.
4. Replace the Mood 1–5 numbers with mood face icons.
5. Remove the "Best day" checkbox from the Daily Tracker.
6. Expand "Export backup" to support JSON, CSV, Excel (.xlsx), and PDF — covering everything from account start to today — plus a gentle in-app reminder to back up.

---

## 1. Mobile layout pass

Symptoms in the uploads:
- Yearly Blood Pressure / Sugar / Oxygen / Cleaning / Self-Care grids run off the right edge on phones.
- Yearly Habit Tracker (Fun Tracker) pill labels get clipped and the row scrolls awkwardly.
- Monthly Calendar day boxes show a stray "js" string and the textarea spinner control overlaps the content.

Changes in `src/components/FieldRenderer.tsx`:
- `DailyMonthGrid`, `HabitGrid`, `MonthTracker`, `YearlyHabitGrid`, `MeasurementGrid`: ensure the wrapping `overflow-x-auto` container actually constrains width on mobile by adding `max-w-full` and a sticky first column with a clear right border so users see scrollable area. Reduce `min-w` on the first column on small screens.
- Force the page-level container to not block horizontal scroll — wrap each table in a `<div className="overflow-x-auto max-w-full">` with `WebkitOverflowScrolling: touch`.
- `CalendarGrid` (monthly): replace the textarea inside each day cell with a read-only preview snippet (no spinner controls), and move editing into the popup (item 3). Removes the "js" / spinner artifact entirely.
- `MonthTracker` activity input: switch the activity name `<Input>` from a fixed `min-w-[8rem]` pill to `w-32 sm:w-40` with `truncate` placeholder so the long names ("Find New Challenges") don't get clipped to "Find New Challeng".
- All tables: add `pb-2` to the scroll wrapper so the bottom shadow/scrollbar doesn't sit under the next card.

## 2. Per-day note next to the ✓ on Yearly daily-reading grids

Affects the **Yearly Blood Sugar / Blood Pressure / Oxygen / Cleaning Check List** trackers (the `daily-month-grid` field).

In `DailyMonthGrid` (`FieldRenderer.tsx`):
- Extend the value shape to include `notes: Record<number, string>` (keyed by day 1–31). Backward compatible — missing key defaults to `""`.
- Add a new last column header "Note".
- Render an `<input>` (single-line, narrow ~10rem) for each row right after the ✓ button. Saves on change.

No DB migration needed — `FieldValue` already accepts arbitrary records.

## 3. Monthly Calendar — tap-to-open day popup

In `CalendarGrid` (`FieldRenderer.tsx`):
- Each day cell becomes a `<button>` that opens a shadcn `<Dialog>` (already in `src/components/ui/dialog.tsx`).
- Cell shows: day number in the corner + a 2-line truncated preview of the note (read-only).
- Dialog shows: header "April 12, 2026" (built from selected month/year), a full `<Textarea>` for the note, and a "Done" button. Saves through the same `update(day, value)` callback already wired up.
- Removes the per-cell textarea + spinner artifact, fixes the mobile cramped layout, and shows full content on demand.

## 4. Mood icons instead of 1–5 numbers

Add a new field type `mood-rating` (or extend `rating` with an `iconSet: "mood"` flag).

- `src/lib/pageTypes.ts`: change the Daily Tracker `mood` field to the new type.
- `src/components/FieldRenderer.tsx`: render 5 face icons from `lucide-react` (`Angry`, `Frown`, `Meh`, `Smile`, `Laugh`) as toggleable buttons. Selected = primary tint; unselected = muted. Same storage shape (number 1–5) — no migration.

## 5. Remove "Best day"

`src/lib/pageTypes.ts`: delete the `best_day` field from the Daily Tracker `Workout` section. Existing entries that have `best_day: true` simply stop rendering it; data is preserved if they ever re-add the field.

## 6. Multi-format backup + reminder

Two parts: export formats and a gentle reminder.

### Export formats (in `src/lib/db.ts` + `src/pages/Home.tsx`)

Add helpers:
- `exportAllJson()` — current behavior (already exists).
- `exportAllCsv()` — one CSV per page type, bundled into a single `.zip` (uses existing browser `Blob` + a tiny zip helper, or a flat single-file CSV with a `pageType` column if we want to skip a zip dep). Plan: **single combined CSV** with columns `id,pageType,createdAt,updatedAt,fieldKey,fieldValue` (long format) — simplest, no new deps, opens in any spreadsheet.
- `exportAllXlsx()` — uses `xlsx` (SheetJS) which is already in many shadcn projects; if not present, install `xlsx`. One sheet per page type, columns = field keys. Falls back to a single sheet if a page type has no entries.
- `exportAllPdf()` — uses `jspdf` + `jspdf-autotable` (lightweight, ~100 KB). One section per page type, table of entries with their summary + key fields. Adds the planner name and export date in the header.

All four cover **every entry from the user's first `createdAt` through now** because they iterate `db.getAll("entries")` (already does).

### Settings UI (`src/pages/Home.tsx` "Backup & restore" card)

Replace the single "Export backup" button with a small dropdown / button group:
- Export as JSON
- Export as CSV
- Export as Excel
- Export as PDF
- Restore (unchanged — JSON only, since that's the only round-trippable format)

Add subtitle: "Download a complete copy of every entry, from your first day to today."

### Reminder

In `src/pages/Home.tsx`:
- Track `lastBackupAt` in `localStorage` (set whenever any export runs).
- If it's been > 30 days since last backup AND the user has ≥ 5 entries, show a soft amber banner above the Sections grid:
  > "It's been a while since your last backup. Download a copy so you never lose your entries."
  with a "Back up now" button that scrolls to the Backup card.
- Dismissible for 7 days via `localStorage`.

No server, no account — purely client-side, which matches the rest of the app.

---

## Out of scope

- Changing the IndexedDB schema or migrating field values.
- Adding cloud sync (separate feature).
- Touching unrelated tracker layouts that already render cleanly on mobile.

## Files touched

- `src/components/FieldRenderer.tsx` — mobile overflow fixes, `DailyMonthGrid` notes column, `CalendarGrid` tap-to-edit dialog, mood icons rendering.
- `src/lib/pageTypes.ts` — remove `best_day`, change `mood` field type.
- `src/lib/db.ts` — add CSV / XLSX / PDF export helpers.
- `src/pages/Home.tsx` — multi-format export UI + backup-reminder banner.
- `package.json` — add `xlsx`, `jspdf`, `jspdf-autotable` if not already installed.
