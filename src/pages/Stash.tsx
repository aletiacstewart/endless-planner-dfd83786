import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Archive, Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { Button } from "@/components/ui/button";
import { STASH_CATEGORIES, STASH_MAX_BYTES, uploadToStash } from "@/lib/stash";
import { toast } from "sonner";

interface Asset { id: string; title: string; file_url: string; size_bytes: number; category: string; created_at: string; url?: string }

const fmt = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const isImg = (p: string) => /\.(png|jpe?g|webp|gif|svg)$/i.test(p);

export default function Stash() {
  const { signedIn, activeId } = useMyOrgs();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [category, setCategory] = useState<string>("general");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!activeId) return;
    const { data } = await supabase.from("stash_assets").select("*").eq("org_id", activeId).order("created_at", { ascending: false });
    const list = (data ?? []) as Asset[];
    if (list.length) {
      const { data: signed } = await supabase.storage.from("stash").createSignedUrls(list.map((a) => a.file_url), 3600);
      list.forEach((a, i) => (a.url = signed?.[i]?.signedUrl));
    }
    setAssets(list);
  }, [activeId]);
  useEffect(() => { load(); }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length || !activeId) return;
    setBusy(true);
    for (const f of Array.from(files)) {
      if (f.size > STASH_MAX_BYTES) { toast.error(`${f.name} is over 25 MB.`); continue; }
      try { await uploadToStash(activeId, f, f.name.replace(/\.[^.]+$/, ""), category); }
      catch { toast.error(`${f.name} couldn't be saved.`); }
    }
    setBusy(false);
    toast.success("Saved to Stash");
    load();
  };

  const remove = async (a: Asset) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    const { error } = await supabase.from("stash_assets").delete().eq("id", a.id);
    if (error) return toast.error("Only owners and admins can delete files.");
    await supabase.storage.from("stash").remove([a.file_url]);
    load();
  };

  const shown = filter === "all" ? assets : assets.filter((a) => a.category === filter);

  const body = () => {
    if (signedIn === null) return null;
    if (!signedIn || !activeId) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Archive className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-muted-foreground">{!signedIn ? "Sign in to use Stash." : "Create your business on the Hub first."}</p>
          <Button asChild className="mt-6"><Link to={!signedIn ? "/auth" : "/hub"}>{!signedIn ? "Sign in" : "Go to Hub"}</Link></Button>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-11 rounded-md border border-border bg-background px-3 capitalize">
            {STASH_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button asChild variant="secondary" className="h-11">
            <label className="cursor-pointer">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Upload files
              <input type="file" multiple className="hidden" disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </label>
          </Button>
          <span className="text-xs text-muted-foreground">Up to 25 MB each · private to your team</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", ...STASH_CATEGORIES].map((c) => (
            <button key={c} onClick={() => setFilter(c)} className={`min-h-10 rounded-full border px-4 text-sm capitalize ${filter === c ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>{c}</button>
          ))}
        </div>
        {shown.length === 0 ? (
          <p className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">No files here yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((a) => (
              <div key={a.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {a.url && isImg(a.file_url) ? <img src={a.url} alt={a.title} className="h-full w-full object-contain" /> : <FileText className="h-10 w-10 text-primary" />}
                </div>
                <div className="p-3">
                  <p className="truncate font-medium" title={a.title}>{a.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">{a.category} · {fmt(a.size_bytes)}</p>
                  <div className="mt-2 flex gap-2">
                    {a.url && <Button asChild size="sm" variant="outline" className="h-10 flex-1"><a href={a.url} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a></Button>}
                    <Button size="sm" variant="outline" className="h-10" onClick={() => remove(a)} aria-label="Delete"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="theme-brandedby min-h-screen bg-muted text-foreground">
      <BrandedByHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Stash</p>
        <h1 className="mb-8 mt-2 text-4xl">Brand file vault</h1>
        {body()}
      </main>
      <BrandedByFooter />
    </div>
  );
}
