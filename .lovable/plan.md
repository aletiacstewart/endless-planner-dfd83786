# Homepage covers: working links + slideshow

## What changes

1. **Covers become a slideshow.** The static 8-cover grid in the "Covers" section of the homepage becomes a horizontal carousel that auto-advances through covers, with prev/next arrows, dots, pause on hover, and reduced-motion respect (no auto-advance). It shows several covers at once on desktop and one-and-a-bit on mobile, so browsing feels like flipping through a collection.

2. **Every cover links somewhere real.** Each slide is a link to the planner page for that cover:
   `/planner/wellness-journey?cover=<cover-id>`. On that page the cover is scrolled to and highlighted (it does not auto-select, per the existing purchase rule — the buyer still picks the included cover explicitly). The collection filter chips keep working and reset the carousel to the first slide.

3. **"View all covers"** button stays below the carousel, unchanged.

## Notes

- Full cover catalog stays available on the planner page; the homepage carousel shows a rotating sample (all covers in the active filter, not just 8).
- Cover name, collection label, and the "+$5.00" badge stay on each slide.

## Technical detail

- Reuse the existing `src/components/cover/CoverSlideshow.tsx` pattern (auto-advance interval, pause state, `prefers-reduced-motion` handling) but adapted for the storefront: a new `CoverCarousel` in `src/components/cover/` that accepts a cover list and renders linked slides via the existing `CoverImage`.
- Edit `src/pages/Landing.tsx` to swap the `previewCovers` grid (lines ~109-137) for the carousel, feeding it the filtered cover list instead of `.slice(0, 8)`.
- No changes to pricing, data, checkout, or `PlannerDetail` behavior.
