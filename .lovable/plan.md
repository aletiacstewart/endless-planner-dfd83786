## Goal
Make every cover render consistently in a **square (1:1) frame** across the app, with each piece of art shown as fully as possible, and shrink the bundle by re-encoding oversized PNGs.

## Image normalization (script over `src/assets/covers/`)

A one-time Python script will process all 63 covers:

1. **Smart crop to 1:1**
   - Square covers (24 files) → already 1:1, just re-encode.
   - Landscape covers (~26 files at ratio 1.4) → center-crop horizontally to a square, preserving full height. Focal subjects in this library are vertically centered, so center-crop keeps the art intact.
   - Portrait covers (12 files at ratio 0.75 — botanical-spirit, chronicles, faith) → center-crop vertically to a square. These have the figure centered, so trimming top/bottom equally keeps the subject.
2. **Resize** every output to 1200×1200.
3. **Re-encode as optimized JPG** (quality 85, progressive). PNG sources become JPG; existing JPGs get re-saved at the smaller size. Expect ~70–80% bundle size reduction.
4. **Filename handling**: keep the same base name, switch extension to `.jpg` for ones that were `.png`. Update `src/data/covers.ts` imports for any that change extension.

## Frame updates (3 files)

Switch every cover frame from `aspect-[3/4]` / `aspect-[4/5]` to `aspect-square`:

- **`src/components/cover/CoverPicker.tsx`** (line 100) — picker grid tiles → `aspect-square`.
- **`src/components/SplashScreen.tsx`** (line 36) — splash hero → `aspect-square`, keep `max-w-md sm:max-w-lg`.
- **`src/pages/Home.tsx`** (line 72) — Home hero → `aspect-square` capped at `max-w-md` so it doesn't dominate desktop. Keep `object-cover` and the bottom gradient overlay.
- **`src/components/onboarding/OnboardingFlow.tsx`** (line 38) — onboarding preview → `aspect-square` for consistency.

## Verification

- Run `tsc --noEmit` to confirm no broken imports.
- Spot-check a representative sample of cropped images (one landscape, one portrait, one square) by opening them after the script runs.
- Report final bundle-size delta for `src/assets/covers/`.

## Out of scope

- Distribution/payments work (PWA paywall, Capacitor, Electron) — deferred per your earlier choice.
- Adding new covers.
- Color-palette changes.

## Summary of changes
- 63 image files re-cropped, resized, and re-encoded
- `src/data/covers.ts` — extension fixes for any PNG→JPG renames
- 4 component files — frame ratio switched to `aspect-square`
