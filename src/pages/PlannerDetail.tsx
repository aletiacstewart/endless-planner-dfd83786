import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { getPlanner } from "@/data/planners";
import { getPageType } from "@/lib/pageTypes";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { CoverCard } from "@/components/cover/CoverCard";
import { CartSummary } from "@/components/cover/CartSummary";
import { COLLECTIONS, COVERS, type CoverCollection, getCover } from "@/data/covers";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PlannerDetail() {
  const { plannerId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const highlightCover = searchParams.get("cover") ?? "";
  const planner = getPlanner(plannerId);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openCheckout, checkoutElement, closeCheckout, isOpen } = useStripeCheckout();
  const [email, setEmail] = useState(user?.email ?? "");
  const [includedCoverId, setIncludedCoverId] = useState<string>("");
  const [extraPackIds, setExtraPackIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<CoverCollection | "all">("all");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accountError, setAccountError] = useState("");
  const [creating, setCreating] = useState(false);
  const [coverTitle, setCoverTitle] = useState("");
  const [ownerName, setOwnerName] = useState("");

  // Arriving from a cover card scrolls to and highlights that cover, but never
  // selects it — the user must explicitly choose the included cover.
  useEffect(() => {
    if (!highlightCover) return;
    const el = document.getElementById(`cover-${highlightCover}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightCover]);

  // Returning from sign-in: restore the saved selection, then open checkout.
  const wantsCheckout = searchParams.get("checkout") === "1";
  const [resumed, setResumed] = useState(false);
  useEffect(() => {
    if (!wantsCheckout || !user?.id || resumed || !planner) return;
    try {
      const saved = JSON.parse(sessionStorage.getItem("pendingCheckout") || "null");
      if (saved?.plannerId === planner.id) {
        setIncludedCoverId(saved.includedCoverId || "");
        setExtraPackIds(saved.extraPackIds || []);
      }
    } catch {}
    setResumed(true);
  }, [wantsCheckout, user?.id, resumed, planner]);
  useEffect(() => {
    if (resumed && wantsCheckout && user?.id && includedCoverId && !isOpen) {
      buy();
      navigate(`/planner/${plannerId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumed]);


  const availableCollections = useMemo(() => {
    const used = new Set(COVERS.map((c) => c.collection));
    return COLLECTIONS.filter((c) => used.has(c.id));
  }, []);

  const visibleCovers = useMemo(
    () => (filter === "all" ? COVERS : COVERS.filter((c) => c.collection === filter)),
    [filter]
  );

  if (!planner) return <Navigate to="/" replace />;

  const pages = planner.pageTypeIds
    .map((id) => getPageType(id))
    .filter((p): p is NonNullable<ReturnType<typeof getPageType>> => Boolean(p));

  const cartCount = (includedCoverId ? 1 : 0) + extraPackIds.length;
  const includedCover = getCover(includedCoverId);

  const addExtra = (id: string) => {
    if (id === includedCoverId) return;
    setExtraPackIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  const removeExtra = (id: string) =>
    setExtraPackIds((prev) => prev.filter((x) => x !== id));
  const makeIncluded = (id: string) => {
    setExtraPackIds((prev) => prev.filter((x) => x !== id));
    setIncludedCoverId(id);
  };

  const signInInstead = () => {
    sessionStorage.setItem(
      "pendingCheckout",
      JSON.stringify({ plannerId: planner.id, includedCoverId, extraPackIds })
    );
    navigate(`/auth?mode=signin&next=${encodeURIComponent(`/planner/${planner.id}?checkout=1`)}`);
  };

  const startCheckout = (userId: string, customerEmail: string) => {
    sessionStorage.removeItem("pendingCheckout");
    if (coverTitle.trim() || ownerName.trim()) {
      const text = { plannerName: coverTitle.trim().slice(0, 60), ownerName: ownerName.trim().slice(0, 60) };
      sessionStorage.setItem("pendingCoverText", JSON.stringify(text));
      import("@/lib/settings").then((m) => m.saveSettings(text)).catch(() => {});
    }
    // Membership + any extra covers are paid together in one checkout.
    openCheckout({
      priceId: planner.priceId,
      quantity: 1,
      customerEmail,
      userId,
      returnUrl: `${window.location.origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&sub=1&planner=${planner.id}`,
      plannerId: planner.id,
      selectedCoverId: includedCoverId,
      packIds: extraPackIds,
    });
  };

  const buy = async () => {
    if (user?.id) {
      startCheckout(user.id, email || user.email || "");
      return;
    }
    // Not signed in: create the account right here, then go to payment.
    setAccountError("");
    setCreating(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth?next=/app`,
        data: { planner_name: coverTitle.trim().slice(0, 60), owner_name: ownerName.trim().slice(0, 60) },
      },
    });
    setCreating(false);
    if (error) {
      setAccountError(error.message);
      return;
    }
    if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
      setAccountError("This email already has an account — sign in instead.");
      return;
    }
    startCheckout(data.user.id, email.trim());
  };


  const scrollToCart = () => {
    document
      .getElementById("cart-summary")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-primary/10">
        <Link to="/" className="font-storefront text-xl md:text-2xl text-primary">
          Endless Planner
        </Link>
        <Link
          to="/"
          className="text-[11px] uppercase tracking-[0.2em] text-primary/70 hover:text-primary font-semibold inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All planners
        </Link>
      </header>

      {/* Editorial storefront header */}
      <section className="px-6 md:px-12 py-12 md:py-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 mb-3">
              {planner.name}
            </p>
            <h1 className="font-storefront text-4xl md:text-6xl text-primary leading-[1.05] mb-5">
              Curate your <i className="font-normal">digital</i> ritual.
            </h1>
            <p className="text-primary/70 text-base md:text-lg leading-relaxed max-w-lg font-light">
              {planner.tagline}. Every cover ships with 20 matching page icons and a 60-piece themed
              sticker set — pick one to include with your membership, add more for $5 each — 10% off 2–5, 20% off 6 or more.
            </p>
          </div>

          {/* Selection pill */}
          <button
            onClick={scrollToCart}
            className="bg-card border border-primary/10 p-3 rounded-full shadow-sm flex items-center gap-3 pr-2 ring-8 ring-primary/5 hover:ring-primary/10 transition-shadow text-left"
          >
            <span className="pl-4 text-[10px] font-bold text-primary/60 uppercase tracking-[0.25em]">
              My selection
            </span>
            <div className="flex -space-x-2">
              {includedCover && (
                <div className="w-10 h-10 rounded-full border-2 border-card bg-secondary overflow-hidden">
                  <img
                    src={includedCover.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {extraPackIds.slice(0, 2).map((id) => {
                const c = getCover(id);
                return c ? (
                  <div
                    key={id}
                    className="w-10 h-10 rounded-full border-2 border-card bg-secondary overflow-hidden"
                  >
                    <img src={c.image} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : null;
              })}
              {!includedCover && extraPackIds.length === 0 && (
                <div className="w-10 h-10 rounded-full border-2 border-card bg-secondary flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-primary/50" />
                </div>
              )}
              {cartCount > 3 && (
                <div className="w-10 h-10 rounded-full border-2 border-card bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  +{cartCount - 3}
                </div>
              )}
            </div>
            <span className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
              ${planner.priceUSD.toFixed(2)}/mo · Checkout
            </span>
          </button>
        </div>
      </section>

      {/* Category chips + product grid */}
      <section className="px-6 md:px-12 pb-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-[1fr_340px] gap-10 items-start">
          <div>
            <div className="flex flex-wrap gap-2 mb-10 border-b border-primary/10 pb-6">
              <button
                onClick={() => setFilter("all")}
                className={chipClass(filter === "all")}
              >
                All {COVERS.length} Covers
              </button>
              {availableCollections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setFilter(c.id)}
                  className={chipClass(filter === c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-10">
              {visibleCovers.map((c) => (
                <div
                  key={c.id}
                  id={`cover-${c.id}`}
                  className={cn(
                    "rounded-2xl transition-shadow",
                    highlightCover === c.id && c.id !== includedCoverId &&
                      "ring-2 ring-primary/60 ring-offset-4 ring-offset-background"
                  )}
                >
                  <CoverCard
                    cover={c}
                    isIncluded={c.id === includedCoverId}
                    isExtra={extraPackIds.includes(c.id)}
                    onAddExtra={() => addExtra(c.id)}
                    onRemoveExtra={() => removeExtra(c.id)}
                    onMakeIncluded={() => makeIncluded(c.id)}
                  />
                </div>
              ))}

            </div>
          </div>

          {/* Cart */}
          <div id="cart-summary">
            <CartSummary
              activationLabel={`${planner.name} activation`}
              activationPriceUSD={planner.priceUSD}
              includedCoverId={includedCoverId}
              extraPackIds={extraPackIds}
              email={email}
              onEmailChange={setEmail}
              onCheckout={buy}
              needsAccount={!user}
              password={password}
              confirm={confirm}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirm}
              accountError={accountError}
              onSignInInstead={signInInstead}
              busy={creating}
              coverTitle={coverTitle}
              ownerName={ownerName}
              onCoverTitleChange={setCoverTitle}
              onOwnerNameChange={setOwnerName}
              disabled={!planner.available || !includedCoverId}
            />
          </div>
        </div>
      </section>

      {/* Mobile sticky bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 bg-card border-t border-primary/10 p-3 flex items-center justify-between gap-3 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Total</div>
          <div className="font-storefront text-lg text-primary">${planner.priceUSD.toFixed(2)}/mo</div>
        </div>
        <button
          onClick={scrollToCart}
          className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-bold flex-1 text-center"
        >
          Review & checkout
        </button>
      </div>

      {/* What's inside */}
      <section className="px-6 md:px-12 py-20 bg-secondary/40 mb-24 md:mb-0">
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 mb-3 text-center">
            The interior
          </p>
          <h2 className="font-storefront text-4xl md:text-5xl text-primary text-center mb-3">
            What's inside
          </h2>
          <p className="text-center text-primary/60 mb-12 font-light">
            {pages.length} guided pages in the {planner.name}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pages.map((p) => (
              <div key={p.id} className="bg-card border border-primary/10 rounded-sm p-5">
                <h3 className="font-storefront text-lg text-primary mb-1">{p.name}</h3>
                <p className="text-xs text-primary/60 leading-relaxed line-clamp-3 font-light">
                  {p.description}
                </p>
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

      <footer className="px-6 md:px-12 py-12 border-t border-primary/10 text-center text-sm text-primary/60 bg-secondary/30">
        <p className="font-storefront text-lg text-primary mb-1">Endless Planner</p>
        <p>© {new Date().getFullYear()} — Made with care.</p>
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
