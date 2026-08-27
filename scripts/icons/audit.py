#!/usr/bin/env python3
"""Audit every cover's page-icon pack.

Produces:
  • .audit/icons/report.json  — machine report of every problem found
  • .audit/icons/sheets/<cover-id>.jpg — contact sheet of that cover's 39 icons

Flags, per plan:
  missing       — page icon file absent or zero bytes
  duplicate     — byte-identical to an icon belonging to a different cover
  offtheme      — colour signature far from the median of its own cover's set
  orphan folder — icon folder that no longer maps to a registered cover

Usage:  python3 scripts/icons/audit.py [--sheets]
"""
from __future__ import annotations

import colorsys
import hashlib
import json
import re
import statistics
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
ICONS = ROOT / "public/page-icons"
OUT = ROOT / ".audit/icons"
SHEETS = OUT / "sheets"

# Hue distance (degrees) + saturation/lightness deltas beyond which an icon is
# considered off-theme relative to its own pack's median signature.
HUE_TOL = 42.0
SAT_TOL = 0.30
LIG_TOL = 0.26


def _bun(script: str):
    import subprocess

    out = subprocess.check_output(["bun", str(ROOT / "scripts/icons" / script)], cwd=ROOT)
    return json.loads(out)


def covers() -> list[dict]:
    """Authoritative cover registry, read straight from src/data/covers.ts."""
    return _bun("_covlist.ts")


def page_ids() -> list[str]:
    """Every page type the planner can create — each needs an icon per cover."""
    return _bun("_pagelist.ts")


def icon_folders() -> dict[str, list[str]]:
    src = (ROOT / "src/data/iconPacks.ts").read_text()
    body = src[src.index("{") :]
    out: dict[str, list[str]] = {}
    for folder, pages in re.findall(r'"([a-z0-9-]+)": \[(.*?)\]', body, re.DOTALL):
        out[folder] = re.findall(r'"([a-z0-9-]+)"', pages)
    return out


def signature(path: Path) -> tuple[float, float, float]:
    """Average hue/sat/lightness of the icon, ignoring near-white paper."""
    im = Image.open(path).convert("RGB")
    im.thumbnail((64, 64))
    hs, ss, ls = [], [], []
    for r, g, b in im.getdata():
        h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
        if l > 0.94 and s < 0.12:
            continue  # blank paper
        hs.append(h * 360)
        ss.append(s)
        ls.append(l)
    if not hs:
        return (0.0, 0.0, 1.0)
    # circular mean for hue
    import math

    x = sum(math.cos(math.radians(h)) for h in hs)
    y = sum(math.sin(math.radians(h)) for h in hs)
    hue = math.degrees(math.atan2(y, x)) % 360
    return (hue, statistics.fmean(ss), statistics.fmean(ls))


def hue_gap(a: float, b: float) -> float:
    d = abs(a - b) % 360
    return min(d, 360 - d)


def contact_sheet(cover_id: str, entries: list[tuple[str, Path]], flagged: set[str]) -> None:
    cols, cell = 8, 132
    rows = (len(entries) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * cell + 26), "white")
    draw = ImageDraw.Draw(sheet)
    draw.text((8, 8), cover_id, fill="black")
    for i, (page, path) in enumerate(entries):
        x, y = (i % cols) * cell, 26 + (i // cols) * cell
        try:
            im = Image.open(path).convert("RGB")
            im.thumbnail((cell - 8, cell - 8))
            sheet.paste(im, (x + 4, y + 4))
        except Exception:
            draw.rectangle([x + 4, y + 4, x + cell - 4, y + cell - 4], outline="red", width=2)
        if page in flagged:
            draw.rectangle([x + 2, y + 2, x + cell - 2, y + cell - 2], outline="red", width=3)
    SHEETS.mkdir(parents=True, exist_ok=True)
    sheet.save(SHEETS / f"{cover_id}.jpg", "JPEG", quality=82)


def main() -> int:
    want_sheets = "--sheets" in sys.argv
    OUT.mkdir(parents=True, exist_ok=True)

    cover_list = covers()
    all_pages = page_ids()
    cover_ids = {c["id"] for c in cover_list}
    folders = icon_folders()

    orphans = sorted(set(folders) - cover_ids) + sorted(
        {p.name for p in ICONS.iterdir() if p.is_dir()} - set(folders) - cover_ids
    )

    hashes: dict[str, list[str]] = {}
    report = {"covers": {}, "orphanFolders": sorted(set(orphans)), "summary": {}}
    totals = {"missing": 0, "duplicate": 0, "offtheme": 0, "icons": 0}

    per_cover_sigs: dict[str, dict[str, tuple[float, float, float]]] = {}

    for c in cover_list:
        pages = all_pages
        missing, sigs, entries = [], {}, []
        for page in pages:
            p = ICONS / c["id"] / f"{page}.jpg"
            entries.append((page, p))
            if not p.exists() or p.stat().st_size == 0:
                missing.append(page)
                continue
            totals["icons"] += 1
            digest = hashlib.md5(p.read_bytes()).hexdigest()
            hashes.setdefault(digest, []).append(f"{c['id']}/{page}")
            sigs[page] = signature(p)
        per_cover_sigs[c["id"]] = sigs
        report["covers"][c["id"]] = {
            "name": c["name"],
            "collection": c["collection"],
            "pages": len(pages),
            "missing": missing,
            "duplicate": [],
            "offtheme": [],
        }
        totals["missing"] += len(missing)

    # cross-cover duplicates
    for digest, refs in hashes.items():
        owners = {r.split("/")[0] for r in refs}
        if len(owners) > 1:
            for ref in refs:
                cid, page = ref.split("/")
                report["covers"][cid]["duplicate"].append(page)
                totals["duplicate"] += 1

    # off-theme relative to the pack's own median signature
    for cid, sigs in per_cover_sigs.items():
        if len(sigs) < 8:
            continue
        import math

        hx = sum(math.cos(math.radians(h)) for h, _, _ in sigs.values())
        hy = sum(math.sin(math.radians(h)) for h, _, _ in sigs.values())
        med_h = math.degrees(math.atan2(hy, hx)) % 360
        med_s = statistics.median(s for _, s, _ in sigs.values())
        med_l = statistics.median(l for _, _, l in sigs.values())
        for page, (h, s, l) in sigs.items():
            if (
                hue_gap(h, med_h) > HUE_TOL
                or abs(s - med_s) > SAT_TOL
                or abs(l - med_l) > LIG_TOL
            ):
                report["covers"][cid]["offtheme"].append(page)
                totals["offtheme"] += 1

    for cid, info in report["covers"].items():
        info["duplicate"] = sorted(set(info["duplicate"]))
        info["offtheme"] = sorted(set(info["offtheme"]))
        info["flagged"] = sorted(set(info["missing"] + info["duplicate"] + info["offtheme"]))

    report["summary"] = {
        **totals,
        "covers": len(cover_list),
        "orphanFolders": len(report["orphanFolders"]),
        "flaggedIcons": sum(len(i["flagged"]) for i in report["covers"].values()),
    }
    (OUT / "report.json").write_text(json.dumps(report, indent=2))

    if want_sheets:
        for c in cover_list:
            pages = all_pages
            contact_sheet(
                c["id"],
                [(p, ICONS / c["id"] / f"{p}.jpg") for p in pages],
                set(report["covers"][c["id"]]["flagged"]),
            )

    print(json.dumps(report["summary"], indent=2))
    worst = sorted(
        report["covers"].items(), key=lambda kv: -len(kv[1]["flagged"])
    )[:12]
    for cid, info in worst:
        if info["flagged"]:
            print(f"{cid}: {len(info['flagged'])} flagged -> {', '.join(info['flagged'][:8])}")
    if report["orphanFolders"]:
        print("orphan folders:", ", ".join(report["orphanFolders"]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
