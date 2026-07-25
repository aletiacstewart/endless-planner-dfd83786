// Stripe webhook handler — fulfills planner + cover-pack purchases.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

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
  }

  // Email — planner template if planner included, else pack-only template
  try {
    if (includesPlanner) {
      const installLink = `${origin}/unlock?code=${planner_unlock_code}`;
      await supa.functions.invoke("send-transactional-email", {
        body: {
          templateName: "planner-purchase",
          recipientEmail: email,
          idempotencyKey: `planner-purchase-${sessionId}`,
          templateData: {
            plannerId,
            installLink,
            unlockCode: planner_unlock_code,
            packCodes: pack_codes,
            origin,
            amountTotal: session.amount_total,
            currency: session.currency,
            purchaseDate: new Date().toISOString(),
            receiptId: sessionId,
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
