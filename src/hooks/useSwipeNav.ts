import { useEffect, useRef } from "react";

interface Options {
  onPrev?: () => void;
  onNext?: () => void;
  /** Enable arrow-key navigation. */
  keyboard?: boolean;
  /** Minimum horizontal delta in px to count as a swipe. */
  threshold?: number;
}

/**
 * Attach swipe (left/right) and optional arrow-key navigation to the window.
 * Used by Entry to flip between adjacent entries of the same page type.
 */
export function useSwipeNav({ onPrev, onNext, keyboard = true, threshold = 60 }: Options) {
  const start = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return;
      if (dx > 0) onPrev?.();
      else onNext?.();
    };
    const onKey = (e: KeyboardEvent) => {
      // Ignore key events originating from editable fields.
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    if (keyboard) window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [onPrev, onNext, keyboard, threshold]);
}
