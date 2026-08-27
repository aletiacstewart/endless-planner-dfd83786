# Revised Plan: One Shared Sticker Library + Page-Icon Cleanup

## Answer first: stickers vs. library

They are the same feature. The "Library" button in the entry toolbar opens the sticker library dialog, which reads from the sticker registry (`getStickerSet`). There is one sticker system, not two. So "60-piece sticker and library sets" was really one set shown in one dialog.

## What changes vs. the previous plan

- **Drop per-cover sticker art.** Instead of 98 covers x 60 stickers (5,880 images), generate **one shared sticker library** used by every cover. This removes ~98% of the sticker generation cost.
- Page icons stay per-cover (those genuinely must match the cover art) and continue with the existing audit + targeted regeneration.

## The shared sticker library (topic-based)

Stickers are organised by **planner topic**, so every page has relevant pieces. Target ~180 stickers total, grouped into browsable tabs in the library dialog:

- Celebrations — birthdays, anniversaries, holidays (seasonal set), parties, gifts, cake, balloons, confetti
- School & Work — books, backpack, exams, deadlines, meetings, projects, pencils, laptop
- Meals & Food — breakfast/lunch/dinner, groceries, water glasses, coffee/tea, fruit, meal prep
- Exercise & Fitness — yoga, weights, walking/running, stretching, steps, sports
- Health & Medical — appointments, pills/meds, doctor, dentist, vitals, lab results, sleep, mood
- Self-Care — bath, candle, skincare, reading, rest, meditation, journaling
- Chores & Home — cleaning, laundry, dishes, trash, pets, plants, car, repairs
- Money — bills, payday, savings, budget, shopping
- Travel & Events — trips, flights, car travel, hotel, tickets, camping
- Utility — banners/labels/tags (blank, writable), washi strips, arrows, checkmarks, stars, priority flags, date circles

Style is one consistent neutral-but-pretty look (soft watercolor/gouache die-cut stickers) so the set sits well on every cover theme rather than clashing with any single one.

## Behaviour in the app

- The library shows the same set no matter which cover is active, so switching covers never empties or breaks the library.
- Page icons still follow the active cover and swap when the cover changes.
- Recently-used stickers and the sticker tray keep working unchanged.

## Purchase flow (unchanged from prior plan)

- Remove `?cover=` auto-selection: arriving from a cover card scrolls to and highlights the cover but selects nothing.
- The user explicitly chooses the cover included with activation; checkout stays disabled until then.
- Cover preview dialog gains a tab to preview the page icons for that cover, plus the shared sticker library.

## Technical notes

- `src/data/stickers.ts`: replace the collection-keyed registry with a single `SHARED_STICKER_SET` built from a generated manifest; keep `getStickerSet()` as the accessor (signature simplified, callers updated) so no consumer logic changes.
- New: `public/stickers/shared/<category>/<n>.png` plus a generated manifest (`src/data/stickerPacks.ts` pattern). Served as static URLs, so bundle size is unaffected.
- `scripts/stickers/run_batch.py`: retarget from per-cover loops to one shared topic-driven prompt list; drop the cover style-bible reference.
- `src/components/entry/StickerLibraryDialog.tsx`: category tabs for the new topic groups; no cover dependency.
- `src/pages/PlannerDetail.tsx`: remove preselect, add scroll + highlight.
- Page icons: continue `scripts/icons/fix_flagged.py` against the existing audit report, then re-audit until clean.

## Sequencing

1. Land the shared sticker registry with topic categories and the library dialog update.
2. Generate the shared sticker art category by category (cheap, one pass).
3. Update the purchase flow to require an explicit cover choice.
4. Resume page-icon regeneration for flagged icons and re-audit.
