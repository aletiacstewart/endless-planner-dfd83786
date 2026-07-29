## What I verified

- The dev server is healthy (`/` returns 200, Vite ready in ~0.5s) and the preview iframe **does** boot — the console shows `src/pages/Landing.tsx` rendering from the preview origin. So this isn't a build or crash problem.
- The published site is fine, only the Lovable preview is stale — that points at a client-side cache on the preview origin, not at the code.
- `index.html` still says `<!-- PWA manifest is injected by vite-plugin-pwa -->` and `package.json` still references pwa, but `vite.config.ts` has no PWA plugin. So a service worker was shipped to this origin at some point and is very likely still registered, serving an old cached `index.html`.
- Requests to `/sw.js` and `/service-worker.js` currently return 200 — but that's Vite's SPA fallback returning HTML, not a real worker. An old registration at those paths therefore never gets replaced.
- `src/main.tsx` already has an unregister kill-switch, but it only runs *after* the new bundle executes — if the stale worker serves old HTML, the new bundle never loads, so it can't fix itself.

## Plan

1. **Add real kill-switch service workers** at `public/sw.js` and `public/service-worker.js` (both former paths). Each one: `skipWaiting` on install, then on activate delete only its own Workbox-style caches (scope-matched, so any unrelated messaging worker caches are untouched), `clients.claim()`, force-navigate open clients, and `unregister()` in a `finally` block so the registration is always torn down.
2. **Keep and strengthen the `main.tsx` cleanup** so it also clears Cache Storage entries for this origin on load, giving a second path out of the stale state.
3. **Clean up the dead PWA references** — fix the misleading comment in `index.html` and point it at the real `public/manifest.json` link tag, since the manifest is no longer injected by any plugin.
4. **Verify** in a headless browser: load the preview origin, confirm `navigator.serviceWorker.getRegistrations()` comes back empty, confirm Cache Storage is empty, and confirm the freshly served HTML/bundle matches the current source.

## If it's still stale after that

Because the fix has to be *served* before a stale worker can be evicted, one hard refresh may be needed on your end (Cmd/Ctrl+Shift+R in the preview, or open the preview URL in a new tab with `?sw=off`). I'll tell you exactly which after verifying.

## Technical notes

- Cache Storage is origin-scoped, so the workers delete only caches matching their own registration scope rather than blanket-clearing.
- No changes to app logic, routes, data, or styling — this is purely cache/service-worker hygiene.
- The React `forwardRef` warnings and React Router v7 future-flag warnings in the console are unrelated noise and are not part of this fix.
