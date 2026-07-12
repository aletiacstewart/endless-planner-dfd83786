import type { PlannerEntry, FieldValue } from "./db";

export type EntryFont = "serif" | "sans" | "hand" | "mono";
export type EntryFontSize = "sm" | "md" | "lg";

export interface Sticker {
  id: string;
  src: string;         // asset URL or emoji
  kind: "img" | "emoji";
  x: number;           // 0-100 (% of container width)
  y: number;           // 0-100 (% of container height)
  size: number;        // px
  rot?: number;        // degrees
}

export interface EntryMeta {
  color?: string;       // "H S% L%"
  font?: EntryFont;
  fontSize?: EntryFontSize;
  stickers?: Sticker[];
}

const META_KEY = "__meta";

export function getMeta(entry: PlannerEntry | null | undefined): EntryMeta {
  if (!entry) return {};
  const raw = entry.values?.[META_KEY] as unknown;
  return (raw && typeof raw === "object" ? raw : {}) as EntryMeta;
}

export function withMeta(entry: PlannerEntry, patch: Partial<EntryMeta>): PlannerEntry {
  const current = getMeta(entry);
  const next: EntryMeta = { ...current, ...patch };
  return {
    ...entry,
    values: { ...entry.values, [META_KEY]: next as unknown as FieldValue },
  };
}

export const FONT_STACKS: Record<EntryFont, string> = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
  hand: "'Caveat', cursive",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

export const FONT_LABELS: Record<EntryFont, string> = {
  serif: "Serif",
  sans: "Sans",
  hand: "Handwritten",
  mono: "Mono",
};

export const FONT_SIZE_PX: Record<EntryFontSize, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.15rem",
};

/** Universal stickers — always available regardless of cover. */
export const UNIVERSAL_STICKERS: { id: string; emoji: string; label: string }[] = [
  { id: "star", emoji: "⭐", label: "Star" },
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "check", emoji: "✅", label: "Done" },
  { id: "sparkle", emoji: "✨", label: "Sparkle" },
  { id: "flower", emoji: "🌸", label: "Flower" },
  { id: "leaf", emoji: "🌿", label: "Leaf" },
  { id: "sun", emoji: "☀️", label: "Sun" },
  { id: "moon", emoji: "🌙", label: "Moon" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "coffee", emoji: "☕", label: "Coffee" },
  { id: "book", emoji: "📖", label: "Book" },
  { id: "pencil", emoji: "✏️", label: "Note" },
  { id: "smile", emoji: "😊", label: "Smile" },
  { id: "party", emoji: "🎉", label: "Celebrate" },
  { id: "rain", emoji: "🌧️", label: "Rain" },
  { id: "rainbow", emoji: "🌈", label: "Rainbow" },
];

export function newStickerId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
