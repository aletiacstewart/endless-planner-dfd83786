# Emoji Stickers and Touch-Friendly Planner

## Goal
Add dedicated Emoji and Emotions choices to both Stickers and Library, then make journal pages, icons, and art tools comfortable to use by finger on phones and tablets.

## Changes
1. **Add Emoji and Emotions collections**
   - Add a broad Emoji collection for everyday planning, including symbols, hearts, weather, food, activities, objects, and celebrations.
   - Add a separate Emotions collection with a wider range of feelings and expressions.
   - Show both collections in the quick Sticker tray and the full Library.
   - Keep emoji placement compatible with in-field insertion, free placement, recents, resizing, rotation, layering, and removal.

2. **Improve Sticker and Library touch use**
   - Increase emoji, recent-item, icon, category, and Done controls to finger-friendly touch sizes.
   - Use responsive grids that keep artwork large enough to tap without crowding or horizontal clipping.
   - Make category navigation easy to scroll or wrap on narrow screens while preserving the current visual style.
   - Keep dialogs within the visible phone/tablet height with reliable internal scrolling.

3. **Improve placed-sticker controls**
   - Enlarge resize, rotate, layer, color, and delete controls for touch screens.
   - Keep the sticker tool strip on-screen near page edges and allow it to wrap cleanly.
   - Preserve drag and pinch-to-resize behavior without interfering with page swiping or scrolling.

4. **Touch audit across journal pages and icons**
   - Review the page header, style controls, page icons, side navigation, entry thumbnails, Prev/Next, and common form controls at phone and tablet widths.
   - Raise undersized interactive controls to a consistent touch target while avoiding overlap with page content.
   - Ensure icon graphics scale cleanly, fields remain visible, and controls do not create unwanted bottom scrolling.

## Technical details
- Extend the existing shared sticker data rather than adding image-generation or duplicating cover artwork.
- Keep all existing theme tokens, active-cover icon access rules, and admin/tester full access behavior.
- Add accessible names and selected states to emoji and category controls.
- Apply touch-specific sizing through responsive classes so desktop remains polished and compact.

## Validation
- Test Emoji and Emotions in both Stickers and Library.
- Place emojis inside fields and freely on pages; test drag, pinch, resize, rotate, layer, and delete.
- Check representative journal pages at phone, tablet, and desktop widths.
- Confirm no clipped fields, overlapping controls, inaccessible icons, or unwanted horizontal page scrolling.
- Run type checks and focused tests.
