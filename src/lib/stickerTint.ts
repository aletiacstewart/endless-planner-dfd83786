/**
 * Zero-cost sticker theming.
 *
 * Instead of regenerating art per cover (paid image generation), we push the
 * shared watercolor PNGs toward the active cover's colour family with a CSS
 * filter chain. `sepia(1)` lands the art around hue 35deg, so rotating from
 * there to the theme hue gives a cohesive, cover-matched tint while keeping the
 * original shading and paper texture.
 */

const SEPIA_HUE = 35;

function parseHsl(hsl: string): [number, number, number] | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s*$/.exec(hsl);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** Build the filter string for a theme colour given as an "H S% L%" triplet. */
export function themeFilter(hsl: string): string {
  const p = parseHsl(hsl);
  if (!p) return "";
  const [h, s, l] = p;
  const rot = ((h - SEPIA_HUE) % 360 + 360) % 360;
  // Keep saturation/brightness in a tasteful band so pale and vivid covers both read well.
  const sat = Math.max(0.9, Math.min(2.2, s / 45 + 0.6));
  const bright = Math.max(0.85, Math.min(1.2, 0.75 + l / 120));
  return `grayscale(0.55) sepia(0.85) hue-rotate(${rot.toFixed(0)}deg) saturate(${sat.toFixed(2)}) brightness(${bright.toFixed(2)})`;
}

/** Read a CSS variable ("H S% L%") off :root. */
function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** Current cover's sticker tint filter (empty string when unavailable). */
export function currentStickerFilter(): string {
  return themeFilter(readVar("--primary", "145 18% 38%"));
}
