# Fix sticker placement so stickers can go anywhere on the page

## What's wrong

Two confirmed issues in the sticker overlay:

1. **Dragging jumps to the page edges.** In `src/components/entry/StickerLayer.tsx:153`, the drag math measures the sticker's own wrapper element instead of the full page overlay (`e.currentTarget.parentElement` now resolves to the small `translate(-50%,-50%)` wrapper added when the control bar was introduced). Because that box is only ~48px wide, every pixel of pointer movement is converted into a huge percentage, so the position instantly clamps to 0% or 100% — the sticker "snaps to the outside of the page" and can't be dropped anywhere in between.
2. **New stickers spawn at the very top edge.** `src/components/entry/EntryPersonalization.tsx` creates every sticker at `y: 6 + random*4` (top strip of the page), which reinforces the impression that stickers stick to the outside.

## The fix

- Measure drag against the sticker layer itself: give the overlay root a ref / `data-sticker-layer` attribute and use that element's bounding rect for the percentage math, so 1px of pointer movement equals 1px of sticker movement across the whole page area.
- Drop new stickers near the middle of the page (around 50% / 45%) with a small random jitter so repeated picks don't stack exactly, then let the user drag them where they want.
- Keep free movement: no snapping unless Shift is held (already the case), and keep the existing clamp so a sticker can't be lost off-page.
- Leave inline-in-field insertion, pinch resize, rotate, layering, and the library dialog untouched.

## Verification

Open a planner entry in a browser session, place a sticker from the tray and one from the library, drag each to several distinct spots (corners, centre, over the text sections) and confirm the position follows the pointer 1:1 and persists after reload.

## Files touched

- `src/components/entry/StickerLayer.tsx`
- `src/components/entry/EntryPersonalization.tsx`
