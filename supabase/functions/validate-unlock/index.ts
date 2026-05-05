const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "npm:@supabase/supabase-js@2";

const DEVICE_CAP = 5;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { code, deviceId } = await req.json();
    if (!code || typeof code !== "string") throw new Error("Missing code");
    if (!deviceId || typeof deviceId !== "string") throw new Error("Missing deviceId");

    const cleanCode = code.trim().toUpperCase();
    const { data: purchase, error } = await supabase
      .from("purchases")
      .select("planner_id")
      .eq("unlock_code", cleanCode)
      .maybeSingle();
    if (error) throw error;
    if (!purchase) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid code" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("device_activations")
      .select("id")
      .eq("unlock_code", cleanCode)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (!existing) {
      const { count } = await supabase
        .from("device_activations")
        .select("id", { count: "exact", head: true })
        .eq("unlock_code", cleanCode);

      if ((count ?? 0) >= DEVICE_CAP) {
        return new Response(JSON.stringify({
          ok: false,
          error: `This code has already been activated on ${DEVICE_CAP} devices. Contact support if you need help.`,
        }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const ua = req.headers.get("user-agent") || null;
      await supabase.from("device_activations").insert({
        unlock_code: cleanCode,
        device_id: deviceId,
        user_agent: ua,
      });
    }

    return new Response(JSON.stringify({ ok: true, planner_id: (purchase as any).planner_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Error" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
