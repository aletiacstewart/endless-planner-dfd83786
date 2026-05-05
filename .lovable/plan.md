Combine the **Goals Reflection** page into **My Goals** so each goal carries its own why / feel / action fields.

**Changes**

1. `src/lib/pageTypes.ts`
   - Remove the standalone `goals-reflection` page type entry.
   - Restructure `my-goals` so it has one section per goal (Goal 1…Goal 12), each containing:
     - `goal_N` (textarea — the goal)
     - `why_N` (text — Why I want this)
     - `feel_N` (text — How I'll feel when I reach it)
     - `action_N` (text — Action steps)
   - Keep the existing "Reward for achieving all goals" section at the bottom.
   - Field keys (`goal_N`, `why_N`, `feel_N`, `action_N`) match the previous schema, so any saved entries continue to load.

2. `src/lib/pageImages.ts` — remove the `goals-reflection` import and map entry.

3. `src/lib/coverIcons.ts` — remove the `goals-reflection` import and map entry.

4. Delete the now-unused image assets:
   - `src/assets/page-images/goals-reflection.png`
   - `src/assets/cover-icons/forget-me-nots-ladybugs/goals-reflection.png`

**Notes**
- Existing My Goals entries keep their `goal_N` and `reward` values.
- Existing Goals Reflection entries (saved under pageType `goals-reflection`) won't appear in the new merged page since the page type is removed. If preserving them matters, we'd need a migration — flag if you want that added.