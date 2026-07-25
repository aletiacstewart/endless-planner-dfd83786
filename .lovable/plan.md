## Goal

Transform Endless Planner into a Bloom-caliber storefront + planner experience with a full themed sticker system and theme-specific page icons for every one of your 37 covers.

## Credit & time reality check (please read before approving)

Under "all-in-one big batch" this plan generates a very large asset volume:

- **Stickers**: 37 covers × ~60 stickers = **~2,220 sticker PNGs**
- **Page icons**: audit + regenerate ~20 icons × 37 covers = **up to ~740 icons**
- **Total**: ~2,960 AI image generations

That will consume a substantial chunk of image-gen credits and image generation is the bottleneck by far — the code changes will land quickly; the asset generation is what will span multiple credit top-ups. I'll batch aggressively but you should expect to top up mid-run. If credits run out I'll pause, tell you exactly which theme I stopped on, and resume next turn.

All new binaries land as CDN `.asset.json` pointers, not committed PNGs, so the repo stays small.

## Deliverables

### 1. Storefront redesign (Bloom-style)

- Capture current `/` and `/wellness-journey` in Playwright, then run 3 rendered design directions locked to your existing palette + type (I'll ask for a fresh visual-preferences round only if the current tokens feel off after audit).
- You pick one; I implement pixel-matched: product-grid Landing, category filters (Botanical / Gothic / Faith / Patriotic / Feathers / Dragons / Sirens / Moon / Crystals), big lifestyle cover images, sticky cart drawer, refined typography, generous whitespace, subtle motion.
- Rebuilds: `Landing.tsx`, `PlannerDetail.tsx`, `CoverCard.tsx`, `CartSummary.tsx`, `CoverSlideshow.tsx`, `CoverIconStrip.tsx`.

### 2. Sticker system (60 per theme)

Each cover pack gets a **~60-sticker set** in 6 categories (10 each): banners, washi tape strips, motif spot art (theme-specific), floral/decorative accents, functional icons (checks, arrows, stars, hearts), and mood/word stickers.

- New `StickerLibraryDialog` component: tabs by category, grid of sticker previews, click-to-drop onto current page.
- Extend `StickerLayer.tsx` to render themed sticker PNGs (not just emoji), keep drag/resize/rotate.
- New table `user_sticker_unlocks` and `sticker_sets` registry in `src/data/stickers.ts`.
- Gate: stickers unlocked only for covers the user owns (via existing `user_packs` + activation cover). Sticker picker filters to owned themes.
- Sync unlocked stickers via existing `sync.ts` reconcile path (behaves like packs).

### 3. Page icons — theme-specific for every cover

- Audit each of the 37 covers' current icon set against its theme.
- Regenerate any icon that reads "generic" — dragons pages show dragons, feathers show feathers, patriotic shows flags/stars/Texas, sirens stay ink-on-cream, moon covers stay celestial, etc.
- Keep the ~20 planner page slots (goals, daily tracker, gratitude, wellness, reflection, etc.); only the artwork changes.
- Register in existing `src/lib/coverIcons.ts` map (no schema change).

### 4. In-planner experience polish

- Decorative page frames per theme (subtle border art matching the cover).
- Themed section dividers and "chapter" headers.
- Softer paper background option per theme (already partially in place — polish it).
- Improved `RichTextField` styling, sticker snap-to-grid toggle, minor motion when placing stickers.

### 5. Asset pipeline

- All generated stickers + icons go through `lovable-assets create` → `.asset.json` pointers.
- One-time migration of the existing 900 raw PNGs under `src/assets/` to CDN pointers so the repo shrinks and Vite build stays fast.

## Order of operations

1. Screenshot current storefront → `design--create_directions` → present 3 options → you pick.
2. Implement chosen storefront redesign (code + layout only, existing assets).
3. Build sticker library UI + entitlement wiring (code, no assets yet).
4. Migrate existing binaries to CDN pointers.
5. Generate page icons theme-by-theme (in parallel batches of ~8 per turn).
6. Generate stickers theme-by-theme (in parallel batches of ~10 per turn).
7. Polish in-planner frames/dividers.
8. QA the flow end-to-end and hand you a testing script.

Steps 5 and 6 are the credit-heavy ones and will drive most of the wall clock.

## What stays the same

- Pricing model ($19.97 activation + 1 cover included, $5/extra cover with stickers now bundled, $10/mo Cloud sync).
- Auth, Stripe checkout, webhooks, subscription gating, device caps — all untouched.
- Your data model for entries and syncing.

## Technical notes

- Sticker registry: `src/data/stickers.ts` exports `STICKER_SETS: Record<CoverId, StickerSet>` where each set = `{ category: StickerCategory; asset: AssetJson; tags: string[] }[]`.
- `user_sticker_unlocks` isn't strictly needed since stickers travel with covers via `user_packs` + `user_planner_unlocks`; entitlement helper `isCoverUnlocked(coverId)` will gate access. No new migration required.
- Sticker PNGs generated with transparent background at 512×512, then referenced by `.asset.json`.
- Design tokens locked into `index.css`; no hardcoded colors in components.

## How you'll test after each phase

- Phase 1 (storefront): Preview `/` and `/wellness-journey` — grid, filters, cart drawer, mobile responsiveness.
- Phase 2 (stickers UI): Open any planner entry, click the sticker button, browse categories, drop a sticker onto the page, resize/rotate/delete it.
- Phase 3 (icons): Rotate through covers in Settings → each page's icon reflects the selected theme.
- Phase 4 (entitlement): Buy a second cover pack in test mode → its stickers + icons unlock immediately without reload (realtime sync).