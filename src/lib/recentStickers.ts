const KEY = "planner-recent-stickers";
const MAX = 12;

export interface RecentSticker {
  kind: "img" | "emoji";
  src: string;
  label?: string;
}

export function getRecentStickers(): RecentSticker[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is RecentSticker =>
        r && typeof r.src === "string" && (r.kind === "img" || r.kind === "emoji"),
    );
  } catch {
    return [];
  }
}

export function saveRecentSticker(r: RecentSticker): RecentSticker[] {
  const next = [r, ...getRecentStickers().filter((x) => x.src !== r.src)].slice(0, MAX);
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}
