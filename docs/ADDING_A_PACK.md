# Adding a New Cover & Icon Pack

A "pack" = **one cover** + **one matching set of page icons**, sold as a paid add-on
($4.99 first pack, $2.99 each additional).

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
src/assets/covers/<pack-id>.jpg                    ← cover art (required)
src/assets/cover-icons/<pack-id>/                  ← icon folder (one PNG per page id)
    measurement-tracker.png
    weight-tracker.png
    habit-tracker.png
    ...
```

Cover art: ~1024x1024 JPG works well.
Icons: PNG with transparent background, ~512x512.

You only need to provide icons for pages you want themed — any missing icon
falls back to the default in `src/lib/pageImages.ts`.

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

Edit `src/lib/coverIcons.ts`:

1. Import each icon (one line per page):
   ```ts
   import smMeasurement from "@/assets/cover-icons/sunflower-meadow/measurement-tracker.png";
   import smWeight      from "@/assets/cover-icons/sunflower-meadow/weight-tracker.png";
   // ...
   ```
2. Add a block to `COVER_ICONS`:
   ```ts
   "sunflower-meadow": {
     "measurement-tracker": smMeasurement,
     "weight-tracker": smWeight,
     // ...
   },
   ```

If you skip this file entirely, the pack will still work — it'll just use the
default icon set until icons are added.

---

## That's it

- The pack is automatically a **paid add-on** at $4.99 / $2.99.
- To make a pack **free / included with planner purchase**, add its id to
  `INCLUDED_PACK_IDS` in `src/data/coverPacks.ts`.

## Requesting a new pack from Lovable

Just say:

> "Add a new pack called `<name>` in the `<collection>` collection. Cover image
> attached. Icons attached."

I'll save the assets, add the three entries above, and you're done.
