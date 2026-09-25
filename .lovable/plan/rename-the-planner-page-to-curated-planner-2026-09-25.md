# Rename the planner page to "Curated Planner"

## What the user wants
The page currently called "Change of Life — Wellness Journey" should be called **Curated Planner** — no brand prefix anywhere it displays. The user confirmed: "Curated Planner only."

## Where the name shows today (verified)
- `src/data/planners.ts` line 22 — `name: "Change of Life — Wellness Journey"` is the single source the app displays: the storefront page title, "… guided pages in the …" copy, the activation label, and the Subscribe page.
- `index.html` line 6 — browser tab title "Change of Life - Wellness Journey".

## Steps

1. **Rename the display name**
   - In `src/data/planners.ts`, change `name` to `"Curated Planner"`.
   - The internal id `wellness-journey` stays exactly as is — it is used in Stripe checkout metadata, the payments webhook, and unlock grants; renaming it would break purchases and unlocks.

2. **Update the browser tab title**
   - In `index.html`, `<title>` becomes "Curated Planner".

3. **Finish the pending share-preview cleanup (already on the roadmap)**
   - `og:title` / `twitter:title`: drop "Change of Life —" so they read "Curated Planner — Curate Your Digital Ritual".
   - Regenerate the 1200×630 share card image without the "Change of Life / Wellness Journey" text, keeping only the tagline lines ("Curate Your Digital Ritual." / "The lifestyle upgrade" / "Elegance in every pixel."), then point `og:image` / `twitter:image` at the new card.

4. **Leave untouched**
   - The "Change of Life" **cover theme** label in `src/data/covers.ts` — that is a cover pack name, not the page name.
   - Pricing copy, taglines, and the landing page hero (already says "Curate your digital ritual").

## Verify
- Build is clean.
- Storefront planner page, Subscribe copy, and browser tab all read "Curated Planner".
- Share tags contain no "Change of Life" / "Wellness Journey" text and the card image URL resolves.
