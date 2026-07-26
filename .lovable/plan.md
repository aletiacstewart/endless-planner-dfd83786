# Add page icons for the 12 new pages across every cover

## Scope

Twelve pages were added in the last few turns and none of the 45 existing icon packs have art for them:

Phase B pages: `brain-dump`, `fitness-tracker`, `adhd-toolkit`
Phase C pages: `budget-monthly`, `debt-tracker`, `savings-goals`, `home-info`, `weekly-cleaning`, `meal-planning`, `mood-journal`, `therapy-session`, `coping-toolkit`

Existing icon packs (in `src/assets/page-icons/`): 45 (patriotic-roses, texas-horned-lizard, starlit-cactus, pecan-tree-moon, dragons, feather-*, gothic-*, dove-ink, dreamscape, faith*, gilded, golden-wheat-moon, hummingbird-garden, and ~30 others).

**Total images to generate: 45 packs × 12 pages = 540 icons.**

## Approach

Reuse the existing pipeline in `scripts/icons/`:
- `prompts.ts` / `prompts.mjs` — subject prompts per `pageId` + style prompts per pack.
- `gen_image.py` — Gemini 3.1 Flash image generator.
- `run_batch.py` — checkpointed batch runner that skips already-generated files.

Steps:

1. **Extend `scripts/icons/prompts.ts`** with 12 new subject prompt templates. Each names concrete objects to render (no text, no numbers) matching the page's function:
   - `brain-dump` — tangled thought bubbles / scribbled paper crumpled and sorted
   - `fitness-tracker` — dumbbell + water bottle + jump rope
   - `adhd-toolkit` — fidget spinner, timer, 3 checkboxes, colored tabs
   - `budget-monthly` — coin stacks + calendar + envelope
   - `debt-tracker` — descending stack of chained coins breaking free
   - `savings-goals` — piggy bank + gold coins + upward arrow
   - `home-info` — house silhouette + key ring + address book
   - `weekly-cleaning` — bucket, spray bottle, folded cloth
   - `meal-planning` — grocery bag, produce, weekly menu card
   - `mood-journal` — face silhouette with soft gradient hearts
   - `therapy-session` — two facing chairs + notebook + tissue box
   - `coping-toolkit` — anchor, breath waves, hand on heart

2. **Regenerate `prompts.mjs`** from `prompts.ts` so `run_batch.py` picks up the new subjects.

3. **Run `run_batch.py` in phases** to keep credit spend visible:
   - Phase 1 — 4 packs (patriotic-roses, dragons, feather-emerald, gothic-sirens) × 12 = 48 images. Verify quality, adjust prompts if needed.
   - Phase 2 — remaining 41 packs × 12 = 492 images.
   - Runner is checkpointed; interrupts and reruns are safe.

4. **Wire imports into `src/lib/coverIcons.ts`** — for each pack, add 12 `import` lines and 12 entries in that pack's `makePack` map. The file is currently ~1,577 lines; the additions extend it by ~1,080 lines (24 per pack × 45 packs).

5. **Update `src/lib/pageImages.ts`** default fallback with 12 patriotic-roses imports (the default pack).

6. **Typecheck + build** — confirm no broken imports.

## Options for scope control

- **Full run (recommended)** — 540 icons, ~$8-15 in image credits at current Gemini pricing. Every cover fully supports every page.
- **Default pack only** — 12 icons for `patriotic-roses`, other packs fall through to the default. Fastest, cheapest, keeps parity later.
- **Themed subset** — pick 8-10 flagship packs (dragons, gothic-sirens, feather series, patriotic-roses, dreamscape, faith, hummingbird-garden, dove-ink) and generate for those only. ~120 images.

## Technical details

- Images saved as `.jpg` under `src/assets/page-icons/<pack-id>/<page-id>.jpg`.
- Batch runner already handles rate limits and resumes on failure.
- Aliases in `coverIcons.ts` already fall back to `patriotic-roses` when a pack is missing an icon, so mid-generation state doesn't break the UI.
- Prompts explicitly forbid text/numbers/watermarks — matches the existing pack style.

## Question before starting

Which option — full run, default pack only, or themed subset? If themed subset, please confirm the pack list.
