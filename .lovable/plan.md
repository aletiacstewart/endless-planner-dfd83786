# Move Wellness Section to Page 1 on Complete Tracker

## Goal
On the **Complete Tracker** page, move the Wellness/self-care/workout/measurements section from page 2 back to page 1 of the two-page spread.

## Current state
- `src/lib/pageTypes.ts` defines the `complete-tracker` page type.
- The section titled **"Wellness, Self-Care, Workout & Measurements"** is currently pinned with `page: 2`.
- Page 1 already contains: date/weekday, daily goal/habit, monthly calendar, fun & habit tracker, cleaning, this week, and this year.
- Page 2 currently contains: meals, wellness section, wellness notes, medications, and medical records.

## Proposed change
1. In `src/lib/pageTypes.ts`, change the `page` property on the "Wellness, Self-Care, Workout & Measurements" section from `2` to `1`.
2. Keep the related standalone "Wellness Notes" textarea pinned to page 2 (or move it with the wellness section if requested — default is to leave it where it is).
3. Run a typecheck to confirm no layout/type regressions.

## Acceptance criteria
- Opening the Complete Tracker renders the Wellness/self-care/workout/measurements block on the left page of the spread.
- Meals, medications, and medical records remain on the right page.
- No TypeScript errors.