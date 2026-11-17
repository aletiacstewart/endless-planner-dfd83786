// Stripe sends the business owner here after onboarding (or when a link
// expires). We read the account's status, save it on the business, then send
// the owner back to the Hub. No login required — Stripe already verified them.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createStripeClient, type StripeEnv } from "../_shared/stripe.ts";

function getSupabase() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const orgId = url.searchParams.get("org") ?? "";
  const env = url.searchParams.get("env") ?? "";
  const back = url.searchParams.get("back") ?? "";
  const safeBack = /^https:\/\//.test(back) ? back : "";

  const redirect = (status: string) =>
    Response.redirect(`${safeBack || "https://brandedbydigital.com"}/hub?connect=${status}`, 302);

  if (!/^[0-9a-f-]{36}$/.test(orgId) || (env !== "sandbox" && env !== "live")) return redirect("error");

  const stripe = createStripeClient(env as StripeEnv);
  const { data: org } = await getSupabase()
    .from("organizations")
    .select("stripe_account_id")
    .eq("id", orgId)
    .single();
  if (!org?.stripe_account_id) return redirect("error");

  try {
    const account = await stripe.accounts.retrieve(org.stripe_account_id);
    const active = Boolean(account.charges_enabled && account.payouts_enabled);
    await getSupabase()
      .from("organizations")
      .update({
        stripe_charges_enabled: Boolean(account.charges_enabled),
        stripe_payouts_enabled: Boolean(account.payouts_enabled),
        stripe_details_submitted: Boolean(account.details_submitted),
        stripe_connected_at: active ? new Date().toISOString() : null,
      })
      .eq("id", orgId);
    return redirect(active ? "success" : "pending");
  } catch (e) {
    console.error("connect return error", e);
    return redirect("error");
  }
});
