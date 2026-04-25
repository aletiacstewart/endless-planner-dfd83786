import { useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { COLLECTIONS, COVERS, getCover, type CoverCollection } from "@/data/covers";
import { CoverImage } from "./CoverImage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  selectedId: string;
  plannerName?: string;
  ownerName?: string;
  onSelect: (coverId: string) => void;
  onClose?: () => void;
  /** Hide the close button (used inside onboarding where there's nothing to go back to). */
  hideClose?: boolean;
  /** Confirm CTA label */
  confirmLabel?: string;
  onConfirm?: (coverId: string) => void;
};

export function CoverPicker({
  open,
  selectedId,
  plannerName,
  ownerName,
  onSelect,
  onClose,
  hideClose,
  confirmLabel = "Use this cover",
  onConfirm,
}: Props) {
  const [filter, setFilter] = useState<CoverCollection | "all">("all");

  // Only show collection chips that actually have covers.
  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const visibleCovers = useMemo(() => {
    if (filter === "all") return COVERS;
    return COVERS.filter((c) => c.collection === filter);
  }, [filter]);

  const selected = getCover(selectedId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-border">
        <div>
          <h2 className="font-display text-2xl font-semibold">Choose your cover</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            The whole app re-themes to match.
          </p>
        </div>
        {!hideClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </header>

      {/* Collection filter */}
      <div className="px-5 py-3 overflow-x-auto whitespace-nowrap border-b border-border">
        <button
          onClick={() => setFilter("all")}
          className={chipClass(filter === "all")}
        >
          All
        </button>
        {availableCollections.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.id)}
            className={chipClass(filter === c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {visibleCovers.map((c) => {
            const isSelected = c.id === selectedId;
            return (
              <button
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                  isSelected
                    ? "border-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.2)]"
                    : "border-transparent hover:border-border"
                )}
              >
                <CoverImage
                  cover={c}
                  plannerName={plannerName}
                  ownerName={ownerName}
                  className="absolute inset-0"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-[11px] text-white font-medium truncate">{c.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 py-4 border-t border-border bg-card">
        <p className="text-xs text-muted-foreground mb-2">
          Selected: <span className="text-foreground font-medium">{selected.name}</span>
        </p>
        <Button
          className="w-full"
          onClick={() => (onConfirm ? onConfirm(selectedId) : onClose?.())}
        >
          {confirmLabel}
        </Button>
      </footer>
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
