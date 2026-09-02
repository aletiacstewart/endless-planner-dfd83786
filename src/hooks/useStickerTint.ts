import { useEffect, useState } from "react";
import { useUserSettings } from "./useUserSettings";
import { currentStickerFilter } from "@/lib/stickerTint";

/**
 * CSS filter that tints image stickers to the active cover palette.
 * Recomputed after each cover change (useCoverTheme writes the vars on effect).
 */
export function useStickerTint(): string {
  const { settings } = useUserSettings();
  const [filter, setFilter] = useState(() => currentStickerFilter());

  useEffect(() => {
    const t = window.setTimeout(() => setFilter(currentStickerFilter()), 0);
    return () => window.clearTimeout(t);
  }, [settings?.coverId]);

  return filter;
}
