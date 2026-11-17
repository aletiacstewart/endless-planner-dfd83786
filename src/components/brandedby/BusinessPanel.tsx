import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Org { id: string; name: string; plan_tier: string }

const PLAN_LABEL: Record<string, string> = { starter: "Starter", growth_pro: "Growth Pro", agency: "Agency" };

export function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

export function BusinessPanel() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSignedIn(!!session);
    if (!session) return;
    const { data } = await supabase.from("organizations").select("id,name,plan_tier").order("created_at");
    setOrgs(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const slug = toSlug(name);
    if (slug.length < 2) return toast.error("Please enter your business name.");
    setBusy(true);
    const { error } = await supabase.rpc("create_organization", { _name: name, _slug: `${slug}-${Math.random().toString(36).slice(2, 6)}` });
    setBusy(false);
    if (error) return toast.error("Couldn't create your business. Please try again.");
    toast.success("Business created");
    setName("");
    load();
  };

  if (signedIn === null) return null;
  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Sign in to set up your business workspace.</p>
        <Button asChild variant="secondary"><Link to="/auth">Sign in</Link></Button>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Your businesses</p>
      {orgs.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((o) => (
            <li key={o.id} className="rounded-lg bg-primary-soft p-4">
              <p className="font-semibold text-foreground">{o.name}</p>
              <p className="text-xs uppercase tracking-wider text-primary">{PLAN_LABEL[o.plan_tier] ?? o.plan_tier}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" className="h-11" maxLength={80} />
        <Button onClick={create} disabled={busy} className="h-11 uppercase tracking-[0.15em]">
          {orgs.length ? "Add business" : "Create my business"}
        </Button>
      </div>
    </div>
  );
}
