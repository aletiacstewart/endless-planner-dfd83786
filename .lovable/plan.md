# Fix cover cropping + make splash user-dismissed

## What you'll see after

**1. Home hero shows the full cover.** Today the hero is a short letterbox (~h-72) using `object-cover`, so portrait covers like *Ember Hummingbird* get the head, top, and most of the wings cropped away. After the fix the hero matches the cover's natural 3:4 portrait shape on phones, scaling sensibly on larger screens — the whole artwork is visible, with the planner name + Settings cog still floating on top in readable contrast.

**2. Splash stays until you tap it.** Today the splash auto-disappears after 1.2 seconds. After the fix it stays as long as you want, like opening the front cover of a real journal. You dismiss it by either tapping the cover anywhere or pressing a soft "Open planner" pill button at the bottom. A subtle "Tap to open" hint appears after a moment so first-time users know what to do.

---

## Files & changes

### `src/pages/Home.tsx` — uncropped cover hero
- Replace the fixed-height letterbox (`h-56 sm:h-72` + `object-cover`) with a proper portrait container:
  - Mobile: `aspect-[3/4]` so the full portrait artwork fits edge-to-edge with no crop.
  - Tablet/desktop (`sm:` and up): cap at a max height (e.g. `sm:max-h-[60vh]`) and use `object-contain` so wider screens letterbox the artwork against the themed paper background instead of zooming in and slicing it.
- Keep the existing Settings cog (top-right) and the planner-name overlay (bottom). Strengthen the bottom gradient so the title remains legible regardless of cover.
- No change to data flow or theming.

### `src/App.tsx` — splash dismissal
- Remove the `setTimeout(..., 1200)` auto-dismiss.
- `SplashScreen` now receives an `onOpen` callback; `AppShell` passes `() => setSplashed(true)`.
- The splash stays mounted until the user opens it. Re-shows on full reload (existing behavior — splash is one-shot per session).

### `src/components/SplashScreen.tsx` — interactive cover
- Wrap the whole splash in a `<button>` so tapping anywhere dismisses it. Add `aria-label="Open planner"` and proper focus styles.
- Add a centered "Open planner" pill near the bottom that visually says "tap me" — same click handler as the wrapper.
- Add a small "Tap to open" hint that fades in after ~1.5s for discoverability (purely visual, doesn't auto-dismiss).
- Keep the cover artwork centered and uncropped here too: switch the inner `CoverImage` wrapper from filling the viewport to a centered `aspect-[3/4]` block so the full painting shows on tall and wide screens.

### No other files touched
- Section/Entry headers are unaffected — the user's screenshot of "Change of Life Wellness" is the **Home hero**, not a section header. The fix to Home covers that case.
- Cover manifest, theming, onboarding, and routing are unchanged.

## Out of scope
- No new "tap-anywhere" behavior on Section/Entry pages.
- No new cover assets in this change.
- Splash still appears once per session after onboarding; we are not adding a "show splash on every navigation" mode.
