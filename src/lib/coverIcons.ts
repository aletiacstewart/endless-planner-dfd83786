// Per-cover page icon resolution.
//
// Icon art lives as plain static files in `public/page-icons/<folder>/<page-id>.jpg`
// and is referenced by URL — no bundler imports — so adding hundreds of icons
// costs the dev server and the bundle nothing.
//
// To add a new pack: drop the jpgs in `public/page-icons/<cover-id>/`, then add
// the folder (and any covers that reuse it) to `src/data/iconPacks.ts`.
import { ICON_FOLDERS, COVER_ICON_FOLDER } from "@/data/iconPacks";

const BASE = "/page-icons";

function folderFor(coverId: string): string | undefined {
  if (ICON_FOLDERS[coverId]) return coverId;
  const alias = COVER_ICON_FOLDER[coverId];
  return alias && ICON_FOLDERS[alias] ? alias : undefined;
}

function urlFor(folder: string, pageId: string): string {
  return `${BASE}/${folder}/${pageId}.jpg`;
}

/** Full page-id -> icon url map for a cover, or null when it has no pack. */
export function getCoverIconPack(coverId: string): Record<string, string> | null {
  const own = ICON_FOLDERS[coverId] ? coverId : undefined;
  const alias = COVER_ICON_FOLDER[coverId];
  const aliasPages = alias && alias !== own ? ICON_FOLDERS[alias] : undefined;
  if (!own && !aliasPages) return null;

  const out: Record<string, string> = {};
  // Alias art fills the base, the cover's own folder wins per page.
  if (aliasPages && alias) {
    for (const pageId of aliasPages) out[pageId] = urlFor(alias, pageId);
  }
  if (own) {
    for (const pageId of ICON_FOLDERS[own]) out[pageId] = urlFor(own, pageId);
  }
  return out;
}

export function getCoverPageIcon(
  coverId: string | null | undefined,
  pageId: string
): string | undefined {
  if (!coverId) return undefined;
  if (ICON_FOLDERS[coverId]?.includes(pageId)) return urlFor(coverId, pageId);
  const folder = folderFor(coverId);
  if (folder && ICON_FOLDERS[folder].includes(pageId)) return urlFor(folder, pageId);
  return undefined;
}

/** Back-compat: lazily materialized map of every cover's icon pack. */
export const COVER_ICONS: Record<string, Record<string, string>> = new Proxy(
  {},
  {
    get: (_t, key: string) => getCoverIconPack(key) ?? undefined,
    has: (_t, key: string) => Boolean(folderFor(String(key))),
    ownKeys: () =>
      Array.from(new Set([...Object.keys(ICON_FOLDERS), ...Object.keys(COVER_ICON_FOLDER)])),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  }
) as Record<string, Record<string, string>>;
