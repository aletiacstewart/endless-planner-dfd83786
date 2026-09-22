import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

/**
 * Owner-only helper: creates (or updates) a tester account with full planner
 * access. Requires the caller to hold the `admin` role.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, service, { auth: { persistSession: false } });

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "Not authenticated" }, 401);
    const { data: caller, error: callerErr } = await admin.auth.getUser(token);
    if (callerErr || !caller?.user) return json({ error: "Not authenticated" }, 401);

    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: caller.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin access required" }, 403);

    const body = await req.json().catch(() => null);
    const accounts = Array.isArray(body?.accounts) ? body.accounts : null;
    if (!accounts?.length) return json({ error: "accounts[] required" }, 400);

    const results: unknown[] = [];

    for (const a of accounts) {
      const email = String(a?.email ?? "").trim().toLowerCase();
      const password = String(a?.password ?? "");
      const fullName = String(a?.full_name ?? "").trim();
      const role = a?.role === "tester" ? "tester" : "tester";
      if (!email.includes("@") || password.length < 6) {
        results.push({ email, status: "invalid" });
        continue;
      }

      // Find existing user by email.
      let userId: string | null = null;
      let page = 1;
      while (page <= 10 && !userId) {
        const { data: list } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        const found = list?.users?.find((u) => u.email?.toLowerCase() === email);
        if (found) userId = found.id;
        if (!list?.users?.length || list.users.length < 200) break;
        page++;
      }

      if (userId) {
        const { error } = await admin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (error) {
          results.push({ email, status: "update_failed", error: error.message });
          continue;
        }
        results.push({ email, status: "updated", user_id: userId });
      } else {
        const { data: created, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName },
        });
        if (error || !created?.user) {
          results.push({ email, status: "create_failed", error: error?.message });
          continue;
        }
        userId = created.user.id;
        results.push({ email, status: "created", user_id: userId });
      }

      await admin.from("user_roles").upsert(
        { user_id: userId, role },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    }

    return json({ results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
