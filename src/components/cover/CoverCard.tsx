import { Check, Plus, X, Star, Eye, CircleDot } from "lucide-react";
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

/**
 * Editorial cover card, v3 storefront style.
 * — Portrait aspect (3/4) matching print journal proportions
 * — Hover reveals a translucent "Bundle Contents" panel from the bottom
 * — Price/Included badge lives outside the image, next to the title
 */
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
        <div
          className={cn(
            "relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-4 transition-all duration-500",
            isIncluded && "ring-2 ring-primary ring-offset-4 ring-offset-background shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.35)]",
            isExtra && !isIncluded && "ring-1 ring-primary/50 ring-offset-2 ring-offset-background",
            !isIncluded && !isExtra && "group-hover:shadow-2xl group-hover:shadow-primary/10"
          )}
        >
          <CoverImage
            cover={cover}
            className="absolute inset-0 transition-transform duration-1000 group-hover:scale-[1.04]"
          />

          {/* Status pill */}
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

          {/* Preview icons */}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
            aria-label={`Preview icons for ${cover.name}`}
            title="Preview matching page icons & stickers"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Hover-reveal bundle contents */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none group-hover:pointer-events-auto">
            <div className="bg-background/95 backdrop-blur-md p-4 rounded-sm shadow-xl">
              <p className="text-[9px] uppercase tracking-widest text-primary font-bold mb-2 border-b border-primary/10 pb-2">
                Bundle contents
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-[10px] font-bold text-foreground">20 Icons</p>
                  <p className="text-[9px] text-muted-foreground">Matching page glyphs</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-foreground">60 Stickers</p>
                  <p className="text-[9px] text-muted-foreground">Themed motif set</p>
                </div>
              </div>
              {isIncluded ? (
                <div className="w-full text-[10px] uppercase tracking-widest font-bold text-primary text-center py-2 border border-primary/30 rounded-sm">
                  Included with activation
                </div>
              ) : isExtra ? (
                <button
                  type="button"
                  onClick={onRemoveExtra}
                  className="w-full text-[10px] uppercase tracking-widest font-bold text-destructive text-center py-2 border border-destructive/30 rounded-sm hover:bg-destructive/5 transition-colors inline-flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={onMakeIncluded}
                    className="text-[9px] uppercase tracking-widest font-bold bg-primary text-primary-foreground py-2 rounded-sm hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <CircleDot className="w-3 h-3" /> Include
                  </button>
                  <button
                    type="button"
                    onClick={onAddExtra}
                    className="text-[9px] uppercase tracking-widest font-bold border border-primary/30 text-primary py-2 rounded-sm hover:bg-primary/5 transition-colors inline-flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add $5
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3 className="font-storefront text-xl leading-tight text-foreground truncate" title={cover.name}>
              {cover.name}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-bold mt-0.5">
              {collectionLabel}
            </p>
          </div>
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-1 rounded whitespace-nowrap",
              isIncluded
                ? "bg-primary/10 text-primary"
                : isExtra
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-foreground"
            )}
          >
            {isIncluded ? "Included" : "+$5.00"}
          </span>
        </div>
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
