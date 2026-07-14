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

// Neutral placeholder palette used while no real covers are registered.
const palettePlaceholder: CoverPalette = {
  mode: "light",
  background: "40 20% 96%",
  foreground: "30 15% 20%",
  card: "40 30% 99%",
  cardForeground: "30 15% 20%",
  primary: "30 40% 45%",
  primaryForeground: "40 30% 99%",
  primarySoft: "40 25% 90%",
  accent: "200 35% 50%",
  accentForeground: "40 30% 99%",
  muted: "40 15% 92%",
  mutedForeground: "30 10% 45%",
  border: "40 15% 86%",
  paperGradient: "linear-gradient(180deg, hsl(40 30% 97%), hsl(40 20% 92%))",
};

// Neutral fallback used when no cover matches (e.g., stale saved coverId).
const PLACEHOLDER_COVER: Cover = {
  id: "placeholder",
  name: "No cover yet",
  collection: "classic",
  // Tiny transparent 1x1 PNG so <img src> stays valid.
  image:
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  palette: palettePlaceholder,
};

export const COVERS: Cover[] = [PLACEHOLDER_COVER];

export const DEFAULT_COVER_ID = "placeholder";

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
