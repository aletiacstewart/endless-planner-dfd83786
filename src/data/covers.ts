import emperorMoth from "@/assets/covers/emperor-moth.png";
import sparrowLotus from "@/assets/covers/sparrow-lotus.png";
import sparrowDandelion from "@/assets/covers/sparrow-dandelion.png";
import sparrowForgetMeNots from "@/assets/covers/sparrow-forget-me-nots.png";
import sparrowWishes from "@/assets/covers/sparrow-wishes.png";
import vintageScrapbook from "@/assets/covers/vintage-scrapbook.png";
import moonlitButterflies from "@/assets/covers/moonlit-butterflies.png";
import sparrowOnMoon from "@/assets/covers/sparrow-on-moon.jpg";
import sparrowMoonLanterns from "@/assets/covers/sparrow-moon-lanterns.jpg";
import midnightSwallowtail from "@/assets/covers/midnight-swallowtail.jpg";
import emberHummingbird from "@/assets/covers/ember-hummingbird.jpg";
import goldenDragonfly from "@/assets/covers/golden-dragonfly.jpg";
import gardenHummingbirdsOlive from "@/assets/covers/garden-hummingbirds-olive.png";
import gardenWhiteButterfly from "@/assets/covers/garden-white-butterfly.png";
import gardenSunDragonfly from "@/assets/covers/garden-sun-dragonfly.png";
import gardenTeardropLily from "@/assets/covers/garden-teardrop-lily.png";
import gardenCoralHummingbirds from "@/assets/covers/garden-coral-hummingbirds.png";
import gardenLavenderDragonflies from "@/assets/covers/garden-lavender-dragonflies.png";

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
  { id: "celestial-birds-insects", label: "Celestial Wings" },
  { id: "black-moon", label: "Black Moon" },
  { id: "sparrow", label: "Sparrow Series" },
  { id: "scrapbook", label: "Scrapbook" },
  { id: "celestial-florals", label: "Celestial Florals" },
  { id: "garden", label: "Garden" },
  { id: "sky-wings-arrows", label: "Sky & Arrows" },
  { id: "affirmations", label: "Affirmations" },
  { id: "faith", label: "Faith" },
  { id: "chronicles", label: "Chronicles" },
  { id: "classic", label: "Classic" },
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

// --- Palette presets ----------------------------------------------------------

const paletteJewelDark: CoverPalette = {
  mode: "dark",
  background: "215 35% 8%",
  foreground: "40 30% 92%",
  card: "215 30% 12%",
  cardForeground: "40 30% 92%",
  primary: "180 55% 55%",
  primaryForeground: "215 35% 8%",
  primarySoft: "215 25% 18%",
  accent: "30 80% 60%",
  accentForeground: "215 35% 8%",
  muted: "215 20% 16%",
  mutedForeground: "40 15% 65%",
  border: "215 20% 20%",
  paperGradient: "linear-gradient(180deg, hsl(215 35% 10%), hsl(215 35% 7%))",
};

const paletteSparrowLotus: CoverPalette = {
  mode: "light",
  background: "150 25% 95%",
  foreground: "180 25% 18%",
  card: "150 30% 98%",
  cardForeground: "180 25% 18%",
  primary: "190 55% 45%",
  primaryForeground: "150 30% 98%",
  primarySoft: "190 35% 88%",
  accent: "320 45% 65%",
  accentForeground: "150 30% 98%",
  muted: "150 15% 90%",
  mutedForeground: "180 12% 42%",
  border: "150 15% 84%",
  paperGradient: "linear-gradient(180deg, hsl(150 30% 97%), hsl(160 25% 92%))",
};

const paletteSparrowDandelion: CoverPalette = {
  mode: "light",
  background: "45 40% 95%",
  foreground: "30 25% 22%",
  card: "45 50% 98%",
  cardForeground: "30 25% 22%",
  primary: "85 35% 45%",
  primaryForeground: "45 50% 98%",
  primarySoft: "85 30% 88%",
  accent: "20 65% 60%",
  accentForeground: "45 50% 98%",
  muted: "45 25% 90%",
  mutedForeground: "30 12% 45%",
  border: "45 20% 84%",
  paperGradient: "linear-gradient(180deg, hsl(45 50% 97%), hsl(50 35% 90%))",
};

const paletteSparrowForgetMeNots: CoverPalette = {
  mode: "light",
  background: "210 40% 96%",
  foreground: "215 30% 22%",
  card: "210 50% 99%",
  cardForeground: "215 30% 22%",
  primary: "210 65% 55%",
  primaryForeground: "210 50% 99%",
  primarySoft: "210 45% 90%",
  accent: "25 55% 60%",
  accentForeground: "210 50% 99%",
  muted: "210 25% 92%",
  mutedForeground: "215 12% 45%",
  border: "210 20% 86%",
  paperGradient: "linear-gradient(180deg, hsl(210 50% 98%), hsl(210 35% 92%))",
};

const paletteSparrowWishes: CoverPalette = {
  mode: "light",
  background: "30 25% 94%",
  foreground: "215 20% 25%",
  card: "30 35% 98%",
  cardForeground: "215 20% 25%",
  primary: "215 35% 50%",
  primaryForeground: "30 35% 98%",
  primarySoft: "215 25% 88%",
  accent: "320 35% 65%",
  accentForeground: "30 35% 98%",
  muted: "30 18% 90%",
  mutedForeground: "215 10% 45%",
  border: "30 15% 84%",
  paperGradient: "linear-gradient(180deg, hsl(30 35% 96%), hsl(30 22% 90%))",
};

const paletteVintageScrapbook: CoverPalette = {
  mode: "light",
  background: "30 30% 94%",
  foreground: "30 20% 22%",
  card: "30 40% 98%",
  cardForeground: "30 20% 22%",
  primary: "20 45% 55%",
  primaryForeground: "30 40% 98%",
  primarySoft: "20 35% 90%",
  accent: "150 25% 50%",
  accentForeground: "30 40% 98%",
  muted: "30 20% 90%",
  mutedForeground: "30 12% 45%",
  border: "30 18% 84%",
  paperGradient: "linear-gradient(180deg, hsl(30 40% 96%), hsl(30 28% 90%))",
};

const paletteMoonlitButterflies: CoverPalette = {
  mode: "dark",
  background: "260 25% 8%",
  foreground: "40 35% 92%",
  card: "260 22% 13%",
  cardForeground: "40 35% 92%",
  primary: "190 60% 60%",
  primaryForeground: "260 25% 8%",
  primarySoft: "260 18% 18%",
  accent: "320 45% 70%",
  accentForeground: "260 25% 8%",
  muted: "260 15% 16%",
  mutedForeground: "40 15% 65%",
  border: "260 15% 22%",
  paperGradient: "linear-gradient(180deg, hsl(260 25% 10%), hsl(260 30% 6%))",
};

// --- Cover catalog ------------------------------------------------------------
// Currently includes the 7 covers actually uploaded. Add more entries here as
// additional cover images are dropped into src/assets/covers/.

export const COVERS: Cover[] = [
  {
    id: "emperor-moth",
    name: "Emperor Moth in Wildflowers",
    collection: "celestial-birds-insects",
    image: emperorMoth,
    palette: paletteJewelDark,
  },
  {
    id: "moonlit-butterflies",
    name: "Moonlit Butterflies & Lotus",
    collection: "black-moon",
    image: moonlitButterflies,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "sparrow-forget-me-nots",
    name: "Sparrow & Forget-Me-Nots",
    collection: "sparrow",
    image: sparrowForgetMeNots,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "sparrow-dandelion",
    name: "Sparrow in Dandelion Meadow",
    collection: "sparrow",
    image: sparrowDandelion,
    palette: paletteSparrowDandelion,
  },
  {
    id: "sparrow-lotus",
    name: "Sparrow on Lotus",
    collection: "sparrow",
    image: sparrowLotus,
    palette: paletteSparrowLotus,
  },
  {
    id: "sparrow-wishes",
    name: "Sparrow & Wishes",
    collection: "sparrow",
    image: sparrowWishes,
    palette: paletteSparrowWishes,
  },
  {
    id: "vintage-scrapbook",
    name: "Vintage Scrapbook",
    collection: "scrapbook",
    image: vintageScrapbook,
    personalized: true,
    palette: paletteVintageScrapbook,
  },
];

export const DEFAULT_COVER_ID = "sparrow-forget-me-nots";

export function getCover(id: string | null | undefined): Cover {
  return COVERS.find((c) => c.id === id) ?? COVERS.find((c) => c.id === DEFAULT_COVER_ID)!;
}

export function getCoversByCollection(collection: CoverCollection | "all"): Cover[] {
  if (collection === "all") return COVERS;
  return COVERS.filter((c) => c.collection === collection);
}
