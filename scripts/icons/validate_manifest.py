#!/usr/bin/env python3
"""Validate that cover icon packs never alias across covers."""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
PACKS = ROOT / "src/data/iconPacks.ts"

src = PACKS.read_text()
match = re.search(
    r"export const COVER_ICON_FOLDER: Record<string, string> = (\{.*?\});",
    src,
    re.S,
)

if not match:
    print("COVER_ICON_FOLDER export not found", file=sys.stderr)
    sys.exit(1)

mapping = json.loads(match.group(1))
aliases = {cover: folder for cover, folder in mapping.items() if cover != folder}

if aliases:
    print("Cross-cover icon aliases are not allowed:", file=sys.stderr)
    for cover, folder in sorted(aliases.items()):
        print(f"  {cover} -> {folder}", file=sys.stderr)
    sys.exit(1)

print(f"OK: {len(mapping)} cover icon mappings are strict/self-only")