import { useEffect, useRef, useState } from "react";
import { CoverImage } from "@/components/cover/CoverImage";
import { type Cover } from "@/data/covers";

type Props = {
  cover: Cover;
  plannerName: string;
  ownerName?: string;
  onOpen: () => void;
};

/**
 * Front-cover splash — a closed book cover sized like a single planner page.
 * Tap the cover, press the pill, or swipe right-to-left to open it.
 */
export function SplashScreen({ cover, plannerName, ownerName, onOpen }: Props) {
  const [hintVisible, setHintVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Reveal the "Swipe or tap to open" hint after a beat so first-time users
  // know the splash is interactive without it being shouty.
  useEffect(() => {
    const t = setTimeout(() => setHintVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    window.setTimeout(onOpen, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 cover-open-stage px-4"
      style={{ background: "var(--gradient-paper)" }}
    >
      {opening && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="cover-open-inside w-full max-w-[560px] aspect-[2/3] rounded-3xl paper-dot border border-border/60 shadow-inner flex items-center justify-center">
            <p className="font-script text-2xl text-primary/70">opening…</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={open}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const start = touchStartX.current;
          touchStartX.current = null;
          if (start !== null && start - e.changedTouches[0].clientX > 40) open();
        }}
        aria-label={`Open ${plannerName}`}
        className={`relative w-full max-w-[560px] aspect-[2/3] rounded-3xl overflow-hidden border border-border/60 shadow-[var(--shadow-soft)] focus:outline-none ${
          opening ? "cover-open-flip" : "transition-transform hover:-rotate-1"
        }`}
      >
        <CoverImage
          cover={cover}
          plannerName={plannerName}
          ownerName={ownerName}
          className="w-full h-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent via-black/25 to-black/60" />
        {/* Stitched spine on the hinge, page edges on the fore-edge. */}
        <div aria-hidden className="book-spine pointer-events-none absolute inset-y-0 left-0 w-5" />
        <div aria-hidden className="book-foredge pointer-events-none absolute inset-y-3 right-0 w-2 rounded-r-3xl" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-white drop-shadow-lg">
            {plannerName}
          </h1>
          {ownerName && (
            <p className="font-script text-xl text-white/90 drop-shadow mt-1">
              {ownerName}
            </p>
          )}
        </div>
      </button>

      {/* Open pill + hint */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={open}
          className="px-6 py-2.5 rounded-full bg-card/90 backdrop-blur text-sm font-medium shadow-lg border border-border"
        >
          Open planner
        </button>
        <span
          className={`text-xs text-muted-foreground transition-opacity duration-500 ${
            hintVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Swipe or tap to open
        </span>
      </div>
    </div>
  );
}
