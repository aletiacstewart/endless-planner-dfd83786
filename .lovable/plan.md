# Rebuild the Complete Tracker from scratch

## Goal
The Complete Tracker becomes a simple "one day at a glance" page: one section per daily page, showing that day's entries only. Pages that aren't about a single day show as quick links at the top.

## Top: quick links (pages not tracked by day)
Buttons that open these pages:
My Goals, Yearly Calendar, Monthly Calendar, Weekly Calendar, Yearly Habit Tracker, Bi-Monthly Weight Tracker, Bi-Monthly Measurement Tracker, Yearly Blood Sugar / Blood Pressure / Oxygen / Symptom Trackers, Recipe, Yearly Focus, Monthly Budget, Debt Tracker, Savings Goals, Household Info, Coping Toolkit, Medications list, Emergency Contacts, Contacts, Important Dates, Gift Tracker.

## Body: one day from each daily page (in topic order)
Page 1 — Day & Body
1. Date + Daily Tracker (goal, priorities, schedule)
2. Meal Plan (today's breakfast, lunch, dinner, snacks)
3. Water Intake (today)
4. Fitness & Workout (today's activity)
5. Sleep Tracker (last night)
6. Today's readings (blood sugar, blood pressure, O₂, symptoms, weight) — these fill that day's cell on the yearly trackers
7. Self-Care and Cleaning checklists (today)

Page 2 — Mind & Notes
8. Mood Journal (today)
9. Gratitude Log (today)
10. Daily Journal (today's writing; photo/sketch stays on its own page with a link)
11. Brain Dump, ADHD Daily Toolkit (today)
12. Therapy Session notes (if a session today)
13. Medical Records (today's visit) and medicines taken today
14. Notes (today)

Each section keeps the same boxes as its own page and syncs both ways, matched by date. Sections will be split so both pages come out about the same length.

## What happens to existing data
Nothing is deleted. Old Complete Tracker entries stay saved; fields that matched a daily page keep showing. Any old-only boxes (like extra "+ Add" rows) just stop displaying.

## Technical details
- Replace the `complete-tracker` sections in `src/lib/pageTypes.ts` with a new `links` section plus per-page sections whose field keys reuse each daily page's own keys.
- Add a small "page links" field type in `FieldRenderer.tsx` rendering touch-friendly buttons to `/page/new?type=...` (or the latest entry).
- Rework `linkedEntries.ts` DAILY_KEYS / reverse handlers and `useAutoSave.ts` REVERSE_SYNC_TYPES so each section maps 1:1 to its page by date; yearly trackers keep writing today's cell.
- Update the page description, verify build, and test typing + sync on a real day.
