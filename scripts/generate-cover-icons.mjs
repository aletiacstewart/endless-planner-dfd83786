#!/usr/bin/env node
/**
 * Cover-icon + sticker generation runner.
 *
 * Reads .icons-progress.json to skip completed work, iterates the queue, and
 * shells out to /tmp/lovable_ai.py (from the ai-gateway skill) once per image.
 *
 * Usage:
 *   node scripts/generate-cover-icons.mjs stickers <collection> [--limit N]
 *   node scripts/generate-cover-icons.mjs icons <coverId> [--limit N]
 *   node scripts/generate-cover-icons.mjs status
 *
 * Each successful generation is committed to disk immediately and recorded in
 * the checkpoint file, so a killed run resumes cleanly.
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PROGRESS_FILE = join(ROOT, ".icons-progress.json");
const AI_SCRIPT = "/tmp/lovable_ai.py";
const MODEL = "google/gemini-3.1-flash-image";

// Register the ai-gateway helper if missing.
if (!existsSync(AI_SCRIPT)) {
  try {
    execFileSync("cp", ["/tmp/knowledge/skill/ai-gateway/scripts/lovable_ai.py", AI_SCRIPT], { stdio: "inherit" });
  } catch (e) {
    console.error("Failed to stage lovable_ai.py — is the ai-gateway skill available?");
    process.exit(1);
  }
}

// Dynamic import of the prompt library (TS via tsx or ts-node isn't required
// here — we duplicate the small helpers we need to keep this file zero-dep).
const promptsSrc = readFileSync(join(__dirname, "icons/prompts.ts"), "utf8");

// Extract PAGE_SUBJECTS keys (page ids) from the TS source.
const PAGE_IDS = [
  "my-goals", "yearly-calendar", "monthly-calendar", "weekly-calendar",
  "daily-tracker", "complete-tracker", "yearly-habit-tracker", "weight-tracker",
  "measurement-tracker", "blood-sugar-tracker", "blood-pressure-tracker",
  "oxygen-tracker", "self-care-checklist", "cleaning-checklist", "recipe",
  "notes", "workout-tracker", "medications", "medical-records", "yearly-focus",
];

const CATEGORIES = ["motifs", "banners", "washi", "icons"];
const PIECES_PER_CATEGORY = 15;

function loadProgress() {
  if (!existsSync(PROGRESS_FILE)) return { icons: {}, stickers: {} };
  return JSON.parse(readFileSync(PROGRESS_FILE, "utf8"));
}
function saveProgress(p) { writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2)); }

// Build prompts by requiring a tiny sibling helper that re-exports the same
// strings the TS file exports (JS mirror below).
async function buildPrompts() {
  const mod = await import("./icons/prompts.mjs");
  return mod;
}

async function runOne(prompt, outPath) {
  mkdirSync(dirname(outPath), { recursive: true });
  execFileSync("python3", [AI_SCRIPT, prompt, "--image", "--model", MODEL, "--output", outPath], {
    stdio: "inherit",
  });
}

async function genStickers(collection, limit = Infinity) {
  const { buildStickerPrompt } = await buildPrompts();
  const progress = loadProgress();
  progress.stickers[collection] ??= [];
  const done = new Set(progress.stickers[collection]);
  let made = 0;
  outer: for (const cat of CATEGORIES) {
    for (let i = 0; i < PIECES_PER_CATEGORY; i++) {
      const key = `${cat}-${i}`;
      if (done.has(key)) continue;
      if (made >= limit) break outer;
      const out = join(ROOT, `src/assets/stickers/${collection}/${cat}-${i}.png`);
      const prompt = buildStickerPrompt(collection, cat, i);
      console.log(`[stickers] ${collection}/${key}`);
      try {
        await runOne(prompt, out);
        progress.stickers[collection].push(key);
        saveProgress(progress);
        made++;
      } catch (e) {
        console.error("  failed, skipping:", e.message);
      }
    }
  }
  console.log(`Generated ${made} stickers for ${collection}.`);
}

async function genIcons(coverId, collection, limit = Infinity) {
  const { buildIconPrompt } = await buildPrompts();
  const progress = loadProgress();
  progress.icons[coverId] ??= [];
  const done = new Set(progress.icons[coverId]);
  let made = 0;
  for (const pid of PAGE_IDS) {
    if (done.has(pid)) continue;
    if (made >= limit) break;
    const out = join(ROOT, `src/assets/page-icons/${coverId}/${pid}.jpg`);
    const prompt = buildIconPrompt(coverId, collection, pid);
    console.log(`[icons] ${coverId}/${pid}`);
    try {
      await runOne(prompt, out);
      progress.icons[coverId].push(pid);
      saveProgress(progress);
      made++;
    } catch (e) {
      console.error("  failed, skipping:", e.message);
    }
  }
  console.log(`Generated ${made} icons for ${coverId}.`);
}

function status() {
  const p = loadProgress();
  console.log("STICKER SETS:");
  for (const c of Object.keys(p.stickers)) {
    console.log(`  ${c}: ${p.stickers[c].length}/60`);
  }
  console.log("ICON PACKS:");
  for (const c of Object.keys(p.icons)) {
    console.log(`  ${c}: ${p.icons[c].length}/20`);
  }
}

const [mode, target, ...rest] = process.argv.slice(2);
const limitArg = rest.indexOf("--limit");
const limit = limitArg >= 0 ? parseInt(rest[limitArg + 1], 10) : Infinity;
const collectionArg = rest.indexOf("--collection");
const collection = collectionArg >= 0 ? rest[collectionArg + 1] : null;

if (mode === "stickers") await genStickers(target, limit);
else if (mode === "icons") {
  if (!collection) { console.error("--collection <id> required for icons"); process.exit(1); }
  await genIcons(target, collection, limit);
} else if (mode === "status") status();
else {
  console.log("usage:");
  console.log("  node scripts/generate-cover-icons.mjs stickers <collection> [--limit N]");
  console.log("  node scripts/generate-cover-icons.mjs icons <coverId> --collection <collection> [--limit N]");
  console.log("  node scripts/generate-cover-icons.mjs status");
}
