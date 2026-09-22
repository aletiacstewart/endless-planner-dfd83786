# Planner content, layout, drawing, and sync overhaul

## Goal

Make the affected planner pages more useful, keep every table and control inside its intended page, add touch/stylus sketching, and make daily information flow reliably between standalone trackers and the Complete Tracker.

## Page changes

1. **Gift Tracker**
   - Keep the gift table on page 1.
   - Narrow Budget and tighten Purchased/Wrapped so all six columns fit cleanly.
   - Put numbered, compact notes rows on page 2; each note stays paired with the same gift row number.
   - Keep “Add person” growing both the gift rows and matching notes rows together.

2. **Important Dates**
   - Add a Relationship dropdown after Date.
   - Options: Spouse/Partner, Parent, Child, Sibling, Grandparent, Grandchild, Relative/Extended Family, Friend, Coworker, Client/Business, Neighbor, Caregiver, Other.
   - Keep the existing Occasion picker, custom “Other” entry, date picker, notes, and add-person action.

3. **Day 31 and yearly health logs**
   - Ensure row-style month trackers include day 31 consistently; actual calendar pages will still respect real month lengths.
   - Add a note line for every day beneath each month on yearly Blood Sugar, Blood Pressure, and O₂ trackers.
   - Preserve existing readings while extending their stored grid data.

4. **Coping Toolkit**
   - Expand it into a guided two-page tool: warning signs, body signals, grounding steps, breathing, sensory tools, movement, distractions, supportive people/places, helpful words, boundaries, things to avoid, a step-by-step crisis plan, professional contacts, and a “when I am safer” follow-up.
   - Use short, supportive prompts and clear descriptions without presenting medical advice.

5. **Therapy Session Notes**
   - Expand preparation, session, and follow-up prompts: current concerns, symptoms/patterns, changes since last session, goals, questions, key insights, emotions/body responses, coping tools discussed, action plan, homework, barriers, medication/questions, next appointment, and private reflection.

6. **Mood Journal and gratitude**
   - Add a notes area directly after each Morning, Afternoon, Evening, and Night feelings group.
   - Keep one canonical gratitude record shared by the Gratitude Log, Daily Tracker, and Complete Tracker.
   - Remove redundant gratitude blocks from Mood Journal and Self-Care; existing canonical gratitude data remains intact.

7. **Meal Plan & Grocery**
   - Keep all seven days of “This week’s meals” together on page 1.
   - Rebuild page 2 as a practical grocery list: larger ingredient areas grouped by meal/day, plus one consolidated Staples/Household list instead of four repetitive lists.
   - Keep rows addable and avoid narrow ingredient fields.

8. **Savings Goals**
   - Replace ambiguous “Goal / Target” wording with clear columns: Goal name, Target amount, Amount saved, Remaining, Deadline, and Progress/Status.
   - Calculate Remaining from target and saved values instead of asking users to repeat information.

9. **ADHD Daily Toolkit**
   - Expand support for ADHD and OCD-related daily needs with brain dump, task breakdown, estimated effort, must/should/could priorities, time awareness, distraction parking lot, sensory needs, transition plan, medication, body-doubling/support, exposure/urge notes, reassurance/compulsion awareness, regulation breaks, wins, and tomorrow setup.
   - Keep language supportive and avoid diagnostic or treatment claims.

10. **Fitness Tracker**
    - Rebalance the page across the spread and add selectable activity types including walking, running, cycling, swimming, strength, mobility, stretching, yoga, Pilates, dance, sports, hiking, HIIT, rehabilitation/PT, and Other.
    - Improve exercise logging with activity, duration, distance, intensity, sets, reps, weight/resistance, heart-rate notes, warm-up/cool-down, recovery, pain/soreness, and notes without duplicating the yearly workout grid.

11. **Combined Cleaning page**
    - Merge Weekly Cleaning into Cleaning Check List as one page type containing weekly zones, room-by-room tasks, today’s summary, supplies on hand, and need-to-buy items.
    - Remove the separate Weekly Cleaning destination while preserving and carrying over its existing entries where possible.
    - Keep the daily cleaning summary synced with Complete Tracker.

12. **Self-Care Check List**
    - Remove repeated section/field titles.
    - Expand and correct each category’s choices: Physical, Emotional, Mental, Spiritual, Social, Practical/Home, Rest, and Boundaries.
    - Align selection controls with their labels and keep category-specific notes.

13. **Daily Tracker vitals**
    - Add that day’s Blood Sugar, Blood Pressure, and O₂ fields in a dedicated Vitals block.
    - Sync those values to the matching day in each yearly health tracker and to the Complete Tracker in both directions.

14. **Monthly and yearly calendars**
    - Fix “Habits this month” sizing, alignment, fold behavior, and day labels through 31.
    - Keep the yearly calendar’s year and dated-note picker on page 1; move all twelve month notes to page 2 and enlarge them.

15. **Terminology**
    - Change every visible “Success” label to “Accomplished.”
    - Change every visible “Failed” label to “Needs Improvement.”
    - Preserve stored values so existing selections are not lost.

## Drawing tools

Add a reusable touch, mouse, and stylus sketch field with:

- Pen and eraser
- Theme-aware color choices
- Stroke thickness control
- Undo and redo
- Clear with confirmation
- Responsive canvas sizing and saved editable strokes

Add it to ADHD Daily Toolkit, Brain Dump, Mood Journal, Yearly Focus, Notes, and Gratitude Log. The sketch area will span a full page width so drawing is comfortable and does not collide with nearby fields.

## Layout and alignment audit

- Audit every planner definition and rendered field at desktop and mobile sizes.
- Correct bubble/checkbox alignment so marks sit directly beneath or beside their headings.
- Give wide grids explicit column widths and page assignments rather than allowing them to cross the center fold.
- Reflow Monthly Budget and other oversized tables into full-page or intentional two-page layouts; retain horizontal scrolling only on genuinely narrow mobile screens.
- Verify Gift Tracker, Important Dates, water, monthly habits, yearly health grids, fitness, meal planning, and all other row-based pages visually.

## Complete Tracker and two-way sync

- Define one canonical mapping for every **daily-applicable** domain: daily plan, meals, sleep, mood, gratitude, self-care, cleaning, habits, fitness, medication, medical notes, weight/measurements, water, Blood Sugar, Blood Pressure, and O₂.
- Add missing standalone fields to Complete Tracker and add missing Complete Tracker fields to the appropriate standalone daily page.
- Update both sync directions together and include every participating page in automatic reverse sync.
- Normalize the current incompatible self-care and vital data shapes so edits do not silently disappear.
- Repair the known yearly habit reverse-sync gap so all habit rows, not only the first/last one, survive round trips.
- Do not copy non-daily reference or finance data such as contacts, gifts, budgets, savings goals, yearly goals, and static lists into a daily Complete Tracker.
- Preserve existing saved entries and use backward-compatible reads for renamed or restructured fields.

## Technical implementation

- Extend planner field definitions with a drawing field, computed grid columns, linked companion grids, and any needed per-day notes metadata.
- Add focused renderers for the drawing canvas and improved grids rather than overloading unrelated controls.
- Refactor sync mappings into shared domain definitions used by both directions, reducing one-sided omissions.
- Keep all new controls on the existing design system and accessible by keyboard where applicable.

## Verification

- Add tests for computed savings, gift row/note pairing, day 31, drawing persistence and undo/redo, terminology migration, and all new two-way sync paths.
- Run the relevant automated tests and TypeScript check.
- Use the live preview to test desktop and mobile layouts, drawing by pointer/touch simulation, add-row behavior, page-one/page-two placement, and round-trip edits between Complete Tracker and each standalone tracker.
