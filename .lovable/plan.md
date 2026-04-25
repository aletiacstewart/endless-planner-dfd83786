## Goal

Wipe all 63 existing cover images from `src/assets/covers/` and replace them with the freshly resized versions you upload. Keep every cover the app references intact (same IDs, same file names, same palettes) so nothing else has to change.

## How this will work

You upload your new covers (max 10 files per chat message, 20 MB each — Lovable's upload limit). Across batches, send all 63. After each batch I'll drop them into `src/assets/covers/`, overwriting the old file of the same name.

**Critical: the file names must match exactly.** The app imports each cover by an exact path like `@/assets/covers/sparrow-lotus.jpg`. If a new file isn't named `sparrow-lotus.jpg`, the import breaks.

If any names don't match, I'll rename your uploads to match before saving — just tell me which uploaded file maps to which cover (or I'll guess from visual context and confirm).

## The 63 file names you need (all `.jpg`)

```text
affirmation-floats-hope            faith-affirmations-sticker        garden-pink-rose-dew
affirmation-fragile-not-broken     faith-cross-heart                 garden-sun-dragonfly
black-dahlia-lights                faith-cross-roses                 garden-teardrop-lily
black-dahlia-sparks                faith-sticker-rainbow-cross       garden-white-butterfly
black-iris-glow                    feather-arrow-amber               golden-dragonfly
black-iris-stars                   feather-arrow-amethyst            harvest-moon-butterfly
black-lilies-sparks                feather-arrow-azure               harvest-moon-dahlia
black-rose-chains                  feather-arrow-crimson             harvest-moon-iris
botanical-spirit-cosmos            feather-arrow-emerald             harvest-moon-lilies
botanical-spirit-leaves            feather-arrow-gold                harvest-moon-rose
botanical-spirit-pond              garden-admiral-orchid             midnight-swallowtail
botanical-spirit-river             garden-blue-butterfly-orchid      moonlit-butterflies
chronicles-dark-light-pair         garden-coral-hummingbirds         moonlit-oak
chronicles-dark-raven-roses        garden-dragonfly-grasses          red-rose-moon
chronicles-light-rose-dove         garden-forget-me-nots-ladybugs    sparrow-dandelion
classic-ivory-ribbons              garden-hummingbird-mimosa         sparrow-forget-me-nots
classic-warm-leather               garden-hummingbirds-olive         sparrow-lotus
crystal-vines-amber                garden-lavender-dragonflies       sparrow-moon-fairy-lights
crystal-vines-blush                                                  sparrow-moon-lanterns
dandelion-ladybugs-night                                             sparrow-on-moon
ember-hummingbird                                                    sparrow-wishes
emperor-moth                                                         vintage-scrapbook
                                                                     white-rose-moon
```

(That's 63 total — you can always ask me for the list again.)

## Image specs (reminder so nothing crops)

- **1200 × 1200 pixels**, square (1:1)
- **JPG**, sRGB
- Keep the bottom 25% visually calm — that's where the title overlay sits
- Under ~500 KB each is ideal

## Removing covers you don't want to keep

If, during the process, you decide some covers shouldn't exist anymore, tell me their names and I'll:
1. Delete the image file
2. Remove its `import` line + entry from `src/data/covers.ts`
3. Drop any `pairWith` references that point at it

The picker auto-hides empty collections, so removing covers won't leave gaps.

## Per-batch workflow

For each batch you send:
1. Save each upload to `src/assets/covers/<exact-name>.jpg`, overwriting the old file
2. If filenames don't match, I'll rename based on your mapping or ask
3. After the final batch, run `tsc --noEmit` to confirm all 63 imports still resolve
4. Confirm bundle is clean

## Out of scope

- Adding **new** covers beyond the existing 63 (would need new IDs + palettes — separate task)
- Palette / color changes
- Picker layout changes

## Summary of changes

- Up to 63 image files in `src/assets/covers/` overwritten with your new versions
- Optional: removed covers also pruned from `src/data/covers.ts`
- No code changes required if all 63 names match
