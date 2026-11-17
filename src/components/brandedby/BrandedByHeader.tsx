import { Link } from "react-router-dom";
import logo from "@/assets/branded-by-logo.png.asset.json";
import { Button } from "@/components/ui/button";

export function BrandedByHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo.url} alt="Branded By" className="h-12 w-12 object-contain" />
          <span className="text-lg font-semibold uppercase tracking-[0.2em] text-primary">Branded By</span>
        </Link>
        <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.18em] md:flex">
          <a href="/#apps" className="text-foreground hover:text-secondary">Apps</a>
          <a href="/#process" className="text-foreground hover:text-secondary">Process</a>
          <Link to="/shop" className="text-foreground hover:text-secondary">Planners</Link>
          <Link to="/hub" className="text-foreground hover:text-secondary">Hub</Link>
        </nav>
        <Button asChild variant="secondary" className="uppercase tracking-[0.15em]">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    </header>
  );
}

export function BrandedByFooter() {
  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <p className="text-sm uppercase tracking-[0.2em]">Branded By · brandedby.com</p>
        <p className="text-sm opacity-80">Serving all of Texas — and brands everywhere.</p>
        <p className="text-xs opacity-70">© {new Date().getFullYear()} Branded By</p>
      </div>
    </footer>
  );
}
