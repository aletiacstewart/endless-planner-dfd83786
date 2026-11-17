import { Link } from "react-router-dom";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { BRANDED_BY_APPS, BRAND_PROCESS } from "@/data/brandedByApps";

export default function Hub() {
  const apps = BRANDED_BY_APPS.filter((a) => a.id !== "hub");
  return (
    <div className="theme-brandedby min-h-screen bg-muted text-foreground">
      <BrandedByHeader />
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Hub</p>
            <h1 className="mt-2 text-4xl">Your command center</h1>
          </div>
          <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground">Founding 100</span>
        </div>

        <section className="mt-10 rounded-xl border border-border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Launch progress</p>
          <ol className="mt-4 grid gap-3 md:grid-cols-4">
            {BRAND_PROCESS.map((p, i) => (
              <li key={p.step} className={`rounded-lg p-4 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                <p className="text-xs font-semibold opacity-80">Step {i + 1}</p>
                <p className="font-semibold uppercase tracking-[0.15em]">{p.step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((a) => {
            const live = a.status === "live";
            const body = (
              <>
                <a.icon className="h-8 w-8 text-primary" />
                <h2 className="mt-4 text-lg uppercase text-accent">{a.name}</h2>
                <p className="text-sm text-muted-foreground">{a.tagline}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-secondary">{live ? "Open →" : "Coming soon"}</p>
              </>
            );
            return live ? (
              <Link key={a.id} to={a.href} className="rounded-xl border border-border bg-card p-6 transition hover:border-primary hover:shadow-[var(--shadow-soft)]">{body}</Link>
            ) : (
              <div key={a.id} className="rounded-xl border border-dashed border-border bg-card/70 p-6">{body}</div>
            );
          })}
        </section>
      </main>
      <BrandedByFooter />
    </div>
  );
}
