# Regenerate icon packs to match covers

Eleven targeted fixes to the icon packs. Every fix follows the same pipeline: update the style prompt in `scripts/icons/prompts.ts` for the affected pack(s), regenerate `prompts.mjs`, delete the stale JPGs under `src/assets/page-icons/<pack>/`, and re-run `scripts/icons/run_batch.py` for that pack. Because `coverIcons.ts` already imports every icon by path, no code changes are required unless a pack is being renamed or added.

## Fixes

1. **White Rose Moonlight** (`white-rose-moonlight`) — rewrite style prompt so every rose in every icon is a WHITE rose (currently generating red). Regenerate all 32 pages.

2. **Rename Patriotic Roses → Red Patriotic Roses** — in `src/data/covers.ts` update the display name from "Patriotic Roses" to "Red Patriotic Roses". Rewrite the `patriotic-roses` style prompt to mirror the `patriotic-blue-rose` composition (flag backdrop + rose beside/around the subject), but with RED roses instead of blue. Regenerate all 32 icons. Pack folder id stays `patriotic-roses` to avoid touching every import in `coverIcons.ts` and `pageImages.ts`.

3. **Black Moon covers + Swallowtail Moon → Celestial Wings style** — clone the `luminous-hummingbird` (Celestial Wings) style prompt for these packs and regenerate:
   - `black-lily-moon`
   - `black-dahlia-moon`
   - `black-rose-moon`
   - `red-rose-moonlight`
   - `swallowtail-moon`
   - Any other "moon" pack the user meant — will confirm the exact list before generating (see question below).
   Each keeps its own subject motif (lily, dahlia, rose, swallowtail) but adopts the Celestial Wings dark-with-warm-bokeh treatment.

4. **Sparrow Moon Lights** (`sparrow-moon-lights`) — currently every icon is a sparrow-on-branch. Rewrite prompt so the sparrow appears on/inside the actual subject for each page (piggy bank, dumbbell, calendar grid, etc.), matching how the cover itself is styled. Regenerate all 32.

5. **English Rose** (`english-rose-dew`) — remove dragonfly from the style prompt. Regenerate all 32 (the dragonfly currently appears in most icons).

6. **Cream Ribbons** (`cream-ribbons`) — remove gemstone/jewelry motif from the style prompt; use cream silk ribbon accents on ivory background instead. Regenerate all 32.

7. **Dove & Raven** (`dove-raven-roses`) — style prompt currently favors the raven. Rewrite so BOTH the white dove and the black raven appear together in every icon, with red roses. Regenerate all 32.

8. **Sapphire Feather** (`feather-sapphire`) — currently generating amber/gold. Rewrite prompt for sapphire-BLUE feathers and blue color palette. Regenerate all 32.

9. **Gold Feather** (`feather-gold`) — currently generating orange-tinted. Rewrite prompt for GOLD/yellow feathers and gold palette (not orange, not amber). Regenerate all 32.

10. **All Dragon packs** — the 11 dragon packs (`dragon-curling-ember`, `dragon-filigree`, `dragon-heart-flame`, `dragon-onyx`, `dragon-skull-ember`, `dragon-sovereign`, `dragon-thornwood`, `dragon-twin-flame`, `dragon-whirlwind`, `dragon-winged-cross`, `dragons`) are producing minimalist/cartoon silhouettes. Rewrite each style prompt to reference the actual cover art (detailed illustrated dragon, painterly, matching cover palette). Regenerate all 32 icons per pack × 11 packs = 352 icons.

11. **All Gothic Siren packs** — 9 packs (`gothic-siren-cathedral-throne`, `gothic-siren-conch-skull`, `gothic-siren-haloed-conch`, `gothic-siren-horned-queen`, `gothic-siren-nautilus`, `gothic-siren-ribbed-crown`, `gothic-siren-skeleton`, `gothic-siren-webbed`, `gothic-siren-winged-fae`, `gothic-siren-cathedral-nautilus`). Rewrite prompts so each uses its own cover art as the background and renders the page subject in solid black silhouette in front. Regenerate all 32 × 10 = 320 icons.

## Volume + credit estimate

Approximate icons to regenerate: 32 pages × ~28 packs ≈ **~900 icons**. The bulk (11 dragons + 10 sirens = 21 packs = ~670) comes from fixes 10 and 11. Runner is checkpointed; safe to interrupt and resume.

## Execution order

1. Small, cheap fixes first so quality can be verified on style-prompt changes before spending on large batches:
   Fix 5 (english-rose), 6 (cream-ribbons), 8 (sapphire), 9 (gold), 1 (white rose moonlight), 7 (dove-raven), 4 (sparrow-moon-lights), 2 (red patriotic).
2. Pilot one dragon pack (fix 10) and one siren pack (fix 11), review, then run the rest.
3. Fix 3 (black moon + swallowtail) after confirming the pack list.

## Question before starting

For fix 3, "all the black moon covers" — should I include `red-rose-moonlight` and `white-rose-moonlight` in that Celestial Wings restyle group, or only the covers whose IDs start with `black-` (`black-lily-moon`, `black-dahlia-moon`, `black-rose-moon`) plus `swallowtail-moon`? Note fix 1 already restyles `white-rose-moonlight` separately, so it would be excluded from group 3 either way.
