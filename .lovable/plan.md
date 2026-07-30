# Fix: preview shows a stale version

## What I verified this turn
- The dev server was down for a moment while starting, then answered normally (HTTP 200).
- Loading the app in a headless browser against the running server renders the current Landing page — only harmless React Router / ref warnings in the console, no errors, no blank screen.

So the code in the project is fine and serves the current version. That points at cached artifacts in the browser that shows the stale preview, not at the app itself. I have not been able to inspect that browser, so this part of the diagnosis is unconfirmed — step 1 below makes it verifiable rather than guessed.

## Plan

1. **Add a visible build stamp** so "is this the current version?" becomes a one-second check instead of a guess: inject a build timestamp/commit at build time and render it in a tiny footer line (and log it once to the console). If the stamp is old, it is definitively a cache issue; if it is current, the problem is elsewhere and we look at that instead.

2. **Remove the remaining PWA install surface.** `index.html` still links `/manifest.json`, which is what lets browsers keep treating the app as an installable, cache-backed app. Drop the manifest link plus the `apple-mobile-web-app-*` / `mobile-web-app-capable` meta tags, and delete `public/manifest.json`. This stops new stale registrations from ever being created.

3. **Harden the kill-switch path.** Keep `public/sw.js` and `public/service-worker.js` as unregistering workers (they must stay reachable so already-installed workers can be replaced), but make the client-side cleanup in `src/main.tsx` more robust: unregister, delete caches, and only then reload — guarded by a `sessionStorage` flag so it can never loop more than once per session.

4. **Serve the HTML uncached.** Add `Cache-Control: no-store` response headers for HTML/document requests in the Vite dev server config so the preview shell is never reused from disk cache.

5. **Give a manual escape hatch.** Support a `?fresh=1` query param that clears CacheStorage + service workers and reloads once, so a hard reset is possible from the preview without devtools.

## Technical notes
- Files touched: `index.html`, `src/main.tsx`, `vite.config.ts`, a small `src/components/BuildStamp.tsx`, delete `public/manifest.json`.
- No backend, pricing, icon, or cover logic is touched.
- After implementing, I will reload the app in a headless browser and confirm the build stamp matches the new build and that no service worker remains registered.

## What you will need to do once
If a previously-installed worker is still controlling your browser, one hard reload (or opening the preview with `?fresh=1`) is required to hand control over to the new code. After that it stays current on its own.