## Add 10 New Covers to the Library

Bringing total active covers from **17 → 27**.

### New covers (grouped by collection)

**Black Moon (5)** — dark/jewel palettes, gold sparkles
1. `black-rose-chains` — Spiked black rose with gold chains on starry black (the spread image, personalized — name fits the negative space on the left page)
2. `black-dahlia-sparks` — Black dahlia with golden star bursts
3. `black-dahlia-lights` — Black dahlia with fairy lights
4. `black-iris-stars` — Dark iris on starry field
5. `black-iris-glow` — Purple/black iris with golden bokeh

**Celestial Florals (3)** — moonlit romantic
6. `red-rose-moon` — Red rose under blue moon with fairy lights
7. `white-rose-moon` — White rose under full moon
8. `black-lilies-sparks` — Black lilies with golden sparkles

**Garden (1)**
9. `moonlit-oak` — Ancient oak draped in fairy lights under full moon

**Sparrow Series (1)**
10. `sparrow-moon-fairy-lights` — Plump sparrow on branch in front of full moon with fairy lights

### Implementation

**Assets** — copy uploads → `src/assets/covers/`:
- `black-rose-chains.png` (the PDF spread)
- `black-dahlia-sparks.jpg`, `black-dahlia-lights.jpg`
- `black-iris-stars.jpg`, `black-iris-glow.jpg`
- `red-rose-moon.jpg`, `white-rose-moon.jpg`
- `black-lilies-sparks.jpg`
- `moonlit-oak.jpg`
- `sparrow-moon-fairy-lights.jpg`

**`src/data/covers.ts`** — add imports + 10 entries to `COVERS` array. Reuse existing palettes:
- Black Moon entries → `paletteMoonlitButterflies` (deep purple-black with gold accents)
- `red-rose-moon` → new `paletteCrimsonMoon` (deep navy bg, crimson primary, warm gold accent)
- `white-rose-moon` → `paletteSparrowForgetMeNots` (cool moonlit blue)
- `moonlit-oak` → `paletteJewelDark`
- `sparrow-moon-fairy-lights` → `paletteSparrowWishes` (warm cream — fits the bird's tones)

**Personalization**: Mark `black-rose-chains` as `personalized: true` so the user's planner name renders into the left page's empty starry space (matches the existing scrapbook personalization pattern).

**New palette** — add `paletteCrimsonMoon` (one new dark palette tuned for the red-rose-on-moon mood: navy-black background, crimson primary, soft gold accent).

### Out of scope
No changes to `CoverPicker`, `useCoverTheme`, or any UI components — they read from `COVERS` automatically, so the 10 new covers appear immediately once the manifest updates.
