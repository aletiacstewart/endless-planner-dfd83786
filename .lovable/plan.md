## Why your credits went up

It wasn't a pricing change. This billing period (Jul 25 – Aug 25) the workspace used 724.7 credits:

- **532.8 — AI image generation** (page-icon runs)
- 175.4 — build-mode messages
- 12.0 — plan-mode messages
- ~0.8 — cloud/database

So ~74% of the spend is generated artwork, not my prompts. Lovable's rates are unchanged: plan mode is 1 credit per message, build mode is usage-based. The cost driver was regenerating thousands of icons repeatedly because covers were sharing/aliasing packs. That root cause is now fixed — icon lookup is strict per cover, so no future run can "un-fix" itself and force another mass regeneration.

**Balance: 400 credits remaining.**

## Scope of remaining work

Only **13 covers** still lack their own pack. Everything else is done and correct.

13 covers x 32 pages = **416 images**.

## Cost control measures

1. **Switch the generator model** from `google/gemini-3.1-flash-image` to `google/gemini-3.1-flash-lite-image` (Nano Banana 2 Lite) — same cover-art-as-style-reference workflow, materially cheaper per image. I'll generate one test icon first and visually compare it against a finished pack before committing to the full run. If quality drops, I fall back to the current model and reduce scope instead of overspending.
2. **Hard spend guard**: the run stops automatically at 400 images or when the gateway returns a credit error, whichever comes first. No open-ended loops.
3. **One unattended run, minimal messages**: I launch it in the background, check in **twice** (mid-run and at completion) instead of a status message per batch. Message overhead stays ~5–8 credits rather than the 175 spent previously.
4. **No regeneration of the 65 finished packs.** Untouched.

**Projected total: 60–75 credits for images + ~8 for messages = under the 100 cap.** If the lite model proves cheaper than the estimate, it lands nearer 40.

## Steps

1. Point `scripts/icons/regen_all.py` at the lite image model and adapt the request body to the Vertex `generateContent` shape that model requires (it does not accept the current chat-style body).
2. Generate 1 test icon for one of the 13 covers; compare to an approved pack. Abort and reassess if it doesn't match.
3. Queue only the 13 covers missing packs, run with the 400-image ceiling and checkpointing so nothing is ever regenerated twice.
4. Run `scripts/icons/write_manifest.py`, then `scripts/icons/validate_manifest.py` to confirm all 78 covers map strictly to their own folder and 0 aliases exist.
5. Report final credit spend so you can see the actual number against the estimate.

## Technical notes

- Icons are resized to 512px and written to `public/page-icons/<cover-id>/` — static URLs, no bundler imports, so the preview stays fast.
- The checkpoint file means a killed or credit-blocked run resumes exactly where it stopped; no image is ever paid for twice.
- Covers without a finished pack keep rendering a neutral built-in symbol, never another cover's art — so the store stays sellable even if the run is interrupted.
