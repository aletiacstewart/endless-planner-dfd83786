## Goal

Expand the **Daily Tracker** to include every item shown in the uploaded PDF (page 2). Keep the current visual design exactly as-is — same card style, same typography, same cover-driven theme colors. No layout overhaul; just additional fields plugged into the existing renderer.

After you've reviewed and approved the new Daily Tracker, you'll tell me which separate pages to remove (Self-Care Check List, Cleaning Check List, Blood Sugar Tracker, Blood Pressure Tracker, Oxygen Tracker, etc.) and I'll remove them in a follow-up step. Nothing is removed in this round.

## What gets added to the Daily Tracker

In the order they appear on page 2 of your PDF:

1. **Daily Goal** — single textarea at the top (under Date / Day).
2. **Daily Habit** — Success / Failed toggle pair (right next to Daily Goal).
3. **Meals → per-meal health readings** — under each of Breakfast / Lunch / Dinner / Snacks, three small inputs + a notes field:
   - Blood Sugar
   - Blood Pressure
   - O₂ Levels
   - Notes
4. **Wellness → "Other" input** appended to each rating row:
   - Water (1–8 + Other)
   - Caffeine (1–6 + Other)
   - Sweets (1–5 + Other)
   - Sleep (1–12 + Other)
5. **Wellness → Smoking / Vaping** — new 1–12 rating + Other.
6. **Self-Care** (new section) — three textareas:
   - Physical Self-Care
   - Emotional Self-Care
   - Spiritual Self-Care
7. **Daily Notes** — large textarea below Self-Care.
8. **Workout** — keep existing Cardio / Weights / Yoga / Stretch / Rest day / Other (already matches the PDF).
9. **Daily Chores** (new section) — 5 short text inputs (one chore per line).

## Visual / theme consistency

- Reuses the existing `planner-card`, `field-label`, and `bg-background/60` classes — same look as today.
- All new ratings use the existing rating button style (so they pick up the cover-selected theme automatically).
- Section titles use the same `font-display text-xl` heading as Meals / Wellness / Workout today.
- No new colors, no new fonts, no new spacing tokens.

## Technical changes

**`src/lib/pageTypes.ts`** — extend the `daily-tracker` page schema only:

- Add `daily_goal` (textarea) + `daily_habit` (new `success-fail` field) to a new top section.
- Add 4 new fields per meal: `breakfast_bs`, `breakfast_bp`, `breakfast_o2`, `breakfast_notes` (and same for lunch/dinner/snacks).
- Add `*_other` text field next to each existing rating: `water_other`, `caffeine_other`, `sweets_other`, `sleep_other`.
- Add `smoking` (rating, max 12) + `smoking_other`.
- Add Self-Care section with `self_physical`, `self_emotional`, `self_spiritual` textareas.
- Add `daily_notes` textarea.
- Add Daily Chores section with `chore_1`…`chore_5` text fields.

**`src/lib/pageTypes.ts` — `FieldType`** — add one new type:
- `"success-fail"` — pair of pill buttons (Success / Failed), single-select, third click clears.

**`src/components/FieldRenderer.tsx`** — add render case for `success-fail` only (everything else is already supported). Reuses existing button styles so theme follows the cover.

**No changes to**:
- `db.ts` (values are stored as a generic record, new keys auto-persist)
- exporters (CSV/PDF/Excel iterate all keys, will pick up new ones automatically)
- routing, navigation, or any other page

## Out of scope (for this round)

- Removing the Self-Care, Cleaning, Blood Sugar, Blood Pressure, Oxygen, etc. pages — done after you confirm the new Daily Tracker.
- Page 3 (Measurements / Medications), Page 4 (Fun Tracker), Page 5 (Habit Tracker) of the PDF — those already exist as separate pages and aren't being merged into Daily Tracker.

## Files touched

- `src/lib/pageTypes.ts` — schema extension + new `FieldType`.
- `src/components/FieldRenderer.tsx` — one new render case (`success-fail`).
