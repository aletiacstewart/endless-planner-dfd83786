
## Why the slideshow isn't showing

On the Landing page (`/`), the planner card renders `<img src={p.heroImage}>` and `heroImage` is an empty string in `src/data/planners.ts` — so you get the broken-image placeholder in the screenshots. The `CoverSlideshow` component exists but is only used inside `PlannerDetail`, never on Landing.

## What I'll change

### 1. Landing planner card — cover slideshow (`src/pages/Landing.tsx`)
Replace the broken `<img heroImage>` inside each planner card's image area with the existing `<CoverSlideshow />`. It auto-cycles through every entry in `COVERS`, has prev/next arrows on hover, and reports the current cover id via `onCoverChange`.

Track the current cover per planner card in local state so the icon strip (below) can react to it.

### 2. New icon slideshow beside the card
Add a new small component `src/components/cover/CoverIconStrip.tsx` that:
- Accepts a `coverId` prop.
- Looks up icons via `COVER_ICONS[coverId]` from `src/lib/coverIcons.ts` (falls back to the default `patriotic-roses` pack if the cover has no override yet).
- Renders the 20 page icons as a rotating thumbnail slideshow: one large "focused" thumbnail in the center that auto-advances every ~2s, with a caption of the page name (from `PAGE_TYPES`), plus a small filmstrip of 4-6 upcoming thumbnails underneath.
- Pauses on hover and syncs whenever `coverId` changes.

### 3. Landing layout update
Change the Landing planner card grid so each planner is a two-column block:
- Left column: `CoverSlideshow` (cover images).
- Right column: `CoverIconStrip` (page-icon preview for the currently displayed cover) + title, tagline, highlights, price, and Subscribe & Install CTA.

That fills the blank right-side area shown in the screenshot and keeps the purchase box exactly where it is.

### 4. PlannerDetail parity (small, optional)
Also drop the same `CoverIconStrip` into the blank space beside the purchase box on `src/pages/PlannerDetail.tsx`, wired to the already-tracked `featuredCoverId`, so the detail page shows the same "cover + its page icons" preview as the homepage.

## Out of scope
- No data-model changes, no Stripe/pricing changes, no cover assets added or removed.
- `heroImage` field stays in `PlannerDef` (unused for now) so nothing else that references it breaks.
