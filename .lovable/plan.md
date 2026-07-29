## What I found

The app itself still renders locally (I loaded `/` in a headless browser and the storefront came up), but the project has grown a very heavy asset layer that is choking the preview:

- `src/assets/page-icons/` holds **2,148 JPGs totalling 1.3 GB — 630 KB average per icon** (they are full-size AI renders, never downsized). Total `src/assets` is 1.5 GB.
- `src/lib/coverIcons.ts` has **892 static image imports plus an eager `import.meta.glob` over every icon** (`{ eager: true }`), so any page that touches icons pulls thousands of modules in one shot.
- The Vite dev process is sitting at ~850 MB RSS, and file-watching 2,148 large files adds to it.

That combination is the most likely cause of the preview hanging/never painting (no console logs arrived from your session at all, which fits "never booted"). Cover images also 404 in the sandbox because they're externalized assets — that part is expected locally and works on the real preview.

## Plan

1. **Downsize every page icon.** Batch-resize all 2,148 JPGs to a sane icon size (max ~512 px, quality ~80). Expected result: 1.3 GB → roughly 40–60 MB, with no visible quality loss at the sizes they're displayed (grid thumbs and page headers).
2. **Drop the eager glob.** Rewrite `src/lib/coverIcons.ts` so the icon map is built from a **non-eager** `import.meta.glob` (URL-only, lazy) or from a generated static manifest of paths, and delete the 892 hand-written imports that duplicate what the glob already covers. Public API (`getCoverPageIcon`, `getCoverIconPack`) stays identical, so no component changes are required.
3. **Verify.** Reload `/`, `/planner/wellness-journey`, and a planner interior page in a headless browser; confirm icons still render for a dedicated-folder cover (e.g. Monarch Moon), the cart summary strip still shows only that cover's icons, and note the drop in dev-server memory/module count.

## Technical notes

- Resizing runs in place with ffmpeg (already installed) or Pillow, so all existing paths and the `coverIcons` resolver keep working untouched.
- Keeping icons as real repo files (not externalized assets) preserves the current dynamic-folder resolver behaviour; only their byte size changes.
- I'll keep a check that every folder still has the same file count after the resize pass, so no icon goes missing.
