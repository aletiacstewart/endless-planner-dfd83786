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
  | "classic";

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
