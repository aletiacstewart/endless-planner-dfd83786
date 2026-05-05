# Cover Packs as Paid Add-Ons

Make covers + matching page-icon sets sellable. The base planner ships with the **Forget‑Me‑Nots & Ladybugs** pack free. Every other cover pack is a paid add-on: **$4.99 first add-on pack, $2.99 each additional**. Buyers pick which pack(s) they want before paying, packs unlock per-device just like the planner, and Home gently nudges users to try other packs.

## What "a pack" means

A pack = **one cover** + **its matching icon set** (the per-cover icons we already wire through `COVER_ICONS` in `src/lib/coverIcons.ts`). Forget‑Me‑Nots & Ladybugs already has its full icon set; future packs each ship a cover + icon set together.

We will **group covers into pack tiers** so collections like "Sparrow Series" or "Black Moon" can each be sold as a single pack containing several covers + one shared icon set, OR sold per-cover. To keep this launch simple:

- One pack = one cover (1:1). Collections remain a UI grouping for filtering only.
- "Forget‑Me‑Nots & Ladybugs" = the included free pack.
- Every other cover in `src/data/covers.ts` = a paid pack.

(We can bundle later if you want — easy follow-up.)

## Pricing logic (cart-aware)

When a user buys the planner OR adds packs later, the price for **add-on packs in this transaction**:

```
1st add-on pack in cart  → $4.99
each additional add-on   → $2.99
```

Examples:
- Planner only: $19.97
- Planner + 1 pack: $19.97 + $4.99 = $24.96
- Planner + 3 packs: $19.97 + $4.99 + $2.99 + $2.99 = $30.94
- Returning user buys 2 packs alone: $4.99 + $2.99 = $7.98

Stripe one-time line items per pack with `price_data` (dynamic amount) so we can apply first-pack vs additional pricing in one Checkout session.

## User flows

### A. First-time purchase (Planner Detail page)
1. User picks the planner.
2. Below the price, a new **"Choose your covers"** section shows a grid of all covers (reusing `CoverPicker`'s visual style). Forget‑Me‑Nots & Ladybugs is marked **Included**. Other covers each have a **+ Add ($4.99 / $2.99)** toggle. Live cart total updates.
3. Email field, then **Buy & Install — $XX.XX**.
4. Stripe Checkout includes one line for the planner + one line per selected pack.
5. On success, the unlock email lists the planner code AND each pack code (or one combined code — see Tech section).

### B. Returning user adds more packs
1. New page **`/packs`** — "Cover & Icon Packs" gallery. Each cover card shows owned/locked state.
2. Locked covers have **+ Add to cart** button. Sticky cart bar at bottom: "2 packs · $7.98 · Checkout".
3. Checkout flow same as A but planner line is omitted.

### C. Cover switcher (Settings → Change cover)
- Locked covers stay visible in the picker but are dimmed with a small lock badge.
- Tapping a locked cover opens a sheet: "Unlock this cover for $4.99" → links to `/packs` with that pack pre-selected.

### D. "Try a new cover" Home prompt
- Small dismissible chip on Home (top right under header): **"✨ Try a new cover →"**.
- Tapping opens the cover picker. If user only owns the included pack, the picker shows locked covers with the unlock CTA.
- Shows once per session (sessionStorage flag), and never if user has already opened the picker that day.

## Technical Plan

### Data
- New file `src/data/coverPacks.ts`:
  - `INCLUDED_PACK_IDS = ["forget-me-nots-ladybugs"]`
  - `getPackPrice(indexInCart)` → `4.99` if first add-on, `2.99` otherwise
  - `isCoverIncluded(coverId)` / `isCoverPaid(coverId)` helpers
- Reuse `COVERS` from `src/data/covers.ts` as the pack catalog (one pack per cover).

### Unlock storage
- Extend `src/lib/unlock.ts` with **pack unlocks** stored separately from planner unlock:
  - `setPackUnlocked(coverId, code)` → `localStorage["cover-pack-unlock:<coverId>"] = code`
  - `isPackUnlocked(coverId)` → boolean
  - `listOwnedPacks()` → `string[]`
  - Included packs always read as unlocked.

### DB / backend
- New table `pack_purchases` (mirrors `purchases`):
  - columns: `id, email, stripe_session_id, environment, pack_id, unlock_code, created_at`
  - RLS: service role only.
- Extend `device_activations` already supports any code; reuse for pack codes (no schema change needed).
- New edge function `validate-pack-unlock` (or extend `validate-unlock`) to check codes against `pack_purchases`.
- Update `payments-webhook` (Stripe) to:
  - Read `metadata.packIds` (comma-separated cover ids) from the session.
  - Generate one unlock code per pack, insert into `pack_purchases`.
  - Send the planner email + a packs unlock email (or one combined email listing all codes).

### Checkout
- Update `create-checkout` edge function:
  - Accept `packIds: string[]` in request body.
  - Build line items: planner price (lookup_key) + one `price_data` line per pack with computed `unit_amount` (499 for index 0, 299 for the rest).
  - Stamp `metadata.packIds` on the session AND `metadata.includesPlanner` ("true"/"false").
- New product registered in Stripe: `cover_pack` (no fixed price — uses dynamic `price_data`). Use `payments--create_product` with `cover_pack_first` ($4.99) and `cover_pack_additional` ($2.99) prices for catalog hygiene, but actually charge via `price_data` so we can do per-line dynamic amounts in one session.

### Frontend changes
- `src/pages/PlannerDetail.tsx`: add **CoverPackPicker** component below price, reactive cart total, pass `packIds` to `openCheckout`.
- New page `src/pages/Packs.tsx` + route `/packs` for returning users.
- `src/components/cover/CoverPicker.tsx`: render lock overlay on covers not in `listOwnedPacks()`. Tapping locked → call new `onLockedSelect(coverId)` prop (parent navigates to `/packs?focus=<id>`).
- `src/pages/Home.tsx`: add dismissible "Try a new cover" chip (sessionStorage `try-cover-prompt-dismissed`).
- `src/pages/Unlock.tsx`: support pasting pack codes too (route by code prefix or by trying both validators).
- New `src/components/cover/CoverPackCart.tsx`: shared sticky cart UI used by Packs page and PlannerDetail.

### Email
- New template `pack-purchase.tsx` in `supabase/functions/_shared/transactional-email-templates/`. Lists each pack with its unlock code and a "Tap to unlock on this device" deep link `/unlock?code=<code>`.
- For combined planner+packs purchase, send the existing `planner-purchase` email and append a packs section (or send a second email immediately after — simpler, less template churn).

### Stripe products to create
- Reuse existing `wellness_journey_lifetime`.
- Create `cover_pack` product with two reference prices (`cover_pack_first` $4.99, `cover_pack_additional` $2.99) for reporting, but actual charges use `price_data` so quantity logic stays in our checkout function.

## What I will NOT change in this pass
- Forget‑Me‑Nots remains the default cover and stays free.
- Existing planner unlock + 5-device cap stays as-is.
- No bundle pricing (e.g. "buy a whole collection at a discount") — happy to add next round.

## Open question (one)
Right now there are **63+ covers**. Want me to:
- **(a)** Make every existing cover a paid pack immediately (only Forget‑Me‑Nots free), or
- **(b)** Launch with a curated starter set (e.g. 10–15 packs ready to buy) and mark the rest "coming soon"?

I'll proceed with **(a)** unless you say otherwise.
