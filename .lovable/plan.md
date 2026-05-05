# Sync audit — Complete Tracker ⇄ individual pages

I walked the Complete Tracker schema (`src/lib/pageTypes.ts`), every individual tracker it claims to feed, and the two-way sync in `src/lib/linkedEntries.ts`. Almost everything lines up. There is one real gap: the **Wellness** block on the Complete Tracker drifted from the new Daily Tracker layout, and those wellness fields are not in the sync key lists at all.

## What's already in sync (no changes needed)

- Daily Tracker: date/weekday/daily_goal/daily_habit, all 4 meals + notes, daily_notes
- Vitals: blood sugar / blood pressure / oxygen (4 meal-prefixed values per day)
- Self-Care (physical / emotional / spiritual)
- Monthly Calendar grid, Yearly Calendar month notes, Weekly Calendar (weekday note + weekly goals + reflection)
- Cleaning Check List
- Yearly Habit Tracker (label / mode / success per day)
- Yearly Workout Tracker (cardio, weights, yoga, stretch, rest_day, other)
- Medical Records (notes, test results, lab notes, doctor)
- Weight Tracker (weekly row from `weight_today`)
- Measurement Tracker (per body part `m_<part>_today`)
- Medications master list
- Yearly Focus

## Problems found

### 1. Wellness section on Complete Tracker is out of date
The Daily Tracker was rebuilt with **checkbox-group** rows (one box per unit) and an "Other" fill-in for each. The Complete Tracker still uses old **rating** fields with mismatched maxes and a missing/renamed field:

| Topic | Daily Tracker | Complete Tracker | Issue |
|---|---|---|---|
| Water | checkbox-group, 8 boxes | rating max 8 | type mismatch, won't sync |
| Meal intake | checkbox-group, 6 boxes | **missing entirely** | field absent on Complete |
| Caffeine / Other | checkbox-group, 4 boxes | rating max **6** | wrong count + type |
| Sweets / Savory | checkbox-group, 4 boxes | rating max 4 | type mismatch |
| Habits (smoking/vaping/dipping/other) | `habits`, 8 boxes | `smoking`, rating max **12** | wrong key, count, type |
| Mood | checkbox-group of Anger/Fear/Sadness/Disgust/Joy | mood-rating 1–5 faces | different concept |
| Sleep | checkbox-group, 12 boxes | rating max 12 | type mismatch |
| Other (per topic) | `*_other` text input | none | no Other field on Complete |

### 2. Wellness keys are not part of the sync
`syncLinkedEntries` (Complete → Daily) and `syncFromIndividual` (Daily → Complete) only copy `dailyKeys`, which today is just date/weekday/goal/habit/meals/notes. None of the wellness keys (`water`, `meals`, `caffeine`, `sweets`, `habits`, `mood`, `sleep`, plus the `_other` fields) are in either list — so even if the fields matched, they wouldn't move between pages.

## Plan

### A. Update Complete Tracker Wellness group to match Daily Tracker
In `src/lib/pageTypes.ts`, replace the six wellness rating fields inside the "Wellness, Self-Care, Workout & Measurements" section with the same checkbox-group definitions used on Daily Tracker:

- `water` — checkbox-group 1–8, `otherKey: water_other`
- `meals` — checkbox-group 1–6, `otherKey: meals_other`  (new on Complete)
- `caffeine` — checkbox-group 1–4, `otherKey: caffeine_other`
- `sweets` — checkbox-group 1–4, `otherKey: sweets_other`
- `habits` — checkbox-group 1–8, `otherKey: habits_other`  (renames `smoking` → `habits`)
- `mood` — checkbox-group of `["Anger","Fear","Sadness","Disgust","Joy"]`, `otherKey: mood_other`
- `sleep` — checkbox-group 1–12, `otherKey: sleep_other`

### B. Add wellness keys to both sync directions
In `src/lib/linkedEntries.ts`:

- Extend `dailyKeys` (in `syncLinkedEntries`) and `DAILY_KEYS` (used by `syncFromIndividual`) to also include:
  `water, water_other, meals, meals_other, caffeine, caffeine_other, sweets, sweets_other, habits, habits_other, mood, mood_other, sleep, sleep_other`
- `copyKeys` already handles array values (it treats anything non-empty as a value to copy, and clears empty/undefined), so checkbox-group arrays will round-trip correctly.

### C. Note on a couple of fields with no twin (intentional, no change)
- `fun_1..3` and `habit_1..3` "Fun & Habit" mini-trackers on the Complete page have no standalone individual page anymore (those pages were removed earlier). The habit half still feeds Yearly Habit Tracker; the fun half is Complete-only by design. Leaving as is.
- `month_calendar`, `cleaning_today`, `week_note_today`, `weekly_goals`, `weekly_reflection`, `month_note_today`, `yearly_focus`, `weight_today`, `m_<part>_today`, and `med_list` only live on the Complete Tracker side of the meals/measurements/calendar relationships — already covered by their dedicated sync blocks.

## Files to edit
- `src/lib/pageTypes.ts` — rewrite the Wellness group inside `complete-tracker`
- `src/lib/linkedEntries.ts` — extend `dailyKeys` and `DAILY_KEYS`

No data migration is needed: old `smoking` rating values will simply stop displaying (the field is gone), and existing checkbox-group values from Daily Tracker will start mirroring on next save.
