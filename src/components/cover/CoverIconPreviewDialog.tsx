import { Plus, X, Lock, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CoverImage } from "@/components/cover/CoverImage";
import { COVERS, COLLECTIONS } from "@/data/covers";
import { getCoverIconPack } from "@/lib/coverIcons";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { isCoverIncluded } from "@/data/coverPacks";
import { isPackUnlocked } from "@/lib/unlock";

type Props = {
  coverId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSelected?: boolean;
  price?: number;
  onToggle?: () => void;
};

const PAGE_LABELS: Record<string, string> = Object.fromEntries(
  PAGE_TYPES.map((p) => [p.id, p.shortName ?? p.name])
);

export function CoverIconPreviewDialog({
  coverId,
  open,
  onOpenChange,
  isSelected,
  price,
  onToggle,
}: Props) {
  const cover = coverId ? COVERS.find((c) => c.id === coverId) : null;
  if (!cover) return null;

  const collectionLabel =
    COLLECTIONS.find((c) => c.id === cover.collection)?.label ?? "";
  const customIcons = getCoverIconPack(cover.id);
  const iconEntries = customIcons ? Object.entries(customIcons) : [];

  const included = isCoverIncluded(cover.id);
  const owned = isPackUnlocked(cover.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex gap-4 items-start">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-border">
              <CoverImage cover={cover} className="absolute inset-0" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {collectionLabel}
              </p>
              <DialogTitle className="font-display text-xl">
                {cover.name}
              </DialogTitle>
              <DialogDescription>
                {customIcons
                  ? `Includes ${iconEntries.length} matching page icons.`
                  : "Matching page icons are not installed for this cover yet."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {iconEntries.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
            {iconEntries.map(([pageId, src]) => (
              <div
                key={pageId}
                className="flex flex-col items-center text-center gap-1"
              >
                <div className="w-full aspect-square rounded-md bg-muted/40 flex items-center justify-center p-2 border border-border">
                  <img
                    src={src as string}
                    alt={PAGE_LABELS[pageId] ?? pageId}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground truncate w-full">
                  {PAGE_LABELS[pageId] ?? pageId}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No cover-specific page icons are installed for this cover yet.
          </div>
        )}

        {onToggle && (
          <div className="pt-2 border-t border-border mt-2">
            {included ? (
              <Button disabled className="w-full" variant="secondary">
                <Check className="w-4 h-4 mr-2" /> Included with planner
              </Button>
            ) : owned ? (
              <Button disabled className="w-full" variant="secondary">
                <Lock className="w-4 h-4 mr-2" /> Already unlocked
              </Button>
            ) : (
              <Button
                className="w-full"
                variant={isSelected ? "outline" : "default"}
                onClick={() => {
                  onToggle();
                  onOpenChange(false);
                }}
              >
                {isSelected ? (
                  <>
                    <X className="w-4 h-4 mr-2" /> Remove from cart
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Add to cart · $
                    {(price ?? 0).toFixed(2)}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
