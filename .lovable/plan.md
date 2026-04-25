# Why these pages weren't there

Your planner currently has **10 page types**: My Goals, Goals Reflection, Yearly Calendar, Monthly Calendar, Weekly Calendar, Daily Tracker, Habit Tracker (monthly, 31 days), Fun Tracker, Recipe, Notes.

The 17 PDFs you uploaded across both batches represent **8 distinct tracker pages** that were never added — they're all health / self-care / household trackers missing from `src/lib/pageTypes.ts`. Many PDFs are just the second half (Jul–Dec) of a tracker whose first half (Jan–Jun) is on a different PDF, so they collapse into one page in the app.

# What's missing (mapped to your PDFs)

| # | Page (app)                         | PDFs covered             | Layout                                                            |
|---|------------------------------------|--------------------------|-------------------------------------------------------------------|
| 1 | **Bi-Monthly Weight Tracker**      | 41                       | 26 weeks × Date / Weight / Difference / Notes                     |
| 2 | **Bi-Monthly Measurement Tracker** | 42                       | 26 weeks × 8 body-measurement columns                             |
| 3 | **Yearly Blood Sugar Tracker**     | 43 + 44                  | 31 days × 12 months value grid + Achieved ✓                       |
| 4 | **Yearly Blood Pressure Tracker**  | 45 + 46                  | 31 days × 12 months value grid + Achieved ✓                       |
| 5 | **Yearly Oxygen (O₂) Tracker**     | 47 + 48                  | 31 days × 12 months value grid + Achieved ✓                       |
| 6 | **Yearly Habit Tracker**           | 49                       | 12 months × Begin/Break + 31-day check-in row                     |
| 7 | **Cleaning Check List**            | 62 + 63                  | 31 days × 12 months grid + chore label per row + Achieved ✓       |
| 8 | **Self-Care Check List**           | 64+65, 66+67, 68+69      | One page, **three category sections** (Physical / Emotional / Spiritual), each a 31×12 grid + Achieved ✓ |

# Plan

## 1. Extend the field schema (`src/lib/pageTypes.ts` + `src/components/FieldRenderer.tsx`)

Add three new `FieldType`s (the existing `month-tracker`/`habit-grid` aren't enough — they only support checkboxes, not free-text values, and don't span the 31×12 reading layout):

- `measurement-grid` — fixed N rows × labelled columns (numeric/text). Used by Weight (4 cols) and Measurement (8 cols).
- `daily-month-grid` — 31 rows × 12 month columns of free-text values + "Achieved" check column. Used by Blood Sugar, Blood Pressure, O₂, Cleaning, and each Self-Care section.
- `yearly-habit-grid` — 12 month rows, each with Begin/Break radio + habit text + 31 check cells. Used by the Yearly Habit Tracker.

Each new field type gets a renderer in `FieldRenderer.tsx` that mirrors the styling of the current `habit-grid` / `month-tracker` (sticky first column, horizontal scroll on small screens, semantic tokens only — no hard-coded colours).

## 2. Register the 8 new page types in `PAGE_TYPES`

Each page follows the existing `PageTypeDef` shape so it's automatically picked up by:
- the section grid on `Home.tsx` (lists every page type),
- the `Section.tsx` route (`/section/:pageTypeId`),
- the `PageRenderer` (renders sections + fields),
- the existing autosave + cover-theming pipeline (no extra wiring).

Suggested IDs / icons:

```text
weight-tracker         icon: Scale          (Bi-Monthly Weight)
measurement-tracker    icon: Ruler          (Bi-Monthly Measurements)
blood-sugar-tracker    icon: Droplet        (Yearly Blood Sugar)
blood-pressure-tracker icon: HeartPulse     (Yearly Blood Pressure)
oxygen-tracker         icon: Activity       (Yearly Oxygen O2)
yearly-habit-tracker   icon: CalendarCheck  (Yearly Habit Tracker)
cleaning-checklist     icon: Sparkle        (Cleaning Check List)
self-care-checklist    icon: HeartHandshake (Self-Care Check List)
```

The **Self-Care Check List** is one page with three sections — Physical, Emotional, Spiritual — each rendered as its own `daily-month-grid`. This matches the printable PDFs exactly (they're three category variants of the same template) without bloating the section list.

The existing **monthly Habit Tracker** stays as-is — the new **Yearly Habit Tracker** is a separate page (matches PDF 49 exactly: 12 months × Begin/Break + 31 check cells).

## 3. Display + ordering on Home

Group the new pages logically. Suggested order on Home:

```text
Daily Tracker
Habit Tracker (monthly)
Yearly Habit Tracker
Weight Tracker
Measurement Tracker
Blood Sugar Tracker
Blood Pressure Tracker
Oxygen Tracker
Self-Care Check List
Cleaning Check List
Fun Tracker
Recipe
Notes
```

## 4. Backwards compatibility

No existing entries change shape. The `FieldValue` type already accepts arbitrary nested objects, so the new grids serialise cleanly into the same `entries` table without a migration.

# Out of scope for this batch

- Cover artwork / palettes — already handled in earlier turns.
- PDF export of these new trackers — separate task if you want it later.
- Any additional pages you haven't sent yet.

# Acceptance check

After implementation:
- All 8 new pages appear on `Home.tsx` in the order above.
- Each opens, lets you add an entry, fills the matching grid(s), autosaves, and reopens with the saved values.
- Self-Care page shows Physical / Emotional / Spiritual as three distinct grids on the same entry.
- `bunx tsc --noEmit` is clean.
