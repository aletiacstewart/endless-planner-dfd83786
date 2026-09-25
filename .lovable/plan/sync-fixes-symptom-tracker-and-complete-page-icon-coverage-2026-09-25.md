# Sync Fixes, Symptom Tracker, and Complete Page-Icon Coverage

## Current state (verified)
- All 38 current page types have an icon for every cover (0 gaps).
- Complete Tracker reverse sync skips several pages that already have working handlers.

## Changes (in order from your notes)
1. **Turn on reverse sync** for Meal Planning, Notes, Brain Dump, ADHD Toolkit, Therapy Session and Important Dates, so edits made on those pages flow back to Complete Tracker.
2. **Gift Tracker two-way sync**: edits on Gift Tracker (Person, Gift idea, Budget, Purchased) copy back to the matching Complete Tracker day (matched by person, else the latest day).
3. **Daily Tracker becomes a full mirror**: add "Top 3 priorities", "Hourly schedule" and "How the day felt" to Complete Tracker Page 1, synced both ways. Daily Tracker stays.
4. **One habit area**: the standalone "Daily Habit Tracker" box is relabeled "Quick daily check" and placed inside the Begin / Break Habits section, so habits live in one place.
5. **New Symptom Tracker page**: yearly grid (hot flashes, night sweats, brain fog, mood swings, sleep disruption, other), plus a "Today's Symptoms" row on Complete Tracker that syncs both ways, like Today's Vitals.
6. **Descriptions check**: every "Syncs to..." note on Complete Tracker is reviewed so it's true.

## Page icons
- Generate a Symptom Tracker icon for every cover, in each cover's own style.
- Re-run the icon check across every page and cover; fill any gap it finds and refresh the icon list the app reads.
- Symptom Tracker icons also appear automatically in the Page Icons sticker/library group.

## Technical details
- `src/hooks/useAutoSave.ts`: add the 7 types plus `symptom-tracker` to REVERSE_SYNC_TYPES.
- `src/lib/linkedEntries.ts`: new `gift-tracker` and `symptom-tracker` reverse cases; forward mapping for symptoms; new keys added to DAILY_KEYS.
- `src/lib/pageTypes.ts`: new page type, new Complete Tracker fields and moved habit field (page balance kept).
- `scripts/icons/prompts.mjs`: symptom-tracker subject; run `backfill.py run`, then `write_manifest.py` to regenerate `src/data/iconPacks.ts`; `backfill.py report` must show 0.

## Validation
- Edit each listed page and confirm the change appears on Complete Tracker, and the other way around.
- Icon report shows 0 missing; spot-check a few covers.
