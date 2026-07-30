/**
 * Tiny visible build marker so "am I looking at the current version?" is a
 * one-second check instead of a guess.
 */
const BUILD_STAMP = __BUILD_STAMP__;

let logged = false;

export function BuildStamp() {
  if (!logged) {
    logged = true;
    // eslint-disable-next-line no-console
    console.info(`[build] ${BUILD_STAMP}`);
  }
  return (
    <div className="pointer-events-none fixed bottom-1 right-2 z-[9999] select-none text-[10px] leading-none text-muted-foreground/50">
      build {BUILD_STAMP}
    </div>
  );
}

export { BUILD_STAMP };
