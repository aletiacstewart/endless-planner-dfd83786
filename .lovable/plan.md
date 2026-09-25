# Fix the Medicines table scrollbar

## Problem
On the Complete Tracker's Medicines box, the desktop table forces a minimum width of 672px (`min-w-[42rem]`) inside a narrower page column, so a horizontal scrollbar appears (as in your screenshot).

## Fix (src/components/FieldRenderer.tsx, medicines table ~lines 1053–1055)
- Remove the forced `min-w-[42rem]` and the `overflow-x-auto` scroll wrapper on the desktop table.
- Let the existing flexible grid columns (`minmax(0, …)`) shrink to fit the page width, so all columns (Name, Strength, Reason, Doctor, M/A/N) stay visible with no scrolling.
- Keep inputs usable at the narrower width (they already use `minmax(0,…)` and small heights); the mobile card layout is untouched.

## Result
The Medicines table fits the page exactly — no horizontal scrollbar on any screen size. Nothing you already wrote changes.

## Verify
- Build stays clean.
- Open a Complete Tracker day on desktop and confirm the Medicines box shows all columns with no scrollbar.
