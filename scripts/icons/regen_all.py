#!/usr/bin/env python3
"""Regenerate per-cover page icon packs.

Every cover gets its OWN folder in public/page-icons/<coverId>/ with all 32
page icons, generated with the cover art itself attached as the style
reference so the pack always matches its cover's palette + aesthetic.

Usage:
  python3 scripts/icons/regen_all.py plan
  python3 scripts/icons/regen_all.py run [--workers 6] [--only id1,id2]
"""
import os, re, sys, json, io, base64, time, hashlib, pathlib, subprocess
from concurrent.futures import ThreadPoolExecutor

import requests
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
ICONS = ROOT / "public/page-icons"
REFDIR = pathlib.Path("/tmp/coverrefs")
REFDIR.mkdir(exist_ok=True)
DEV = os.environ.get("ASSET_HOST", "https://brandedbydigital.com")
MODEL = os.environ.get("GEN_MODEL", "google/gemini-3.1-flash-image")
KEY = os.environ["LOVABLE_API_KEY"]
ENDPOINT = "https://ai.gateway.lovable.dev/v1/images/generations"
MAXPX = 512

PAGES = [
    "my-goals", "yearly-calendar", "monthly-calendar", "weekly-calendar",
    "daily-tracker", "complete-tracker", "yearly-habit-tracker", "weight-tracker",
    "measurement-tracker", "blood-sugar-tracker", "blood-pressure-tracker",
    "oxygen-tracker", "self-care-checklist", "cleaning-checklist", "recipe",
    "notes", "workout-tracker", "medications", "medical-records", "yearly-focus",
    "brain-dump", "fitness-tracker", "adhd-toolkit", "budget-monthly",
    "debt-tracker", "savings-goals", "home-info", "weekly-cleaning",
    "meal-planning", "mood-journal", "therapy-session", "coping-toolkit",
]


def js_map(name):
    src = (ROOT / "scripts/icons/prompts.mjs").read_text()
    m = re.search(rf"export const {name} = (\{{.+?\n\}});", src, re.DOTALL)
    out = subprocess.check_output(["node", "-e", f"console.log(JSON.stringify({m.group(1)}))"], cwd=ROOT)
    return json.loads(out)


SUBJECTS = js_map("PAGE_SUBJECTS")
COLLECTION_STYLE = js_map("COLLECTION_STYLE")
OVERRIDE = js_map("COVER_STYLE_OVERRIDE")
NEGATIVE = ("no text, no letters, no words, no typography, no numbers, no digits, "
            "no calendar grid, no date labels, no month names, no day names, no watermark, "
            "no logo, no signature, no captions, no writing of any kind, no compass letters, "
            "no N E S W marks, no roman numerals, no tiny written marks")


def covers():
    src = (ROOT / "src/data/covers.ts").read_text()
    imports = dict((v, k) for k, v in re.findall(
        r'import (\w+) from "@/assets/covers/([a-z0-9-]+)\.png\.asset\.json"', src))
    out = []
    for cid, name, coll, var in re.findall(
        r'\{\s*id: "([a-z0-9-]+)",\s*name: "([^"]+)",\s*collection: "([a-z-]+)",\s*image: (\w+)\.url', src
    ):
        out.append({"id": cid, "name": name, "collection": coll, "var": var})
    var2file = {v: f for f, v in imports.items()}
    for c in out:
        c["asset"] = var2file.get(c["var"])
    return out


def ref_image(cover):
    """Download the cover art once, downscale, return local path."""
    p = REFDIR / f"{cover['id']}.jpg"
    if p.exists():
        return str(p)
    aj = ROOT / f"src/assets/covers/{cover['asset']}.png.asset.json"
    if not aj.exists():
        return None
    url = json.loads(aj.read_text())["url"]
    r = requests.get(DEV + url, timeout=120)
    r.raise_for_status()
    im = Image.open(io.BytesIO(r.content)).convert("RGB")
    im.thumbnail((640, 640))
    im.save(p, "JPEG", quality=85)
    return str(p)


def style_for(cover):
    s = OVERRIDE.get(cover["id"])
    if s:
        return s
    base = COLLECTION_STYLE.get(cover["collection"], "Refined editorial illustration, painterly, museum-quality.")
    return (f"{base} This pack belongs to the cover '{cover['name']}' — every icon must reuse that cover's "
            f"exact palette, background treatment, motifs and painterly finish so the set reads as one family.")


def prompt_for(cover, page):
    subject = SUBJECTS.get(page, f"a symbolic emblem for {page}")
    return (
        f"Square planner PAGE ICON illustration. Subject: {subject}. "
        f"Style: {style_for(cover)} "
        "The attached cover artwork is the STYLE BIBLE: match its palette, lighting, background texture, "
        "linework and mood exactly, and weave in its signature motif subtly, but draw the requested subject — "
        "do not reproduce the cover itself. "
        "Composition: single centered subject, generous negative space, soft vignette, painterly hand-crafted finish, "
        f"museum-quality craftsmanship. Strictly: {NEGATIVE}."
    )


def _body(prompt, b64):
    """Lite model takes the Vertex generateContent shape; others take chat shape."""
    if MODEL.endswith("-lite-image"):
        return {
            "model": MODEL,
            "contents": [{"role": "user", "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": "image/jpeg", "data": b64}},
            ]}],
            "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
        }
    return {
        "model": MODEL,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ]}],
        "modalities": ["image", "text"],
        "stream": False,
    }


def gen(prompt, ref):
    with open(ref, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    body = _body(prompt, b64)
    last = ""
    for attempt in range(3):
        try:
            r = requests.post(ENDPOINT, headers={"Authorization": f"Bearer {KEY}",
                                                 "Content-Type": "application/json"},
                              json=body, timeout=240)
            if r.status_code == 200:
                return base64.b64decode(r.json()["data"][0]["b64_json"])
            last = f"HTTP {r.status_code} {r.text[:200]}"
            if r.status_code == 402:
                raise RuntimeError(last)
        except Exception as e:  # noqa
            last = str(e)
            if "402" in last:
                raise
        time.sleep(3 + attempt * 4)
    raise RuntimeError(last)



def write_icon(png, out: pathlib.Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(io.BytesIO(png)).convert("RGB")
    im.thumbnail((MAXPX, MAXPX))
    im.save(out, "JPEG", quality=82, optimize=True)


# --- planning ------------------------------------------------------------
def dup_hashes():
    """Hashes that appear in more than one folder = copied placeholder art."""
    seen = {}
    for folder in ICONS.iterdir():
        if not folder.is_dir():
            continue
        for f in folder.glob("*.jpg"):
            h = hashlib.md5(f.read_bytes()).hexdigest()
            seen.setdefault(h, set()).add(folder.name)
    return {h for h, fs in seen.items() if len(fs) > 1}


def plan(only=None):
    dups = dup_hashes()
    todo = []
    for c in covers():
        if only and c["id"] not in only:
            continue
        folder = ICONS / c["id"]
        for page in PAGES:
            f = folder / f"{page}.jpg"
            if f.exists() and hashlib.md5(f.read_bytes()).hexdigest() not in dups:
                continue
            todo.append((c, page))
    return todo


def run(todo, workers=6):
    total = len(todo)
    done = [0]
    lock_print = lambda *a: print(*a, flush=True)

    def work(item):
        c, page = item
        try:
            ref = ref_image(c)
            if not ref:
                lock_print(f"SKIP no cover art {c['id']}")
                return
            png = gen(prompt_for(c, page), ref)
            write_icon(png, ICONS / c["id"] / f"{page}.jpg")
            done[0] += 1
            lock_print(f"[{done[0]}/{total}] {c['id']}/{page}")
        except Exception as e:  # noqa
            lock_print(f"FAIL {c['id']}/{page}: {e}")

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(work, todo))


if __name__ == "__main__":
    args = sys.argv[1:]
    only = None
    if "--only" in args:
        i = args.index("--only"); only = set(args[i + 1].split(",")); del args[i:i + 2]
    workers = 6
    if "--workers" in args:
        i = args.index("--workers"); workers = int(args[i + 1]); del args[i:i + 2]
    limit = None
    if "--limit" in args:
        i = args.index("--limit"); limit = int(args[i + 1]); del args[i:i + 2]
    mode = args[0] if args else "plan"
    todo = plan(only)
    if limit:
        todo = todo[:limit]
    if mode == "plan":
        from collections import Counter
        c = Counter(x[0]["id"] for x in todo)
        for k, v in sorted(c.items()):
            print(f"{k:36s} {v}")
        print("TOTAL", len(todo))
    else:
        run(todo, workers)
