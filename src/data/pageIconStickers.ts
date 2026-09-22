import type { StickerAsset } from "@/data/stickers";
import { getCoverIconPack } from "@/lib/coverIcons";
import { PAGE_TYPES } from "@/lib/pageTypes";

const PAGE_NAMES = new Map(PAGE_TYPES.map((page) => [page.id, page.name]));

function titleFromId(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Turns the active cover's page artwork into assets the existing sticker tools can place. */
export function getPageIconStickerAssets(coverId?: string | null): StickerAsset[] {
  if (!coverId) return [];
  const pack = getCoverIconPack(coverId);
  if (!pack) return [];

  return Object.entries(pack).map(([pageId, src]) => ({
    kind: "img" as const,
    src,
    label: PAGE_NAMES.get(pageId) ?? titleFromId(pageId),
    tintable: false,
  }));
}

export function isPageIconAsset(src: string): boolean {
  return src.startsWith("/page-icons/");
}