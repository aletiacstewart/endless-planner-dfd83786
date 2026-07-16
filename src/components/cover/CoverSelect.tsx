import { useMemo, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { COLLECTIONS, COVERS, getCover, type CoverCollection } from "@/data/covers";
import { CoverImage } from "./CoverImage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (coverId: string) => void;
  /** Cover ids to exclude from the list (e.g. already added as extras). */
  excludeIds?: string[];
  label?: string;
};

export function CoverSelect({ value, onChange, excludeIds = [], label = "Cover included with install" }: Props) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<CoverCollection | "all">("all");
  const [query, setQuery] = useState("");

  const selected = getCover(value) ?? COVERS[0];

  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const list = useMemo(() => {
    let l = COVERS.filter((c) => !excludeIds.includes(c.id));
    if (filter !== "all") l = l.filter((c) => c.collection === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((c) => c.name.toLowerCase().includes(q));
    }
    return l;
  }, [filter, query, excludeIds]);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center gap-3 p-2 pr-3 rounded-md border border-input bg-background hover:bg-muted/40 transition-colors text-left"
          >
            <div className="w-12 h-14 rounded overflow-hidden bg-muted flex-shrink-0 relative">
              <CoverImage cover={selected} className="!object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selected.name}</p>
              <p className="text-[11px] text-muted-foreground">
                Includes matching page-icon set
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[min(92vw,420px)] p-0">
          <div className="p-2 border-b border-border space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search covers…"
                className="w-full pl-8 pr-2 py-1.5 text-sm rounded border border-input bg-background"
              />
            </div>
            <div className="overflow-x-auto whitespace-nowrap -mx-1 px-1">
              <button
                onClick={() => setFilter("all")}
                className={chipClass(filter === "all")}
              >
                All
              </button>
              {availableCollections.map((c) => (
                <button key={c.id} onClick={() => setFilter(c.id)} className={chipClass(filter === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-2 grid grid-cols-3 gap-2">
            {list.map((c) => {
              const isSel = c.id === value;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative aspect-[4/5] rounded-md overflow-hidden border-2 transition-all text-left",
                    isSel
                      ? "border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]"
                      : "border-transparent hover:border-border"
                  )}
                  title={c.name}
                >
                  <CoverImage cover={c} className="absolute inset-0 !object-cover" />
                  {isSel && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <p className="text-[10px] text-white font-medium truncate leading-tight">{c.name}</p>
                  </div>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="col-span-3 text-center text-sm text-muted-foreground py-6">
                No covers match.
              </p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function chipClass(active: boolean) {
  return cn(
    "inline-block px-2.5 py-1 rounded-full text-[11px] font-medium mr-1.5 transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-secondary"
  );
}
