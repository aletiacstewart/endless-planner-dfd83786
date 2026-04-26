## Goal

Replace the current 10-row "Medications" block (Name + Reason) on the Daily Tracker with three time-of-day medication sections, each holding 12 medications with three columns: Medication Name, Reason, Prescribing Doctor.

## What changes on the page

The single "Medications" section becomes three sections, in this order, right where Medications sits today:

1. **Daily Medications** — 12 rows
2. **Afternoon Medications** — 12 rows
3. **Night Medications** — 12 rows

Each row has three text inputs side-by-side:
- Medication Name
- Reason
- Prescribing Doctor

Same card style, same field styling, same cover-driven theme as the rest of the Daily Tracker. No new field types, no renderer changes.

## Layout

Each section uses a 3-column grid so one row of the section reads as: `Name | Reason | Doctor`. With 12 meds × 3 fields = 36 inputs per section, laid out as 12 rows.

```text
DAILY MEDICATIONS
[ Med 1 Name ] [ Med 1 Reason ] [ Med 1 Doctor ]
[ Med 2 Name ] [ Med 2 Reason ] [ Med 2 Doctor ]
...
[ Med 12 Name ] [ Med 12 Reason ] [ Med 12 Doctor ]
```

## Technical changes

**`src/lib/pageTypes.ts`** — in the `daily-tracker` schema:

- Remove the existing Medications section (`med_1_name`/`med_1_reason` … `med_10_name`/`med_10_reason`).
- Add three new sections with `columns: 3`:
  - Daily: keys `med_day_1_name`, `med_day_1_reason`, `med_day_1_doctor` … through `_12_`
  - Afternoon: keys `med_aft_1_name`, `med_aft_1_reason`, `med_aft_1_doctor` … through `_12_`
  - Night: keys `med_night_1_name`, `med_night_1_reason`, `med_night_1_doctor` … through `_12_`
- All fields are `type: "text"` (no new field types).
- Generated with a small loop helper inline so the schema stays compact.

**No changes to**:
- `FieldRenderer.tsx`
- `PageRenderer.tsx`
- `db.ts`, exporters, routing — new keys auto-persist and auto-export.

## Note on existing data

The old `med_1_name` … `med_10_reason` keys are abandoned. Any previously saved values in those keys will no longer be displayed (they remain harmlessly in storage). If you'd rather migrate the old values into "Daily Medications", say the word and I'll add a one-time mapping.

## Files touched

- `src/lib/pageTypes.ts`
