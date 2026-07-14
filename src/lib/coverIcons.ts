// Per-cover page icon overrides.
// When a cover defines an icon for a page id, it replaces the default in pageImages.ts.
// Add new covers by creating src/assets/cover-icons/<cover-id>/<page-id>.png and importing below.

export const COVER_ICONS: Record<string, Record<string, string>> = {};

export function getCoverPageIcon(coverId: string | null | undefined, pageId: string): string | undefined {
  if (!coverId) return undefined;
  return COVER_ICONS[coverId]?.[pageId];
}
