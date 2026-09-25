# Update the share preview to the new tagline

## What the user wants
When the site link is shared (text, email, social), the preview card should say:
- "Curate Your Digital Ritual."
- "The lifestyle upgrade"
- "Elegance in every pixel."

Today the preview card shows an older image ("Digital Planner & Journal — Fillable Pages — Saved on Your Phone") and the title "Change of Life - Wellness Journey".

## Steps

1. **Design a new share image (1200×630)**
   - Generate a premium-quality social card in the existing brand look: soft cream/pearl card on a calm gradient background, delicate line motifs (leaves, heart, sparkles), serif brand type.
   - Text on the card: "Change of Life" + "Wellness Journey" small, then the tagline lines "Curate Your Digital Ritual." / "The lifestyle upgrade" / "Elegance in every pixel."
   - Keep it under a few hundred KB so every platform renders it.

2. **Host it at a stable public URL**
   - Register the image through the project's asset pipeline so it gets a permanent CDN URL (needed because share previews require an absolute https address).

3. **Update the share tags in `index.html`**
   - `og:title` / `twitter:title`: "Change of Life — Curate Your Digital Ritual"
   - `og:description` / `twitter:description` / meta description: "The lifestyle upgrade. Elegance in every pixel. Digital planner & journal — fillable pages, saved on your phone."
   - Point `og:image` and `twitter:image` at the new card's CDN URL.
   - Keep the page `<title>` as "Change of Life - Wellness Journey" so the brand name stays in browser tabs and search results — the tagline lives in the description and the card image. (Easy to swap if you'd rather the tab title carry the tagline.)

4. **Verify**
   - Confirm the new tags are the only set in the head (no duplicates) and the image URL resolves.

## Notes
- The live site serves the last published build, so the new preview appears at brandedbydigital.com after the next publish. The editor preview picks it up as soon as the build lands.
- No page layout or planner code changes — this is purely the share preview.
