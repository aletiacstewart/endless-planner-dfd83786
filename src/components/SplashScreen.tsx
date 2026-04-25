import { useEffect, useState } from "react";
import { CoverImage } from "@/components/cover/CoverImage";
import { type Cover } from "@/data/covers";

type Props = {
  cover: Cover;
  plannerName: string;
  ownerName?: string;
  onOpen: () => void;
};

/**
 * Front-cover splash. Stays open until the user taps the cover or the
 * "Open planner" pill — like opening the front cover of a paper journal.
 */
export function SplashScreen({ cover, plannerName, ownerName, onOpen }: Props) {
  const [hintVisible, setHintVisible] = useState(false);

  // Reveal the "Tap to open" hint after a beat so first-time users
  // know the splash is interactive without it being shouty.
  useEffect(() => {
    const t = setTimeout(() => setHintVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Open planner"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300 cursor-pointer focus:outline-none"
      style={{ background: "var(--gradient-paper)" }}
    >
      {/* Cover artwork — centered and unsliced. Portrait on phones,
          letterboxed against the themed paper on wider screens. */}
      <div className="relative w-full max-w-md aspect-square sm:max-w-lg shadow-2xl rounded-2xl overflow-hidden">
        <CoverImage
          cover={cover}
          plannerName={plannerName}
          ownerName={ownerName}
          className="w-full h-full object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent via-black/25 to-black/60" />
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
      </div>

      {/* Open pill + hint */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <span
          className="px-6 py-2.5 rounded-full bg-card/90 backdrop-blur text-sm font-medium shadow-lg border border-border"
        >
          Open planner
        </span>
        <span
          className={`text-xs text-muted-foreground transition-opacity duration-500 ${
            hintVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Tap anywhere to begin
        </span>
      </div>
    </button>
  );
}
