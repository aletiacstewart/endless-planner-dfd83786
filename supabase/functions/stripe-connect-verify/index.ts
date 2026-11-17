import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createStripeClient } from "../_shared/stripe.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const stripe = createStripeClient("sandbox");
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: "connect-check@example.com",
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
    });
    // Clean up the probe account immediately
    await stripe.accounts.del(account.id);
    return new Response(JSON.stringify({ ok: true, connectEnabled: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
