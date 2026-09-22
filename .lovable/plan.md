# Planner home: real 6x9 cover, then an open two-page spread

## Goal
Opening the planner feels like a real book: a 6x9 closed cover you tap or swipe to open, then the planner lying open with two facing pages.

## Screen 1 — the closed cover
- Cover art sized to a true 6x9 book shape (2:3 portrait) instead of today's square, centered with a stitched spine on the left edge, page-edge shading on the right, and a soft drop shadow underneath.
- Planner title and owner name stay on the cover; the hint below reads "Swipe or tap to open".
- Tap anywhere on the cover, or swipe from right to left, plays the existing open animation and reveals the spread. A small "Open planner" button stays for anyone who prefers a button. Settings gear stays in the corner.
- Once opened, the planner stays open for the rest of the visit; a "Close planner" control on the spread returns to the cover.

## Screen 2 — the open spread
Two facing pages on a single paper surface with a center fold shadow, rounded outer corners, and matching page texture.

- Left page: "Sections" heading, the quote line, and the section buttons in a grid that fits the page.
- Right page, top to bottom: Today's tracker, "Try a new cover & icon pack", the back-up reminder when it is due, then Recent entries.
- Backup & restore stays reachable from the right page (below Recent entries), so the "Back up now" button still scrolls to it.

On narrow phone widths the two pages stack (left page first) so nothing shrinks to unreadable size; the fold becomes a divider.

## Technical notes
- All work is in `src/pages/Home.tsx` plus small additions to `src/index.css` for the book-cover and spread styling (aspect ratio, spine, fold gradient) using existing design tokens.
- Cover opening is local view state in `Home`; tapping the cover no longer jumps straight into today's entry — Today's tracker on the right page does that.
- Swipe detection reuses the existing `useSwipeNav` hook where it fits, otherwise simple pointer handlers on the cover.
- Section cards, recent entries, and backup logic are reused as-is; only layout containers change.

## Verification
- Check the cover proportions and open/close flow on desktop and mobile widths in the preview.
- Confirm section links, Today's tracker, cover-pack nudge, backup reminder scroll, and export/restore all still work from the spread.
