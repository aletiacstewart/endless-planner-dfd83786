# Fix page icons + the Cover & Icon Packs page

## 1. Packs page shows nothing (confirmed cause)

The packs grid renders with `hideOwned`, and the ownership check treats an admin account as owning every pack. Your account is admin, so every cover is filtered out and the grid is empty — the collection chips still render because they come from the cover list itself.

Fix: `hideOwned` will only hide packs actually purchased by the account, not packs granted by the admin override. Admin accounts will see the full catalog (marked "Owned" where relevant) instead of an empty page.

## 2. Pricing on the packs page

Confirmed inconsistency: the page header reads "First pack $4.99 · each additional $2.99" while the price math charges $5 per pack with a 10% discount at 5+.

Per your answer, pricing becomes **$5 per pack, flat, no discount**:
- Header copy updated to "$5 per pack".
- The discount branch and discount label are removed, so the cart total is simply count x $5.
- Cart/summary lines and the preview dialog all read from the same single price so they can't drift again.

## 3. Page icons not showing

Verified on disk: all 98 cover folders exist under `public/page-icons/`, files serve correctly, and icons are only wired into three places — the Home page cards, the section header, and the entry thumbnail rail. Two real gaps found:

- **45 cover folders are missing 7 of the current 39 page ids** (the newer pages added after those folders were generated). Any cover in that group shows blank icons on those pages.
- The manifest generator's cover-id scan only matches multi-line cover entries, so the ~20 single-line covers (dragons, gothic sirens) are skipped in the cover→folder map.

Work:
1. Verify in the signed-in app which of the three surfaces is actually blank for your current cover (this decides whether it is only the missing-page gap or also a lookup gap).
2. Fix the manifest generator to catch single-line cover entries, then regenerate and validate the manifest.
3. Generate the 7 missing page icons for each of the 45 incomplete folders, in themed batches, and re-run the validator until every cover has all 39.

Icons stay on the current surfaces only (Home cards, section headers, thumbnail rail) — no new icon placements.

## Technical notes

- `src/lib/entitlements.ts` / `src/lib/unlock.ts`: add a purchased-only check (e.g. `hasPurchasedPack`) that ignores the admin override; `CoverPackPicker` uses it for `hideOwned` filtering while keeping the admin override for actual access.
- `src/data/coverPacks.ts`: `calcPackTotalUSD` = `n * 5`; `getDiscountLabel` returns null; `src/pages/Packs.tsx` header copy updated; `CoverPackPicker` footer copy updated.
- `scripts/icons/write_manifest.py`: broaden the cover-id regex to match `{ id: "x", ... }` single-line entries; re-run `write_manifest.py` + `validate_manifest.py`.
- Missing icons generated with the existing `scripts/icons` batch tooling into the same `public/page-icons/<cover-id>/<page-id>.jpg` layout (static URLs, no bundle impact).
