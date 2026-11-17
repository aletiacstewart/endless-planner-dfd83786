// Keeps each business's Stripe Connect status current when Stripe reports
// account changes (onboarding finished, payouts disabled, etc.).
import { createClient } from "npm:@supabase/supabase-js@2";
import { verifyWebhook, type StripeEnv } from "../_shared/stripe.ts";

function getSupabase() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;
  try {
    const event = await verifyWebhook(req, env);
    if (event.type === "account.updated") {
      const account = event.data.object;
      const active = Boolean(account.charges_enabled && account.payouts_enabled);
      await getSupabase()
        .from("organizations")
        .update({
          stripe_charges_enabled: Boolean(account.charges_enabled),
          stripe_payouts_enabled: Boolean(account.payouts_enabled),
          stripe_details_submitted: Boolean(account.details_submitted),
          ...(active ? { stripe_connected_at: new Date().toISOString() } : {}),
        })
        .eq("stripe_account_id", account.id);
    } else {
      console.log("Unhandled event:", event.type);
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response("Webhook error", { status: 400 });
  }
});
