# Planner fixes: schedule times, page buttons, cleaning rooms, layout & tracker cleanups

## 1. Hourly schedule becomes an add-a-row time schedule

The fixed 6 AM–10 PM list is replaced by a schedule you build:

- Starts with a few empty rows plus an "Add time block" button.
- Each row has a time dropdown in 15-minute increments (12:00 AM through 11:45 PM) and a text field for what's happening.
- Rows can be removed; rows sort by the chosen time so the day stays in order.
- Existing hourly entries are carried over into rows at their original hour, so nothing already typed is lost.

## 2. One create button per page (no duplicates)

- The entry page's bottom "New day" button is removed; the single button in the header stays.
- The collection page keeps one create button (the empty-state button remains only when there are no entries).
- Button wording follows the page's cadence instead of always saying "day".

## 3. Yearly trackers stop saying "New day"

Yearly Blood Sugar, Blood Pressure, Oxygen, Yearly Habit, Yearly Calendar, Yearly Focus, Self-Care and Workout trackers get a single "New year" button, and their cards/counts read "1 Year / 3 Years" instead of "Day 1".

## 4. Cleaning Check List becomes a daily room checklist

Replaces the year grid with a date field plus one section per room, each room having task checkboxes and a notes line:

- Kitchen, Dining Room, Living Room, Primary Bedroom, Bedroom 2, Bedroom 3, Bathroom 1, Bathroom 2, Laundry, Hallway/Entry, Office, Outside/Porch.
- Typical tasks per room (e.g. Kitchen: dishes, counters, stovetop, sink, floor, trash, fridge).
- An "Other rooms" section with free-text rows so extra rooms can be added.

## 5 & 6. Medications is an ongoing list, not daily pages

Medications is a single master list: the create button becomes "Update medications" and opens the existing list instead of creating another page. The list grows to 20 rows and gains a Strength/Dose column.

## 7. Strength section gets real columns

The Fitness Tracker "Strength" block currently shows an empty table with a bare 1–26 row numbering because no columns are defined. It becomes 12 rows with Exercise, Sets x Reps, Weight, Notes.

## 8. Layout fixes (all three)

- Medications table: columns sized to fit the page (name/reason flexible, doctor and M/A/N ticks compact) with horizontal scroll only on narrow screens.
- Fitness "Fuel & recovery": Water, Sleep, Energy/Depression, Stress and Soreness stack full width so the rating pills stop crowding.
- Monthly day grid: day rows and their note fields stay inside the page width instead of running past the edge.

## 9. Savings Goals gets real columns

Same empty-table bug as Strength: becomes 12 rows with Goal, Target, Saved, Deadline.

## 10. Mood ratings

On the Mood Journal, "Energy" is renamed "Depression" and a new "Stress" rating (1–5) is added alongside Anxiety.

## 11. Today's Feels — four times of day

The "Today's feelings" section becomes "Today's Feels" with four labelled blocks — Morning, Afternoon, Evening, Night — each with its own "Name what you feel" checkbox row (Calm, Happy, Grateful, Sad, Anxious, Angry, Overwhelmed, Lonely, Hopeful, Tired) plus an "Other" entry. Existing feelings answers are kept under Morning.

## Technical notes

- `src/lib/pageTypes.ts`: new `cadence?: "day" | "year" | "list"` on page defs (drives button and card wording); rewrite `cleaning-checklist` sections; add `columns`/`rowCount` to the `strength` and `goals` measurement grids; med-list `rowCount: 20` plus a strength column; mood-journal field renames/additions; four time-of-day checkbox groups.
- `src/components/FieldRenderer.tsx`: new `time-schedule` field type (add-row + 15-minute `<select>`), with a migration read of old `hourly` values; width fixes in `MedList`, `DailyMonthGrid` note rows.
- `src/pages/Section.tsx` and `src/pages/Entry.tsx`: cadence-aware labels ("New year", "Update medications"), remove the duplicate bottom create button.
- No database changes; all values stay in the existing entry value maps, and old keys are read forward so current entries keep their data.
