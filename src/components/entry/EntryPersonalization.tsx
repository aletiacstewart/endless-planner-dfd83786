import { useState } from "react";
import { Check, Palette, Sticker as StickerIcon, Type, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useThemedSwatches, toCss } from "@/hooks/useThemedSwatches";
import {
  FONT_LABELS,
  UNIVERSAL_STICKERS,
  newStickerId,
  type EntryFont,
  type EntryFontSize,
  type EntryMeta,
  type Sticker,
} from "@/lib/entryMeta";
import { cn } from "@/lib/utils";

interface Props {
  meta: EntryMeta;
  onChange: (patch: Partial<EntryMeta>) => void;
}

const FONTS: EntryFont[] = ["serif", "sans", "hand", "mono"];
const SIZES: { v: EntryFontSize; label: string }[] = [
  { v: "sm", label: "S" },
  { v: "md", label: "M" },
  { v: "lg", label: "L" },
];

export function EntryPersonalization({ meta, onChange }: Props) {
  const swatches = useThemedSwatches();
  const [stickerOpen, setStickerOpen] = useState(false);

  const addSticker = (s: Omit<Sticker, "id" | "x" | "y" | "size">) => {
    const sticker: Sticker = {
      id: newStickerId(),
      ...s,
      x: 20 + Math.random() * 40,
      y: 20 + Math.random() * 30,
      size: 48,
    };
    onChange({ stickers: [...(meta.stickers ?? []), sticker] });
    setStickerOpen(false);
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {/* Color swatches */}
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-1.5 py-1">
        <Palette className="w-3.5 h-3.5 text-muted-foreground ml-0.5" />
        {swatches.map((s) => {
          const active = meta.color === s.hsl;
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => onChange({ color: active ? undefined : s.hsl })}
              aria-label={s.name}
              className={cn(
                "w-5 h-5 rounded-full border transition-transform",
                active ? "border-foreground scale-110" : "border-border/60"
              )}
              style={{ background: toCss(s.hsl) }}
            >
              {active && <Check className="w-3 h-3 mx-auto text-white drop-shadow" />}
            </button>
          );
        })}
        {meta.color && (
          <button
            type="button"
            onClick={() => onChange({ color: undefined })}
            className="w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Clear color"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Font family */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 h-8 text-xs font-medium"
          >
            <Type className="w-3.5 h-3.5" />
            {FONT_LABELS[meta.font ?? "serif"]}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-1" align="start">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChange({ font: f })}
              className={cn(
                "w-full flex items-center justify-between px-2 py-1.5 rounded text-sm hover:bg-muted",
                meta.font === f && "bg-muted"
              )}
            >
              <span style={{ fontFamily: f === "hand" ? "'Caveat', cursive" : f === "mono" ? "ui-monospace, Menlo, monospace" : f === "serif" ? "'Cormorant Garamond', serif" : "'Inter', sans-serif" }}>
                {FONT_LABELS[f]}
              </span>
              {meta.font === f && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {/* Size */}
      <div className="inline-flex items-center rounded-full border border-border bg-card/60 h-8 overflow-hidden">
        {SIZES.map(({ v, label }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange({ fontSize: v })}
            className={cn(
              "w-8 h-full text-xs font-medium",
              (meta.fontSize ?? "md") === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stickers */}
      <Popover open={stickerOpen} onOpenChange={setStickerOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 h-8 text-xs font-medium"
          >
            <StickerIcon className="w-3.5 h-3.5" />
            Sticker
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Add a sticker</p>
          <div className="grid grid-cols-8 gap-1">
            {UNIVERSAL_STICKERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => addSticker({ src: s.emoji, kind: "emoji" })}
                title={s.label}
                className="w-7 h-7 flex items-center justify-center text-lg rounded hover:bg-muted"
              >
                {s.emoji}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground px-1 mt-2">
            Drag on the page to move. Double-tap to remove.
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
