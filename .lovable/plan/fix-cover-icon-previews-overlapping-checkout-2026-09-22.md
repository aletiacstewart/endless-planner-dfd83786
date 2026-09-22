# Fix cover icon previews overlapping checkout

## Goal
Keep every eye-shaped “view cover icons” control inside its cover card and ensure the checkout panel cleanly covers the catalog behind it.

## Changes
- Give the sticky checkout panel an explicit foreground stacking level so catalog controls cannot render over the email field or checkout button.
- Replace the current button-inside-button cover card structure with valid separate controls: the card selects the pack, while the eye control only opens its icon preview.
- Preserve the existing pack selection, preview dialog, and $5 pricing behavior.
- Use the existing themed button and color styles so the correction works in every cover theme.

## Verification
- Select one and several packs, scroll through the catalog, and confirm no eye controls appear over the checkout panel.
- Open an icon preview without selecting or removing the pack accidentally.
- Check desktop and narrow/mobile layouts, then run the existing type check and tests.
