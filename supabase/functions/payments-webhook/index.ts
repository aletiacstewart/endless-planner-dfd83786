// Stripe webhook handler — fulfills planner + cover-pack purchases, tracks subscriptions.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook, createStripeClient } from "../_shared/stripe.ts";

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
  }
  return _supabase;
}

function makeCode(): string {
  const a = crypto.randomUUID().replace(/-/g, "");
  return `${a.slice(0, 4)}-${a.slice(4, 8)}-${a.slice(8, 16)}`.toUpperCase();
}

async function fulfill(session: any, env: StripeEnv, origin: string) {
  if (session.payment_status !== "paid") return;
  const sessionId = session.id;
  const email = session.customer_details?.email || session.customer_email;
  const meta = session.metadata || {};
  const userId: string | null = meta.userId && typeof meta.userId === "string" && meta.userId.length > 0 ? meta.userId : null;
  const includesPlanner = meta.includes_planner === "true" || (!meta.includes_planner && meta.planner_id);
  const plannerId = meta.planner_id || "wellness-journey";
  const packIds: string[] = (meta.pack_ids || "")
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);

  if (!email) {
    console.warn("No email on session", sessionId);
    return;
  }

  const supa = getSupabase();
  let planner_unlock_code: string | undefined;
  const pack_codes: { packId: string; code: string }[] = [];

  // Planner fulfillment
  if (includesPlanner) {
    const { data: existing } = await supa
      .from("purchases")
      .select("unlock_code")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    planner_unlock_code = (existing as any)?.unlock_code;
    if (!planner_unlock_code) {
      planner_unlock_code = makeCode();
      const { error } = await supa.from("purchases").insert({
        planner_id: plannerId,
        email,
        unlock_code: planner_unlock_code,
        stripe_session_id: sessionId,
        environment: env,
      });
      if (error) console.error("Insert purchase failed", error);
    }
    // Link to signed-in user if we know them
    if (userId && planner_unlock_code) {
      await supa.from("user_planner_unlocks").upsert(
        { user_id: userId, planner_id: plannerId, unlock_code: planner_unlock_code },
        { onConflict: "user_id,planner_id" },
      );
    }
  }

  // Pack fulfillment
  for (const packId of packIds) {
    const { data: existing } = await supa
      .from("pack_purchases")
      .select("unlock_code")
      .eq("stripe_session_id", sessionId)
      .eq("pack_id", packId)
      .maybeSingle();
    let code = (existing as any)?.unlock_code as string | undefined;
    if (!code) {
      code = makeCode();
      const { error } = await supa.from("pack_purchases").insert({
        email,
        pack_id: packId,
        unlock_code: code,
        stripe_session_id: sessionId,
        environment: env,
      });
      if (error) {
        console.error("Insert pack_purchase failed", packId, error);
        continue;
      }
    }
    pack_codes.push({ packId, code });
    if (userId && code) {
      await supa.from("user_packs").upsert(
        { user_id: userId, pack_id: packId, unlock_code: code },
        { onConflict: "user_id,pack_id" },
      );
    }
  }

  // Email
  try {
    if (includesPlanner) {
      const installLink = `${origin}/unlock?code=${planner_unlock_code}`;
      await supa.functions.invoke("send-transactional-email", {
        body: {
          templateName: "planner-purchase",
          recipientEmail: email,
          idempotencyKey: `planner-purchase-${sessionId}`,
          templateData: {
            plannerId, installLink, unlockCode: planner_unlock_code,
            packCodes: pack_codes, origin,
            amountTotal: session.amount_total, currency: session.currency,
            purchaseDate: new Date().toISOString(), receiptId: sessionId,
          },
        },
      });
    }
    if (pack_codes.length > 0) {
      await supa.functions.invoke("send-transactional-email", {
        body: {
          templateName: "cover-pack-purchase",
          recipientEmail: email,
          idempotencyKey: `pack-purchase-${sessionId}`,
          templateData: { packCodes: pack_codes, origin },
        },
      });
    }
  } catch (e) {
    console.warn("Email send failed (non-fatal)", e);
  }
}

async function upsertSubscription(sub: any, env: StripeEnv) {
  const item = sub.items?.data?.[0];
  const priceId = item?.price?.lookup_key || item?.price?.id;
  const periodStart = item?.current_period_start ?? sub.current_period_start;
  const periodEnd = item?.current_period_end ?? sub.current_period_end;

  const supa = getSupabase();

  // userId lives on subscription metadata (set at checkout) and/or on the
  // Stripe Customer metadata. Prefer sub metadata, fall back to customer.
  let userId: string | null = null;
  let email: string | null = null;
  const stripeCustomerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const subMetaUserId = sub.metadata?.userId;
  if (subMetaUserId && typeof subMetaUserId === "string") userId = subMetaUserId;

  try {
    if (stripeCustomerId) {
      const stripe = createStripeClient(env);
      const cust: any = await stripe.customers.retrieve(stripeCustomerId);
      email = cust?.email ?? null;
      if (!userId && cust?.metadata?.userId) userId = cust.metadata.userId;
    }
  } catch (e) {
    console.warn("Fetch customer failed", e);
  }

  // Fallback: match by email to an auth user
  if (!userId && email) {
    const { data: found } = await supa
      .from("profiles")
      .select("user_id")
      .ilike("email", email)
      .maybeSingle();
    if ((found as any)?.user_id) userId = (found as any).user_id;
  }

  await supa.from("subscriptions").upsert(
    {
      user_id: userId,
      email,
      stripe_subscription_id: sub.id,
      stripe_customer_id: stripeCustomerId,
      price_id: priceId,
      status: sub.status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end || false,
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_subscription_id" },
  );
}

async function markSubscriptionCanceled(sub: any, env: StripeEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", cancel_at_period_end: false, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", sub.id)
    .eq("environment", env);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);
  const rawEnv = url.searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    const origin = req.headers.get("origin") || `https://${url.host}`;
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfill(event.data.object, env, origin);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscription(event.data.object, env);
        break;
      case "customer.subscription.deleted":
        await markSubscriptionCanceled(event.data.object, env);
        break;
      default:
        console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
