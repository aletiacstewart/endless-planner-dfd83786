import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { BRANDED_BY_APPS, BRAND_PROCESS } from "@/data/brandedByApps";

export default function BrandedByHome() {
  return (
    <div className="theme-brandedby min-h-screen bg-background text-foreground">
      <BrandedByHeader />

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branding for the digital age</p>
          <h1 className="text-5xl leading-tight text-foreground md:text-6xl">
            Your brand, <span className="font-semibold text-primary">from monologue</span> to dialogue.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            Branded By brings your website, products, campaigns and client care together — one platform built for a new generation of customers.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg" className="uppercase tracking-[0.15em]">
              <a href="#apps">Explore the apps <ArrowRight className="ml-2 h-4 w-4" /></a>
            </Button>
            <Button asChild size="lg" variant="secondary" className="uppercase tracking-[0.15em]">
              <Link to="/shop">Shop planners</Link>
            </Button>
          </div>
        </div>
        <div className="relative hidden md:block">
          <div className="absolute inset-0 rounded-2xl" style={{ background: "var(--gradient-brand)" }} />
          <div className="relative grid h-full grid-cols-2 gap-4 p-8">
            {BRANDED_BY_APPS.slice(0, 4).map((a) => (
              <div key={a.id} className="flex flex-col justify-end rounded-xl bg-background/90 p-5 shadow-[var(--shadow-card)]">
                <a.icon className="mb-3 h-7 w-7 text-primary" />
                <p className="font-semibold uppercase tracking-[0.15em]">{a.name}</p>
                <p className="text-sm text-muted-foreground">{a.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apps" className="bg-muted py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Our apps</p>
          <h2 className="mt-3 text-4xl text-accent">Everything your brand needs.</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BRANDED_BY_APPS.map((a) => (
              <Link key={a.id} to={a.href} className="group flex flex-col rounded-xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-soft)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft">
                  <a.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg uppercase text-accent">{a.name}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${a.status === "live" ? "bg-secondary text-secondary-foreground" : "bg-accent-soft text-accent"}`}>
                    {a.status === "live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-primary">{a.tagline}</p>
                <p className="mt-3 text-sm text-muted-foreground">{a.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">We know branding</p>
        <h2 className="mt-3 text-4xl text-accent">Discover. Design. Develop. Deploy.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {BRAND_PROCESS.map((p, i) => (
            <div key={p.step} className="border-t-4 border-primary pt-5">
              <p className="text-sm font-semibold text-secondary">0{i + 1}</p>
              <h3 className="mt-2 text-xl uppercase text-foreground">{p.step}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-2xl p-12 text-primary-foreground md:flex-row md:items-center md:justify-between" style={{ background: "var(--gradient-brand)" }}>
          <div>
            <h2 className="text-3xl">Ready to get Branded By?</h2>
            <p className="mt-2 opacity-90">Start with a planner today — the full platform is on its way.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="uppercase tracking-[0.15em]">
            <Link to="/shop">Shop planners</Link>
          </Button>
        </div>
      </section>

      <BrandedByFooter />
    </div>
  );
}
