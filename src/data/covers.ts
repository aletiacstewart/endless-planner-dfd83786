/**
 * Each cover declares a self-contained palette in HSL "H S% L%" format.
 * When a cover is selected, useTheme writes these values to the
 * --background / --foreground / etc. CSS variables on :root.
 */
export type CoverMode = "light" | "dark";

export type CoverPalette = {
  mode: CoverMode;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  primarySoft: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  paperGradient: string; // CSS gradient string for --gradient-paper
};

export type CoverCollection =
  | "celestial-florals"
  | "celestial-birds-insects"
  | "black-moon"
  | "garden"
  | "sky-wings-arrows"
  | "sparrow"
  | "affirmations"
  | "faith"
  | "chronicles"
  | "scrapbook"
  | "classic"
  | "change-of-life"
  | "pop-art";

export const COLLECTIONS: { id: CoverCollection; label: string }[] = [
  { id: "classic", label: "Patriotic" },
  { id: "black-moon", label: "Black Moon" },
  { id: "celestial-birds-insects", label: "Celestial Wings" },
  { id: "garden", label: "Garden" },
  { id: "sparrow", label: "Sparrow Series" },
  { id: "celestial-florals", label: "Celestial Florals" },
  { id: "sky-wings-arrows", label: "Sky & Arrows" },
  { id: "scrapbook", label: "Scrapbook" },
  { id: "affirmations", label: "Affirmations" },
  { id: "faith", label: "Faith" },
  { id: "chronicles", label: "Chronicles" },
  { id: "change-of-life", label: "Change of Life" },
  { id: "pop-art", label: "Pop Art" },
];

export type Cover = {
  id: string;
  name: string;
  collection: CoverCollection;
  image: string;
  /** When true, the user's planner name is rendered onto the cover via canvas. */
  personalized?: boolean;
  /** Optional companion cover id (e.g. light/dark pair). */
  pairWith?: string;
  palette: CoverPalette;
};

import patrioticRoses from "@/assets/covers/patriotic-roses.png.asset.json";
import patrioticBlueRose from "@/assets/covers/patriotic-blue-rose.png.asset.json";
import texasHornedLizard from "@/assets/covers/texas-horned-lizard.png.asset.json";
import starlitCactus from "@/assets/covers/starlit-cactus.png.asset.json";
import pecanTreeMoon from "@/assets/covers/pecan-tree-moon.png.asset.json";
import goldenWheatMoon from "@/assets/covers/golden-wheat-moon.png.asset.json";
import bluebonnetMoon from "@/assets/covers/bluebonnet-moon.png.asset.json";
import monarchMoon from "@/assets/covers/monarch-moon.png.asset.json";
import longhornStar from "@/assets/covers/longhorn-star.png.asset.json";
import mockingbirdMoon from "@/assets/covers/mockingbird-moon.png.asset.json";
import patrioticWhiteRose from "@/assets/covers/patriotic-white-rose.png.asset.json";
import liveOakLights from "@/assets/covers/live-oak-lights.png.asset.json";
import wellnessRoots from "@/assets/covers/wellness-roots.png.asset.json";
import wellnessRiver from "@/assets/covers/wellness-river.png.asset.json";
import wellnessBloom from "@/assets/covers/wellness-bloom.png.asset.json";
import wellnessStillWater from "@/assets/covers/wellness-still-water.png.asset.json";
import goodShepherd from "@/assets/covers/good-shepherd.png.asset.json";
import threeCrosses from "@/assets/covers/three-crosses.png.asset.json";
import gatesOfHeaven from "@/assets/covers/gates-of-heaven.png.asset.json";
import dreamscape from "@/assets/covers/dreamscape.png.asset.json";
import sunMoonStorm from "@/assets/covers/sun-moon-storm.png.asset.json";
import ivoryRibbons from "@/assets/covers/ivory-ribbons.png.asset.json";
import midnightRibbons from "@/assets/covers/midnight-ribbons.png.asset.json";
import luminousHummingbird from "@/assets/covers/luminous-hummingbird.png.asset.json";
import luminousDragonfly from "@/assets/covers/luminous-dragonfly.png.asset.json";
import blackDahliaMoon from "@/assets/covers/black-dahlia-moon.png.asset.json";
import blackRoseMoon from "@/assets/covers/black-rose-moon.png.asset.json";
import midnightIrisMoon from "@/assets/covers/midnight-iris-moon.png.asset.json";
import blackLilyMoon from "@/assets/covers/black-lily-moon.png.asset.json";
import swallowtailMoon from "@/assets/covers/swallowtail-moon.png.asset.json";
import gildedRose from "@/assets/covers/gilded-rose.png.asset.json";

// ---- Palettes ----

// Patriotic red rose on the American flag — warm cream paper, deep red ink, navy accent.
const palettePatrioticRed: CoverPalette = {
  mode: "light",
  background: "40 30% 96%",
  foreground: "220 40% 15%",
  card: "40 40% 99%",
  cardForeground: "220 40% 15%",
  primary: "356 70% 42%",
  primaryForeground: "40 40% 99%",
  primarySoft: "356 45% 92%",
  accent: "220 55% 30%",
  accentForeground: "40 40% 99%",
  muted: "40 20% 92%",
  mutedForeground: "220 15% 40%",
  border: "40 20% 84%",
  paperGradient: "linear-gradient(180deg, hsl(40 40% 98%), hsl(40 25% 92%))",
};

// Patriotic blue rose — cool star-lit cream, deep navy ink, red accent.
const palettePatrioticBlue: CoverPalette = {
  mode: "light",
  background: "215 35% 96%",
  foreground: "220 55% 18%",
  card: "215 40% 99%",
  cardForeground: "220 55% 18%",
  primary: "215 65% 38%",
  primaryForeground: "215 40% 99%",
  primarySoft: "215 45% 92%",
  accent: "356 65% 45%",
  accentForeground: "215 40% 99%",
  muted: "215 20% 92%",
  mutedForeground: "220 20% 40%",
  border: "215 20% 84%",
  paperGradient: "linear-gradient(180deg, hsl(215 40% 98%), hsl(215 25% 92%))",
};

// Celestial "moon" family — near-black night sky, warm gold accent, off-white ink.
const paletteCelestialGold: CoverPalette = {
  mode: "dark",
  background: "230 25% 8%",
  foreground: "42 55% 92%",
  card: "230 22% 12%",
  cardForeground: "42 55% 92%",
  primary: "42 75% 60%",
  primaryForeground: "230 30% 10%",
  primarySoft: "42 40% 22%",
  accent: "42 90% 65%",
  accentForeground: "230 30% 10%",
  muted: "230 18% 16%",
  mutedForeground: "42 25% 70%",
  border: "230 18% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(42 60% 20% / 0.4), transparent 60%), linear-gradient(180deg, hsl(230 25% 9%), hsl(230 25% 6%))",
};

// Monarch moon — same night sky, hotter orange accent.
const paletteMonarch: CoverPalette = {
  mode: "dark",
  background: "230 25% 8%",
  foreground: "30 55% 92%",
  card: "230 22% 12%",
  cardForeground: "30 55% 92%",
  primary: "22 85% 55%",
  primaryForeground: "230 30% 10%",
  primarySoft: "22 45% 22%",
  accent: "42 90% 62%",
  accentForeground: "230 30% 10%",
  muted: "230 18% 16%",
  mutedForeground: "30 25% 72%",
  border: "230 18% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(22 60% 22% / 0.5), transparent 60%), linear-gradient(180deg, hsl(230 25% 9%), hsl(230 25% 6%))",
};

// Bluebonnet moon — night sky with cobalt-blue primary.
const paletteBluebonnet: CoverPalette = {
  mode: "dark",
  background: "230 30% 8%",
  foreground: "220 40% 92%",
  card: "230 26% 12%",
  cardForeground: "220 40% 92%",
  primary: "225 75% 58%",
  primaryForeground: "230 30% 10%",
  primarySoft: "225 40% 22%",
  accent: "42 85% 60%",
  accentForeground: "230 30% 10%",
  muted: "230 18% 16%",
  mutedForeground: "220 20% 72%",
  border: "230 18% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(225 55% 24% / 0.5), transparent 60%), linear-gradient(180deg, hsl(230 30% 9%), hsl(230 30% 6%))",
};

// Starlit cactus — night sky with teal-green primary + gold moon accent.
const paletteCactus: CoverPalette = {
  mode: "dark",
  background: "220 25% 9%",
  foreground: "160 25% 90%",
  card: "220 22% 13%",
  cardForeground: "160 25% 90%",
  primary: "170 45% 45%",
  primaryForeground: "220 30% 10%",
  primarySoft: "170 30% 20%",
  accent: "42 85% 62%",
  accentForeground: "220 30% 10%",
  muted: "220 18% 16%",
  mutedForeground: "160 15% 68%",
  border: "220 18% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(42 55% 22% / 0.4), transparent 60%), linear-gradient(180deg, hsl(220 25% 10%), hsl(220 25% 6%))",
};

// Texas horned lizard — starlit night with warm sand + Texas red/blue accents.
const paletteLizard: CoverPalette = {
  mode: "dark",
  background: "225 22% 9%",
  foreground: "36 40% 90%",
  card: "225 20% 13%",
  cardForeground: "36 40% 90%",
  primary: "32 55% 55%",
  primaryForeground: "225 30% 10%",
  primarySoft: "32 35% 22%",
  accent: "356 65% 50%",
  accentForeground: "225 30% 10%",
  muted: "225 15% 16%",
  mutedForeground: "36 20% 70%",
  border: "225 15% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(32 50% 22% / 0.45), transparent 60%), linear-gradient(180deg, hsl(225 22% 10%), hsl(225 22% 6%))",
};

// Longhorn star — night with rich rust-brown primary + star gold accent.
const paletteLonghorn: CoverPalette = {
  mode: "dark",
  background: "225 22% 9%",
  foreground: "36 45% 92%",
  card: "225 20% 13%",
  cardForeground: "36 45% 92%",
  primary: "18 60% 45%",
  primaryForeground: "36 45% 96%",
  primarySoft: "18 40% 22%",
  accent: "45 90% 62%",
  accentForeground: "225 30% 10%",
  muted: "225 15% 16%",
  mutedForeground: "36 22% 72%",
  border: "225 15% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(18 55% 22% / 0.5), transparent 60%), linear-gradient(180deg, hsl(225 22% 10%), hsl(225 22% 6%))",
};

// Watercolor wellness — soft sage, cream paper, dusty blue accent.
const paletteWellness: CoverPalette = {
  mode: "light",
  background: "48 25% 95%",
  foreground: "200 25% 20%",
  card: "48 30% 98%",
  cardForeground: "200 25% 20%",
  primary: "150 22% 42%",
  primaryForeground: "48 30% 98%",
  primarySoft: "150 20% 88%",
  accent: "205 35% 50%",
  accentForeground: "48 30% 98%",
  muted: "48 18% 90%",
  mutedForeground: "200 15% 42%",
  border: "48 15% 82%",
  paperGradient: "linear-gradient(180deg, hsl(48 30% 97%), hsl(150 15% 90%))",
};

// Faith — warm gold on deep sky, reverent + luminous.
const paletteFaith: CoverPalette = {
  mode: "dark",
  background: "222 40% 10%",
  foreground: "42 55% 94%",
  card: "222 32% 14%",
  cardForeground: "42 55% 94%",
  primary: "42 80% 58%",
  primaryForeground: "222 40% 10%",
  primarySoft: "42 40% 22%",
  accent: "38 90% 68%",
  accentForeground: "222 40% 10%",
  muted: "222 22% 18%",
  mutedForeground: "42 25% 72%",
  border: "222 22% 24%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(38 70% 26% / 0.5), transparent 60%), linear-gradient(180deg, hsl(222 40% 11%), hsl(222 40% 7%))",
};

// Dreamscape — surreal twilight, plum + peach + cyan.
const paletteDreamscape: CoverPalette = {
  mode: "dark",
  background: "245 30% 10%",
  foreground: "35 45% 92%",
  card: "245 28% 14%",
  cardForeground: "35 45% 92%",
  primary: "22 75% 62%",
  primaryForeground: "245 30% 10%",
  primarySoft: "22 40% 22%",
  accent: "195 70% 60%",
  accentForeground: "245 30% 10%",
  muted: "245 22% 18%",
  mutedForeground: "35 20% 70%",
  border: "245 22% 24%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(280 45% 22% / 0.55), transparent 60%), linear-gradient(180deg, hsl(245 32% 11%), hsl(245 32% 7%))",
};

// Sun / Moon / Storm — split celestial, warm sunrise + cool storm.
const paletteSunMoonStorm: CoverPalette = {
  mode: "light",
  background: "40 45% 96%",
  foreground: "230 40% 18%",
  card: "40 50% 99%",
  cardForeground: "230 40% 18%",
  primary: "32 85% 55%",
  primaryForeground: "40 50% 99%",
  primarySoft: "32 55% 90%",
  accent: "220 60% 45%",
  accentForeground: "40 50% 99%",
  muted: "40 22% 92%",
  mutedForeground: "230 18% 40%",
  border: "40 22% 84%",
  paperGradient:
    "linear-gradient(135deg, hsl(40 55% 96%), hsl(220 45% 92%))",
};

// Ivory Ribbons — soft cream paper with warm champagne accent.
const paletteIvory: CoverPalette = {
  mode: "light",
  background: "36 35% 96%",
  foreground: "28 30% 22%",
  card: "36 45% 99%",
  cardForeground: "28 30% 22%",
  primary: "32 45% 55%",
  primaryForeground: "36 45% 99%",
  primarySoft: "32 35% 92%",
  accent: "28 55% 60%",
  accentForeground: "36 45% 99%",
  muted: "36 20% 92%",
  mutedForeground: "28 15% 42%",
  border: "36 20% 84%",
  paperGradient: "linear-gradient(180deg, hsl(36 45% 98%), hsl(32 25% 92%))",
};

// Gilded Rose / Midnight Ribbons — deep black paper with gold accents.
const paletteGilded: CoverPalette = {
  mode: "dark",
  background: "40 15% 7%",
  foreground: "42 45% 92%",
  card: "40 12% 11%",
  cardForeground: "42 45% 92%",
  primary: "42 70% 55%",
  primaryForeground: "40 15% 8%",
  primarySoft: "42 40% 20%",
  accent: "36 80% 60%",
  accentForeground: "40 15% 8%",
  muted: "40 10% 15%",
  mutedForeground: "42 20% 70%",
  border: "40 10% 22%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(42 60% 22% / 0.4), transparent 60%), linear-gradient(180deg, hsl(40 15% 8%), hsl(40 15% 5%))",
};



export const COVERS: Cover[] = [
  {
    id: "patriotic-roses",
    name: "Patriotic Roses",
    collection: "classic",
    image: patrioticRoses.url,
    palette: palettePatrioticRed,
  },
  {
    id: "patriotic-blue-rose",
    name: "Patriotic Blue Rose",
    collection: "classic",
    image: patrioticBlueRose.url,
    palette: palettePatrioticBlue,
  },
  {
    id: "texas-horned-lizard",
    name: "Texas Horned Lizard",
    collection: "celestial-birds-insects",
    image: texasHornedLizard.url,
    palette: paletteLizard,
  },
  {
    id: "starlit-cactus",
    name: "Starlit Cactus",
    collection: "garden",
    image: starlitCactus.url,
    palette: paletteCactus,
  },
  {
    id: "pecan-tree-moon",
    name: "Pecan Tree Moon",
    collection: "black-moon",
    image: pecanTreeMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "golden-wheat-moon",
    name: "Golden Wheat Moon",
    collection: "black-moon",
    image: goldenWheatMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "bluebonnet-moon",
    name: "Bluebonnet Moon",
    collection: "black-moon",
    image: bluebonnetMoon.url,
    palette: paletteBluebonnet,
  },
  {
    id: "monarch-moon",
    name: "Monarch Moon",
    collection: "celestial-birds-insects",
    image: monarchMoon.url,
    palette: paletteMonarch,
  },
  {
    id: "longhorn-star",
    name: "Longhorn Star",
    collection: "black-moon",
    image: longhornStar.url,
    palette: paletteLonghorn,
  },
  {
    id: "mockingbird-moon",
    name: "Mockingbird Moon",
    collection: "sparrow",
    image: mockingbirdMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "patriotic-white-rose",
    name: "Patriotic White Rose",
    collection: "classic",
    image: patrioticWhiteRose.url,
    palette: palettePatrioticBlue,
  },
  {
    id: "live-oak-lights",
    name: "Live Oak Lights",
    collection: "black-moon",
    image: liveOakLights.url,
    palette: paletteCelestialGold,
  },
  {
    id: "wellness-roots",
    name: "Wellness — Roots",
    collection: "change-of-life",
    image: wellnessRoots.url,
    palette: paletteWellness,
  },
  {
    id: "wellness-river",
    name: "Wellness — River",
    collection: "change-of-life",
    image: wellnessRiver.url,
    palette: paletteWellness,
  },
  {
    id: "wellness-bloom",
    name: "Wellness — Bloom",
    collection: "change-of-life",
    image: wellnessBloom.url,
    palette: paletteWellness,
  },
  {
    id: "wellness-still-water",
    name: "Wellness — Still Water",
    collection: "change-of-life",
    image: wellnessStillWater.url,
    palette: paletteWellness,
  },
  {
    id: "good-shepherd",
    name: "Good Shepherd",
    collection: "faith",
    image: goodShepherd.url,
    palette: paletteFaith,
  },
  {
    id: "three-crosses",
    name: "Three Crosses",
    collection: "faith",
    image: threeCrosses.url,
    palette: paletteFaith,
  },
  {
    id: "gates-of-heaven",
    name: "Gates of Heaven",
    collection: "faith",
    image: gatesOfHeaven.url,
    palette: paletteFaith,
  },
  {
    id: "dreamscape",
    name: "Dreamscape",
    collection: "chronicles",
    image: dreamscape.url,
    palette: paletteDreamscape,
  },
  {
    id: "sun-moon-storm",
    name: "Sun, Moon & Storm",
    collection: "celestial-florals",
    image: sunMoonStorm.url,
    palette: paletteSunMoonStorm,
  },
  {
    id: "ivory-ribbons",
    name: "Ivory Ribbons",
    collection: "celestial-florals",
    image: ivoryRibbons.url,
    palette: paletteIvory,
  },
  {
    id: "midnight-ribbons",
    name: "Midnight Ribbons",
    collection: "scrapbook",
    image: midnightRibbons.url,
    palette: paletteGilded,
  },
  {
    id: "luminous-hummingbird",
    name: "Luminous Hummingbird",
    collection: "celestial-birds-insects",
    image: luminousHummingbird.url,
    palette: paletteCelestialGold,
  },
  {
    id: "luminous-dragonfly",
    name: "Luminous Dragonfly",
    collection: "celestial-birds-insects",
    image: luminousDragonfly.url,
    palette: paletteCelestialGold,
  },
  {
    id: "black-dahlia-moon",
    name: "Black Dahlia Moon",
    collection: "black-moon",
    image: blackDahliaMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "black-rose-moon",
    name: "Black Rose Moon",
    collection: "black-moon",
    image: blackRoseMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "midnight-iris-moon",
    name: "Midnight Iris Moon",
    collection: "black-moon",
    image: midnightIrisMoon.url,
    palette: paletteBluebonnet,
  },
  {
    id: "black-lily-moon",
    name: "Black Lily Moon",
    collection: "black-moon",
    image: blackLilyMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "swallowtail-moon",
    name: "Swallowtail Moon",
    collection: "celestial-birds-insects",
    image: swallowtailMoon.url,
    palette: paletteCelestialGold,
  },
  {
    id: "gilded-rose",
    name: "Gilded Rose",
    collection: "scrapbook",
    image: gildedRose.url,
    palette: paletteGilded,
  },
];

export const DEFAULT_COVER_ID = "patriotic-roses";

export function getCover(id: string | null | undefined): Cover {
  return (
    COVERS.find((c) => c.id === id) ??
    COVERS.find((c) => c.id === DEFAULT_COVER_ID) ??
    COVERS[0]
  );
}

export function getCoversByCollection(collection: CoverCollection | "all"): Cover[] {
  if (collection === "all") return COVERS;
  return COVERS.filter((c) => c.collection === collection);
}
