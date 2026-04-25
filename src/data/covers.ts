import forgetMeNotsLadybugs from "@/assets/covers/forget-me-nots-ladybugs.jpg";
import faithStickerCollage from "@/assets/covers/faith-sticker-collage.jpg";
import dandelionLadybugsNight from "@/assets/covers/dandelion-ladybugs-night.jpg";
import classicWarmLeather from "@/assets/covers/classic-warm-leather.jpg";
import crystalVinesBranch from "@/assets/covers/crystal-vines-branch.jpg";
import affirmationFragileNotBroken from "@/assets/covers/affirmation-fragile-not-broken.jpg";
import classicIvoryRibbons from "@/assets/covers/classic-ivory-ribbons.jpg";
import crystalVinesBlush from "@/assets/covers/crystal-vines-blush.jpg";
import featherEmeraldSky from "@/assets/covers/feather-emerald-sky.jpg";
import featherAmberSky from "@/assets/covers/feather-amber-sky.jpg";
import featherAzureSky from "@/assets/covers/feather-azure-sky.jpg";
import featherAmethystSky from "@/assets/covers/feather-amethyst-sky.jpg";
import featherGoldSky from "@/assets/covers/feather-gold-sky.jpg";
import featherCrimsonSky from "@/assets/covers/feather-crimson-sky.jpg";
import chroniclesLightRoseDove from "@/assets/covers/chronicles-light-rose-dove.jpg";
import chroniclesDarkLightPair from "@/assets/covers/chronicles-dark-light-pair.jpg";
import chroniclesDarkRavenRoses from "@/assets/covers/chronicles-dark-raven-roses.jpg";
import faithStickerRainbowCross from "@/assets/covers/faith-sticker-rainbow-cross.jpg";
import faithCrossRoses from "@/assets/covers/faith-cross-roses.jpg";
import faithCrossHeart from "@/assets/covers/faith-cross-heart.jpg";
import emperorMothWildflowers from "@/assets/covers/emperor-moth-wildflowers.jpg";
import sparrowLotus from "@/assets/covers/sparrow-lotus.jpg";
import sparrowDandelionMeadow from "@/assets/covers/sparrow-dandelion-meadow.jpg";
import sparrowForgetMeNots from "@/assets/covers/sparrow-forget-me-nots.jpg";
import sparrowDandelionWishes from "@/assets/covers/sparrow-dandelion-wishes.jpg";
import sparrowDahliaDandelion from "@/assets/covers/sparrow-dahlia-dandelion.jpg";
import sparrowDahliaDandelionStars from "@/assets/covers/sparrow-dahlia-dandelion-stars.jpg";
import moonlitButterfliesLotus from "@/assets/covers/moonlit-butterflies-lotus.jpg";
import blackRoseChains from "@/assets/covers/black-rose-chains.jpg";
import redRoseMoon from "@/assets/covers/red-rose-moon.jpg";
import whiteRoseMoon from "@/assets/covers/white-rose-moon.jpg";
import oakTreeFairyLights from "@/assets/covers/oak-tree-fairy-lights.jpg";
import darkDahliaSparks from "@/assets/covers/dark-dahlia-sparks.jpg";
import blackDahliaFairyLights from "@/assets/covers/black-dahlia-fairy-lights.jpg";
import midnightIrisStars from "@/assets/covers/midnight-iris-stars.jpg";
import indigoIrisGlow from "@/assets/covers/indigo-iris-glow.jpg";
import blackLiliesSparks from "@/assets/covers/black-lilies-sparks.jpg";
import sparrowMoonFairyLights from "@/assets/covers/sparrow-moon-fairy-lights.jpg";
import midnightSwallowtailStars from "@/assets/covers/midnight-swallowtail-stars.jpg";
import hummingbirdFairyLights from "@/assets/covers/hummingbird-fairy-lights.jpg";
import dragonflyFairyLights from "@/assets/covers/dragonfly-fairy-lights.jpg";
import hummingbirdOliveBotanical from "@/assets/covers/hummingbird-olive-botanical.jpg";
import whiteButterflyTrumpetFlowers from "@/assets/covers/white-butterfly-trumpet-flowers.jpg";
import angelTrumpetButterfly from "@/assets/covers/angel-trumpet-butterfly.jpg";
import hummingbirdCrimsonCosmos from "@/assets/covers/hummingbird-crimson-cosmos.jpg";
import dragonflySalviaBokeh from "@/assets/covers/dragonfly-salvia-bokeh.jpg";
import hummingbirdPinkMimosa from "@/assets/covers/hummingbird-pink-mimosa.jpg";
import blueButterflyAnemone from "@/assets/covers/blue-butterfly-anemone.jpg";
import redAdmiralWhiteOrchids from "@/assets/covers/red-admiral-white-orchids.jpg";
import dragonflyPinkGrass from "@/assets/covers/dragonfly-pink-grass.jpg";
import dewdropPinkRose from "@/assets/covers/dewdrop-pink-rose.jpg";
import blackDahliaGoldenMoon from "@/assets/covers/black-dahlia-golden-moon.jpg";
import blackRoseGoldenMoon from "@/assets/covers/black-rose-golden-moon.jpg";
import midnightIrisGoldenMoon from "@/assets/covers/midnight-iris-golden-moon.jpg";
import blackLiliesGoldenMoon from "@/assets/covers/black-lilies-golden-moon.jpg";
import moonlitBlackButterfly from "@/assets/covers/moonlit-black-butterfly.jpg";
import botanicalDancerLeaves from "@/assets/covers/botanical-dancer-leaves.jpg";
import botanicalDancerLake from "@/assets/covers/botanical-dancer-lake.jpg";
import botanicalDancerCosmos from "@/assets/covers/botanical-dancer-cosmos.jpg";
import botanicalDancerPond from "@/assets/covers/botanical-dancer-pond.jpg";
import shepherdLambWolf from "@/assets/covers/shepherd-lamb-wolf.jpg";

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

const paletteFairyLightOak: CoverPalette = {
  mode: "dark",
  background: "210 40% 8%",
  foreground: "40 50% 92%",
  card: "210 35% 12%",
  cardForeground: "40 50% 92%",
  primary: "40 80% 65%",
  primaryForeground: "210 40% 8%",
  primarySoft: "210 28% 18%",
  accent: "190 50% 55%",
  accentForeground: "210 40% 8%",
  muted: "210 22% 16%",
  mutedForeground: "40 20% 65%",
  border: "210 22% 22%",
  paperGradient: "linear-gradient(180deg, hsl(210 40% 10%), hsl(220 45% 6%))",
};

const paletteMidnightIris: CoverPalette = {
  mode: "dark",
  background: "240 35% 7%",
  foreground: "40 35% 92%",
  card: "240 30% 12%",
  cardForeground: "40 35% 92%",
  primary: "260 50% 65%",
  primaryForeground: "240 35% 7%",
  primarySoft: "240 25% 18%",
  accent: "40 75% 60%",
  accentForeground: "240 35% 7%",
  muted: "240 18% 16%",
  mutedForeground: "40 18% 65%",
  border: "240 18% 22%",
  paperGradient: "linear-gradient(180deg, hsl(240 35% 9%), hsl(245 40% 5%))",
};

const paletteHummingbirdJewel: CoverPalette = {
  mode: "dark",
  background: "200 45% 8%",
  foreground: "180 40% 92%",
  card: "200 40% 13%",
  cardForeground: "180 40% 92%",
  primary: "175 70% 50%",
  primaryForeground: "200 45% 8%",
  primarySoft: "200 30% 18%",
  accent: "40 80% 60%",
  accentForeground: "200 45% 8%",
  muted: "200 22% 16%",
  mutedForeground: "180 18% 65%",
  border: "200 22% 22%",
  paperGradient: "linear-gradient(180deg, hsl(200 45% 10%), hsl(210 50% 6%))",
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

const paletteBotanicalOlive: CoverPalette = {
  mode: "light",
  background: "60 25% 94%",
  foreground: "150 20% 22%",
  card: "60 35% 98%",
  cardForeground: "150 20% 22%",
  primary: "150 35% 40%",
  primaryForeground: "60 35% 98%",
  primarySoft: "60 22% 88%",
  accent: "15 55% 65%",
  accentForeground: "60 35% 98%",
  muted: "60 18% 90%",
  mutedForeground: "150 12% 42%",
  border: "60 18% 84%",
  paperGradient: "linear-gradient(180deg, hsl(60 35% 96%), hsl(80 25% 90%))",
};

const paletteGoldenStardust: CoverPalette = {
  mode: "light",
  background: "40 50% 92%",
  foreground: "25 35% 22%",
  card: "40 60% 97%",
  cardForeground: "25 35% 22%",
  primary: "15 70% 55%",
  primaryForeground: "40 60% 97%",
  primarySoft: "40 40% 88%",
  accent: "30 80% 60%",
  accentForeground: "40 60% 97%",
  muted: "40 28% 89%",
  mutedForeground: "25 15% 45%",
  border: "40 22% 83%",
  paperGradient: "linear-gradient(180deg, hsl(40 60% 95%), hsl(35 45% 88%))",
};

const paletteAngelTrumpet: CoverPalette = {
  mode: "dark",
  background: "190 40% 10%",
  foreground: "180 30% 92%",
  card: "190 35% 14%",
  cardForeground: "180 30% 92%",
  primary: "175 50% 60%",
  primaryForeground: "190 40% 10%",
  primarySoft: "190 28% 20%",
  accent: "90 35% 65%",
  accentForeground: "190 40% 10%",
  muted: "190 22% 18%",
  mutedForeground: "180 18% 65%",
  border: "190 22% 24%",
  paperGradient: "linear-gradient(180deg, hsl(190 40% 12%), hsl(195 45% 8%))",
};

const paletteCrimsonCosmos: CoverPalette = {
  mode: "dark",
  background: "330 35% 10%",
  foreground: "30 40% 94%",
  card: "330 30% 14%",
  cardForeground: "30 40% 94%",
  primary: "10 75% 60%",
  primaryForeground: "30 40% 94%",
  primarySoft: "330 22% 20%",
  accent: "180 55% 55%",
  accentForeground: "330 35% 10%",
  muted: "330 18% 18%",
  mutedForeground: "30 22% 68%",
  border: "330 18% 24%",
  paperGradient: "linear-gradient(180deg, hsl(330 35% 12%), hsl(340 40% 8%))",
};

const paletteDragonflyMeadow: CoverPalette = {
  mode: "light",
  background: "30 40% 93%",
  foreground: "270 25% 25%",
  card: "30 50% 98%",
  cardForeground: "270 25% 25%",
  primary: "275 45% 55%",
  primaryForeground: "30 50% 98%",
  primarySoft: "30 32% 88%",
  accent: "190 50% 55%",
  accentForeground: "30 50% 98%",
  muted: "30 22% 90%",
  mutedForeground: "270 12% 45%",
  border: "30 20% 84%",
  paperGradient: "linear-gradient(180deg, hsl(30 50% 96%), hsl(280 30% 90%))",
};

const palettePinkMimosa: CoverPalette = {
  mode: "light",
  background: "345 55% 94%",
  foreground: "340 30% 24%",
  card: "345 60% 98%",
  cardForeground: "340 30% 24%",
  primary: "345 65% 60%",
  primaryForeground: "345 60% 98%",
  primarySoft: "345 45% 90%",
  accent: "165 40% 50%",
  accentForeground: "345 60% 98%",
  muted: "345 30% 91%",
  mutedForeground: "340 15% 45%",
  border: "345 25% 86%",
  paperGradient: "linear-gradient(180deg, hsl(345 60% 96%), hsl(345 45% 90%))",
};

const paletteCopperAnemone: CoverPalette = {
  mode: "light",
  background: "20 35% 90%",
  foreground: "20 30% 22%",
  card: "20 50% 97%",
  cardForeground: "20 30% 22%",
  primary: "215 55% 55%",
  primaryForeground: "20 50% 97%",
  primarySoft: "20 38% 88%",
  accent: "20 75% 55%",
  accentForeground: "20 50% 97%",
  muted: "20 25% 88%",
  mutedForeground: "20 15% 42%",
  border: "20 22% 82%",
  paperGradient: "linear-gradient(180deg, hsl(20 50% 95%), hsl(15 40% 88%))",
};

const paletteWhiteOrchid: CoverPalette = {
  mode: "light",
  background: "200 25% 95%",
  foreground: "210 25% 22%",
  card: "200 35% 99%",
  cardForeground: "210 25% 22%",
  primary: "15 70% 55%",
  primaryForeground: "200 35% 99%",
  primarySoft: "200 25% 90%",
  accent: "210 40% 50%",
  accentForeground: "200 35% 99%",
  muted: "200 18% 92%",
  mutedForeground: "210 12% 45%",
  border: "200 18% 86%",
  paperGradient: "linear-gradient(180deg, hsl(200 35% 98%), hsl(200 25% 92%))",
};

const palettePinkGrassMeadow: CoverPalette = {
  mode: "light",
  background: "20 45% 92%",
  foreground: "10 30% 25%",
  card: "20 55% 97%",
  cardForeground: "10 30% 25%",
  primary: "180 50% 40%",
  primaryForeground: "20 55% 97%",
  primarySoft: "20 40% 88%",
  accent: "5 65% 55%",
  accentForeground: "20 55% 97%",
  muted: "20 28% 90%",
  mutedForeground: "10 15% 45%",
  border: "20 22% 84%",
  paperGradient: "linear-gradient(180deg, hsl(20 55% 95%), hsl(15 45% 88%))",
};

const paletteDewdropRose: CoverPalette = {
  mode: "light",
  background: "150 22% 93%",
  foreground: "340 25% 24%",
  card: "350 40% 98%",
  cardForeground: "340 25% 24%",
  primary: "340 55% 65%",
  primaryForeground: "350 40% 98%",
  primarySoft: "350 35% 92%",
  accent: "150 35% 50%",
  accentForeground: "350 40% 98%",
  muted: "150 18% 90%",
  mutedForeground: "340 12% 45%",
  border: "150 18% 84%",
  paperGradient: "linear-gradient(180deg, hsl(350 40% 97%), hsl(150 25% 91%))",
};

const paletteGoldenMoonNoir: CoverPalette = {
  mode: "dark",
  background: "235 28% 7%",
  foreground: "42 40% 92%",
  card: "235 24% 11%",
  cardForeground: "42 40% 92%",
  primary: "42 82% 62%",
  primaryForeground: "235 28% 7%",
  primarySoft: "235 18% 17%",
  accent: "190 28% 52%",
  accentForeground: "235 28% 7%",
  muted: "235 14% 15%",
  mutedForeground: "42 18% 66%",
  border: "235 14% 21%",
  paperGradient: "linear-gradient(180deg, hsl(235 28% 9%), hsl(245 30% 5%))",
};

const paletteGoldenMoonIris: CoverPalette = {
  mode: "dark",
  background: "238 30% 7%",
  foreground: "42 42% 92%",
  card: "238 26% 11%",
  cardForeground: "42 42% 92%",
  primary: "225 58% 58%",
  primaryForeground: "238 30% 7%",
  primarySoft: "238 18% 17%",
  accent: "38 82% 62%",
  accentForeground: "238 30% 7%",
  muted: "238 14% 15%",
  mutedForeground: "42 18% 66%",
  border: "238 14% 21%",
  paperGradient: "linear-gradient(180deg, hsl(238 30% 9%), hsl(245 32% 5%))",
};

const paletteBlackButterflyMoon: CoverPalette = {
  mode: "dark",
  background: "240 24% 7%",
  foreground: "0 0% 96%",
  card: "240 20% 11%",
  cardForeground: "0 0% 96%",
  primary: "45 80% 62%",
  primaryForeground: "240 24% 7%",
  primarySoft: "240 14% 17%",
  accent: "0 0% 88%",
  accentForeground: "240 24% 7%",
  muted: "240 12% 15%",
  mutedForeground: "0 0% 70%",
  border: "240 12% 21%",
  paperGradient: "linear-gradient(180deg, hsl(240 24% 9%), hsl(240 28% 5%))",
};

// --- Botanical Dancer (sage watercolor) --------------------------------------

const paletteBotanicalSage: CoverPalette = {
  mode: "light",
  background: "80 18% 92%",
  foreground: "150 22% 20%",
  card: "70 25% 96%",
  cardForeground: "150 22% 20%",
  primary: "150 28% 32%",
  primaryForeground: "70 25% 96%",
  primarySoft: "90 20% 86%",
  accent: "25 55% 60%",
  accentForeground: "70 25% 96%",
  muted: "85 14% 88%",
  mutedForeground: "150 12% 42%",
  border: "90 15% 80%",
  paperGradient: "linear-gradient(180deg, hsl(75 24% 95%), hsl(150 18% 86%))",
};

const paletteBotanicalMist: CoverPalette = {
  mode: "light",
  background: "200 20% 90%",
  foreground: "200 28% 22%",
  card: "200 28% 95%",
  cardForeground: "200 28% 22%",
  primary: "200 35% 38%",
  primaryForeground: "200 28% 95%",
  primarySoft: "200 22% 84%",
  accent: "35 50% 62%",
  accentForeground: "200 28% 95%",
  muted: "200 15% 86%",
  mutedForeground: "200 14% 44%",
  border: "200 16% 78%",
  paperGradient: "linear-gradient(180deg, hsl(200 28% 94%), hsl(200 22% 84%))",
};

const paletteBotanicalEmber: CoverPalette = {
  mode: "light",
  background: "190 20% 88%",
  foreground: "200 30% 20%",
  card: "180 22% 94%",
  cardForeground: "200 30% 20%",
  primary: "20 65% 55%",
  primaryForeground: "180 22% 96%",
  primarySoft: "190 18% 82%",
  accent: "150 24% 38%",
  accentForeground: "180 22% 96%",
  muted: "190 14% 84%",
  mutedForeground: "200 14% 44%",
  border: "190 14% 76%",
  paperGradient: "linear-gradient(180deg, hsl(180 22% 94%), hsl(200 24% 80%))",
};

const paletteBotanicalPond: CoverPalette = {
  mode: "light",
  background: "55 22% 90%",
  foreground: "195 30% 22%",
  card: "55 30% 95%",
  cardForeground: "195 30% 22%",
  primary: "195 38% 38%",
  primaryForeground: "55 30% 95%",
  primarySoft: "55 18% 84%",
  accent: "30 55% 60%",
  accentForeground: "55 30% 95%",
  muted: "55 14% 86%",
  mutedForeground: "195 14% 44%",
  border: "55 16% 78%",
  paperGradient: "linear-gradient(180deg, hsl(55 30% 94%), hsl(195 22% 82%))",
};

// --- Shepherd (dramatic stormy faith) ----------------------------------------

const paletteShepherdStorm: CoverPalette = {
  mode: "dark",
  background: "210 22% 12%",
  foreground: "40 25% 92%",
  card: "210 20% 16%",
  cardForeground: "40 25% 92%",
  primary: "40 60% 70%",
  primaryForeground: "210 22% 12%",
  primarySoft: "210 14% 22%",
  accent: "30 45% 55%",
  accentForeground: "210 22% 12%",
  muted: "210 12% 20%",
  mutedForeground: "40 15% 70%",
  border: "210 12% 26%",
  paperGradient: "linear-gradient(180deg, hsl(210 24% 14%), hsl(215 28% 8%))",
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

const paletteFaithRainbow: CoverPalette = {
  mode: "dark",
  background: "0 0% 6%",
  foreground: "0 0% 96%",
  card: "0 0% 11%",
  cardForeground: "0 0% 96%",
  primary: "320 75% 65%",
  primaryForeground: "0 0% 6%",
  primarySoft: "0 0% 16%",
  accent: "180 65% 55%",
  accentForeground: "0 0% 6%",
  muted: "0 0% 14%",
  mutedForeground: "0 0% 68%",
  border: "0 0% 20%",
  paperGradient: "linear-gradient(180deg, hsl(0 0% 8%), hsl(0 0% 4%))",
};

const paletteBotanicalSpirit: CoverPalette = {
  mode: "light",
  background: "100 18% 93%",
  foreground: "175 22% 20%",
  card: "90 25% 97%",
  cardForeground: "175 22% 20%",
  primary: "155 28% 38%",
  primaryForeground: "90 25% 97%",
  primarySoft: "100 18% 88%",
  accent: "30 55% 60%",
  accentForeground: "90 25% 97%",
  muted: "100 12% 90%",
  mutedForeground: "175 12% 42%",
  border: "100 14% 84%",
  paperGradient: "linear-gradient(180deg, hsl(90 25% 96%), hsl(175 18% 90%))",
};

// --- Cover catalog ------------------------------------------------------------

export const COVERS: Cover[] = [
  {
    id: "forget-me-nots-ladybugs",
    name: "Forget-Me-Nots & Ladybugs",
    collection: "garden",
    image: forgetMeNotsLadybugs,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "dandelion-ladybugs-night",
    name: "Dandelions & Ladybugs at Night",
    collection: "garden",
    image: dandelionLadybugsNight,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "classic-warm-leather",
    name: "Warm Leather Journal",
    collection: "classic",
    image: classicWarmLeather,
    personalized: true,
    palette: paletteVintageScrapbook,
  },
  {
    id: "crystal-vines-branch",
    name: "Crystal Vines on Branch",
    collection: "sky-wings-arrows",
    image: crystalVinesBranch,
    personalized: true,
    palette: paletteHarvestMoon,
  },
  {
    id: "faith-sticker-collage",
    name: "Faith Sticker Collage",
    collection: "faith",
    image: faithStickerCollage,
    palette: paletteFaithVibrant,
  },
  {
    id: "affirmation-fragile-not-broken",
    name: "Fragile, Not Broken",
    collection: "affirmations",
    image: affirmationFragileNotBroken,
    palette: paletteLightChronicle,
  },
  {
    id: "classic-ivory-ribbons",
    name: "Ivory Ribbons",
    collection: "classic",
    image: classicIvoryRibbons,
    personalized: true,
    palette: paletteSparrowWishes,
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
    id: "feather-emerald-sky",
    name: "Emerald Feather in Sky",
    collection: "sky-wings-arrows",
    image: featherEmeraldSky,
    palette: paletteSkyEmerald,
  },
  {
    id: "feather-amber-sky",
    name: "Amber Feather in Sky",
    collection: "sky-wings-arrows",
    image: featherAmberSky,
    palette: paletteSkyAmber,
  },
  {
    id: "feather-azure-sky",
    name: "Azure Feather in Sky",
    collection: "sky-wings-arrows",
    image: featherAzureSky,
    palette: paletteSkyAzure,
  },
  {
    id: "feather-amethyst-sky",
    name: "Amethyst Feather in Sky",
    collection: "sky-wings-arrows",
    image: featherAmethystSky,
    palette: paletteSkyAmethyst,
  },
  {
    id: "feather-gold-sky",
    name: "Gilded Feather in Sky",
    collection: "sky-wings-arrows",
    image: featherGoldSky,
    palette: paletteSkyGold,
  },
  {
    id: "feather-crimson-sky",
    name: "Crimson Feather in Sky",
    collection: "sky-wings-arrows",
    image: featherCrimsonSky,
    palette: paletteSkyCrimson,
  },
  {
    id: "chronicles-light-rose-dove",
    name: "The Light Chronicles",
    collection: "chronicles",
    image: chroniclesLightRoseDove,
    palette: paletteLightChronicle,
  },
  {
    id: "chronicles-dark-light-pair",
    name: "Dark & Light Chronicles",
    collection: "chronicles",
    image: chroniclesDarkLightPair,
    palette: paletteCrimsonMoon,
  },
  {
    id: "chronicles-dark-raven-roses",
    name: "The Dark Chronicles",
    collection: "chronicles",
    image: chroniclesDarkRavenRoses,
    palette: paletteCrimsonMoon,
  },
  {
    id: "faith-sticker-rainbow-cross",
    name: "Rainbow Cross Stickers",
    collection: "faith",
    image: faithStickerRainbowCross,
    palette: paletteFaithRainbow,
  },
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
    id: "emperor-moth-wildflowers",
    name: "Emperor Moth & Wildflowers",
    collection: "celestial-birds-insects",
    image: emperorMothWildflowers,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "sparrow-lotus",
    name: "Sparrow on Lotus",
    collection: "sparrow",
    image: sparrowLotus,
    palette: paletteSparrowLotus,
  },
  {
    id: "sparrow-dandelion-meadow",
    name: "Fledgling on a Dandelion",
    collection: "sparrow",
    image: sparrowDandelionMeadow,
    palette: paletteSparrowDandelion,
  },
  {
    id: "sparrow-forget-me-nots",
    name: "Sparrow & Forget-Me-Nots",
    collection: "sparrow",
    image: sparrowForgetMeNots,
    palette: paletteSparrowForgetMeNots,
  },
  {
    id: "sparrow-dandelion-wishes",
    name: "Dandelion Wishes",
    collection: "sparrow",
    image: sparrowDandelionWishes,
    palette: paletteSparrowWishes,
  },
  {
    id: "sparrow-dahlia-dandelion",
    name: "Sparrow with Dahlias",
    collection: "sparrow",
    image: sparrowDahliaDandelion,
    palette: paletteVintageScrapbook,
  },
  {
    id: "sparrow-dahlia-dandelion-stars",
    name: "Sparrow, Dahlias & Dandelions",
    collection: "sparrow",
    image: sparrowDahliaDandelionStars,
    palette: paletteVintageScrapbook,
  },
  {
    id: "moonlit-butterflies-lotus",
    name: "Moonlit Butterflies & Lotus",
    collection: "celestial-birds-insects",
    image: moonlitButterfliesLotus,
    palette: paletteMoonlitButterflies,
  },
  {
    id: "black-rose-chains",
    name: "Black Rose & Chains",
    collection: "black-moon",
    image: blackRoseChains,
    personalized: true,
    palette: paletteCrimsonMoon,
  },
  {
    id: "red-rose-moon",
    name: "Red Rose Moon",
    collection: "black-moon",
    image: redRoseMoon,
    palette: paletteCrimsonMoon,
  },
  {
    id: "white-rose-moon",
    name: "White Rose Moon",
    collection: "black-moon",
    image: whiteRoseMoon,
    palette: paletteLightChronicle,
  },
  {
    id: "oak-tree-fairy-lights",
    name: "Oak Tree & Fairy Lights",
    collection: "garden",
    image: oakTreeFairyLights,
    palette: paletteFairyLightOak,
  },
  {
    id: "dark-dahlia-sparks",
    name: "Dark Dahlia & Sparks",
    collection: "black-moon",
    image: darkDahliaSparks,
    palette: paletteCrimsonMoon,
  },
  {
    id: "black-dahlia-fairy-lights",
    name: "Black Dahlia & Fairy Lights",
    collection: "black-moon",
    image: blackDahliaFairyLights,
    palette: paletteCrimsonMoon,
  },
  {
    id: "midnight-iris-stars",
    name: "Midnight Iris & Stars",
    collection: "celestial-florals",
    image: midnightIrisStars,
    palette: paletteMidnightIris,
  },
  {
    id: "indigo-iris-glow",
    name: "Indigo Iris Glow",
    collection: "celestial-florals",
    image: indigoIrisGlow,
    palette: paletteMidnightIris,
  },
  {
    id: "black-lilies-sparks",
    name: "Black Lilies & Sparks",
    collection: "black-moon",
    image: blackLiliesSparks,
    palette: paletteCrimsonMoon,
  },
  {
    id: "sparrow-moon-fairy-lights",
    name: "Sparrow, Moon & Fairy Lights",
    collection: "sparrow",
    image: sparrowMoonFairyLights,
    palette: paletteFairyLightOak,
  },
  {
    id: "midnight-swallowtail-stars",
    name: "Midnight Swallowtail & Stars",
    collection: "celestial-birds-insects",
    image: midnightSwallowtailStars,
    palette: paletteMidnightIris,
  },
  {
    id: "hummingbird-fairy-lights",
    name: "Hummingbird & Fairy Lights",
    collection: "celestial-birds-insects",
    image: hummingbirdFairyLights,
    palette: paletteHummingbirdJewel,
  },
  {
    id: "dragonfly-fairy-lights",
    name: "Dragonfly & Fairy Lights",
    collection: "celestial-birds-insects",
    image: dragonflyFairyLights,
    palette: paletteFairyLightOak,
  },
  {
    id: "hummingbird-olive-botanical",
    name: "Hummingbird & Olive Botanical",
    collection: "garden",
    image: hummingbirdOliveBotanical,
    palette: paletteBotanicalOlive,
  },
  {
    id: "white-butterfly-trumpet-flowers",
    name: "White Butterfly & Trumpet Flowers",
    collection: "garden",
    image: whiteButterflyTrumpetFlowers,
    palette: paletteGoldenStardust,
  },
  {
    id: "angel-trumpet-butterfly",
    name: "Angel's Trumpet & Butterfly",
    collection: "garden",
    image: angelTrumpetButterfly,
    palette: paletteAngelTrumpet,
  },
  {
    id: "hummingbird-crimson-cosmos",
    name: "Hummingbird & Crimson Cosmos",
    collection: "celestial-birds-insects",
    image: hummingbirdCrimsonCosmos,
    palette: paletteCrimsonCosmos,
  },
  {
    id: "dragonfly-salvia-bokeh",
    name: "Dragonfly on Salvia",
    collection: "garden",
    image: dragonflySalviaBokeh,
    palette: paletteDragonflyMeadow,
  },
  {
    id: "hummingbird-pink-mimosa",
    name: "Hummingbird & Pink Mimosa",
    collection: "celestial-birds-insects",
    image: hummingbirdPinkMimosa,
    palette: palettePinkMimosa,
  },
  {
    id: "blue-butterfly-anemone",
    name: "Blue Butterfly on Anemone",
    collection: "celestial-birds-insects",
    image: blueButterflyAnemone,
    palette: paletteCopperAnemone,
  },
  {
    id: "red-admiral-white-orchids",
    name: "Red Admiral & White Orchids",
    collection: "garden",
    image: redAdmiralWhiteOrchids,
    palette: paletteWhiteOrchid,
  },
  {
    id: "dragonfly-pink-grass",
    name: "Dragonfly in Pink Grass",
    collection: "garden",
    image: dragonflyPinkGrass,
    palette: palettePinkGrassMeadow,
  },
  {
    id: "dewdrop-pink-rose",
    name: "Dewdrop Pink Rose",
    collection: "garden",
    image: dewdropPinkRose,
    palette: paletteDewdropRose,
  },
  {
    id: "black-dahlia-golden-moon",
    name: "Black Dahlia & Golden Moon",
    collection: "black-moon",
    image: blackDahliaGoldenMoon,
    palette: paletteGoldenMoonNoir,
  },
  {
    id: "black-rose-golden-moon",
    name: "Black Rose & Golden Moon",
    collection: "black-moon",
    image: blackRoseGoldenMoon,
    palette: paletteGoldenMoonNoir,
  },
  {
    id: "midnight-iris-golden-moon",
    name: "Midnight Iris & Golden Moon",
    collection: "celestial-florals",
    image: midnightIrisGoldenMoon,
    palette: paletteGoldenMoonIris,
  },
  {
    id: "black-lilies-golden-moon",
    name: "Black Lilies & Golden Moon",
    collection: "black-moon",
    image: blackLiliesGoldenMoon,
    palette: paletteGoldenMoonNoir,
  },
  {
    id: "moonlit-black-butterfly",
    name: "Moonlit Black Butterfly",
    collection: "celestial-birds-insects",
    image: moonlitBlackButterfly,
    palette: paletteBlackButterflyMoon,
  },
  {
    id: "botanical-dancer-leaves",
    name: "Botanical Dancer & Leaves",
    collection: "garden",
    image: botanicalDancerLeaves,
    palette: paletteBotanicalSage,
  },
  {
    id: "botanical-dancer-lake",
    name: "Botanical Dancer by the Lake",
    collection: "garden",
    image: botanicalDancerLake,
    palette: paletteBotanicalMist,
  },
  {
    id: "botanical-dancer-cosmos",
    name: "Botanical Dancer & Cosmos",
    collection: "garden",
    image: botanicalDancerCosmos,
    palette: paletteBotanicalEmber,
  },
  {
    id: "botanical-dancer-pond",
    name: "Botanical Dancer at the Pond",
    collection: "garden",
    image: botanicalDancerPond,
    palette: paletteBotanicalPond,
  },
  {
    id: "shepherd-lamb-wolf",
    name: "The Good Shepherd",
    collection: "faith",
    image: shepherdLambWolf,
    palette: paletteShepherdStorm,
  },
];

// Neutral fallback used when no cover matches (e.g., stale saved coverId).
const PLACEHOLDER_COVER: Cover = {
  id: "placeholder",
  name: "No cover yet",
  collection: "classic",
  // Tiny transparent 1x1 PNG so <img src> stays valid.
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  palette: paletteLightChronicle,
};

export const DEFAULT_COVER_ID = "forget-me-nots-ladybugs";

export function getCover(id: string | null | undefined): Cover {
  return (
    COVERS.find((c) => c.id === id) ??
    COVERS.find((c) => c.id === DEFAULT_COVER_ID) ??
    PLACEHOLDER_COVER
  );
}

export function getCoversByCollection(collection: CoverCollection | "all"): Cover[] {
  if (collection === "all") return COVERS;
  return COVERS.filter((c) => c.collection === collection);
}
