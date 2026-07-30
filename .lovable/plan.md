## Status of Claude's list

Priorities 0–4 were implemented and browser-verified in the previous pass:

- **P0 Security** — entitlements are server-verified (`src/lib/entitlements.ts` + `redeem-code` edge function, device cap 5), RLS blocks client writes to `user_packs` / `user_planner_unlocks` (confirmed 403 in a live test), the hardcoded admin key is gone and replaced with a `user_roles` RBAC check. **Answer to the plain-language question: No** — editing localStorage or calling client functions no longer grants access; localStorage is only a signed cache with a 7-day offline grace period.
- **P1** — `SideTabs.tsx` renders themed per-cover icons with Lucide fallback.
- **P2** — sticker snap guides, layering, recents tray, floating toolbar.
- **P3** — custom HSL picker + saved personal palette.
- **P4** — thumbnail rail + undo/redo (Cmd/Ctrl+Z).

So this plan covers **Priority 5 only**.

## What gets built

Seven new page types added to `src/lib/pageTypes.ts` (32 → 39), each following the existing `PageTypeDef` shape with a `summary()` and a short nav name. The Password & Login Tracker is **skipped** per your choice — no credential storage.

### Batch A — wellness
| Page | id | Icon | Structure |
|---|---|---|---|
| Sleep Tracker | `sleep-tracker` | Moon | `measurement-grid` — Bedtime, Wake time, Hours, Quality (1-5), Notes |
| Water Intake | `water-tracker` | Droplet | `habit-grid` with 8 cup items across the month |
| Gratitude Log | `gratitude-log` | Heart | `gratitude-list` (3 rows) + `mood-rating` + short reflection |
| Emergency / ICE | `emergency-contacts` | Phone | Reference page: `doctor-picker`, `med-list` rows for contacts (name / relationship / phone), allergies, blood type |

### Batch B — staples
| Page | id | Icon | Structure |
|---|---|---|---|
| Contacts | `contacts` | Users | Non-recurring reference page, `med-list` rows: Name, Phone, Email, Address, Notes |
| Important Dates | `important-dates` | Cake | `month-tracker`-style grid, 12 months × people |
| Gift Tracker | `gift-tracker` | Gift | `med-list` rows: Person, Occasion, Gift idea, Budget, Purchased ✓, Wrapped ✓ |

### Wiring
- All 7 ids appended to the Wellness Journey planner in `src/data/planners.ts` (it maps over `PAGE_TYPES`, so this is automatic).
- Verify each new field-type/column combo renders correctly in `FieldRenderer.tsx`; add narrow support only where a needed variant is missing (e.g. checkbox columns inside `med-list`).
- Browser-check each new page renders and saves.

## Known follow-up

Each new page needs a themed icon per cover in `src/lib/coverIcons.ts`. Until those exist, the 7 new tabs fall back to generic Lucide icons in the nav — the exact issue Priority 1 fixed. Generating ~78 covers × 7 icons is a large separate image pass; I'll flag it for a follow-up rather than bundle it here.

Also still open from Claude's note: Vision Board, Bill Pay Calendar, Travel/Packing, Wish List, Reading List — deferred until you see these live.
