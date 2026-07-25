import { Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCover } from "@/data/covers";
import { calcPackTotalUSD, getDiscountLabel } from "@/data/coverPacks";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverIconStrip } from "@/components/cover/CoverIconStrip";
import { cn } from "@/lib/utils";


type Props = {
  activationLabel: string;
  activationPriceUSD: number;
  includedCoverId: string;
  extraPackIds: string[];
  email: string;
  onEmailChange: (v: string) => void;
  onCheckout: () => void;
  disabled?: boolean;
  className?: string;
};

export function CartSummary({
  activationLabel,
  activationPriceUSD,
  includedCoverId,
  extraPackIds,
  email,
  onEmailChange,
  onCheckout,
  disabled,
  className,
}: Props) {
  const includedCover = getCover(includedCoverId);
  const extrasSubtotal = extraPackIds.length * 10;
  const extrasDiscounted = calcPackTotalUSD(extraPackIds);
  const discountAmount = +(extrasSubtotal - extrasDiscounted).toFixed(2);
  const total = +(activationPriceUSD + extrasDiscounted).toFixed(2);
  const discountLabel = getDiscountLabel(extraPackIds.length);
  const emailValid = /.+@.+\..+/.test(email);

  return (
    <aside className={cn("planner-card md:sticky md:top-6 space-y-4", className)}>
      <div>
        <h3 className="font-display text-lg mb-1">Your order</h3>
        <p className="text-xs text-muted-foreground">
          One-time purchase. No subscription.
        </p>
      </div>

      {includedCover ? (
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wide font-bold text-primary">
            Included with activation
          </p>
          <div className="flex gap-3 items-center">
            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-border">
              <CoverImage cover={includedCover} className="absolute inset-0" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{includedCover.name}</div>
              <div className="text-[11px] text-muted-foreground">
                Cover + matching page icon set
              </div>
            </div>
          </div>
          <CoverIconStrip coverId={includedCover.id} />
          <p className="text-[11px] text-muted-foreground text-center">
            Tap any other cover in the grid to switch which one is included.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-1">
          <p className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">
            Included with activation
          </p>
          <p className="text-sm font-medium">Choose your cover</p>
          <p className="text-[11px] text-muted-foreground">
            Pick any cover from the grid to include with your activation. Its matching page icon set comes with it.
          </p>
        </div>
      )}


      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <div>
            <div>{activationLabel}</div>
            {includedCover ? (
              <div className="text-[11px] text-muted-foreground">
                Includes cover: <span className="text-foreground">{includedCover.name}</span>
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground">
                No cover selected yet
              </div>
            )}
          </div>
          <div>${activationPriceUSD.toFixed(2)}</div>
        </div>


        {extraPackIds.length > 0 && (
          <div className="pt-2 border-t border-border space-y-1">
            {extraPackIds.map((id) => {
              const c = getCover(id);
              return (
                <div key={id} className="flex justify-between text-muted-foreground">
                  <span className="truncate pr-2">Extra: {c?.name ?? id}</span>
                  <span>$5.00</span>
                </div>
              );
            })}
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Discount ({discountLabel})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between font-display text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {extraPackIds.length > 0 && discountLabel && discountAmount === 0 && (
          <p className="text-[11px] text-muted-foreground text-center">{discountLabel}</p>
        )}
        {extraPackIds.length === 0 && (
          <p className="text-[11px] text-muted-foreground text-center">
            Add 3+ covers for 10% off · 5 covers, 5th is free · 6+ for 25% off
          </p>
        )}
      </div>

      <div>
        <label className="text-xs text-muted-foreground block mb-1">
          Send install link to
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
        />
      </div>

      <Button size="lg" className="w-full" onClick={onCheckout} disabled={disabled || !emailValid}>
        Checkout — ${total.toFixed(2)}
      </Button>
      <p className="text-[11px] text-muted-foreground text-center inline-flex items-center justify-center gap-1 w-full">
        <Cloud className="w-3 h-3" /> Cloud backup & multi-device install included
      </p>
    </aside>
  );
}
