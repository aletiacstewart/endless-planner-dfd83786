#!/usr/bin/env python3
"""Regenerate src/data/stickerPacks.ts from public/stickers/<cover-id>/.

Only covers with a COMPLETE 60-piece set are registered — a half-generated
folder keeps its collection fallback so the library never shows a hole.

Usage: python3 scripts/stickers/write_manifest.py
"""
from __future__ import annotations

import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTDIR = ROOT / "public/stickers"
TARGET = ROOT / "src/data/stickerPacks.ts"

CATEGORIES = ["motifs", "banners", "washi", "icons"]
PER_CATEGORY = 15


def main() -> int:
    complete: list[str] = []
    partial: dict[str, int] = {}
    if OUTDIR.exists():
        for folder in sorted(p for p in OUTDIR.iterdir() if p.is_dir()):
            have = sum(
                1
                for cat in CATEGORIES
                for i in range(PER_CATEGORY)
                if (folder / f"{cat}-{i}.png").exists()
            )
            if have == len(CATEGORIES) * PER_CATEGORY:
                complete.append(folder.name)
            elif have:
                partial[folder.name] = have

    body = ",\n".join(f'  "{cid}"' for cid in complete)
    TARGET.write_text(
        "// AUTO-GENERATED — sticker art lives in public/stickers/<cover-id>/<category>-<n>.png\n"
        "// Regenerate with: python3 scripts/stickers/write_manifest.py\n"
        "//\n"
        "// Every id listed here has a complete 60-piece themed set (15 motifs,\n"
        "// 15 banners, 15 washi, 15 icons). Covers absent from this list fall back\n"
        "// to their collection set until their own art is generated.\n\n"
        "export const STICKER_PACK_COVERS: string[] = [\n"
        f"{body}{',' if complete else ''}\n];\n\n"
        "export const STICKER_PACK_CATEGORIES = [\n"
        '  "motifs",\n  "banners",\n  "washi",\n  "icons",\n] as const;\n\n'
        "export const STICKER_PACK_PER_CATEGORY = 15;\n"
    )
    print(json.dumps({"complete": len(complete), "partial": partial}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
