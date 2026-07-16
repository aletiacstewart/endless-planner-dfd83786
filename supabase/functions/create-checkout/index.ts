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
      priceId, // one-time setup fee lookup_key (e.g. wellness_journey_setup)
      monthlyPriceId, // recurring $10/mo lookup_key (e.g. wellness_journey_monthly)
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
    if (monthlyPriceId && !/^[a-zA-Z0-9_-]+$/.test(monthlyPriceId)) throw new Error("Invalid monthlyPriceId");

    const packs: string[] = Array.isArray(packIds)
      ? packIds.filter((p) => typeof p === "string" && /^[a-zA-Z0-9_-]+$/.test(p))
      : [];

    if (!includesPlanner && packs.length === 0) {
      throw new Error("Cart is empty");
    }

    const stripe = createStripeClient(environment as StripeEnv);
    const line_items: any[] = [];

    // Look up all needed prices in one batch when possible.
    const lookupKeys: string[] = [];
    if (includesPlanner) lookupKeys.push(priceId);
    if (monthlyPriceId) lookupKeys.push(monthlyPriceId);
    if (packs.length > 0) lookupKeys.push("cover_pack_flat");

    const priceList = lookupKeys.length
      ? await stripe.prices.list({ lookup_keys: lookupKeys, expand: ["data.product"] })
      : { data: [] as any[] };
    const priceByKey = new Map<string, any>();
    for (const p of priceList.data) if (p.lookup_key) priceByKey.set(p.lookup_key, p);

    if (includesPlanner) {
      const setup = priceByKey.get(priceId);
      if (!setup) throw new Error(`Setup price not found (${priceId})`);
      line_items.push({ price: setup.id, quantity: quantity || 1 });
    }

    if (monthlyPriceId) {
      const monthly = priceByKey.get(monthlyPriceId);
      if (!monthly) throw new Error(`Monthly price not found (${monthlyPriceId})`);
      line_items.push({ price: monthly.id, quantity: 1 });
    }

    // Determine how many pack line items to bill (5th pack free rule).
    let billablePackCount = packs.length;
    if (packs.length === 5) billablePackCount = 4;

    if (billablePackCount > 0) {
      const flat = priceByKey.get("cover_pack_flat");
      if (!flat) throw new Error("Cover pack price not found (cover_pack_flat)");
      line_items.push({ price: flat.id, quantity: billablePackCount });
    }

    // Volume discount coupon (created on the fly, one-time-use).
    let discounts: any[] | undefined;
    let percentOff = 0;
    if (packs.length >= 6) percentOff = 25;
    else if (packs.length >= 3) percentOff = 10;

    if (percentOff > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: percentOff,
        duration: "once",
        name: `${percentOff}% off cover packs`,
        max_redemptions: 1,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const isSubscription = Boolean(monthlyPriceId);

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: isSubscription ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      ...(discounts && { discounts }),
      metadata: {
        planner_id: includesPlanner ? (plannerId || "wellness-journey") : "",
        includes_planner: includesPlanner ? "true" : "false",
        pack_ids: packs.join(","),
        selected_cover_id: typeof selectedCoverId === "string" ? selectedCoverId : "",
      },
      ...(isSubscription && {
        subscription_data: {
          metadata: {
            planner_id: plannerId || "wellness-journey",
            selected_cover_id: typeof selectedCoverId === "string" ? selectedCoverId : "",
          },
        },
      }),
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
