## Goal
Deep-audit the Complete Tracker ↔ individual tracker connections, ensure every individual tracker has a place on the Complete Tracker (the Weekly and Yearly sections are very thin today), **add new individual tracker pages for any Complete-Tracker items that don't yet have a dedicated tracker**, and tighten cover-theme contrast so all text stays readable.

---

## Findings

### What already syncs both ways (verified in `src/lib/linkedEntries.ts`)
| Individual Tracker | On Complete Tracker | Bi-directional |
|---|---|---|
| Daily Tracker | Date, weekday, daily goal/habit, all 4 meals + notes, wellness notes | Yes |
| Blood Sugar (yearly) | `breakfast/lunch/dinner/snacks_bs` | Yes |
| Blood Pressure (yearly) | `..._bp` | Yes |
| Oxygen (yearly) | `..._o2` | Yes |
| Self-Care Check List | Physical / Emotional / Spiritual textareas | Yes |
| Monthly Calendar | `month_calendar` grid | Yes |
| Cleaning Check List | `cleaning_today` | Yes |
| Habit Tracker (monthly) | `habit_1..3` (success/fail) | Yes |
| Yearly Habit Tracker | `habit_N_label` + `habit_N_mode` + success | Yes |
| Fun Tracker | `fun_1..3` | Forward only (intentional — month-level marks) |
| Yearly Calendar | Single `month_note_today` textarea | Yes, but cramped |
| Weekly Calendar | Single `week_note_today` textarea | Yes, but cramped |
| Weight Tracker (26-week) | Only one-shot `weight_start`/`weight_goal`/`weight_result` | No recurring sync |
| Measurement Tracker (26-week) | Only one-shot Start/Finish per body part | No recurring sync |

### Items on the Complete Tracker that do NOT have an individual tracker yet
These are real fields on the Complete Tracker that have nowhere to roll up to:
1. **Wellness ratings** — Water, Caffeine, Sweets, Sleep, Smoking/Vaping, Mood. No yearly view.
2. **Workout** — Cardio, Weights, Yoga, Stretch, Rest day, Other. No yearly view.
3. **Medications** — `med_list` (12 rows: name, reason, doctor, M/A/N times). No standalone reference page.
4. **Medical Records** — appointment notes, test results, lab notes. No standalone log.
5. **Daily Goal / Daily Habit** roll-up — a yearly view of daily goals & habit successes doesn't exist.

### Theme / contrast issues
- `src/pages/Home.tsx:135` — Backup-reminder card uses hard-coded `bg-amber-50 / border-amber-300/60`; on dark covers (Crimson Moon, Midnight Iris, Monochrome Faith, etc.) the border + icon pop too hard and the text reads inconsistently. Switch to semantic tokens.
- `text-amber-600 dark:text-amber-400` icon — same fix; use `text-accent-foreground` over an `accent-soft` chip.
- All other components already use semantic tokens (`bg-background`, `text-foreground`, `bg-primary-soft`, …) and recolor correctly with each cover. Audit of `FieldRenderer`, `PageRenderer`, `Section`, `Entry` found no other contrast bugs.
- `text-white` over the cover hero (Home, SplashScreen, CoverPicker) is fine — it sits on a dark gradient overlay regardless of palette.

---

## Plan

### 1. Add NEW individual tracker pages (so every Complete-Tracker item has a home)

Add these page types in `src/lib/pageTypes.ts`:

- **`wellness-tracker`** — "Yearly Wellness Tracker"
  Year-scoped. Six `daily-month-grid`s: water, caffeine, sweets, sleep, smoking, mood (numeric per day).
- **`workout-tracker`** — "Yearly Workout Tracker"
  Year-scoped. `daily-month-grid` per category (cardio, weights, yoga, stretch, rest_day, other) — each cell stores the day's value/duration.
- **`medications`** — "Medications"
  One-shot reference page with the same `med-list` widget (rowCount 20). Acts as the master list.
- **`medical-records`** — "Medical Records"
  Per-entry log (date + appointment notes + test results + lab notes).
- **`daily-goal-tracker`** — "Yearly Daily Goal Tracker"
  Year-scoped. `daily-month-grid` of one-line daily goals + a success/fail mark per day.

Each page gets:
- `id`, `name`, `shortName`, `description`, `icon`, sections, and a `summary()`.
- An auto-generated home-screen card (already handled by `Home.tsx`'s `PAGE_TYPES.map`).

### 2. Expand Complete Tracker so every individual tracker has matching daily fields

In `src/lib/pageTypes.ts`, on `complete-tracker`:

- **Weekly section** (new dedicated card)
  - `week_note_today` (already exists)
  - `weekly_goals` textarea
  - `weekly_reflection` textarea
- **Yearly section** (new dedicated card)
  - `month_note_today` (already exists)
  - `yearly_focus` textarea
- **Weight & Measurements** (extend the existing Measurements card)
  - `weight_today` (number) + `weight_today_notes` (text)
  - `m_<part>_today` compact text per body part (8 parts)
- (Wellness ratings, Workout, Medications, Medical Records — already on the Complete Tracker; no new fields needed, just the new sync below.)

### 3. Forward sync — `syncLinkedEntries` (Complete → Individual)

In `src/lib/linkedEntries.ts`, extend the engine:

- **Weekly Calendar:** also write `weekly_goals` and `reflection`.
- **Yearly Calendar:** if `yearly_focus` is filled, merge as a leading line in `month_<name>` (de-duped on re-save).
- **Weight Tracker:** find/create the active `weight-tracker` (latest `start_date` ≤ today). Compute the week index `floor((today − start_date) / 7d)` clamped 0–25. Merge `{Date, Weight, Difference, Notes}` into that week row of the `weight_log` measurement-grid.
- **Measurement Tracker:** same logic — write per-part `m_<part>_today` values into the right week row.
- **Wellness Tracker:** for each rating field, write the numeric value into the matching `daily-month-grid` cell `${day}-${monthIndex}`.
- **Workout Tracker:** for each category, write the day's value (or "✓" for `rest_day`) into the matching grid cell.
- **Medical Records:** if appointment/test/lab fields are filled, find/create a per-day `medical-records` entry by date and copy the three textareas.
- **Daily Goal Tracker:** write `daily_goal` into the day cell, plus the success/fail of `daily_habit` into a separate "achieved" map.
- **Medications:** keep this one-way "reference only" — Complete Tracker reads from a single `medications` master entry. Plan: when a Complete Tracker is opened with no `med_list` yet, prefill from the master `medications` entry (read-only seed; user can still edit per-day).

### 4. Reverse sync — `syncFromIndividual` (Individual → Complete)

- **Weekly Calendar:** when `weekly_goals` / `reflection` change, mirror back into every Complete Tracker entry whose date is in that Mon–Sun window.
- **Weight Tracker:** when a row's `Date` + `Weight` is edited, update the matching Complete Tracker entry's `weight_today` / `weight_today_notes`.
- **Measurement Tracker:** when a row is edited, update the matching Complete Tracker's `m_<part>_today` values.
- **Wellness / Workout / Daily Goal Tracker:** when a cell changes, update only existing Complete Tracker entries for that date (never create new ones).
- **Medical Records:** when a per-day entry is edited, update the matching Complete Tracker entry's three medical textareas.

Update `REVERSE_SYNC_TYPES` in `src/hooks/useAutoSave.ts` to include `weight-tracker`, `measurement-tracker`, `wellness-tracker`, `workout-tracker`, `medical-records`, `daily-goal-tracker`.

### 5. Theme/contrast fixes

In `src/pages/Home.tsx`:
- Replace `border-amber-300/60 bg-amber-50 dark:bg-amber-950/20` with `border-accent/40 bg-accent-soft/60`.
- Replace `text-amber-600 dark:text-amber-400` with `text-accent-foreground` over a small `bg-accent` chip so the warning icon adapts to every palette.

In `src/hooks/useCoverTheme.ts`:
- Derive and set `--accent-soft` from each cover's `accent` (drop saturation, raise lightness in light mode / lower in dark mode) so we don't have to add the field to all ~70 palettes.

### 6. UX polish on the Complete Tracker

- Add a brief italic hint under each new section naming the individual tracker it syncs to (matches the existing pattern on Cleaning / Calendar Notes).
- Reorder Complete Tracker sections so the flow reads: Date → Daily Goal → Monthly Calendar → Meals → Wellness → Self-Care → Workout → Measurements (incl. weekly weigh-in) → Wellness Notes → Medications → Medical Records → Fun & Habits → Cleaning → Weekly → Yearly.

### 7. Manual QA after build

Spot-check on three palettes representing worst contrast risks:
- **paletteMonochromeFaith** (pure dark) — reminder card and field labels readable.
- **paletteSparrowDandelion** (warm light) — primary/accent buttons keep contrast.
- **paletteCrimsonMoon** (dark with red primary) — focus rings on inputs stay visible.

---

## Technical details

- New helpers in `linkedEntries.ts`:
  - `weekIndexFromStart(startIso, todayIso): number | null` — clamp 0..25.
  - `mergeMeasurementGridRow(value, rowIdx, partial): newValue` — preserves other rows/cols of the `measurement-grid` shape (verify exact shape from `FieldRenderer`).
  - `mergeDailyMonthCell` already exists — reused for Wellness/Workout/Daily Goal grids.
- New field keys on `complete-tracker`: `weekly_goals`, `weekly_reflection`, `yearly_focus`, `weight_today`, `weight_today_notes`, `m_<part>_today` × 8.
- No DB migration needed — `PlannerEntry.values` is a free-form record; new pages just appear via `PAGE_TYPES`.
- Auto-save debounce stays at 500 ms; new sync work is constant-time per entry.

## Files to change
- `src/lib/pageTypes.ts` — 5 new page types + Complete Tracker schema additions/reordering.
- `src/lib/linkedEntries.ts` — forward + reverse sync for the new trackers, weekly extras, yearly focus, weight, measurements.
- `src/hooks/useAutoSave.ts` — extend `REVERSE_SYNC_TYPES`.
- `src/hooks/useCoverTheme.ts` — derive and set `--accent-soft` per cover.
- `src/pages/Home.tsx` — replace hard-coded amber tokens on the backup-reminder card.
