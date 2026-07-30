Plan to fix the icon mixing without regenerating thousands of images:

1. **Make icon lookup strict by cover**
   - Change the icon resolver so a cover only uses files from its own exact folder: `public/page-icons/<cover-id>/`.
   - Remove cross-cover alias behavior like `teal-moth-bloom -> moth-bloom`, `ladybug-forget-me-nots -> ladybug-meadow`, etc.
   - Remove per-page fallback filling, because that is what allows one cover’s icons to appear under another cover.

2. **Stop default icon leakage**
   - Update planner page image lookup so missing cover-specific icons do not silently fall back to `patriotic-roses`.
   - If a cover does not have its own icon for a page, the app should show no themed icon or a neutral built-in page symbol instead of another cover’s artwork.

3. **Handle the 13 covers that currently do not have their own icon folders**
   - I confirmed there are 78 covers total, 65 with their own icon folders, and 13 currently mapped to another folder.
   - For those 13, the cart/preview should clearly avoid showing borrowed icons. They can still show the cover image, but not another cover’s page icon set.

4. **Update the cart and preview UI**
   - Cart summary and icon preview will only display icons that belong to the selected cover’s exact pack.
   - Fix wording like “20 page icons” so it matches the actual pack count or says “matching page icons” without a wrong number.
   - Extra covers in the cart will be listed cleanly without implying they include borrowed icon art.

5. **Lock this down with an audit**
   - Add/update a validation script that fails if any cover maps to a different cover’s icon folder.
   - Update the manifest generator so it only writes self-mappings and cannot reintroduce shared/cross-cover icon aliases later.

6. **Verify**
   - Check the cart summary and icon preview for several affected covers.
   - Confirm no selected cover can display another cover’s page icons anymore.

Technical note: this fixes the wiring issue first. It does not spend credits or regenerate images. The 13 covers without their own finished icon folders will simply stop borrowing from other covers until we intentionally create their own sets.