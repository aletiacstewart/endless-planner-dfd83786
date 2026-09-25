# Rebalance the Complete Tracker pages

Right now Page 1 carries 22 sections and Page 2 only 11, so Page 1 is far longer. This plan regroups every section into clear topic blocks and splits them so both pages come out about the same length.

## New layout

**Page 1 — "Your Day & Body"** (planning your day + physical health, in the order your day happens):
1. Date & Day
2. Daily Goal
3. Top 3 Priorities
4. Hourly Schedule
5. How the Day Felt
6. Monthly Calendar
7. Meals (breakfast / lunch / dinner / snacks)
8. Today's Vitals
9. Today's Symptoms
10. Wellness (water, caffeine, sweets)
11. Wellness Notes
12. Workout
13. Measurements
14. Sleep
15. Mood Check-In
16. Today's Feels

**Page 2 — "Mind, Home & Life"** (reflection, home, money and health records):
1. Gratitude
2. Self-Care
3. Fun Activity Tracker
4. Begin / Break Habits
5. Cleaning
6. Money Today
7. This Week
8. This Year
9. Dates & Gifts
10. Today's Notes
11. Daily Journal
12. Brain Dump
13. Focus & ADHD
14. Therapy & Coping
15. Medical Records
16. Doctor Notes
17. Medicines

That puts 16 sections on Page 1 and 17 on Page 2, and because Page 1's sections are the big ones (Meals, Workout, Hourly Schedule) while Page 2's are mostly short, the two pages end up nearly the same length.

## Technical notes

- Only the `page:` numbers and section order change in `src/lib/pageTypes.ts` (the `complete-tracker` definition, around line 445).
- Nothing you've written moves or is lost — page numbers only control where a section displays; all keys and two-way syncing stay exactly as they are.
- The page description text is updated to match the new grouping.
