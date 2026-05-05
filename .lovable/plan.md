
## Goal

Two things:

1. On the **Cover & Icon Packs** picker, let users see the matching page icons for each cover before they buy — by clicking a small "view icons" affordance on the cover tile, which opens a popup grid of that cover's icon set.
2. Establish a clear, repeatable folder/file convention for adding new cover + icon packs so future additions don't need step-by-step instructions.

---

## Part 1 — Icon-set preview popup

### Where it appears

Inside `src/components/cover/CoverPackPicker.tsx`, on every cover tile (both on the planner detail page and on `/packs`).

### UX

- Each cover tile gets a small **"View icons" button** (eye icon) in the top-right corner. It does NOT toggle selection — it stops propagation and opens a Dialog.
- Clicking the rest of the tile still selects/deselects the pack (current behavior).
- Dialog content:
  - Cover image + name + collection at top.
  - Grid of all page icons that this cover defines in `COVER_ICONS[coverId]` (4 columns on desktop, 2-3 on mobile), each tile shows the icon image + the page label.
  - If the cover has no custom icon set yet, show "Uses the default icon set" + a preview of `PAGE_IMAGES` defaults.
  - Footer button: "Add to cart · $X.XX" (or "Remove" if already selected, "Owned" if unlocked, "Included" if free) — same logic as the tile.

### Files to change/add

- **edit** `src/components/cover/CoverPackPicker.tsx` — add the eye-icon button on each tile + render `<CoverIconPreviewDialog />`.
- **new** `src/components/cover/CoverIconPreviewDialog.tsx` — controlled Dialog (uses existing `@/components/ui/dialog`) that takes a `coverId` and renders the icon grid by reading `COVER_ICONS[coverId]` from `src/lib/coverIcons.ts` and joining against page labels from `src/lib/pageTypes.ts` (or a small label map already used by `PageRenderer`).
- Bonus: also fixes the current `Function components cannot be given refs` console warnings by wrapping `CoverImage`, `CoverPackPicker`, and `CoverPackSummary` with `React.forwardRef` so they can sit inside Radix `DialogTrigger`/`Tooltip` slots without the warning.

---

## Part 2 — Repeatable "add a new pack" convention

So you can just say *"add a new pack"* and drop assets into the right folders. The system already has most of this — we just need to formalize and document it, plus add one missing helper so adding a pack is purely additive.

### The convention (one pack = one cover + one icon set)

For a new pack with id `my-new-pack`:

```text
src/assets/covers/my-new-pack.jpg               ← cover art (required)
src/assets/cover-icons/my-new-pack/             ← icon folder (required if paid)
   measurement-tracker.png
   weight-tracker.png
   ...one PNG per page id you want themed...
```

Then **one** edit in each of these three files:

1. `src/data/covers.ts` — add an `import` for the cover art and a `Cover` entry to the `COVERS` array (id, name, collection, image, palette). Reuse an existing palette preset or add a new one.
2. `src/lib/coverIcons.ts` — add an `import` for each icon PNG and a `"my-new-pack": { ... }` block to `COVER_ICONS`.
3. (Optional) `src/data/coverPacks.ts` — only if you want it free/included; otherwise it's automatically a paid pack at $4.99/$2.99.

That's it. No edits to checkout, Stripe, or the picker — the pack auto-appears in `/packs`, `CoverPicker`, and `CoverPackPicker` because they all read from `COVERS`. Pricing is handled dynamically by `getPackPriceUSD` based on cart position.

### What we'll add to make this drop-in

- **new** `src/lib/coverIcons.helpers.ts` (or extend `coverIcons.ts`): a tiny `definePack(coverId, iconsRecord)` helper so each pack block is one line and self-documenting.
- **new** `docs/ADDING_A_PACK.md` — short README at repo root with the exact 3-step recipe above + the list of valid `pageId`s pulled from `PAGE_IMAGES`. This is the file I (and you) will reference whenever you say "add a pack."
- **new** `src/data/__pack_template/` placeholder folder with a copy-paste skeleton (`cover.ts.snippet`, `icons.ts.snippet`).

### How you'll request new packs going forward

After this lands, you can just say:

> "Add a new pack called 'Sunflower Meadow' in the Garden collection. Cover image is attached. Icons attached as a zip / individual files."

And I will:
1. Save the cover art under `src/assets/covers/sunflower-meadow.jpg`.
2. Save each icon under `src/assets/cover-icons/sunflower-meadow/<page-id>.png`.
3. Add the 3 entries (cover, palette pick, icon map) per the convention above.
4. No checkout / Stripe / picker changes needed.

If you only have a cover (no custom icons yet), I'll add the cover entry and skip the icon block — defaults from `PAGE_IMAGES` will be used until icons arrive.

---

## Out of scope

- No Stripe, webhook, or DB changes.
- No change to the included free pack (`forget-me-nots-ladybugs`).
- No pricing changes.
