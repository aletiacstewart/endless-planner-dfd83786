import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { listEntries, createEntry } from "@/lib/db";
import { cn } from "@/lib/utils";

interface Props {
  activePageType: string;
}

/**
 * Vertical planner tabs — one per page type. Clicking a tab opens the most
 * recent entry of that type, or creates a fresh blank one. Rendered as a
 * right-edge stack on desktop and a horizontal bottom strip on mobile.
 */
export function SideTabs({ activePageType }: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);

  // Preload nothing — we resolve on click to keep this cheap.
  useEffect(() => {}, []);

  const openTab = async (pageTypeId: string) => {
    if (busy) return;
    setBusy(pageTypeId);
    try {
      const entries = await listEntries(pageTypeId);
      const target = entries[0] ?? (await createEntry(pageTypeId));
      navigate(`/entry/${target.id}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* Desktop: right-edge vertical tab stack */}
      <nav
        aria-label="Planner sections"
        className="hidden lg:flex flex-col gap-2 fixed right-0 top-1/2 -translate-y-1/2 z-30 pr-1"
      >
        {PAGE_TYPES.map((pt) => {
          const Icon =
            (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pt.icon] ??
            Icons.FileText;
          const active = pt.id === activePageType;
          return (
            <button
              key={pt.id}
              onClick={() => openTab(pt.id)}
              aria-label={pt.name}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-2 rounded-l-2xl border border-r-0 pl-3 pr-4 py-2 text-xs font-medium",
                "transition-all duration-200 shadow-[var(--shadow-card)]",
                active
                  ? "bg-primary text-primary-foreground border-primary translate-x-0"
                  : "bg-card text-foreground border-border translate-x-[calc(100%-2.5rem)] hover:translate-x-0",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{pt.shortName}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile: bottom horizontal strip */}
      <nav
        aria-label="Planner sections"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur"
      >
        <div className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-1">
          {PAGE_TYPES.map((pt) => {
            const Icon =
              (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pt.icon] ??
              Icons.FileText;
            const active = pt.id === activePageType;
            return (
              <button
                key={pt.id}
                onClick={() => openTab(pt.id)}
                aria-label={pt.name}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 shrink-0 min-w-[64px]",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] leading-none">{pt.shortName}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
