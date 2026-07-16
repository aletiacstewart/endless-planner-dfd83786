import { useMemo } from "react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { getPageImage } from "@/lib/pageImages";
import { cn } from "@/lib/utils";

type Props = {
  coverId?: string;
  className?: string;
};

/**
 * Static grid of all page icons that ship with the given cover.
 * Updates when `coverId` changes so it stays in sync with the cover slideshow.
 */
export function CoverIconStrip({ coverId, className }: Props) {
  const items = useMemo(
    () =>
      PAGE_TYPES.map((p) => ({
        id: p.id,
        name: p.name,
        src: getPageImage(p.id, coverId),
      })).filter((i) => Boolean(i.src)),
    [coverId]
  );

  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-5 gap-1.5 p-2 rounded-lg bg-muted/40">
        {items.map((it) => (
          <div
            key={it.id}
            className="aspect-square rounded-md overflow-hidden bg-background"
            title={it.name}
          >
            <img
              src={it.src}
              alt={it.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-center">
        {items.length} page icons included with this cover
      </p>
    </div>
  );
}
