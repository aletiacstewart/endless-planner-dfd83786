// Creates an embedded card checkout for a Booth sale. The money goes to the
// business's own connected Stripe account (destination charge).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";
import { createStripeClient } from "../_shared/stripe.ts";

const Body = z.object({
  orgId: z.string().uuid(),
  items: z.array(z.object({ item_id: z.string().uuid(), qty: z.number().int().min(1).max(999) })).min(1).max(12),
  returnUrl: z.string().url().max(400),
  environment: z.enum(["sandbox", "live"]),
});
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return json({ error: "Please sign in." }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const { orgId, items, returnUrl, environment } = parsed.data;

    const { data: member } = await supabase.rpc("is_org_member", { _org_id: orgId });
    if (!member) return json({ error: "Not allowed." }, 403);
    const { data: org } = await supabase.from("organizations")
      .select("name, stripe_account_id, stripe_charges_enabled").eq("id", orgId).single();
    if (!org?.stripe_account_id || !org.stripe_charges_enabled)
      return json({ error: "Connect Stripe on the Hub before taking card payments." }, 400);

    const ids = items.map((i) => i.item_id);
    const { data: rows } = await supabase.from("booth_items")
      .select("id, title, price_cents, stock_qty").eq("org_id", orgId).in("id", ids);
    const byId = new Map((rows ?? []).map((r) => [r.id, r]));
    const lineItems = [];
    for (const l of items) {
      const r = byId.get(l.item_id);
      if (!r) return json({ error: "A product in the cart no longer exists." }, 400);
      if (r.stock_qty < l.qty) return json({ error: `Not enough stock for ${r.title}` }, 400);
      lineItems.push({
        price_data: { currency: "usd", product_data: { name: r.title }, unit_amount: r.price_cents },
        quantity: l.qty,
      });
    }
    const total = items.reduce((s, l) => s + byId.get(l.item_id)!.price_cents * l.qty, 0);
    if (total < 50) return json({ error: "Card sales must be at least $0.50." }, 400);

    const stripe = createStripeClient(environment);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      line_items: lineItems,
      return_url: returnUrl,
      payment_intent_data: {
        description: `${org.name} — Booth sale`,
        on_behalf_of: org.stripe_account_id,
        transfer_data: { destination: org.stripe_account_id },
      },
      metadata: {
        kind: "booth",
        org_id: orgId,
        seller_id: u.user.id,
        items: items.map((l) => `${l.item_id}:${l.qty}`).join(","),
      },
    });
    return json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error("booth checkout error", e);
    return json({ error: "Couldn't start the card payment." }, 500);
  }
});
