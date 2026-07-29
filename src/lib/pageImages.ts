import { getCoverPageIcon } from "@/lib/coverIcons";
import { ICON_FOLDERS } from "@/data/iconPacks";

/** Default icon set used when a cover has no art for a page. */
const DEFAULT_FOLDER = "patriotic-roses";

export const PAGE_IMAGES: Record<string, string> = Object.fromEntries(
  (ICON_FOLDERS[DEFAULT_FOLDER] ?? []).map((pageId) => [
    pageId,
    `/page-icons/${DEFAULT_FOLDER}/${pageId}.jpg`,
  ])
);


export function getPageImage(id: string, coverId?: string | null): string | undefined {
  return getCoverPageIcon(coverId, id) ?? PAGE_IMAGES[id];
}
