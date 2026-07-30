const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "npm:@supabase/supabase-js@2";

const DEVICE_CAP = 5;

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // ---- Identity comes from the verified bearer token, never the body. ----
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (!token) return json({ ok: false, error: "Sign in to redeem your code." }, 401);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) return json({ ok: false, error: "Invalid session." }, 401);

    const { code, deviceId } = await req.json();
    if (!code || typeof code !== "string") return json({ ok: false, error: "Missing code" }, 400);
    if (!deviceId || typeof deviceId !== "string") return json({ ok: false, error: "Missing deviceId" }, 400);

    const cleanCode = code.trim().toUpperCase();

    const { data: planner } = await admin
      .from("purchases")
      .select("planner_id")
      .eq("unlock_code", cleanCode)
      .maybeSingle();

    const { data: pack } = !planner
      ? await admin
          .from("pack_purchases")
          .select("pack_id")
          .eq("unlock_code", cleanCode)
          .maybeSingle()
      : { data: null };

    if (!planner && !pack) return json({ ok: false, error: "Invalid code" }, 404);

    // ---- Device cap ----
    const { data: existing } = await admin
      .from("device_activations")
      .select("id")
      .eq("unlock_code", cleanCode)
      .eq("device_id", deviceId)
      .maybeSingle();

    if (!existing) {
      const { count } = await admin
        .from("device_activations")
        .select("id", { count: "exact", head: true })
        .eq("unlock_code", cleanCode);

      if ((count ?? 0) >= DEVICE_CAP) {
        return json({
          ok: false,
          error: `This code has already been activated on ${DEVICE_CAP} devices. Contact support if you need help.`,
        }, 403);
      }

      await admin.from("device_activations").insert({
        unlock_code: cleanCode,
        device_id: deviceId,
        user_agent: req.headers.get("user-agent") || null,
      });
    }

    // ---- Grant the entitlement server-side, bound to this account. ----
    if (planner) {
      const plannerId = (planner as { planner_id: string }).planner_id;
      const { error } = await admin
        .from("user_planner_unlocks")
        .upsert(
          { user_id: user.id, planner_id: plannerId, unlock_code: cleanCode },
          { onConflict: "user_id,planner_id" },
        );
      if (error) throw error;
      return json({ ok: true, type: "planner", planner_id: plannerId });
    }

    const packId = (pack as { pack_id: string }).pack_id;
    const { error } = await admin
      .from("user_packs")
      .upsert(
        { user_id: user.id, pack_id: packId, unlock_code: cleanCode },
        { onConflict: "user_id,pack_id" },
      );
    if (error) throw error;
    return json({ ok: true, type: "pack", pack_id: packId });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Error" }, 400);
  }
});
