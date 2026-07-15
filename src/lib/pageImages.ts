export const PAGE_IMAGES: Record<string, string> = {};

import { getCoverPageIcon } from "@/lib/coverIcons";

export function getPageImage(id: string, coverId?: string | null): string | undefined {
  return getCoverPageIcon(coverId, id) ?? PAGE_IMAGES[id];
}
