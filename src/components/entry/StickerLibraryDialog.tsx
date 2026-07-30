import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getStickerSet,
  STICKER_CATEGORIES,
  STICKER_CATEGORY_LABEL,
  type StickerAsset,
  type StickerCategory,
} from "@/data/stickers";
import { getCover, type CoverCollection } from "@/data/covers";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Active cover id — determines which themed set to show. */
  coverId?: string | null;
  onPick: (a: StickerAsset) => void;
};

export function StickerLibraryDialog({ open, onOpenChange, coverId, onPick }: Props) {
  const collection: CoverCollection | undefined = useMemo(() => {
    if (!coverId) return undefined;
    return getCover(coverId)?.collection;
  }, [coverId]);

  const set = useMemo(() => getStickerSet(collection), [collection]);
  const [tab, setTab] = useState<StickerCategory>("motifs");
  const items = set[tab] ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-storefront text-2xl">Sticker library</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Themed to your active cover. Tap a sticker to place it on the page.
          </p>
        </DialogHeader>

        <div className="flex gap-1 flex-wrap border-b border-border pb-2">
          {STICKER_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className={cn(
                "px-3 py-1.5 text-[11px] uppercase tracking-widest font-semibold rounded-full transition-colors",
                tab === c
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {STICKER_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-[60vh] overflow-y-auto py-2">
          {items.map((a, i) => (
            <button
              key={`${a.kind}-${a.src}-${i}`}
              type="button"
              onClick={() => onPick(a)}
              className="aspect-square rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 flex items-center justify-center text-2xl transition-colors"
              title={a.label ?? a.src}
            >
              {a.kind === "emoji" ? (
                <span>{a.src}</span>
              ) : (
                <img src={a.src} alt={a.label ?? ""} className="w-full h-full object-contain p-1" />
              )}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-1">
          Tap as many as you like — the tray stays open. Each cover ships with 60 themed
          stickers across 4 categories.
        </p>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mx-auto rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:bg-muted"
        >
          Done
        </button>
      </DialogContent>
    </Dialog>
  );
}
