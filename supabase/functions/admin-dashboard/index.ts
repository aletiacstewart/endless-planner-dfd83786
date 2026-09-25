import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "Unauthorized" }, 401);
    const supa = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: isAdmin } = await supa.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    let body: any = {};
    try { body = await req.json(); } catch { /* empty */ }
    const env = body.env === "live" ? "live" : "sandbox";

    const [profiles, subs, purchases, packs, userPacks, unlocks, devices, entries, settings, events] = await Promise.all([
      supa.from("profiles").select("user_id, email, created_at").order("created_at", { ascending: false }).limit(5000),
      supa.from("subscriptions").select("*").eq("environment", env).order("created_at", { ascending: false }),
      supa.from("purchases").select("*").eq("environment", env).order("created_at", { ascending: false }),
      supa.from("pack_purchases").select("*").eq("environment", env).order("created_at", { ascending: false }),
      supa.from("user_packs").select("*"),
      supa.from("user_planner_unlocks").select("*"),
      supa.from("device_activations").select("unlock_code, device_id, user_agent, created_at"),
      supa.from("planner_entries").select("user_id, updated_at, deleted_at").limit(100000),
      supa.from("user_settings").select("user_id, updated_at"),
      supa.from("admin_events").select("*").order("created_at", { ascending: false }).limit(5000),
    ]);

    const backup: Record<string, { pages: number; deleted: number; last: string | null }> = {};
    for (const e of entries.data ?? []) {
      const b = (backup[e.user_id] ??= { pages: 0, deleted: 0, last: null });
      if (e.deleted_at) b.deleted++; else b.pages++;
      if (!b.last || e.updated_at > b.last) b.last = e.updated_at;
    }
    const settingsAt: Record<string, string> = {};
    for (const s of settings.data ?? []) settingsAt[s.user_id] = s.updated_at;

    return json({
      env,
      profiles: profiles.data ?? [],
      subscriptions: subs.data ?? [],
      purchases: purchases.data ?? [],
      packPurchases: packs.data ?? [],
      userPacks: userPacks.data ?? [],
      unlocks: unlocks.data ?? [],
      devices: devices.data ?? [],
      backup,
      settingsAt,
      events: events.data ?? [],
    });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
