Goal: empty the cover catalog so no original covers show in the picker. Rebuild from your new uploads going forward.

What I'll change

1. `src/data/covers.ts`
   - Remove all 63 image imports from `@/assets/covers/*.jpg`.
   - Replace `COVERS: Cover[] = [ ... 63 entries ... ]` with `COVERS: Cover[] = []`.
   - Keep all `CoverPalette` types, palette presets, and `CoverCollection` definitions intact so the system is ready to receive new covers.
   - Update `getCover()` so it gracefully returns a placeholder cover when the catalog is empty (instead of crashing on `COVERS.find(...)!`). It will return a built-in inline placeholder cover with a neutral palette and a transparent/blank image string.
   - Replace `DEFAULT_COVER_ID` value with the placeholder id so onboarding and settings stay valid until new covers exist.

2. `src/assets/covers/`
   - Delete all 63 `.jpg` files in this folder so no orphaned originals remain on disk.

3. Onboarding & Settings safety
   - `OnboardingFlow.tsx`, `Settings.tsx`, `Home.tsx`, `useCoverTheme.ts`, and `lib/settings.ts` all call `getCover()` — the new fallback ensures they still render with a neutral theme and an empty cover image until covers are added.
   - `CoverPicker` will simply show an empty grid (it already filters by `COVERS`), which is correct: nothing to pick yet.

4. Rebuild workflow going forward
   - For each new batch you upload, I'll: save the image into `src/assets/covers/<slug>.jpg`, add an `import` and a new entry to `COVERS` with an appropriate palette, and (once at least one exists) set `DEFAULT_COVER_ID` to a real cover so onboarding shows artwork again.

Result

- The picker will be empty, no duplicate originals visible.
- App still builds and runs with a neutral placeholder theme.
- We add covers cleanly one batch at a time, no duplicates.