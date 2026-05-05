// Stripe webhook handler — fulfills purchases server-side so users always
// get their unlock code even if they close the tab on /thank-you.
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
  const plannerId = session.metadata?.planner_id || "wellness-journey";
  if (!email) {
    console.warn("No email on session", sessionId);
    return;
  }

  const supa = getSupabase();
  const { data: existing } = await supa
    .from("purchases")
    .select("unlock_code")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  let unlock_code = (existing as any)?.unlock_code as string | undefined;
  if (!unlock_code) {
    unlock_code = makeCode();
    const { error } = await supa.from("purchases").insert({
      planner_id: plannerId,
      email,
      unlock_code,
      stripe_session_id: sessionId,
      environment: env,
    });
    if (error) {
      console.error("Insert purchase failed", error);
      return;
    }
  }

  const installLink = `${origin}/unlock?code=${unlock_code}`;
  try {
    await supa.functions.invoke("send-transactional-email", {
      body: {
        templateName: "planner-purchase",
        recipientEmail: email,
        idempotencyKey: `planner-purchase-${sessionId}`,
        templateData: { plannerId, installLink, unlockCode: unlock_code },
      },
    });
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
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      await fulfill(event.data.object, env, origin);
    } else {
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
