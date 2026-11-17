import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getStripeEnvironmentSafe } from "@/lib/stripe";

interface OrgRow {
  id: string;
  name: string;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  stripe_details_submitted: boolean;
}

type Status = "active" | "pending" | "none";

function statusOf(o: OrgRow): Status {
  if (o.stripe_charges_enabled && o.stripe_payouts_enabled) return "active";
  if (o.stripe_account_id) return "pending";
  return "none";
}

const STATUS_COPY: Record<Status, { label: string; className: string }> = {
  active: { label: "Active — you can take card payments", className: "text-secondary" },
  pending: { label: "Setup started — finish your details on Stripe", className: "text-accent" },
  none: { label: "Not connected", className: "text-muted-foreground" },
};

export function ConnectStripeCard() {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busyOrg, setBusyOrg] = useState<string | null>(null);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoaded(true); return; }
    // Orgs the user can manage (owner/admin). RLS already scopes both queries.
    const { data: memberships } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", session.user.id);
    const managedIds = (memberships ?? []).filter((m) => m.role === "owner" || m.role === "admin").map((m) => m.org_id);
    if (managedIds.length === 0) { setOrgs([]); setLoaded(true); return; }
    const { data } = await supabase
      .from("organizations")
      .select("id,name,stripe_account_id,stripe_charges_enabled,stripe_payouts_enabled,stripe_details_submitted")
      .in("id", managedIds)
      .order("created_at");
    setOrgs(data ?? []);
    setLoaded(true);
  };

  useEffect(() => { load(); }, []);

  const connect = async (orgId: string) => {
    setBusyOrg(orgId);
    const { data, error } = await supabase.functions.invoke("connect-stripe", {
      body: { orgId, returnBase: window.location.origin, environment: getStripeEnvironmentSafe() },
    });
    setBusyOrg(null);
    if (error || !data?.url) {
      toast.error(data?.error ?? "Couldn't start Stripe setup. Please try again.");
      return;
    }
    window.location.href = data.url;
  };

  if (!loaded || orgs.length === 0) return null;

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <CreditCard className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-lg uppercase text-accent">Get paid with Stripe</h2>
          <p className="text-sm text-muted-foreground">
            Connect your own Stripe account so Booth sales go straight to your bank.
          </p>
        </div>
      </div>
      <ul className="mt-4 grid gap-3">
        {orgs.map((o) => {
          const status = statusOf(o);
          const copy = STATUS_COPY[status];
          return (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-primary-soft p-4">
              <div>
                <p className="font-semibold text-foreground">{o.name}</p>
                <p className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${copy.className}`}>
                  {status === "active" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                  {copy.label}
                </p>
              </div>
              {status !== "active" && (
                <Button onClick={() => connect(o.id)} disabled={busyOrg === o.id} variant="secondary" className="uppercase tracking-[0.15em]">
                  {busyOrg === o.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {status === "pending" ? "Continue setup" : "Connect Stripe"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
