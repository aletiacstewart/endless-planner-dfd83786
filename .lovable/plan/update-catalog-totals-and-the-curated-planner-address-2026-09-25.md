# Update catalog totals and the Curated Planner address

## Page content
- Replace the outdated “20 matching page icons” and “60-piece themed sticker set” wording on the home and planner-selection pages.
- Show the current library totals clearly: **42 matching page icons per cover**, **180 illustrated stickers**, and **60 emojis** — **240 library pieces total**.
- Update the membership details and pricing FAQ so the included cover, icons, and shared sticker library use the same totals everywhere.
- Keep the existing $21.97 monthly membership and extra-cover pricing unchanged.

## Planner page address
- Make **`/planner/curated-planner`** the public address used by every home-page, cover, sign-in-return, and membership link.
- Keep the internal planner ID `wellness-journey` unchanged for existing purchases, access records, and payment processing.
- Redirect the old `/planner/wellness-journey` address to `/planner/curated-planner`, preserving cover and checkout details in the address so saved links continue to work.

## Technical details
- Add a separate public address name to the planner definition and allow planner lookup by either the public address or internal ID.
- Continue sending the internal ID to checkout and entitlement logic; only customer-facing navigation uses the new address.

## Verification
- Confirm the home page and Curated Planner page display the same updated totals.
- Open `/planner/curated-planner` and confirm the page loads normally.
- Open the old address and confirm it redirects without losing its query parameters.
- Check the purchase and sign-in-return links use the new public address, then confirm the preview builds cleanly.
