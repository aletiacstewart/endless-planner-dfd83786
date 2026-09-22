# Give administrators full planner asset access

## Goal
An account with the verified admin role can use every planner, cover, matching page-icon set, sticker set, and library asset without purchasing them.

## Current behavior confirmed
- Administrator status is read from the protected account-role table and already bypasses planner and individual pack locks.
- The cover chooser uses that admin-aware pack check, so paid covers become selectable after account access finishes loading.
- Stickers and library art are currently shared and available without a per-pack lock.
- The Packs shop deliberately uses purchase-only status, so administrators can still see and test its catalog; this differs from access inside the planner.

## Changes
- Make the central owned-pack list admin-aware by returning every cover-pack ID for administrators, while retaining purchased-only checks for shop and checkout behavior.
- Audit planner setup, cover switching, themed navigation icons, sticker trays, and library selection to ensure each uses effective access rather than purchase history.
- Prevent a temporary locked state while administrator access is still being verified where it could redirect an admin into checkout.
- Update admin-facing confirmation text to explicitly include all covers, page icons, stickers, and library art.
- Keep role validation server-backed; do not add a browser bypass key or client-editable admin flag.

## Verification
- Test a verified administrator with no pack purchases: choose several paid covers and confirm their page icons appear throughout the planner.
- Confirm all sticker and library choices remain usable for the administrator.
- Confirm a regular account still sees paid covers locked unless purchased.
- Confirm the Packs page remains visible for administrator storefront testing and still shows the correct $5 price.
- Run type checks and automated tests, then verify the administrator flow in the live preview.
