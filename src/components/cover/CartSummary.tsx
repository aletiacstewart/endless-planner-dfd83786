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
    <aside
      className={cn(
        "md:sticky md:top-6 bg-card border border-primary/10 rounded-sm p-6 space-y-5 shadow-[0_20px_50px_-30px_hsl(var(--primary)/0.25)]",
        className
      )}
    >
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 mb-1">
          Your order
        </p>
        <h3 className="font-storefront text-2xl text-primary">Cart summary</h3>
        <p className="text-[11px] text-primary/60 mt-1 font-light">
          One-time purchase · no subscription
        </p>
      </div>

      {includedCover ? (
        <div className="rounded-sm border border-primary/30 bg-primary/5 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
            Included with activation
          </p>
          <div className="flex gap-3 items-center">
            <div className="relative w-16 h-16 rounded-sm overflow-hidden flex-shrink-0 border border-primary/20">
              <CoverImage cover={includedCover} className="absolute inset-0" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-storefront text-lg text-primary truncate">
                {includedCover.name}
              </div>
              <div className="text-[11px] text-primary/60">
                Cover + matching page icons + stickers
              </div>
            </div>
          </div>
          <CoverIconStrip coverId={includedCover.id} />
          <p className="text-[11px] text-primary/50 text-center font-light">
            Tap any other cover to switch which one is included.
          </p>
        </div>
      ) : (
        <div className="rounded-sm border border-dashed border-primary/30 p-5 text-center space-y-1">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/60">
            Included with activation
          </p>
          <p className="text-sm font-storefront text-lg text-primary">Choose your cover</p>
          <p className="text-[11px] text-primary/60 font-light">
            Every cover ships with its matching page icons + themed sticker set.
          </p>
        </div>
      )}

      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <div>
            <div className="text-primary">{activationLabel}</div>
            {includedCover ? (
              <div className="text-[11px] text-primary/60">
                Includes: <span className="text-primary">{includedCover.name}</span>
              </div>
            ) : (
              <div className="text-[11px] text-primary/50">No cover selected yet</div>
            )}
          </div>
          <div className="text-primary">${activationPriceUSD.toFixed(2)}</div>
        </div>

        {extraPackIds.length > 0 && (
          <div className="pt-2 border-t border-primary/10 space-y-1">
            {extraPackIds.map((id) => {
              const c = getCover(id);
              return (
                <div key={id} className="space-y-1 rounded-sm border border-primary/10 p-2">
                  <div className="flex justify-between text-primary/70">
                    <span className="truncate pr-2">Extra: {c?.name ?? id}</span>
                    <span>$5.00</span>
                  </div>
                  <CoverIconStrip coverId={id} />
                </div>
              );
            })}
            {discountAmount > 0 && (
              <div className="flex justify-between text-primary font-semibold">
                <span>Discount ({discountLabel})</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between font-storefront text-2xl text-primary pt-3 border-t border-primary/10">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        {extraPackIds.length > 0 && discountLabel && discountAmount === 0 && (
          <p className="text-[11px] text-primary/60 text-center">{discountLabel}</p>
        )}
        {extraPackIds.length === 0 && (
          <p className="text-[11px] text-primary/60 text-center font-light">
            Buy 5 or more covers and save 10%
          </p>
        )}
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/60 block mb-1.5">
          Send install link to
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 rounded-sm border border-input bg-background text-sm"
        />
      </div>

      <Button
        size="lg"
        className="w-full rounded-sm h-12 text-[11px] uppercase tracking-[0.2em] font-bold"
        onClick={onCheckout}
        disabled={disabled || !emailValid || !includedCover}
      >
        {includedCover ? `Checkout — $${total.toFixed(2)}` : "Choose a cover to continue"}
      </Button>
      <p className="text-[11px] text-primary/60 text-center inline-flex items-center justify-center gap-1 w-full font-light">
        <Cloud className="w-3 h-3" /> Cloud backup & multi-device install included
      </p>
    </aside>
  );
}

