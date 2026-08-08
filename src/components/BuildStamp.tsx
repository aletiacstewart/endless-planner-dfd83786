/**
 * Tiny visible build marker so "am I looking at the current version?" is a
 * one-second check instead of a guess.
 *
 * In dev the stamp comes from a virtual module that Vite regenerates on every
 * hot update, so it advances with each edit. In production it is baked in at
 * build time.
 */
import { stamp as liveStamp } from "virtual:build-stamp";

const BUILD_STAMP = import.meta.env.DEV ? liveStamp : __BUILD_STAMP__;

export function BuildStamp() {
  // eslint-disable-next-line no-console
  console.info(`[build] ${BUILD_STAMP}`);

  return (
    <div className="pointer-events-none fixed bottom-2 left-2 z-[9999] select-none rounded bg-background/70 px-1.5 py-0.5 text-[11px] font-mono leading-none text-foreground/70 backdrop-blur-sm">
      build {BUILD_STAMP}
    </div>
  );
}

export { BUILD_STAMP };
