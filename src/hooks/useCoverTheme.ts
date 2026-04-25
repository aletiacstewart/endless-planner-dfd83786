import { useEffect } from "react";
import { getCover } from "@/data/covers";

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
