import { Check, Plus, X, Star, Eye, CircleDot } from "lucide-react";
import { useState } from "react";
import { type Cover } from "@/data/covers";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverIconPreviewDialog } from "@/components/cover/CoverIconPreviewDialog";
import { Button } from "@/components/ui/button";
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

  return (
    <>
      <article
        className={cn(
          "relative rounded-xl overflow-hidden border-2 bg-card flex flex-col transition-all",
          isIncluded
            ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]"
            : isExtra
              ? "border-primary/60"
              : "border-border hover:border-muted-foreground/40"
        )}
      >
        <div className="relative aspect-square bg-muted">
          <CoverImage cover={cover} className="absolute inset-0" />

          {isIncluded && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5 shadow">
              <Star className="w-3 h-3" strokeWidth={3} /> Included
            </span>
          )}
          {isExtra && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide font-bold bg-primary/90 text-primary-foreground rounded-full px-2 py-0.5 shadow">
              <Check className="w-3 h-3" strokeWidth={3} /> In cart
            </span>
          )}
          {owned && !isIncluded && !isExtra && (
            <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide font-bold bg-foreground/80 text-background rounded-full px-2 py-0.5">
              Owned
            </span>
          )}

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label={`Preview icons for ${cover.name}`}
            title="Preview matching page icons"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 flex flex-col gap-2">
          <h4 className="text-sm font-medium truncate" title={cover.name}>
            {cover.name}
          </h4>

          {isIncluded ? (
            <Button size="sm" variant="secondary" disabled className="w-full">
              <Star className="w-3.5 h-3.5 mr-1" strokeWidth={3} /> Included with activation
            </Button>
          ) : isExtra ? (
            <Button size="sm" variant="outline" className="w-full" onClick={onRemoveExtra}>
              <X className="w-3.5 h-3.5 mr-1" /> Remove ($10)
            </Button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Button size="sm" className="w-full" onClick={onMakeIncluded}>
                <CircleDot className="w-3.5 h-3.5 mr-1" /> Include with activation
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={onAddExtra}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Or add for $10
              </Button>
            </div>
          )}

        </div>
      </article>

      <CoverIconPreviewDialog
        coverId={previewOpen ? cover.id : null}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        isSelected={isExtra || isIncluded}
        price={10}
        onToggle={() => {
          if (isIncluded) return;
          if (isExtra) onRemoveExtra();
          else onAddExtra();
        }}
      />
    </>
  );
}
