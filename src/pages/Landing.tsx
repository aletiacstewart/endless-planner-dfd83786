import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Cloud, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COVERS, COLLECTIONS, type CoverCollection } from "@/data/covers";
import { PLANNERS } from "@/data/planners";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { cn } from "@/lib/utils";

export default function Landing() {
  const [code, setCode] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [filter, setFilter] = useState<CoverCollection | "all">("all");

  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const previewCovers = useMemo(() => {
    const source = filter === "all" ? COVERS : COVERS.filter((c) => c.collection === filter);
    return source.slice(0, 8);
  }, [filter]);

  const flagshipPlanner = PLANNERS.find((p) => p.available) ?? PLANNERS[0];

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
    <div className="min-h-screen bg-background font-storefront-body">
      <PaymentTestModeBanner />

      {/* Header */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-primary/10">
        <Link to="/" className="font-storefront text-xl md:text-2xl text-primary">Endless Planner</Link>
        <div className="flex items-center gap-5">
          <a href="#covers" className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-primary/70 hover:text-primary font-semibold">
            Covers
          </a>
          <a href="#own" className="hidden sm:inline text-[11px] uppercase tracking-[0.2em] text-primary/70 hover:text-primary font-semibold">
            Already own
          </a>
          <Link
            to="/auth"
            className="text-[11px] uppercase tracking-[0.2em] text-primary/70 hover:text-primary font-semibold"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Editorial Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] uppercase tracking-[0.3em] font-bold mb-6">
              <Sparkles className="w-3 h-3" /> Curated digital planning
            </div>
            <h1 className="font-storefront text-5xl md:text-7xl text-primary leading-[1.05] mb-6">
              Curate your <i className="font-normal">digital</i> ritual.
            </h1>
            <p className="text-primary/70 text-lg leading-relaxed max-w-lg font-light">
              Beautifully designed digital planners for phone, tablet, and desktop.
              Every cover ships with 20 matching page icons and a 60-piece themed sticker set.
            </p>
          </div>

          {/* Selection pill / entry point */}
          <div className="bg-card border border-primary/10 p-3 rounded-full shadow-sm flex items-center gap-3 pr-2 ring-8 ring-primary/5">
            <span className="pl-4 text-[10px] font-bold text-primary/60 uppercase tracking-[0.25em] hidden sm:inline">
              Activation
            </span>
            <Button asChild size="lg" className="rounded-full px-6 md:px-8 text-[11px] uppercase tracking-[0.2em] font-bold">
              <Link to={`/planner/${flagshipPlanner.id}`}>
                ${flagshipPlanner.priceUSD} · Start
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cover Preview Grid */}
      <section id="covers" className="px-6 md:px-12 pb-16 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-10 border-b border-primary/10 pb-6">
          <button
            onClick={() => setFilter("all")}
            className={chipClass(filter === "all")}
          >
            All {COVERS.length} Covers
          </button>
          {availableCollections.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={chipClass(filter === c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 lg:gap-x-10 gap-y-10">
          {previewCovers.map((c) => (
            <Link key={c.id} to={`/planner/${flagshipPlanner.id}`} className="group cursor-pointer block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-secondary mb-4 transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-primary/10">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <h3 className="font-storefront text-xl text-primary truncate">{c.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-primary/40 font-bold mt-0.5">
                    {COLLECTIONS.find((x) => x.id === c.collection)?.label ?? "Collection"}
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-primary bg-primary/5 px-2 py-1 rounded">
                  +$5.00
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline" className="rounded-full px-8 text-[11px] uppercase tracking-[0.2em] font-bold">
            <Link to={`/planner/${flagshipPlanner.id}`}>View all {COVERS.length} covers</Link>
          </Button>
        </div>
      </section>

      {/* Lifestyle editorial break — Cloud Sync CTA */}
      <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="relative rounded-sm overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 min-h-[380px] flex flex-col justify-end p-10 md:p-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, hsl(var(--primary-foreground) / 0.3), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--accent) / 0.4), transparent 45%)",
            }}
          />
          <div className="relative">
            <p className="text-primary-foreground/70 text-[10px] uppercase tracking-[0.4em] mb-4 font-bold">
              The lifestyle upgrade
            </p>
            <h2 className="text-primary-foreground font-storefront text-4xl md:text-5xl mb-6 max-w-lg leading-tight">
              Elegance in every pixel.
            </h2>
            <div className="bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 p-6 rounded-sm max-w-sm">
              <p className="text-primary-foreground text-sm font-light leading-relaxed mb-4">
                Sync your beautifully curated planner across every device for $10/month.
                Cancel anytime.
              </p>
              <Button asChild variant="secondary" className="w-full rounded-none text-[10px] uppercase tracking-[0.2em] font-bold h-11">
                <Link to="/subscribe">
                  <Cloud className="w-3.5 h-3.5 mr-2" /> Activate Cloud Sync
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <h2 className="font-storefront text-4xl md:text-5xl text-primary text-center mb-16">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { n: "01", t: "Pick your covers", d: "$19.97 one-time activation gets you the planner and 1 cover of your choice. Add more for $5 each — no subscription required." },
            { n: "02", t: "Install by email", d: "We'll email your private install link — add it to your phone, tablet, or desktop as an app." },
            { n: "03", t: "Sync everywhere", d: "Optional $10/mo cloud sync keeps your entries in step across every device. Works offline either way." },
          ].map((s) => (
            <div key={s.n} className="border-t border-primary/20 pt-6">
              <div className="font-storefront text-4xl text-primary/40 mb-4">{s.n}</div>
              <h3 className="font-storefront text-2xl text-primary mb-3">{s.t}</h3>
              <p className="text-sm text-primary/70 leading-relaxed font-light">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Already own it */}
      <section id="own" className="px-6 md:px-12 py-16 bg-secondary/40">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="bg-card p-8 rounded-sm border border-primary/10">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 mb-3">Reinstall</p>
            <h3 className="font-storefront text-2xl text-primary mb-3">Already have a code?</h3>
            <p className="text-sm text-primary/70 mb-5 font-light">
              Paste your unlock code to install on this device.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXX-XXXX-XXXXXXXX"
              className="w-full px-4 py-3 rounded-sm border border-input bg-background mb-3 font-mono text-sm"
            />
            <Button
              className="w-full rounded-sm text-[11px] uppercase tracking-[0.2em] font-bold h-11"
              onClick={() =>
                code.trim() &&
                (window.location.href = `/unlock?code=${encodeURIComponent(code.trim())}`)
              }
            >
              Unlock on this device
            </Button>
          </div>
          <div className="bg-card p-8 rounded-sm border border-primary/10">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 mb-3">Recovery</p>
            <h3 className="font-storefront text-2xl text-primary mb-3">Lost your code?</h3>
            <p className="text-sm text-primary/70 mb-5 font-light">
              Enter your purchase email and we'll resend your install link.
            </p>
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-sm border border-input bg-background mb-3"
            />
            <Button
              variant="outline"
              className="w-full rounded-sm text-[11px] uppercase tracking-[0.2em] font-bold h-11"
              onClick={submitResend}
              disabled={resendStatus === "sending"}
            >
              {resendStatus === "sent"
                ? "Check your inbox"
                : resendStatus === "sending"
                  ? "Sending…"
                  : "Resend my link"}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <h2 className="font-storefront text-4xl md:text-5xl text-primary text-center mb-14">
          Frequently asked
        </h2>
        <div className="space-y-6">
          {[
            { q: "Where is my data stored?", a: "On your device, with optional cloud backup so you can restore on any device. Export a JSON backup any time from Settings." },
            { q: "What if I get a new phone?", a: "Sign in on the new device — with active Cloud Sync your planner restores automatically. Otherwise use your unlock code to reinstall." },
            { q: "How does pricing work?", a: "$19.97 one-time gets you the planner and 1 cover + matching icon set + 60 themed stickers. Extra covers are $5 each — buy 5 or more and save 10%. Optional $10/mo Cloud Sync keeps devices in step." },
            { q: "Which devices are supported?", a: "Anything with a modern browser — iPhone, iPad, Android, Mac, Windows, Linux. Install as an app via 'Add to Home Screen'." },
            { q: "Refunds?", a: "Because activation grants immediate digital access, purchases are non-refundable. Reach out if something isn't working and we'll make it right." },
          ].map((f) => (
            <div key={f.q} className="border-t border-primary/10 pt-5">
              <h3 className="font-storefront text-xl text-primary mb-2">{f.q}</h3>
              <p className="text-sm text-primary/70 font-light leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 md:px-12 py-12 border-t border-primary/10 text-center text-sm text-primary/60 space-y-2 bg-secondary/30">
        <p className="font-storefront text-lg text-primary">Endless Planner</p>
        <p>© {new Date().getFullYear()} — Made with care.</p>
        <p>
          <Link
            to="/admin-planner?key=let-me-in-2026"
            className="text-[10px] uppercase tracking-[0.2em] text-primary/40 hover:text-primary underline-offset-4 hover:underline"
          >
            Admin login
          </Link>
        </p>
      </footer>
    </div>
  );
}

function chipClass(active: boolean) {
  return cn(
    "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "border border-primary/20 text-primary hover:bg-primary/5"
  );
}
