import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { getPageType } from "@/lib/pageTypes";
import { getPageImage } from "@/lib/pageImages";
import { createEntry, deleteEntry, listEntries, type PlannerEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SideTabs } from "@/components/planner/SideTabs";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function Section() {
  const { pageTypeId = "" } = useParams();
  const navigate = useNavigate();
  const pageType = getPageType(pageTypeId);
  const { settings } = useUserSettings();
  const [entries, setEntries] = useState<PlannerEntry[]>([]);

  useEffect(() => {
    if (!pageType) return;
    listEntries(pageType.id).then(setEntries);
  }, [pageType]);

  /** Day numbering follows the entry date (oldest = Day 1); undated go last. */
  const orderedEntries = useMemo(() => {
    const key = (e: PlannerEntry) => {
      const raw = e.values?.date as string | undefined;
      const t = raw ? new Date(raw).getTime() : NaN;
      return Number.isNaN(t) ? null : t;
    };
    return [...entries].sort((a, b) => {
      const ka = key(a), kb = key(b);
      if (ka != null && kb != null) return ka - kb;
      if (ka != null) return -1;
      if (kb != null) return 1;
      return a.createdAt - b.createdAt;
    });
  }, [entries]);


  if (!pageType) {
    return (
      <div className="p-6">
        <p>Section not found.</p>
        <Link to="/app" className="text-primary underline">Back home</Link>
      </div>
    );
  }

  const addNew = async () => {
    const e = await createEntry(pageType.id);
    if (pageType.id === "complete-tracker") {
      const { scaffoldLinkedEntries } = await import("@/lib/linkedEntries");
      await scaffoldLinkedEntries(e);
    }
    navigate(`/entry/${e.id}`);
  };


  const remove = async (id: string) => {
    await deleteEntry(id);
    setEntries((es) => es.filter((e) => e.id !== id));
    toast.success("Entry deleted");
  };

  const coverImage = getPageImage(pageType.id, settings?.coverId);

  return (
    <div className="min-h-screen pb-32 lg:pb-24 lg:pr-24" style={{ background: "var(--gradient-paper)" }}>
      <header className="px-5 pt-8 pb-4">
        <Link to="/app" className="inline-flex items-center text-sm text-muted-foreground mb-3">
          <ChevronLeft className="w-4 h-4" /> Home
        </Link>
        <div className="rounded-2xl planner-band px-5 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-script text-xl text-primary/80 leading-none">collection</p>
            <h1 className="section-title mt-1 truncate">{pageType.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{pageType.description}</p>
          </div>
          {coverImage && (
            <img
              src={coverImage}
              alt=""
              className="hidden sm:block w-20 h-20 rounded-xl object-cover shadow-md shrink-0"
            />
          )}
        </div>
      </header>

      <main className="px-4 lg:px-8">
        <div className="relative rounded-3xl paper-dot shadow-[var(--shadow-soft)] border border-border/60 overflow-hidden p-5 lg:p-10">
          <div
            aria-hidden
            className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 spread-spine z-0 pointer-events-none"
          />

          <div className="relative z-10 flex items-center justify-between mb-5">
            <p className="font-script text-lg text-primary/80">
              {entries.length} {entries.length === 1 ? "Day" : "Days"}
            </p>

            <Button onClick={addNew} size="sm" className="rounded-full">
              <Plus className="w-4 h-4 mr-1" />
              New {pageType.shortName.toLowerCase()}
            </Button>
          </div>

          {entries.length === 0 ? (
            <div className="relative z-10 text-center py-16">
              <p className="font-script text-2xl text-primary/70 mb-2">a fresh page awaits</p>
              <p className="text-sm text-muted-foreground mb-5">
                No {pageType.shortName.toLowerCase()} entries yet.
              </p>
              <Button onClick={addNew} size="lg" className="rounded-full">
                <Plus className="w-4 h-4 mr-1" /> Start your first
              </Button>
            </div>
          ) : (
            <ul className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedEntries.map((e, idx) => {
                const title = pageType.summary?.(e.values) || "Untitled";
                return (
                  <li
                    key={e.id}
                    className="group relative rounded-2xl bg-card/90 border border-border/60 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-soft)] hover:-translate-y-0.5 transition-all overflow-hidden"
                  >
                    <Link to={`/entry/${e.id}`} className="block p-4 pr-10 min-h-[112px]">
                      <p className="font-script text-primary/70 text-sm leading-none">
                        Day {idx + 1}
                      </p>

                      <p className="font-display text-lg mt-2 line-clamp-2">{title}</p>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-3">
                        {new Date(e.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </Link>
                    <div
                      aria-hidden
                      className="absolute top-0 right-0 h-full w-2 bg-primary/20 group-hover:bg-primary/40 transition-colors"
                    />
                    <button
                      onClick={() => remove(e.id)}
                      aria-label="Delete entry"
                      className="absolute bottom-2 right-3 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <SideTabs activePageType={pageType.id} />
    </div>
  );
}
