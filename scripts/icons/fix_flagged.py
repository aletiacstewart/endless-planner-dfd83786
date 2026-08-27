#!/usr/bin/env python3
"""Regenerate only the page icons that the audit flagged.

Reads .audit/icons/report.json (produced by scripts/icons/audit.py) and
regenerates every icon listed under `missing`, `duplicate` and `offtheme`,
using the cover's own artwork as the style bible (same pipeline as regen_all).

Usage:
  python3 scripts/icons/fix_flagged.py [--only cover-a,cover-b] [--workers 8]
                                       [--limit N] [--kinds missing,offtheme]
Checkpointed: /tmp/fix_flagged_done.txt — safe to re-run after an interruption.
"""
from __future__ import annotations

import json
import pathlib
import sys
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import regen_all as R  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
REPORT = ROOT / ".audit/icons/report.json"
DONE = pathlib.Path("/tmp/fix_flagged_done.txt")


def done_set() -> set[str]:
    return set(DONE.read_text().split()) if DONE.exists() else set()


def build_todo(only: set[str] | None, kinds: list[str], limit: int | None):
    report = json.loads(REPORT.read_text())
    by_id = {c["id"]: c for c in R.covers()}
    already = done_set()
    todo = []
    for cover_id, info in report["covers"].items():
        if only and cover_id not in only:
            continue
        cover = by_id.get(cover_id)
        if not cover:
            continue
        pages: list[str] = []
        for kind in kinds:
            pages += info.get(kind, [])
        for page in sorted(set(pages)):
            if f"{cover_id}/{page}" in already:
                continue
            todo.append((cover, page))
    if limit:
        todo = todo[:limit]
    return todo


def run(todo, workers: int):
    total = len(todo)
    count = [0]

    def work(item):
        cover, page = item
        try:
            ref = R.ref_image(cover)
            if not ref:
                print(f"SKIP no cover art {cover['id']}", flush=True)
                return
            png = R.gen(R.prompt_for(cover, page), ref)
            R.write_icon(png, R.ICONS / cover["id"] / f"{page}.jpg")
            count[0] += 1
            with open(DONE, "a") as fh:
                fh.write(f"{cover['id']}/{page}\n")
            print(f"[{count[0]}/{total}] {cover['id']}/{page}", flush=True)
        except Exception as e:  # noqa: BLE001
            print(f"FAIL {cover['id']}/{page}: {e}", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(work, todo))


def main() -> int:
    args = sys.argv[1:]

    def opt(flag, default=None):
        if flag in args:
            i = args.index(flag)
            return args[i + 1]
        return default

    only = opt("--only")
    todo = build_todo(
        set(only.split(",")) if only else None,
        (opt("--kinds", "missing,duplicate,offtheme") or "").split(","),
        int(opt("--limit") or 0) or None,
    )
    print(f"regenerating {len(todo)} icons", flush=True)
    run(todo, int(opt("--workers", "8")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
