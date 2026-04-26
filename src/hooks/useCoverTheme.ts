import { useEffect } from "react";
import { getCover } from "@/data/covers";

/** Parse "H S% L%" → [h, s, l] numbers. Returns null on bad input. */
function parseHsl(hsl: string): [number, number, number] | null {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s*$/.exec(hsl);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

/** Build a soft variant of an accent color, palette-mode aware. */
function softFromAccent(accent: string, mode: "light" | "dark"): string {
  const parsed = parseHsl(accent);
  if (!parsed) return accent;
  const [h, s] = parsed;
  if (mode === "dark") {
    // Deep, low-saturation chip that still tints.
    return `${h} ${Math.max(20, Math.min(40, s * 0.4))}% 22%`;
  }
  // Light, low-saturation chip.
  return `${h} ${Math.max(30, Math.min(55, s * 0.6))}% 90%`;
}

/**
 * Applies the selected cover's palette to :root CSS variables and toggles the
 * .dark class so shadcn components pick the right mode automatically.
 */
export function useCoverTheme(coverId: string | null | undefined) {
  useEffect(() => {
    const cover = getCover(coverId);
    const p = cover.palette;
    const root = document.documentElement;

    const set = (name: string, value: string) => root.style.setProperty(name, value);
    set("--background", p.background);
    set("--foreground", p.foreground);
    set("--card", p.card);
    set("--card-foreground", p.cardForeground);
    set("--popover", p.card);
    set("--popover-foreground", p.cardForeground);
    set("--primary", p.primary);
    set("--primary-foreground", p.primaryForeground);
    set("--primary-soft", p.primarySoft);
    set("--accent", p.accent);
    set("--accent-foreground", p.accentForeground);
    set("--accent-soft", softFromAccent(p.accent, p.mode));
    set("--secondary", p.muted);
    set("--secondary-foreground", p.foreground);
    set("--muted", p.muted);
    set("--muted-foreground", p.mutedForeground);
    set("--border", p.border);
    set("--input", p.border);
    set("--ring", p.primary);
    set("--paper", p.card);
    set("--ink", p.foreground);
    set("--ink-soft", p.mutedForeground);
    set("--gradient-paper", p.paperGradient);

    root.classList.toggle("dark", p.mode === "dark");
  }, [coverId]);
}
