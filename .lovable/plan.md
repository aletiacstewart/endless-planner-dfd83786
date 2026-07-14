## Goal

Clear out every cover and every per-cover icon set so you can reupload from scratch. Keep the cover/icon system wired up (types, hooks, picker, packs, pricing) so re-adding a cover is just "drop assets + register".

## What gets deleted

- All 64 cover images in `src/assets/covers/` (entire folder)
- All per-cover icon assets in `src/assets/cover-icons/` (currently only `forget-me-nots-ladybugs/`)
- All cover imports, palette presets, and `COVERS` entries in `src/data/covers.ts`
- All entries in `COVER_ICONS` in `src/lib/coverIcons.ts`

## What stays (system intact for reupload)

- `src/data/covers.ts` types (`Cover`, `CoverPalette`, `CoverMode`, `CoverCollection`, `COLLECTIONS`), plus `getCover()` helper
- `src/lib/coverIcons.ts` structure + `getCoverPageIcon()` helper
- `src/data/coverPacks.ts` pricing + `INCLUDED_PACK_IDS`
- All UI: `CoverPicker`, `CoverPackPicker`, `CoverIconPreviewDialog`, `CoverImage`, `useCoverTheme`, `Packs` page
- Default page icons in `src/lib/pageImages.ts` (used as fallback)

## Placeholder cover

To avoid crashes anywhere the app assumes a selected cover exists, add a single neutral placeholder:

- `COVERS = [placeholderCover]` with id `placeholder`, a soft neutral light palette, and `image: ""` (CoverImage already renders a gradient fallback when `image` is empty)
- Update `INCLUDED_PACK_IDS` in `src/data/coverPacks.ts` from `["forget-me-nots-ladybugs"]` to `["placeholder"]` so the free/included slot still resolves
- Any localStorage/user-settings referencing `forget-me-nots-ladybugs` will fall back to the placeholder via `getCover()`'s existing default logic

## Re-adding covers later

Same 3-step flow already documented in `docs/ADDING_A_PACK.md`:
1. Drop `src/assets/covers/<id>.jpg`
2. Add import + `COVERS.push({...})` entry with palette in `src/data/covers.ts`
3. (Optional) Drop `src/assets/cover-icons/<id>/*.png` and register in `COVER_ICONS`

## Out of scope

- No changes to Stripe pricing, pack purchase flow, or DB
- No changes to page icons / page types
- No user-facing copy changes beyond what's implied by an empty catalog
