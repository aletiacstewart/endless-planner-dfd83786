#!/usr/bin/env python3
"""Generate a 60-piece themed sticker set for every cover.

Output: public/stickers/<cover-id>/{motifs,banners,washi,icons}-<0..14>.png
Each piece is generated from the cover's own artwork (style bible) so the
library always matches the chosen cover.

Usage:
  python3 scripts/stickers/run_batch.py [--only cover-a,cover-b]
                                        [--collection garden]
                                        [--workers 8] [--limit N]
Checkpointed: /tmp/stickers_done.txt — safe to re-run.
"""
from __future__ import annotations

import io
import pathlib
import sys
from concurrent.futures import ThreadPoolExecutor

from PIL import Image

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1] / "icons"))

import regen_all as R  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUTDIR = ROOT / "public/stickers"
DONE = pathlib.Path("/tmp/stickers_done.txt")

CATEGORIES = ["motifs", "banners", "washi", "icons"]
PER_CATEGORY = 15

ROLE = {
    "motifs": "a hero decorative motif sticker — the single most iconic object of this cover's theme",
    "banners": "an ornamental ribbon-banner / tag sticker with a completely BLANK surface",
    "washi": "a horizontal washi-tape strip with a repeating pattern drawn from this cover's theme, slightly torn edges",
    "icons": "a small utility icon sticker reimagined in this cover's palette and texture",
}

# Variety hints keep the 15 pieces of a category distinct instead of 15 near-copies.
VARIANTS = {
    "motifs": [
        "the theme's signature flower or bloom", "the theme's signature creature or wing",
        "a crescent or celestial accent in the theme", "a leaf-and-stem sprig",
        "a berry or seed cluster", "a small wreath ring", "a bow or ribbon knot",
        "a heart shaped from the theme's material", "a star burst",
        "a small bouquet posy", "a single feather or petal", "a gem or droplet",
        "a laurel sprig", "a small vine curl", "a keepsake charm",
    ],
    "banners": [
        "a swallow-tail ribbon banner", "a scalloped label plate", "a rectangular tag with a string",
        "a folded ribbon streamer", "a wax-sealed blank card", "an oval frame plaque",
        "a bunting triangle", "a curled parchment scroll", "a rounded pill label",
        "a double-fold ribbon", "a hexagon badge", "a torn paper strip label",
        "a laurel-framed blank plate", "a bookmark tag", "a ticket stub shape",
    ],
    "washi": [
        "a small repeating floral pattern", "thin diagonal stripes", "tiny dots on a tinted band",
        "a repeating leaf trail", "a checkerboard weave", "a repeating wing or feather motif",
        "delicate scallop waves", "a repeating star field", "a herringbone weave",
        "a lace-edge band", "a repeating heart chain", "brush-stroke texture",
        "a repeating crescent row", "a plaid weave", "a marbled gradient band",
    ],
    "icons": [
        "a teacup", "a candle", "a water droplet", "a key", "a book",
        "a heart", "a star", "a clock face", "a pill capsule", "a dumbbell",
        "a moon", "a sun", "an envelope", "a pencil", "a checkmark seal",
    ],
}


def prompt_for(cover: dict, category: str, index: int) -> str:
    style = R.style_for(cover)
    return (
        f"Single die-cut planner STICKER, isolated on a plain solid pure-white background. "
        f"Subject: {ROLE[category]} — specifically {VARIANTS[category][index]}. "
        f"Style: {style} The attached cover artwork is the STYLE BIBLE: reuse its exact palette, "
        f"texture, linework and mood so this sticker reads as part of that cover's set. "
        f"Rendering: one centered object only, crisp edges with a thin white die-cut border, "
        f"no scene, no background pattern, no drop shadow, no frame, no card. "
        f"Strictly: {R.NEGATIVE}."
    )


def to_transparent_png(png_bytes: bytes, out: pathlib.Path, size: int = 320) -> None:
    """Trim the generated white studio background to transparency."""
    im = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
    px = im.load()
    w, h = im.size
    # Flood from the border so white *inside* the sticker is preserved.
    stack = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seen = set()
    while stack:
        x, y = stack.pop()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h):
            continue
        seen.add((x, y))
        r, g, b, a = px[x, y]
        if r > 234 and g > 234 and b > 234:
            px[x, y] = (r, g, b, 0)
            stack += [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.thumbnail((size, size), Image.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "PNG", optimize=True)


def done_set() -> set[str]:
    return set(DONE.read_text().split()) if DONE.exists() else set()


def build_todo(only: set[str] | None, collection: str | None, limit: int | None):
    already = done_set()
    todo = []
    for cover in R.covers():
        if only and cover["id"] not in only:
            continue
        if collection and cover["collection"] != collection:
            continue
        for cat in CATEGORIES:
            for i in range(PER_CATEGORY):
                key = f"{cover['id']}/{cat}-{i}"
                if key in already or (OUTDIR / cover["id"] / f"{cat}-{i}.png").exists():
                    continue
                todo.append((cover, cat, i))
    return todo[:limit] if limit else todo


def run(todo, workers: int):
    total = len(todo)
    count = [0]

    def work(item):
        cover, cat, i = item
        try:
            ref = R.ref_image(cover)
            if not ref:
                print(f"SKIP no cover art {cover['id']}", flush=True)
                return
            png = R.gen(prompt_for(cover, cat, i), ref)
            to_transparent_png(png, OUTDIR / cover["id"] / f"{cat}-{i}.png")
            count[0] += 1
            with open(DONE, "a") as fh:
                fh.write(f"{cover['id']}/{cat}-{i}\n")
            print(f"[{count[0]}/{total}] {cover['id']}/{cat}-{i}", flush=True)
        except Exception as e:  # noqa: BLE001
            print(f"FAIL {cover['id']}/{cat}-{i}: {e}", flush=True)

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(work, todo))


def main() -> int:
    args = sys.argv[1:]

    def opt(flag, default=None):
        return args[args.index(flag) + 1] if flag in args else default

    only = opt("--only")
    todo = build_todo(
        set(only.split(",")) if only else None,
        opt("--collection"),
        int(opt("--limit") or 0) or None,
    )
    print(f"generating {len(todo)} stickers", flush=True)
    run(todo, int(opt("--workers", "8")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
