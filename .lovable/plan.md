# Icon Accuracy Pass + Cleanup

## 1. Remove "Preview is in test mode" banner
- Delete `<PaymentTestModeBanner />` usage from `PlannerDetail.tsx`, `Subscribe.tsx`, `Packs.tsx`.
- Delete `src/components/PaymentTestModeBanner.tsx`.

## 2. Remove Ivory Ribbons cover (duplicate of Midnight Ribbons)
- Remove `ivory-ribbons` entry + import from `src/data/covers.ts`.
- Remove `ivory-ribbons` pack block and `ribbons-ivory` imports from `src/lib/coverIcons.ts`.
- Delete `src/assets/covers/ivory-ribbons.png.asset.json` and `src/assets/page-icons/ribbons-ivory/`.
- Remove from `src/data/coverPacks.ts` if referenced.

## 3. Prompt rewrites in `scripts/icons/prompts.ts` + `prompts.mjs`

Per-collection style directives — each collection gets a distinct visual DNA drawn from its cover, no two share a look:

| Collection | New style direction |
|---|---|
| patriotic-roses (Red), patriotic-blue-rose (Blue), patriotic-white-rose (White) | Match image 2 aesthetic: rich cinematic flatlay — flag drapery + rose color of the set + subject object centered (open book, journal, wreath, scale, glucometer, candle, broom, etc.). Never mix rose colors between packs. |
| rose-cross-stars ("Rose Cross & Stars") | Same flatlay language as patriotic set but replace flag with cross/star iconography on deep burgundy + red roses — currently mixed, redo cleanly. |
| woven-heart-cross | Rustic woven-heart + cross flatlays on linen; no shared imagery with rose-cross-stars. |
| dove-white-roses | Every icon features a white dove + white/blush roses, no ravens, no random subjects. |
| dove-raven-roses ("Dove & Raven") | Every icon MUST include BOTH a white dove AND a black raven with red roses. |
| english-rose-dew | Pink/peach English garden roses + dew + soft botanical; **explicitly ban dragonflies and any insects**. |
| cream-ribbons | Only cream/ivory silk ribbons + parchment; **ban gemstones, gold bullion, jewels**. |
| feather-emerald | Redo — deep emerald feather matching cover (currently off). |
| feather-sapphire | Blue feathers on sky/cloud background (currently purple — wrong). Ban purple/violet. |
| feather-gold | Warm gold/yellow feathers (not orange). |
| feather-amethyst / crimson / phoenix | Confirm color-lock per cover; no cross-contamination. |
| black-dahlia-moon, black-rose-moon, black-lily-moon, midnight-iris-moon, swallowtail-moon, midnight-moth-bloom, monarch-moon, moth-dragonfly-lotus | Dark celestial background (indigo/black + gold moon + stars) for EVERY icon; subject = the specific flora/fauna of that cover only. No mixing between them. |
| sparrow-moon-lights | Every icon features a **sparrow** (not mockingbird) + string lights + moon. |
| mockingbird-moon | Mockingbird only; keep separate from sparrow set. |
| white-rose-moonlight | White roses only under moonlight. Ban red/pink roses. |
| red-rose-moonlight | Red roses only. |
| faith-affirmations-bright | Pull palette from cover stickers — bright rainbow pastels, hand-lettered sticker vibe, cheerful. |
| faith-affirmations-muted | Muted sage/blush/cream sticker vibe. |
| dragons (10 covers: onyx, thornwood, ember, curling-ember, skull-ember, filigree, sovereign, heart-flame, twin-flame, whirlwind, winged-cross) | **Not flags.** Each cover gets its own cinematic dragon-themed flatlay: subject object (book, scroll, timepiece, apothecary bottle, candle, quill) staged with dragon-scale textures, hoard elements, and the exact palette from that cover (onyx=black/silver; ember=red/orange embers; thornwood=forest green/bronze; filigree=ivory/gold; sovereign=purple/gold; heart-flame=crimson; twin-flame=twin fire tones; whirlwind=stormy grey/blue; winged-cross=gothic gold/black). |
| gothic-sirens (10 covers) | **Not flags.** Each siren cover keeps the SAME background as its cover (cathedral stone / deep sea / bone / etc.) with subject objects rendered in silhouetted black ink over that background. Per-cover palette lock. |

Update `PAGE_SUBJECTS` prompt fragments as needed to remove flag defaults for dragon/siren packs.

## 4. Regenerate

Clear checkpoint entries + `src/assets/page-icons/<pack>/` folders for every collection above (~26 packs × 20 pages ≈ 520 icons). Relaunch `scripts/icons/run_batch.py` in the background writing to `/tmp/regen.log`. Placeholder-from-`patriotic-roses` will be copied first so Vite build stays green while regen runs.

## 5. Verification pass
After regen finishes, spot-check every affected folder in `CoverIconPreviewDialog` grid to confirm palette + subject match. Fix any stragglers with a targeted rerun.

## Files touched
- `src/components/PaymentTestModeBanner.tsx` (delete)
- `src/pages/{PlannerDetail,Subscribe,Packs}.tsx`
- `src/data/covers.ts`, `src/data/coverPacks.ts`
- `src/lib/coverIcons.ts`
- `scripts/icons/prompts.ts`, `scripts/icons/prompts.mjs`
- `src/assets/page-icons/*` (regen)

## Notes
- Missing reference images: your message points at "image 3–8" but only 2 images were attached this turn. I'll use the descriptions in the message + prior batches; if any pack looks off after regen, resend the specific reference and I'll re-tune just that pack.
- Regen is long-running (~1–2 hours for 500+ icons). I'll launch and background it, and you can ping "status" anytime.
