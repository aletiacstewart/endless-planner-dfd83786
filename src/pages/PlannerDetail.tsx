import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlanner } from "@/data/planners";
import { getPageType } from "@/lib/pageTypes";
import { getPageImage } from "@/lib/pageImages";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export default function PlannerDetail() {
  const { plannerId = "" } = useParams();
  const planner = getPlanner(plannerId);
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();
  const [email, setEmail] = useState("");

  if (!planner) return <Navigate to="/" replace />;

  const pages = planner.pageTypeIds
    .map((id) => getPageType(id))
    .filter((p): p is NonNullable<ReturnType<typeof getPageType>> => Boolean(p));

  const buy = () => {
    if (!email || !email.includes("@")) {
      alert("Please enter the email address where we should send your install link.");
      return;
    }
    openCheckout({
      priceId: planner.priceId,
      quantity: 1,
      customerEmail: email,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&planner=${planner.id}`,
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

      {/* Buy & Install hero */}
      <section className="px-6 py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-start">
          <div className="aspect-[16/10] rounded-lg overflow-hidden bg-muted">
            <img src={planner.heroImage} alt={planner.name} className="w-full h-full object-cover" />
          </div>
          <div className="planner-card">
            <h1 className="font-display text-3xl mb-2">{planner.name}</h1>
            <p className="text-muted-foreground mb-4">{planner.tagline}</p>
            <ul className="text-sm space-y-1.5 mb-5">
              {planner.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <div className="mb-4">
              <span className="font-display text-3xl">${planner.priceUSD}</span>
              <span className="text-xs text-muted-foreground ml-1">one-time · lifetime access</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-md border border-input bg-background mb-3"
            />
            <p className="text-xs text-muted-foreground mb-4">
              We'll email your install link to this address after payment.
            </p>
            {planner.available ? (
              <Button size="lg" className="w-full" onClick={buy}>
                Buy & Install — ${planner.priceUSD}
              </Button>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Coming soon
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-2">What's inside</h2>
          <p className="text-center text-muted-foreground mb-10">
            {pages.length} guided pages in the {planner.name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((p) => {
              const img = getPageImage(p.id);
              return (
                <div key={p.id} className="planner-card text-center">
                  {img ? (
                    <div className="aspect-square rounded-md overflow-hidden bg-muted mb-2">
                      <img src={img} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  ) : null}
                  <h3 className="font-medium text-sm mb-1">{p.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
              );
            })}
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
