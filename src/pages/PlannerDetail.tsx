import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { getPlanner } from "@/data/planners";
import { getPageType } from "@/lib/pageTypes";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CoverCard } from "@/components/cover/CoverCard";
import { CartSummary } from "@/components/cover/CartSummary";
import { COLLECTIONS, COVERS, type CoverCollection } from "@/data/covers";
import { calcPackTotalUSD } from "@/data/coverPacks";
import { cn } from "@/lib/utils";

export default function PlannerDetail() {
  const { plannerId = "" } = useParams();
  const planner = getPlanner(plannerId);
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();
  const [email, setEmail] = useState("");
  const [includedCoverId, setIncludedCoverId] = useState<string>("");
  const [extraPackIds, setExtraPackIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<CoverCollection | "all">("all");

  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const visibleCovers = useMemo(
    () => (filter === "all" ? COVERS : COVERS.filter((c) => c.collection === filter)),
    [filter]
  );

  if (!planner) return <Navigate to="/" replace />;

  const pages = planner.pageTypeIds
    .map((id) => getPageType(id))
    .filter((p): p is NonNullable<ReturnType<typeof getPageType>> => Boolean(p));

  const total = planner.priceUSD + calcPackTotalUSD(extraPackIds);

  const addExtra = (id: string) => {
    if (id === includedCoverId) return;
    setExtraPackIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const removeExtra = (id: string) => setExtraPackIds((prev) => prev.filter((x) => x !== id));
  const makeIncluded = (id: string) => {
    setExtraPackIds((prev) => prev.filter((x) => x !== id));
    setIncludedCoverId(id);
  };

  const buy = () => {
    openCheckout({
      priceId: planner.priceId,
      quantity: 1,
      customerEmail: email,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&planner=${planner.id}`,
      ...({
        packIds: extraPackIds,
        plannerId: planner.id,
        selectedCoverId: includedCoverId,
      } as any),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />

      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="font-display text-xl">Endless Planner</Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> All planners
        </Link>
      </header>

      <section className="px-6 py-10 max-w-6xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl md:text-4xl mb-2">{planner.name}</h1>
          <p className="text-muted-foreground mb-4">{planner.tagline}</p>
          <ul className="text-sm space-y-1.5 mb-3">
            {planner.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">One-time ${planner.priceUSD.toFixed(2)}</span> activation includes 1 cover of your choice. Add more for <span className="font-medium text-foreground">$5 each</span> — 3+ save 10%, 5th free, 6+ save 25%.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Cover grid */}
          <div>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-display text-2xl">Pick your covers</h2>
              <p className="text-xs text-muted-foreground">
                Every cover ships with its own matching page icon set. Star one to include with activation.
              </p>
            </div>


            <div className="overflow-x-auto whitespace-nowrap -mx-1 px-1 pb-2 mb-4">
              <button onClick={() => setFilter("all")} className={chipClass(filter === "all")}>
                All
              </button>
              {availableCollections.map((c) => (
                <button key={c.id} onClick={() => setFilter(c.id)} className={chipClass(filter === c.id)}>
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visibleCovers.map((c) => (
                <CoverCard
                  key={c.id}
                  cover={c}
                  isIncluded={c.id === includedCoverId}
                  isExtra={extraPackIds.includes(c.id)}
                  onAddExtra={() => addExtra(c.id)}
                  onRemoveExtra={() => removeExtra(c.id)}
                  onMakeIncluded={() => makeIncluded(c.id)}
                />
              ))}
            </div>
          </div>

          {/* Cart */}
          <CartSummary
            activationLabel={`${planner.name} activation`}
            activationPriceUSD={planner.priceUSD}
            includedCoverId={includedCoverId}
            extraPackIds={extraPackIds}
            email={email}
            onEmailChange={setEmail}
            onCheckout={buy}
            disabled={!planner.available || !includedCoverId}
          />

        </div>
      </section>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-background border-t border-border p-3 flex items-center justify-between gap-3 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div>
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="font-display text-lg">${total.toFixed(2)}</div>
        </div>
        <button
          onClick={() => {
            document.querySelector("aside.planner-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          className="px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium flex-1 text-center"
        >
          Review & checkout
        </button>
      </div>

      {/* What's inside */}
      <section className="px-6 py-16 bg-muted/30 mb-24 md:mb-0">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-2">What's inside</h2>
          <p className="text-center text-muted-foreground mb-10">
            {pages.length} guided pages in the {planner.name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((p) => (
              <div key={p.id} className="planner-card text-center">
                <h3 className="font-medium text-sm mb-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
          <div className="max-w-xl mx-auto p-6">
            <button onClick={closeCheckout} className="mb-4 text-sm underline">
              ← Cancel
            </button>
            {checkoutElement}
          </div>
        </div>
      )}

      <footer className="px-6 py-10 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Endless Planner. Made with care.
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
