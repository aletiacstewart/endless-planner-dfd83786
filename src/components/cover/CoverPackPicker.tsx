import { useMemo, useState } from "react";
import { Plus, Check, X, Lock, Eye } from "lucide-react";
import { COLLECTIONS, COVERS, type CoverCollection } from "@/data/covers";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverIconPreviewDialog } from "@/components/cover/CoverIconPreviewDialog";
import { isCoverIncluded, calcPackTotalUSD, getPackPriceUSD } from "@/data/coverPacks";
import { isPackUnlocked } from "@/lib/unlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  /** Currently selected pack ids in the cart (controlled). */
  selectedPackIds: string[];
  onChange: (next: string[]) => void;
  /** Hide already-owned covers (used on /packs returning-user view). */
  hideOwned?: boolean;
  /** Compact mode for embedding inside other cards. */
  compact?: boolean;
};

export function CoverPackPicker({ selectedPackIds, onChange, hideOwned, compact }: Props) {
  const [filter, setFilter] = useState<CoverCollection | "all">("all");

  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const visibleCovers = useMemo(() => {
    let list = COVERS;
    if (filter !== "all") list = list.filter((c) => c.collection === filter);
    if (hideOwned) list = list.filter((c) => !isPackUnlocked(c.id));
    return list;
  }, [filter, hideOwned]);

  const toggle = (id: string) => {
    if (isCoverIncluded(id)) return;
    if (isPackUnlocked(id)) return;
    if (selectedPackIds.includes(id)) {
      onChange(selectedPackIds.filter((p) => p !== id));
    } else {
      onChange([...selectedPackIds, id]);
    }
  };

  const total = calcPackTotalUSD(selectedPackIds);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto whitespace-nowrap -mx-1 px-1 pb-1">
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

      <div className={cn("grid gap-3", compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4")}>
        {visibleCovers.map((c) => {
          const included = isCoverIncluded(c.id);
          const owned = isPackUnlocked(c.id);
          const isSelected = selectedPackIds.includes(c.id);
          const indexInCart = selectedPackIds.indexOf(c.id);
          const price = isSelected ? getPackPriceUSD(indexInCart) : getPackPriceUSD(selectedPackIds.length);

          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              disabled={included || owned}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all text-left group",
                isSelected
                  ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)]"
                  : "border-transparent hover:border-border",
                (included || owned) && "cursor-default"
              )}
            >
              <CoverImage cover={c} className="absolute inset-0" />

              {included && (
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  Included
                </span>
              )}
              {owned && !included && (
                <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide font-bold bg-foreground/80 text-background rounded-full px-2 py-0.5">
                  Owned
                </span>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-[11px] text-white font-medium truncate">{c.name}</p>
                {!included && !owned && (
                  <p className="text-[10px] text-white/90 mt-0.5 inline-flex items-center gap-1">
                    {isSelected ? (
                      <>
                        <X className="w-3 h-3" /> Remove · ${price.toFixed(2)}
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" /> Add · ${price.toFixed(2)}
                      </>
                    )}
                  </p>
                )}
                {owned && !included && (
                  <p className="text-[10px] text-white/90 mt-0.5 inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Unlocked
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedPackIds.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {selectedPackIds.length} pack{selectedPackIds.length === 1 ? "" : "s"} selected · packs total <strong className="text-foreground">${total.toFixed(2)}</strong>
          <span className="block mt-0.5">First pack $4.99 · each additional $2.99</span>
        </div>
      )}
    </div>
  );
}

function chipClass(active: boolean) {
  return cn(
    "inline-block px-3 py-1.5 rounded-full text-xs font-medium mr-2 transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-secondary"
  );
}

export function CoverPackSummary({ packIds, plannerPriceUSD }: { packIds: string[]; plannerPriceUSD?: number }) {
  const packTotal = calcPackTotalUSD(packIds);
  const grand = (plannerPriceUSD ?? 0) + packTotal;
  return (
    <div className="text-sm space-y-1">
      {plannerPriceUSD !== undefined && (
        <div className="flex justify-between">
          <span>Planner</span>
          <span>${plannerPriceUSD.toFixed(2)}</span>
        </div>
      )}
      {packIds.length > 0 && (
        <div className="flex justify-between text-muted-foreground">
          <span>{packIds.length} cover &amp; icon pack{packIds.length === 1 ? "" : "s"}</span>
          <span>${packTotal.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between font-display text-xl pt-2 border-t border-border">
        <span>Total</span>
        <span>${grand.toFixed(2)}</span>
      </div>
    </div>
  );
}
