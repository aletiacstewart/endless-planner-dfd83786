import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverPackPicker, CoverPackSummary } from "@/components/cover/CoverPackPicker";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { isPackPurchased } from "@/lib/unlock";
import { useEntitlements } from "@/hooks/useEntitlements";
import { PACK_DISCOUNT_HINT, calcPackTotalUSD } from "@/data/coverPacks";

export default function Packs() {
  const { admin, fullAccess } = useEntitlements();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get("focus");
  const preselected = (searchParams.get("pre") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((id) => id && !isPackPurchased(id));
  const [previewPrices, setPreviewPrices] = useState(false);
  const [packIds, setPackIds] = useState<string[]>(() => {
    if (preselected.length > 0) return preselected;
    return focus && !isPackPurchased(focus) ? [focus] : [];
  });
  // Admin and tester accounts already own every cover and icon set — nothing to buy.
  const adminAccess = fullAccess && !previewPrices;
  const [email, setEmail] = useState("");
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();

  useEffect(() => {
    if (focus) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [focus]);

  const buy = () => {
    if (packIds.length === 0) return;
    if (!email || !email.includes("@")) {
      alert("Enter the email where we should send your unlock codes.");
      return;
    }
    openCheckout({
      customerEmail: email,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      packIds,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="font-display text-xl">Endless Planner</Link>
        <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to planner
        </Link>
      </header>

      <section className="px-6 py-10 max-w-5xl mx-auto">
        <h1 className="font-display text-3xl text-center mb-2">Cover &amp; Icon Packs</h1>
        <p className="text-center text-muted-foreground mb-2">
          Each pack re-themes the whole planner — cover, palette, and matching page icons.
        </p>
        <p className="text-center text-xs text-muted-foreground mb-8">
          {PACK_DISCOUNT_HINT}
        </p>

        {fullAccess && (
          <div className="mb-8 rounded-xl border border-primary/40 bg-primary-soft/40 px-4 py-3 text-center text-sm">
            {adminAccess
              ? `${admin ? "Admin" : "Test"} account — every cover and its matching page icons, stickers and library art are already unlocked for you.`
              : "Price preview on — showing the normal buyer view."}
            <Button
              variant="link"
              size="sm"
              className="ml-2 h-auto p-0 align-baseline"
              onClick={() => {
                setPreviewPrices((v) => !v);
                setPackIds([]);
              }}
            >
              {adminAccess ? "Preview prices" : `Back to ${admin ? "admin" : "test"} view`}
            </Button>
          </div>
        )}

        <CoverPackPicker
          selectedPackIds={packIds}
          onChange={setPackIds}
          hideOwned
          ignoreAdmin={previewPrices}
        />
      </section>

      {packIds.length > 0 && !adminAccess && (
        <div className="sticky bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur px-6 py-4 shadow-lg">
          <div className="max-w-2xl mx-auto space-y-3">
            <CoverPackSummary packIds={packIds} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-md border border-input bg-background"
            />
            <Button size="lg" className="w-full" onClick={buy}>
              Checkout — ${calcPackTotalUSD(packIds).toFixed(2)} for {packIds.length} pack{packIds.length === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
          <div className="max-w-xl mx-auto p-6">
            <button onClick={closeCheckout} className="mb-4 text-sm underline">← Cancel</button>
            {checkoutElement}
          </div>
        </div>
      )}
    </div>
  );
}
