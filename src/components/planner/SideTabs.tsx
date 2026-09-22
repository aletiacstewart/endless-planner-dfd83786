import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { listEntries, createEntry } from "@/lib/db";
import { getCoverIconPack } from "@/lib/coverIcons";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";

interface Props {
  activePageType: string;
}

const OPEN_KEY = "planner.sideTabs.open";

/**
 * Vertical planner tabs — one per page type. Clicking a tab opens the most
 * recent entry of that type, or creates a fresh blank one. Rendered as a
 * right-edge stack on desktop and a horizontal bottom strip on mobile.
 *
 * Tabs use the themed page icon that ships with the user's active cover, the
 * same art shown on the product page, and fall back to a Lucide glyph only
 * when that cover's pack is missing the icon for a page.
 */
export function SideTabs({ activePageType }: Props) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const { settings } = useUserSettings();
  const coverId = settings?.coverId;
  // Collapsed by default so the section rail never covers the page.
  const [open, setOpen] = useState(() => localStorage.getItem(OPEN_KEY) === "1");

  useEffect(() => {
    localStorage.setItem(OPEN_KEY, open ? "1" : "0");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pack = useMemo(() => (coverId ? getCoverIconPack(coverId) : null), [coverId]);

  // Warm the browser cache once per cover so tab switching stays instant.
  useEffect(() => {
    if (!pack) return;
    const imgs = PAGE_TYPES.map((pt) => pack[pt.id]).filter(Boolean).map((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      return img;
    });
    return () => { imgs.forEach((i) => { i.src = ""; }); };
  }, [pack]);

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

  const renderIcon = (pt: (typeof PAGE_TYPES)[number], size: string) => {
    const src = pack?.[pt.id];
    if (src) {
      return (
        <img
          src={src}
          alt=""
          aria-hidden
          decoding="async"
          className={cn(size, "shrink-0 rounded-[5px] object-cover ring-1 ring-border/50")}
        />
      );
    }
    const Icon =
      (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pt.icon] ??
      Icons.FileText;
    // Stopgap until every cover's pack is backfilled: tint the fallback with the
    // active cover's accent so it reads as on-brand rather than broken art.
    return (
      <span
        aria-hidden
        className={cn(
          size,
          "shrink-0 rounded-[5px] ring-1 ring-border/50 bg-accent-soft text-accent-foreground",
          "flex items-center justify-center",
        )}
      >
        <Icon className="w-[62%] h-[62%]" />
      </span>
    );
  };


  const addTab = async (pageTypeId: string) => {
    if (busy) return;
    setBusy(pageTypeId);
    try {
      // Single-list pages (e.g. Medications) must never get a second entry.
      const pt = PAGE_TYPES.find((p) => p.id === pageTypeId);
      if (pt?.cadence === "list") {
        const existing = await listEntries(pageTypeId);
        if (existing.length > 0) {
          navigate(`/entry/${existing[0].id}`);
          return;
        }
      }
      const created = await createEntry(pageTypeId);
      if (pageTypeId === "complete-tracker") {
        const { scaffoldLinkedEntries } = await import("@/lib/linkedEntries");
        await scaffoldLinkedEntries(created);
      }
      navigate(`/entry/${created.id}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      {/* Desktop: collapsed to a slim edge tab so the page stays readable. */}
      <div className="hidden lg:block">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Hide sections" : "Show sections"}
          title={open ? "Hide sections" : "Show sections"}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 rounded-l-xl border border-r-0 border-border bg-card/90 backdrop-blur px-1.5 py-3 shadow-[var(--shadow-card)] hover:bg-muted"
        >
          {open ? (
            <Icons.ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <Icons.ChevronLeft className="w-4 h-4" />
              <span className="text-[10px] tracking-widest [writing-mode:vertical-rl]">Sections</span>
            </>
          )}
        </button>

        {open && (
          <nav
            aria-label="Planner sections"
            className="flex flex-col gap-1 fixed right-8 top-1/2 -translate-y-1/2 z-30 max-h-[80vh] overflow-y-auto no-scrollbar rounded-2xl bg-card/95 backdrop-blur border border-border shadow-[var(--shadow-card)] p-1"
          >
            {PAGE_TYPES.map((pt) => {
              const active = pt.id === activePageType;
              return (
                <div
                  key={pt.id}
                  className={cn(
                    "group flex items-center rounded-lg transition-colors",
                    active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                  )}
                >
                  <button
                    onClick={() => { void openTab(pt.id); setOpen(false); }}
                    aria-label={pt.name}
                    aria-current={active ? "page" : undefined}
                    className="flex flex-1 items-center gap-1.5 rounded-lg px-1.5 py-1 text-[11px] font-medium"
                  >
                    {renderIcon(pt, "w-4 h-4")}
                    <span className="whitespace-nowrap">{pt.shortName}</span>
                  </button>
                  <button
                    onClick={() => { void addTab(pt.id); setOpen(false); }}
                    aria-label={`New ${pt.shortName} day`}
                    title={`New ${pt.shortName} day`}
                    className={cn(
                      "mr-0.5 rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
                      active ? "hover:bg-primary-foreground/20" : "hover:bg-background",
                    )}
                  >
                    <Icons.Plus className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </nav>
        )}
      </div>


      {/* Mobile: bottom horizontal strip */}
      <nav
        aria-label="Planner sections"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur"
      >
        <div className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-1">
          {PAGE_TYPES.map((pt) => {
            const active = pt.id === activePageType;
            return (
              <div
                key={pt.id}
                className={cn(
                  "relative flex shrink-0 rounded-xl",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <button
                  onClick={() => openTab(pt.id)}
                  aria-label={pt.name}
                  aria-current={active ? "page" : undefined}
                  className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 min-w-[64px]"
                >
                  {renderIcon(pt, "w-6 h-6")}
                  <span className="text-[10px] leading-none">{pt.shortName}</span>
                </button>
                <button
                  onClick={() => addTab(pt.id)}
                  aria-label={`New ${pt.shortName} day`}
                  className={cn(
                    "absolute -top-1 -right-1 rounded-full border border-border p-0.5 shadow-sm",
                    active ? "bg-primary-foreground text-primary" : "bg-card text-foreground",
                  )}
                >
                  <Icons.Plus className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </nav>
    </>
  );
}

