# Planner fixes: sticker categories, page navigation, spread layout

## 1. Show every sticker category at once
The category chips render in a single horizontally-scrolling row (`overflow-x-auto` in both the sticker popover and the Library dialog), so "Objects" and later categories get cut off. Change both rows to wrap onto multiple lines so all categories are visible without scrolling or arrows.

## 2. Fix "swipe or press left/right"
Prev/Next (and the swipe/arrow hint) are computed only when a page type has 2+ sheets — with one sheet they are always null, so nothing happens even though the hint text says it should. Fixes:
- Only show the "swipe or press" hint when there is actually somewhere to go.
- Swipe/arrow right at the last sheet does what the on-screen button does: create and open a new sheet.
- Ignore swipes that start inside a sticker, calendar cell, or scrollable grid so a drag isn't read as a page flip.

## 3. Rename "Medical Appointment Notes"
Relabel to "Appointment Notes" (Complete Tracker and Medical Records page) so it fits on one line. Stored data key stays the same, so existing entries keep their notes.

## 4. Control which spread page each section lands on (Complete Tracker)
Add an optional page assignment to section definitions and have the spread honour it instead of blindly splitting sections in half.

- Left page: Fun & Habit Tracker, Cleaning, This Week, This Year (plus the existing date/goal, meals, wellness/self-care/workout/measurement blocks).
- Right page: Medications, Medical Records, Appointment Notes / Test Results / Lab Result Notes.

## 5. Keep the Monthly Calendar note panel on the left page
The Monthly Calendar currently renders full-bleed across both pages, so its "Tap a day to add or view a note" panel stretches past the spine. Constrain the calendar plus its note panel to the first page's width, with the note panel stacked beside/below the compact month grid instead of spanning the spread.

## Technical notes
- `src/components/entry/EntryPersonalization.tsx` and `StickerLibraryDialog.tsx`: `flex-wrap` on the category chip rows.
- `src/pages/Entry.tsx` / `src/hooks/useSwipeNav.ts`: gate the hint on `prevEntry || nextEntry`, route forward navigation past the last sheet into `addSheet()`, and skip swipes originating inside `[data-no-swipe]` regions.
- `src/lib/pageTypes.ts`: add `page?: 1 | 2` to `SectionDef`; set it on the Complete Tracker sections listed above; retitle the appointment-notes field.
- `src/components/planner/PlannerSpread.tsx`: group narrow sections by `page` when present (fallback: current half split); stop treating the compact `calendar-grid` as a full-spread wide type so it stays on page one.
- No backend or data-shape changes; all edits are presentation-level.
