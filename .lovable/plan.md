
# Cover Icons + Sticker Library — Full Regeneration

## What this covers

- **79 covers** across **17 collections**, each getting a fresh **20-page icon set** (1,580 icons total).
- **3 missing packs** (`dreamscape`, `iris-starlight-moon`, `sparrow-moon-lights`) get wired into `coverIcons.ts` at the same time.
- **17 themed PNG sticker sets** replacing the current emoji glyphs — 60 pieces each (4 categories × 15) = **1,020 stickers**.
- **Zero text or numbers** on any generated image; every prompt explicitly forbids typography, digits, calendar grids, watermarks.

Grand total ≈ **2,600 generated PNGs**. Because that is far too many for one turn, this ships as an incremental build with a persistent generation script and a checkpoint file, so each build turn produces one collection's worth and the catalog stays in a working state throughout.

## Approach

### 1. Page-icon prompt library (`scripts/icons/prompts.ts`)
One shared file defines, for each of the 20 page ids, a **subject list** describing what that page should visually represent (page-specific, not generic):

```
my-goals              → a shooting star, a marked map, an arrow hitting bullseye
yearly-calendar       → a sun's full arc / four seasons wheel (NO grid, NO numbers)
monthly-calendar      → a crescent-to-full moon sequence (NO grid, NO numbers)
weekly-calendar       → seven small pebbles / seven petals
daily-tracker         → a sunrise + hourglass
complete-tracker      → a chest with a checkmark seal
yearly-habit-tracker  → a growing vine ring
weight-tracker        → a feather balancing a stone
measurement-tracker   → a soft measuring ribbon
blood-sugar-tracker   → a honey drop on a leaf
blood-pressure-tracker→ a heart with soft radiating rings
oxygen-tracker        → a lung-shaped leaf pair
self-care-checklist   → a bath, candle, tea trio
cleaning-checklist    → a broom + folded linen
recipe                → a spoon + herbs + bowl
notes                 → a quill on parchment (blank, no writing)
workout-tracker       → a kettlebell + laurel
medications           → a pill vial + herbal sprig
medical-records       → a folded chart with cross emblem (no text)
yearly-focus          → a compass rose (no letters)
```

Each cover collection defines a **style modifier**: palette, motif, texture. e.g. `feathers` → "single hero object rendered as if made of iridescent feather barbs, cloud-soft background matching the cover's jewel tone." Combining `subject × style` gives page-specific, cover-matched, non-generic artwork.

### 2. Per-cover style descriptor (`scripts/icons/coverStyles.ts`)
One entry per cover id — palette hex + 1 sentence of visual language + negative prompt. All entries pull default from their collection with per-cover overrides where a cover has a distinctive palette (e.g. crimson vs emerald feather).

### 3. Generation script (`scripts/generate-cover-icons.mjs`)
Copies the `ai-gateway` skill script and drives it in a loop:
- Reads `.icons-progress.json` checkpoint.
- Iterates covers × pages, skipping any already generated.
- Calls `google/gemini-3.1-flash-image` (fast, pro-level quality, cheaper than `-pro-image` at this volume; matches "high quality, not generic cartoon" for icon work).
- Writes each PNG straight to `src/assets/page-icons/<coverId>/<pageId>.jpg` (JPG via Sharp conversion — matches the existing import pattern in `coverIcons.ts`, no code changes downstream).
- Every 20 icons (= one full pack) it updates `coverIcons.ts` imports for that cover so the app shows fresh icons immediately.
- Universal negative prompt: `no text, no letters, no numbers, no digits, no calendar grid, no watermark, no logo, no signature, no dates, no month names, no day labels, no captions`.

### 4. Sticker generation (`scripts/generate-stickers.mjs`)
Same pattern for the 17 collections × 60 stickers:
- Prompts request "single subject, transparent-ready flat white background, sticker-die-cut aesthetic, ~1024px square, no text."
- Output → `src/assets/stickers/<collection>/<category>-<index>.png`.
- Script rewrites `src/data/stickers.ts` incrementally: as each collection finishes, its entries flip from `em("🌿")` → `{ kind: "img", src: "/... .png" }`. Emoji fallback stays until a set is complete, so the library is never broken mid-run.

### 5. Wiring the 3 missing icon packs
Add imports + `COVER_ICONS` entries for `dreamscape`, `iris-starlight-moon`, `sparrow-moon-lights` once their icon folders exist.

### 6. Build cadence
This turn cannot produce ~2,600 images in a single pass. Each subsequent build turn will:
1. Run the generation script until its per-turn budget (≈ one collection: 60 stickers + up to ~120 icons) is exhausted.
2. Commit the new PNGs + updated `coverIcons.ts` / `stickers.ts`.
3. Report which collections are done and what's queued.

You'll get a working, improved catalog after every turn — no giant "wait until it's all finished" gap.

## Priority order

Starting with the collections most user-facing right now:

```text
1. change-of-life        (Wellness — your flagship set)
2. faith / affirmations
3. classic (Patriotic)
4. feathers
5. dragons
6. gothic-sirens
7. celestial-birds-insects
8. black-moon
9. garden
10. sparrow
11. celestial-florals
12. sky-wings-arrows
13. scrapbook / chronicles
14. pop-art
15. grit
```

## Technical details

- **Model**: `google/gemini-3.1-flash-image` via `/v1/images/generations` streaming through the `lovable_ai.py` helper. Falls back to `gemini-3-pro-image` on a hero cover if a set looks flat.
- **Format**: JPG for page icons (matches existing pipeline), PNG for stickers (transparent-ready).
- **Storage**: everything under `src/assets/` — no CDN externalization since these are per-cover consumables imported by Vite; the existing pipeline already handles bundling.
- **Backward compatibility**: `getStickerSet` and `getCoverPageIcon` signatures don't change. Emoji fallbacks stay for any collection whose PNG set isn't finished yet.
- **Cost/time control**: the checkpoint file means you can pause between turns; nothing regenerates work already done.

## Deliverables when this plan is approved

- `scripts/icons/prompts.ts`, `scripts/icons/coverStyles.ts`, `scripts/generate-cover-icons.mjs`, `scripts/generate-stickers.mjs`, `.gitignore` entry for `.icons-progress.json`.
- Priority-1 collection (`change-of-life`, 4 covers) fully regenerated: 80 new page icons + 60 stickers, live on device.
- 3 missing icon packs wired into `coverIcons.ts` even if their art hasn't cycled through the priority queue yet (aliased temporarily to their sibling collection's pack so nothing 404s).
- Follow-up turns continue down the priority list.
