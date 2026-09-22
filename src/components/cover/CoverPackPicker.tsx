import { useMemo, useState } from "react";
import { Plus, Check, X, Lock, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { COLLECTIONS, COVERS, type CoverCollection } from "@/data/covers";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverIconPreviewDialog } from "@/components/cover/CoverIconPreviewDialog";
import { isCoverIncluded, calcPackTotalUSD, getPackPriceUSD, PACK_PRICE_USD } from "@/data/coverPacks";
import { isPackUnlocked, isPackPurchased } from "@/lib/unlock";
import { useEntitlements } from "@/hooks/useEntitlements";
import { useUserSettings } from "@/hooks/useUserSettings";
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
  /** Cover ids to exclude entirely (e.g. the primary cover already included with install). */
  excludeIds?: string[];
  /** Show the normal buyer view even for admin accounts (price preview / testing). */
  ignoreAdmin?: boolean;
};

export function CoverPackPicker({ selectedPackIds, onChange, hideOwned, compact, excludeIds = [], ignoreAdmin }: Props) {
  const ent = useEntitlements();
  const { settings, update } = useUserSettings();
  const [filter, setFilter] = useState<CoverCollection | "all">("all");
  const [previewId, setPreviewId] = useState<string | null>(null);

  /** Admin and tester accounts already have access to every cover and icon set. */
  const adminAll = Boolean(ent.fullAccess) && !ignoreAdmin;
  const hasAccess = (id: string) => isPackPurchased(id) || adminAll;
  /** Unlocked covers can be applied to the journal straight from this page. */
  const canApply = (id: string) => isPackPurchased(id) || Boolean(ent.fullAccess);
  const currentCoverId = settings?.coverId;

  const applyCover = async (id: string) => {
    if (!canApply(id) || id === currentCoverId) return;
    await update({ coverId: id });
    const name = COVERS.find((c) => c.id === id)?.name ?? "Cover";
    toast.success(`${name} applied — your planner has re-themed.`);
  };

  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const visibleCovers = useMemo(() => {
    let list = COVERS;
    if (filter !== "all") list = list.filter((c) => c.collection === filter);
    // Admins keep the full catalogue visible so it stays testable.
    if (hideOwned && !adminAll) list = list.filter((c) => !isPackPurchased(c.id));
    if (excludeIds.length) list = list.filter((c) => !excludeIds.includes(c.id));
    return list;
  }, [filter, hideOwned, excludeIds, adminAll, ent.verifiedAt, ent.fullAccess]);

  const toggle = (id: string) => {
    if (isCoverIncluded(id)) return;
    if (hasAccess(id)) return;
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
          const purchased = isPackPurchased(c.id);
          const owned = purchased || adminAll;
          const isSelected = selectedPackIds.includes(c.id);
          const indexInCart = selectedPackIds.indexOf(c.id);
          const price = isSelected ? getPackPriceUSD(indexInCart) : getPackPriceUSD(selectedPackIds.length);

          return (
            <article
              key={c.id}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all text-left group isolate",
                isSelected
                  ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)]"
                  : "border-transparent hover:border-border",
                (included || owned) && "cursor-default"
              )}
            >
              <CoverImage cover={c} className="absolute inset-0" />

              <Button
                type="button"
                variant="ghost"
                onClick={() => toggle(c.id)}
                disabled={included || owned}
                className="absolute inset-0 z-10 h-full w-full rounded-xl p-0 hover:bg-transparent"
                aria-label={`${isSelected ? "Remove" : "Add"} ${c.name} cover and icon pack`}
              />

              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewId(c.id);
                }}
                className="absolute bottom-2 right-2 z-30 h-8 w-8 rounded-full bg-background/75 text-foreground shadow-md backdrop-blur-sm hover:bg-background"
                aria-label={`Preview icons for ${c.name}`}
                title="Preview matching page icons"
              >
                <Eye className="w-4 h-4" />
              </Button>

              {canApply(c.id) && (
                <Button
                  type="button"
                  size="sm"
                  variant={c.id === currentCoverId ? "secondary" : "default"}
                  disabled={c.id === currentCoverId}
                  onClick={(e) => {
                    e.stopPropagation();
                    void applyCover(c.id);
                  }}
                  className="absolute bottom-11 left-2 z-30 h-8 rounded-full px-3 text-[11px] shadow-md"
                >
                  {c.id === currentCoverId ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" /> In use
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Use this cover
                    </>
                  )}
                </Button>
              )}

              {included && (
                <span className="pointer-events-none absolute top-2 left-2 z-20 text-[10px] uppercase tracking-wide font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  Included
                </span>
              )}
              {owned && !included && (
                <span className="pointer-events-none absolute top-2 left-2 z-20 text-[10px] uppercase tracking-wide font-bold bg-foreground/80 text-background rounded-full px-2 py-0.5">
                  {purchased ? "Owned" : ent.tester && !ent.admin ? "Tester" : "Admin"}
                </span>
              )}
              {isSelected && (
                <div className="pointer-events-none absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                  <Check className="w-4 h-4" strokeWidth={3} />
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-foreground/90 to-transparent p-2">
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
                    <Lock className="w-3 h-3" />{" "}
                    {purchased ? "Unlocked" : ent.tester && !ent.admin ? "Included · tester" : "Included · admin"}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selectedPackIds.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {selectedPackIds.length} pack{selectedPackIds.length === 1 ? "" : "s"} selected · packs total <strong className="text-foreground">${total.toFixed(2)}</strong>
          <span className="block mt-0.5">${PACK_PRICE_USD} per pack</span>
        </div>
      )}

      <CoverIconPreviewDialog
        coverId={previewId}
        open={previewId !== null}
        onOpenChange={(o) => !o && setPreviewId(null)}
        isSelected={previewId ? selectedPackIds.includes(previewId) : false}
        price={
          previewId && selectedPackIds.includes(previewId)
            ? getPackPriceUSD(selectedPackIds.indexOf(previewId))
            : getPackPriceUSD(selectedPackIds.length)
        }
        onToggle={() => {
          if (!previewId) return;
          if (isCoverIncluded(previewId) || hasAccess(previewId)) return;
          if (selectedPackIds.includes(previewId)) {
            onChange(selectedPackIds.filter((p) => p !== previewId));
          } else {
            onChange([...selectedPackIds, previewId]);
          }
        }}
      />
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
