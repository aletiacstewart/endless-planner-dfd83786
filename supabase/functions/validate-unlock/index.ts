import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { code } = await req.json();
    if (!code || typeof code !== "string") throw new Error("Missing code");
    const { data, error } = await supabase
      .from("purchases")
      .select("planner_id")
      .eq("unlock_code", code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid code" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ ok: true, planner_id: data.planner_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "Error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
