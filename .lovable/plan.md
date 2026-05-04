## Goal

Close the two remaining sync gaps in the planner:

1. **Fun Tracker** — currently Complete → Fun only. Add reverse sync.
2. **Yearly Focus / Word of the Year** — currently lives only as a field on Complete Tracker. Promote it to a standalone page with two-way sync.

Goals, Goals Reflection, Recipe and Notes stay standalone (no Complete Tracker linkage).

---

## Changes

### 1. Fun Tracker — reverse sync

**File:** `src/lib/linkedEntries.ts`

In `syncFromIndividual`, add a branch for `entry.pageType === "fun-tracker"`:

- Read `fun_grid = { items, marks }` and `year`.
- For each marked cell `${itemIdx}-${monthIndex}` that is `true`:
  - Compute the first day of that month as ISO (`year-monthIndex-01`).
  - Find Complete Tracker entries in that month (any day). Use the earliest by `date`.
  - If none exists, skip (don't create new Complete entries from a month-level mark).
  - Assign the item label into the next free `fun_N_label` slot (1–3) on that Complete entry, and set `fun_N = "success"`. If the same label is already present in a slot, just reaffirm `success`.

This mirrors the forward direction's design: marking a fun item in a given month reflects on the user's primary Complete Tracker day for that month.

### 2. Yearly Focus — standalone page

**File:** `src/lib/pageTypes.ts`

Append a new page type at the end of `PAGE_TYPES`:

```ts
{
  id: "yearly-focus",
  name: "Yearly Focus",
  shortName: "Focus",
  description: "Your word of the year — a single guiding focus that syncs with the Complete Tracker.",
  icon: "Compass",
  sections: [
    { fields: [{ key: "year", label: "Year", type: "year" }] },
    { fields: [{
        key: "yearly_focus",
        label: "Yearly Focus / Word of the Year",
        type: "textarea", rows: 4, span: 2,
        placeholder: "What's your word or theme this year?",
    }] },
  ],
  summary: (v) => (v.yearly_focus as string)?.slice(0, 60) || (v.year ? `Focus ${v.year}` : "Yearly focus"),
}
```

### 3. Yearly Focus — two-way sync

**File:** `src/lib/linkedEntries.ts`

- **Forward (Complete → Yearly Focus):** in `syncLinkedEntries`, in addition to the existing logic that prepends `Focus: …` into the matching month note on Yearly Calendar, also `findOrCreate("yearly-focus", year)` and write `yearly_focus` directly. Source of truth for the standalone page is the latest non-empty value.
- **Reverse (Yearly Focus → Complete):** in `syncFromIndividual`, branch on `entry.pageType === "yearly-focus"`. For all Complete Tracker entries with the same year, set `dst.yearly_focus = v.yearly_focus` (or delete when blank).

### 4. Auto-save registration

**File:** `src/hooks/useAutoSave.ts`

Add `"fun-tracker"` and `"yearly-focus"` to `REVERSE_SYNC_TYPES` so edits on those pages trigger `syncFromIndividual`.

### 5. Page hero image (optional)

`src/lib/pageImages.ts` — no entry yet for `yearly-focus`. The page will simply render without a hero image (Compass lucide icon shows on the Sections grid). When the user uploads a Focus image, we'll wire it in.

---

## Out of scope

- My Goals, Goals Reflection, Recipe, Notes remain standalone — no Complete Tracker fields exist for them and merging them would dilute the daily log.
- No data migration needed: existing Complete Tracker entries with `yearly_focus` will be picked up the next time they're saved (or on first edit of the new page).
