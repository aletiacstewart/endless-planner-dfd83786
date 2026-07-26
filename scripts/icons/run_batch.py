#!/usr/bin/env python3
"""Batch runner for sticker/icon generation.

Usage:
  python3 scripts/icons/run_batch.py stickers <collection> [--limit N]
  python3 scripts/icons/run_batch.py icons <coverId> <collection> [--limit N]

Reads checkpoint at .icons-progress.json. Calls gen_image.py per piece.
"""
import json, os, sys, subprocess, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PROGRESS = ROOT / ".icons-progress.json"
GEN = ROOT / "scripts/icons/gen_image.py"

CATEGORIES = ["motifs", "banners", "washi", "icons"]
PIECES_PER_CATEGORY = 15

PAGE_IDS = [
    "my-goals", "yearly-calendar", "monthly-calendar", "weekly-calendar",
    "daily-tracker", "complete-tracker", "yearly-habit-tracker", "weight-tracker",
    "measurement-tracker", "blood-sugar-tracker", "blood-pressure-tracker",
    "oxygen-tracker", "self-care-checklist", "cleaning-checklist", "recipe",
    "notes", "workout-tracker", "medications", "medical-records", "yearly-focus",
    # Phase B / C additions
    "brain-dump", "fitness-tracker", "adhd-toolkit",
    "budget-monthly", "debt-tracker", "savings-goals",
    "home-info", "weekly-cleaning", "meal-planning",
    "mood-journal", "therapy-session", "coping-toolkit",
]

sys.path.insert(0, str(ROOT / "scripts/icons"))

def load_prompts():
    # Parse the mjs by exec — simpler: re-import via a bridge
    import importlib.util
    # Fallback: read prompts from prompts.mjs by regex isn't robust; write pyproxy
    return None

# Inline the prompt builders in Python to avoid TS/JS bridge
UNIVERSAL_NEGATIVE = "no text, no letters, no words, no typography, no numbers, no digits, no calendar grid, no date labels, no month names, no day names, no watermark, no logo, no signature, no captions, no writing of any kind"

def load_js_maps():
    """Extract PAGE_SUBJECTS/COLLECTION_STYLE/COVER_STYLE_OVERRIDE/STICKER_CATEGORY_PROMPT from prompts.mjs."""
    import re
    src = (ROOT / "scripts/icons/prompts.mjs").read_text()
    def grab(name):
        m = re.search(rf"export const {name} = ({{[^;]+?}});", src, re.DOTALL)
        if not m:
            raise SystemExit(f"couldn't find {name}")
        # Convert JS object to JSON-ish: this is brittle but our objects are simple
        body = m.group(1)
        # Use node to eval and print JSON
        node_script = f"const x = {body}; console.log(JSON.stringify(x));"
        out = subprocess.check_output(["node", "-e", node_script], cwd=ROOT).decode()
        return json.loads(out)
    return {
        "PAGE_SUBJECTS": grab("PAGE_SUBJECTS"),
        "COLLECTION_STYLE": grab("COLLECTION_STYLE"),
        "COVER_STYLE_OVERRIDE": grab("COVER_STYLE_OVERRIDE"),
        "STICKER_CATEGORY_PROMPT": grab("STICKER_CATEGORY_PROMPT"),
    }

MAPS = load_js_maps()
DEFAULT_STYLE = "Refined editorial illustration, soft warm palette, hand-crafted feel, gentle painted textures, museum-quality."

def sticker_prompt(collection, category, idx):
    style = MAPS["COLLECTION_STYLE"].get(collection, DEFAULT_STYLE)
    role = MAPS["STICKER_CATEGORY_PROMPT"].get(category, "themed sticker")
    return (f"Die-cut STICKER piece #{idx+1} for a planner sticker library. "
            f"Role: {role}. Theme: {style} "
            "Rendering: clean vector-illustration or gouache feel with a subtle die-cut white halo edge, "
            "centered on a plain solid off-white background, no drop shadow, no scene, just the sticker. "
            f"Strictly: {UNIVERSAL_NEGATIVE}.")

def icon_prompt(cover_id, collection, page_id):
    subject = MAPS["PAGE_SUBJECTS"].get(page_id, f"a symbolic emblem for {page_id}")
    style = MAPS["COVER_STYLE_OVERRIDE"].get(cover_id) or MAPS["COLLECTION_STYLE"].get(collection, DEFAULT_STYLE)
    return (f"Small square editorial ICON illustration: {subject}. Style: {style} "
            "Composition: single centered subject, generous negative space, soft vignette, painterly finish, "
            "feels hand-crafted by a master illustrator, museum-quality craftsmanship. "
            f"Strictly: {UNIVERSAL_NEGATIVE}.")

def load_progress():
    if PROGRESS.exists():
        return json.loads(PROGRESS.read_text())
    return {"icons": {}, "stickers": {}}

def save_progress(p):
    PROGRESS.write_text(json.dumps(p, indent=2))

def run_one(prompt, out_path):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.check_call(["python3", str(GEN), str(out_path), prompt])

def gen_stickers(collection, limit=10**9):
    prog = load_progress()
    prog["stickers"].setdefault(collection, [])
    done = set(prog["stickers"][collection])
    made = 0
    for cat in CATEGORIES:
        for i in range(PIECES_PER_CATEGORY):
            key = f"{cat}-{i}"
            if key in done: continue
            if made >= limit: return made
            out = ROOT / f"src/assets/stickers/{collection}/{cat}-{i}.png"
            if out.exists():
                prog["stickers"][collection].append(key); save_progress(prog); continue
            print(f"[stickers] {collection}/{key}", flush=True)
            try:
                run_one(sticker_prompt(collection, cat, i), out)
                prog["stickers"][collection].append(key); save_progress(prog); made += 1
            except Exception as e:
                print(f"  failed: {e}", flush=True)
    return made

def gen_icons(cover_id, collection, limit=10**9):
    prog = load_progress()
    prog["icons"].setdefault(cover_id, [])
    done = set(prog["icons"][cover_id])
    made = 0
    for pid in PAGE_IDS:
        if pid in done: continue
        if made >= limit: return made
        out = ROOT / f"src/assets/page-icons/{cover_id}/{pid}.jpg"
        if out.exists():
            prog["icons"][cover_id].append(pid); save_progress(prog); continue
        print(f"[icons] {cover_id}/{pid}", flush=True)
        try:
            run_one(icon_prompt(cover_id, collection, pid), out)
            prog["icons"][cover_id].append(pid); save_progress(prog); made += 1
        except Exception as e:
            print(f"  failed: {e}", flush=True)
    return made

if __name__ == "__main__":
    args = sys.argv[1:]
    limit = 10**9
    if "--limit" in args:
        i = args.index("--limit"); limit = int(args[i+1]); del args[i:i+2]
    mode = args[0]
    if mode == "stickers":
        n = gen_stickers(args[1], limit); print(f"done, made {n}")
    elif mode == "icons":
        n = gen_icons(args[1], args[2], limit); print(f"done, made {n}")
    else:
        print("usage: run_batch.py stickers <collection> | icons <coverId> <collection>")
