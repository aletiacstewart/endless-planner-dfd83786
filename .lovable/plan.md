## Goal

1. Create a shared **Doctors** directory (name, practice, contact info) that both **Medical Records** and **Medications** trackers (individual + Complete Tracker) can pull from via a dropdown + "Add doctor" button.
2. On **Medical Records**: add a doctor picker above the Medical Appointment Notes so each visit can be tagged with the doctor seen.
3. On **Medications**: replace the free-text Doctor cell in the medication list with a per-row dropdown that selects from the shared Doctors list.
4. Replace the row-label placeholder text on grids that say `"Row label (e.g. chore name, self-care item)"` with `"Label name (Title)"`.

## Approach

### Shared Doctors store

- Add a new `pageType` definition `doctors-directory` (single shared entry, auto-created on first use) holding `doctors: { id, name, practice, phone, email, notes }[]` in its `values`. Stored in the same IndexedDB `entries` store — no schema change needed.
- New helpers in `src/lib/doctors.ts`:
  - `listDoctors()` — returns the array (creates the directory entry on demand).
  - `addDoctor(input)` — appends a new doctor with a generated id, persists, returns the doctor.
  - `getDoctor(id)` — convenience lookup.
- Doctors are referenced by id everywhere (so renaming a doctor updates all entries automatically).

### New `doctor-picker` field type

- Extend `FieldType` and `FieldRenderer` with a `"doctor-picker"` type:
  - Renders a `Select` of existing doctors (label = `Name — Practice`).
  - Trailing **+ Add doctor** button opens a dialog with inputs: Name (required), Practice, Phone, Email, Notes. On save, the new doctor is added to the shared list and auto-selected for the field.
  - Loads doctors via a small `useDoctors()` hook (re-fetches after add).
- Stores selected doctor id (string) as the field value.

### Wire-in points

- `src/lib/pageTypes.ts`
  - **Medical Records** tracker: insert a `doctor-picker` field `doctor_id` ("Doctor seen") above `medical_appointment_notes`.
  - **Complete Tracker → Medical Records section**: same `doctor_id` field added before the existing notes (kept in the existing 3-column section as a full-width row above).
- **Medications list (`MedList` in `FieldRenderer.tsx`)** — used by both the Medications individual tracker and the Complete Tracker:
  - Replace the free-text Doctor input cell with a compact dropdown bound to the shared Doctors list.
  - Inline **+** icon next to the dropdown opens the same Add-Doctor dialog and auto-selects the new doctor for that row.
  - Stores `${n}_doctor_id` (new key) instead of/in addition to the legacy `${n}_doctor` text key. Existing string values in `${n}_doctor` are shown as a fallback label so prior data isn't lost.

### Sync (linkedEntries)

- Update `src/lib/linkedEntries.ts` so that:
  - Forward sync (Complete → Medical Records) carries `doctor_id`.
  - MedList reverse/forward sync includes the new `${n}_doctor_id` keys alongside the existing fields.
- No new sync types needed — these slot into existing Medical Records and Medications sync paths.

### Row-label placeholder rename

- In `src/components/FieldRenderer.tsx` (the `daily-month-grid` row-label input, line ~1438), change the placeholder from `"Row label (e.g. chore name, self-care item)"` to `"Label name (Title)"`.
- No other component currently shows that placeholder string.

## Files to change

- `src/lib/doctors.ts` (new) — shared doctor CRUD on top of IndexedDB.
- `src/lib/pageTypes.ts` — add `"doctor-picker"` to `FieldType`; add `doctor_id` field to Medical Records (individual) and Complete Tracker; register a hidden `doctors-directory` page type.
- `src/components/FieldRenderer.tsx` — implement `DoctorPicker` + Add-Doctor dialog; update `MedList` doctor column to a dropdown with inline add; update row-label placeholder.
- `src/lib/linkedEntries.ts` — propagate `doctor_id` and per-row `${n}_doctor_id` between Complete Tracker and individual Medical Records / Medications entries.

## Out of scope

- A dedicated "Doctors" page in navigation — doctors are managed inline from the picker dialog (lighter UX, matches the user's request). Can add later if desired.
- Migrating historical free-text doctor strings into the structured directory (existing values remain visible as fallback labels).
