// Sends the welcome email once per user, and stores their timezone.
// Called from the client on sign-in; idempotent via profiles.welcomed_at.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: userData, error: userErr } = await supa.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const user = userData.user;

  const body = await req.json().catch(() => ({}));
  const timezone: string | undefined = typeof body.timezone === "string" ? body.timezone : undefined;
  const ownerName: string | undefined = typeof body.ownerName === "string" ? body.ownerName : undefined;
  const origin: string = typeof body.origin === "string"
    ? body.origin
    : req.headers.get("origin") || "https://endless-planner.lovable.app";

  // Ensure profile row exists and set timezone.
  await supa.from("profiles").upsert(
    {
      user_id: user.id,
      email: user.email,
      ...(timezone && { timezone }),
    },
    { onConflict: "user_id" },
  );

  // Atomically claim the welcome send.
  const { data: claim, error: claimErr } = await supa
    .from("profiles")
    .update({ welcomed_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("welcomed_at", null)
    .select("user_id")
    .maybeSingle();

  if (claimErr) console.error("welcome claim failed", claimErr);

  if (!claim) {
    return new Response(JSON.stringify({ sent: false, reason: "already_welcomed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    await supa.functions.invoke("send-transactional-email", {
      body: {
        templateName: "welcome",
        recipientEmail: user.email,
        idempotencyKey: `welcome-${user.id}`,
        templateData: { ownerName, appLink: `${origin}/app` },
      },
    });
  } catch (e) {
    console.warn("Welcome email send failed (non-fatal)", e);
  }

  return new Response(JSON.stringify({ sent: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
