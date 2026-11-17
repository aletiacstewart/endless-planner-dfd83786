// Called by the Booth page after the customer pays, so the sale shows up right away.
// The payments webhook records it too; recording is idempotent by session id.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";
import { createStripeClient } from "../_shared/stripe.ts";
import { recordBoothCardSale } from "../_shared/booth.ts";

const Body = z.object({ sessionId: z.string().regex(/^cs_[A-Za-z0-9_]+$/).max(200), environment: z.enum(["sandbox", "live"]) });
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return json({ error: "Please sign in." }, 401);
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid request" }, 400);
    const session = await createStripeClient(parsed.data.environment).checkout.sessions.retrieve(parsed.data.sessionId);
    const orgId = session.metadata?.org_id;
    if (session.metadata?.kind !== "booth" || !orgId) return json({ error: "Not a Booth sale." }, 400);
    const { data: member } = await supabase.rpc("is_org_member", { _org_id: orgId });
    if (!member) return json({ error: "Not allowed." }, 403);
    if (session.payment_status !== "paid") return json({ status: session.payment_status });
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const saleId = await recordBoothCardSale(admin, session);
    return json({ status: "paid", saleId, total: session.amount_total });
  } catch (e) {
    console.error("booth finalize error", e);
    return json({ error: "Couldn't confirm the payment." }, 500);
  }
});
