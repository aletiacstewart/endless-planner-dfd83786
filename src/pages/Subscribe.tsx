import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PLANNERS } from "@/data/planners";
import { toast } from "sonner";

const PLANNER = PLANNERS[0];

export default function Subscribe() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();

  useEffect(() => {
    if (!authLoading && !user) {
      toast.message("Sign in to start your planner membership");
      navigate("/auth", { replace: true, state: { next: "/subscribe" } });
    }
  }, [user, authLoading, navigate]);

  const subscribe = () => {
    if (!user?.email) return;
    openCheckout({
      priceId: PLANNER.priceId,
      quantity: 1,
      customerEmail: user.email,
      userId: user.id,
      plannerId: PLANNER.id,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&sub=1`,
    });
  };

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
        <h1 className="font-display text-3xl text-center mb-2">Endless Planner membership</h1>
        <p className="text-center text-muted-foreground mb-8">$21.97/month — cancel anytime.</p>

        <ul className="space-y-2 mb-8">
          {[
            "The complete planner — 40 guided pages",
            "1 cover & matching icon set of your choice",
            "Automatic cloud backup of everything you write",
            "Sync across phone, tablet, and desktop",
            "Two-way Google & Apple calendar sync",
            "Ongoing planner updates & new features",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {isActive ? (
          <div className="planner-card text-center space-y-3">
            <p className="text-sm">Your membership is active.</p>
            <Button variant="outline" onClick={() => navigate("/settings")}>Manage in Settings</Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
            <Button size="lg" className="w-full" onClick={subscribe}>
              Start membership — $21.97/month
            </Button>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Extra covers are $5 each — 10% off 2–5, 20% off 6 or more.
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
