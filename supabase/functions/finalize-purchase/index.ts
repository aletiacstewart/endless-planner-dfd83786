const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function makeCode(): string {
  const a = crypto.randomUUID().replace(/-/g, "");
  return `${a.slice(0, 4)}-${a.slice(4, 8)}-${a.slice(8, 16)}`.toUpperCase();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { session_id, planner_id } = await req.json();
    if (!session_id || !planner_id) throw new Error("Missing session_id or planner_id");

    // Try sandbox first, fall back to live
    const envs: StripeEnv[] = ["sandbox", "live"];
    let session: any = null;
    let usedEnv: StripeEnv = "sandbox";
    for (const env of envs) {
      try {
        const stripe = createStripeClient(env);
        session = await stripe.checkout.sessions.retrieve(session_id);
        usedEnv = env;
        break;
      } catch {
        // try next
      }
    }
    if (!session) throw new Error("Session not found");
    if (session.payment_status !== "paid") throw new Error("Payment not completed");

    const email = session.customer_details?.email || session.customer_email;
    if (!email) throw new Error("No email on session");

    // Idempotent: reuse existing purchase row for this session
    const { data: existing } = await supabase
      .from("purchases")
      .select("unlock_code, email")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    let unlock_code = existing?.unlock_code as string | undefined;
    if (!unlock_code) {
      unlock_code = makeCode();
      const { error } = await supabase.from("purchases").insert({
        planner_id,
        email,
        unlock_code,
        stripe_session_id: session_id,
        environment: usedEnv,
      });
      if (error) throw error;
    }

    const origin = req.headers.get("origin") || "";
    const installLink = `${origin}/unlock?code=${unlock_code}`;

    // Send transactional email if available; do not fail the purchase if email fails
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "planner-purchase",
          recipientEmail: email,
          idempotencyKey: `planner-purchase-${session_id}`,
          templateData: { plannerId: planner_id, installLink, unlockCode: unlock_code },
        },
      });
    } catch (e) {
      console.warn("Email send failed (non-fatal)", e);
    }

    return new Response(JSON.stringify({ ok: true, email, installLink }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("finalize-purchase error", e);
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
