// Per-cover page icon resolution.
//
// Icon art lives as plain static files in `public/page-icons/<folder>/<page-id>.jpg`
// and is referenced by URL — no bundler imports — so adding hundreds of icons
// costs the dev server and the bundle nothing.
//
// To add a new pack: drop the jpgs in `public/page-icons/<cover-id>/`, then
// regenerate `src/data/iconPacks.ts`. Covers never borrow another cover's pack.
import { ICON_FOLDERS } from "@/data/iconPacks";

const BASE = "/page-icons";

function folderFor(coverId: string): string | undefined {
  return ICON_FOLDERS[coverId] ? coverId : undefined;
}

function urlFor(folder: string, pageId: string): string {
  return `${BASE}/${folder}/${pageId}.jpg`;
}

/** Full page-id -> icon url map for a cover, or null when it has no pack. */
export function getCoverIconPack(coverId: string): Record<string, string> | null {
  const pages = ICON_FOLDERS[coverId];
  if (!pages) return null;

  const out: Record<string, string> = {};
  for (const pageId of pages) out[pageId] = urlFor(coverId, pageId);
  return out;
}

export function getCoverPageIcon(
  coverId: string | null | undefined,
  pageId: string
): string | undefined {
  if (!coverId) return undefined;
  if (ICON_FOLDERS[coverId]?.includes(pageId)) return urlFor(coverId, pageId);
  return undefined;
}

/** Back-compat: lazily materialized map of every cover's icon pack. */
export const COVER_ICONS: Record<string, Record<string, string>> = new Proxy(
  {},
  {
    get: (_t, key: string) => getCoverIconPack(key) ?? undefined,
    has: (_t, key: string) => Boolean(folderFor(String(key))),
    ownKeys: () => Object.keys(ICON_FOLDERS),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  }
) as Record<string, Record<string, string>>;
