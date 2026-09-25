import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldAlert, Copy, Mail, RefreshCw, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEntitlements } from "@/hooks/useEntitlements";
import { getCover } from "@/data/covers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

type Any = Record<string, any>;
interface Data {
  profiles: Any[]; subscriptions: Any[]; purchases: Any[]; packPurchases: Any[];
  userPacks: Any[]; unlocks: Any[]; devices: Any[]; events: Any[];
  backup: Record<string, { pages: number; deleted: number; last: string | null }>;
  settingsAt: Record<string, string>;
}

const PRICE = 21.97;
const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : "—");
const fmtT = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");
const coverName = (id: string) => getCover(id)?.name ?? id;
const lc = (s?: string | null) => (s ?? "").toLowerCase();
const isLive = (s?: Any) => !!s && (["active", "trialing", "past_due"].includes(s.status) ||
  (s.status === "canceled" && s.current_period_end && new Date(s.current_period_end) > new Date()));
const monthsPaid = (s?: Any) => {
  if (!s) return 0;
  const start = new Date(s.created_at).getTime();
  const end = s.status === "canceled" ? new Date(s.updated_at).getTime() : Date.now();
  return Math.max(1, Math.ceil((end - start) / (30.44 * 864e5)));
};
const copy = (t: string) => { void navigator.clipboard.writeText(t); toast.success("Copied"); };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading: entLoading, admin } = useEntitlements();
  const [env, setEnv] = useState<"live" | "sandbox">("live");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: d, error } = await supabase.functions.invoke("admin-dashboard", { body: { env } });
    setLoading(false);
    if (error || d?.error) { toast.error("Couldn't load dashboard"); return; }
    setData(d as Data);
  };
  useEffect(() => { if (admin) void load(); /* eslint-disable-next-line */ }, [admin, env]);

  const customers = useMemo(() => {
    if (!data) return [];
    return data.profiles.map((p) => {
      const email = lc(p.email);
      const sub = data.subscriptions.find((s) => s.user_id === p.user_id || lc(s.email) === email);
      const covers = new Set([
        ...data.userPacks.filter((x) => x.user_id === p.user_id).map((x) => x.pack_id),
        ...data.packPurchases.filter((x) => lc(x.email) === email).map((x) => x.pack_id),
      ]);
      return { ...p, user_id: p.user_id as string, created_at: p.created_at as string, email: (p.email ?? "") as string, sub, covers: covers.size, backup: data.backup[p.user_id] };
    }).filter((c) => !q || lc(c.email).includes(lc(q)));
  }, [data, q]);

  const stats = useMemo(() => {
    if (!data) return null;
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const active = data.subscriptions.filter((s) => isLive(s) && !(s.status === "canceled")).length;
    return {
      active,
      canceled: data.subscriptions.filter((s) => s.status === "canceled").length,
      mrr: (active * PRICE).toFixed(2),
      coversMonth: data.packPurchases.filter((p) => new Date(p.created_at) >= monthStart).length,
      newMonth: data.profiles.filter((p) => new Date(p.created_at) >= monthStart).length,
    };
  }, [data]);

  const feed = useMemo(() => {
    if (!data) return [];
    return [
      ...data.purchases.map((p) => ({ at: p.created_at, email: p.email, what: p.stripe_session_id?.startsWith("sub_") ? "Membership" : "Planner", code: p.unlock_code })),
      ...data.packPurchases.map((p) => ({ at: p.created_at, email: p.email, what: `Cover: ${coverName(p.pack_id)}`, code: p.unlock_code })),
    ].sort((a, b) => (a.at < b.at ? 1 : -1));
  }, [data]);

  if (entLoading) return <Center><Loader2 className="w-8 h-8 animate-spin text-primary" /></Center>;
  if (!admin) return <Center><ShieldAlert className="w-10 h-10 mx-auto mb-3 text-muted-foreground" /><h1 className="font-display text-2xl">Not available</h1></Center>;

  const c = sel ? customers.find((x) => x.user_id === sel) ?? data?.profiles.find((x) => x.user_id === sel) : null;

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin-planner")} aria-label="Back"><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="font-display text-3xl flex-1">Owner dashboard</h1>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {(["live", "sandbox"] as const).map((e) => (
              <Button key={e} size="sm" variant={env === e ? "default" : "ghost"} onClick={() => setEnv(e)}>{e === "live" ? "Live" : "Test"}</Button>
            ))}
          </div>
          <Button variant="outline" onClick={load} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}Refresh</Button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Stat label="Active members" v={stats.active} />
            <Stat label="Canceled" v={stats.canceled} />
            <Stat label="Monthly revenue" v={`$${stats.mrr}`} />
            <Stat label="Covers sold (month)" v={stats.coversMonth} />
            <Stat label="New customers (month)" v={stats.newMonth} />
          </div>
        )}

        <Tabs defaultValue="customers">
          <TabsList><TabsTrigger value="customers">Customers</TabsTrigger><TabsTrigger value="purchases">Purchases</TabsTrigger></TabsList>
          <TabsContent value="customers" className="space-y-3">
            <Input placeholder="Search by email" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="space-y-2">
              {customers.map((cu) => (
                <button key={cu.user_id} onClick={() => setSel(cu.user_id)}
                  className="planner-card w-full text-left grid gap-1 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr] sm:items-center touch-manipulation hover:border-primary">
                  <div><div className="font-medium break-all">{cu.email || "(no email)"}</div><div className="text-xs text-muted-foreground">Joined {fmt(cu.created_at)}</div></div>
                  <div><StatusBadge s={cu.sub} /></div>
                  <div className="text-sm">Renews {fmt(cu.sub?.current_period_end)}{cu.sub?.cancel_at_period_end ? " (ends)" : ""}</div>
                  <div className="text-sm">{monthsPaid(cu.sub)} mo paid · {cu.covers} covers</div>
                  <div className="text-sm text-muted-foreground">Backup {fmt(cu.backup?.last)}</div>
                </button>
              ))}
              {!customers.length && <p className="text-muted-foreground text-sm">No customers found.</p>}
            </div>
          </TabsContent>
          <TabsContent value="purchases" className="space-y-2">
            {feed.map((f, i) => (
              <div key={i} className="planner-card grid gap-1 sm:grid-cols-[1fr_2fr_2fr_1.5fr] sm:items-center text-sm">
                <div>{fmtT(f.at)}</div><div className="break-all">{f.email}</div><div>{f.what}</div>
                <button className="font-mono text-left flex items-center gap-1" onClick={() => copy(f.code)}>{f.code}<Copy className="w-3 h-3" /></button>
              </div>
            ))}
            {!feed.length && <p className="text-muted-foreground text-sm">No purchases in this mode.</p>}
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          {c && data && <Detail c={c as Any} data={data} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Detail({ c, data }: { c: Any; data: Data }) {
  const email = lc(c.email);
  const subs = data.subscriptions.filter((s) => s.user_id === c.user_id || lc(s.email) === email);
  const codes = [
    ...data.purchases.filter((p) => lc(p.email) === email).map((p) => ({ code: p.unlock_code, at: p.created_at, planner: p.planner_id })),
  ];
  for (const u of data.unlocks.filter((u) => u.user_id === c.user_id))
    if (!codes.some((x) => x.code === u.unlock_code)) codes.push({ code: u.unlock_code, at: u.unlocked_at, planner: u.planner_id });
  const covers = data.packPurchases.filter((p) => lc(p.email) === email);
  const subSessions = new Set(data.purchases.filter((p) => lc(p.email) === email).map((p) => p.stripe_session_id));
  const b = data.backup[c.user_id];
  const events = data.events.filter((e) => e.user_id === c.user_id);

  const resend = async () => {
    const { error } = await supabase.functions.invoke("resend-unlock-code", { body: { email: c.email } });
    error ? toast.error("Resend failed") : toast.success("Unlock email sent");
  };

  return (
    <div className="space-y-5">
      <SheetHeader><SheetTitle className="break-all">{c.email}</SheetTitle></SheetHeader>
      <Button variant="outline" onClick={resend}><Mail className="w-4 h-4" />Resend unlock email</Button>

      <Section title="Membership">
        {subs.length ? subs.map((s) => (
          <div key={s.id} className="text-sm space-y-0.5">
            <StatusBadge s={s} /> <span className="text-muted-foreground">{s.price_id}</span>
            <div>Started {fmt(s.created_at)} · {monthsPaid(s)} monthly payment(s)</div>
            <div>Current period {fmt(s.current_period_start)} – {fmt(s.current_period_end)}{s.cancel_at_period_end ? " · cancels at period end" : ""}</div>
          </div>
        )) : <Empty />}
      </Section>

      <Section title="Planner unlock codes">
        {codes.length ? codes.map((k) => {
          const devs = data.devices.filter((d) => d.unlock_code === k.code);
          return (
            <div key={k.code} className="text-sm">
              <button className="font-mono flex items-center gap-1" onClick={() => copy(k.code)}>{k.code}<Copy className="w-3 h-3" /></button>
              <div className="text-muted-foreground">{fmt(k.at)} · devices {devs.length}/5</div>
              {devs.map((d) => <div key={d.device_id} className="text-xs text-muted-foreground truncate">• {fmt(d.created_at)} {d.user_agent}</div>)}
            </div>
          );
        }) : <Empty />}
      </Section>

      <Section title="Covers purchased">
        {covers.length ? covers.map((p) => (
          <div key={p.id} className="text-sm flex flex-wrap gap-x-2">
            <span className="font-medium">{coverName(p.pack_id)}</span>
            <span className="text-muted-foreground">{fmt(p.created_at)}</span>
            <Badge variant="secondary">{subSessions.has(p.stripe_session_id) ? "with membership" : "separate"}</Badge>
            <button className="font-mono text-xs flex items-center gap-1" onClick={() => copy(p.unlock_code)}>{p.unlock_code}<Copy className="w-3 h-3" /></button>
          </div>
        )) : <Empty />}
      </Section>

      <Section title="Backup & sync">
        <div className="text-sm space-y-0.5">
          <div>Cloud pages: {b?.pages ?? 0} · deleted (restorable): {b?.deleted ?? 0}</div>
          <div>Last page sync: {fmtT(b?.last)}</div>
          <div>Settings last saved: {fmtT(data.settingsAt[c.user_id])}</div>
        </div>
      </Section>

      <Section title="Backups, restores & exports">
        {events.length ? events.map((e) => (
          <div key={e.id} className="text-sm">{fmtT(e.created_at)} · {e.kind.replace("_", " ")}{e.detail?.count != null ? ` (${e.detail.count} pages)` : ""}</div>
        )) : <Empty />}
      </Section>
    </div>
  );
}

const Center = ({ children }: { children: React.ReactNode }) => <div className="min-h-screen flex items-center justify-center text-center bg-background">{<div>{children}</div>}</div>;
const Stat = ({ label, v }: { label: string; v: React.ReactNode }) => <div className="planner-card"><div className="text-xs text-muted-foreground">{label}</div><div className="text-2xl font-display">{v}</div></div>;
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => <div className="space-y-2"><h3 className="font-display text-lg border-b border-border pb-1">{title}</h3>{children}</div>;
const Empty = () => <p className="text-sm text-muted-foreground">None</p>;
function StatusBadge({ s }: { s?: Any }) {
  if (!s) return <Badge variant="outline">No membership</Badge>;
  return <Badge variant={isLive(s) && s.status !== "canceled" ? "default" : s.status === "past_due" ? "destructive" : "secondary"}>{s.status.replace("_", " ")}</Badge>;
}
