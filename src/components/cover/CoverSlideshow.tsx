import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COVERS } from "@/data/covers";
import { CoverImage } from "./CoverImage";
import { cn } from "@/lib/utils";

type Props = {
  intervalMs?: number;
  onCoverChange?: (coverId: string) => void;
  className?: string;
};

export function CoverSlideshow({ intervalMs = 7000, onCoverChange, className }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || COVERS.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % COVERS.length), intervalMs);
    return () => clearInterval(t);
  }, [paused, reducedMotion, intervalMs]);

  useEffect(() => {
    onCoverChange?.(COVERS[index]?.id);
  }, [index, onCoverChange]);

  const go = (delta: number) =>
    setIndex((i) => (i + delta + COVERS.length) % COVERS.length);

  const current = COVERS[index];
  if (!current) return null;

  return (
    <div
      className={cn(
        "relative aspect-[3/4] rounded-lg overflow-hidden bg-muted group",
        className
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {COVERS.map((c, i) => (
        <div
          key={c.id}
          className={cn(
            "absolute inset-0 flex items-start justify-center transition-opacity duration-700",
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          aria-hidden={i !== index}
        >
          <CoverImage cover={c} className="!object-contain object-top" />
        </div>
      ))}

      {/* Prev / Next */}
      <button
        type="button"
        aria-label="Previous cover"
        onClick={() => { setPaused(true); go(-1); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Next cover"
        onClick={() => { setPaused(true); go(1); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-center justify-between text-white">
        <p className="text-sm font-medium truncate">{current.name}</p>
        <p className="text-[11px] opacity-80">
          {index + 1} / {COVERS.length}
        </p>
      </div>
    </div>
  );
}
