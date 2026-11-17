import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Download, ShieldCheck, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uploadToStash } from "@/lib/stash";
import { toast } from "sonner";

interface Member { id: string; user_id: string; email: string | null; role: string }
const LAYOUTS = [{ id: "tile", label: "Tiled" }, { id: "corner", label: "Corner" }, { id: "center", label: "Center" }] as const;
const sel = "h-11 rounded-md border border-border bg-background px-3 capitalize";

export default function Guard() {
  const { signedIn, activeId, activeOrg } = useMyOrgs();
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("photo");
  const [text, setText] = useState("");
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]["id"]>("tile");
  const [opacity, setOpacity] = useState(35);
  const [color, setColor] = useState("#ffffff");
  const canvas = useRef<HTMLCanvasElement>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [inv, setInv] = useState({ email: "", role: "member" });

  useEffect(() => { if (activeOrg && !text) setText(`© ${activeOrg.name}`); }, [activeOrg, text]);

  const loadMembers = useCallback(async () => {
    if (!activeId) return;
    const { data: { user } } = await supabase.auth.getUser();
    setMe(user?.id ?? null);
    const { data } = await supabase.rpc("list_org_members", { _org_id: activeId });
    setMembers((data ?? []) as Member[]);
  }, [activeId]);
  useEffect(() => { loadMembers(); }, [loadMembers]);

  const myRole = members.find((m) => m.user_id === me)?.role;
  const canManage = myRole === "owner" || myRole === "admin";

  useEffect(() => {
    const c = canvas.current;
    if (!c || !img) return;
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    const size = Math.max(16, Math.round(c.width / (layout === "center" ? 12 : 28)));
    ctx.font = `600 ${size}px "Work Sans", sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity / 100;
    ctx.textBaseline = "middle";
    if (layout === "tile") {
      ctx.save();
      ctx.translate(c.width / 2, c.height / 2);
      ctx.rotate(-Math.PI / 6);
      const w = ctx.measureText(text).width + size * 3, h = size * 4, r = Math.hypot(c.width, c.height);
      for (let y = -r; y < r; y += h) for (let x = -r; x < r; x += w) ctx.fillText(text, x + ((y / h) % 2 ? w / 2 : 0), y);
      ctx.restore();
    } else if (layout === "center") {
      ctx.textAlign = "center"; ctx.fillText(text, c.width / 2, c.height / 2);
    } else {
      ctx.textAlign = "right"; ctx.fillText(text, c.width - size, c.height - size);
    }
    ctx.globalAlpha = 1;
  }, [img, text, layout, opacity, color]);

  const pick = (f?: File) => {
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) return toast.error("Please choose a JPG, PNG or WEBP image.");
    if (f.size > 25 * 1024 * 1024) return toast.error("Please choose an image under 25 MB.");
    setFileName(f.name.replace(/\.[^.]+$/, ""));
    const i = new Image();
    i.onload = () => setImg(i);
    i.src = URL.createObjectURL(f);
  };
  const toBlob = () => new Promise<Blob | null>((r) => canvas.current?.toBlob(r, "image/png"));
  const download = async () => {
    const b = await toBlob(); if (!b) return;
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `${fileName}-protected.png`; a.click();
  };
  const save = async () => {
    const b = await toBlob(); if (!b || !activeId) return;
    try { await uploadToStash(activeId, new File([b], `${fileName}-protected.png`, { type: "image/png" }), `${fileName} (protected)`, "photos"); toast.success("Saved to Stash"); }
    catch { toast.error("Couldn't save to Stash."); }
  };

  const invite = async () => {
    if (!activeId || !inv.email.trim()) return;
    const { data, error } = await supabase.rpc("add_org_member_by_email", { _org_id: activeId, _email: inv.email.trim(), _role: inv.role });
    if (error) return toast.error("Only owners and admins can add people.");
    if (data === "no_account") return toast.error("No account uses that email yet. Ask them to sign up first, then add them.");
    if (data === "already_member") return toast.error("They're already on your team.");
    toast.success("Added to your team");
    setInv({ email: "", role: "member" });
    loadMembers();
  };
  const changeRole = async (m: Member, role: string) => {
    const { error } = await supabase.from("organization_members").update({ role }).eq("id", m.id);
    if (error) return toast.error("Couldn't change their access.");
    loadMembers();
  };
  const removeMember = async (m: Member) => {
    if (!confirm(`Remove ${m.email ?? "this person"} from your team?`)) return;
    const { error } = await supabase.from("organization_members").delete().eq("id", m.id);
    if (error) return toast.error("Couldn't remove them.");
    loadMembers();
  };

  const body = () => {
    if (signedIn === null) return null;
    if (!signedIn || !activeId) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-muted-foreground">{!signedIn ? "Sign in to use Guard." : "Create your business on the Hub first."}</p>
          <Button asChild className="mt-6"><Link to={!signedIn ? "/auth" : "/hub"}>{!signedIn ? "Sign in" : "Go to Hub"}</Link></Button>
        </div>
      );
    }
    return (
      <Tabs defaultValue="watermark">
        <TabsList className="mb-6"><TabsTrigger value="watermark">Watermark</TabsTrigger><TabsTrigger value="team">Team access</TabsTrigger></TabsList>
        <TabsContent value="watermark" className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <Button asChild variant="outline" className="h-11 w-full"><label className="cursor-pointer"><Upload className="mr-2 h-4 w-4" /> Choose an image<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} /></label></Button>
            <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={60} placeholder="Watermark text" />
            <div className="grid grid-cols-3 gap-2">
              {LAYOUTS.map((l) => <button key={l.id} onClick={() => setLayout(l.id)} className={`min-h-11 rounded-lg border text-sm ${layout === l.id ? "border-primary bg-primary-soft" : "border-border"}`}>{l.label}</button>)}
            </div>
            <div><p className="mb-2 text-sm">How see-through: {opacity}%</p><Slider min={10} max={90} step={5} value={[opacity]} onValueChange={(v) => setOpacity(v[0])} /></div>
            <label className="flex items-center gap-3 text-sm">Text color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded border border-border" /></label>
            <div className="flex gap-2">
              <Button variant="secondary" className="h-11 flex-1" disabled={!img} onClick={download}><Download className="mr-2 h-4 w-4" /> Download</Button>
              <Button variant="outline" className="h-11 flex-1" disabled={!img} onClick={save}>Save to Stash</Button>
            </div>
          </div>
          <div className="flex min-h-96 items-center justify-center rounded-xl border border-border bg-card p-4">
            {img ? <canvas ref={canvas} className="max-h-[600px] max-w-full rounded-lg object-contain" /> : <p className="text-muted-foreground">Your protected image will appear here.</p>}
          </div>
        </TabsContent>
        <TabsContent value="team" className="space-y-6">
          {canManage && (
            <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-5">
              <Input type="email" className="max-w-xs" placeholder="Their account email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} maxLength={200} />
              <select className={sel} value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })}><option value="member">Member</option><option value="admin">Admin</option></select>
              <Button variant="secondary" className="h-11" onClick={invite}>Add to team</Button>
              <p className="w-full text-xs text-muted-foreground">Members can add and edit things. Admins can also delete things and manage the team. They need a Branded By account first.</p>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="p-3">Person</th><th className="p-3">Access</th><th /></tr></thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t border-border">
                    <td className="p-3">{m.email ?? "Unknown"}{m.user_id === me ? " (you)" : ""}</td>
                    <td className="p-3">
                      {canManage && m.role !== "owner" && m.user_id !== me
                        ? <select className={sel} value={m.role} onChange={(e) => changeRole(m, e.target.value)}><option value="member">Member</option><option value="admin">Admin</option></select>
                        : <span className="capitalize">{m.role}</span>}
                    </td>
                    <td className="p-3 text-right">{canManage && m.role !== "owner" && m.user_id !== me && <Button variant="outline" size="sm" className="h-10" onClick={() => removeMember(m)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>}</td>
                  </tr>
                ))}
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
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Guard</p>
        <h1 className="mb-8 mt-2 text-4xl">Brand protection</h1>
        {body()}
      </main>
      <BrandedByFooter />
    </div>
  );
}
