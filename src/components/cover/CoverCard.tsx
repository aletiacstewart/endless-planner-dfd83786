import { Check, Plus, X, Star, CircleDot } from "lucide-react";
import { useState } from "react";
import { type Cover, COLLECTIONS } from "@/data/covers";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverIconPreviewDialog } from "@/components/cover/CoverIconPreviewDialog";
import { isPackUnlocked } from "@/lib/unlock";
import { cn } from "@/lib/utils";

type Props = {
  cover: Cover;
  isIncluded: boolean;
  isExtra: boolean;
  onAddExtra: () => void;
  onRemoveExtra: () => void;
  onMakeIncluded: () => void;
};

export function CoverCard({
  cover,
  isIncluded,
  isExtra,
  onAddExtra,
  onRemoveExtra,
  onMakeIncluded,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const owned = isPackUnlocked(cover.id);
  const collectionLabel =
    COLLECTIONS.find((c) => c.id === cover.collection)?.label ?? "Collection";

  return (
    <>
      <article className="group flex flex-col">
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-4 transition-all duration-500 block w-full text-left",
            isIncluded &&
              "ring-2 ring-primary ring-offset-4 ring-offset-background shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)]",
            isExtra && !isIncluded && "ring-1 ring-primary/50 ring-offset-2 ring-offset-background",
            !isIncluded && !isExtra && "group-hover:shadow-2xl group-hover:shadow-primary/10"
          )}
          aria-label={`Preview ${cover.name}`}
        >
          <CoverImage
            cover={cover}
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-[1.04]"
          />

          {(isIncluded || isExtra || owned) && (
            <span
              className={cn(
                "absolute top-3 left-3 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] font-bold rounded-full px-2.5 py-1 shadow",
                isIncluded && "bg-primary text-primary-foreground",
                isExtra && !isIncluded && "bg-primary/90 text-primary-foreground",
                owned && !isIncluded && !isExtra && "bg-foreground/85 text-background"
              )}
            >
              {isIncluded ? (
                <>
                  <Star className="w-3 h-3" strokeWidth={3} /> Included
                </>
              ) : isExtra ? (
                <>
                  <Check className="w-3 h-3" strokeWidth={3} /> In cart
                </>
              ) : (
                "Owned"
              )}
            </span>
          )}
        </button>

        {/* Title + price row */}
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="min-w-0">
            <h3
              className="font-storefront text-xl leading-tight text-foreground truncate"
              title={cover.name}
            >
              {cover.name}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold mt-0.5">
              {collectionLabel}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Cover + 20 page icons + 60 stickers
            </p>
          </div>
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-1 rounded whitespace-nowrap",
              isIncluded || isExtra
                ? "bg-primary/10 text-primary"
                : "bg-secondary text-foreground"
            )}
          >
            {isIncluded ? "Included" : "+$5.00"}
          </span>
        </div>

        {/* Always-visible action row */}
        {isIncluded ? (
          <div className="text-[10px] uppercase tracking-widest font-bold text-primary text-center py-2 border border-primary/30 rounded-sm">
            Included with activation
          </div>
        ) : isExtra ? (
          <button
            type="button"
            onClick={onRemoveExtra}
            className="w-full text-[10px] uppercase tracking-widest font-bold text-destructive text-center py-2 border border-destructive/30 rounded-sm hover:bg-destructive/5 transition-colors inline-flex items-center justify-center gap-1"
          >
            <X className="w-3 h-3" /> Remove from cart
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={onMakeIncluded}
              className="text-[9px] uppercase tracking-widest font-bold bg-primary text-primary-foreground py-2.5 rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1"
            >
              <CircleDot className="w-3 h-3" /> Make Included
            </button>
            <button
              type="button"
              onClick={onAddExtra}
              className="text-[9px] uppercase tracking-widest font-bold border border-primary/40 text-primary py-2.5 rounded-sm hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add to cart $5
            </button>
          </div>
        )}
      </article>

      <CoverIconPreviewDialog
        coverId={previewOpen ? cover.id : null}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        isSelected={isExtra || isIncluded}
        price={5}
        onToggle={() => {
          if (isIncluded) return;
          if (isExtra) onRemoveExtra();
          else onAddExtra();
        }}
      />
    </>
  );
}
