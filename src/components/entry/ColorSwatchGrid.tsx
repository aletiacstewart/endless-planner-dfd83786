import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toCss } from "@/hooks/useThemedSwatches";
import {
  addCustomColor,
  getCustomColors,
  hexToHsl,
  hslToHex,
  removeCustomColor,
  subscribeCustomColors,
} from "@/lib/customPalette";
import { cn } from "@/lib/utils";

type Props = {
  /** Currently selected color as "H S% L%", or undefined for the default. */
  value?: string;
  /** Cover-themed swatches. */
  swatches: { name: string; hsl: string }[];
  onChange: (hsl: string | undefined) => void;
  /** Label for the "no color" reset button. Omit to hide the reset chip. */
  clearLabel?: string;
};

/**
 * Themed swatches + the user's own saved colors + a full custom color picker.
 * Custom colors persist across entries so a personal palette builds up.
 */
export function ColorSwatchGrid({ value, swatches, onChange, clearLabel = "Default color" }: Props) {
  const [custom, setCustom] = useState<string[]>(() => getCustomColors());
  const [draft, setDraft] = useState<string>(() => hslToHex(value ?? "150 30% 45%"));

  useEffect(() => subscribeCustomColors(setCustom), []);

  const pickCustom = (hex: string) => {
    setDraft(hex);
    const hsl = hexToHsl(hex);
    onChange(hsl);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {clearLabel && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className={cn(
              "w-6 h-6 rounded-full border flex items-center justify-center text-muted-foreground",
              !value ? "border-foreground" : "border-border",
            )}
            aria-label={clearLabel}
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {swatches.map((s) => {
          const active = value === s.hsl;
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => onChange(active ? undefined : s.hsl)}
              className={cn("w-6 h-6 rounded-full border", active ? "border-foreground scale-110" : "border-border/60")}
              style={{ background: toCss(s.hsl) }}
              aria-label={s.name}
            />
          );
        })}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">My colors</p>
        <div className="flex flex-wrap gap-1.5 items-center">
          {custom.map((hsl) => {
            const active = value === hsl;
            return (
              <span key={hsl} className="relative group">
                <button
                  type="button"
                  onClick={() => onChange(active ? undefined : hsl)}
                  className={cn("w-6 h-6 rounded-full border block", active ? "border-foreground scale-110" : "border-border/60")}
                  style={{ background: toCss(hsl) }}
                  aria-label={`Saved color ${hsl}`}
                />
                <button
                  type="button"
                  onClick={() => removeCustomColor(hsl)}
                  className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-background border border-border text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center justify-center"
                  aria-label="Remove saved color"
                >
                  <X className="w-2 h-2" />
                </button>
              </span>
            );
          })}

          <label
            className="w-6 h-6 rounded-full border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-foreground"
            title="Pick a custom color"
          >
            <Plus className="w-3 h-3 text-muted-foreground" />
            <input
              type="color"
              value={draft}
              onChange={(e) => pickCustom(e.target.value)}
              className="sr-only"
              aria-label="Pick a custom color"
            />
          </label>

          <button
            type="button"
            onClick={() => setCustom(addCustomColor(hexToHsl(draft)))}
            className="text-[10px] px-2 h-6 rounded-full border border-border text-muted-foreground hover:text-foreground"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
