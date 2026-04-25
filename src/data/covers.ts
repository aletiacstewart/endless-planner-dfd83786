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
import blackRoseChains from "@/assets/covers/black-rose-chains.png";
import blackDahliaSparks from "@/assets/covers/black-dahlia-sparks.jpg";
import blackDahliaLights from "@/assets/covers/black-dahlia-lights.jpg";
import blackIrisStars from "@/assets/covers/black-iris-stars.jpg";
import blackIrisGlow from "@/assets/covers/black-iris-glow.jpg";
import redRoseMoon from "@/assets/covers/red-rose-moon.jpg";
import whiteRoseMoon from "@/assets/covers/white-rose-moon.jpg";
import blackLiliesSparks from "@/assets/covers/black-lilies-sparks.jpg";
import moonlitOak from "@/assets/covers/moonlit-oak.jpg";
import sparrowMoonFairyLights from "@/assets/covers/sparrow-moon-fairy-lights.jpg";
import gardenBlueButterflyOrchid from "@/assets/covers/garden-blue-butterfly-orchid.png";
import gardenHummingbirdMimosa from "@/assets/covers/garden-hummingbird-mimosa.png";
import gardenAdmiralOrchid from "@/assets/covers/garden-admiral-orchid.png";
import gardenDragonflyGrasses from "@/assets/covers/garden-dragonfly-grasses.png";
import gardenPinkRoseDew from "@/assets/covers/garden-pink-rose-dew.png";
import harvestMoonDahlia from "@/assets/covers/harvest-moon-dahlia.png";
import harvestMoonRose from "@/assets/covers/harvest-moon-rose.png";
import harvestMoonIris from "@/assets/covers/harvest-moon-iris.png";
import harvestMoonLilies from "@/assets/covers/harvest-moon-lilies.png";
import harvestMoonButterfly from "@/assets/covers/harvest-moon-butterfly.png";
import gardenForgetMeNotsLadybugs from "@/assets/covers/garden-forget-me-nots-ladybugs.png";
import dandelionLadybugsNight from "@/assets/covers/dandelion-ladybugs-night.png";
import classicWarmLeather from "@/assets/covers/classic-warm-leather.png";
import classicIvoryRibbons from "@/assets/covers/classic-ivory-ribbons.png";
import crystalVinesAmber from "@/assets/covers/crystal-vines-amber.png";
import crystalVinesBlush from "@/assets/covers/crystal-vines-blush.png";
import affirmationFragileNotBroken from "@/assets/covers/affirmation-fragile-not-broken.png";
import affirmationFloatsHope from "@/assets/covers/affirmation-floats-hope.png";
import featherArrowCrimson from "@/assets/covers/feather-arrow-crimson.png";
import featherArrowAmber from "@/assets/covers/feather-arrow-amber.png";
import featherArrowGold from "@/assets/covers/feather-arrow-gold.png";
import featherArrowEmerald from "@/assets/covers/feather-arrow-emerald.png";
import featherArrowAzure from "@/assets/covers/feather-arrow-azure.png";
import featherArrowAmethyst from "@/assets/covers/feather-arrow-amethyst.png";
import chroniclesLightRoseDove from "@/assets/covers/chronicles-light-rose-dove.jpg";
import chroniclesDarkLightPair from "@/assets/covers/chronicles-dark-light-pair.jpg";
import chroniclesDarkRavenRoses from "@/assets/covers/chronicles-dark-raven-roses.jpg";
import faithAffirmationsSticker from "@/assets/covers/faith-affirmations-sticker.jpg";
import faithCrossRoses from "@/assets/covers/faith-cross-roses.jpg";
import faithCrossHeart from "@/assets/covers/faith-cross-heart.jpg";

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

const paletteCrimsonMoon: CoverPalette = {
  mode: "dark",
  background: "220 35% 8%",
  foreground: "30 30% 92%",
  card: "220 30% 13%",
  cardForeground: "30 30% 92%",
  primary: "350 65% 55%",
  primaryForeground: "30 30% 96%",
  primarySoft: "220 25% 18%",
  accent: "40 75% 60%",
  accentForeground: "220 35% 8%",
  muted: "220 18% 16%",
  mutedForeground: "30 15% 65%",
  border: "220 18% 22%",
  paperGradient: "linear-gradient(180deg, hsl(220 35% 10%), hsl(220 40% 6%))",
};

const paletteHarvestMoon: CoverPalette = {
  mode: "dark",
  background: "30 35% 6%",
  foreground: "40 50% 92%",
  card: "30 30% 11%",
  cardForeground: "40 50% 92%",
  primary: "38 85% 60%",
  primaryForeground: "30 35% 6%",
  primarySoft: "30 25% 16%",
  accent: "30 70% 55%",
  accentForeground: "30 35% 6%",
  muted: "30 18% 14%",
  mutedForeground: "40 25% 65%",
  border: "30 18% 20%",
  paperGradient: "linear-gradient(180deg, hsl(30 35% 8%), hsl(25 40% 5%))",
};

const paletteGardenRose: CoverPalette = {
  mode: "light",
  background: "150 20% 94%",
  foreground: "340 25% 25%",
  card: "350 35% 98%",
  cardForeground: "340 25% 25%",
  primary: "340 55% 65%",
  primaryForeground: "350 35% 98%",
  primarySoft: "340 35% 92%",
  accent: "150 30% 50%",
  accentForeground: "350 35% 98%",
  muted: "150 15% 90%",
  mutedForeground: "340 12% 45%",
  border: "150 15% 84%",
  paperGradient: "linear-gradient(180deg, hsl(350 35% 97%), hsl(150 25% 92%))",
};

const paletteGardenWarm: CoverPalette = {
  mode: "light",
  background: "20 35% 94%",
  foreground: "15 25% 22%",
  card: "25 45% 98%",
  cardForeground: "15 25% 22%",
  primary: "15 65% 55%",
  primaryForeground: "25 45% 98%",
  primarySoft: "20 35% 90%",
  accent: "180 40% 45%",
  accentForeground: "25 45% 98%",
  muted: "20 22% 90%",
  mutedForeground: "15 12% 45%",
  border: "20 18% 84%",
  paperGradient: "linear-gradient(180deg, hsl(25 45% 96%), hsl(20 30% 90%))",
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

// --- Sky & Arrows palettes (feather + arrow series) --------------------------

const paletteSkyCrimson: CoverPalette = {
  mode: "light",
  background: "350 35% 95%",
  foreground: "350 30% 22%",
  card: "350 50% 98%",
  cardForeground: "350 30% 22%",
  primary: "350 65% 50%",
  primaryForeground: "350 50% 98%",
  primarySoft: "350 40% 90%",
  accent: "260 30% 55%",
  accentForeground: "350 50% 98%",
  muted: "350 20% 91%",
  mutedForeground: "350 12% 45%",
  border: "350 20% 85%",
  paperGradient: "linear-gradient(180deg, hsl(350 50% 97%), hsl(260 25% 92%))",
};

const paletteSkyAmber: CoverPalette = {
  mode: "light",
  background: "30 45% 94%",
  foreground: "20 30% 22%",
  card: "30 55% 98%",
  cardForeground: "20 30% 22%",
  primary: "25 80% 55%",
  primaryForeground: "30 55% 98%",
  primarySoft: "30 40% 90%",
  accent: "215 45% 50%",
  accentForeground: "30 55% 98%",
  muted: "30 25% 90%",
  mutedForeground: "20 12% 45%",
  border: "30 22% 84%",
  paperGradient: "linear-gradient(180deg, hsl(30 55% 97%), hsl(25 40% 90%))",
};

const paletteSkyGold: CoverPalette = {
  mode: "light",
  background: "45 50% 95%",
  foreground: "35 30% 22%",
  card: "45 60% 98%",
  cardForeground: "35 30% 22%",
  primary: "42 75% 50%",
  primaryForeground: "45 60% 98%",
  primarySoft: "45 45% 90%",
  accent: "200 35% 55%",
  accentForeground: "45 60% 98%",
  muted: "45 28% 91%",
  mutedForeground: "35 12% 45%",
  border: "45 24% 85%",
  paperGradient: "linear-gradient(180deg, hsl(45 60% 97%), hsl(40 40% 90%))",
};

const paletteSkyEmerald: CoverPalette = {
  mode: "light",
  background: "165 30% 94%",
  foreground: "160 30% 20%",
  card: "165 40% 98%",
  cardForeground: "160 30% 20%",
  primary: "150 55% 40%",
  primaryForeground: "165 40% 98%",
  primarySoft: "150 30% 88%",
  accent: "190 50% 50%",
  accentForeground: "165 40% 98%",
  muted: "165 18% 90%",
  mutedForeground: "160 12% 42%",
  border: "165 18% 84%",
  paperGradient: "linear-gradient(180deg, hsl(165 40% 97%), hsl(180 30% 91%))",
};

const paletteSkyAzure: CoverPalette = {
  mode: "light",
  background: "200 45% 95%",
  foreground: "215 35% 22%",
  card: "200 55% 98%",
  cardForeground: "215 35% 22%",
  primary: "210 70% 50%",
  primaryForeground: "200 55% 98%",
  primarySoft: "200 40% 90%",
  accent: "190 60% 55%",
  accentForeground: "200 55% 98%",
  muted: "200 25% 91%",
  mutedForeground: "215 12% 45%",
  border: "200 22% 85%",
  paperGradient: "linear-gradient(180deg, hsl(200 55% 97%), hsl(210 40% 91%))",
};

const paletteSkyAmethyst: CoverPalette = {
  mode: "light",
  background: "270 35% 95%",
  foreground: "275 30% 25%",
  card: "270 45% 98%",
  cardForeground: "275 30% 25%",
  primary: "280 55% 55%",
  primaryForeground: "270 45% 98%",
  primarySoft: "270 35% 90%",
  accent: "320 45% 60%",
  accentForeground: "270 45% 98%",
  muted: "270 22% 91%",
  mutedForeground: "275 12% 45%",
  border: "270 20% 85%",
  paperGradient: "linear-gradient(180deg, hsl(270 45% 97%), hsl(280 35% 91%))",
};

const paletteLightChronicle: CoverPalette = {
  mode: "light",
  background: "210 20% 96%",
  foreground: "215 25% 22%",
  card: "210 25% 99%",
  cardForeground: "215 25% 22%",
  primary: "215 30% 40%",
  primaryForeground: "210 25% 99%",
  primarySoft: "210 18% 90%",
  accent: "200 35% 55%",
  accentForeground: "210 25% 99%",
  muted: "210 12% 92%",
  mutedForeground: "215 10% 45%",
  border: "210 12% 86%",
  paperGradient: "linear-gradient(180deg, hsl(210 25% 98%), hsl(215 18% 92%))",
};

const paletteMonochromeFaith: CoverPalette = {
  mode: "dark",
  background: "0 0% 6%",
  foreground: "0 0% 95%",
  card: "0 0% 11%",
  cardForeground: "0 0% 95%",
  primary: "0 0% 88%",
  primaryForeground: "0 0% 6%",
  primarySoft: "0 0% 16%",
  accent: "45 25% 70%",
  accentForeground: "0 0% 6%",
  muted: "0 0% 14%",
  mutedForeground: "0 0% 65%",
  border: "0 0% 20%",
  paperGradient: "linear-gradient(180deg, hsl(0 0% 8%), hsl(0 0% 4%))",
};

const paletteFaithVibrant: CoverPalette = {
  mode: "dark",
  background: "215 40% 8%",
  foreground: "40 30% 95%",
  card: "215 35% 13%",
  cardForeground: "40 30% 95%",
  primary: "150 55% 50%",
  primaryForeground: "215 40% 8%",
  primarySoft: "215 25% 18%",
  accent: "350 70% 60%",
  accentForeground: "215 40% 8%",
  muted: "215 22% 16%",
  mutedForeground: "40 15% 65%",
  border: "215 20% 22%",
  paperGradient: "linear-gradient(180deg, hsl(215 40% 10%), hsl(215 45% 6%))",
};

// --- Cover catalog ------------------------------------------------------------

export const COVERS: Cover[] = [
  {
    id: "emperor-moth",
    name: "Emperor Moth in Wildflowers",
    collection: "celestial-birds-insects",
    image: emperorMoth,
    palette: paletteJewelDark,
  },
  {
    id: "midnight-swallowtail",
    name: "Midnight Swallowtail",
    collection: "celestial-birds-insects",
    image: midnightSwallowtail,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "ember-hummingbird",
    name: "Ember Hummingbird",
    collection: "celestial-birds-insects",
    image: emberHummingbird,
    palette: paletteJewelDark,
  },
  {
    id: "golden-dragonfly",
    name: "Golden Dragonfly",
    collection: "celestial-birds-insects",
    image: goldenDragonfly,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "moonlit-butterflies",
    name: "Moonlit Butterflies & Lotus",
    collection: "black-moon",
    image: moonlitButterflies,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "sparrow-on-moon",
    name: "Sparrow on Moon",
    collection: "black-moon",
    image: sparrowOnMoon,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "sparrow-moon-lanterns",
    name: "Sparrow & Moon Lanterns",
    collection: "black-moon",
    image: sparrowMoonLanterns,
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
    id: "garden-hummingbirds-olive",
    name: "Olive Hummingbirds",
    collection: "garden",
    image: gardenHummingbirdsOlive,
    palette: paletteSparrowLotus,
  },
  {
    id: "garden-white-butterfly",
    name: "White Butterfly Bloom",
    collection: "garden",
    image: gardenWhiteButterfly,
    palette: paletteSparrowDandelion,
  },
  {
    id: "garden-sun-dragonfly",
    name: "Sunburst Dragonfly",
    collection: "garden",
    image: gardenSunDragonfly,
    palette: paletteSparrowLotus,
  },
  {
    id: "garden-teardrop-lily",
    name: "Teardrop Lily",
    collection: "garden",
    image: gardenTeardropLily,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "garden-coral-hummingbirds",
    name: "Coral Hummingbirds",
    collection: "garden",
    image: gardenCoralHummingbirds,
    palette: paletteSparrowWishes,
  },
  {
    id: "garden-lavender-dragonflies",
    name: "Lavender Dragonflies",
    collection: "garden",
    image: gardenLavenderDragonflies,
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
  // --- Black Moon additions --------------------------------------------------
  {
    id: "black-rose-chains",
    name: "Black Rose & Gold Chains",
    collection: "black-moon",
    image: blackRoseChains,
    personalized: true,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "black-dahlia-sparks",
    name: "Black Dahlia & Sparks",
    collection: "black-moon",
    image: blackDahliaSparks,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "black-dahlia-lights",
    name: "Black Dahlia & Fairy Lights",
    collection: "black-moon",
    image: blackDahliaLights,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "black-iris-stars",
    name: "Black Iris & Stars",
    collection: "black-moon",
    image: blackIrisStars,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "black-iris-glow",
    name: "Black Iris Glow",
    collection: "black-moon",
    image: blackIrisGlow,
    palette: paletteMoonlitButterflies,
  },
  // --- Celestial Florals ----------------------------------------------------
  {
    id: "red-rose-moon",
    name: "Red Rose Under Moon",
    collection: "celestial-florals",
    image: redRoseMoon,
    palette: paletteCrimsonMoon,
  },
  {
    id: "white-rose-moon",
    name: "White Rose Under Moon",
    collection: "celestial-florals",
    image: whiteRoseMoon,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "black-lilies-sparks",
    name: "Black Lilies & Sparks",
    collection: "celestial-florals",
    image: blackLiliesSparks,
    palette: paletteMoonlitButterflies,
  },
  // --- Garden ---------------------------------------------------------------
  {
    id: "moonlit-oak",
    name: "Moonlit Oak & Lanterns",
    collection: "garden",
    image: moonlitOak,
    palette: paletteJewelDark,
  },
  // --- Sparrow Series -------------------------------------------------------
  {
    id: "sparrow-moon-fairy-lights",
    name: "Sparrow, Moon & Fairy Lights",
    collection: "sparrow",
    image: sparrowMoonFairyLights,
    palette: paletteSparrowWishes,
  },
  // --- Garden additions -----------------------------------------------------
  {
    id: "garden-pink-rose-dew",
    name: "Pink Rose & Dew",
    collection: "garden",
    image: gardenPinkRoseDew,
    palette: paletteGardenRose,
  },
  {
    id: "garden-blue-butterfly-orchid",
    name: "Blue Butterfly on Orchid",
    collection: "garden",
    image: gardenBlueButterflyOrchid,
    palette: paletteGardenWarm,
  },
  {
    id: "garden-hummingbird-mimosa",
    name: "Hummingbird & Pink Mimosa",
    collection: "garden",
    image: gardenHummingbirdMimosa,
    palette: paletteGardenRose,
  },
  {
    id: "garden-admiral-orchid",
    name: "Red Admiral & White Orchid",
    collection: "garden",
    image: gardenAdmiralOrchid,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "garden-dragonfly-grasses",
    name: "Dragonfly in Plume Grasses",
    collection: "garden",
    image: gardenDragonflyGrasses,
    palette: paletteGardenWarm,
  },
  // --- Harvest Moon (Black Moon) -------------------------------------------
  {
    id: "harvest-moon-rose",
    name: "Harvest Moon & Black Rose",
    collection: "black-moon",
    image: harvestMoonRose,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  {
    id: "harvest-moon-dahlia",
    name: "Harvest Moon & Black Dahlia",
    collection: "black-moon",
    image: harvestMoonDahlia,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  {
    id: "harvest-moon-iris",
    name: "Harvest Moon & Black Iris",
    collection: "black-moon",
    image: harvestMoonIris,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  {
    id: "harvest-moon-lilies",
    name: "Harvest Moon & Black Lilies",
    collection: "black-moon",
    image: harvestMoonLilies,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  {
    id: "harvest-moon-butterfly",
    name: "Harvest Moon & Black Butterfly",
    collection: "black-moon",
    image: harvestMoonButterfly,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  // --- Garden additions II --------------------------------------------------
  {
    id: "garden-forget-me-nots-ladybugs",
    name: "Forget-Me-Nots & Ladybugs",
    collection: "garden",
    image: gardenForgetMeNotsLadybugs,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "dandelion-ladybugs-night",
    name: "Dandelions & Ladybugs at Night",
    collection: "garden",
    image: dandelionLadybugsNight,
    palette: paletteMoonlitButterflies,
  },
  // --- Classic --------------------------------------------------------------
  {
    id: "classic-warm-leather",
    name: "Warm Leather Journal",
    collection: "classic",
    image: classicWarmLeather,
    personalized: true,
    palette: paletteVintageScrapbook,
  },
  {
    id: "classic-ivory-ribbons",
    name: "Ivory Ribbons",
    collection: "classic",
    image: classicIvoryRibbons,
    personalized: true,
    palette: paletteSparrowWishes,
  },
  // --- Sky & Arrows ---------------------------------------------------------
  {
    id: "crystal-vines-amber",
    name: "Amber Crystal Vines",
    collection: "sky-wings-arrows",
    image: crystalVinesAmber,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  {
    id: "crystal-vines-blush",
    name: "Blush Crystal Vines",
    collection: "sky-wings-arrows",
    image: crystalVinesBlush,
    personalized: true,
    palette: paletteCrimsonMoon,
  },
  {
    id: "feather-arrow-crimson",
    name: "Crimson Feather & Arrow",
    collection: "sky-wings-arrows",
    image: featherArrowCrimson,
    palette: paletteSkyCrimson,
  },
  {
    id: "feather-arrow-amber",
    name: "Amber Feather & Arrow",
    collection: "sky-wings-arrows",
    image: featherArrowAmber,
    palette: paletteSkyAmber,
  },
  {
    id: "feather-arrow-gold",
    name: "Gilded Feather & Arrow",
    collection: "sky-wings-arrows",
    image: featherArrowGold,
    palette: paletteSkyGold,
  },
  {
    id: "feather-arrow-emerald",
    name: "Emerald Feather & Arrow",
    collection: "sky-wings-arrows",
    image: featherArrowEmerald,
    palette: paletteSkyEmerald,
  },
  {
    id: "feather-arrow-azure",
    name: "Azure Feather & Arrow",
    collection: "sky-wings-arrows",
    image: featherArrowAzure,
    palette: paletteSkyAzure,
  },
  {
    id: "feather-arrow-amethyst",
    name: "Amethyst Feather & Arrow",
    collection: "sky-wings-arrows",
    image: featherArrowAmethyst,
    palette: paletteSkyAmethyst,
  },
  // --- Affirmations ---------------------------------------------------------
  {
    id: "affirmation-fragile-not-broken",
    name: "Fragile, Not Broken",
    collection: "affirmations",
    image: affirmationFragileNotBroken,
    palette: paletteVintageScrapbook,
  },
  {
    id: "affirmation-floats-hope",
    name: "Floats Hope",
    collection: "affirmations",
    image: affirmationFloatsHope,
    palette: paletteMoonlitButterflies,
  },
  // --- Chronicles -----------------------------------------------------------
  {
    id: "chronicles-light-rose-dove",
    name: "The Light Chronicles",
    collection: "chronicles",
    image: chroniclesLightRoseDove,
    palette: paletteLightChronicle,
  },
  {
    id: "chronicles-dark-raven-roses",
    name: "The Dark Chronicles",
    collection: "chronicles",
    image: chroniclesDarkRavenRoses,
    palette: paletteCrimsonMoon,
  },
  {
    id: "chronicles-dark-light-pair",
    name: "Dark & Light Chronicles",
    collection: "chronicles",
    image: chroniclesDarkLightPair,
    palette: paletteCrimsonMoon,
  },
  // --- Faith ----------------------------------------------------------------
  {
    id: "faith-cross-roses",
    name: "Cross & Roses",
    collection: "faith",
    image: faithCrossRoses,
    palette: paletteMonochromeFaith,
  },
  {
    id: "faith-cross-heart",
    name: "Cross & Woven Heart",
    collection: "faith",
    image: faithCrossHeart,
    palette: paletteMonochromeFaith,
  },
  {
    id: "faith-affirmations-sticker",
    name: "Faith Sticker Collage",
    collection: "faith",
    image: faithAffirmationsSticker,
    palette: paletteFaithVibrant,
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
