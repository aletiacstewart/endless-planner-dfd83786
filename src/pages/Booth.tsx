import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addToCart, cartTotalCents, formatCents, parseDollars, type CartLine } from "@/lib/booth";

interface Item { id: string; sku: string; title: string; price_cents: number; stock_qty: number }
interface Sale { id: string; total_cents: number; payment_method: string; created_at: string; items: { title: string; qty: number }[] }

export default function Booth() {
  const { orgs, signedIn, activeId, setActiveId } = useMyOrgs();
  const [items, setItems] = useState<Item[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [pay, setPay] = useState<"card" | "cash" | "other">("card");
  const [form, setForm] = useState({ title: "", sku: "", price: "", stock: "" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!activeId) return;
    const [{ data: i }, { data: s }] = await Promise.all([
      supabase.from("booth_items").select("id,sku,title,price_cents,stock_qty").eq("org_id", activeId).order("title"),
      supabase.from("booth_sales").select("id,total_cents,payment_method,created_at,items").eq("org_id", activeId).order("created_at", { ascending: false }).limit(50),
    ]);
    setItems(i ?? []);
    setSales((s ?? []) as unknown as Sale[]);
  }, [activeId]);
  useEffect(() => { setCart([]); load(); }, [load]);

  const addProduct = async () => {
    const price = parseDollars(form.price);
    const stock = parseInt(form.stock || "0", 10);
    if (!form.title.trim() || !form.sku.trim() || price === null || !(stock >= 0)) return toast.error("Fill in name, code, price and stock.");
    const { error } = await supabase.from("booth_items").insert({ org_id: activeId!, title: form.title.trim(), sku: form.sku.trim(), price_cents: price, stock_qty: stock });
    if (error) return toast.error(error.code === "23505" ? "That product code is already used." : "Couldn't add the product.");
    setForm({ title: "", sku: "", price: "", stock: "" });
    toast.success("Product added");
    load();
  };

  const updateStock = async (it: Item, delta: number) => {
    const next = Math.max(0, it.stock_qty + delta);
    await supabase.from("booth_items").update({ stock_qty: next }).eq("id", it.id);
    load();
  };

  const removeProduct = async (it: Item) => {
    if (!confirm(`Delete ${it.title}?`)) return;
    const { error } = await supabase.from("booth_items").delete().eq("id", it.id);
    if (error) return toast.error("Only owners and admins can delete products.");
    load();
  };

  const checkout = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("record_booth_sale", {
      _org_id: activeId!, _payment_method: pay,
      _items: cart.map((l) => ({ item_id: l.item_id, qty: l.qty })),
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("stock") ? error.message : "Couldn't record the sale.");
    toast.success(`Sale recorded — ${formatCents(cartTotalCents(cart))}`);
    setCart([]);
    load();
  };

  const shell = (body: React.ReactNode) => (
    <div className="theme-brandedby min-h-screen bg-muted text-foreground">
      <BrandedByHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Booth</p>
            <h1 className="mt-2 text-4xl">Event & pop-up checkout</h1>
          </div>
          {orgs.length > 1 && (
            <Select value={activeId ?? undefined} onValueChange={setActiveId}>
              <SelectTrigger className="h-11 w-64 bg-card"><SelectValue /></SelectTrigger>
              <SelectContent>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        {body}
      </main>
      <BrandedByFooter />
    </div>
  );

  if (signedIn === null) return shell(null);
  if (!signedIn || !activeId) {
    return shell(
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <Store className="mx-auto h-10 w-10 text-primary" />
        <p className="mt-4 text-muted-foreground">{!signedIn ? "Sign in to use Booth." : "Create your business on the Hub first."}</p>
        <Button asChild className="mt-6"><Link to={!signedIn ? "/auth" : "/hub"}>{!signedIn ? "Sign in" : "Go to Hub"}</Link></Button>
      </div>,
    );
  }

  const total = cartTotalCents(cart);
  return shell(
    <Tabs defaultValue="checkout">
      <TabsList className="mb-6 h-11 bg-card">
        <TabsTrigger value="checkout" className="h-9">Checkout</TabsTrigger>
        <TabsTrigger value="products" className="h-9">Products</TabsTrigger>
        <TabsTrigger value="sales" className="h-9">Sales</TabsTrigger>
      </TabsList>

      <TabsContent value="checkout">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-3">
            {items.length === 0 && <p className="text-muted-foreground">Add products in the Products tab to start selling.</p>}
            {items.map((it) => {
              const inCart = cart.find((l) => l.item_id === it.id)?.qty ?? 0;
              const out = it.stock_qty - inCart <= 0;
              return (
                <button key={it.id} disabled={out} onClick={() => setCart((c) => addToCart(c, { item_id: it.id, title: it.title, price_cents: it.price_cents, stock_qty: it.stock_qty }))}
                  className="min-h-32 rounded-xl border border-border bg-card p-5 text-left transition hover:border-primary disabled:opacity-50">
                  <p className="font-semibold">{it.title}</p>
                  <p className="mt-1 text-lg font-semibold text-primary">{formatCents(it.price_cents)}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{out ? "Sold out" : `${it.stock_qty - inCart} left`}</p>
                </button>
              );
            })}
          </div>
          <aside className="h-fit rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Current sale</p>
            {cart.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Tap a product to add it.</p> : (
              <ul className="mt-4 space-y-3">
                {cart.map((l) => (
                  <li key={l.item_id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex-1">{l.title}</span>
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setCart((c) => c.flatMap((x) => x.item_id !== l.item_id ? [x] : x.qty > 1 ? [{ ...x, qty: x.qty - 1 }] : []))}><Minus className="h-4 w-4" /></Button>
                    <span className="w-6 text-center">{l.qty}</span>
                    <span className="w-20 text-right">{formatCents(l.price_cents * l.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-lg font-semibold">
              <span>Total</span><span>{formatCents(total)}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {(["card", "cash", "other"] as const).map((m) => (
                <Button key={m} variant={pay === m ? "default" : "outline"} className="h-11 capitalize" onClick={() => setPay(m)}>{m}</Button>
              ))}
            </div>
            <Button variant="secondary" className="mt-4 h-12 w-full uppercase tracking-[0.15em]" disabled={!cart.length || busy} onClick={checkout}>
              Complete sale
            </Button>
          </aside>
        </div>
      </TabsContent>

      <TabsContent value="products">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid gap-3 md:grid-cols-5">
            <Input className="h-11 md:col-span-2" placeholder="Product name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
            <Input className="h-11" placeholder="Code (SKU)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} maxLength={40} />
            <Input className="h-11" placeholder="Price $" inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input className="h-11" placeholder="Stock" inputMode="numeric" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <Button className="mt-3 h-11" onClick={addProduct}><Plus className="mr-1 h-4 w-4" /> Add product</Button>
          <ul className="mt-6 divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-40 flex-1">
                  <p className="font-medium">{it.title}</p>
                  <p className="text-xs text-muted-foreground">{it.sku} · {formatCents(it.price_cents)}</p>
                </div>
                <Button size="icon" variant="outline" className="h-11 w-11" onClick={() => updateStock(it, -1)}><Minus className="h-4 w-4" /></Button>
                <span className="w-14 text-center text-sm">{it.stock_qty} in stock</span>
                <Button size="icon" variant="outline" className="h-11 w-11" onClick={() => updateStock(it, 1)}><Plus className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" className="h-11 w-11" onClick={() => removeProduct(it)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="sales">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total of last {sales.length} sales: <span className="font-semibold text-foreground">{formatCents(sales.reduce((s, x) => s + x.total_cents, 0))}</span></p>
          <ul className="mt-4 divide-y divide-border">
            {sales.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                <span className="text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                <span className="flex-1 px-4">{s.items.map((i) => `${i.qty}× ${i.title}`).join(", ")}</span>
                <span className="capitalize text-muted-foreground">{s.payment_method}</span>
                <span className="w-24 text-right font-semibold">{formatCents(s.total_cents)}</span>
              </li>
            ))}
            {sales.length === 0 && <li className="py-3 text-sm text-muted-foreground">No sales yet.</li>}
          </ul>
        </div>
      </TabsContent>
    </Tabs>,
  );
}
