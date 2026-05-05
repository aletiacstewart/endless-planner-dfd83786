const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") throw new Error("Email required");
    const cleanEmail = email.trim().toLowerCase();

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("planner_id, unlock_code, email")
      .ilike("email", cleanEmail);
    if (error) throw error;

    // Always respond OK to avoid leaking which emails are registered.
    if (purchases && purchases.length > 0) {
      const origin = req.headers.get("origin") || "";
      for (const p of purchases as any[]) {
        const installLink = `${origin}/unlock?code=${p.unlock_code}`;
        try {
          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "planner-purchase",
              recipientEmail: p.email,
              idempotencyKey: `planner-resend-${p.unlock_code}-${Date.now()}`,
              templateData: { plannerId: p.planner_id, installLink, unlockCode: p.unlock_code },
            },
          });
        } catch (e) {
          console.warn("Resend email failed", e);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Error" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
