// Starts (or resumes) Stripe Connect onboarding for a business.
// Only owners/admins of the business can run this. Returns a Stripe-hosted
// onboarding URL; the business owner finishes their details on Stripe's site.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.25.76";
import { createStripeClient } from "../_shared/stripe.ts";

const Body = z.object({
  orgId: z.string().uuid(),
  returnBase: z.string().url().max(300), // e.g. https://brandedbydigital.com
  environment: z.enum(["sandbox", "live"]),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization") ?? "";
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return json({ error: "Please sign in." }, 401);

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request" }, 400);
  const { orgId, returnBase, environment } = parsed.data;

  const { data: manager } = await supabase.rpc("is_org_manager", { _org_id: orgId });
  if (!manager) return json({ error: "Only owners and admins can connect payments." }, 403);

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, stripe_account_id")
    .eq("id", orgId)
    .single();
  if (!org) return json({ error: "Business not found." }, 404);

  const stripe = createStripeClient(environment);

  let accountId = org.stripe_account_id as string | null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: userData.user.email ?? undefined,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { name: org.name },
      metadata: { orgId },
    });
    accountId = account.id;
    const { error: saveErr } = await supabase
      .from("organizations")
      .update({ stripe_account_id: accountId })
      .eq("id", orgId);
    if (saveErr) return json({ error: "Could not save the account. Try again." }, 500);
  }

  const functionsBase = `${Deno.env.get("SUPABASE_URL")}/functions/v1`;
  const returnUrl = `${functionsBase}/stripe-connect-return?org=${orgId}&env=${environment}&back=${encodeURIComponent(returnBase)}`;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: returnUrl, // Stripe re-enters here if the link expires; we issue a fresh one
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return json({ url: link.url });
});
