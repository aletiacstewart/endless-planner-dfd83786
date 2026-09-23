const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

// Look up (or create) a Stripe Customer with metadata.userId so subsequent
// reads (portal, dashboards, customers.search) resolve reliably.
async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string | undefined> {
  if (!options.email && !options.userId) return undefined;
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

// Cover packs: $5 each with a cart-wide volume discount.
//   2–5 packs → 10% off, 6 or more → 20% off
function packDiscountPercent(count: number): number {
  if (count >= 6) return 20;
  if (count >= 2) return 10;
  return 0;
}

// Reuse a stable coupon per discount rate so receipts show the saving.
async function resolveCoupon(
  stripe: ReturnType<typeof createStripeClient>,
  percentOff: number,
): Promise<string> {
  const id = `cover_packs_${percentOff}_off`;
  try {
    const existing = await stripe.coupons.retrieve(id);
    if (existing && !(existing as any).deleted) return existing.id;
  } catch {
    // not created yet in this environment
  }
  const created = await stripe.coupons.create({
    id,
    percent_off: percentOff,
    duration: "once",
    name: `${percentOff}% off cover packs`,
  });
  return created.id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const {
      priceId,
      quantity,
      customerEmail,
      returnUrl,
      environment,
      plannerId,
      packIds,
      selectedCoverId,
      userId,
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

    // Subscriptions must be tied to a user account.
    if (isRecurring && (!userId || typeof userId !== "string")) {
      throw new Error("Sign in required to subscribe");
    }

    let discounts: any[] | undefined = undefined;

    if (!isRecurring && packs.length > 0) {
      const flat = priceByKey.get("cover_pack_flat");
      if (!flat) throw new Error("Cover pack price not found (cover_pack_flat)");
      line_items.push({ price: flat.id, quantity: packs.length });

      const percentOff = packDiscountPercent(packs.length);
      if (percentOff > 0) {
        discounts = [{ coupon: await resolveCoupon(stripe, percentOff) }];
      }
    }

    // Resolve or create a Stripe Customer so userId lives on a searchable object.
    const customerId = (customerEmail || userId)
      ? await resolveOrCreateCustomer(stripe, { email: customerEmail, userId })
      : undefined;

    const chosenCoverId = typeof selectedCoverId === "string" ? selectedCoverId : "";

    // A membership checkout grants the planner plus the one cover the buyer picked.
    // Extra covers are always bought as a separate one-time checkout.
    const grantedPackIds = isRecurring
      ? (chosenCoverId ? [chosenCoverId] : [])
      : packs;

    const metadata = {
      planner_id: includesPlanner ? (plannerId || "wellness-journey") : "",
      includes_planner: includesPlanner ? "true" : "false",
      pack_ids: grantedPackIds.join(","),
      selected_cover_id: chosenCoverId,
      subscription_price_id: isRecurring ? priceId : "",
      userId: typeof userId === "string" ? userId : "",
    };

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerId ? { customer: customerId } : (customerEmail && { customer_email: customerEmail })),
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
