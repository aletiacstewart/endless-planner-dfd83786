import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { COLLECTIONS, type Cover } from "@/data/covers";
import { CoverImage } from "./CoverImage";
import { cn } from "@/lib/utils";

type Props = {
  covers: Cover[];
  /** Link target builder for a cover slide. */
  hrefFor: (cover: Cover) => string;
  intervalMs?: number;
  className?: string;
};

/**
 * Storefront cover slideshow. Auto-advances one slide at a time, pauses on
 * hover/focus, respects prefers-reduced-motion, and every slide is a real
 * link to the planner page for that cover.
 */
export function CoverCarousel({ covers, hrefFor, intervalMs = 4500, className }: Props) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Reset to the first slide whenever the cover list changes (filter chips).
  const listKey = useMemo(() => covers.map((c) => c.id).join("|"), [covers]);
  useEffect(() => {
    setIndex(0);
  }, [listKey]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion || covers.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % covers.length), intervalMs);
    return () => clearInterval(t);
  }, [paused, reducedMotion, covers.length, intervalMs]);

  // Keep the active slide scrolled into view inside the track.
  useEffect(() => {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: reducedMotion ? "auto" : "smooth" });
  }, [index, reducedMotion]);

  if (covers.length === 0) return null;

  const go = (delta: number) =>
    setIndex((i) => (i + delta + covers.length) % covers.length);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-label="Cover collection slideshow"
    >
      <div
        ref={trackRef}
        className="flex gap-6 lg:gap-10 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {covers.map((c, i) => (
          <Link
            key={c.id}
            to={hrefFor(c)}
            aria-current={i === index ? "true" : undefined}
            className="group block shrink-0 snap-start w-[72%] sm:w-[45%] lg:w-[calc((100%-5rem)/3)] xl:w-[calc((100%-7.5rem)/4)]"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-4 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-primary/10">
              <CoverImage
                cover={c}
                personalize={false}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
              />
            </div>
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0">
                <h3 className="font-storefront text-xl text-primary truncate">{c.name}</h3>
                <p className="text-[10px] uppercase tracking-[0.22em] text-primary/40 font-bold mt-0.5">
                  {COLLECTIONS.find((x) => x.id === c.collection)?.label ?? "Collection"}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-primary bg-primary/5 px-2 py-1 rounded shrink-0">
                +$5.00
              </span>
            </div>
          </Link>
        ))}
      </div>

      {covers.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous cover"
            onClick={() => go(-1)}
            className="absolute left-0 -translate-x-1/3 top-[30%] w-10 h-10 rounded-full bg-card border border-primary/15 text-primary shadow-md hidden sm:flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next cover"
            onClick={() => go(1)}
            className="absolute right-0 translate-x-1/3 top-[30%] w-10 h-10 rounded-full bg-card border border-primary/15 text-primary shadow-md hidden sm:flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            {covers.slice(0, 24).map((c, i) => (
              <button
                key={c.id}
                type="button"
                aria-label={`Show ${c.name}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-6 bg-primary" : "w-1.5 bg-primary/25 hover:bg-primary/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
