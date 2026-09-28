import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANNERS, CLOUD_PRICE_ID } from "@/data/planners";
import { useEntitlements } from "@/hooks/useEntitlements";
import { toast } from "sonner";

const PLANNER = PLANNERS[0];

export default function Subscribe() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const ent = useEntitlements();
  const ownsPlanner = ent.hasPlanner(PLANNER.id);
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();

  useEffect(() => {
    if ((!authLoading && !user) || (!ent.loading && user && !ownsPlanner)) {
      // New visitors create their account inside the checkout on the planner page.
      navigate(`/planner/${PLANNER.slug}`, { replace: true });
    }
  }, [user, authLoading, navigate, ent.loading, ownsPlanner]);

  const subscribe = () => {
    if (!user?.email) return;
    openCheckout({
      priceId: CLOUD_PRICE_ID,
      quantity: 1,
      customerEmail: user.email,
      userId: user.id,
      plannerId: PLANNER.id,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&sub=1`,
    });
  };

  useEffect(() => {
    const wants = new URLSearchParams(window.location.search).get("checkout") === "1";
    if (wants && user?.email && !subLoading && !isActive && !isOpen) {
      subscribe();
      navigate("/subscribe", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, subLoading, isActive]);

  if (authLoading || subLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="font-display text-xl">Endless Planner</Link>
        <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </header>

      <section className="px-6 py-12 max-w-xl mx-auto">
        <h1 className="font-display text-3xl text-center mb-2">Cloud plan</h1>
        <p className="text-center text-muted-foreground mb-8">$10/month — cancel anytime. Your planner stays yours either way.</p>

        <ul className="space-y-2 mb-8">
          {[
            "Automatic cloud backup of everything you write",
            "Restore on a new phone, tablet or computer",
            "Sync across phone, tablet, and desktop",
            "Two-way Google & Apple calendar sync",
            "Ongoing planner updates & new features",
            "Each new calendar year (2027, 2028…) with a page-by-page move",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {isActive ? (
          <div className="planner-card text-center space-y-3">
            <p className="text-sm">Your cloud plan is active.</p>
            <Button variant="outline" onClick={() => navigate("/settings")}>Manage in Settings</Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
            <Button size="lg" className="w-full" onClick={subscribe}>
              Start cloud plan — $10/month
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Without it, your planner keeps working on this device, but backup, sync and new years pause.
            </p>
          </>
        )}
      </section>

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
