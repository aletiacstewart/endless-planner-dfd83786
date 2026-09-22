import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStickerTint } from "@/hooks/useStickerTint";
import {
  getStickerSet,
  STICKER_CATEGORIES,
  STICKER_CATEGORY_LABEL,
  type StickerAsset,
  type StickerCategory,
} from "@/data/stickers";
import { getPageIconStickerAssets } from "@/data/pageIconStickers";
import { useEntitlements } from "@/hooks/useEntitlements";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Kept for call-site compatibility — the library is shared across covers. */
  coverId?: string | null;
  onPick: (a: StickerAsset) => void;
};

type LibraryTab = StickerCategory | "page-icons";

export function StickerLibraryDialog({ open, onOpenChange, coverId, onPick }: Props) {
  const set = useMemo(() => getStickerSet(), []);
  const [tab, setTab] = useState<LibraryTab>("celebrations");
  const entitlements = useEntitlements();
  const tintFilter = useStickerTint();
  const pageIcons = useMemo(
    () => coverId && !entitlements.loading && entitlements.hasPack(coverId)
      ? getPageIconStickerAssets(coverId)
      : [],
    [coverId, entitlements.loading, entitlements.fullAccess, entitlements.packs],
  );
  const items = tab === "page-icons" ? pageIcons : set[tab] ?? [];


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92dvh] overflow-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-storefront text-2xl">Sticker library</DialogTitle>
          <DialogDescription className="text-xs">
            Stickers for every part of your planner — birthdays, meals, health, chores and
            more. Tap a sticker to place it on the page.
          </DialogDescription>

        </DialogHeader>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar border-b border-border pb-2 sm:flex-wrap sm:overflow-visible">
          {pageIcons.length > 0 && (
            <button
              type="button"
              onClick={() => setTab("page-icons")}
              className={cn(
                "min-h-11 shrink-0 px-3 py-2 text-xs uppercase tracking-widest font-semibold rounded-full transition-colors touch-manipulation",
                tab === "page-icons"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              Page Icons
            </button>
          )}
          {STICKER_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setTab(c)}
              className={cn(
                "min-h-11 shrink-0 px-3 py-2 text-xs uppercase tracking-widest font-semibold rounded-full transition-colors touch-manipulation",
                tab === c
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {STICKER_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 min-[430px]:grid-cols-5 sm:grid-cols-8 gap-2 max-h-[55dvh] overflow-y-auto overscroll-contain py-2 pr-1">
          {items.map((a, i) => (
            <button
              key={`${a.kind}-${a.src}-${i}`}
              type="button"
              onClick={() => onPick(a)}
              className="aspect-square min-h-12 min-w-12 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 flex items-center justify-center text-3xl transition-colors touch-manipulation"
              title={a.label ?? a.src}
            >
              {a.kind === "emoji" ? (
                <span>{a.src}</span>
              ) : (
                <img
                  src={a.src}
                  alt={a.label ?? ""}
                  className="w-full h-full object-contain p-1"
                  style={{ filter: a.tintable === false ? undefined : tintFilter }}
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center pt-1">
          Tap as many as you like — the tray stays open. Page Icons match the cover currently
          applied to your journal.
        </p>

        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mx-auto min-h-11 rounded-full border border-border px-6 py-2 text-sm font-semibold hover:bg-muted touch-manipulation"
        >
          Done
        </button>
      </DialogContent>
    </Dialog>
  );
}
