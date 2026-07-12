## Goal
Make entry personalization much more powerful and fix current bugs (sticker placement, delete affordance, font-size not applying, rich-text formatting not working across fonts, no title/background controls).

## 1. Sticker system fixes
- **Default position**: new stickers appear in a top "sticker tray" row directly under the personalization toolbar (not randomly placed on the page). User can then drag them anywhere.
- **Explicit delete**: on tap/click a sticker becomes "selected" and shows a small ✕ badge in the corner to remove (keep double-click as a shortcut). Works on touch.
- **Expanded sticker library** (~60+), grouped in tabs inside the popover:
  - Nature: 🌸🌿🍃🌷🌻🌹🌼🌺🍀🌵🌾🌲🍁🍂
  - Weather: ☀️🌤️⛅🌧️⛈️🌩️❄️🌨️🌈🌪️💧
  - Mood: 😊😍🥰😌😢😴😤🤩😇🙂‍↕️😮‍💨
  - Health: 💊💉🩺❤️‍🩹🧘🏃💧🥗🍎☕🍵
  - Symbols: ⭐✨💫🔥💯✅❌⚠️📌🔖🏷️
  - Celebrate: 🎉🎊🎂🎁🌟🏆👑💐
  - Objects: 📖✏️📝📎🕯️🌙☁️💡🔑
- Size slider on selected sticker (S/M/L/XL) + rotate (‑15° / 0 / +15°).

## 2. Typography — separate controls for titles / subtitles / body
Replace the single font/size control with three grouped chips in the toolbar:
- **Title** (H1 / page name + section headings): font + color + size (S/M/L)
- **Subtitle** (field labels + linked-summary): font + color + size
- **Body** (input text, notes, rich-text): font + color + size

Each control opens a popover with:
- Font family: Serif · Sans · Handwritten · Mono · Display (adds "Playfair Display") · Rounded (adds "Nunito")
- Color: themed swatch row + "no override"
- Size: S / M / L / XL

Stored under `entry.values.__meta` as:
```
typography: {
  title:    { font, size, color }
  subtitle: { font, size, color }
  body:     { font, size, color }
}
```
Existing `font`/`fontSize`/`color` values migrate into `body` on read (no data loss, no migration needed).

## 3. Font-size bug fix
Current `FONT_SIZE_PX` only applies to the `<main>` wrapper — inputs, labels, and section headings use their own tailwind classes that override the inherited size. Fix by:
- Emitting CSS variables (`--entry-title-size`, `--entry-body-size`, etc.) on `<main>` and referencing them from `.section-title`, `.field-label`, `input`, `textarea`, `.richtext` inside a scoped `[data-entry-styled]` block in `index.css`.
- Same pattern for font-family and color so all three groups actually take effect.

## 4. Rich text works across fonts + reliability
- Switch `RichTextField` from deprecated `document.execCommand` (unreliable in some browsers, ignores inherited font stacks on some spans) to a small, dependency-free command layer using `Selection` + `Range` wrappers (`<strong>`, `<em>`, `<u>`, `<span style="color:…">`).
- Ensure the editor inherits the Body font/size CSS variables so bold/italic/underline render in the chosen font (currently the toolbar's `<span>` wrapper can lose the font stack).
- Keep the existing HTML shape backward-compatible.

## 5. Page background color
Add a **Background** chip to the toolbar with:
- Paper (default gradient — current look)
- Themed pastel swatches (cream, sage, blush, sky, lavender, peach) generated from `useThemedSwatches`
- "Solid white" and "Solid off-white"
- Optional subtle pattern toggle (dots · lines · grid · none)

Stored as `meta.background = { kind: 'paper'|'solid'|'pattern', color?, pattern? }`. Applied to `<div className="min-h-screen">` in `Entry.tsx` instead of the hard-coded `var(--gradient-paper)`.

## 6. Additional customizations
- **Section card color**: each section (rendered by `PageRenderer`) gets an optional tint pulled from `meta.sectionTint` (single accent applied to all section cards with 8% opacity fill + matching border).
- **Accent stripe width**: S (2px) / M (4px, current) / L (6px) toggle when a color is picked.
- **Reset all personalization** button (trash icon at end of toolbar) — clears `__meta` back to defaults with a confirm toast.
- **Compact vs. spacious** density toggle affecting section padding.

## 7. Toolbar reorganization
The toolbar is getting busy. Reorganize `EntryPersonalization.tsx` into a horizontally scrollable strip with clearly-labeled chip groups:

```text
[ Title ▾ ] [ Subtitle ▾ ] [ Body ▾ ] │ [ Background ▾ ] [ Accent ▾ ] [ Density ▾ ] │ [ Stickers ▾ ] [ Reset ]
```

Sticker tray (thumbnails of placed stickers with size/rotate/delete controls) renders directly under the toolbar when any sticker exists — this is the "default top placement" the user asked for. Stickers still float over the page, but the tray is the canonical control surface.

## Technical section

**Files to change**
- `src/lib/entryMeta.ts` — extend `EntryMeta` with `typography`, `background`, `sectionTint`, `density`, `accentWidth`; add migration read-through mapping old `font`/`fontSize`/`color` to `typography.body`; expand `UNIVERSAL_STICKERS` and add `STICKER_GROUPS`.
- `src/components/entry/EntryPersonalization.tsx` — full rewrite into grouped popovers (Title/Subtitle/Body/Background/Accent/Density/Stickers/Reset) and a StickerTray subcomponent.
- `src/components/entry/StickerLayer.tsx` — add selection state, ✕ delete badge, size/rotate handles when selected, deselect on outside tap.
- `src/components/entry/RichTextField.tsx` — replace execCommand with a Selection/Range-based formatter; ensure editor inherits body font vars.
- `src/pages/Entry.tsx` — write typography/background/tint/density as CSS variables + data-attrs on `<main>` and `<div>`; render StickerTray above `<main>`.
- `src/index.css` — add `[data-entry-styled]` scoped rules mapping the CSS variables to `.section-title`, `.field-label`, `input`, `textarea`, `.richtext`, plus pattern backgrounds.
- `src/components/FieldRenderer.tsx` — apply body-typography vars to inputs/labels (small class tweaks only, no logic changes).

**Data model (backward compatible)**
```ts
interface EntryMeta {
  // NEW
  typography?: { title?: TypoSpec; subtitle?: TypoSpec; body?: TypoSpec }
  background?: { kind: 'paper'|'solid'|'pattern'; color?: string; pattern?: 'dots'|'lines'|'grid' }
  sectionTint?: string
  accentWidth?: 'sm'|'md'|'lg'
  density?: 'compact'|'cozy'|'spacious'
  // EXISTING (still read for old entries)
  color?: string; font?: EntryFont; fontSize?: EntryFontSize; stickers?: Sticker[]
}
interface TypoSpec { font?: EntryFont; size?: EntryFontSize; color?: string }
```

**Non-goals**
- No new fonts loaded from Google Fonts beyond the two additions (Playfair Display, Nunito) — piggyback on existing font loading in `index.html`.
- No schema/database changes — everything is stored in `entry.values.__meta` and syncs via the existing engine.
- No changes to page structure, sections, or business logic.
