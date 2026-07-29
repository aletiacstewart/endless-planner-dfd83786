#!/usr/bin/env python3
"""Rewrite src/data/iconPacks.ts from the folders on disk.

Every cover that has its own folder is mapped to itself; covers without one
keep their legacy shared folder so nothing 404s mid-migration.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ICONS = ROOT / "public/page-icons"
PACKS = ROOT / "src/data/iconPacks.ts"

folders = {}
for d in sorted(ICONS.iterdir()):
    if d.is_dir():
        pages = sorted(f.stem for f in d.glob("*.jpg"))
        if pages:
            folders[d.name] = pages

src = (ROOT / "src/data/covers.ts").read_text()
cover_ids = [m for m in re.findall(r'^\s*id: "([a-z0-9-]+)",$', src, re.M)]

old = PACKS.read_text()
legacy = dict(re.findall(r'"([a-z0-9-]+)": "([a-z0-9-]+)"', old.split("COVER_ICON_FOLDER")[1]))

mapping = {}
for cid in cover_ids:
    if cid in folders:
        mapping[cid] = cid
    elif legacy.get(cid) in folders:
        mapping[cid] = legacy[cid]

out = [
    "// AUTO-GENERATED — icon folders live in public/page-icons/<folder>/<page>.jpg",
    "// Regenerate with: python3 scripts/icons/write_manifest.py",
    "",
    "export const ICON_FOLDERS: Record<string, string[]> = "
    + json.dumps(folders, indent=2) + ";",
    "",
    "export const COVER_ICON_FOLDER: Record<string, string> = "
    + json.dumps(mapping, indent=2) + ";",
    "",
]
PACKS.write_text("\n".join(out))
print(f"{len(folders)} folders, {len(mapping)} covers mapped, "
      f"{sum(1 for c,f in mapping.items() if c==f)} with their own pack")
