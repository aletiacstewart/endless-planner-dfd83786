# Cover Icon + Sticker Audit and Per-Cover Themed Sets

## Current state (verified)

- 78 covers are registered across 17 collections; every cover has a page-icon folder in `public/page-icons/<cover-id>/` with 39 icons (123 folders exist — 45 are leftovers from removed/renamed covers).
- Page icons were generated in bulk from per-collection style prompts, so off-theme and mismatched pieces are mixed into otherwise consistent sets. Nothing today verifies an icon belongs to its cover's theme.
- Stickers are keyed by **collection**, not cover, in `src/data/stickers.ts`. Only two sets are real artwork (garden, change-of-life); the other 15 collections are emoji placeholders, and several collections reuse another collection's set. So the sticker library does not change per cover and often does not match the chosen cover.
- The planner purchase page pre-selects the included cover from the `?cover=` link on the home page, so a cover can end up "included" without the user choosing it.

## What will be built

### 1. Icon audit (report first, then targeted regeneration)

Add an audit script that produces, per cover, a contact sheet of its 39 page icons plus a machine report flagging:
- missing or zero-byte icons,
- icons byte-identical to icons in other covers (leaked/duplicated art),
- icons whose average color falls outside the cover's palette range (off-theme candidates),
- orphan folders that no longer belong to any cover.

You review the contact sheets and confirm the flagged list; only flagged icons are regenerated, using theme-locked prompts derived from the cover's own palette and motif (not just its collection). Orphan folders are deleted.

### 2. Per-cover 60-piece sticker and library sets

- Sticker registry is re-keyed from collection to **cover id**: `STICKER_SETS[coverId]`, with a collection-level fallback while a cover's art is still being generated.
- Each cover gets 60 themed PNG stickers — 15 each of Motifs, Banners, Washi, Icons — generated from that cover's motif and palette, stored under `public/stickers/<cover-id>/` and served by URL (same static pattern the icons use, so the bundle stays small).
- Generation runs in batches by collection (78 covers x 60 = 4,680 pieces). Each completed batch is registered immediately, so the library fills in progressively and never shows a broken tile — any cover not yet generated keeps its collection fallback until its own set lands.
- The sticker library and page icons both re-read from the active cover, so switching covers swaps icons, stickers and library together with no reload.

### 3. Purchase flow: no auto-selection

- Remove the `?cover=` pre-selection. Arriving from a cover card scrolls to and highlights that cover but selects nothing.
- The user explicitly picks: the cover included with activation, and confirms its icon / sticker / library set (each cover's sets are previewable before purchase).
- Checkout stays disabled until an included cover has been chosen explicitly.

## Technical notes

- New: `scripts/icons/audit.py` (contact sheets + JSON report), `scripts/stickers/run_batch.py` (per-cover sticker generation), `public/stickers/<cover-id>/{motifs,banners,washi,icons}-0..14.png`, `src/data/stickerPacks.ts` (auto-generated manifest, mirroring `iconPacks.ts`).
- Edited: `src/data/stickers.ts` (cover-keyed registry + `getStickerSet(coverId, collection)`), `src/components/entry/StickerLibraryDialog.tsx` and `EntryPersonalization.tsx` (pass cover id), `src/pages/PlannerDetail.tsx` (drop preselect, scroll+highlight instead), `src/components/cover/CoverIconPreviewDialog.tsx` (add sticker preview tab), `scripts/icons/prompts.mjs` (per-cover motif locks).
- Icons and stickers stay static public files referenced by URL — no bundler imports — so adding thousands of assets does not affect build time or bundle size.
- Image generation uses the existing generation script path already used for the icon packs.

## Sequencing

1. Run the icon audit, delete orphan folders, share the contact sheets and flagged list.
2. Regenerate flagged icons; re-run the audit until clean.
3. Land the cover-keyed sticker registry with fallbacks, then generate sticker sets collection by collection.
4. Update the purchase flow to require explicit cover/set selection and preview.
