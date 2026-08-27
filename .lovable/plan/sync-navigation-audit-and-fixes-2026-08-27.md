# Sync + navigation audit and fixes

I audited every page type against the Complete Tracker sync engine and every next/prev/button path. Most of it works; here is what is actually broken and how to fix it.

## What is broken today

**1. Three pages only sync one way (confirmed).**
Gratitude Log, Mood Journal, and Sleep Tracker have complete reverse-sync code, but they are missing from the list that decides when reverse sync runs. So Complete Tracker changes reach them, but editing those pages never flows back.

**2. Water Tracker is forward-only.**
Complete Tracker pushes water intake to the Water Tracker page, but there is no reverse handler at all, so glasses ticked on the Water Tracker page never reach the day.

**3. Cleaning sync points at fields that no longer exist.**
The cleaning sync (both directions) reads/writes a `year` + `cleaning` grid, but the Cleaning Checklist page is now a per-day room checklist (`kitchen_tasks`, etc.). Result: it silently creates orphan cleaning entries the page never displays, and the room checkboxes the user actually fills sync nowhere. The separate Weekly Cleaning page has no sync at all.

**4. Daily Tracker key list is duplicated.**
The forward and reverse paths each keep their own copy of the same 21-key list. They match today, but any future field added to Daily Tracker will desync silently. Four keys in those lists (`habits`, `habits_other`, `mood`, `mood_other`) have no matching Complete Tracker field, so they can only ever travel one way.

**5. One real navigation bug.**
The small "+" on each side tab creates a new entry unconditionally. On Medications (a single ongoing list) that makes duplicate list pages — the Section page and Entry page both guard against this correctly, the side rail does not.

## What checked out clean

- Entry prev/next: correct sibling ordering, both buttons properly disabled at the first/last day, swipe + arrow keys use the same handlers, swiping past the last day creates a new day (and is correctly suppressed on list pages).
- Spread page 1 / page 2 render together, so there is no conflict with day-to-day navigation.
- Every link and `navigate()` in the planner points at a route that exists. No dead click handlers found in Section, Entry, PageFlip, the thumbnail rail, or the swipe hook.
- Thumbnail rail drag-reorder persists correctly and hides itself with fewer than two days.

## Fixes to make

1. Register Gratitude Log, Mood Journal, and Sleep Tracker for reverse sync so their existing handlers actually run.
2. Add a Water Tracker reverse handler: read the page's monthly glass grid for the day and write the day's water value back to that day's Complete Tracker.
3. Repair cleaning sync: retarget it at the real per-day room-checklist fields, matching the Complete Tracker's cleaning-by-room block, in both directions, and drop the orphaned `year`/`cleaning` grid path. Wire Weekly Cleaning's zone checklists only if they have a Complete Tracker counterpart; otherwise leave it standalone (it has no matching fields today).
4. Collapse the two Daily Tracker key lists into one shared exported constant used by both directions, and drop the keys that have no Complete Tracker counterpart.
5. Guard the side-tab "+" the same way the Section page does: on a list-cadence page it opens the existing entry instead of creating another.
6. Re-audit pass after the changes: for each page type with Complete Tracker fields, confirm forward map, reverse handler, and reverse-sync registration all three agree.

## Technical notes

- `src/hooks/useAutoSave.ts`: add `gratitude-log`, `mood-journal`, `sleep-tracker`, `water-tracker` to `REVERSE_SYNC_TYPES`.
- `src/lib/linkedEntries.ts`: new `water-tracker` branch in `syncFromIndividual` mirroring the forward block; rewrite the `cleaning-checklist` blocks in both `syncLinkedEntries` and `syncFromIndividual` to key on `date` and copy the room task keys; export a single `DAILY_KEYS` and use it in `syncLinkedEntries` in place of the local `dailyKeys`.
- `src/components/planner/SideTabs.tsx`: `addTab()` gains the `cadence === "list"` check before `createEntry`, navigating to the existing entry instead.
- No database or schema changes; all values already live in each entry's `values` JSON.
