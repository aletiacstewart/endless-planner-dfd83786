# Digital Planner Redesign

Reshape the interior of the app so opening an entry feels like opening a Bloom digital dot journal — a two-page spread on dotted paper, colored side tabs to jump between sections, elegant serif/hand-lettered headers, and smooth page-flip transitions. Inspired by Bloom, but keeps our emerald + cream identity and our topic set.

## Rollout order

1. **Daily Tracker** first as the reference implementation.
2. Then all other interior entry pages.
3. Then section list pages (turn into a tabbed spread of entries).
4. Then Home (planner cover + spine open animation into the spread).

## Visual system

- **Paper**: cream `--paper` base, subtle dot grid (radial-gradient dots, 20px pitch, low-opacity emerald). Optional light emerald spine shadow down the middle on wide screens.
- **Typography**: keep Cormorant Garamond for section titles, add Caveat as script accent for date/day labels, Inter for body. Tighter tracking, larger display sizes.
- **Color-blocked headers**: each page gets a soft emerald or accent band with the page title in serif + a script sub-label ("today", "this week").
- **Side tabs**: vertical stack of colored tabs on the right edge, each tab = a page type (Daily, Goals, Gratitude, Reflection, …). Active tab lifts out; inactive tabs peek. Tabs work as nav and always visible on desktop; collapse to a bottom sheet on mobile.
- **Dot grid** shows through inside every card; cards become nearly borderless (just a soft shadow) so it reads as one continuous page.

## Layout — spread

On desktop (≥ lg):

```text
┌────────────────────────────┬────────────────────────────┬──┐
│  LEFT PAGE                 │  RIGHT PAGE                │T │
│  header band               │  header band (continued)   │A │
│  primary section(s)        │  secondary section(s)      │B │
│  dot grid                  │  dot grid                  │S │
└────────────────────────────┴────────────────────────────┴──┘
```

- Spread = two equal columns with a faint center spine gradient.
- `PageRenderer` splits `pageType.sections` across left/right using a new `side?: "left" | "right"` hint on each section (default: alternate, or auto-split by index).
- On tablet/mobile: single column, spine hidden, side tabs collapse into a floating tab strip.

## Interactions

- **Page flip**: navigating between entries (or between page types via tabs) animates a horizontal page-turn (Framer Motion / `motion`, ~350ms, ease-out, subtle shadow sweep). Swipe left/right on touch = prev/next entry.
- **Tab jump**: clicking a side tab animates to that page type's most recent entry (or a new blank one) with the same flip transition.
- **Sticker/pen affordances** stay from current personalization system, but move into a floating toolbar on the spine so it feels like tools sitting on the planner.
- Keyboard: ← / → flip pages.

## Daily Tracker mapping (reference)

Left page: date band + mood/energy checkboxes + wellness checkbox groups.
Right page: today's focus (rich text), gratitude, notes.
Header band uses accent color from the active cover theme (already exposed via `useCoverTheme`).

## Files to add / change (technical)

New:
- `src/components/planner/PlannerSpread.tsx` — two-column spread wrapper, spine, dot-grid background.
- `src/components/planner/SideTabs.tsx` — vertical tabbed nav bound to page types; mobile bottom variant.
- `src/components/planner/PageFlip.tsx` — Framer Motion wrapper for enter/exit page-turn animation, keyed by entryId.
- `src/hooks/useSwipeNav.ts` — touch swipe → prev/next.

Change:
- `src/lib/pageTypes.ts` — add optional `side?: "left" | "right"` to `Section`, and `tabColor?: string` to `PageTypeDef`. Add helpers to get prev/next entry of same type.
- `src/components/PageRenderer.tsx` — render left/right buckets when inside a spread; keep current stacked mode as fallback.
- `src/pages/Entry.tsx` — wrap main in `PlannerSpread` + `PageFlip`; move `EntryPersonalization` into a floating spine toolbar; render `SideTabs`.
- `src/index.css` — add `.paper-dot` (dot-grid bg), `.spread-spine` (center gradient shadow), tune `.planner-card` to be borderless-on-paper inside spreads.
- `src/pages/Section.tsx` (phase 3) — convert entry list to a tabbed spread of "sheets".
- `src/pages/Home.tsx` (phase 4) — planner-cover open animation into last-viewed spread.

Non-goals:
- No changes to data model, sync, Stripe/entitlements, or covers/icons/stickers content.
- No new backend work.

## Acceptance

- Daily Tracker on desktop shows a two-page spread on a dotted cream paper, with side tabs on the right and a floating personalization toolbar on the spine.
- Flipping between daily entries animates a page turn; swipe works on touch.
- Side tabs jump between page types and stay visible when collapsed.
- Mobile shows single-column with a bottom tab strip; still animates on nav.
- Other page types still render (unchanged) until phase 2 migrates them.
