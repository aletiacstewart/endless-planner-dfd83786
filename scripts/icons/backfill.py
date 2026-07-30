#!/usr/bin/env python3
"""Backfill missing per-cover page icons directly into public/page-icons/.

Unlike run_batch.py (which seeds a brand-new pack into src/assets), this script
diffs each *live cover id* against the current page-type list and only generates
what is actually missing, writing straight to the folder the app reads from.

Usage:
  python3 scripts/icons/backfill.py report
  python3 scripts/icons/backfill.py run [--limit N] [--cover ID] [--shard i/n]

Every generated file lands on disk immediately, so the job resumes cleanly after
an interruption: existing files are simply skipped.
"""
import json, os, re, subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
ICONS = ROOT / "public/page-icons"
GEN = ROOT / "scripts/icons/gen_image.py"

UNIVERSAL_NEGATIVE = (
    "no text, no letters, no words, no typography, no numbers, no digits, "
    "no calendar grid, no date labels, no month names, no day names, no watermark, "
    "no logo, no signature, no captions, no writing of any kind, no compass letters, "
    "no N E S W marks, no roman numerals, no tiny written marks"
)
DEFAULT_STYLE = (
    "Refined editorial illustration, soft warm palette, hand-crafted feel, "
    "gentle painted textures, museum-quality."
)


def js_maps():
    src = (ROOT / "scripts/icons/prompts.mjs").read_text()

    def grab(name):
        m = re.search(rf"export const {name} = (\{{[^;]+?\}});", src, re.DOTALL)
        body = m.group(1)
        out = subprocess.check_output(
            ["node", "-e", f"const x = {body}; console.log(JSON.stringify(x));"], cwd=ROOT
        ).decode()
        return json.loads(out)

    return grab("PAGE_SUBJECTS"), grab("COLLECTION_STYLE"), grab("COVER_STYLE_OVERRIDE")


PAGE_SUBJECTS, COLLECTION_STYLE, COVER_STYLE_OVERRIDE = js_maps()


def page_ids():
    src = (ROOT / "src/lib/pageTypes.ts").read_text()
    return re.findall(r'^\s*id: "([a-z0-9-]+)",', src, re.M)


def covers():
    """cover id -> collection, parsed from src/data/covers.ts."""
    src = (ROOT / "src/data/covers.ts").read_text()
    ids = re.findall(r'^\s*id: "([a-z0-9-]+)",', src, re.M)
    out = {}
    for cid in ids:
        m = re.search(
            rf'id: "{re.escape(cid)}",(?:.|\n)*?collection: "([a-z0-9-]+)"', src
        )
        out[cid] = m.group(1) if m else ""
    return out


def missing_map():
    pids = page_ids()
    rows = []
    for cid, coll in covers().items():
        have = {f.stem for f in (ICONS / cid).glob("*.jpg")} if (ICONS / cid).is_dir() else set()
        miss = [p for p in pids if p not in have]
        if miss:
            rows.append((len(miss), cid, coll, miss))
    rows.sort(key=lambda r: (-r[0], r[1]))
    return rows, len(pids)


def prompt_for(cover_id, collection, page_id):
    subject = PAGE_SUBJECTS.get(page_id, f"a symbolic emblem for {page_id.replace('-', ' ')}")
    style = COVER_STYLE_OVERRIDE.get(cover_id) or COLLECTION_STYLE.get(collection, DEFAULT_STYLE)
    return (
        f"Small square editorial ICON illustration: {subject}. Style: {style} "
        "Composition: single centered subject, generous negative space, soft vignette, painterly finish, "
        "feels hand-crafted by a master illustrator, museum-quality craftsmanship. "
        f"Strictly: {UNIVERSAL_NEGATIVE}."
    )


def report():
    rows, total = missing_map()
    print(f"page types: {total}; covers with gaps: {len(rows)}")
    for n, cid, coll, miss in rows:
        print(f"{total - n:>2}/{total}  {cid:<34} missing {n}: {','.join(miss)}")
    print("TOTAL IMAGES NEEDED:", sum(r[0] for r in rows))


def run(limit=10**9, only=None, shard=None):
    rows, _ = missing_map()
    jobs = []
    for _n, cid, coll, miss in rows:
        if only and cid != only:
            continue
        for pid in miss:
            jobs.append((cid, coll, pid))
    if shard:
        i, n = shard
        jobs = [j for k, j in enumerate(jobs) if k % n == i]
    made = 0
    for cid, coll, pid in jobs:
        if made >= limit:
            break
        out = ICONS / cid / f"{pid}.jpg"
        if out.exists():
            continue
        print(f"[icon] {cid}/{pid}", flush=True)
        try:
            subprocess.check_call(["python3", str(GEN), str(out), prompt_for(cid, coll, pid)])
            made += 1
        except Exception as e:  # keep going; a rerun picks up the gap
            print(f"  failed: {e}", flush=True)
    print(f"done, made {made}")


if __name__ == "__main__":
    args = sys.argv[1:]
    limit, only, shard = 10**9, None, None
    if "--limit" in args:
        i = args.index("--limit"); limit = int(args[i + 1]); del args[i:i + 2]
    if "--cover" in args:
        i = args.index("--cover"); only = args[i + 1]; del args[i:i + 2]
    if "--shard" in args:
        i = args.index("--shard"); a, b = args[i + 1].split("/"); shard = (int(a), int(b)); del args[i:i + 2]
    mode = args[0] if args else "report"
    if mode == "report":
        report()
    elif mode == "run":
        run(limit, only, shard)
    else:
        print(__doc__)
