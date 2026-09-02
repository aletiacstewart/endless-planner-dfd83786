import { useEffect, useRef, useState } from "react";
import {
  Check,
  Palette,
  Sticker as StickerIcon,
  RefreshCw,
  Layers,
  Square,
  Rows3,
  Heading1,
  Heading2,
  TextCursorInput,
  Sparkles,
} from "lucide-react";
import { useThemedSwatches, toCss } from "@/hooks/useThemedSwatches";
import { useUserSettings } from "@/hooks/useUserSettings";
import { StickerLibraryDialog } from "@/components/entry/StickerLibraryDialog";
import { ColorSwatchGrid } from "@/components/entry/ColorSwatchGrid";
import { getRecentStickers, saveRecentSticker, type RecentSticker } from "@/lib/recentStickers";
import type { StickerAsset } from "@/data/stickers";
import { insertInlineSticker } from "@/lib/inlineStickers";
import {
  FONT_LABELS,
  FONT_STACKS,
  STICKER_GROUPS,
  newStickerId,
  topStickerZ,
  getTypo,
  type EntryFont,
  type EntryFontSize,
  type EntryMeta,
  type Sticker,
  type TypoSpec,
  type EntryDensity,
  type EntryAccentWidth,
  type BackgroundSpec,
  type EntryPattern,
} from "@/lib/entryMeta";
import { cn } from "@/lib/utils";

interface Props {
  meta: EntryMeta;
  onChange: (patch: Partial<EntryMeta>) => void;
  onTypography: (group: "title" | "subtitle" | "body", patch: Partial<TypoSpec>) => void;
  onReset: () => void;
}

const FONTS: EntryFont[] = ["serif", "sans", "hand", "mono", "display", "rounded"];
const SIZES: { v: EntryFontSize; label: string }[] = [
  { v: "sm", label: "S" },
  { v: "md", label: "M" },
  { v: "lg", label: "L" },
  { v: "xl", label: "XL" },
];
const DENSITIES: { v: EntryDensity; label: string }[] = [
  { v: "compact", label: "Compact" },
  { v: "cozy", label: "Cozy" },
  { v: "spacious", label: "Spacious" },
];
const ACCENT_WIDTHS: { v: EntryAccentWidth; label: string }[] = [
  { v: "sm", label: "Thin" },
  { v: "md", label: "Med" },
  { v: "lg", label: "Bold" },
];
const PATTERNS: { v: EntryPattern; label: string }[] = [
  { v: "dots", label: "Dots" },
  { v: "lines", label: "Lines" },
  { v: "grid", label: "Grid" },
];

/** Which chip's panel is currently expanded. */
type PanelId = "title" | "subtitle" | "body" | "background" | "cards" | "accent" | "density" | "sticker";

export function EntryPersonalization({ meta, onChange, onTypography, onReset }: Props) {
  const swatches = useThemedSwatches();
  const { settings } = useUserSettings();
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [stickerTab, setStickerTab] = useState(STICKER_GROUPS[0].id);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [recents, setRecents] = useState<RecentSticker[]>(() => getRecentStickers());
  const wrapRef = useRef<HTMLDivElement>(null);

  /**
   * Self-managed open/close. The chips used to rely on anchored popovers, which
   * dismissed themselves the instant they opened; keeping the panel inline and
   * owning the outside-click logic here removes that whole class of failure.
   */
  useEffect(() => {
    if (!panel) return;
    const onDown = (e: Event) => {
      const el = wrapRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  const toggle = (id: PanelId) => setPanel((cur) => (cur === id ? null : id));

  const pushRecent = (r: RecentSticker) => setRecents(saveRecentSticker(r));

  const addSticker = (emoji: string) => {
    pushRecent({ kind: "emoji", src: emoji });
    // If a text field is focused, place the sticker inside it at the caret.
    if (insertInlineSticker({ kind: "emoji", src: emoji, size: 28 })) return;
    const s: Sticker = {
      id: newStickerId(),
      src: emoji,
      kind: "emoji",
      x: 50 + (Math.random() * 10 - 5),
      y: 45 + (Math.random() * 10 - 5),
      size: 48,
      z: topStickerZ(meta.stickers) + 1,
    };
    onChange({ stickers: [...(meta.stickers ?? []), s] });
    // Tray intentionally stays open so you can place several stickers in a row.
  };

  const addFromLibrary = (a: StickerAsset) => {
    pushRecent({ kind: a.kind, src: a.src, label: a.label });
    if (insertInlineSticker({ kind: a.kind, src: a.src, label: a.label, size: a.kind === "emoji" ? 28 : 48 }))
      return;
    const s: Sticker = {
      id: newStickerId(),
      src: a.src,
      kind: a.kind,
      x: 50 + (Math.random() * 10 - 5),
      y: 45 + (Math.random() * 10 - 5),
      size: a.kind === "emoji" ? 48 : 96,
      z: topStickerZ(meta.stickers) + 1,
    };
    onChange({ stickers: [...(meta.stickers ?? []), s] });
  };

  /** Quick-access tray: re-place any sticker used recently, in one tap. */
  const addRecent = (r: RecentSticker) => {
    pushRecent(r);
    if (insertInlineSticker({ kind: r.kind, src: r.src, label: r.label, size: r.kind === "emoji" ? 28 : 48 }))
      return;
    const s: Sticker = {
      id: newStickerId(),
      src: r.src,
      kind: r.kind,
      x: 50 + (Math.random() * 10 - 5),
      y: 45 + (Math.random() * 10 - 5),
      size: r.kind === "emoji" ? 48 : 96,
      z: topStickerZ(meta.stickers) + 1,
    };
    onChange({ stickers: [...(meta.stickers ?? []), s] });
  };


  const bg = meta.background ?? { kind: "paper" as const };
  const setBg = (next: BackgroundSpec) => onChange({ background: next });

  return (
    <div ref={wrapRef} className="mt-3">
      {/* Chip strip (scrolls horizontally on small screens) */}
      <div className="-mx-1 px-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1">
          <Chip
            active={panel === "title"}
            onClick={() => toggle("title")}
            icon={<Heading1 className="w-3.5 h-3.5" />}
            label="Title"
            dot={getTypo(meta, "title").color}
          />
          <Chip
            active={panel === "subtitle"}
            onClick={() => toggle("subtitle")}
            icon={<Heading2 className="w-3.5 h-3.5" />}
            label="Subtitle"
            dot={getTypo(meta, "subtitle").color}
          />
          <Chip
            active={panel === "body"}
            onClick={() => toggle("body")}
            icon={<TextCursorInput className="w-3.5 h-3.5" />}
            label="Body"
            dot={getTypo(meta, "body").color}
          />

          <Divider />

          <Chip
            active={panel === "background"}
            onClick={() => toggle("background")}
            icon={<Square className="w-3.5 h-3.5" />}
            label="Background"
            dot={bg.color}
          />
          <Chip
            active={panel === "cards"}
            onClick={() => toggle("cards")}
            icon={<Layers className="w-3.5 h-3.5" />}
            label="Cards"
            dot={meta.sectionTint}
          />
          <Chip
            active={panel === "accent"}
            onClick={() => toggle("accent")}
            icon={<Palette className="w-3.5 h-3.5" />}
            label="Accent"
            dot={meta.color}
          />
          <Chip
            active={panel === "density"}
            onClick={() => toggle("density")}
            icon={<Rows3 className="w-3.5 h-3.5" />}
            label={DENSITIES.find((d) => d.v === (meta.density ?? "cozy"))?.label ?? "Cozy"}
          />

          <Divider />

          <Chip
            active={panel === "sticker"}
            onClick={() => toggle("sticker")}
            icon={<StickerIcon className="w-3.5 h-3.5" />}
            label="Sticker"
          />

          <button
            type="button"
            className={chipClass}
            onClick={() => setLibraryOpen(true)}
            title="Open themed sticker library for your active cover"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Library
          </button>

          <button
            type="button"
            onClick={onReset}
            className={cn(chipClass, "text-destructive")}
            title="Reset all personalization"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Inline panel — rendered outside the scroll strip so it never clips */}
      {panel && (
        <div className="mt-2 rounded-xl border border-border bg-card p-3 shadow-sm">
          {(panel === "title" || panel === "subtitle" || panel === "body") && (
            <TypoPanel
              spec={getTypo(meta, panel)}
              swatches={swatches}
              onChange={(p) => onTypography(panel, p)}
            />
          )}

          {panel === "background" && (
            <div>
              <Legend>Style</Legend>
              <div className="inline-flex rounded-md border border-border overflow-hidden mb-3">
                {(["paper", "solid", "pattern"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setBg({ ...bg, kind: k })}
                    className={cn(
                      "px-2.5 h-7 text-[11px] font-medium capitalize",
                      bg.kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>

              {bg.kind !== "paper" && (
                <>
                  <Legend>Color</Legend>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {[
                      { name: "White", hsl: "0 0% 100%" },
                      { name: "Off-white", hsl: "40 30% 97%" },
                      ...swatches.map((s) => ({ name: s.name, hsl: shiftLight(s.hsl, 78) })),
                    ].map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => setBg({ ...bg, color: s.hsl })}
                        className={cn(
                          "w-6 h-6 rounded-full border",
                          bg.color === s.hsl ? "border-foreground scale-110" : "border-border/60",
                        )}
                        style={{ background: toCss(s.hsl) }}
                        aria-label={s.name}
                      />
                    ))}
                  </div>
                </>
              )}

              {bg.kind === "pattern" && (
                <>
                  <Legend>Pattern</Legend>
                  <div className="inline-flex rounded-md border border-border overflow-hidden">
                    {PATTERNS.map(({ v, label }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setBg({ ...bg, pattern: v })}
                        className={cn(
                          "px-2.5 h-7 text-[11px] font-medium",
                          bg.pattern === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {panel === "cards" && (
            <div>
              <Legend>Card tint</Legend>
              <ColorSwatchGrid
                value={meta.sectionTint}
                swatches={swatches}
                clearLabel="No tint"
                onChange={(hsl) => onChange({ sectionTint: hsl })}
              />
            </div>
          )}

          {panel === "accent" && (
            <div>
              <Legend>Stripe color</Legend>
              <div className="mb-3">
                <ColorSwatchGrid
                  value={meta.color}
                  swatches={swatches}
                  clearLabel="No accent"
                  onChange={(hsl) => onChange({ color: hsl })}
                />
              </div>
              <Legend>Width</Legend>
              <div className="inline-flex rounded-md border border-border overflow-hidden">
                {ACCENT_WIDTHS.map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onChange({ accentWidth: v })}
                    className={cn(
                      "px-2.5 h-7 text-[11px] font-medium",
                      (meta.accentWidth ?? "md") === v
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {panel === "density" && (
            <div className="max-w-xs">
              <Legend>Spacing</Legend>
              {DENSITIES.map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ density: v })}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted",
                    (meta.density ?? "cozy") === v && "bg-muted",
                  )}
                >
                  {label}
                  {(meta.density ?? "cozy") === v && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}

          {panel === "sticker" && (
            <div>
              {recents.length > 0 && (
                <div className="mb-3">
                  <Legend>Recent</Legend>
                  <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                    {recents.map((r) => (
                      <button
                        key={`${r.kind}-${r.src}`}
                        type="button"
                        onClick={() => addRecent(r)}
                        title={r.label ?? "Place again"}
                        className="w-8 h-8 shrink-0 flex items-center justify-center text-lg rounded border border-border hover:border-primary hover:bg-primary/5"
                      >
                        {r.kind === "emoji" ? (
                          <span>{r.src}</span>
                        ) : (
                          <img src={r.src} alt={r.label ?? ""} className="w-full h-full object-contain p-0.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-1 mb-2">
                {STICKER_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setStickerTab(g.id)}
                    className={cn(
                      "px-2 py-1 text-[11px] rounded-full whitespace-nowrap border",
                      stickerTab === g.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {(STICKER_GROUPS.find((g) => g.id === stickerTab)?.emojis ?? []).map((e, i) => (
                  <button
                    key={`${e}-${i}`}
                    type="button"
                    onClick={() => addSticker(e)}
                    className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-muted"
                  >
                    {e}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Tap as many as you like — the tray stays open. Tap outside it (or the
                Sticker button again) to close, then drag stickers into place.
              </p>
            </div>
          )}
        </div>
      )}

      <StickerLibraryDialog
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        coverId={settings?.coverId}
        onPick={addFromLibrary}
      />
    </div>
  );
}

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 h-8 text-xs font-medium whitespace-nowrap";

function Chip({
  icon,
  label,
  active,
  onClick,
  dot,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  dot?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(chipClass, active && "border-primary bg-primary/10 text-primary")}
    >
      {icon}
      {label}
      {dot && (
        <span className="w-3 h-3 rounded-full border border-border/60" style={{ background: toCss(dot) }} />
      )}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-border/70 mx-0.5 shrink-0" />;
}

function Legend({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">{children}</p>;
}

/* -------------------- Typography panel -------------------- */

function TypoPanel({
  spec,
  swatches,
  onChange,
}: {
  spec: TypoSpec;
  swatches: { name: string; hsl: string }[];
  onChange: (p: Partial<TypoSpec>) => void;
}) {
  return (
    <div>
      <Legend>Font</Legend>
      <div className="flex flex-wrap gap-1 mb-3">
        {FONTS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange({ font: f })}
            className={cn(
              "px-2.5 py-1.5 rounded text-xs border",
              (spec.font ?? "") === f ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
            )}
            style={{ fontFamily: FONT_STACKS[f] }}
          >
            {FONT_LABELS[f]}
          </button>
        ))}
      </div>
      <Legend>Size</Legend>
      <div className="inline-flex rounded-md border border-border overflow-hidden mb-3">
        {SIZES.map(({ v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange({ size: v })}
            className={cn(
              "w-9 h-8 text-[11px] font-medium",
              (spec.size ?? "md") === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <Legend>Color</Legend>
      <ColorSwatchGrid value={spec.color} swatches={swatches} onChange={(hsl) => onChange({ color: hsl })} />
    </div>
  );
}

/** Lighten an "H S% L%" HSL string to a fixed lightness. */
function shiftLight(hsl: string, targetL: number): string {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)%\s+(-?\d+(?:\.\d+)?)%\s*$/.exec(hsl);
  if (!m) return hsl;
  const h = Number(m[1]);
  const s = Math.min(45, Number(m[2]));
  return `${h} ${s}% ${targetL}%`;
}
