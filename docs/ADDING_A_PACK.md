# Adding a New Cover & Icon Pack

A "pack" = **one cover** + **one matching set of page icons**, sold as a paid add-on
($5 each; 5+ packs get 10% off).

The whole system is data-driven: drop assets into the right folders, add three
data entries, and the pack appears automatically in:

- `/packs` (the store)
- The `CoverPackPicker` on the planner detail page
- The `CoverPicker` in Settings (with a lock until purchased)
- Themed page icons everywhere once unlocked

No edits to checkout, Stripe, or webhooks are needed.

---

## Step 1 — Drop in the assets

Use a kebab-case `pack-id` (e.g. `sunflower-meadow`).

```text
src/assets/covers/<pack-id>.png(.asset.json)   ← cover art (required)
public/page-icons/<pack-id>/                   ← icon folder, one JPG per page id
    measurement-tracker.jpg
    weight-tracker.jpg
    ...
```

Page icons are plain static files served from `public/` (no bundler imports).
Keep them ≤512 px / ~80 quality — large source renders must be downsized first,
otherwise the dev server and the published bundle get very slow.

After adding a folder, regenerate `src/data/iconPacks.ts` with:

```bash
python3 scripts/icons/write_manifest.py
python3 scripts/icons/validate_manifest.py
```

Each cover must use an exact folder match: `public/page-icons/<cover-id>/`.
Do not point one cover at another cover's icon folder.



Cover art: ~1024x1024 JPG works well.
Icons: PNG with transparent background, ~512x512.

You only need to provide icons for pages you want themed. Missing icons are left
blank/neutral; the app must not borrow another cover's artwork.

### Valid page ids (use these as filenames)

```
measurement-tracker        weight-tracker            cleaning-checklist
complete-tracker           daily-tracker             fun-tracker
goals-reflection           habit-tracker             medical-records
medications                my-goals                  notes
recipe                     self-care-checklist       weekly-calendar
blood-pressure-tracker     blood-sugar-tracker       yearly-calendar
daily-goal-tracker         yearly-habit-tracker      oxygen-tracker
wellness-tracker           workout-tracker           monthly-calendar
yearly-focus
```

---

## Step 2 — Register the cover

Edit `src/data/covers.ts`:

1. Add an import at the top:
   ```ts
   import sunflowerMeadow from "@/assets/covers/sunflower-meadow.jpg";
   ```
2. Add an entry to the `COVERS` array:
   ```ts
   {
     id: "sunflower-meadow",
     name: "Sunflower Meadow",
     collection: "garden",                // pick from COLLECTIONS
     image: sunflowerMeadow,
     palette: paletteGardenWarm,          // reuse a palette, or define a new one
   },
   ```

Reuse an existing `palette*` preset if it fits the cover's mood. Only define a new
palette if no existing one matches.

---

## Step 3 — Register the matching icons

Place JPG files in `public/page-icons/<pack-id>/` using the valid page ids as
filenames, then run the manifest commands from Step 1. No imports are needed.

If a cover has no exact icon folder, it will show no borrowed page icons until
its own folder is added.

---

## That's it

- The pack is automatically a **paid add-on** at $5.
- To make a pack **free / included with planner purchase**, add its id to
  `INCLUDED_PACK_IDS` in `src/data/coverPacks.ts`.

## Requesting a new pack from Lovable

Just say:

> "Add a new pack called `<name>` in the `<collection>` collection. Cover image
> attached. Icons attached."

I'll save the assets, add the three entries above, and you're done.
