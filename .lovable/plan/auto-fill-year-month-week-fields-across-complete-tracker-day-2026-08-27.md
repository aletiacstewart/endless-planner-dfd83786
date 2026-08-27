# Auto-fill Year / Month / Week fields across Complete Tracker days

Goal: the "This Year" and "This Week" fields should behave like shared scope fields — type once, and every Complete Tracker day in that year / month / week shows the same text, including days created later. When the scope changes (new year, new month, new week), the field starts empty again.

## Behavior

| Field | Scope | Shared across |
|---|---|---|
| Yearly Focus / Word of the Year | Year | every day in that calendar year |
| Note for this month | Month | every day in that month of that year |
| Weekly Goals | Week (Mon-Sun) | every day in that week |
| How is your week going? | Week (Mon-Sun) | every day in that week |
| Note for today's weekday | Day | stays unique per day (it is that day's note) |

- Editing one of the shared fields on any day rewrites it on all other days in the same scope (clearing it clears them too).
- A newly created Complete Tracker day is pre-filled from an existing day in the same year / month / week; if none exists, the fields stay blank — so the first day of a new month or week starts clean.
- Existing sync to Yearly Calendar, Yearly Focus, and Weekly Calendar pages keeps working unchanged.

## Technical notes

All work is in `src/lib/linkedEntries.ts`, plus the two create paths that already call scaffolding.

1. New helper `propagateScopedFields(complete)`:
   - Parse the source day's date (fallback to today).
   - Load all `complete-tracker` entries; for each, compare year, year+month, and Monday-of-week key against the source.
   - Write matching-scope siblings via the existing `persist()` helper: set `yearly_focus` (year), `month_note_today` (month), `weekly_goals` + `weekly_reflection` (week). Empty source value deletes the key on siblings.
   - Skip the source entry; only write when the value actually differs to avoid redundant saves/sync loops.
   - Called at the end of `syncLinkedEntries()` (which already runs on every autosave of a Complete Tracker), inside its existing try/catch.
2. New helper `seedScopedFields(newEntry)`:
   - Finds the most recently updated sibling in the same year / month / week and copies each shared field into the new entry if the new entry does not already have it.
   - Called from `scaffoldLinkedEntries()` so both create paths (`src/pages/Section.tsx` and `src/pages/Entry.tsx` "New day", plus the side rail) get it for free.
3. Guard against write loops: propagation only fans out from Complete Tracker → Complete Tracker and uses value-equality checks, so the reverse-sync paths from Yearly/Weekly Calendar pages stay one-way as they are today.
