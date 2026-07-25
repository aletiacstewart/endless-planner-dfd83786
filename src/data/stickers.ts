// Themed sticker library — one 60-piece set per cover collection.
//
// The registry ships with high-quality themed *emoji* stickers so the library
// is fully functional today. When themed PNG stickers are generated per cover,
// swap the entries from `{ kind: "emoji", src: "🌿" }` to `{ kind: "img",
// src: "/__l5e/assets-v1/…/leaf.png" }` — no other code changes are needed.
//
// Each set is grouped into 4 categories that match Bloom's structure:
//   • motifs   – hero decorative shapes for the theme
//   • banners  – ribbon / tag / label style stickers (still emoji as glyphs)
//   • washi    – repeating pattern / tape-like accents
//   • icons    – small utility icons tinted to the theme
//
// Consumers should pick by cover.collection. If a specific set isn't defined
// for a collection, we fall back to `defaultStickerSet`.

import type { CoverCollection } from "@/data/covers";

export type StickerCategory = "motifs" | "banners" | "washi" | "icons";

export type StickerAsset =
  | { kind: "emoji"; src: string; label?: string }
  | { kind: "img"; src: string; label?: string };

export type StickerSet = Record<StickerCategory, StickerAsset[]>;

export const STICKER_CATEGORY_LABEL: Record<StickerCategory, string> = {
  motifs: "Motifs",
  banners: "Banners",
  washi: "Washi",
  icons: "Icons",
};

const em = (src: string, label?: string): StickerAsset => ({ kind: "emoji", src, label });

// -- Default (used when a collection has no themed set yet) -------------------
export const defaultStickerSet: StickerSet = {
  motifs: [em("✨"), em("🌿"), em("🌸"), em("🌙"), em("⭐"), em("🍃"), em("🌺"), em("💫"), em("🌷"), em("🦋"), em("🌾"), em("🌼"), em("🌵"), em("🍂"), em("🕊️")],
  banners: [em("🎀"), em("🏷️"), em("📌"), em("📎"), em("🎗️"), em("🪄"), em("💌"), em("💭"), em("💬"), em("🗨️"), em("📖"), em("📓"), em("📔"), em("📒"), em("📝")],
  washi: [em("〰️"), em("➰"), em("➿"), em("♾️"), em("◆"), em("◇"), em("▪️"), em("▫️"), em("■"), em("□"), em("●"), em("○"), em("◼"), em("◻"), em("⋯")],
  icons: [em("☕"), em("🍵"), em("🕯️"), em("🧘"), em("💧"), em("🌡️"), em("⏰"), em("📅"), em("📆"), em("🔖"), em("✅"), em("❤️"), em("💛"), em("💚"), em("💙")],
};

// -- Theme sets ---------------------------------------------------------------

const gardenSet: StickerSet = {
  motifs: [em("🌸"), em("🌷"), em("🌺"), em("🌻"), em("🌼"), em("🌹"), em("🥀"), em("💐"), em("🌾"), em("🌿"), em("🍀"), em("🍃"), em("🌱"), em("🪴"), em("🦋")],
  banners: [em("🎀"), em("🏷️"), em("📌"), em("💌"), em("📖"), em("📓"), em("🪄"), em("💭"), em("📝"), em("🗒️"), em("📎"), em("🎗️"), em("💐"), em("🪻"), em("🌸")],
  washi: [em("🌿"), em("🍃"), em("〰️"), em("➰"), em("🌾"), em("🌱"), em("🍀"), em("🌼"), em("🌸"), em("🌷"), em("🌺"), em("🌹"), em("🪷"), em("🪻"), em("💮")],
  icons: [em("☀️"), em("🌦️"), em("💧"), em("🐝"), em("🐞"), em("🦋"), em("🌈"), em("🌤️"), em("🐛"), em("🦔"), em("🐇"), em("🌸"), em("🕊️"), em("📚"), em("🍵")],
};

const celestialSet: StickerSet = {
  motifs: [em("🌙"), em("🌛"), em("🌜"), em("🌚"), em("🌝"), em("⭐"), em("✨"), em("💫"), em("🌟"), em("☄️"), em("🌠"), em("🪐"), em("🌌"), em("☀️"), em("🌞")],
  banners: [em("🔮"), em("🕯️"), em("🎗️"), em("🎀"), em("💫"), em("✨"), em("💭"), em("📖"), em("📜"), em("🪄"), em("🌙"), em("⭐"), em("🌟"), em("💌"), em("📓")],
  washi: [em("✧"), em("✦"), em("✩"), em("✫"), em("✬"), em("✭"), em("✮"), em("✯"), em("⋆"), em("・"), em("˚"), em("✨"), em("💫"), em("〰️"), em("➰")],
  icons: [em("🔭"), em("🌌"), em("🌒"), em("🌓"), em("🌔"), em("🌕"), em("🌖"), em("🌗"), em("🌘"), em("🕯️"), em("🪞"), em("🔮"), em("💎"), em("🗝️"), em("🌉")],
};

const featherWingSet: StickerSet = {
  motifs: [em("🪶"), em("🕊️"), em("🦋"), em("🦅"), em("🦢"), em("🦉"), em("🦜"), em("🐦"), em("🐤"), em("🐦‍⬛"), em("🌬️"), em("💨"), em("☁️"), em("🌤️"), em("✨")],
  banners: [em("🎀"), em("🏷️"), em("🪄"), em("💌"), em("📖"), em("📜"), em("📓"), em("🕊️"), em("🪶"), em("💭"), em("📝"), em("🗒️"), em("📎"), em("🎗️"), em("✨")],
  washi: [em("✦"), em("✧"), em("・"), em("˚"), em("〰️"), em("➰"), em("➿"), em("♾️"), em("✨"), em("💨"), em("☁️"), em("🌬️"), em("🪶"), em("🕊️"), em("🌤️")],
  icons: [em("🌤️"), em("☁️"), em("🌥️"), em("🌦️"), em("🌈"), em("🍃"), em("🌾"), em("🌿"), em("💫"), em("⭐"), em("🌟"), em("🏹"), em("🎯"), em("🪄"), em("📿")],
};

const faithSet: StickerSet = {
  motifs: [em("✝️"), em("☦️"), em("🕊️"), em("🌟"), em("✨"), em("🙏"), em("📖"), em("🕯️"), em("👼"), em("💒"), em("⛪"), em("📿"), em("🪔"), em("🌅"), em("🌄")],
  banners: [em("📜"), em("📖"), em("📓"), em("🎗️"), em("🎀"), em("🪄"), em("💌"), em("💭"), em("📝"), em("🗒️"), em("🕊️"), em("🌟"), em("✝️"), em("🙏"), em("🕯️")],
  washi: [em("✧"), em("✦"), em("・"), em("˚"), em("✨"), em("🌟"), em("💫"), em("〰️"), em("➰"), em("♱"), em("†"), em("‡"), em("✞"), em("☩"), em("♰")],
  icons: [em("❤️"), em("🤍"), em("💛"), em("💒"), em("⛪"), em("📚"), em("📖"), em("🕯️"), em("🌅"), em("🌄"), em("🌇"), em("☀️"), em("🌈"), em("🌟"), em("🔔")],
};

const gothicSirenSet: StickerSet = {
  motifs: [em("🖤"), em("🦇"), em("🕸️"), em("🕷️"), em("🌑"), em("🌒"), em("🕯️"), em("⚔️"), em("🗡️"), em("🩸"), em("👁️"), em("🥀"), em("🌹"), em("🐍"), em("🌊")],
  banners: [em("🖤"), em("🏴"), em("🎗️"), em("🎀"), em("💀"), em("⚱️"), em("📜"), em("📖"), em("🪶"), em("🗝️"), em("🔮"), em("💭"), em("🥀"), em("🌹"), em("🕯️")],
  washi: [em("✧"), em("✦"), em("・"), em("˚"), em("〰️"), em("➰"), em("➿"), em("♱"), em("†"), em("✞"), em("♰"), em("◆"), em("◇"), em("♛"), em("♜")],
  icons: [em("🌘"), em("🌒"), em("🕯️"), em("🥀"), em("🌹"), em("🐍"), em("🦇"), em("🕸️"), em("🗝️"), em("🔮"), em("👁️"), em("🩸"), em("⚔️"), em("🖤"), em("🏴")],
};

const dragonSet: StickerSet = {
  motifs: [em("🐉"), em("🐲"), em("🔥"), em("⚔️"), em("🗡️"), em("🛡️"), em("👑"), em("🏰"), em("🌋"), em("💎"), em("🪙"), em("📜"), em("🗝️"), em("🕯️"), em("🌌")],
  banners: [em("🏴"), em("🎗️"), em("🎀"), em("👑"), em("📜"), em("📖"), em("🪄"), em("💌"), em("🗝️"), em("💭"), em("📝"), em("🐲"), em("🐉"), em("⚔️"), em("🛡️")],
  washi: [em("✧"), em("✦"), em("・"), em("˚"), em("🔥"), em("💥"), em("〰️"), em("➰"), em("♛"), em("♜"), em("♚"), em("◆"), em("◇"), em("†"), em("♱")],
  icons: [em("🌋"), em("🔥"), em("💎"), em("🪙"), em("👑"), em("🗝️"), em("🕯️"), em("📚"), em("📜"), em("🏰"), em("⚔️"), em("🛡️"), em("🐲"), em("🐉"), em("✨")],
};

const patrioticSet: StickerSet = {
  motifs: [em("🇺🇸"), em("🌹"), em("⭐"), em("🎆"), em("🎇"), em("🏵️"), em("🎗️"), em("🕊️"), em("🦅"), em("💙"), em("❤️"), em("🤍"), em("💫"), em("✨"), em("🌟")],
  banners: [em("🎀"), em("🏷️"), em("🎗️"), em("📜"), em("📖"), em("🪄"), em("💌"), em("💭"), em("📝"), em("🗒️"), em("🏆"), em("🎖️"), em("🏅"), em("🇺🇸"), em("⭐")],
  washi: [em("✧"), em("✦"), em("⋆"), em("・"), em("˚"), em("〰️"), em("➰"), em("💙"), em("❤️"), em("🤍"), em("⭐"), em("🌟"), em("✨"), em("💫"), em("🎆")],
  icons: [em("☀️"), em("🌵"), em("🐎"), em("🌾"), em("🦅"), em("🕊️"), em("🌹"), em("🏵️"), em("🎇"), em("🎆"), em("🇺🇸"), em("⭐"), em("🌟"), em("❤️"), em("💙")],
};

const changeOfLifeSet: StickerSet = {
  motifs: [em("🐞"), em("🦋"), em("🌸"), em("🌷"), em("🌻"), em("🌼"), em("🍃"), em("🌿"), em("🌱"), em("💐"), em("🪷"), em("💗"), em("💖"), em("🌈"), em("☀️")],
  banners: [em("🎀"), em("🏷️"), em("💌"), em("📖"), em("📓"), em("🪄"), em("💭"), em("📝"), em("🗒️"), em("📎"), em("🎗️"), em("🌸"), em("🐞"), em("🦋"), em("💐")],
  washi: [em("🌿"), em("🍃"), em("〰️"), em("➰"), em("🌾"), em("🌱"), em("🌼"), em("🌸"), em("🌷"), em("🌺"), em("🪷"), em("💮"), em("✧"), em("✦"), em("・")],
  icons: [em("🧘"), em("💧"), em("🍵"), em("☕"), em("🕯️"), em("📿"), em("📚"), em("📖"), em("💗"), em("🌈"), em("☀️"), em("🌤️"), em("🦋"), em("🐞"), em("🌸")],
};

const scrapbookSet: StickerSet = {
  motifs: [em("📎"), em("📌"), em("🖇️"), em("✂️"), em("📮"), em("💌"), em("💗"), em("💫"), em("🌸"), em("🦋"), em("🌈"), em("⭐"), em("✨"), em("🎀"), em("🏷️")],
  banners: [em("🎀"), em("🏷️"), em("📌"), em("📎"), em("💌"), em("📖"), em("📓"), em("📔"), em("📒"), em("📝"), em("🗒️"), em("🖇️"), em("🎗️"), em("💭"), em("🪄")],
  washi: [em("〰️"), em("➰"), em("➿"), em("・"), em("˚"), em("✧"), em("✦"), em("◆"), em("◇"), em("♥"), em("♡"), em("★"), em("☆"), em("✿"), em("❀")],
  icons: [em("📷"), em("📸"), em("🎞️"), em("🖼️"), em("🎨"), em("🖌️"), em("🖍️"), em("✏️"), em("🖊️"), em("🖋️"), em("📝"), em("🗒️"), em("📎"), em("🎀"), em("💗")],
};

// -- Registry -----------------------------------------------------------------

export const STICKER_SETS: Partial<Record<CoverCollection, StickerSet>> = {
  garden: gardenSet,
  "celestial-florals": { ...gardenSet, motifs: [...celestialSet.motifs.slice(0, 8), ...gardenSet.motifs.slice(0, 7)] },
  "celestial-birds-insects": { ...featherWingSet, motifs: [...celestialSet.motifs.slice(0, 8), ...featherWingSet.motifs.slice(0, 7)] },
  "black-moon": celestialSet,
  "sky-wings-arrows": featherWingSet,
  sparrow: featherWingSet,
  feathers: featherWingSet,
  faith: faithSet,
  affirmations: faithSet,
  "gothic-sirens": gothicSirenSet,
  dragons: dragonSet,
  classic: patrioticSet,
  "change-of-life": changeOfLifeSet,
  scrapbook: scrapbookSet,
  chronicles: scrapbookSet,
  "pop-art": { ...scrapbookSet, motifs: [em("💥"), em("⚡"), em("🌟"), em("✨"), em("💫"), em("🎨"), em("🖤"), em("❤️"), em("💛"), em("💙"), em("💚"), em("💜"), em("🧡"), em("🤍"), em("🌈")] },
  grit: { ...faithSet, motifs: [em("🕊️"), em("✝️"), em("🙏"), em("🌾"), em("🌿"), em("🌱"), em("🌅"), em("☀️"), em("🌤️"), em("💛"), em("🤎"), em("📖"), em("🕯️"), em("📿"), em("⭐")] },
};

export function getStickerSet(collection: CoverCollection | undefined | null): StickerSet {
  if (collection && STICKER_SETS[collection]) return STICKER_SETS[collection]!;
  return defaultStickerSet;
}

export const STICKER_CATEGORIES: StickerCategory[] = ["motifs", "banners", "washi", "icons"];
