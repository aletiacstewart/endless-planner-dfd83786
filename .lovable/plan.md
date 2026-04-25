## Personal Planner & Journal — Cover System + Onboarding

A planner app where the user names their own planner, picks a cover from 57 hand-curated artworks (organized into 10 collections), and the entire app re-themes to match their cover.

---

## 1. First-launch onboarding flow

A 3-step gated flow shown only on first launch (state persisted in IndexedDB):

```text
Step 1: Welcome           Step 2: Name your planner    Step 3: Choose your cover
┌──────────────────┐      ┌──────────────────┐         ┌──────────────────┐
│  hero artwork    │  →   │  "What would you │   →     │  Cover picker    │
│  "Your story,    │      │   like to call   │         │  10 collections, │
│   your planner"  │      │   your planner?" │         │  57 covers       │
│  [ Begin ]       │      │  [ text input ]  │         │  [ Use this one ]│
└──────────────────┘      └──────────────────┘         └──────────────────┘
```

After step 3 → splash animation reveals the planner home with their chosen cover and name applied. Onboarding never re-appears; cover and name are always editable from Settings.

---

## 2. The 57 covers — 10 collections

| # | Collection | Count | Vibe |
|---|---|---|---|
| 1 | Celestial Florals | 8 | Bold, jewel-toned, dark backgrounds |
| 2 | Celestial Birds & Insects | 4 | Hyper-detailed nature on dark |
| 3 | Black Moon | 6 | Dramatic black + cream moon + butterflies/lotus |
| 4 | Garden | 6 | Painterly florals, mid-tone backgrounds |
| 5 | Sky / Wings & Arrows | 6 | Pastel sky, feathers, arrows, mood-coded |
| 6 | Sparrow Series | 4 | Soft, hopeful, "change of life" themed |
| 7 | Affirmations / Typography | 6 | Word-led: "Fragile, Not Broken" etc. |
| 8 | Faith | 5 | Monochrome symbols, typographic collages |
| 9 | Light/Dark Chronicles | 2 | Companion pair (#45 + #48) |
| 10 | Scrapbook / Journal | 1 | Vintage paper collage (#56, personalized) |
| 11 | Classic / Neutral | 9 | Calm fallback options |

Total: 57 covers. Each gets a stable ID, name, group, and theme palette.

---

## 3. Per-cover auto-theming

Each cover declares its own palette (primary, accent, surface, ink, mode). When the user selects a cover, the app re-themes:

- **Black Moon / Celestial** → dark mode, jewel accents (deep navy bg, gold/teal highlights)
- **Garden / Sparrow** → light mode, warm cream surfaces, sage/blush accents
- **Sky / Wings & Arrows** → light mode, pale sky backgrounds, mood-coded accent per cover
- **Affirmations / Faith** → high-contrast neutral, accent matches the typographic color
- **Scrapbook** → cream paper, muted pastels, serif accent
- **Classic** → neutral safe defaults

Theme switch is animated (200ms cross-fade). All UI components consume tokens from `index.css` HSL variables — never hardcoded colors.

---

## 4. The personalized Scrapbook cover (#56)

Cover #56 has a blank lined "Belongs to" note baked into the artwork. When this cover is selected:

- Render the base image
- Overlay the user's planner name + their display name on the blank note region using a handwritten-style font (e.g. *Caveat* or *Kalam* from Google Fonts)
- Coordinates of the note region are pre-measured constants stored with the cover metadata
- The personalized version is rendered on a `<canvas>` at runtime so it stays sharp and updates if the user renames their planner

---

## 5. Cover picker UX

Full-screen modal (also reachable from Settings):

```text
┌─────────────────────────────────────────────┐
│  Choose your cover            [ × close ]   │
├─────────────────────────────────────────────┤
│  [ All ] [ Celestial ] [ Garden ] [ Sky ]…  │  ← horizontal chip filter
├─────────────────────────────────────────────┤
│   ▢▢▢   ▢▢▢   ▢▢▢                            │
│   ▢▢▢   ▢▢▢   ▢▢▢      thumbnail grid       │
│         (lazy-loaded)                       │
├─────────────────────────────────────────────┤
│  Selected: "Sparrow & Forget-Me-Nots"       │
│  [ Preview ]            [ Use this cover ]  │
└─────────────────────────────────────────────┘
```

- Tapping a thumbnail shows a large preview with the theme preview applied behind
- "Pair companion" hint shown for #45↔#48 and Black Moon dark/light pairs
- Search by name + filter by collection

---

## 6. Splash screen

Shown for ~1.2s on every app launch (after onboarding):

- Full-bleed cover artwork
- User's planner name in elegant serif (auto-color-matched to the cover)
- Subtle fade-out into the home screen

---

## 7. Asset processing pipeline

Each of the 57 source images is processed once into 3 variants per cover, stored under `src/assets/covers/`:

| Variant | Size | Purpose |
|---|---|---|
| `hero` | 1600w WebP | Splash screen + cover picker preview |
| `thumb` | 400w WebP | Cover picker grid |
| `splash-blur` | 32w blurred WebP | LQIP placeholder while hero loads |

A one-off Node script (`scripts/process-covers.ts`) reads source PNGs, runs sharp, writes WebP outputs, and emits `src/data/covers.ts` containing the manifest (id, name, group, paths, theme palette, optional pair-companion ID).

---

## 8. Persistence

IndexedDB (via `idb` library) — single `settings` store with a `user` record:

```ts
{
  planner_name: string,        // e.g. "My Year"
  display_name: string | null, // for scrapbook personalization
  cover_id: string,            // selected cover
  onboarded: boolean,
  created_at: number
}
```

No backend needed for the cover system itself. (If the user later wants journal entries to sync across devices, we'd add Lovable Cloud — but that's out of scope for this plan.)

---

## 9. File structure

```text
src/
  assets/covers/
    {cover-id}/{hero,thumb,splash-blur}.webp     ← 57 × 3 = 171 files
  data/
    covers.ts          ← manifest: id, name, group, paths, theme, pair
    collections.ts     ← collection metadata + ordering
  lib/
    db.ts              ← IndexedDB wrapper
    theme.ts           ← apply cover palette to CSS vars
    scrapbook-canvas.ts ← personalized #56 renderer
  components/
    onboarding/
      OnboardingFlow.tsx
      WelcomeStep.tsx
      NameStep.tsx
      CoverStep.tsx
    cover/
      CoverPicker.tsx
      CoverGrid.tsx
      CoverThumb.tsx
      CoverPreview.tsx
      ScrapbookCover.tsx   ← canvas-based personalized renderer
    SplashScreen.tsx
  hooks/
    useUserSettings.ts
    useCover.ts
    useTheme.ts
  pages/
    Index.tsx          ← home (gated by onboarded flag)
    Settings.tsx       ← change name / cover
scripts/
  process-covers.ts    ← one-off image pipeline
```

---

## 10. Technical details

- **Image processing**: `sharp` for resize + WebP conversion, run once via `bun scripts/process-covers.ts`. Outputs committed to repo.
- **Theme application**: `useTheme` hook writes to `document.documentElement.style` setting HSL CSS variables defined in `index.css`. All Tailwind utilities reference these tokens via `tailwind.config.ts`.
- **Personalized cover**: `<canvas>` element, drawn with `Image` + `ctx.fillText`, exported as data URL or rendered in-place. Re-renders on name change via React effect.
- **Onboarding gate**: `App.tsx` reads `onboarded` flag; if false, renders `OnboardingFlow` instead of routes.
- **Routing**: Existing React Router setup. Add `/settings`. Home `/` is the planner shell.
- **Lazy loading**: Cover thumbnails use native `loading="lazy"`; hero/splash images preloaded only for the active cover.
- **Fonts**: Google Fonts via `<link>` in `index.html` — *Cormorant Garamond* (serif headings), *Inter* (UI), *Caveat* (scrapbook handwritten overlay).
- **No PWA / service worker** — keeps the preview sandbox stable. App is still installable via browser "Add to Home Screen" using a basic manifest if desired later.

---

## 11. What's NOT in this plan (intentionally)

- The actual planner/journal content (entries, calendar, tasks) — this plan covers only the cover system, naming, and shell. We can layer planner features in a follow-up.
- Cloud sync / accounts.
- Mood-mapper for Wings & Arrows covers (mentioned earlier as optional — skipping unless you want it).
- Animated cover transitions beyond the basic theme cross-fade.

---

## 12. Build order

1. Asset pipeline + manifest generation (one-time script run)
2. IndexedDB settings + `useUserSettings` hook
3. Theme system + `useTheme` (CSS var token plumbing)
4. Onboarding flow (3 steps)
5. Cover picker + collections UI
6. Scrapbook canvas personalization
7. Splash screen + home shell wiring
8. Settings page (rename planner, change cover)
9. QA pass: test all 57 covers render, theme correctly, and personalize correctly

Approve this and I'll start building.