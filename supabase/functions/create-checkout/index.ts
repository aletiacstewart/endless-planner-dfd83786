const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const FIRST_PACK_CENTS = 499;
const ADDITIONAL_PACK_CENTS = 299;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const {
      priceId, // optional now (omitted when buying packs only)
      quantity,
      customerEmail,
      returnUrl,
      environment,
      plannerId,
      packIds, // string[] of cover ids
    } = body;

    if (!returnUrl) throw new Error("returnUrl required");
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    const includesPlanner = Boolean(priceId);
    if (includesPlanner && !/^[a-zA-Z0-9_-]+$/.test(priceId)) throw new Error("Invalid priceId");

    const packs: string[] = Array.isArray(packIds)
      ? packIds.filter((p) => typeof p === "string" && /^[a-zA-Z0-9_-]+$/.test(p))
      : [];

    if (!includesPlanner && packs.length === 0) {
      throw new Error("Cart is empty");
    }

    const stripe = createStripeClient(environment as StripeEnv);
    const line_items: any[] = [];

    if (includesPlanner) {
      const prices = await stripe.prices.list({ lookup_keys: [priceId] });
      if (!prices.data.length) throw new Error("Price not found");
      line_items.push({ price: prices.data[0].id, quantity: quantity || 1 });
    }

    packs.forEach((coverId, i) => {
      const cents = i === 0 ? FIRST_PACK_CENTS : ADDITIONAL_PACK_CENTS;
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Cover & Icon Pack — ${coverId}`,
          },
          unit_amount: cents,
        },
        quantity: 1,
      });
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      metadata: {
        planner_id: includesPlanner ? (plannerId || "wellness-journey") : "",
        includes_planner: includesPlanner ? "true" : "false",
        pack_ids: packs.join(","),
      },
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
