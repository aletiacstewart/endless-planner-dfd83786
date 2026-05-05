import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COVERS } from "@/data/covers";
import { PLANNERS } from "@/data/planners";
import { getPageType } from "@/lib/pageTypes";
import { getPageImage } from "@/lib/pageImages";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export default function Landing() {
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();
  const [email, setEmail] = useState("");

  const buy = (plannerId: string, priceId: string) => {
    if (!email || !email.includes("@")) {
      alert("Please enter the email address where we should send your install link.");
      return;
    }
    openCheckout({
      plannerId,
      priceId,
      quantity: 1,
      customerEmail: email,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&planner=${plannerId}`,
    });
  };

  const [code, setCode] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");

  const submitResend = async () => {
    if (!resendEmail.includes("@")) return;
    setResendStatus("sending");
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.functions.invoke("resend-unlock-code", { body: { email: resendEmail } });
    } catch {}
    setResendStatus("sent");
  };

  const planner = PLANNERS[0];
  const pages = planner.pageTypeIds
    .map((id) => getPageType(id))
    .filter((p): p is NonNullable<ReturnType<typeof getPageType>> => Boolean(p));

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <h1 className="font-display text-xl">Endless Planner</h1>
        <a href="#own" className="text-sm text-muted-foreground hover:text-foreground underline">
          I already own it
        </a>
      </header>

      {/* Hero */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Beautifully simple. Yours forever.
        </div>
        <h2 className="font-display text-4xl md:text-6xl mb-4 leading-tight">
          The planner that lives on every device you own
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          A digital planner you install on your phone, tablet, or desktop — beautifully designed,
          fully offline, and yours for life. One simple price.
        </p>
      </section>

      {/* Planner showcase */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h3 className="font-display text-3xl text-center mb-2">Choose your planner</h3>
          <p className="text-center text-muted-foreground mb-10">
            One flat price per planner. Lifetime access.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {PLANNERS.map((p) => (
              <article
                key={p.id}
                className={`planner-card flex flex-col ${!p.available ? "opacity-60" : ""}`}
              >
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-muted mb-4">
                  <img src={p.heroImage} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-display text-xl mb-1">{p.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{p.tagline}</p>
                <ul className="text-sm space-y-1.5 mb-4 flex-1">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex items-baseline justify-between mt-auto">
                  <div>
                    <span className="font-display text-2xl">${p.priceUSD}</span>
                    <span className="text-xs text-muted-foreground ml-1">one-time</span>
                  </div>
                  {p.available ? (
                    <Button onClick={() => document.getElementById("buy")?.scrollIntoView({ behavior: "smooth" })}>
                      Buy & Install
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Coming soon</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-display text-3xl text-center mb-2">What's inside</h3>
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
                  <h4 className="font-medium text-sm mb-1">{p.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cover gallery */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h3 className="font-display text-3xl text-center mb-2">{COVERS.length}+ covers to choose from</h3>
          <p className="text-center text-muted-foreground mb-10">
            Every planner unlocks the full cover library. Switch any time.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {COVERS.map((c) => (
              <div key={c.id} className="aspect-[3/4] rounded-md overflow-hidden bg-card shadow-sm">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-display text-3xl text-center mb-10">How it works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Buy your planner", d: "One flat fee, securely paid online. No subscriptions." },
              { n: "2", t: "Get your install link by email", d: "We'll email you a private link to unlock the planner on your devices." },
              { n: "3", t: "Install & start journaling", d: "Add it to your phone, tablet, or desktop. Works offline. Backup any time." },
            ].map((s) => (
              <div key={s.n} className="planner-card">
                <div className="font-display text-3xl text-primary mb-2">{s.n}</div>
                <h4 className="font-medium mb-1">{s.t}</h4>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Buy block */}
      <section id="buy" className="px-6 py-16 bg-muted/30">
        <div className="max-w-xl mx-auto planner-card text-center">
          <h3 className="font-display text-3xl mb-2">Get the {planner.name}</h3>
          <p className="text-muted-foreground mb-6">
            ${planner.priceUSD} one-time. Lifetime access for as long as the platform is online.
            Install on unlimited personal devices.
          </p>
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
          <Button size="lg" className="w-full" onClick={() => buy(planner.id, planner.priceId)}>
            Pay ${planner.priceUSD} & Install
          </Button>
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
        </div>
      </section>

      {/* Already own it */}
      <section id="own" className="px-6 py-16">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="planner-card">
            <h3 className="font-display text-xl mb-2">Already have a code?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Paste your unlock code to install on this device.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXXXXXX"
              className="w-full px-4 py-3 rounded-md border border-input bg-background mb-3 font-mono text-sm"
            />
            <Button
              className="w-full"
              onClick={() => code.trim() && (window.location.href = `/unlock?code=${encodeURIComponent(code.trim())}`)}
            >
              Unlock on this device
            </Button>
          </div>
          <div className="planner-card">
            <h3 className="font-display text-xl mb-2">Lost your code?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your purchase email and we'll resend your install link.
            </p>
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-md border border-input bg-background mb-3"
            />
            <Button variant="outline" className="w-full" onClick={submitResend} disabled={resendStatus === "sending"}>
              {resendStatus === "sent" ? "Check your inbox" : resendStatus === "sending" ? "Sending…" : "Resend my link"}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h3 className="font-display text-3xl text-center mb-10">Frequently asked</h3>
          <div className="space-y-6">
            {[
              { q: "Where is my data stored?", a: "On your device only. Nothing is sent to our servers. You can export a JSON backup any time from Settings." },
              { q: "What if I get a new phone?", a: "Export your backup from your old device, then use Restore on your new device. Your install link in your purchase email always works on new devices too." },
              { q: "Is this really lifetime?", a: "Yes — one-time payment. You'll have access for as long as the platform is online. No subscriptions, no surprise renewals." },
              { q: "Which devices are supported?", a: "Anything with a modern browser — iPhone, iPad, Android, Mac, Windows, Linux. The planner installs as an app via your browser's 'Add to Home Screen' or 'Install' option." },
              { q: "Refunds?", a: "Because this is a digital download granting lifetime access, all sales are final. Reach out if anything goes wrong with installation and we'll help you out." },
            ].map((f) => (
              <div key={f.q} className="planner-card">
                <h4 className="font-medium mb-2 flex items-start gap-2">
                  <Smartphone className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  {f.q}
                </h4>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 border-t border-border text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Endless Planner. Made with care.
      </footer>
    </div>
  );
}
