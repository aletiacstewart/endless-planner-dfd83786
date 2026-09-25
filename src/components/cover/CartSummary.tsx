import { Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCover } from "@/data/covers";
import {
  calcPackSubtotalUSD,
  calcPackDiscountUSD,
  calcPackTotalUSD,
  getDiscountLabel,
  PACK_DISCOUNT_HINT,
} from "@/data/coverPacks";
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
  needsAccount?: boolean;
  password?: string;
  confirm?: string;
  onPasswordChange?: (v: string) => void;
  onConfirmChange?: (v: string) => void;
  accountError?: string;
  onSignInInstead?: () => void;
  busy?: boolean;
  coverTitle?: string;
  ownerName?: string;
  onCoverTitleChange?: (v: string) => void;
  onOwnerNameChange?: (v: string) => void;
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
  needsAccount,
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  accountError,
  onSignInInstead,
  busy,
  coverTitle,
  ownerName,
  onCoverTitleChange,
  onOwnerNameChange,
}: Props) {
  const includedCover = getCover(includedCoverId);
  const packSubtotal = calcPackSubtotalUSD(extraPackIds);
  const packDiscount = calcPackDiscountUSD(extraPackIds);
  const packTotal = calcPackTotalUSD(extraPackIds);
  const discountLabel = getDiscountLabel(extraPackIds.length);
  const emailValid = /.+@.+\..+/.test(email);
  const accountValid = (password?.length ?? 0) >= 8 && password === confirm;

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
          Monthly membership · cancel anytime
        </p>
      </div>

      {includedCover ? (
        <div className="rounded-sm border border-primary/30 bg-primary/5 p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">
            Included with your membership
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
            Included with your membership
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
          <div className="text-primary whitespace-nowrap">
            ${activationPriceUSD.toFixed(2)}/mo
          </div>
        </div>

        {extraPackIds.length > 0 && (
          <div className="pt-2 border-t border-primary/10 space-y-1">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/60">
              Extra covers · one-time
            </p>
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
            <div className="flex justify-between text-primary/70 pt-1">
              <span>Covers subtotal</span>
              <span>${packSubtotal.toFixed(2)}</span>
            </div>
            {packDiscount > 0 && (
              <div className="flex justify-between text-primary font-medium">
                <span>{discountLabel}</span>
                <span>−${packDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-primary">
              <span>Covers total</span>
              <span>${packTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex justify-between font-storefront text-2xl text-primary pt-3 border-t border-primary/10">
          <span>Today</span>
          <span>${(activationPriceUSD + packTotal).toFixed(2)}</span>
        </div>

        <p className="text-[11px] text-primary/60 text-center font-light">
          {extraPackIds.length > 0
            ? `Membership $${activationPriceUSD.toFixed(2)} + covers $${packTotal.toFixed(2)} one-time, charged together. Then $${activationPriceUSD.toFixed(2)}/month — covers never recur.`
            : `Then $${activationPriceUSD.toFixed(2)}/month · cancel anytime.`}
        </p>


        <p className="text-[11px] text-primary/60 text-center font-light">
          {PACK_DISCOUNT_HINT}
        </p>
      </div>

      {onCoverTitleChange && (
        <div className="space-y-2 rounded-sm border border-primary/15 p-3">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/60">
            Personalize your cover
          </p>
          <input
            value={coverTitle ?? ""}
            maxLength={60}
            onChange={(e) => onCoverTitleChange(e.target.value)}
            placeholder="Cover title (e.g. Sarah's Wellness Planner)"
            aria-label="Cover title"
            className="w-full px-3 h-11 rounded-sm border border-input bg-background text-sm"
          />
          <input
            value={ownerName ?? ""}
            maxLength={60}
            onChange={(e) => onOwnerNameChange?.(e.target.value)}
            placeholder="Your name (optional)"
            aria-label="Your name"
            className="w-full px-3 h-11 rounded-sm border border-input bg-background text-sm"
          />
          <div className="rounded-sm bg-muted/60 py-3 text-center">
            <p className="font-display text-base truncate px-2">{coverTitle?.trim() || "My Planner"}</p>
            {ownerName?.trim() && <p className="font-script text-sm text-muted-foreground truncate px-2">{ownerName}</p>}
          </div>
        </div>
      )}

      {needsAccount ? (
        <div className="space-y-2 rounded-sm border border-primary/15 p-3">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/60">
            Create your account
          </p>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 h-11 rounded-sm border border-input bg-background text-sm"
          />
          <input
            type="password"
            autoComplete="new-password"
            value={password ?? ""}
            onChange={(e) => onPasswordChange?.(e.target.value)}
            placeholder="Password (8+ characters)"
            className="w-full px-3 h-11 rounded-sm border border-input bg-background text-sm"
          />
          <input
            type="password"
            autoComplete="new-password"
            value={confirm ?? ""}
            onChange={(e) => onConfirmChange?.(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-3 h-11 rounded-sm border border-input bg-background text-sm"
          />
          {accountError && <p className="text-[11px] text-destructive">{accountError}</p>}
          {onSignInInstead && (
            <button type="button" onClick={onSignInInstead} className="text-[11px] underline text-primary/70">
              Already have an account? Sign in instead
            </button>
          )}
          <p className="text-[11px] text-primary/60 font-light">
            After paying, we'll email you a link to activate your account and open your planner.
          </p>
        </div>
      ) : (
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
      )}

      <Button
        size="lg"
        className="w-full rounded-sm h-12 text-[11px] uppercase tracking-[0.2em] font-bold"
        onClick={onCheckout}
        disabled={disabled || busy || !emailValid || !includedCover || (needsAccount && !accountValid)}
      >
        {includedCover
          ? `Start membership — $${activationPriceUSD.toFixed(2)}/mo`
          : "Choose a cover to continue"}
      </Button>
      <p className="text-[11px] text-primary/60 text-center inline-flex items-center justify-center gap-1 w-full font-light">
        <Cloud className="w-3 h-3" /> Cloud backup, every-device sync & calendar sync included
      </p>
    </aside>
  );
}
