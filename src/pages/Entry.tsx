import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Check, ChevronLeft, Loader2, Trash2 } from "lucide-react";
import { deleteEntry, getEntry, type PlannerEntry } from "@/lib/db";
import { getPageType, type FieldValue } from "@/lib/pageTypes";
import { useAutoSave } from "@/hooks/useAutoSave";
import { PageRenderer } from "@/components/PageRenderer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Entry() {
  const { entryId = "" } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<PlannerEntry | null>(null);

  useEffect(() => {
    getEntry(entryId).then((e) => setEntry(e ?? null));
  }, [entryId]);

  const saveState = useAutoSave(entry);

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pageType = getPageType(entry.pageType);
  if (!pageType) {
    return <div className="p-6">Unknown page type. <Link to="/" className="text-primary underline">Home</Link></div>;
  }

  const onChange = (key: string, value: FieldValue) => {
    setEntry({ ...entry, values: { ...entry.values, [key]: value } });
  };

  const remove = async () => {
    await deleteEntry(entry.id);
    toast.success("Entry deleted");
    navigate(`/section/${pageType.id}`);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      <header className="px-5 pt-8 pb-4 sticky top-0 z-10 backdrop-blur bg-background/70 border-b border-border">
        <div className="flex items-center justify-between">
          <Link
            to={`/section/${pageType.id}`}
            className="inline-flex items-center text-sm text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" /> {pageType.name}
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              {saveState === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Saving</>}
              {saveState === "saved" && <><Check className="w-3 h-3" /> Saved</>}
            </span>
            <Button variant="ghost" size="icon" onClick={remove} aria-label="Delete">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
        <h1 className="section-title mt-2">{pageType.name}</h1>
      </header>

      <main className="px-5 mt-4">
        <PageRenderer pageType={pageType} values={entry.values} onChange={onChange} />
      </main>
    </div>
  );
}
