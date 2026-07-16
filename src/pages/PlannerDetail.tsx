import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Check, ArrowLeft, Download, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlanner } from "@/data/planners";
import { getPageType } from "@/lib/pageTypes";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CoverPackPicker, CoverPackSummary } from "@/components/cover/CoverPackPicker";
import { CoverSlideshow } from "@/components/cover/CoverSlideshow";
import { CoverIconStrip } from "@/components/cover/CoverIconStrip";
import { CoverSelect } from "@/components/cover/CoverSelect";
import { calcPackTotalUSD } from "@/data/coverPacks";
import { COVERS, getCover } from "@/data/covers";

export default function PlannerDetail() {
  const { plannerId = "" } = useParams();
  const planner = getPlanner(plannerId);
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();
  const [email, setEmail] = useState("");
  const [primaryCoverId, setPrimaryCoverId] = useState<string>(COVERS[0]?.id ?? "");
  const [packIds, setPackIds] = useState<string[]>([]);
  const [featuredCoverId, setFeaturedCoverId] = useState<string | undefined>(primaryCoverId);

  if (!planner) return <Navigate to="/" replace />;

  const pages = planner.pageTypeIds
    .map((id) => getPageType(id))
    .filter((p): p is NonNullable<ReturnType<typeof getPageType>> => Boolean(p));

  const packSubtotal = calcPackTotalUSD(packIds);
  const dueToday = planner.priceUSD + packSubtotal;

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
      ...({
        packIds,
        plannerId: planner.id,
        selectedCoverId: featuredCoverId,
        monthlyPriceId: planner.monthlyPriceId,
      } as any),
    });
  };

  const featured = featuredCoverId ? getCover(featuredCoverId) : undefined;

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
          <div>
            <CoverSlideshow onCoverChange={setFeaturedCoverId} />
            {featured && (
              <p className="text-xs text-muted-foreground text-center mt-2 mb-4">
                Previewing: <span className="text-foreground font-medium">{featured.name}</span> — pick your favorite below.
              </p>
            )}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Page icons in this set
              </p>
              <CoverIconStrip coverId={featuredCoverId} />
            </div>
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

            <div className="rounded-md bg-muted/40 border border-border p-3 mb-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span>Planner activation (one-time)</span>
                <span>${planner.priceUSD.toFixed(2)}</span>
              </div>
              {packIds.length > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{packIds.length} extra cover pack{packIds.length === 1 ? "" : "s"}</span>
                  <span>${packSubtotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-display text-lg pt-1.5 border-t border-border">
                <span>Due today</span>
                <span>${dueToday.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Then</span>
                <span>${planner.monthlyPriceUSD}/month — updates, cloud backup & restore</span>
              </div>
            </div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-md border border-input bg-background mb-3"
            />
            <p className="text-xs text-muted-foreground mb-4">
              We'll email your install link to this address. Sign in on any device to restore.
            </p>
            {planner.available ? (
              <>
                <Button size="lg" className="w-full" onClick={buy}>
                  <Download className="w-4 h-4 mr-2" />
                  Subscribe &amp; Install — ${dueToday.toFixed(2)} today
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2 inline-flex items-center justify-center gap-1 w-full">
                  <Cloud className="w-3 h-3" /> Then ${planner.monthlyPriceUSD}/month · cancel anytime
                </p>
              </>
            ) : (
              <Button size="lg" className="w-full" disabled>
                Coming soon
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Choose covers */}
      <section className="px-6 py-12 bg-muted/20 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-2">Add extra covers</h2>
          <p className="text-center text-muted-foreground mb-2">
            Each pack re-themes the whole planner with a matching cover &amp; icon set.
          </p>
          <p className="text-center text-xs text-muted-foreground mb-8">
            $10 per pack · 3+ save 10% · pick 5 &amp; the 5th is free · 6+ save 25%
          </p>
          <CoverPackPicker selectedPackIds={packIds} onChange={setPackIds} />
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
