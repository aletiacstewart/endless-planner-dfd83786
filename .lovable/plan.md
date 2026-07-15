## Register 11 pack covers

I've matched the 10 uploaded covers to pack IDs. Waiting on the 11th (Patriotic White Rose).

| Upload | Pack ID |
|---|---|
| 75-2.png (red rose + flag) | `patriotic-roses` |
| 76-2.png (horned lizard) | `texas-horned-lizard` |
| 77-2.png (cactus + moon) | `starlit-cactus` |
| 78-2.png (pecan tree) | `pecan-tree-moon` |
| 79-2.png (wheat + moon) | `golden-wheat-moon` |
| 80-2.png (bluebonnet) | `bluebonnet-moon` |
| 81-2.png (monarch butterfly) | `monarch-moon` |
| 82-2.png (longhorn + star) | `longhorn-star` |
| 83-2.png (mockingbird) | `mockingbird-moon` |
| 73-2.png (blue rose + flag) | `patriotic-blue-rose` |
| _pending_ | `patriotic-white-rose` |

### Steps

1. Register each upload as a Lovable Asset via `lovable-assets create` → write `src/assets/covers/<pack-id>.jpg.asset.json` pointer files (keeps binaries out of the repo).
2. Rewrite `src/data/covers.ts`:
   - Import all 11 cover asset pointers.
   - Define a matching `CoverPalette` per cover (e.g. patriotic red/white/blue for the rose+flag covers; deep-night gold for the celestial "moon" covers; desert teal+gold for cactus; earthy brown+star-gold for lizard/longhorn; etc.).
   - Replace the placeholder `COVERS` array with the 11 real entries, each assigned to an appropriate `collection` from existing `COLLECTIONS` (e.g. `celestial-birds-insects`, `sparrow`, `garden`, `classic`).
   - Set `DEFAULT_COVER_ID` to `patriotic-roses` (the free included pack).
3. Update `src/data/coverPacks.ts`: change `INCLUDED_PACK_IDS` from `["placeholder"]` to `["patriotic-roses"]` so the first pack is free/included.
4. Wait for the 11th upload before finalizing — until then I'll register the 10 available and add `patriotic-white-rose` as soon as it arrives.

### Not changing

- Existing icon sets in `src/lib/coverIcons.ts` (already keyed to these 11 IDs).
- Pricing, checkout, `CoverPicker`/`CoverPackPicker` UI, sync.
- The `personalized` scrapbook code path (none of these 11 covers are personalized).

### Question

Should I proceed with registering the 10 uploads now and add the White Rose in a follow-up, or wait until you upload the 11th and do them all in one batch?