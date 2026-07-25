const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const {
      priceId, // one-time activation fee lookup_key (e.g. wellness_journey_setup)
      quantity,
      customerEmail,
      returnUrl,
      environment,
      plannerId,
      packIds,
      selectedCoverId,
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

    const lookupKeys: string[] = [];
    if (includesPlanner) lookupKeys.push(priceId);
    if (packs.length > 0) lookupKeys.push("cover_pack_flat");

    const priceList = lookupKeys.length
      ? await stripe.prices.list({ lookup_keys: lookupKeys, expand: ["data.product"] })
      : { data: [] as any[] };
    const priceByKey = new Map<string, any>();
    for (const p of priceList.data) if (p.lookup_key) priceByKey.set(p.lookup_key, p);

    let isRecurring = false;
    if (includesPlanner) {
      const setup = priceByKey.get(priceId);
      if (!setup) throw new Error(`Price not found (${priceId})`);
      isRecurring = setup.type === "recurring";
      line_items.push({ price: setup.id, quantity: quantity || 1 });
    }

    if (!isRecurring && packs.length > 0) {
      const flat = priceByKey.get("cover_pack_flat");
      if (!flat) throw new Error("Cover pack price not found (cover_pack_flat)");
      line_items.push({ price: flat.id, quantity: packs.length });
    }

    let discounts: any[] | undefined;
    if (!isRecurring && packs.length >= 5) {
      const coupon = await stripe.coupons.create({
        percent_off: 10,
        duration: "once",
        name: "10% off cover packs",
        max_redemptions: 1,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const metadata = {
      planner_id: includesPlanner && !isRecurring ? (plannerId || "wellness-journey") : "",
      includes_planner: includesPlanner && !isRecurring ? "true" : "false",
      pack_ids: packs.join(","),
      selected_cover_id: typeof selectedCoverId === "string" ? selectedCoverId : "",
      subscription_price_id: isRecurring ? priceId : "",
    };

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      ...(discounts && { discounts }),
      metadata,
      ...(isRecurring && { subscription_data: { metadata } }),
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
