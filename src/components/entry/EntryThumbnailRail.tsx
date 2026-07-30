import { useMemo } from "react";
import { getCoverPageIcon } from "@/lib/coverIcons";
import { useUserSettings } from "@/hooks/useUserSettings";
import type { PlannerEntry } from "@/lib/db";
import { getMeta } from "@/lib/entryMeta";
import { toCss } from "@/hooks/useThemedSwatches";
import { cn } from "@/lib/utils";

interface Props {
  entries: PlannerEntry[];
  activeId: string;
  pageTypeName: string;
  onSelect: (id: string) => void;
}

function labelFor(entry: PlannerEntry, index: number, total: number): string {
  const raw = entry.values?.date as string | undefined;
  const d = raw ? new Date(raw) : null;
  if (d && !isNaN(d.getTime())) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return `Page ${total - index}`;
}

/**
 * Horizontal rail of every page in the current section, so users can jump
 * straight to a page instead of flipping one at a time. Each thumbnail shows
 * the cover's themed icon plus the page's own accent colour.
 */
export function EntryThumbnailRail({ entries, activeId, pageTypeName, onSelect }: Props) {
  const { settings } = useUserSettings();

  const items = useMemo(
    () =>
      entries.map((e, i) => ({
        id: e.id,
        label: labelFor(e, i, entries.length),
        icon: getCoverPageIcon(settings?.coverId, e.pageType),
        accent: getMeta(e).color,
      })),
    [entries, settings?.coverId],
  );

  if (items.length < 2) return null;

  return (
    <nav
      aria-label={`${pageTypeName} pages`}
      className="fixed bottom-[4.25rem] lg:bottom-3 inset-x-0 z-20 px-3 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl flex gap-2 overflow-x-auto no-scrollbar rounded-2xl border border-border bg-card/90 backdrop-blur p-2 shadow-[var(--shadow-card)]">
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => onSelect(it.id)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 w-16 rounded-xl border overflow-hidden transition-colors",
                active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50",
              )}
              title={it.label}
            >
              <span
                className="block h-10 w-full bg-muted"
                style={{
                  backgroundImage: it.icon ? `url(${it.icon})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderBottom: it.accent ? `3px solid ${toCss(it.accent)}` : undefined,
                }}
              />
              <span className="block text-[10px] leading-tight py-1 text-muted-foreground truncate px-1">
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
