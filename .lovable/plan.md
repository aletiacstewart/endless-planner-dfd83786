# Sticker spawn position + theme tinting

## 1. Place new stickers at top-center

When a sticker (tray, recents, or library) is added while no text field is focused, it currently spawns near the middle of the page with random jitter, so you have to hunt for it.

- Spawn every new page-level sticker at `x: 50`, `y: 6` (top of the page, horizontally centered), with a tiny horizontal jitter only (±3%) so repeat picks don't perfectly overlap.
- Inline-in-field insertion behavior is unchanged.
- Free dragging, resize, rotate and layering stay as they are — the sticker just starts where you can see it.

Files: `src/components/entry/EntryPersonalization.tsx` (the three add paths: tray, recents, library).

## 2. Cheap way to color stickers to the cover theme

No image generation needed, so no AI credits: tint the existing PNGs with CSS filters using the active cover's palette. The library already uses one shared watercolor set, so a single tint pipeline covers everything.

How it works:
- Read the cover's `--primary` hue/saturation (already exposed by `useThemedSwatches` / `useCoverTheme`).
- Apply a CSS `filter` chain to sticker `<img>` elements: `grayscale(...) sepia(1) hue-rotate(<theme hue offset>) saturate(...) brightness(...)`, computed once from the theme hue. This pushes the art toward the cover's color family while keeping the watercolor shading.
- Add a per-sticker tint mode so it is opt-in and reversible: `tint?: "theme" | "none"` on the sticker meta, defaulting to `"theme"`; a small "Aa/color" toggle in the existing sticker control bar switches an individual sticker back to original colors.
- Show the same tint in the library dialog previews so what you pick is what you get.
- Emoji stickers are left untouched (filters would muddy them).

Trade-off to be aware of: filter-based tinting shifts hues uniformly, so multi-color stickers become more monochrome-in-theme rather than selectively recolored. It is instant, free, and works for all 180 stickers across all covers. If you later want true per-element recoloring, that would require regenerating art per cover (paid image generation) — not part of this plan.

## Technical notes

- New helper `src/lib/stickerTint.ts`: `themeFilter(hslPrimary: string): string` returning the filter string; memoized per theme.
- `StickerLayer.tsx`: apply the filter to `img` stickers, add the tint toggle to the control bar, persist `tint` in entry meta.
- `entryMeta.ts`: add optional `tint` field to the `Sticker` type (backward compatible — missing means themed).
- `StickerLibraryDialog.tsx` and the recents tray: same filter on previews.

## Verification

Open a planner entry, place a tray sticker and a library sticker: both appear at the top center, visible without scrolling, and drag freely. Switch covers in Settings and confirm sticker colors follow the new palette; toggle one sticker back to original colors and confirm it persists after reload.
