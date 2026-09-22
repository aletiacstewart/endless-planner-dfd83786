import type { PlannerEntry, FieldValue } from "./db";

export type EntryFont = "serif" | "sans" | "hand" | "mono" | "display" | "rounded";
export type EntryFontSize = "sm" | "md" | "lg" | "xl";
export type EntryDensity = "compact" | "cozy" | "spacious";
export type EntryAccentWidth = "sm" | "md" | "lg";
export type EntryBgKind = "paper" | "solid" | "pattern";
export type EntryPattern = "dots" | "lines" | "grid";

export interface Sticker {
  id: string;
  src: string;         // asset URL or emoji
  kind: "img" | "emoji";
  x: number;           // 0-100 (% of container width)
  y: number;           // 0-100 (% of container height)
  size: number;        // px
  rot?: number;        // degrees
  z?: number;          // stacking order (higher = in front)
  /** "theme" (default) tints image stickers to the cover palette; "none" keeps original art. */
  tint?: "theme" | "none";
}

/** Highest z currently used, so new/raised stickers land on top. */
export function topStickerZ(stickers: Sticker[] | undefined): number {
  return (stickers ?? []).reduce((m, s) => Math.max(m, s.z ?? 0), 0);
}

/** Stickers sorted back-to-front for rendering. */
export function sortStickers(stickers: Sticker[]): Sticker[] {
  return [...stickers].sort((a, b) => (a.z ?? 0) - (b.z ?? 0));
}

export interface TypoSpec {
  font?: EntryFont;
  size?: EntryFontSize;
  color?: string;      // "H S% L%"
}

export interface BackgroundSpec {
  kind: EntryBgKind;
  color?: string;      // "H S% L%"
  pattern?: EntryPattern;
}

export interface EntryMeta {
  // New model
  typography?: {
    title?: TypoSpec;
    subtitle?: TypoSpec;
    body?: TypoSpec;
  };
  background?: BackgroundSpec;
  sectionTint?: string;      // "H S% L%"
  accentWidth?: EntryAccentWidth;
  density?: EntryDensity;
  stickers?: Sticker[];
  /** Set once a page's look has been changed on the page itself. */
  styled?: boolean;


  // Legacy — still read for old entries
  color?: string;
  font?: EntryFont;
  fontSize?: EntryFontSize;
}

const META_KEY = "__meta";

export function getMeta(entry: PlannerEntry | null | undefined): EntryMeta {
  if (!entry) return {};
  const raw = entry.values?.[META_KEY] as unknown;
  const meta = (raw && typeof raw === "object" ? raw : {}) as EntryMeta;

  // Backward-compat: fold legacy body-level fields into typography.body
  if ((meta.font || meta.fontSize || meta.color) && !meta.typography) {
    return {
      ...meta,
      typography: {
        body: {
          font: meta.font,
          size: meta.fontSize,
        },
      },
      // Old `color` was an accent stripe, not a body color — keep it there
    };
  }
  return meta;
}

export function withMeta(entry: PlannerEntry, patch: Partial<EntryMeta>): PlannerEntry {
  const current = getMeta(entry);
  const next: EntryMeta = { ...current, ...patch };
  return {
    ...entry,
    values: { ...entry.values, [META_KEY]: next as unknown as FieldValue },
  };
}

export function withTypography(
  entry: PlannerEntry,
  group: "title" | "subtitle" | "body",
  patch: Partial<TypoSpec>,
): PlannerEntry {
  const current = getMeta(entry);
  const typography = { ...(current.typography ?? {}) };
  typography[group] = { ...(typography[group] ?? {}), ...patch };
  return withMeta(entry, { typography });
}

export const FONT_STACKS: Record<EntryFont, string> = {
  serif: "'Cormorant Garamond', Georgia, serif",
  sans: "'Inter', system-ui, sans-serif",
  hand: "'Caveat', cursive",
  mono: "ui-monospace, SFMono-Regular, Menlo, monospace",
  display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
  rounded: "'Nunito', 'Inter', system-ui, sans-serif",
};

export const FONT_LABELS: Record<EntryFont, string> = {
  serif: "Serif",
  sans: "Sans",
  hand: "Handwritten",
  mono: "Mono",
  display: "Display",
  rounded: "Rounded",
};

export const FONT_SIZE_PX: Record<EntryFontSize, string> = {
  sm: "0.875rem",
  md: "1rem",
  lg: "1.15rem",
  xl: "1.35rem",
};

// Multipliers used for titles/subtitles so S/M/L/XL feel appropriate at each scale
export const TITLE_SIZE_REM: Record<EntryFontSize, string> = {
  sm: "1.5rem",
  md: "1.875rem",
  lg: "2.25rem",
  xl: "2.75rem",
};

export const SUBTITLE_SIZE_REM: Record<EntryFontSize, string> = {
  sm: "1rem",
  md: "1.15rem",
  lg: "1.35rem",
  xl: "1.6rem",
};

export const DENSITY_PADDING: Record<EntryDensity, string> = {
  compact: "0.875rem",
  cozy: "1.25rem",
  spacious: "1.75rem",
};

export const ACCENT_WIDTH_PX: Record<EntryAccentWidth, string> = {
  sm: "2px",
  md: "4px",
  lg: "6px",
};

/** Grouped sticker library — universal (always available). */
export interface StickerGroup {
  id: string;
  label: string;
  emojis: string[];
}

export const STICKER_GROUPS: StickerGroup[] = [
  {
    id: "nature",
    label: "Nature",
    emojis: ["🌸","🌿","🍃","🌷","🌻","🌹","🌼","🌺","🍀","🌵","🌾","🌲","🍁","🍂","🌱","🪷"],
  },
  {
    id: "weather",
    label: "Weather",
    emojis: ["☀️","🌤️","⛅","🌧️","⛈️","🌩️","❄️","🌨️","🌈","🌪️","💧","🌙","⭐","☁️"],
  },
  {
    id: "mood",
    label: "Mood",
    emojis: ["😊","😍","🥰","😌","🙂","😢","😴","😤","🤩","😇","😮‍💨","🥲","😔","😎","🤗","😅"],
  },
  {
    id: "health",
    label: "Health",
    emojis: ["💊","💉","🩺","❤️‍🩹","🧘","🏃","💧","🥗","🍎","☕","🍵","🥑","🫐","🍓"],
  },
  {
    id: "symbols",
    label: "Symbols",
    emojis: ["⭐","✨","💫","🔥","💯","✅","❌","⚠️","📌","🔖","🏷️","❤️","💛","💚","💙","💜"],
  },
  {
    id: "celebrate",
    label: "Celebrate",
    emojis: ["🎉","🎊","🎂","🎁","🌟","🏆","👑","💐","🥳","🎈","🍾","🎀"],
  },
  {
    id: "objects",
    label: "Objects",
    emojis: ["📖","✏️","📝","📎","🕯️","💡","🔑","🧴","🛁","🎧","📷","🧸","🧺"],
  },
];

/** Flat list retained for backward compatibility. */
export const UNIVERSAL_STICKERS: { id: string; emoji: string; label: string }[] =
  STICKER_GROUPS.flatMap((g) =>
    g.emojis.map((e, i) => ({ id: `${g.id}-${i}`, emoji: e, label: g.label })),
  );

export function newStickerId(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Convenience accessors with sensible defaults. */
export function getTypo(meta: EntryMeta, group: "title" | "subtitle" | "body"): TypoSpec {
  return meta.typography?.[group] ?? {};
}

/** Style keys shared between the planner-wide look and a single page. */
export const STYLE_KEYS = [
  "typography",
  "background",
  "sectionTint",
  "accentWidth",
  "density",
  "color",
  "font",
  "fontSize",
] as const;

/** The planner-wide look: style only, never stickers. */
export type PlannerStyle = Pick<
  EntryMeta,
  "typography" | "background" | "sectionTint" | "accentWidth" | "density" | "color"
>;

/** True when any style key is set on this page's own meta. */
export function hasOwnStyle(meta: EntryMeta): boolean {
  if (meta.styled) return true;
  return STYLE_KEYS.some((k) => meta[k] !== undefined);
}

/** Remove style keys, keeping stickers and anything else untouched. */
export function stripEntryStyle(meta: EntryMeta): EntryMeta {
  const next: EntryMeta = { ...meta };
  STYLE_KEYS.forEach((k) => {
    delete next[k];
  });
  delete next.styled;
  return next;
}

/**
 * Merge the planner-wide look with a page's own overrides. Anything set on the
 * page wins; the planner-wide look fills in the rest. Stickers stay per page.
 */
export function resolveEntryStyle(
  global: PlannerStyle | undefined,
  meta: EntryMeta,
): EntryMeta {
  if (!global) return meta;
  return {
    ...meta,
    typography: {
      title: { ...(global.typography?.title ?? {}), ...(meta.typography?.title ?? {}) },
      subtitle: { ...(global.typography?.subtitle ?? {}), ...(meta.typography?.subtitle ?? {}) },
      body: { ...(global.typography?.body ?? {}), ...(meta.typography?.body ?? {}) },
    },
    background: meta.background ?? global.background,
    sectionTint: meta.sectionTint ?? global.sectionTint,
    accentWidth: meta.accentWidth ?? global.accentWidth,
    density: meta.density ?? global.density,
    color: meta.color ?? global.color,
  };
}
