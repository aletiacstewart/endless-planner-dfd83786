# Homepage: New Pricing & How-It-Works Update

## Goal
Make the landing page (the homepage, `/`) clearly present the new membership model — $21.97/month all-in (planner + 1 cover + cloud backup + device sync + two-way calendar sync) with extra covers at $5 each (10% off 2–5, 20% off 6 or more) — and a refreshed "How it works" section.

## Current state (verified)
`src/pages/Landing.tsx` already mentions $21.97 in three places (membership card, How-it-works step 01, pricing FAQ), but:
- The hero reads like a one-time purchase: pill labeled "Activation" with "$21.97 · Start" and copy that never mentions it's a monthly membership.
- There is no dedicated pricing section — pricing facts are buried in a step description and an FAQ answer.
- "How it works" steps are thin (3 short paragraphs), don't mention keeping data if you cancel, covers staying yours forever, or the 5-device cap context.

## Changes (all in `src/pages/Landing.tsx` only)

1. **Hero**
   - Retitle the pill from "Activation" to "Membership".
   - Button label: "$21.97/mo · Start" (keep dynamic from `flagshipPlanner.priceUSD`).
   - Add one supporting line under the hero paragraph: "One simple membership — $21.97/month includes the full planner, a cover of your choice, cloud backup, sync on every device, and two-way calendar sync."

2. **New "Pricing" section** (inserted between the cover grid and the lifestyle/membership banner)
   - Section heading: "Simple pricing".
   - One featured membership card: **$21.97/month** with an "Everything included" checklist — full planner, 1 cover + 20 matching page icons + 60 themed stickers, cloud backup, sync on every device, two-way Google/Apple calendar sync, works offline. CTA → `/subscribe`.
   - A compact "Extra covers" sub-card: $5 each, yours forever, 10% off 2–5 covers, 20% off 6 or more. CTA → `/packs`.
   - A quiet reassurance line: "Cancel anytime. Your planner locks but your writing is kept safe and comes back when you return — covers you bought stay yours forever."
   - Add a "Pricing" anchor link in the header nav (hidden on small screens, same style as Covers/Already own).

3. **How it works — rewritten as 4 steps**
   - 01 Choose your planner & cover — pick from 90+ covers; the membership includes one, add more for $5.
   - 02 Start your membership — $21.97/month, cancel anytime, everything included (backup, sync, calendar sync).
   - 03 Install by email — we email your private install link; add it to your phone, tablet, or desktop as an app.
   - 04 Sync everywhere — your writing backs up to the cloud and follows you across devices; works offline too.
   - Grid becomes 2×2 on desktop (`md:grid-cols-2`), stacks on mobile.

4. **Membership banner (lifestyle break)**
   - Headline tweaked from "Elegance in every pixel." to something pricing-aware, e.g. "One membership. Everything included." — keeping the card copy as-is.

5. **FAQ "How does pricing work?"**
   - Keep, but align wording exactly with the new section (mention data kept safe on cancel, covers kept forever).

## Out of scope
- No changes to Subscribe, Packs, Settings, checkout, or backend — those were already updated in the pricing rollout.
- No new components or dependencies; section reuses existing styling patterns (design tokens, font-storefront, chips).

## Verification
- Typecheck (`npx tsgo --noEmit`) and Vitest (`bunx vitest run`).
- Headless-browser check of `/` at desktop (1280px) and mobile (393px) widths: pricing section renders, no layout overflow, anchors (#pricing, #covers, #own) work.
