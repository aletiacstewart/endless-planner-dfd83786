import { useEffect, useState } from "react";
import { useUserSettings } from "./useUserSettings";

/** Read a CSS variable (an "H S% L%" triplet) and return it, or a fallback. */
function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function parse(hsl: string): [number, number, number] | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s*$/.exec(hsl);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function shift(hsl: string, dh: number, ds: number, dl: number): string {
  const p = parse(hsl);
  if (!p) return hsl;
  const [h, s, l] = p;
  const H = ((h + dh) % 360 + 360) % 360;
  const S = Math.max(0, Math.min(100, s + ds));
  const L = Math.max(0, Math.min(100, l + dl));
  return `${H} ${S}% ${L}%`;
}

/** hsl(H S% L%) string for inline styles */
export function toCss(hsl: string): string {
  return `hsl(${hsl})`;
}

export interface Swatch {
  name: string;
  hsl: string; // "H S% L%"
}

/**
 * Six swatches derived from the current cover palette — always cohesive with
 * whichever cover the user is on.
 */
export function useThemedSwatches(): Swatch[] {
  const { settings } = useUserSettings();
  const [tick, setTick] = useState(0);

  // Re-read variables on the next tick after cover change (useCoverTheme runs on effect).
  useEffect(() => {
    const t = window.setTimeout(() => setTick((n) => n + 1), 0);
    return () => window.clearTimeout(t);
  }, [settings?.coverId]);

  const primary = readVar("--primary", "145 18% 38%");
  const accent = readVar("--accent", "18 45% 60%");

  // Six harmonized swatches: primary, accent, and 4 hue-rotated tints in the same family.
  const swatches: Swatch[] = [
    { name: "Primary", hsl: primary },
    { name: "Accent", hsl: accent },
    { name: "Sky", hsl: shift(primary, 40, -5, 12) },
    { name: "Rose", hsl: shift(accent, -20, 0, 5) },
    { name: "Meadow", hsl: shift(primary, -30, 5, 8) },
    { name: "Gold", hsl: shift(accent, 25, 5, 5) },
  ];

  // Silence unused-tick warning; the state exists purely to re-run the read after theme change.
  void tick;
  return swatches;
}
