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
  | "pop-art"
  | "grit"
  | "feathers"
  | "dragons"
  | "gothic-sirens";

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
  { id: "grit", label: "Grit & Grace" },
  { id: "feathers", label: "Feathers" },
  { id: "dragons", label: "Dragons" },
  { id: "gothic-sirens", label: "Gothic Sirens" },
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
import scrapbookBotanical from "@/assets/covers/scrapbook-botanical.png.asset.json";
import midnightMothBloom from "@/assets/covers/midnight-moth-bloom.png.asset.json";
import tealMothBloom from "@/assets/covers/teal-moth-bloom.png.asset.json";
import thinkinSmack from "@/assets/covers/thinkin-smack.png.asset.json";
import talkinSmack from "@/assets/covers/talkin-smack.png.asset.json";
import pastelClipboard from "@/assets/covers/pastel-clipboard.png.asset.json";
import redRoseMoonlight from "@/assets/covers/red-rose-moonlight.png.asset.json";
import whiteRoseMoonlight from "@/assets/covers/white-rose-moonlight.png.asset.json";
import faithAffirmationsBright from "@/assets/covers/faith-affirmations-bright.png.asset.json";
import faithAffirmationsMuted from "@/assets/covers/faith-affirmations-muted.png.asset.json";
import hummingbirdOlive from "@/assets/covers/hummingbird-olive.png.asset.json";
import whiteButterflyFirecracker from "@/assets/covers/white-butterfly-firecracker.png.asset.json";
import angelTrumpetMoth from "@/assets/covers/angel-trumpet-moth.png.asset.json";
import sunsetHummingbird from "@/assets/covers/sunset-hummingbird.png.asset.json";
import dragonflySalvia from "@/assets/covers/dragonfly-salvia.png.asset.json";
import mimosaHummingbird from "@/assets/covers/mimosa-hummingbird.png.asset.json";
import blueCopperButterfly from "@/assets/covers/blue-copper-butterfly.png.asset.json";
import redAdmiralOrchid from "@/assets/covers/red-admiral-orchid.png.asset.json";
import dragonflyPampas from "@/assets/covers/dragonfly-pampas.png.asset.json";
import englishRoseDew from "@/assets/covers/english-rose-dew.png.asset.json";
import sparrowLotus from "@/assets/covers/sparrow-lotus.png.asset.json";
import sparrowDandelionMeadow from "@/assets/covers/sparrow-dandelion-meadow.png.asset.json";
import sparrowForgetMeNots from "@/assets/covers/sparrow-forget-me-nots.png.asset.json";
import sparrowDandelionStars from "@/assets/covers/sparrow-dandelion-stars.png.asset.json";
import sparrowDahliaGlow from "@/assets/covers/sparrow-dahlia-glow.png.asset.json";
import sparrowChrysanthemum from "@/assets/covers/sparrow-chrysanthemum.png.asset.json";
import mothDragonflyLotus from "@/assets/covers/moth-dragonfly-lotus.png.asset.json";
import blackRoseGoldSpikes from "@/assets/covers/black-rose-gold-spikes.png.asset.json";
import ladybugForgetMeNots from "@/assets/covers/ladybug-forget-me-nots.png.asset.json";
import dandelionLadybugNest from "@/assets/covers/dandelion-ladybug-nest.png.asset.json";
import tobaccoLeaf from "@/assets/covers/tobacco-leaf.png.asset.json";
import gildedCrystals from "@/assets/covers/gilded-crystals.png.asset.json";
import fragileNotBroken from "@/assets/covers/fragile-not-broken.png.asset.json";
import creamRibbons from "@/assets/covers/cream-ribbons.png.asset.json";
import pastelCrystals from "@/assets/covers/pastel-crystals.png.asset.json";
import doveWhiteRoses from "@/assets/covers/dove-white-roses.png.asset.json";
import doveRavenRoses from "@/assets/covers/dove-raven-roses.png.asset.json";
import ravenRedRoses from "@/assets/covers/raven-red-roses.png.asset.json";
import roseCrossStars from "@/assets/covers/rose-cross-stars.png.asset.json";
import wovenHeartCross from "@/assets/covers/woven-heart-cross.png.asset.json";
import featherEmerald from "@/assets/covers/feather-emerald.png.asset.json";
import featherPhoenix from "@/assets/covers/feather-phoenix.png.asset.json";
import featherAmethyst from "@/assets/covers/feather-amethyst.png.asset.json";
import featherCrimson from "@/assets/covers/feather-crimson.png.asset.json";
import featherSapphire from "@/assets/covers/feather-sapphire.png.asset.json";
import featherGold from "@/assets/covers/feather-gold.png.asset.json";
import dragonTwinFlame from "@/assets/covers/dragon-twin-flame.png.asset.json";
import dragonFiligree from "@/assets/covers/dragon-filigree.png.asset.json";
import dragonSkullEmber from "@/assets/covers/dragon-skull-ember.png.asset.json";
import dragonWingedCross from "@/assets/covers/dragon-winged-cross.png.asset.json";
import dragonWhirlwind from "@/assets/covers/dragon-whirlwind.png.asset.json";
import dragonOnyx from "@/assets/covers/dragon-onyx.png.asset.json";
import dragonCurlingEmber from "@/assets/covers/dragon-curling-ember.png.asset.json";
import dragonHeartFlame from "@/assets/covers/dragon-heart-flame.png.asset.json";
import dragonSovereign from "@/assets/covers/dragon-sovereign.png.asset.json";
import dragonThornwood from "@/assets/covers/dragon-thornwood.png.asset.json";
import gsCathedralThrone from "@/assets/covers/gothic-siren-cathedral-throne.png.asset.json";
import gsNautilus from "@/assets/covers/gothic-siren-nautilus.png.asset.json";
import gsHornedQueen from "@/assets/covers/gothic-siren-horned-queen.png.asset.json";
import gsRibbedCrown from "@/assets/covers/gothic-siren-ribbed-crown.png.asset.json";
import gsWingedFae from "@/assets/covers/gothic-siren-winged-fae.png.asset.json";
import gsCathedralNautilus from "@/assets/covers/gothic-siren-cathedral-nautilus.png.asset.json";
import gsConchSkull from "@/assets/covers/gothic-siren-conch-skull.png.asset.json";
import gsWebbed from "@/assets/covers/gothic-siren-webbed.png.asset.json";
import gsSkeleton from "@/assets/covers/gothic-siren-skeleton.png.asset.json";
import gsHaloedConch from "@/assets/covers/gothic-siren-haloed-conch.png.asset.json";

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



// Scrapbook botanical — warm blush paper, sage + coral accents.
const paletteScrapbookBlush: CoverPalette = {
  mode: "light",
  background: "24 40% 94%",
  foreground: "20 30% 22%",
  card: "30 50% 98%",
  cardForeground: "20 30% 22%",
  primary: "18 55% 55%",
  primaryForeground: "30 50% 98%",
  primarySoft: "18 40% 90%",
  accent: "140 25% 45%",
  accentForeground: "30 50% 98%",
  muted: "24 25% 90%",
  mutedForeground: "20 18% 42%",
  border: "24 22% 82%",
  paperGradient: "linear-gradient(180deg, hsl(30 50% 97%), hsl(20 30% 90%))",
};

// Pastel clipboard — soft mint + lavender scrapbook.
const palettePastelClipboard: CoverPalette = {
  mode: "light",
  background: "170 30% 95%",
  foreground: "240 25% 25%",
  card: "170 40% 99%",
  cardForeground: "240 25% 25%",
  primary: "260 45% 60%",
  primaryForeground: "170 40% 99%",
  primarySoft: "260 35% 92%",
  accent: "340 60% 68%",
  accentForeground: "170 40% 99%",
  muted: "170 20% 90%",
  mutedForeground: "240 15% 45%",
  border: "170 20% 82%",
  paperGradient: "linear-gradient(180deg, hsl(170 40% 97%), hsl(260 30% 92%))",
};

// Pop Art comic — halftone yellow, red, cyan on cream.
const palettePopArt: CoverPalette = {
  mode: "light",
  background: "48 55% 94%",
  foreground: "0 0% 8%",
  card: "48 65% 99%",
  cardForeground: "0 0% 8%",
  primary: "0 85% 52%",
  primaryForeground: "48 65% 99%",
  primarySoft: "0 60% 92%",
  accent: "195 85% 48%",
  accentForeground: "48 65% 99%",
  muted: "48 30% 90%",
  mutedForeground: "0 0% 25%",
  border: "0 0% 12%",
  paperGradient: "linear-gradient(180deg, hsl(48 65% 96%), hsl(48 40% 88%))",
};

// Rose moonlight — deep midnight with warm fairy-light gold + rose accent.
const paletteRoseMoonlight: CoverPalette = {
  mode: "dark",
  background: "220 45% 8%",
  foreground: "42 55% 94%",
  card: "220 40% 12%",
  cardForeground: "42 55% 94%",
  primary: "356 70% 55%",
  primaryForeground: "220 40% 10%",
  primarySoft: "356 40% 22%",
  accent: "42 85% 62%",
  accentForeground: "220 40% 10%",
  muted: "220 28% 16%",
  mutedForeground: "42 25% 72%",
  border: "220 28% 22%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(42 70% 24% / 0.5), transparent 60%), linear-gradient(180deg, hsl(220 45% 10%), hsl(220 45% 6%))",
};

// White rose moonlight — cool silver moonlight, softer than red rose.
const paletteWhiteRoseMoonlight: CoverPalette = {
  mode: "dark",
  background: "215 40% 10%",
  foreground: "210 30% 94%",
  card: "215 36% 14%",
  cardForeground: "210 30% 94%",
  primary: "210 40% 78%",
  primaryForeground: "215 40% 10%",
  primarySoft: "210 30% 24%",
  accent: "42 70% 68%",
  accentForeground: "215 40% 10%",
  muted: "215 24% 18%",
  mutedForeground: "210 20% 74%",
  border: "215 24% 24%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(210 50% 26% / 0.5), transparent 60%), linear-gradient(180deg, hsl(215 40% 12%), hsl(215 40% 7%))",
};

// Midnight bloom moth — inky navy with jewel-tone accents.
const paletteMidnightBloom: CoverPalette = {
  mode: "dark",
  background: "230 45% 8%",
  foreground: "40 40% 92%",
  card: "230 40% 12%",
  cardForeground: "40 40% 92%",
  primary: "45 85% 58%",
  primaryForeground: "230 45% 10%",
  primarySoft: "45 45% 22%",
  accent: "340 65% 55%",
  accentForeground: "230 45% 10%",
  muted: "230 28% 16%",
  mutedForeground: "40 22% 70%",
  border: "230 28% 22%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(340 45% 22% / 0.45), transparent 60%), linear-gradient(180deg, hsl(230 45% 10%), hsl(230 45% 6%))",
};

// Teal moth — deep teal with peacock blue + amber accents.
const paletteTealBloom: CoverPalette = {
  mode: "dark",
  background: "195 45% 10%",
  foreground: "40 40% 92%",
  card: "195 40% 14%",
  cardForeground: "40 40% 92%",
  primary: "195 70% 55%",
  primaryForeground: "195 45% 10%",
  primarySoft: "195 40% 22%",
  accent: "32 85% 60%",
  accentForeground: "195 45% 10%",
  muted: "195 28% 18%",
  mutedForeground: "40 22% 72%",
  border: "195 28% 24%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(195 60% 22% / 0.5), transparent 60%), linear-gradient(180deg, hsl(195 45% 11%), hsl(195 45% 7%))",
};

// Faith affirmations bright — playful multicolor on black.
const paletteFaithBright: CoverPalette = {
  mode: "dark",
  background: "260 25% 8%",
  foreground: "0 0% 96%",
  card: "260 22% 12%",
  cardForeground: "0 0% 96%",
  primary: "320 75% 65%",
  primaryForeground: "260 25% 10%",
  primarySoft: "320 40% 22%",
  accent: "180 65% 55%",
  accentForeground: "260 25% 10%",
  muted: "260 18% 16%",
  mutedForeground: "0 0% 72%",
  border: "260 18% 22%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(320 50% 20% / 0.5), transparent 60%), linear-gradient(180deg, hsl(260 25% 9%), hsl(260 25% 6%))",
};

// Faith affirmations muted — earthy red/green/blue on black.
const paletteFaithMuted: CoverPalette = {
  mode: "dark",
  background: "150 15% 8%",
  foreground: "40 25% 92%",
  card: "150 15% 12%",
  cardForeground: "40 25% 92%",
  primary: "140 40% 45%",
  primaryForeground: "150 15% 10%",
  primarySoft: "140 30% 20%",
  accent: "0 60% 50%",
  accentForeground: "150 15% 10%",
  muted: "150 12% 16%",
  mutedForeground: "40 15% 70%",
  border: "150 12% 22%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(140 40% 18% / 0.45), transparent 60%), linear-gradient(180deg, hsl(150 15% 9%), hsl(150 15% 6%))",
};


// Olive grove — cream paper, olive/sage foliage, jewel-teal accent.
const paletteOliveGrove: CoverPalette = {
  mode: "light",
  background: "48 30% 95%",
  foreground: "80 25% 18%",
  card: "48 40% 99%",
  cardForeground: "80 25% 18%",
  primary: "80 30% 40%",
  primaryForeground: "48 40% 99%",
  primarySoft: "80 25% 90%",
  accent: "175 55% 42%",
  accentForeground: "48 40% 99%",
  muted: "48 20% 90%",
  mutedForeground: "80 15% 40%",
  border: "48 18% 82%",
  paperGradient: "linear-gradient(180deg, hsl(48 40% 97%), hsl(80 20% 90%))",
};

// Golden nebula — warm gold cosmos with crimson accent.
const paletteGoldenNebula: CoverPalette = {
  mode: "dark",
  background: "32 35% 10%",
  foreground: "42 55% 94%",
  card: "32 30% 14%",
  cardForeground: "42 55% 94%",
  primary: "42 85% 60%",
  primaryForeground: "32 35% 10%",
  primarySoft: "42 45% 22%",
  accent: "356 70% 55%",
  accentForeground: "32 35% 10%",
  muted: "32 22% 18%",
  mutedForeground: "42 25% 72%",
  border: "32 22% 24%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(42 70% 26% / 0.55), transparent 60%), linear-gradient(180deg, hsl(32 35% 11%), hsl(32 35% 7%))",
};

// Sunset glow — hot pink + orange nebula, jewel-teal accent.
const paletteSunsetGlow: CoverPalette = {
  mode: "light",
  background: "20 60% 96%",
  foreground: "340 40% 20%",
  card: "20 70% 99%",
  cardForeground: "340 40% 20%",
  primary: "340 75% 55%",
  primaryForeground: "20 70% 99%",
  primarySoft: "340 55% 92%",
  accent: "175 65% 42%",
  accentForeground: "20 70% 99%",
  muted: "20 30% 92%",
  mutedForeground: "340 20% 42%",
  border: "20 30% 84%",
  paperGradient: "linear-gradient(160deg, hsl(20 70% 96%), hsl(340 55% 92%))",
};

// Pink mimosa — soft blush paper, rose primary, sage accent.
const palettePinkMimosa: CoverPalette = {
  mode: "light",
  background: "350 40% 96%",
  foreground: "340 30% 22%",
  card: "350 50% 99%",
  cardForeground: "340 30% 22%",
  primary: "340 55% 60%",
  primaryForeground: "350 50% 99%",
  primarySoft: "340 45% 92%",
  accent: "150 30% 45%",
  accentForeground: "350 50% 99%",
  muted: "350 25% 92%",
  mutedForeground: "340 15% 42%",
  border: "350 25% 84%",
  paperGradient: "linear-gradient(180deg, hsl(350 50% 97%), hsl(340 35% 92%))",
};

// Copper blue — warm copper background with cool blue accent.
const paletteCopperBlue: CoverPalette = {
  mode: "light",
  background: "22 35% 93%",
  foreground: "22 40% 20%",
  card: "22 45% 98%",
  cardForeground: "22 40% 20%",
  primary: "22 65% 48%",
  primaryForeground: "22 45% 98%",
  primarySoft: "22 45% 90%",
  accent: "215 65% 50%",
  accentForeground: "22 45% 98%",
  muted: "22 25% 90%",
  mutedForeground: "22 20% 42%",
  border: "22 22% 82%",
  paperGradient: "linear-gradient(180deg, hsl(22 45% 96%), hsl(22 30% 88%))",
};

// Black & gold — obsidian paper, gold-flecked, warm gold ink.
const paletteBlackGold: CoverPalette = {
  mode: "dark",
  background: "40 20% 6%",
  foreground: "45 45% 88%",
  card: "40 15% 10%",
  cardForeground: "45 45% 88%",
  primary: "42 70% 55%",
  primaryForeground: "40 20% 8%",
  primarySoft: "42 30% 22%",
  accent: "38 80% 60%",
  accentForeground: "40 20% 8%",
  muted: "40 12% 14%",
  mutedForeground: "45 20% 65%",
  border: "40 15% 18%",
  paperGradient: "linear-gradient(180deg, hsl(40 20% 8%), hsl(40 18% 5%))",
};

// Moth-lotus night — deep midnight with teal wing and violet lotus accents.
const paletteMothLotus: CoverPalette = {
  mode: "dark",
  background: "220 30% 8%",
  foreground: "185 30% 88%",
  card: "220 25% 11%",
  cardForeground: "185 30% 88%",
  primary: "185 55% 55%",
  primaryForeground: "220 30% 8%",
  primarySoft: "185 35% 22%",
  accent: "285 45% 60%",
  accentForeground: "220 30% 8%",
  muted: "220 20% 15%",
  mutedForeground: "220 15% 65%",
  border: "220 20% 20%",
  paperGradient: "linear-gradient(180deg, hsl(220 30% 10%), hsl(220 30% 6%))",
};

// Sparrow warm — sun-lit cream with warm brown ink and rose accent.
const paletteSparrowWarm: CoverPalette = {
  mode: "light",
  background: "36 40% 95%",
  foreground: "22 40% 22%",
  card: "36 50% 98%",
  cardForeground: "22 40% 22%",
  primary: "22 50% 40%",
  primaryForeground: "36 50% 98%",
  primarySoft: "22 35% 90%",
  accent: "340 55% 62%",
  accentForeground: "36 50% 98%",
  muted: "36 25% 90%",
  mutedForeground: "22 20% 45%",
  border: "36 22% 82%",
  paperGradient: "linear-gradient(180deg, hsl(36 40% 97%), hsl(36 30% 90%))",
};

// Ladybug sky — clear sky-blue paper with red ladybug accent.
const paletteLadybugSky: CoverPalette = {
  mode: "light",
  background: "210 55% 95%",
  foreground: "215 45% 20%",
  card: "210 60% 98%",
  cardForeground: "215 45% 20%",
  primary: "215 60% 42%",
  primaryForeground: "210 60% 98%",
  primarySoft: "210 45% 90%",
  accent: "8 75% 52%",
  accentForeground: "210 60% 98%",
  muted: "210 35% 90%",
  mutedForeground: "215 20% 42%",
  border: "210 30% 82%",
  paperGradient: "linear-gradient(180deg, hsl(210 55% 97%), hsl(210 45% 90%))",
};

// Tobacco leaf — warm supple leather-brown, tan glow, deep umber ink.
const paletteTobacco: CoverPalette = {
  mode: "dark",
  background: "22 28% 12%",
  foreground: "32 40% 92%",
  card: "22 26% 16%",
  cardForeground: "32 40% 92%",
  primary: "24 65% 55%",
  primaryForeground: "22 30% 12%",
  primarySoft: "24 40% 24%",
  accent: "36 75% 62%",
  accentForeground: "22 30% 12%",
  muted: "22 20% 20%",
  mutedForeground: "32 22% 72%",
  border: "22 20% 26%",
  paperGradient:
    "radial-gradient(120% 80% at 50% 0%, hsl(24 60% 28% / 0.5), transparent 60%), linear-gradient(180deg, hsl(22 28% 14%), hsl(22 28% 9%))",
};

// Pastel crystals — inky black with rose-quartz + aquamarine jewels.
const palettePastelCrystals: CoverPalette = {
  mode: "dark",
  background: "230 25% 8%",
  foreground: "340 30% 94%",
  card: "230 22% 12%",
  cardForeground: "340 30% 94%",
  primary: "340 60% 70%",
  primaryForeground: "230 25% 10%",
  primarySoft: "340 35% 22%",
  accent: "195 60% 65%",
  accentForeground: "230 25% 10%",
  muted: "230 18% 16%",
  mutedForeground: "340 18% 74%",
  border: "230 18% 22%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(340 40% 22% / 0.5), transparent 60%), linear-gradient(180deg, hsl(230 25% 9%), hsl(230 25% 6%))",
};

// Mono ink — stark grunge B&W, cracked-paper aesthetic.
const paletteMonoInk: CoverPalette = {
  mode: "light",
  background: "0 0% 97%",
  foreground: "0 0% 8%",
  card: "0 0% 100%",
  cardForeground: "0 0% 8%",
  primary: "0 0% 12%",
  primaryForeground: "0 0% 98%",
  primarySoft: "0 0% 90%",
  accent: "0 0% 25%",
  accentForeground: "0 0% 98%",
  muted: "0 0% 92%",
  mutedForeground: "0 0% 35%",
  border: "0 0% 82%",
  paperGradient: "linear-gradient(180deg, hsl(0 0% 98%), hsl(0 0% 90%))",
};

// Gothic raven — inky black with blood-red rose accent.
const paletteGothicRed: CoverPalette = {
  mode: "dark",
  background: "0 15% 6%",
  foreground: "0 20% 92%",
  card: "0 12% 10%",
  cardForeground: "0 20% 92%",
  primary: "350 75% 42%",
  primaryForeground: "0 15% 96%",
  primarySoft: "350 45% 20%",
  accent: "0 0% 85%",
  accentForeground: "0 15% 8%",
  muted: "0 10% 14%",
  mutedForeground: "0 12% 70%",
  border: "0 10% 20%",
  paperGradient:
    "radial-gradient(140% 90% at 50% 0%, hsl(350 55% 20% / 0.55), transparent 60%), linear-gradient(180deg, hsl(0 15% 8%), hsl(0 15% 4%))",
};

// Feather — emerald quill drifting above cloud.
const paletteFeatherEmerald: CoverPalette = {
  mode: "light",
  background: "165 40% 96%",
  foreground: "165 40% 12%",
  card: "0 0% 100%",
  cardForeground: "165 40% 12%",
  primary: "150 55% 32%",
  primaryForeground: "150 30% 98%",
  primarySoft: "150 40% 88%",
  accent: "180 45% 45%",
  accentForeground: "0 0% 100%",
  muted: "165 25% 92%",
  mutedForeground: "165 15% 38%",
  border: "165 25% 82%",
  paperGradient: "linear-gradient(180deg, hsl(180 40% 97%), hsl(150 35% 90%))",
};

// Feather — phoenix ember over warm sand cloud.
const paletteFeatherPhoenix: CoverPalette = {
  mode: "light",
  background: "30 45% 95%",
  foreground: "20 40% 14%",
  card: "0 0% 100%",
  cardForeground: "20 40% 14%",
  primary: "18 82% 48%",
  primaryForeground: "30 30% 98%",
  primarySoft: "22 60% 90%",
  accent: "220 65% 38%",
  accentForeground: "0 0% 100%",
  muted: "30 30% 92%",
  mutedForeground: "25 20% 38%",
  border: "28 30% 82%",
  paperGradient: "linear-gradient(180deg, hsl(30 55% 96%), hsl(18 45% 88%))",
};

// Feather — amethyst stardust over lilac cloud.
const paletteFeatherAmethyst: CoverPalette = {
  mode: "light",
  background: "270 50% 96%",
  foreground: "270 35% 14%",
  card: "0 0% 100%",
  cardForeground: "270 35% 14%",
  primary: "280 55% 42%",
  primaryForeground: "280 30% 98%",
  primarySoft: "275 45% 90%",
  accent: "255 55% 55%",
  accentForeground: "0 0% 100%",
  muted: "275 30% 93%",
  mutedForeground: "270 18% 40%",
  border: "275 30% 82%",
  paperGradient: "linear-gradient(180deg, hsl(275 55% 97%), hsl(265 45% 88%))",
};

// Feather — crimson starlight over dawn cloud.
const paletteFeatherCrimson: CoverPalette = {
  mode: "light",
  background: "350 50% 96%",
  foreground: "350 40% 14%",
  card: "0 0% 100%",
  cardForeground: "350 40% 14%",
  primary: "352 72% 45%",
  primaryForeground: "350 30% 98%",
  primarySoft: "352 55% 90%",
  accent: "220 45% 32%",
  accentForeground: "0 0% 100%",
  muted: "350 30% 93%",
  mutedForeground: "350 18% 40%",
  border: "350 30% 82%",
  paperGradient: "linear-gradient(180deg, hsl(350 55% 97%), hsl(345 50% 88%))",
};

// Feather — sapphire ice quill drifting above a bright winter sky.
const paletteFeatherSapphire: CoverPalette = {
  mode: "light",
  background: "205 60% 96%",
  foreground: "215 55% 16%",
  card: "0 0% 100%",
  cardForeground: "215 55% 16%",
  primary: "210 80% 45%",
  primaryForeground: "205 40% 98%",
  primarySoft: "205 60% 90%",
  accent: "190 70% 45%",
  accentForeground: "0 0% 100%",
  muted: "205 40% 93%",
  mutedForeground: "210 25% 40%",
  border: "205 40% 82%",
  paperGradient: "linear-gradient(180deg, hsl(200 65% 97%), hsl(210 55% 88%))",
};

// Feather — luminous gold quill over warm cream sky.
const paletteFeatherGold: CoverPalette = {
  mode: "light",
  background: "42 60% 96%",
  foreground: "32 45% 15%",
  card: "0 0% 100%",
  cardForeground: "32 45% 15%",
  primary: "38 78% 46%",
  primaryForeground: "42 40% 98%",
  primarySoft: "42 60% 90%",
  accent: "28 55% 40%",
  accentForeground: "0 0% 100%",
  muted: "42 40% 93%",
  mutedForeground: "32 22% 40%",
  border: "40 40% 82%",
  paperGradient: "linear-gradient(180deg, hsl(45 70% 97%), hsl(38 60% 89%))",
};

const paletteGothicSiren: CoverPalette = {
  mode: "dark",
  background: "220 20% 12%",
  foreground: "38 40% 92%",
  card: "220 18% 16%",
  cardForeground: "38 40% 92%",
  primary: "36 70% 62%",
  primaryForeground: "220 20% 10%",
  primarySoft: "36 30% 24%",
  accent: "210 25% 55%",
  accentForeground: "220 20% 10%",
  muted: "220 14% 20%",
  mutedForeground: "38 18% 72%",
  border: "220 14% 26%",
  paperGradient:
    "linear-gradient(180deg, hsl(210 30% 62%) 0%, hsl(220 15% 55%) 40%, hsl(36 55% 60%) 80%, hsl(220 20% 12%) 100%)",
};

// Dragon sunset — twilight sky (indigo → violet → amber → gold) with inky black silhouettes.
const paletteDragonSunset: CoverPalette = {
  mode: "dark",
  background: "228 35% 10%",
  foreground: "38 50% 92%",
  card: "228 30% 14%",
  cardForeground: "38 50% 92%",
  primary: "28 85% 58%",
  primaryForeground: "228 35% 10%",
  primarySoft: "28 45% 22%",
  accent: "280 40% 60%",
  accentForeground: "228 35% 10%",
  muted: "228 22% 18%",
  mutedForeground: "38 22% 72%",
  border: "228 22% 24%",
  paperGradient:
    "linear-gradient(180deg, hsl(228 45% 22%) 0%, hsl(280 35% 26%) 35%, hsl(28 70% 55%) 75%, hsl(48 85% 60%) 100%)",
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
  {
    id: "scrapbook-botanical",
    name: "Botanical Scrapbook",
    collection: "scrapbook",
    image: scrapbookBotanical.url,
    palette: paletteScrapbookBlush,
  },
  {
    id: "pastel-clipboard",
    name: "Pastel Clipboard",
    collection: "scrapbook",
    image: pastelClipboard.url,
    palette: palettePastelClipboard,
  },
  {
    id: "midnight-moth-bloom",
    name: "Midnight Moth in Bloom",
    collection: "celestial-birds-insects",
    image: midnightMothBloom.url,
    palette: paletteMidnightBloom,
  },
  {
    id: "teal-moth-bloom",
    name: "Teal Moth in Bloom",
    collection: "celestial-birds-insects",
    image: tealMothBloom.url,
    palette: paletteTealBloom,
  },
  {
    id: "red-rose-moonlight",
    name: "Red Rose Moonlight",
    collection: "celestial-florals",
    image: redRoseMoonlight.url,
    palette: paletteRoseMoonlight,
  },
  {
    id: "white-rose-moonlight",
    name: "White Rose Moonlight",
    collection: "celestial-florals",
    image: whiteRoseMoonlight.url,
    palette: paletteWhiteRoseMoonlight,
  },
  {
    id: "faith-affirmations-bright",
    name: "Faith Affirmations — Bright",
    collection: "affirmations",
    image: faithAffirmationsBright.url,
    palette: paletteFaithBright,
  },
  {
    id: "faith-affirmations-muted",
    name: "Faith Affirmations — Muted",
    collection: "affirmations",
    image: faithAffirmationsMuted.url,
    palette: paletteFaithMuted,
  },
  {
    id: "thinkin-smack",
    name: "Thinkin' Smack",
    collection: "pop-art",
    image: thinkinSmack.url,
    palette: palettePopArt,
  },
  {
    id: "talkin-smack",
    name: "Talkin' Smack",
    collection: "pop-art",
    image: talkinSmack.url,
    palette: palettePopArt,
  },
  {
    id: "hummingbird-olive",
    name: "Olive Grove Hummingbird",
    collection: "celestial-birds-insects",
    image: hummingbirdOlive.url,
    palette: paletteOliveGrove,
  },
  {
    id: "white-butterfly-firecracker",
    name: "Firecracker Butterfly",
    collection: "celestial-birds-insects",
    image: whiteButterflyFirecracker.url,
    palette: paletteGoldenNebula,
  },
  {
    id: "angel-trumpet-moth",
    name: "Angel Trumpet Moth",
    collection: "celestial-florals",
    image: angelTrumpetMoth.url,
    palette: paletteTealBloom,
  },
  {
    id: "sunset-hummingbird",
    name: "Sunset Hummingbird",
    collection: "celestial-birds-insects",
    image: sunsetHummingbird.url,
    palette: paletteSunsetGlow,
  },
  {
    id: "dragonfly-salvia",
    name: "Salvia Dragonfly",
    collection: "celestial-birds-insects",
    image: dragonflySalvia.url,
    palette: paletteTealBloom,
  },
  {
    id: "mimosa-hummingbird",
    name: "Mimosa Hummingbird",
    collection: "celestial-birds-insects",
    image: mimosaHummingbird.url,
    palette: palettePinkMimosa,
  },
  {
    id: "blue-copper-butterfly",
    name: "Copper Blue Butterfly",
    collection: "celestial-birds-insects",
    image: blueCopperButterfly.url,
    palette: paletteCopperBlue,
  },
  {
    id: "red-admiral-orchid",
    name: "Red Admiral Orchid",
    collection: "celestial-birds-insects",
    image: redAdmiralOrchid.url,
    palette: paletteIvory,
  },
  {
    id: "dragonfly-pampas",
    name: "Pampas Dragonfly",
    collection: "celestial-birds-insects",
    image: dragonflyPampas.url,
    palette: paletteScrapbookBlush,
  },
  {
    id: "english-rose-dew",
    name: "English Rose",
    collection: "garden",
    image: englishRoseDew.url,
    palette: palettePinkMimosa,
  },
  {
    id: "sparrow-lotus",
    name: "Sparrow on Lotus",
    collection: "sparrow",
    image: sparrowLotus.url,
    palette: paletteSparrowWarm,
  },
  {
    id: "sparrow-dandelion-meadow",
    name: "Sparrow in the Meadow",
    collection: "sparrow",
    image: sparrowDandelionMeadow.url,
    palette: paletteSparrowWarm,
  },
  {
    id: "sparrow-forget-me-nots",
    name: "Sparrow & Forget-Me-Nots",
    collection: "sparrow",
    image: sparrowForgetMeNots.url,
    palette: paletteLadybugSky,
  },
  {
    id: "sparrow-dandelion-stars",
    name: "Sparrow Among Stars",
    collection: "sparrow",
    image: sparrowDandelionStars.url,
    palette: paletteSparrowWarm,
  },
  {
    id: "sparrow-dahlia-glow",
    name: "Sparrow & Dahlia Glow",
    collection: "sparrow",
    image: sparrowDahliaGlow.url,
    palette: paletteSparrowWarm,
  },
  {
    id: "sparrow-chrysanthemum",
    name: "Sparrow & Chrysanthemum",
    collection: "sparrow",
    image: sparrowChrysanthemum.url,
    palette: paletteSparrowWarm,
  },
  {
    id: "moth-dragonfly-lotus",
    name: "Moth & Dragonfly Lotus",
    collection: "celestial-birds-insects",
    image: mothDragonflyLotus.url,
    palette: paletteMothLotus,
  },
  {
    id: "black-rose-gold-spikes",
    name: "Black Rose & Gold",
    collection: "black-moon",
    image: blackRoseGoldSpikes.url,
    palette: paletteBlackGold,
  },
  {
    id: "ladybug-forget-me-nots",
    name: "Ladybug & Forget-Me-Nots",
    collection: "garden",
    image: ladybugForgetMeNots.url,
    palette: paletteLadybugSky,
  },
  {
    id: "dandelion-ladybug-nest",
    name: "Dandelion Ladybug Nest",
    collection: "black-moon",
    image: dandelionLadybugNest.url,
    palette: paletteBlackGold,
  },
  {
    id: "tobacco-leaf",
    name: "Tobacco Leaf",
    collection: "chronicles",
    image: tobaccoLeaf.url,
    palette: paletteTobacco,
  },
  {
    id: "gilded-crystals",
    name: "Gilded Crystals",
    collection: "chronicles",
    image: gildedCrystals.url,
    palette: paletteGilded,
  },
  {
    id: "pastel-crystals",
    name: "Rose Quartz Crystals",
    collection: "chronicles",
    image: pastelCrystals.url,
    palette: palettePastelCrystals,
  },
  {
    id: "cream-ribbons",
    name: "Cream Ribbons",
    collection: "celestial-florals",
    image: creamRibbons.url,
    palette: paletteIvory,
  },
  {
    id: "fragile-not-broken",
    name: "Fragile, Not Broken",
    collection: "grit",
    image: fragileNotBroken.url,
    palette: paletteMonoInk,
  },
  {
    id: "dove-white-roses",
    name: "Dove & White Roses",
    collection: "faith",
    image: doveWhiteRoses.url,
    palette: paletteBlackGold,
  },
  {
    id: "dove-raven-roses",
    name: "Dove & Raven",
    collection: "faith",
    image: doveRavenRoses.url,
    palette: paletteGothicRed,
  },
  {
    id: "raven-red-roses",
    name: "Raven & Red Roses",
    collection: "black-moon",
    image: ravenRedRoses.url,
    palette: paletteGothicRed,
  },
  {
    id: "rose-cross-stars",
    name: "Rose Cross & Stars",
    collection: "faith",
    image: roseCrossStars.url,
    palette: paletteBlackGold,
  },
  {
    id: "woven-heart-cross",
    name: "Woven Heart Cross",
    collection: "faith",
    image: wovenHeartCross.url,
    palette: paletteBlackGold,
  },
  {
    id: "feather-emerald",
    name: "Emerald Feather",
    collection: "feathers",
    image: featherEmerald.url,
    palette: paletteFeatherEmerald,
  },
  {
    id: "feather-phoenix",
    name: "Phoenix Feather",
    collection: "feathers",
    image: featherPhoenix.url,
    palette: paletteFeatherPhoenix,
  },
  {
    id: "feather-amethyst",
    name: "Amethyst Feather",
    collection: "feathers",
    image: featherAmethyst.url,
    palette: paletteFeatherAmethyst,
  },
  {
    id: "feather-crimson",
    name: "Crimson Feather",
    collection: "feathers",
    image: featherCrimson.url,
    palette: paletteFeatherCrimson,
  },
  { id: "dragon-twin-flame", name: "Twin Flame Dragon", collection: "dragons", image: dragonTwinFlame.url, palette: paletteDragonSunset },
  { id: "dragon-filigree", name: "Filigree Dragon", collection: "dragons", image: dragonFiligree.url, palette: paletteDragonSunset },
  { id: "dragon-skull-ember", name: "Skull Ember Dragon", collection: "dragons", image: dragonSkullEmber.url, palette: paletteDragonSunset },
  { id: "dragon-winged-cross", name: "Winged Cross Dragon", collection: "dragons", image: dragonWingedCross.url, palette: paletteDragonSunset },
  { id: "dragon-whirlwind", name: "Whirlwind Dragon", collection: "dragons", image: dragonWhirlwind.url, palette: paletteDragonSunset },
  { id: "dragon-onyx", name: "Onyx Dragon", collection: "dragons", image: dragonOnyx.url, palette: paletteDragonSunset },
  { id: "dragon-curling-ember", name: "Curling Ember Dragon", collection: "dragons", image: dragonCurlingEmber.url, palette: paletteDragonSunset },
  { id: "dragon-heart-flame", name: "Heart Flame Dragon", collection: "dragons", image: dragonHeartFlame.url, palette: paletteDragonSunset },
  { id: "dragon-sovereign", name: "Sovereign Dragon", collection: "dragons", image: dragonSovereign.url, palette: paletteDragonSunset },
  { id: "dragon-thornwood", name: "Thornwood Dragon", collection: "dragons", image: dragonThornwood.url, palette: paletteDragonSunset },
  { id: "gothic-siren-cathedral-throne", name: "Cathedral Throne Siren", collection: "gothic-sirens", image: gsCathedralThrone.url, palette: paletteGothicSiren },
  { id: "gothic-siren-nautilus", name: "Nautilus Siren", collection: "gothic-sirens", image: gsNautilus.url, palette: paletteGothicSiren },
  { id: "gothic-siren-horned-queen", name: "Horned Queen Siren", collection: "gothic-sirens", image: gsHornedQueen.url, palette: paletteGothicSiren },
  { id: "gothic-siren-ribbed-crown", name: "Ribbed Crown Siren", collection: "gothic-sirens", image: gsRibbedCrown.url, palette: paletteGothicSiren },
  { id: "gothic-siren-winged-fae", name: "Winged Fae Siren", collection: "gothic-sirens", image: gsWingedFae.url, palette: paletteGothicSiren },
  { id: "gothic-siren-cathedral-nautilus", name: "Cathedral Nautilus Siren", collection: "gothic-sirens", image: gsCathedralNautilus.url, palette: paletteGothicSiren },
  { id: "gothic-siren-conch-skull", name: "Conch & Skull Siren", collection: "gothic-sirens", image: gsConchSkull.url, palette: paletteGothicSiren },
  { id: "gothic-siren-webbed", name: "Webbed Siren", collection: "gothic-sirens", image: gsWebbed.url, palette: paletteGothicSiren },
  { id: "gothic-siren-skeleton", name: "Skeleton Siren", collection: "gothic-sirens", image: gsSkeleton.url, palette: paletteGothicSiren },
  { id: "gothic-siren-haloed-conch", name: "Haloed Conch Siren", collection: "gothic-sirens", image: gsHaloedConch.url, palette: paletteGothicSiren },
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
