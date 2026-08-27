# Clean up Wellness duplicates and move Gratitude to page 1

## Goal
1. Remove the duplicate Mood, Sleep (hours), and Habits (smoking, vaping, dipping, other) checkbox rows.
2. Move the Gratitude section to page 1, placed just above Self-Care.

## Current state (verified in `src/lib/pageTypes.ts`)
- Complete Tracker "Wellness" section (page 2) contains `habits`, `mood`, and `sleep` checkbox-group rows — these duplicate the dedicated "Sleep" (bedtime/wake/hours/quality), "Mood Check-In" (overall mood + ratings), and the "Begin / Break Habits" section.
- "Gratitude" section is pinned to `page: 2` and sits after Today's Feels.
- The standalone Daily Tracker page type has the same three duplicate rows (`habits`, `mood`, `sleep`).

## Changes
1. In the Complete Tracker "Wellness" section, delete the `habits`, `mood`, and `sleep` checkbox-group fields (keeping water, meals, caffeine, sweets).
2. In the Daily Tracker page type, delete the same three duplicate rows so both pages match.
3. Change the Gratitude section from `page: 2` to `page: 1` and move its definition directly above the Self-Care section so it renders above Self-Care on the left page.
4. Typecheck.

## Notes
- No data keys are renamed, so existing entries keep their stored values; the removed keys simply stop rendering. Sleep/mood/habits remain fully editable through their dedicated sections.

## Acceptance
- Wellness block shows only water/meals/caffeine/sweets.
- Gratitude appears on page 1 above Self-Care; sync to the Gratitude Log still works.
- No TypeScript errors.
