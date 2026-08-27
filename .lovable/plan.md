# Per-Doctor Medical Notes

Make Appointment Notes, Test Results, and Lab Result Notes belong to the doctor chosen in "Doctor seen". Switching doctors swaps to that doctor's notes; switching back brings the earlier notes right back. Applies to both the Complete Tracker (page 2 medical block) and the standalone Medical Records page.

## Behavior

- Pick Dr. A, type notes → notes are saved under Dr. A.
- Switch to Dr. B → the three boxes show Dr. B's notes for this sheet (blank if none yet).
- Switch back to Dr. A → Dr. A's notes reappear.
- No doctor selected → notes are stored unscoped, exactly as today, and existing entries keep showing what they already have.
- A small hint under the section shows whose notes are on screen (e.g. "Notes for Dr. Lee").

## Technical notes

- Add an optional `scopeByKey?: string` to `FieldDef` in `src/lib/pageTypes.ts`, set to `"doctor_id"` on the three medical textareas in both `complete-tracker` (page 2) and `medical-records`.
- In `src/components/FieldRenderer.tsx`, when `scopeByKey` is set and the scope value is non-empty, read/write `values[`${key}__${scopeValue}`]`, falling back to the plain `key` value on first read so existing notes migrate into the first doctor selected. When the scope is empty, use the plain key.
- Keep the legacy plain keys intact so nothing is lost; scoped keys are additive (`medical_appointment_notes__<doctorId>` etc.).
- Update `src/lib/linkedEntries.ts` (both directions, around the medical mirror at lines ~462 and ~844) to copy `doctor_id` plus any keys prefixed with the three medical field names, so per-doctor notes stay in sync between Complete Tracker and Medical Records instead of only the unscoped values.
- No database or schema change: everything lives inside the entry's existing `values` JSON, which already syncs to the cloud.
