
# Landing page, multi-planner catalog, and paid PWA download

## Goals
1. Public marketing/landing page that showcases this planner, its full page list, and the entire cover gallery.
2. A planner catalog data layer so new planners can be added later without rewriting the landing page. All planners share the same cover library; pages/content are planner-specific.
3. Flat lifetime price of **$19.97 per planner** ("one-time payment, lifetime access for the life of the platform").
4. The app becomes installable on phone / tablet / desktop (PWA) with local data, plus Backup/Restore JSON so a user can move to a new device.
5. Stripe checkout: after successful payment, the buyer receives an email with their install/download link and a unique unlock code.

---

## 1. Planner catalog (data layer)

Create `src/data/planners.ts`:

```ts
export interface PlannerDef {
  id: string;              // "wellness-journey"
  name: string;            // "Change of Life — Wellness Journey"
  tagline: string;
  description: string;
  heroImage: string;       // imported asset
  priceUSD: number;        // 19.97
  pageTypeIds: string[];   // ids from pageTypes.ts that belong to this planner
  highlights: string[];    // bullet points for landing page
  available: boolean;      // toggle "coming soon"
}
export const PLANNERS: PlannerDef[] = [ /* wellness-journey seeded from current pageTypes */ ];
```

The current planner is registered with all 25 existing page type ids. Future planners just add an entry; covers are shared globally from `src/data/covers.ts` (80 covers).

## 2. Landing page

New route `/` → `src/pages/Landing.tsx` (current `/` becomes `/app` for the authenticated planner experience; splash/onboarding gated behind purchase — see §5).

Sections:
- **Hero**: logo, tagline, "Install on any device", primary CTA "Get the planner — $19.97".
- **Planner showcase** (loops `PLANNERS`): name, hero image, page count, highlights, "Buy & Install" button. Coming-soon planners show a muted card.
- **What's inside** (for the selected planner): grid of all page types using existing `pageImages.ts` thumbnails + page names + short descriptions. Pulled dynamically from `pageTypes.ts` filtered by `planner.pageTypeIds`.
- **Cover gallery**: responsive grid of all 80 covers from `covers.ts` with the message "Every planner unlocks the full cover library."
- **How it works**: 3 steps — Buy → Receive install link by email → Install on phone/tablet/PC and start journaling. Mentions data lives on-device with Backup/Restore.
- **Pricing**: "$19.97 one-time. Lifetime access for as long as the platform is online. Install on unlimited personal devices."
- **FAQ**: data ownership, moving to a new device, refunds, supported devices.
- **Footer**: contact, terms.

Routing changes in `App.tsx`:
- `/` → `Landing`
- `/app` → existing `Index` (splash + sections), gated by `hasUnlock(plannerId)` check in localStorage; if not unlocked, redirect to `/` with a buy modal.
- `/unlock?code=…&planner=…` → validates code via edge function, stores unlock locally, redirects to `/app`.

## 3. PWA install (phone / tablet / desktop)

- Add `vite-plugin-pwa` with `registerType: 'autoUpdate'`, generate `manifest.webmanifest` (icons from existing assets, theme color from cover theme default, display `standalone`).
- Service worker precaches the built app shell so it works offline. User data already lives in IndexedDB (`src/lib/db.ts`) so nothing else changes for offline.
- Landing page "Install" button uses the `beforeinstallprompt` event on Android/desktop; on iOS show a small instruction sheet ("Share → Add to Home Screen").
- **Backup / Restore**: extend Settings page with two buttons — "Export my data" (downloads JSON of all IndexedDB stores + settings) and "Restore from backup" (uploads JSON, replaces stores). This is the "new phone" recovery path.

## 4. Stripe checkout (Lovable built-in payments)

Use Lovable's built-in Stripe payments (no user-managed Stripe account needed). Flow:

1. Run `payments--recommend_payment_provider`, then enable Stripe via `payments--enable_stripe_payments` (Lovable Cloud will be enabled if not already).
2. Create one Stripe product per planner via `batch_create_product` at $19.97 one-time.
3. Edge function `create-checkout` → builds a Checkout Session (mode `payment`), success URL `/thank-you?session_id={CHECKOUT_SESSION_ID}&planner={id}`, cancel URL `/`.
4. Edge function `stripe-webhook` listens for `checkout.session.completed`:
   - Generates a unique `unlock_code` (UUID).
   - Inserts `purchases` row: `{ id, planner_id, email, unlock_code, created_at }` (Lovable Cloud DB, RLS: only service-role writes; public can call validate-unlock RPC).
   - Calls `send-transactional-email` with template `planner-purchase` to the buyer's email containing: install link `https://<app>/unlock?code=…&planner=…`, install instructions for iOS/Android/Desktop, backup/restore note.
5. Edge function `validate-unlock` (called from `/unlock`): looks up code, returns `{ ok, planner_id }`; client stores `unlocked:<planner_id> = true` in localStorage so `/app` lets them in.

## 5. Email infrastructure

- Use Lovable's built-in email system. Run the email domain setup dialog (will surface an `<lov-open-email-setup>` button on first run) so emails come from the user's branded subdomain.
- After domain is configured, scaffold transactional emails and add a `planner-purchase` React Email template:
  - Subject: "Your Endless Planner is ready — install link inside"
  - Body: greeting, install link button, brief install instructions, mention $19.97 lifetime access, "Backup your data anytime from Settings → Export."

## 6. Files added / changed

Added:
- `src/data/planners.ts`
- `src/pages/Landing.tsx`
- `src/pages/Unlock.tsx`
- `src/pages/ThankYou.tsx`
- `src/components/landing/*` (Hero, PlannerCard, PageGrid, CoverGallery, Pricing, FAQ, InstallButton)
- `src/lib/unlock.ts` (localStorage helpers)
- `src/lib/backup.ts` (export/import JSON of IndexedDB)
- `public/manifest.webmanifest` + PWA icons
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/validate-unlock/index.ts`
- `supabase/functions/_shared/transactional-email-templates/planner-purchase.tsx`

Edited:
- `src/App.tsx` — new routes + unlock gate on `/app`
- `src/pages/Settings.tsx` — Backup/Restore buttons
- `vite.config.ts` — register `vite-plugin-pwa`
- `index.html` — manifest + theme-color

DB migration: `purchases` table (id, planner_id, email, unlock_code unique, stripe_session_id, created_at) with RLS service-role write + a SECURITY DEFINER `validate_unlock(code text)` function.

## Out of scope (call out)
- No user accounts / login — unlock code in email is the entitlement. Anyone with the link can unlock the app on a device. We can add accounts later if you want device limits.
- "Lifetime" wording will read: *"One-time payment. Lifetime access for as long as the platform is online."*

## Confirmations needed before building
- OK to enable Lovable Cloud + Stripe built-in payments and Lovable Emails (will prompt you to set up sender domain).
- OK with unlock-code-via-email model (no login).
