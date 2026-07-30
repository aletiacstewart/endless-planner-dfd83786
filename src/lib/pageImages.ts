import { getCoverPageIcon } from "@/lib/coverIcons";

export function getPageImage(id: string, coverId?: string | null): string | undefined {
  return getCoverPageIcon(coverId, id);
}
