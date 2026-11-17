import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
const STATUSES = ["open", "pending", "resolved", "closed"] as const;
const STARTER_TASKS = ["Welcome call booked", "Contract signed", "First payment received", "Brand files collected", "Kickoff meeting held"];

interface Ticket { id: string; subject: string; priority: string; status: string; client_name: string | null; client_email: string | null; details: string | null; created_at: string }
interface Task { id: string; client_name: string; task: string; done: boolean }

const sel = "h-11 rounded-md border border-border bg-background px-3 capitalize";

export default function Care() {
  const { signedIn, activeId } = useMyOrgs();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [t, setT] = useState({ subject: "", client_name: "", client_email: "", details: "", priority: "normal" });
  const [client, setClient] = useState("");
  const [newTask, setNewTask] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    if (!activeId) return;
    const [a, b] = await Promise.all([
      supabase.from("care_tickets").select("*").eq("org_id", activeId).order("created_at", { ascending: false }),
      supabase.from("care_onboarding_tasks").select("id,client_name,task,done").eq("org_id", activeId).order("created_at"),
    ]);
    setTickets((a.data ?? []) as Ticket[]);
    setTasks((b.data ?? []) as Task[]);
  }, [activeId]);
  useEffect(() => { load(); }, [load]);

  const addTicket = async () => {
    if (!activeId || !t.subject.trim()) return toast.error("Add a subject first.");
    const { error } = await supabase.from("care_tickets").insert({ org_id: activeId, subject: t.subject.trim(), priority: t.priority, client_name: t.client_name.trim() || null, client_email: t.client_email.trim() || null, details: t.details.trim() || null });
    if (error) return toast.error("Couldn't save the ticket.");
    setT({ subject: "", client_name: "", client_email: "", details: "", priority: "normal" });
    toast.success("Ticket added");
    load();
  };
  const setStatus = async (id: string, status: string) => {
    await supabase.from("care_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    load();
  };
  const delTicket = async (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    const { error } = await supabase.from("care_tickets").delete().eq("id", id);
    if (error) return toast.error("Only owners and admins can delete.");
    load();
  };

  const addClient = async () => {
    const name = client.trim();
    if (!activeId || !name) return;
    if (tasks.some((x) => x.client_name === name)) return toast.error("That client already has a checklist.");
    await supabase.from("care_onboarding_tasks").insert(STARTER_TASKS.map((task) => ({ org_id: activeId, client_name: name, task })));
    setClient("");
    load();
  };
  const addTask = async (name: string) => {
    const task = (newTask[name] ?? "").trim();
    if (!activeId || !task) return;
    await supabase.from("care_onboarding_tasks").insert({ org_id: activeId, client_name: name, task });
    setNewTask({ ...newTask, [name]: "" });
    load();
  };
  const toggle = async (x: Task) => {
    setTasks((ts) => ts.map((y) => (y.id === x.id ? { ...y, done: !y.done } : y)));
    await supabase.from("care_onboarding_tasks").update({ done: !x.done }).eq("id", x.id);
  };

  const shown = tickets.filter((x) => statusFilter === "all" || (statusFilter === "active" ? ["open", "pending"].includes(x.status) : x.status === statusFilter));
  const clients = [...new Set(tasks.map((x) => x.client_name))];

  const body = () => {
    if (signedIn === null) return null;
    if (!signedIn || !activeId) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <HeartHandshake className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-muted-foreground">{!signedIn ? "Sign in to use Care." : "Create your business on the Hub first."}</p>
          <Button asChild className="mt-6"><Link to={!signedIn ? "/auth" : "/hub"}>{!signedIn ? "Sign in" : "Go to Hub"}</Link></Button>
        </div>
      );
    }
    return (
      <Tabs defaultValue="inbox">
        <TabsList className="mb-6"><TabsTrigger value="inbox">Support inbox</TabsTrigger><TabsTrigger value="onboarding">Client onboarding</TabsTrigger></TabsList>
        <TabsContent value="inbox" className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <p className="font-semibold">New ticket</p>
            <Input placeholder="Subject" value={t.subject} onChange={(e) => setT({ ...t, subject: e.target.value })} maxLength={150} />
            <Input placeholder="Client name" value={t.client_name} onChange={(e) => setT({ ...t, client_name: e.target.value })} maxLength={100} />
            <Input type="email" placeholder="Client email" value={t.client_email} onChange={(e) => setT({ ...t, client_email: e.target.value })} maxLength={200} />
            <Textarea placeholder="What do they need?" value={t.details} onChange={(e) => setT({ ...t, details: e.target.value })} maxLength={2000} />
            <select className={`${sel} w-full`} value={t.priority} onChange={(e) => setT({ ...t, priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p} value={p}>{p} priority</option>)}</select>
            <Button variant="secondary" className="h-11 w-full" onClick={addTicket}>Add ticket</Button>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {["active", ...STATUSES, "all"].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`min-h-10 rounded-full border px-4 text-sm capitalize ${statusFilter === s ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>{s}</button>
              ))}
            </div>
            {shown.length === 0 && <p className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">No tickets here.</p>}
            {shown.map((x) => (
              <div key={x.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{x.subject}</p>
                    <p className="text-xs text-muted-foreground">{[x.client_name, x.client_email].filter(Boolean).join(" · ")}{x.client_name || x.client_email ? " · " : ""}{new Date(x.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${x.priority === "urgent" || x.priority === "high" ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"}`}>{x.priority}</span>
                </div>
                {x.details && <p className="mt-2 whitespace-pre-wrap text-sm">{x.details}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select className={sel} value={x.status} onChange={(e) => setStatus(x.id, e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                  {x.client_email && <Button asChild variant="outline" className="h-11"><a href={`mailto:${x.client_email}?subject=${encodeURIComponent("Re: " + x.subject)}`}>Reply by email</a></Button>}
                  <Button variant="outline" className="h-11" onClick={() => delTicket(x.id)} aria-label="Delete ticket"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="onboarding" className="space-y-6">
          <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-5">
            <Input className="max-w-xs" placeholder="New client name" value={client} onChange={(e) => setClient(e.target.value)} maxLength={100} />
            <Button variant="secondary" className="h-11" onClick={addClient}><Plus className="mr-2 h-4 w-4" /> Start checklist</Button>
          </div>
          {clients.length === 0 && <p className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">No clients yet. Add one to get a starter checklist.</p>}
          <div className="grid gap-4 md:grid-cols-2">
            {clients.map((name) => {
              const list = tasks.filter((x) => x.client_name === name);
              const done = list.filter((x) => x.done).length;
              return (
                <div key={name} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between"><p className="font-semibold">{name}</p><span className="text-sm text-muted-foreground">{done}/{list.length} done</span></div>
                  <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-secondary" style={{ width: `${(done / list.length) * 100}%` }} /></div>
                  <ul className="mt-3 space-y-1">
                    {list.map((x) => (
                      <li key={x.id}><label className="flex min-h-11 cursor-pointer items-center gap-3"><input type="checkbox" className="h-5 w-5" checked={x.done} onChange={() => toggle(x)} /><span className={x.done ? "text-muted-foreground line-through" : ""}>{x.task}</span></label></li>
                    ))}
                  </ul>
                  <div className="mt-2 flex gap-2">
                    <Input placeholder="Add a step" value={newTask[name] ?? ""} onChange={(e) => setNewTask({ ...newTask, [name]: e.target.value })} maxLength={150} onKeyDown={(e) => e.key === "Enter" && addTask(name)} />
                    <Button variant="outline" className="h-11" onClick={() => addTask(name)}>Add</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="theme-brandedby min-h-screen bg-muted text-foreground">
      <BrandedByHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Care</p>
        <h1 className="mb-8 mt-2 text-4xl">Client care</h1>
        {body()}
      </main>
      <BrandedByFooter />
    </div>
  );
}
