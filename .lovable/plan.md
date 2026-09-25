# Slim down the Complete Tracker

Remove the extra mood and note sections from the Complete Tracker so each day is shorter and less repetitive.

## What gets removed

- **How the day felt** (the mood-rating box on page 1)
- **Today's Feels** (the morning/afternoon/evening/night feelings box on page 1)
- **More habits today** (the "+ Add habit" grid inside Begin / Break Habits — the quick daily check and 3 named habits stay)
- **This Week** section (both the note and its "More notes for today" add-on)
- **This Year** section (both the note and its "More notes for today" add-on)
- **Workout details** — the Cardio / Yoga / Weights / Stretch / Other / Rest day boxes go away

## What stays

- **Today's Workout** becomes a small box with just: activity (Walking, Running, etc.), duration, intensity, and notes
- **Mood Check-In** stays as the one mood box (overall mood, depression, anxiety, stress)
- Everything else on both pages is unchanged

## Data safety

- Nothing you've already written is deleted — removed boxes simply stop showing, and their text stays saved if we ever bring them back
- The Weekly and Yearly calendar pages themselves are untouched; only their duplicate boxes on the Complete Tracker go away
- Workout activity, duration, intensity and notes keep syncing with the Fitness & Workout Tracker

## Technical details

- Edits are confined to the `complete-tracker` definition in `src/lib/pageTypes.ts` (removing the "How the day felt", "Today's Feels", "This Week", "This Year" sections, the `habits_more`, `week_notes_more`, `year_notes_more` fields, and trimming the Workout section to `workout_activity`, `workout_duration`, `workout_intensity`, `workout_notes`)
- Sync keys for removed fields remain harmless in `src/lib/linkedEntries.ts`; no sync code changes needed
- Verify with the icon report (0 gaps) and a clean build
