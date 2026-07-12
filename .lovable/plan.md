## Goal

Make the planner feel like Artful Agenda — every entry can be personalized with a color tag, a font choice, rich text formatting, and decorative stickers — while keeping your existing topics, sections, and cover-driven theming.

## What you'll get

**1. Per-entry color tag (themed to current cover)**
- Small color-dot picker at the top of every entry.
- Swatches are auto-derived from the active cover's palette (primary, accent, plus 4 tinted variants) — so a "Forget-Me-Nots" entry gets soft blue/pink/green dots, a "Noir" cover gets deeper tones, etc.
- Chosen color shows as a left border stripe on the entry, and as a dot on entry cards in section lists and the Home "Recent entries" widget.

**2. Font family + size per entry**
- Header dropdown with 4 curated fonts: Serif (current display), Sans, Handwriting (Caveat), Mono.
- Size toggle: S / M / L.
- Stored on the entry, applied to text/textarea/rich-text fields only (checkboxes, trackers, dates stay in the UI font so layout doesn't break).

**3. Rich text formatting**
- Upgrade every `textarea` field (Journal, Notes, Goals reflections, "Other" fields, etc.) to a lightweight rich-text editor.
- Toolbar: bold, italic, underline, bullet list, numbered list, text color (uses the cover's themed palette).
- Stored as HTML; existing plain-text entries render unchanged and upgrade on next edit.

**4. Decorative stickers**
- "Add sticker" button on each entry opens a sheet of themed stickers (reuses your cover-icon set — ladybugs, forget-me-nots, etc., plus a universal set: stars, hearts, checkmarks, arrows, weather).
- Stickers are placed inline at the cursor or floated on the page (draggable, resizable in small steps).
- Stored as an array on the entry (`stickers: [{id, x, y, size}]`) so they sync across devices.

## Where it applies

Everywhere — all existing page types. No pages removed, no sections renamed. Trackers keep their checkboxes; the new controls sit in an entry header bar above the existing fields.

```text
┌─ Entry header ────────────────────────────┐
│ [title]                    [font ▾] [S M L]│
│ ● ● ● ● ● ● ○   + sticker                  │
├───────────────────────────────────────────┤
│  (existing fields — trackers, notes, etc.) │
└───────────────────────────────────────────┘
```

## Technical notes

- **Storage**: extend `PlannerEntry` with optional `color?: string`, `font?: 'serif'|'sans'|'hand'|'mono'`, `fontSize?: 'sm'|'md'|'lg'`, `stickers?: Sticker[]`. All optional — existing entries and cloud sync stay compatible; no migration needed on `planner_entries` (values JSON already flexible, but we'll add three top-level columns via migration for query-ability of `color`).
- **Themed palette**: new `useThemedSwatches()` hook derives 6 HSL swatches from current cover palette; used by both color picker and rich-text color menu.
- **Rich text**: use Tiptap (`@tiptap/react` + starter-kit + underline + color + list extensions) — small, headless, works well with Tailwind. `FieldRenderer` gets a new `richtext` variant; existing `textarea` fields flip to it via a one-line change in `pageTypes.ts`.
- **Stickers**: new `<StickerLayer>` component absolutely-positioned over the entry body. Sticker catalog pulls from `coverIcons.ts` (themed set) + a new `src/data/universalStickers.ts` (always-available set).
- **Sync**: `saveEntry` already mirrors the full entry object, so new fields sync automatically once the migration adds the columns.

## Out of scope (for this pass)

- Drag-to-reschedule calendar view (that's a separate Artful-Agenda-style feature we discussed earlier).
- Custom user-uploaded stickers.
- Per-field (as opposed to per-entry) font/color overrides.

Approve and I'll build it in this order: swatches hook → entry header bar (color + font + size) → rich text upgrade → sticker layer → cloud sync migration.