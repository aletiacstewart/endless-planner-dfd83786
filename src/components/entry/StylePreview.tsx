import {
  ACCENT_WIDTH_PX,
  DENSITY_PADDING,
  FONT_SIZE_PX,
  FONT_STACKS,
  SUBTITLE_SIZE_REM,
  TITLE_SIZE_REM,
  getTypo,
  type EntryMeta,
} from "@/lib/entryMeta";
import { toCss } from "@/hooks/useThemedSwatches";

/**
 * Miniature planner page that mirrors a style draft, so the look can be judged
 * before it is applied to every page. Purely presentational.
 */
export function StylePreview({ meta }: { meta: EntryMeta }) {
  const title = getTypo(meta, "title");
  const sub = getTypo(meta, "subtitle");
  const body = getTypo(meta, "body");
  const bg = meta.background ?? { kind: "paper" as const };
  const accent = meta.color ? toCss(meta.color) : undefined;
  const pad = DENSITY_PADDING[meta.density ?? "cozy"];

  const pattern =
    bg.kind === "pattern"
      ? bg.pattern === "lines"
        ? "repeating-linear-gradient(0deg, hsl(var(--foreground) / 0.06) 0 1px, transparent 1px 14px)"
        : bg.pattern === "grid"
          ? "linear-gradient(hsl(var(--foreground) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.06) 1px, transparent 1px)"
          : "radial-gradient(hsl(var(--foreground) / 0.08) 1px, transparent 1px)"
      : undefined;

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <div
        className="p-3"
        style={{
          background: bg.kind === "paper" ? "var(--gradient-paper)" : bg.color ? toCss(bg.color) : "var(--gradient-paper)",
          backgroundImage: pattern,
          backgroundSize: bg.kind === "pattern" ? (bg.pattern === "grid" ? "14px 14px" : "12px 12px") : undefined,
          borderLeft: accent ? `${ACCENT_WIDTH_PX[meta.accentWidth ?? "md"]} solid ${accent}` : undefined,
        }}
      >
        <p
          className="leading-tight truncate"
          style={{
            fontFamily: FONT_STACKS[title.font ?? "serif"],
            fontSize: `calc(${TITLE_SIZE_REM[title.size ?? "md"]} * 0.5)`,
            color: title.color ? toCss(title.color) : undefined,
          }}
        >
          My Goals
        </p>
        <p
          className="truncate"
          style={{
            fontFamily: FONT_STACKS[sub.font ?? "serif"],
            fontSize: `calc(${SUBTITLE_SIZE_REM[sub.size ?? "md"]} * 0.62)`,
            color: sub.color ? toCss(sub.color) : undefined,
          }}
        >
          A gentle look at this season
        </p>

        <div
          className="mt-2 rounded-lg border border-border/70"
          style={{
            padding: `calc(${pad} * 0.45)`,
            background: meta.sectionTint ? `hsl(${meta.sectionTint} / 0.08)` : "hsl(var(--card))",
            borderColor: meta.sectionTint ? toCss(meta.sectionTint) : undefined,
          }}
        >
          <p
            style={{
              fontFamily: FONT_STACKS[body.font ?? "sans"],
              fontSize: `calc(${FONT_SIZE_PX[body.size ?? "md"]} * 0.72)`,
              color: body.color ? toCss(body.color) : undefined,
            }}
          >
            Walk for twenty minutes.
          </p>
          <div className="mt-1.5 space-y-1">
            <span className="block h-1 rounded bg-foreground/10" />
            <span className="block h-1 w-3/4 rounded bg-foreground/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
