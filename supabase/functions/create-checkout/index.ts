import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const IdSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/);
const CheckoutBodySchema = z.object({
  priceId: IdSchema.optional(),
  quantity: z.number().int().min(1).max(1).optional(),
  customerEmail: z.string().email().optional(),
  returnUrl: z.string().url(),
  environment: z.enum(["sandbox", "live"]),
  plannerId: IdSchema.optional(),
  packIds: z.array(IdSchema).max(100).optional(),
  selectedCoverId: IdSchema.optional(),
  userId: IdSchema.optional(),
});

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
// Scoped with applies_to so it only ever discounts the cover-pack product —
// a membership + covers session must keep the subscription at full price.
async function resolveCoupon(
  stripe: ReturnType<typeof createStripeClient>,
  percentOff: number,
  productId: string,
): Promise<string> {
  const id = `cover_packs_${percentOff}_off_covers_only`;
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
    applies_to: { products: [productId] },
  });
  return created.id;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }
  try {
    const parsed = CheckoutBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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
    } = parsed.data;

    const includesPlanner = Boolean(priceId);
    const packs = packIds ?? [];

    if (!includesPlanner && packs.length === 0) {
      throw new Error("Cart is empty");
    }

    const stripe = createStripeClient(environment as StripeEnv);
    const line_items: any[] = [];

    const lookupKeys: string[] = [];
    const ACTIVATION = "curated_planner_activation_onetime";
    const CLOUD_MONTHLY = "curated_planner_cloud_monthly";
    const isActivation = priceId === ACTIVATION;
    if (includesPlanner) lookupKeys.push(priceId);
    if (isActivation) lookupKeys.push(CLOUD_MONTHLY);
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
      // Activation ($21.97 today) always starts the $10/month cloud plan with
      // a 30-day free first period, so renewals begin a month later.
      if (isActivation) {
        const cloud = priceByKey.get(CLOUD_MONTHLY);
        if (!cloud) throw new Error(`Price not found (${CLOUD_MONTHLY})`);
        line_items.push({ price: cloud.id, quantity: 1 });
        isRecurring = true;
      }
    }

    // Subscriptions must be tied to a user account.
    if (isRecurring && (!userId || typeof userId !== "string")) {
      throw new Error("Sign in required to subscribe");
    }

    let discounts: any[] | undefined = undefined;

    // Extra covers ride along in the same session as one-time line items.
    // In subscription mode Stripe bills them on the first invoice only, so the
    // first charge is membership + covers and renewals stay membership-only.
    if (packs.length > 0) {
      const flat = priceByKey.get("cover_pack_flat");
      if (!flat) throw new Error("Cover pack price not found (cover_pack_flat)");
      line_items.push({ price: flat.id, quantity: packs.length });

      const percentOff = packDiscountPercent(packs.length);
      if (percentOff > 0) {
        const productId = typeof flat.product === "string" ? flat.product : flat.product?.id;
        if (productId) {
          discounts = [{ coupon: await resolveCoupon(stripe, percentOff, productId) }];
        }
      }
    }

    // Resolve or create a Stripe Customer so userId lives on a searchable object.
    const customerId = (customerEmail || userId)
      ? await resolveOrCreateCustomer(stripe, { email: customerEmail, userId })
      : undefined;

    const chosenCoverId = typeof selectedCoverId === "string" ? selectedCoverId : "";

    // A membership checkout grants the planner, the chosen cover, and any extra
    // covers paid for in the same session.
    const grantedPackIds = isActivation
      ? Array.from(new Set([...(chosenCoverId ? [chosenCoverId] : []), ...packs]))
      : packs;


    const metadata = {
      planner_id: (isActivation || (includesPlanner && !isRecurring)) ? (plannerId || "wellness-journey") : "",
      // Only the activation (or a legacy one-time planner price) grants the planner.
      includes_planner: (isActivation || (includesPlanner && !isRecurring)) ? "true" : "false",
      pack_ids: grantedPackIds.join(","),
      selected_cover_id: chosenCoverId,
      subscription_price_id: isRecurring ? (isActivation ? CLOUD_MONTHLY : priceId) : "",
      userId: typeof userId === "string" ? userId : "",
    };

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: isRecurring ? "subscription" : "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      managed_payments: { enabled: true },
      ...(customerId ? { customer: customerId } : (customerEmail && { customer_email: customerEmail })),
      ...(discounts && { discounts }),
      metadata,
      ...(!isRecurring && {
        payment_intent_data: { description: packs.length > 0 ? "Curated Planner cover packs" : "Curated Planner" },
      }),
      ...(isRecurring && {
        subscription_data: { metadata, ...(isActivation && { trial_period_days: 30 }) },
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
