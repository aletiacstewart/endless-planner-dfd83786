# Fix the stale build stamp (and clarify credits)

## What's wrong

The build marker in the bottom-right corner is frozen. It is generated in `vite.config.ts` with a single `new Date()` call that runs once, when the dev server process starts. Every later edit is hot-reloaded into the running server, so the stamp never advances — it keeps showing the time the server booted, which makes a current preview look stale.

Two smaller issues make it easy to miss:

- The stamp text is rendered at 10px in `text-muted-foreground/50`, which is nearly invisible against the light Landing page.
- It sits at `bottom-1 right-2`, where the Lovable badge overlaps it in preview.

## The fix

1. Replace the config-time constant with a value that updates on every rebuild:
   - Add a tiny Vite plugin that serves a virtual module returning a fresh timestamp, and invalidate that module whenever a file under `src/` changes, so HMR pushes a new stamp to the browser.
   - Keep `__BUILD_STAMP__` working for production builds (build time is correct there).
2. Make the marker readable: bump contrast and size slightly, move it to `bottom-2 left-2` so it never hides behind the preview badge, and show `HH:MM:SS` so consecutive edits are distinguishable.
3. Keep the `[build] …` console line so the stamp is verifiable even if the pixel is covered.

## Verification

Load the preview, note the stamp, make a trivial edit, and confirm the stamp advances without a server restart — then report both values back to you.

## Credits

Your workspace balance right now (period Jul 25 – Aug 25): **5.00 credits remaining**, all of them today's daily grant. The monthly (800), rollover (100) and top-up (500) grants are fully consumed; 1,125.24 credits used this period. Build-mode cost is usage-based, so a small fix like this is cheap, but with 5 credits left it is worth batching further work.

Lovable's credit balance cannot be displayed inside your planner app — there is no client-facing API for it. The live number lives in Settings → Plans & credits (or by hovering the credit bar next to the project name). I will state the remaining balance in chat whenever you ask.

## Technical notes

- `vite.config.ts`: replace the module-scope `buildStamp` const with a `virtual:build-stamp` plugin (`resolveId`/`load` + `handleHotUpdate` invalidation); leave `define` in place for production.
- `src/components/BuildStamp.tsx`: import from the virtual module in dev, fall back to `__BUILD_STAMP__` in production; adjust position and contrast classes.
- `src/vite-env.d.ts`: add the virtual module declaration.
- No changes to service workers — `public/sw.js` and `public/service-worker.js` are already kill-switch workers and are not the cause here.
