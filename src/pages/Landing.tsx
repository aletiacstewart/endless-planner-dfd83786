import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Smartphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COVERS } from "@/data/covers";
import { PLANNERS, type PlannerDef } from "@/data/planners";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { CoverSlideshow } from "@/components/cover/CoverSlideshow";
import { CoverIconStrip } from "@/components/cover/CoverIconStrip";

function PlannerShowcaseCard({ p }: { p: PlannerDef }) {
  const [coverId, setCoverId] = useState<string | undefined>();
  return (
    <article className={`planner-card flex flex-col gap-4 ${!p.available ? "opacity-60" : ""}`}>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <CoverSlideshow onCoverChange={setCoverId} />
        <CoverIconStrip coverId={coverId} />
      </div>
      <div>
        <h4 className="font-display text-xl mb-1">{p.name}</h4>
        <p className="text-sm text-muted-foreground mb-3">{p.tagline}</p>
        <ul className="text-sm space-y-1.5 mb-4">
          {p.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-display text-2xl">${p.priceUSD}</span>
            <span className="text-xs text-muted-foreground ml-1">
              today, then ${p.monthlyPriceUSD}/mo
            </span>
          </div>
          {p.available ? (
            <Button asChild>
              <Link to={`/planner/${p.id}`}>Subscribe & Install</Link>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function Landing() {
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

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <h1 className="font-display text-xl">Endless Planner</h1>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground underline">
            Sign in
          </Link>
          <a href="#own" className="text-sm text-muted-foreground hover:text-foreground underline">
            I already own it
          </a>
        </div>
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
          works offline, and backed up to the cloud so it follows you to every device.
        </p>
      </section>

      {/* Planner showcase */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h3 className="font-display text-3xl text-center mb-2">Choose your planner</h3>
          <p className="text-center text-muted-foreground mb-10">
            $19.97 to get started. $10/month for updates, cloud backup &amp; restore.
          </p>
          <div className="grid gap-6">
            {PLANNERS.map((p) => (
              <PlannerShowcaseCard key={p.id} p={p} />
            ))}
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
              { n: "1", t: "Subscribe & activate", d: "$19.97 to start, then $10/month for updates and cloud hosting. Cancel any time." },
              { n: "2", t: "Get your install link by email", d: "We'll email you a private link to unlock the planner on your devices." },
              { n: "3", t: "Install & sync everywhere", d: "Add it to your phone, tablet, or desktop. Works offline. Sign in on any device to restore." },
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
              { q: "Where is my data stored?", a: "On your device and backed up to our cloud so you can restore on any device. Export a JSON backup any time from Settings." },
              { q: "What if I get a new phone?", a: "Sign in on the new device and your planner restores from the cloud automatically. Your subscription covers unlimited devices." },
              { q: "How does the pricing work?", a: "$19.97 to activate your planner today, then $10/month for continued updates, cloud hosting, and multi-device backup/restore. Cancel any time." },
              { q: "Which devices are supported?", a: "Anything with a modern browser — iPhone, iPad, Android, Mac, Windows, Linux. The planner installs as an app via your browser's 'Add to Home Screen' or 'Install' option." },
              { q: "Refunds?", a: "Cancel your subscription any time. Because activation grants immediate digital access, the initial $19.97 setup fee is non-refundable." },
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

      <footer className="px-6 py-10 border-t border-border text-center text-sm text-muted-foreground space-y-2">
        <p>© {new Date().getFullYear()} Endless Planner. Made with care.</p>
        <p>
          <Link
            to="/admin-planner?key=let-me-in-2026"
            className="text-xs text-muted-foreground/60 hover:text-foreground underline-offset-2 hover:underline"
          >
            Admin login
          </Link>
        </p>
      </footer>
    </div>
  );
}
