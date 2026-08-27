#!/usr/bin/env python3
"""Regenerate src/data/stickerPacks.ts from public/stickers/shared/.

The sticker library is SHARED across every cover, grouped by planner topic.
Each category folder holds `<slot-index>.png`; only slots with real art are
registered, the rest fall back to their emoji glyph in the app.

Usage: python3 scripts/stickers/write_manifest.py
"""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTDIR = ROOT / "public/stickers/shared"
TARGET = ROOT / "src/data/stickerPacks.ts"
PER_CATEGORY = 18


def main() -> int:
    manifest: dict[str, list[int]] = {}
    if OUTDIR.exists():
        for folder in sorted(p for p in OUTDIR.iterdir() if p.is_dir()):
            have = [
                i
                for i in range(PER_CATEGORY)
                if (folder / f"{i}.png").exists() and (folder / f"{i}.png").stat().st_size > 0
            ]
            if have:
                manifest[folder.name] = have

    body = "\n".join(
        f'  "{cat}": {json.dumps(idx)},' for cat, idx in sorted(manifest.items())
    )
    TARGET.write_text(
        "// AUTO-GENERATED — shared sticker art lives in public/stickers/shared/<category>/<n>.png\n"
        "// Regenerate with: python3 scripts/stickers/write_manifest.py\n"
        "//\n"
        "// Each entry lists the slot indices that have real PNG art. Slots absent here\n"
        "// fall back to their emoji glyph, so the library is always complete.\n\n"
        "export const SHARED_STICKER_MANIFEST: Record<string, number[]> = {\n"
        f"{body}\n" if manifest else
        "export const SHARED_STICKER_MANIFEST: Record<string, number[]> = {\n"
    )
    # Rewrite cleanly (the conditional above only builds the opening); do it in one pass.
    TARGET.write_text(
        "// AUTO-GENERATED — shared sticker art lives in public/stickers/shared/<category>/<n>.png\n"
        "// Regenerate with: python3 scripts/stickers/write_manifest.py\n"
        "//\n"
        "// Each entry lists the slot indices that have real PNG art. Slots absent here\n"
        "// fall back to their emoji glyph, so the library is always complete.\n\n"
        "export const SHARED_STICKER_MANIFEST: Record<string, number[]> = {\n"
        + (body + "\n" if manifest else "")
        + "};\n\n"
        f"export const SHARED_STICKER_PER_CATEGORY = {PER_CATEGORY};\n"
    )
    print(json.dumps({c: len(v) for c, v in manifest.items()}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
