# Planner home: book cover that opens into a matching two-page spread

## Goal
Opening the planner feels like a real book: a closed cover you tap or swipe to open, then the planner lying open with two facing pages — sized and styled exactly like the existing planner pages.

## Size
The closed cover matches the size of an open spread's single page from the entry pages (same width, same page proportions, same paper texture, rounded corners and soft shadow), so opening it feels like the same book rather than a differently sized card. When it opens, the spread uses the same container as every other planner page, so the cover and the inside pages line up.

## Screen 1 — the closed cover
- Cover art fills one planner page, centered, with a stitched spine along the left edge, page-edge shading on the right, and a soft shadow underneath.
- Planner title and owner name stay on the cover; the hint below reads "Swipe or tap to open".
- Tap anywhere on the cover, or swipe right to left, plays the existing open animation and reveals the spread. A small "Open planner" button stays for anyone who prefers a button. Settings gear stays in the corner.
- Once opened, the planner stays open for the rest of the visit; a "Close planner" control on the spread returns to the cover.

## Screen 2 — the open spread
Two facing pages on one paper surface with the same center fold, texture, border and shadow as the planner entry pages.

- Left page: "Sections" heading, the quote line, and the section buttons in a grid that fits the page.
- Right page, top to bottom: Today's tracker, "Try a new cover & icon pack", the back-up reminder when it is due, then Recent entries.
- Backup & restore stays reachable from the right page (below Recent entries), so the "Back up now" button still scrolls to it.

On narrow phone widths the two pages stack (left page first) so nothing shrinks to unreadable size; the fold becomes a divider.

## Technical notes
- Work is in `src/pages/Home.tsx`, reusing the same wrapper styling as `PlannerSpread` (`rounded-3xl paper-dot`, border, `--shadow-soft`, the `spread-spine` fold) so both screens share one page size; small additions to `src/index.css` for the cover spine/edge treatment using existing tokens.
- Cover opening is local view state in `Home`; tapping the cover no longer jumps straight into today's entry — Today's tracker on the right page does that.
- Swipe detection reuses the existing `useSwipeNav` hook where it fits, otherwise simple pointer handlers on the cover.
- Section cards, recent entries, and backup logic are reused as-is; only layout containers change.

## Verification
- Check that the closed cover and the open spread occupy the same footprint as an entry page, on desktop and mobile widths.
- Confirm section links, Today's tracker, cover-pack nudge, backup reminder scroll, and export/restore all still work from the spread.
