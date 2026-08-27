# Add-row buttons, a medical calendar, and full two-way tracker sync

## 1. "+ Add" buttons on every row-based page

Right now only about 10 of the 26 row grids in the planner can grow; the rest are locked at a fixed row count. Every grid gets an add-row button at the bottom with wording that matches the page:

- Medications → "+ Add medication"
- Savings Goals → "+ Add savings goal"
- Debt Tracker → "+ Add debt"
- Budget (income, fixed, variable) → "+ Add income" / "+ Add expense"
- Utilities, Accounts (Home Info) → "+ Add utility" / "+ Add account"
- Meal plan grocery list → "+ Add item"
- Cleaning supplies → "+ Add supply"
- Weight / measurements / blood sugar / blood pressure / oxygen logs → "+ Add entry"
- Gift Tracker, Contacts, Emergency Contacts, Important Dates → already growable, wording checked
- Water tracker glass grid stays fixed (driven by the daily goal)

## 2. Appointment types + a medical month calendar

- Every calendar day note gets an optional **type**: Medical, Work, School, Family, Personal, Other. Existing notes keep working and count as "Other".
- Notes show a small type tag; each calendar gains a filter so you can view all types or just one.
- The **Medical Records** page gets its own month calendar (page 1) plus a notes-by-day list (page 2) that only ever shows Medical-type entries.
- Two-way sync: a medical appointment added on the Medical page appears on the Monthly Calendar, the matching day of the Weekly Calendar, and the day's Complete Tracker / Daily Tracker; a note typed on any of those with type "Medical" appears on the Medical page. Non-medical notes are never pulled onto the medical page and are never deleted by it.

## 3. Complete Tracker parity + duplicate cleanup

- Audit each individual page against the Complete Tracker day and add anything missing (e.g. sleep bed/wake/quality/hours, water glasses, gratitude, mood ratings, cleaning-by-room, gift/date reminders where they belong on a day) so a day captures everything the standalone pages capture.
- Extend the sync map so each newly added field flows Complete Tracker → individual page and individual page → Complete Tracker.
- Remove duplicated sections on any page (repeated wellness/self-care/medical blocks, doubled meal or habit groups), keeping one canonical block per topic.

## Technical notes

- `src/lib/pageTypes.ts`: add `growable` + `addRowLabel` to remaining `measurement-grid`/`med-list` fields; add `apptTypes` support to `calendar-grid`/`calendar-notes`; add `medical_calendar` field and a page-2 notes section to `medical-records`.
- `src/components/FieldRenderer.tsx`: `MeasurementGrid` add-row already exists — wire labels; `MedList` gains add-row; `CalendarGrid`/`CalendarNotes` gain a type selector on the note editor, type tags, a filter, and a `filterType` prop for the medical-only view. Day-note storage moves to `{ text, type }` with backward-compatible parsing of plain strings.
- `src/lib/linkedEntries.ts`: extend `mergeCalendarCell` and `mergeDailyMonthCell` to preserve/merge note types; add medical-records ↔ monthly/weekly/daily/complete calendar sync in both `syncLinkedEntries` and `syncFromIndividual`; extend `DAILY_KEYS` and the field maps with the newly added parity fields.
