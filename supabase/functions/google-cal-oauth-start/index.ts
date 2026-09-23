import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { authorizeAppUserOAuth } from "../_shared/appUserConnector.ts";
import { getConnectionKeyForUser } from "../_shared/appUserConnections.ts";
import { GOOGLE_CALENDAR_SCOPES } from "../_shared/googleScopes.ts";

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

    const clientAPIKey = Deno.env.get("GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY");
    if (!clientAPIKey) {
      return new Response("GOOGLE_CALENDAR_APP_USER_CONNECTOR_CLIENT_API_KEY is not set", {
        status: 500,
        headers: corsHeaders,
      });
    }

    const { origin } = await req.json().catch(() => ({ origin: "" }));
    const originStr = typeof origin === "string" && /^https?:\/\//.test(origin) ? origin : "";
    if (!originStr) {
      return new Response("Missing origin", { status: 400, headers: corsHeaders });
    }
    const returnUrl = new URL("/oauth/google-calendar/return", originStr).toString();

    // Reconnect: pass the stored lovack_* so the gateway can confirm ownership.
    const connectionAPIKey = await getConnectionKeyForUser(user.id, CONNECTOR_ID);

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: user.id,
      clientAPIKey,
      returnUrl,
      connectionAPIKey: connectionAPIKey ?? undefined,
      credentialsConfiguration: {
        scopes: GOOGLE_CALENDAR_SCOPES,
      },
    });
    return Response.json({ authorizationUrl }, { headers: corsHeaders });
  } catch (err) {
    console.error("google-cal-oauth-start failed", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "OAuth start failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
