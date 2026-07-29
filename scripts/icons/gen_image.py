#!/usr/bin/env python3
"""Minimal Lovable AI Gateway image generator.

Usage:  gen_image.py <output_path> <prompt>
Reads LOVABLE_API_KEY from env. Streams PNG (Gemini) and writes final image.
For JPG outputs, converts via PIL. Retries once on 5xx.
"""
import sys, os, json, base64, io, time, pathlib
import requests
from PIL import Image

MODEL = os.environ.get("GEN_MODEL", "google/gemini-3.1-flash-image")
KEY = os.environ["LOVABLE_API_KEY"]
ENDPOINT = "https://ai.gateway.lovable.dev/v1/images/generations"

def build_content(prompt: str):
    ref_path = os.environ.get("GEN_REFERENCE_IMAGE")
    if not ref_path:
        return prompt
    mime = "image/png" if ref_path.lower().endswith(".png") else "image/jpeg"
    with open(ref_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return [
        {"type": "text", "text": f"Use the attached image ONLY as the visual style reference for palette, softness, background, ribbon treatment, framing, and painterly aesthetic. Do not copy its subject unless requested. {prompt}"},
        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64}"}},
    ]

def gen(prompt: str) -> bytes:
    body = {
        "model": MODEL,
        "messages": [{"role": "user", "content": build_content(prompt)}],
        "modalities": ["image", "text"],
        "stream": False,
    }
    for attempt in range(2):
        r = requests.post(ENDPOINT, headers={
            "Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
        }, json=body, timeout=180)
        if r.status_code == 200:
            j = r.json()
            b64 = j["data"][0]["b64_json"]
            return base64.b64decode(b64)
        if 500 <= r.status_code < 600 and attempt == 0:
            time.sleep(2); continue
        raise SystemExit(f"HTTP {r.status_code}: {r.text[:400]}")

def main():
    out, prompt = sys.argv[1], sys.argv[2]
    pathlib.Path(out).parent.mkdir(parents=True, exist_ok=True)
    png = gen(prompt)
    if out.lower().endswith(".jpg") or out.lower().endswith(".jpeg"):
        img = Image.open(io.BytesIO(png)).convert("RGB")
        img.save(out, "JPEG", quality=88)
    else:
        with open(out, "wb") as f: f.write(png)
    print(f"OK {out} ({len(png)} bytes)", flush=True)

if __name__ == "__main__":
    main()
