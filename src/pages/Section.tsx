import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { getPageType } from "@/lib/pageTypes";
import { getPageImage } from "@/lib/pageImages";
import { createEntry, deleteEntry, listEntries, type PlannerEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Section() {
  const { pageTypeId = "" } = useParams();
  const navigate = useNavigate();
  const pageType = getPageType(pageTypeId);
  const [entries, setEntries] = useState<PlannerEntry[]>([]);

  useEffect(() => {
    if (!pageType) return;
    listEntries(pageType.id).then(setEntries);
  }, [pageType]);

  if (!pageType) {
    return (
      <div className="p-6">
        <p>Section not found.</p>
        <Link to="/" className="text-primary underline">Back home</Link>
      </div>
    );
  }

  const addNew = async () => {
    const e = await createEntry(pageType.id);
    navigate(`/entry/${e.id}`);
  };

  const remove = async (id: string) => {
    await deleteEntry(id);
    setEntries((es) => es.filter((e) => e.id !== id));
    toast.success("Entry deleted");
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      <header className="px-5 pt-8 pb-4">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground mb-3">
          <ChevronLeft className="w-4 h-4" /> Home
        </Link>
        {getPageImage(pageType.id) && (
          <img
            src={getPageImage(pageType.id)}
            alt={pageType.name}
            className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-4 aspect-square object-cover"
          />
        )}
        <h1 className="section-title">{pageType.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">{pageType.description}</p>
      </header>

      <main className="px-5 space-y-3">
        <Button onClick={addNew} className="w-full" size="lg">
          <Plus className="w-4 h-4 mr-1" />
          {pageType.id === "daily-tracker" ? "Add a daily" : `Add another ${pageType.shortName}`}
        </Button>

        {entries.length === 0 ? (
          <div className="planner-card text-center py-10">
            <p className="text-sm text-muted-foreground">No entries yet. Tap Add to begin.</p>
          </div>
        ) : (
          entries.map((e) => (
            <div key={e.id} className="planner-card flex items-center gap-2">
              <Link to={`/entry/${e.id}`} className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {pageType.summary?.(e.values) || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(e.updatedAt).toLocaleString()}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(e.id)}
                aria-label="Delete entry"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
              <Link to={`/entry/${e.id}`}>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
