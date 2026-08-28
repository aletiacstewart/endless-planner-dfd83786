import { useState } from "react";
import {
  Check,
  Palette,
  Sticker as StickerIcon,
  Type,
  RefreshCw,
  Layers,
  Square,
  Rows3,
  Heading1,
  Heading2,
  TextCursorInput,
  X,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useThemedSwatches, toCss } from "@/hooks/useThemedSwatches";
import { useUserSettings } from "@/hooks/useUserSettings";
import { StickerLibraryDialog } from "@/components/entry/StickerLibraryDialog";
import { ColorSwatchGrid } from "@/components/entry/ColorSwatchGrid";
import { getRecentStickers, saveRecentSticker, type RecentSticker } from "@/lib/recentStickers";
import type { StickerAsset } from "@/data/stickers";
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

export function EntryPersonalization({ meta, onChange, onTypography, onReset }: Props) {
  const swatches = useThemedSwatches();
  const { settings } = useUserSettings();
  const [stickerOpen, setStickerOpen] = useState(false);
  const [stickerTab, setStickerTab] = useState(STICKER_GROUPS[0].id);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [recents, setRecents] = useState<RecentSticker[]>(() => getRecentStickers());

  const pushRecent = (r: RecentSticker) => setRecents(saveRecentSticker(r));

  const addSticker = (emoji: string) => {
    // Default position: near top-center of the page (user asked for it)
    const s: Sticker = {
      id: newStickerId(),
      src: emoji,
      kind: "emoji",
      x: 50 + (Math.random() * 12 - 6),
      y: 6 + Math.random() * 4,
      size: 48,
      z: topStickerZ(meta.stickers) + 1,
    };
    onChange({ stickers: [...(meta.stickers ?? []), s] });
    pushRecent({ kind: "emoji", src: emoji });
    // Tray intentionally stays open so you can place several stickers in a row.
  };

  const addFromLibrary = (a: StickerAsset) => {
    const s: Sticker = {
      id: newStickerId(),
      src: a.src,
      kind: a.kind,
      x: 50 + (Math.random() * 12 - 6),
      y: 6 + Math.random() * 4,
      size: a.kind === "emoji" ? 48 : 96,
      z: topStickerZ(meta.stickers) + 1,
    };
    onChange({ stickers: [...(meta.stickers ?? []), s] });
    pushRecent({ kind: a.kind, src: a.src, label: a.label });
  };

  /** Quick-access tray: re-place any sticker used recently, in one tap. */
  const addRecent = (r: RecentSticker) => {
    const s: Sticker = {
      id: newStickerId(),
      src: r.src,
      kind: r.kind,
      x: 50 + (Math.random() * 12 - 6),
      y: 6 + Math.random() * 4,
      size: r.kind === "emoji" ? 48 : 96,
      z: topStickerZ(meta.stickers) + 1,
    };
    onChange({ stickers: [...(meta.stickers ?? []), s] });
    pushRecent(r);
  };


  return (
    <div className="mt-3 -mx-1 px-1 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2 min-w-max pb-1">
        {/* Typography groups */}
        <TypoChip
          icon={<Heading1 className="w-3.5 h-3.5" />}
          label="Title"
          spec={getTypo(meta, "title")}
          swatches={swatches}
          onChange={(p) => onTypography("title", p)}
        />
        <TypoChip
          icon={<Heading2 className="w-3.5 h-3.5" />}
          label="Subtitle"
          spec={getTypo(meta, "subtitle")}
          swatches={swatches}
          onChange={(p) => onTypography("subtitle", p)}
        />
        <TypoChip
          icon={<TextCursorInput className="w-3.5 h-3.5" />}
          label="Body"
          spec={getTypo(meta, "body")}
          swatches={swatches}
          onChange={(p) => onTypography("body", p)}
        />

        <Divider />

        {/* Background */}
        <BackgroundChip
          bg={meta.background}
          swatches={swatches}
          onChange={(bg) => onChange({ background: bg })}
        />

        {/* Section tint */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={chipClass}>
              <Layers className="w-3.5 h-3.5" />
              Cards
              {meta.sectionTint && (
                <span className="w-3 h-3 rounded-full border border-border/60" style={{ background: toCss(meta.sectionTint) }} />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1.5">Card tint</p>
            <ColorSwatchGrid
              value={meta.sectionTint}
              swatches={swatches}
              clearLabel="No tint"
              onChange={(hsl) => onChange({ sectionTint: hsl })}
            />
          </PopoverContent>
        </Popover>

        {/* Accent stripe */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={chipClass}>
              <Palette className="w-3.5 h-3.5" />
              Accent
              {meta.color && (
                <span className="w-3 h-3 rounded-full border border-border/60" style={{ background: toCss(meta.color) }} />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1.5">Stripe color</p>
            <div className="mb-2">
              <ColorSwatchGrid
                value={meta.color}
                swatches={swatches}
                clearLabel="No accent"
                onChange={(hsl) => onChange({ color: hsl })}
              />
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Width</p>
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              {ACCENT_WIDTHS.map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ accentWidth: v })}
                  className={cn(
                    "px-2 h-7 text-[11px] font-medium",
                    (meta.accentWidth ?? "md") === v
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Density */}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className={chipClass}>
              <Rows3 className="w-3.5 h-3.5" />
              {DENSITIES.find((d) => d.v === (meta.density ?? "cozy"))?.label}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="start">
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
          </PopoverContent>
        </Popover>

        <Divider />

        {/* Stickers */}
        <Popover open={stickerOpen} onOpenChange={setStickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={chipClass}
              // Some touch devices emit a synthetic second click that would
              // instantly re-toggle (open→close) the tray — swallow it.
              onPointerDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                setStickerOpen((v) => !v);
              }}
            >
              <StickerIcon className="w-3.5 h-3.5" />
              Sticker
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-2" align="start">
            {recents.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Recent</p>
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
                    stickerTab === g.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground",
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-8 gap-1">
              {(STICKER_GROUPS.find((g) => g.id === stickerTab)?.emojis ?? []).map((e, i) => (
                <button
                  key={`${e}-${i}`}
                  type="button"
                  onClick={() => addSticker(e)}
                  className="w-7 h-7 flex items-center justify-center text-lg rounded hover:bg-muted"
                >
                  {e}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground px-1 mt-2">
              Tap as many as you like — the tray stays open. Tap outside it (or the
              Sticker button again) to close, then drag stickers into place.
            </p>
          </PopoverContent>
        </Popover>

        {/* Themed Sticker Library */}
        <button
          type="button"
          className={chipClass}
          onClick={() => setLibraryOpen(true)}
          title="Open themed sticker library for your active cover"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Library
        </button>

        {/* Reset */}
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

function Divider() {
  return <span className="w-px h-5 bg-border/70 mx-0.5 shrink-0" />;
}

/* -------------------- Typography chip -------------------- */

function TypoChip({
  icon,
  label,
  spec,
  swatches,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  spec: TypoSpec;
  swatches: { name: string; hsl: string }[];
  onChange: (p: Partial<TypoSpec>) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={chipClass}>
          {icon}
          {label}
          {spec.color && (
            <span className="w-3 h-3 rounded-full border border-border/60" style={{ background: toCss(spec.color) }} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Font</p>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChange({ font: f })}
              className={cn(
                "px-2 py-1.5 rounded text-xs text-left border",
                (spec.font ?? "") === f ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
              )}
              style={{ fontFamily: FONT_STACKS[f] }}
            >
              {FONT_LABELS[f]}
            </button>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Size</p>
        <div className="inline-flex rounded-md border border-border overflow-hidden mb-2">
          {SIZES.map(({ v, label: sl }) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ size: v })}
              className={cn(
                "w-9 h-8 text-[11px] font-medium",
                (spec.size ?? "md") === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {sl}
            </button>
          ))}
        </div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Color</p>
        <ColorSwatchGrid
          value={spec.color}
          swatches={swatches}
          onChange={(hsl) => onChange({ color: hsl })}
        />
      </PopoverContent>
    </Popover>
  );
}

/* -------------------- Background chip -------------------- */

const PATTERNS: { v: EntryPattern; label: string }[] = [
  { v: "dots", label: "Dots" },
  { v: "lines", label: "Lines" },
  { v: "grid", label: "Grid" },
];

function BackgroundChip({
  bg,
  swatches,
  onChange,
}: {
  bg: BackgroundSpec | undefined;
  swatches: { name: string; hsl: string }[];
  onChange: (bg: BackgroundSpec | undefined) => void;
}) {
  const current = bg ?? { kind: "paper" as const };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={chipClass}>
          <Square className="w-3.5 h-3.5" />
          Background
          {current.color && (
            <span className="w-3 h-3 rounded-full border border-border/60" style={{ background: toCss(current.color) }} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Style</p>
        <div className="inline-flex rounded-md border border-border overflow-hidden mb-2">
          {(["paper", "solid", "pattern"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => onChange({ ...current, kind: k })}
              className={cn(
                "px-2 h-7 text-[11px] font-medium capitalize",
                current.kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {k}
            </button>
          ))}
        </div>

        {current.kind !== "paper" && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Color</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                { name: "White", hsl: "0 0% 100%" },
                { name: "Off-white", hsl: "40 30% 97%" },
                ...swatches.map((s) => ({ name: s.name, hsl: shiftLight(s.hsl, 78) })),
              ].map((s) => {
                const active = current.color === s.hsl;
                return (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => onChange({ ...current, color: s.hsl })}
                    className={cn("w-6 h-6 rounded-full border", active ? "border-foreground scale-110" : "border-border/60")}
                    style={{ background: toCss(s.hsl) }}
                    aria-label={s.name}
                  />
                );
              })}
            </div>
          </>
        )}

        {current.kind === "pattern" && (
          <>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Pattern</p>
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              {PATTERNS.map(({ v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ ...current, pattern: v })}
                  className={cn(
                    "px-2 h-7 text-[11px] font-medium",
                    current.pattern === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
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
