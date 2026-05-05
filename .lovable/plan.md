## Remove three tracker pages

Removing **Habit Tracker**, **Fun Tracker**, and **Daily Goal Tracker** from the platform. Keeping **Yearly Habit Tracker**.

### Code changes

1. **`src/lib/pageTypes.ts`** — Delete the three `PageTypeDef` entries (`habit-tracker`, `fun-tracker`, `daily-goal-tracker`).

2. **`src/lib/linkedEntries.ts`** — Remove the three IDs from the linked-sync arrays and delete their reverse-sync handler blocks (the `if (entry.pageType === "...")` branches at lines 860, 990, 1112). The Complete Tracker will keep collecting habit/fun/goal field values internally, but will no longer push them to standalone pages.

3. **`src/hooks/useAutoSave.ts`** — Remove the three IDs from `REVERSE_SYNC_TYPES`.

4. **`src/lib/pageImages.ts`** — Remove the three imports and map entries.

5. **`src/lib/coverIcons.ts`** — Remove the three icon imports and map entries from the `forget-me-nots-ladybugs` pack (and any other packs that reference them).

6. **`src/data/planners.ts`** — Check for and remove any references to these page IDs in planner section definitions.

7. **Asset files** — Delete the now-unused PNGs:
   - `src/assets/page-images/{habit,fun,daily-goal}-tracker.png`
   - `src/assets/cover-icons/*/{habit,fun,daily-goal}-tracker.png`

### Data note

Existing user entries of these page types in IndexedDB will become orphaned (not rendered, not deleted). They remain in storage harmlessly. Let me know if you'd prefer a one-time cleanup on app load.

### Out of scope

- Yearly Habit Tracker stays.
- The Complete Tracker's "Fun & Habit Tracker" section stays (just no longer syncs out).
