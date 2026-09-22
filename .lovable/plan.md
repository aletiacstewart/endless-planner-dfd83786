# Larger Page Graphics and Reusable Icon Art

## Goal
Make the active cover’s matching graphic clearly visible inside every individual journal page, and let users reuse that same active-cover artwork from both the Sticker tray and the Library.

## Changes
1. **Add a larger graphic inside each page**
   - Show the current page’s matching cover graphic near the top of the open page content.
   - Use a noticeably larger, responsive size that remains balanced on phone, tablet, and desktop.
   - Fall back gracefully when a cover does not include artwork for that page.

2. **Add active-cover graphics to Stickers**
   - Add a “Page Icons” group to the existing Sticker tray.
   - Populate it from the icon set belonging to the cover currently applied to the journal.
   - Keep the existing click-to-place, in-field insertion, drag, resize, remove, and recent-item behavior.

3. **Add active-cover graphics to the Library**
   - Add a dedicated “Page Icons” category to the Library.
   - Show friendly page names and lazy-load the artwork.
   - Keep the library open for placing several graphics, consistent with current behavior.

4. **Respect access and cover changes**
   - Only expose artwork from the active cover, as selected.
   - Preserve existing paid-pack access rules while allowing admin and tester accounts their full-access entitlement.
   - Refresh both pickers immediately when a different cover is applied.

## Technical details
- Reuse the existing page-icon manifest and URL resolver rather than copying thousands of image files.
- Adapt active-cover page icons to the existing sticker asset shape, so the current placement and resize system remains unchanged.
- Keep page-icon artwork in its original colors by default; existing theme tinting remains available where appropriate.
- Use the project’s page names for accessible labels and tooltips.

## Validation
- Check representative pages on phone, tablet, and desktop for sizing, overlap, and missing-art fallbacks.
- Verify the active cover’s graphics appear in both Sticker and Library controls.
- Place graphics freely and inside text fields; verify move, resize, remove, and recent-item reuse.
- Switch covers and confirm both pickers refresh to the newly active set.
- Verify regular purchased access plus admin/tester full access.
- Run the focused tests and type checks.
