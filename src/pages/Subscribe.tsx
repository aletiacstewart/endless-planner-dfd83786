import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();

  const subscribe = () => {
    if (!email || !email.includes("@")) {
      alert("Enter your email to subscribe.");
      return;
    }
    openCheckout({
      priceId: "endless_planner_cloud_monthly",
      customerEmail: email,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&sub=1`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link to="/" className="font-display text-xl">Endless Planner</Link>
        <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </header>

      <section className="px-6 py-12 max-w-xl mx-auto">
        <h1 className="font-display text-3xl text-center mb-2">Endless Planner Cloud</h1>
        <p className="text-center text-muted-foreground mb-8">
          $10/month — cancel anytime.
        </p>

        <ul className="space-y-2 mb-8">
          {[
            "Automatic cloud backup of all your entries",
            "Sync across phone, tablet, and desktop",
            "Restore your planner on any new device",
            "Ongoing planner updates & new features",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-md border border-input bg-background mb-3"
        />
        <Button size="lg" className="w-full" onClick={subscribe}>
          Subscribe — $10/month
        </Button>
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
