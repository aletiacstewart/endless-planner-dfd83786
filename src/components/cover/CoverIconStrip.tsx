import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { getPageImage } from "@/lib/pageImages";
import { cn } from "@/lib/utils";

type Props = {
  coverId?: string;
  intervalMs?: number;
  className?: string;
};

/**
 * Rotating preview of the 20 page icons that ship with a given cover.
 * When `coverId` changes, the icons update to that cover's pack (falling
 * back to the default pack for covers that don't ship an override yet).
 */
export function CoverIconStrip({ coverId, intervalMs = 5000, className }: Props) {
  const items = useMemo(
    () =>
      PAGE_TYPES.map((p) => ({
        id: p.id,
        name: p.name,
        src: getPageImage(p.id, coverId),
      })).filter((i) => Boolean(i.src)),
    [coverId]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reset when cover changes
  useEffect(() => setIndex(0), [coverId]);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [paused, items.length, intervalMs]);

  if (items.length === 0) return null;

  const current = items[index];
  const filmstrip = Array.from({ length: 6 }, (_, k) => items[(index + k) % items.length]);

  const go = (delta: number) => {
    setPaused(true);
    setIndex((i) => (i + delta + items.length) % items.length);
  };

  return (
    <div
      className={cn("flex flex-col gap-3", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative aspect-[16/10] rounded-lg overflow-hidden bg-muted">
        {items.map((it, i) => (
          <img
            key={it.id}
            src={it.src}
            alt={it.name}
            loading="lazy"
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={i !== index}
          />
        ))}

        <button
          type="button"
          aria-label="Previous icon"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          aria-label="Next icon"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-center justify-between text-white">
          <p className="text-sm font-medium truncate">{current.name}</p>
          <p className="text-[11px] opacity-80">
            {index + 1} / {items.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {filmstrip.map((it, i) => (
          <button
            key={`${it.id}-${i}`}
            type="button"
            onClick={() => { setPaused(true); setIndex((index + i) % items.length); }}
            className={cn(
              "aspect-square rounded-md overflow-hidden bg-muted ring-offset-background transition-all",
              i === 0 ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100"
            )}
            aria-label={`Preview ${it.name}`}
          >
            <img src={it.src} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
