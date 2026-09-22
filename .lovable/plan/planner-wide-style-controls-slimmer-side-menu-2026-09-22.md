# Planner-wide style controls + slimmer side menu

## 1. Style controls on the planner's second page

Add a "Planner style" card to the right-hand page of the open planner (below Today's tracker), holding the same controls you see today on a page: Title, Subtitle, Body, Background, Cards, Accent, Cozy/spacing, Sticker, Library, Reset.

How it behaves:
- Changes made here are a draft — nothing changes across the journal until you press **Apply**.
- A small preview panel sits beside the controls, showing a miniature planner page (title, subtitle, a couple of lines, a tinted card, accent stripe, background) that updates live as you adjust.
- **Apply to all pages** asks first: "All pages" or "Only pages I haven't styled myself". Your choice is applied to existing entries and saved as the default for every new page.
- **Reset** clears the planner-wide look back to the cover's own theme.
- Individual pages keep their own styling row, so you can still make one page different; a hand-styled page is remembered as such so the "only untouched pages" option can skip it.

## 2. Side menu no longer covers the page

The right-edge section rail becomes collapsed by default: a small vertical tab on the right edge (with a chevron) that slides the list open when tapped and closes with the same tab, Escape, or after you pick a section. Open width is trimmed (smaller icons and text) so it overlaps less, and the closed state leaves the page fully visible. Its open/closed state is remembered. On phones the bottom strip stays as it is.

## Technical notes

- Extend `UserSettings` (`src/lib/settings.ts`) with `pageStyle?: EntryMeta` (typography, background, sectionTint, accentWidth, density — no stickers) plus a `pageStyleAppliedAt` stamp; saved through the existing IndexedDB `meta` store and pushed by `pushSettings`.
- Add `resolveEntryStyle(globalStyle, entryMeta)` in `src/lib/entryMeta.ts`: per-entry values win, global fills the rest. `Entry.tsx` uses the resolved style for rendering (`getTypo`, background, tint, accent, density) instead of raw `getMeta`.
- Mark per-entry customisation with a `styled: true` flag written whenever `EntryPersonalization` changes a style field on a page; used by the "only untouched pages" branch.
- Apply writes settings, then iterates entries via `listEntries`/`updateEntry` (existing db helpers) in a batch — "All pages" strips per-entry style keys, "Untouched only" skips entries with `styled`. Toast confirms the count.
- New components: `src/components/entry/PlannerStyleCard.tsx` (reuses `EntryPersonalization` in a controlled draft mode with an Apply/Reset footer and confirm dialog) and `src/components/entry/StylePreview.tsx` (static mini page driven by the draft meta). `EntryPersonalization` gains an optional `hideStickers` prop for this context.
- `SideTabs.tsx`: desktop rail wrapped in a collapsible container (`useState` + `localStorage` key `planner.sideTabs.open`), collapsed handle button, `w-*` and icon sizes reduced, `aria-expanded` on the handle.
- Verify with typecheck, vitest, and a Playwright pass on `/app` and one entry page.
