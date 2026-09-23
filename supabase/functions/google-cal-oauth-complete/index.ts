import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { exchangeAppUserOAuthCode } from "../_shared/appUserConnector.ts";
import { saveConnectionKeyForUser } from "../_shared/appUserConnections.ts";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "google_calendar";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Sign in required", { status: 401, headers: corsHeaders });

    const { code } = await req.json().catch(() => ({ code: "" }));
    if (typeof code !== "string" || !code) {
      return new Response("Missing code", { status: 400, headers: corsHeaders });
    }

    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      code,
    );
    if (connectorId !== CONNECTOR_ID) {
      return new Response("OAuth completion returned the wrong connector", {
        status: 400,
        headers: corsHeaders,
      });
    }
    await saveConnectionKeyForUser(user.id, connectorId, connectionAPIKey);
    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (err) {
    console.error("google-cal-oauth-complete failed", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "OAuth completion failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
