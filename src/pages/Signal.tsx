import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Send, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Contact { id: string; name: string | null; email: string | null; phone: string | null; email_opt_in: boolean; sms_opt_in: boolean; created_at: string }
interface Campaign { id: string; name: string; channel: string; status: string; subject: string | null; email_body: string | null; sms_body: string | null }

const sel = "h-11 rounded-md border border-border bg-background px-3 capitalize";
const EMPTY = { name: "", channel: "email", subject: "", email_body: "", sms_body: "" };

export default function Signal() {
  const { signedIn, activeId } = useMyOrgs();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [c, setC] = useState({ name: "", email: "", phone: "", email_opt_in: true, sms_opt_in: false });
  const [draft, setDraft] = useState<typeof EMPTY & { id?: string }>(EMPTY);

  const load = useCallback(async () => {
    if (!activeId) return;
    const [a, b] = await Promise.all([
      supabase.from("signal_contacts").select("*").eq("org_id", activeId).order("created_at", { ascending: false }),
      supabase.from("signal_campaigns").select("*").eq("org_id", activeId).order("created_at", { ascending: false }),
    ]);
    setContacts((a.data ?? []) as Contact[]);
    setCampaigns((b.data ?? []) as Campaign[]);
  }, [activeId]);
  useEffect(() => { load(); }, [load]);

  const addContact = async () => {
    const email = c.email.trim().toLowerCase(), phone = c.phone.trim();
    if (!activeId || (!email && !phone)) return toast.error("Add an email or phone number.");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("That email doesn't look right.");
    const { error } = await supabase.from("signal_contacts").insert({ org_id: activeId, name: c.name.trim() || null, email: email || null, phone: phone || null, email_opt_in: !!email && c.email_opt_in, sms_opt_in: !!phone && c.sms_opt_in });
    if (error) return toast.error("Couldn't save the contact.");
    setC({ name: "", email: "", phone: "", email_opt_in: true, sms_opt_in: false });
    load();
  };
  const toggleOpt = async (x: Contact, field: "email_opt_in" | "sms_opt_in") => {
    await supabase.from("signal_contacts").update(field === "email_opt_in" ? { email_opt_in: !x.email_opt_in } : { sms_opt_in: !x.sms_opt_in }).eq("id", x.id);
    load();
  };
  const delContact = async (id: string) => {
    if (!confirm("Delete this contact?")) return;
    const { error } = await supabase.from("signal_contacts").delete().eq("id", id);
    if (error) return toast.error("Only owners and admins can delete.");
    load();
  };

  const importCsv = async (f?: File) => {
    if (!f || !activeId) return;
    const lines = (await f.text()).split(/\r?\n/).filter(Boolean);
    const head = lines.shift()?.toLowerCase().split(",").map((h) => h.trim()) ?? [];
    const idx = (k: string) => head.findIndex((h) => h.includes(k));
    const [ni, ei, pi] = [idx("name"), idx("email"), idx("phone")];
    const rows = lines.map((l) => l.split(",").map((v) => v.trim().replace(/^"|"$/g, ""))).map((v) => ({
      org_id: activeId, name: v[ni] || null, email: v[ei]?.toLowerCase() || null, phone: v[pi] || null,
      email_opt_in: false, sms_opt_in: false, source: "import",
    })).filter((r) => r.email || r.phone);
    if (!rows.length) return toast.error("No contacts found. The file needs name, email or phone columns.");
    const { error } = await supabase.from("signal_contacts").insert(rows);
    if (error) return toast.error("Import failed.");
    toast.success(`Imported ${rows.length} contacts. Turn on email or text for those who agreed.`);
    load();
  };
  const exportCsv = () => {
    const csv = ["name,email,phone,email_ok,text_ok", ...contacts.map((x) => [x.name ?? "", x.email ?? "", x.phone ?? "", x.email_opt_in, x.sms_opt_in].join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "signal-contacts.csv";
    a.click();
  };

  const saveCampaign = async () => {
    if (!activeId || !draft.name.trim()) return toast.error("Give the campaign a name.");
    const row = { name: draft.name.trim(), channel: draft.channel, subject: draft.subject || null, email_body: draft.email_body || null, sms_body: draft.sms_body || null, updated_at: new Date().toISOString() };
    const { error } = draft.id
      ? await supabase.from("signal_campaigns").update(row).eq("id", draft.id)
      : await supabase.from("signal_campaigns").insert({ ...row, org_id: activeId });
    if (error) return toast.error("Couldn't save the campaign.");
    toast.success("Campaign saved");
    setDraft(EMPTY);
    load();
  };
  const setStatus = async (id: string, status: string) => { await supabase.from("signal_campaigns").update({ status }).eq("id", id); load(); };
  const delCampaign = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    const { error } = await supabase.from("signal_campaigns").delete().eq("id", id);
    if (error) return toast.error("Only owners and admins can delete.");
    load();
  };

  const emailOk = contacts.filter((x) => x.email_opt_in).length;
  const smsOk = contacts.filter((x) => x.sms_opt_in).length;
  const wantsEmail = draft.channel !== "sms", wantsSms = draft.channel !== "email";

  const body = () => {
    if (signedIn === null) return null;
    if (!signedIn || !activeId) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Send className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-muted-foreground">{!signedIn ? "Sign in to use Signal." : "Create your business on the Hub first."}</p>
          <Button asChild className="mt-6"><Link to={!signedIn ? "/auth" : "/hub"}>{!signedIn ? "Sign in" : "Go to Hub"}</Link></Button>
        </div>
      );
    }
    return (
      <Tabs defaultValue="campaigns">
        <TabsList className="mb-6"><TabsTrigger value="campaigns">Campaigns</TabsTrigger><TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger></TabsList>
        <TabsContent value="campaigns" className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <p className="font-semibold">{draft.id ? "Edit campaign" : "New campaign"}</p>
            <Input placeholder="Campaign name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={120} />
            <select className={`${sel} w-full`} value={draft.channel} onChange={(e) => setDraft({ ...draft, channel: e.target.value })}>
              <option value="email">Email</option><option value="sms">Text message</option><option value="omnichannel">Email + text</option>
            </select>
            {wantsEmail && <>
              <Input placeholder="Email subject" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} maxLength={150} />
              <Textarea rows={6} placeholder="Email message" value={draft.email_body} onChange={(e) => setDraft({ ...draft, email_body: e.target.value })} maxLength={5000} />
            </>}
            {wantsSms && <>
              <Textarea rows={3} placeholder="Text message" value={draft.sms_body} onChange={(e) => setDraft({ ...draft, sms_body: e.target.value })} maxLength={320} />
              <p className="text-xs text-muted-foreground">{draft.sms_body.length}/160 per text · "Reply STOP to opt out" is added when sent</p>
            </>}
            <p className="text-xs text-muted-foreground">Reaches {wantsEmail ? `${emailOk} by email` : ""}{wantsEmail && wantsSms ? " and " : ""}{wantsSms ? `${smsOk} by text` : ""} — only contacts who agreed.</p>
            <div className="flex gap-2">
              <Button variant="secondary" className="h-11 flex-1" onClick={saveCampaign}>Save campaign</Button>
              {draft.id && <Button variant="outline" className="h-11" onClick={() => setDraft(EMPTY)}>Cancel</Button>}
            </div>
          </div>
          <div className="space-y-3">
            {campaigns.length === 0 && <p className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">No campaigns yet.</p>}
            {campaigns.map((x) => (
              <div key={x.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="font-semibold">{x.name}</p><p className="text-xs text-muted-foreground">{x.channel === "omnichannel" ? "Email + text" : x.channel === "sms" ? "Text message" : "Email"}{x.subject ? ` · ${x.subject}` : ""}</p></div>
                  <select className={sel} value={x.status} onChange={(e) => setStatus(x.id, e.target.value)}>{["draft", "active", "paused", "archived"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" className="h-11" onClick={() => setDraft({ id: x.id, name: x.name, channel: x.channel, subject: x.subject ?? "", email_body: x.email_body ?? "", sms_body: x.sms_body ?? "" })}>Edit</Button>
                  <Button variant="outline" className="h-11" onClick={() => delCampaign(x.id)} aria-label="Delete campaign"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="contacts" className="space-y-6">
          <div className="grid gap-3 rounded-xl border border-border bg-card p-5 md:grid-cols-4">
            <Input placeholder="Name" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} maxLength={100} />
            <Input type="email" placeholder="Email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} maxLength={200} />
            <Input type="tel" placeholder="Phone" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} maxLength={20} />
            <Button variant="secondary" className="h-11" onClick={addContact}>Add contact</Button>
            <label className="flex items-center gap-2 text-sm"><Switch checked={c.email_opt_in} onCheckedChange={(v) => setC({ ...c, email_opt_in: v })} /> Agreed to emails</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={c.sms_opt_in} onCheckedChange={(v) => setC({ ...c, sms_opt_in: v })} /> Agreed to texts</label>
            <Button asChild variant="outline" className="h-11"><label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" /> Import CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { importCsv(e.target.files?.[0]); e.target.value = ""; }} /></label></Button>
            <Button variant="outline" className="h-11" onClick={exportCsv} disabled={!contacts.length}><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Emails</th><th className="p-3">Texts</th><th /></tr></thead>
              <tbody>
                {contacts.map((x) => (
                  <tr key={x.id} className="border-t border-border">
                    <td className="p-3">{x.name}</td><td className="p-3">{x.email}</td><td className="p-3">{x.phone}</td>
                    <td className="p-3"><Switch disabled={!x.email} checked={x.email_opt_in} onCheckedChange={() => toggleOpt(x, "email_opt_in")} /></td>
                    <td className="p-3"><Switch disabled={!x.phone} checked={x.sms_opt_in} onCheckedChange={() => toggleOpt(x, "sms_opt_in")} /></td>
                    <td className="p-3"><Button variant="outline" size="sm" className="h-10" onClick={() => delContact(x.id)} aria-label="Delete contact"><Trash2 className="h-4 w-4" /></Button></td>
                  </tr>
                ))}
                {!contacts.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No contacts yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div className="theme-brandedby min-h-screen bg-muted text-foreground">
      <BrandedByHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Signal</p>
        <h1 className="mb-2 mt-2 text-4xl">Email & text campaigns</h1>
        <p className="mb-8 text-muted-foreground">Write campaigns and keep your contact list. Sending turns on once email and text services are connected.</p>
        {body()}
      </main>
      <BrandedByFooter />
    </div>
  );
}
