## Problem

Two issues on interior spread pages:

1. **Wide grids clip inside a half-page**: `yearly-habit-grid` (Jan–Dec × 31 days) and similar wide fields (`habit-grid`, month/week grids) are forced into the right half of the two-page spread, so days ~15–31 fall off the page.
2. **Right-edge side tabs are invisible**: on desktop, `SideTabs` uses `translate-x-[calc(100%-2.5rem)]` which pushes each tab off-screen until hover, and the tab strip sits behind the entry padding — you only see a red sliver ("Yea…") as in the screenshot.

## What to change

### 1. Full-bleed wide sections in `PlannerSpread`

Extend `PageTypeDef` sections with an optional `fullBleed?: boolean` flag. In `PlannerSpread`, split sections into three ordered buckets:

- `leftSections`: normal sections up to the split
- `bleedSections`: any full-bleed sections in their original order
- `rightSections`: remaining normal sections

Render structure:

```text
+--------------------------+
| left  |  spine  | right  |  ← normal two-column
+--------------------------+
|      full-bleed row      |  ← spans both pages, no spine
+--------------------------+
```

Full-bleed rows drop the center spine, use `col-span-2`, and wrap their children in `overflow-x-auto` so any residual overflow still scrolls rather than clips. If a page has only full-bleed sections, render as a single wide page (no spine).

Mark as `fullBleed: true` in `src/lib/pageTypes.ts`:

- `yearly-habit-tracker` → `yearly_habits` (yearly-habit-grid)
- `yearly-calendar` → the 12-month notes grid section
- `monthly-calendar` → month grid
- `weekly-calendar` → the week grid section
- `daily-tracker` & `complete-tracker` → `month_calendar` (habit-grid) and any `habit-grid` sections
- `weight-tracker`, `measurement-tracker`, `blood-sugar-tracker`, `blood-pressure-tracker`, `oxygen-tracker` → their multi-week tracker sections

Anything not explicitly flagged keeps the current two-column behavior.

### 2. Fix SideTabs visibility

Rework `src/components/planner/SideTabs.tsx`:

- Anchor the desktop rail at `right-2` (not `right-0`) and remove the hover-only translate — always show the full pill with icon + `shortName`.
- Give the rail a translucent card background and shadow so it stays legible over paper backgrounds.
- Keep the strip inside `max-h-[80vh] overflow-y-auto` so long tab lists scroll instead of overflowing off screen.
- Increase the reserved right padding on the Entry container from `lg:pr-24` to `lg:pr-40` so the spread never sits under the tabs.
- Active tab keeps the filled primary style; inactive tabs use `bg-card/90` with border, always fully visible.
- Mobile bottom strip is already fine — leave as is, just verify padding.

### 3. Audit pass

After the change, open one entry of each page type and confirm:

- No horizontal clipping on `lg` (1280px+) or `xl` (1440px+).
- All 31 day columns render for habit / yearly-habit grids.
- Side rail tabs are fully visible on the right, don't overlap content, and remain clickable.

## Technical details

- Files touched: `src/lib/pageTypes.ts` (type + flags), `src/components/planner/PlannerSpread.tsx` (bucket + render), `src/components/planner/SideTabs.tsx` (visibility), `src/pages/Entry.tsx` (right padding). No renderer changes needed — `PageRenderer` already handles wide grids; we're only giving them room.
- No data/schema/RLS changes.
- Non-goal: redesigning the grids themselves or changing mobile layout beyond padding.
