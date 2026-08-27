#!/usr/bin/env python3
"""Generate the SHARED topic-based sticker library.

One set of stickers is used by every cover, so the art is generated once.
Subjects come from src/data/stickers.ts (STICKER_SLOT_SUBJECTS) so the app and
the art stay in sync.

Output: public/stickers/shared/<category>/<slot-index>.png (transparent)

Usage:
  python3 scripts/stickers/gen_shared.py --category celebrations [--workers 6]
  python3 scripts/stickers/gen_shared.py --all [--limit N]

Checkpointed: existing files are skipped, so re-running is safe.
"""
from __future__ import annotations

import base64
import io
import json
import os
import pathlib
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor

import requests
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTDIR = ROOT / "public/stickers/shared"
MODEL = os.environ.get("GEN_MODEL", "google/gemini-3.1-flash-image")
KEY = os.environ["LOVABLE_API_KEY"]
ENDPOINT = "https://ai.gateway.lovable.dev/v1/images/generations"

STYLE = (
    "soft watercolor and gouache illustration with delicate ink linework, a warm muted "
    "palette of cream, blush, sage, dusty teal and soft gold, gentle paper texture, "
    "vintage-storybook charm — refined and neutral so it complements any cover theme"
)
NEGATIVE = (
    "no text, no letters, no words, no typography, no numbers, no digits, no watermark, "
    "no logo, no signature, no captions, no writing of any kind"
)


def subjects() -> dict[str, list[str]]:
    """Read STICKER_SLOT_SUBJECTS from the app data module."""
    script = (
        'import { STICKER_SLOT_SUBJECTS } from "./src/data/stickers";'
        "console.log(JSON.stringify(STICKER_SLOT_SUBJECTS));"
    )
    tmp = ROOT / ".sticker_subjects.ts"
    tmp.write_text(script)
    try:
        out = subprocess.check_output(["bun", "run", str(tmp)], cwd=ROOT)
    finally:
        tmp.unlink(missing_ok=True)
    return json.loads(out.decode().strip().splitlines()[-1])


def prompt_for(subject: str) -> str:
    return (
        f"Single die-cut planner STICKER of {subject}, cut out and isolated on a plain solid "
        f"pure WHITE (#FFFFFF) studio background — no paper grain, no cream tint, no border, "
        f"no backdrop panel. Style: {STYLE}. Rendering: one centered object only, crisp edges "
        f"with a thin white die-cut border, no scene, no background pattern, no drop shadow, "
        f"no frame, no card. Strictly: {NEGATIVE}."
    )


def gen(prompt: str) -> bytes:
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": [{"type": "text", "text": prompt}]}],
        "modalities": ["image", "text"],
        "stream": False,
    }
    last = ""
    for attempt in range(3):
        try:
            r = requests.post(
                ENDPOINT,
                headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"},
                json=body,
                timeout=240,
            )
            if r.status_code == 200:
                return base64.b64decode(r.json()["data"][0]["b64_json"])
            last = f"HTTP {r.status_code} {r.text[:200]}"
            if r.status_code == 402:
                raise RuntimeError(last)
        except Exception as e:  # noqa: BLE001
            last = str(e)
            if "402" in last:
                raise
        time.sleep(3 + attempt * 4)
    raise RuntimeError(last)


def to_transparent_png(png_bytes: bytes, out: pathlib.Path, size: int = 320) -> None:
    """Flood-fill the studio backdrop from the border to transparency."""
    im = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    px = im.load()
    w, h = im.size
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    br = sum(c[0] for c in corners) / 4
    bg = sum(c[1] for c in corners) / 4
    bb = sum(c[2] for c in corners) / 4
    if min(br, bg, bb) >= 150:
        tol = 34

        def is_bg(r, g, b):
            return abs(r - br) < tol and abs(g - bg) < tol and abs(b - bb) < tol

        stack = [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)]
        stack += [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
        seen: set[tuple[int, int]] = set()
        while stack:
            x, y = stack.pop()
            if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
                continue
            seen.add((x, y))
            r, g, b, a = px[x, y]
            if is_bg(r, g, b):
                px[x, y] = (r, g, b, 0)
                stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
        bbox = im.getbbox()
        if bbox:
            im = im.crop(bbox)
    im.thumbnail((size, size), Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG", optimize=True)


def main() -> int:
    args = sys.argv[1:]

    def opt(flag, default=None):
        return args[args.index(flag) + 1] if flag in args else default

    slots = subjects()
    cats = [opt("--category")] if opt("--category") else list(slots)
    todo = []
    for cat in cats:
        for i, subject in enumerate(slots[cat]):
            out = OUTDIR / cat / f"{i}.png"
            if out.exists() and out.stat().st_size > 0:
                continue
            todo.append((cat, i, subject, out))
    limit = int(opt("--limit") or 0)
    if limit:
        todo = todo[:limit]
    total = len(todo)
    print(f"generating {total} shared stickers", flush=True)
    count = [0]

    def work(item):
        cat, i, subject, out = item
        try:
            to_transparent_png(gen(prompt_for(subject)), out)
            count[0] += 1
            print(f"[{count[0]}/{total}] {cat}/{i} {subject}", flush=True)
        except Exception as e:  # noqa: BLE001
            print(f"FAIL {cat}/{i} {subject}: {e}", flush=True)

    with ThreadPoolExecutor(max_workers=int(opt("--workers", "6"))) as ex:
        list(ex.map(work, todo))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
