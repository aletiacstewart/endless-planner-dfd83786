import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Download, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BrandedByHeader, BrandedByFooter } from "@/components/brandedby/BrandedByHeader";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { uploadToStash } from "@/lib/stash";

const STYLES = [
  { id: "studio", label: "Studio", hint: "Clean backdrop, soft light" },
  { id: "lifestyle", label: "Lifestyle", hint: "Real-life setting" },
  { id: "flatlay", label: "Flat lay", hint: "Overhead with props" },
  { id: "luxury", label: "Luxury", hint: "Marble & highlights" },
  { id: "market", label: "Pop-up market", hint: "Booth table outdoors" },
] as const;
const SHAPES = [
  { id: "square", label: "Square · posts" },
  { id: "portrait", label: "Tall · stories & pins" },
  { id: "landscape", label: "Wide · banners & web" },
] as const;

const MAX_BYTES = 10 * 1024 * 1024;

export default function Snap() {
  const { orgs, signedIn, activeId } = useMyOrgs();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<(typeof STYLES)[number]["id"]>("studio");
  const [shape, setShape] = useState<(typeof SHAPES)[number]["id"]>("square");
  const [brand, setBrand] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) return toast.error("Please choose a JPG, PNG or WEBP photo.");
    if (f.size > MAX_BYTES) return toast.error("Please choose a photo under 10 MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const create = async () => {
    if (!file || !activeId) return;
    setBusy(true);
    setResult(null);
    const buf = new Uint8Array(await file.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    const { data, error } = await supabase.functions.invoke("snap-product-photo", {
      body: { orgId: activeId, imageBase64: btoa(bin), mimeType: file.type, style, shape, useBrandColors: brand, notes: notes.trim() || undefined },
    });
    setBusy(false);
    if (error || !data?.imageBase64) {
      let msg = "The photo couldn't be created. Please try again.";
      try { msg = (await (error as { context?: Response })?.context?.json())?.error ?? data?.error ?? msg; } catch { /* keep default */ }
      return toast.error(msg);
    }
    setResult(`data:image/png;base64,${data.imageBase64}`);
  };

  const saveToStash = async () => {
    if (!result || !activeId) return;
    try {
      const blob = await (await fetch(result)).blob();
      await uploadToStash(activeId, new File([blob], `snap-${style}.png`, { type: "image/png" }), `Snap ${style} photo`, "photos");
      toast.success("Saved to Stash");
    } catch { toast.error("Couldn't save to Stash."); }
  };

  const body = () => {
    if (signedIn === null) return null;
    if (!signedIn || !activeId) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Camera className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-4 text-muted-foreground">{!signedIn ? "Sign in to use Snap." : "Create your business on the Hub first."}</p>
          <Button asChild className="mt-6"><Link to={!signedIn ? "/auth" : "/hub"}>{!signedIn ? "Sign in" : "Go to Hub"}</Link></Button>
        </div>
      );
    }
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6 rounded-xl border border-border bg-card p-6">
          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted p-4 text-center hover:border-primary">
            {preview ? <img src={preview} alt="Your product" className="max-h-64 rounded object-contain" /> : (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <span className="mt-3 font-medium">Upload a product photo</span>
                <span className="text-xs text-muted-foreground">A phone picture is fine · JPG, PNG or WEBP up to 10 MB</span>
              </>
            )}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
          </label>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Style</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STYLES.map((s) => (
                <button key={s.id} onClick={() => setStyle(s.id)} className={`min-h-16 rounded-lg border p-3 text-left text-sm ${style === s.id ? "border-primary bg-primary-soft" : "border-border"}`}>
                  <span className="block font-semibold">{s.label}</span>
                  <span className="text-xs text-muted-foreground">{s.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Size</p>
            <div className="flex flex-wrap gap-2">
              {SHAPES.map((s) => (
                <Button key={s.id} variant={shape === s.id ? "default" : "outline"} className="h-11" onClick={() => setShape(s.id)}>{s.label}</Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="brand" checked={brand} onCheckedChange={setBrand} />
            <Label htmlFor="brand">Use my brand colors{orgs.length ? "" : ""}</Label>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} placeholder="Anything else? e.g. add fresh flowers, autumn feel" />
          <Button variant="secondary" className="h-12 w-full uppercase tracking-[0.15em]" disabled={!file || busy} onClick={create}>
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating — about a minute</> : "Create photo"}
          </Button>
        </div>

        <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-border bg-card p-6">
          {result ? (
            <>
              <img src={result} alt="Your new product photo" className="max-h-[560px] rounded-lg object-contain shadow-[var(--shadow-card)]" />
              <div className="mt-4 flex gap-3">
                <Button asChild className="h-11"><a href={result} download={`snap-${style}.png`}><Download className="mr-2 h-4 w-4" /> Download</a></Button>
                <Button variant="secondary" className="h-11" onClick={saveToStash}>Save to Stash</Button>
                <Button variant="outline" className="h-11" onClick={create} disabled={busy}>Try again</Button>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">{busy ? "Setting up your shot…" : "Your new photo will appear here."}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="theme-brandedby min-h-screen bg-muted text-foreground">
      <BrandedByHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Branded By Snap</p>
        <h1 className="mb-8 mt-2 text-4xl">AI product photo studio</h1>
        {body()}
      </main>
      <BrandedByFooter />
    </div>
  );
}
