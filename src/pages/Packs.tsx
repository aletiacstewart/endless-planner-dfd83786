import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoverPackPicker, CoverPackSummary } from "@/components/cover/CoverPackPicker";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { isPackUnlocked } from "@/lib/unlock";
import { useEntitlements } from "@/hooks/useEntitlements";

export default function Packs() {
  useEntitlements();
  const [searchParams] = useSearchParams();
  const focus = searchParams.get("focus");
  const [packIds, setPackIds] = useState<string[]>(() =>
    focus && !isPackUnlocked(focus) ? [focus] : []
  );
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
          First pack $4.99 · each additional $2.99
        </p>

        <CoverPackPicker selectedPackIds={packIds} onChange={setPackIds} hideOwned />
      </section>

      {packIds.length > 0 && (
        <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur px-6 py-4">
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
              Checkout — {packIds.length} pack{packIds.length === 1 ? "" : "s"}
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
