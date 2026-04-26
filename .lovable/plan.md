## Goal

Split the consolidated tracker into two page types:

1. **Complete Tracker** (renamed from current "Daily Tracker") — keeps every section (date, meals, vitals, wellness, self-care, workout, measurements, meds, medical records, fun/habits, monthly calendar, recipe, notes).
2. **Daily Tracker** (re-added, lightweight) — the original simple page: date, daily goal, meals, wellness notes.

Re-add the section types that were removed in the previous task so users can also use them standalone. When a user fills out a **Complete Tracker** entry, the app automatically creates/updates matching entries in **Daily Tracker** and the other related trackers, keyed by date so the same day always updates the same linked entry.

## What the user will see

**Home grid sections (restored):**
- Complete Tracker (was Daily Tracker)
- Daily Tracker (lightweight original)
- Monthly Calendar
- Habit Tracker
- Bi-Monthly Weight Tracker
- Bi-Monthly Measurement Tracker
- Yearly Blood Sugar / Blood Pressure / Oxygen Trackers
- Self-Care Check List
- Fun Tracker
- Recipe
- Notes
- (plus the ones already kept: Goals, Goals Reflection, Yearly Calendar, Weekly Calendar, Yearly Habit Tracker, Cleaning Check List)

**On a Complete Tracker entry:**
- Same layout as today (top section nav, date, meals, wellness, etc.)
- A small status line under the header: "Linked entries auto-saved: Daily Tracker, Monthly Calendar (Apr 2026), Blood Sugar (2026), Blood Pressure (2026), Oxygen (2026), Self-Care (2026), Habit Tracker (Apr 2026), Weight Tracker, Measurement Tracker, Fun Tracker (2026)."
- Each time the user edits a field, the matching field in the linked entries is updated in the background.

**On the lightweight Daily Tracker:** date, day-of-week pills, daily goal, daily habit success/fail, meals (breakfast/lunch/dinner/snacks with one notes box each), and a wellness notes textarea. No vitals, meds, measurements, etc. — those live in dedicated trackers or in Complete Tracker.

## Linking rules (which Complete Tracker fields fan out where)

Linked entries are looked up / created using a deterministic key based on the entry's `date` field:

| Complete Tracker fields | Target page type | Key | Field mapping |
|---|---|---|---|
| date, weekday, daily_goal, daily_habit, breakfast/lunch/dinner/snacks (+ notes), daily_notes | `daily-tracker` | `date` (YYYY-MM-DD) | same field keys |
| breakfast_bs, lunch_bs, dinner_bs, snacks_bs | `blood-sugar-tracker` | `year` of date | writes into `blood_sugar` grid cell `[month][day]` (concatenated `B/L/D/S` values) |
| breakfast_bp, lunch_bp, dinner_bp, snacks_bp | `blood-pressure-tracker` | `year` of date | same pattern into `blood_pressure` |
| breakfast_o2, lunch_o2, dinner_o2, snacks_o2 | `oxygen-tracker` | `year` of date | same pattern into `oxygen` |
| self_physical, self_emotional, self_spiritual | `self-care-checklist` | `year` of date | writes into `physical` / `emotional` / `spiritual` grid cell `[month][day]` |
| month_calendar (per-day notes) | `monthly-calendar` | `month + year` of date | writes into `calendar` grid cells |
| habits (fun_1..3, habit_1..3 + labels + modes) | (kept inside Complete Tracker only — no fan-out target) | — | — |
| Weight (m_weight pair, weight_result) | `weight-tracker` | most recent open entry, else create new | appends/updates the row matching the date |
| Measurements (m_*_start/_finish) | `measurement-tracker` | most recent open entry, else create new | appends/updates the row matching the date |

For grids (`daily-month-grid`, `calendar-grid`), the field value is an object the existing FieldRenderer already understands; the link helper just merges into the right inner cell.

If the user clears a field in Complete Tracker, the linked field is also cleared.

Linked entries are **never deleted automatically** — deleting a Complete Tracker entry leaves the linked daily/monthly/yearly entries intact (they may also contain manual edits).

## Other small changes the user asked for previously (still in scope)

- "Add a daily" button label on the Daily Tracker section list (instead of "Add another daily").
- Sticky in-page section nav at top of Complete Tracker that scrolls to each section.
- Both trackers auto-save (already wired through `useAutoSave`).

## Technical changes

### `src/lib/pageTypes.ts`
- Rename current daily-tracker entry: `id: "complete-tracker"`, `name: "Complete Tracker"`, `shortName: "Complete"`, updated description ("All-in-one daily log — meals, vitals, wellness, meds, measurements, calendar and more. Auto-syncs to your individual trackers.").
- Add a new lightweight `daily-tracker` page type with sections: date+weekday, daily goal + daily habit, meals (4 meals each with `*_notes` textarea), wellness notes. Same field keys used by Complete Tracker so the cross-write helper can copy values 1:1.
- Re-add the page types that were removed in the previous task: `monthly-calendar`, `habit-tracker`, `weight-tracker`, `measurement-tracker`, `blood-sugar-tracker`, `blood-pressure-tracker`, `oxygen-tracker`, `self-care-checklist`, `fun-tracker`, `recipe`, `notes` (definitions already exist in the current file based on the current view — confirm during edit and restore any that were dropped).

### `src/lib/linkedEntries.ts` (new)
- Export `LINK_RULES`: an array describing each fan-out rule (target pageType, key strategy, field copier function).
- Export `syncLinkedEntries(completeEntry: PlannerEntry)`:
  1. For each rule, compute the lookup key from `completeEntry.values.date`.
  2. `listEntries(targetPageType)` and find the matching entry; create one with `createEntry` if none.
  3. Apply the rule's copier to merge fields into the target entry's `values`.
  4. `saveEntry(targetEntry)` with bumped `updatedAt`.
- Helpers:
  - `simpleCopy(keys: string[])` — copies same-named fields.
  - `gridCopy(targetField: string, srcKeys: Record<string,string>)` — writes into `values[targetField][monthIndex][dayIndex]`.
  - `calendarCopy(targetField: string, srcKey: string)` — for `month_calendar` → `monthly-calendar.calendar`.

### `src/hooks/useAutoSave.ts`
- After `saveEntry(...)` of a Complete Tracker entry, call `syncLinkedEntries(entry)` (gated on `entry.pageType === "complete-tracker"`).
- Surface a brief toast or status string ("Synced 5 linked entries") — small text under the existing "Saved" indicator. Failure is logged, not blocking.

### `src/pages/Entry.tsx`
- Show a small "Linked entries" line under the page title when `pageType.id === "complete-tracker"` listing the targets that will sync.

### `src/pages/Section.tsx`
- Change CTA copy: when `pageType.id === "daily-tracker"`, render "Add a daily" instead of "Add another {shortName}". Other sections keep existing copy (or change to plain "Add {shortName}" — TBD, leaving as-is unless requested).

### `src/lib/exporters.ts`
- No change required — exporter walks all entries and reads each pageType's name from `PAGE_TYPES`. New IDs (`complete-tracker`, restored trackers) work automatically.

### Backwards compatibility
- Existing entries already saved with `pageType: "daily-tracker"` will become orphaned (their schema matches Complete Tracker). Add a one-time migration in `src/lib/db.ts` `upgrade` (or a lazy fix in `getEntry`) that rewrites `pageType` from `"daily-tracker"` → `"complete-tracker"` for any entry that contains keys unique to the consolidated layout (e.g. `med_list` or `m_weight_start`).

## Out of scope

- No backend changes — everything stays in IndexedDB.
- No UI for "unlinking" a synced entry — sync is one-way (Complete → individual). Editing an individual tracker does not push back into Complete Tracker for the same date.
