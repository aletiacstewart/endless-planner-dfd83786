import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ImageIcon, Download, Upload, Cloud, CloudOff, LogOut, RefreshCw, CreditCard, Loader2, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverImage } from "@/components/cover/CoverImage";
import { CoverPicker } from "@/components/cover/CoverPicker";
import { CalendarSyncCard } from "@/components/calendar/CalendarSyncCard";

import { useUserSettings } from "@/hooks/useUserSettings";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { getCover } from "@/data/covers";
import { exportAll, importAll } from "@/lib/db";
import { getLastSyncAt, signOut as syncSignOut } from "@/lib/sync";
import { getStripeEnvironment } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { settings, update } = useUserSettings();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [plannerName, setPlannerName] = useState(settings?.plannerName ?? "");
  const [ownerName, setOwnerName] = useState(settings?.ownerName ?? "");

  if (!settings) return null;

  const cover = getCover(settings.coverId);

  const saveText = async () => {
    await update({ plannerName: plannerName.trim() || "My Planner", ownerName: ownerName.trim() });
    toast.success("Saved");
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="section-title">Settings</h1>
      </header>

      <main className="px-5 space-y-5">
        <section className="planner-card">
          <h2 className="font-display text-xl mb-1">Cover</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Your cover sets the mood — the whole app re-themes to match.
          </p>
          <button
            onClick={() => setPickerOpen(true)}
            className="w-full aspect-[16/10] rounded-xl overflow-hidden border border-border relative group"
          >
            <CoverImage
              cover={cover}
              plannerName={settings.plannerName}
              ownerName={settings.ownerName}
              className="absolute inset-0"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-card/90 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Change cover
              </div>
            </div>
          </button>
          <p className="text-xs text-muted-foreground mt-2 text-center">{cover.name}</p>
        </section>

        <section className="planner-card space-y-4">
          <h2 className="font-display text-xl">Names</h2>
          <label className="block">
            <span className="field-label block mb-1.5">Planner name</span>
            <Input
              value={plannerName}
              onChange={(e) => setPlannerName(e.target.value)}
              maxLength={40}
            />
          </label>
          <label className="block">
            <span className="field-label block mb-1.5">Your name</span>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Shown on personalised covers"
              maxLength={40}
            />
          </label>
          <Button onClick={saveText} className="w-full">Save</Button>
        </section>

        <AccountSection />

        <SubscriptionSection />

        <CalendarSyncCard />

        <BackupSection />


        <Link to="/app" className="block text-center text-sm text-muted-foreground underline pt-2">
          Back to planner
        </Link>
      </main>

      <CoverPicker
        open={pickerOpen}
        selectedId={settings.coverId}
        plannerName={settings.plannerName}
        ownerName={settings.ownerName}
        onSelect={(id) => update({ coverId: id })}
        onClose={() => setPickerOpen(false)}
        onConfirm={() => setPickerOpen(false)}
        confirmLabel="Done"
      />
    </div>
  );
}

function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);

  const onPdf = async () => {
    setBusy(true);
    setPdfStatus("Getting started…");
    try {
      const { exportPlannerPdf } = await import("@/lib/plannerPdf");
      const result = await exportPlannerPdf((done, total, label) => {
        setPdfStatus(`${label} — ${Math.min(done, total)} of ${total}`);
      });
      import("@/lib/adminEvents").then((m) => m.logAdminEvent("pdf_export", { count: result.entries })).catch(() => {});
      if (result.entries === 0) {
        toast.info("Your planner is still empty — the PDF has just your cover.");
      } else if (result.missingPhotos > 0) {
        toast.success(
          `PDF ready — ${result.pages} pages. ${result.missingPhotos} photo(s) couldn't be included; sign in on this device to add them.`,
        );
      } else {
        toast.success(`PDF ready — ${result.pages} pages`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't build your PDF");
    } finally {
      setBusy(false);
      setPdfStatus(null);
    }
  };

  const onExport = async () => {
    setBusy(true);
    try {
      const json = await exportAll();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded");
    } catch (e) {
      toast.error("Couldn't export your data");
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const count = await importAll(text, "merge");
      toast.success(`Restored ${count} entries`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't restore that file");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="planner-card space-y-3">
      <h2 className="font-display text-xl">Backup & Restore</h2>
      <p className="text-xs text-muted-foreground">
        Your data lives only on this device. Export a backup file you can save anywhere — then restore it on a new phone, tablet, or computer.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onExport} disabled={busy} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export backup
        </Button>
        <Button onClick={() => fileRef.current?.click()} disabled={busy} variant="outline">
          <Upload className="w-4 h-4 mr-2" /> Restore from file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImport(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        <p className="text-xs text-muted-foreground">
          Want a printable copy? This makes one PDF book of your whole planner — cover, every page you've filled in, your artwork, photos and sketches.
        </p>
        <Button onClick={onPdf} disabled={busy} className="w-full">
          {pdfStatus ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
          {pdfStatus ? "Building your PDF…" : "Export full planner (PDF)"}
        </Button>
        {pdfStatus && <p className="text-xs text-muted-foreground text-center">{pdfStatus}</p>}
      </div>
    </section>
  );
}

function AccountSection() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getLastSyncAt().then(setLastSync);
    const t = setInterval(() => getLastSyncAt().then(setLastSync), 5000);
    return () => clearInterval(t);
  }, [user?.id]);

  const formatAgo = (ts: number) => {
    const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    if (mins < 1) return "just now";
    if (mins === 1) return "1 minute ago";
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs === 1) return "1 hour ago";
    if (hrs < 24) return `${hrs} hours ago`;
    return new Date(ts).toLocaleDateString();
  };

  if (loading) return null;

  if (!user) {
    return (
      <section className="planner-card space-y-3">
        <div className="flex items-center gap-2">
          <CloudOff className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-display text-xl">Sync across devices</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Sign in to mirror your planner — entries, settings, and unlocked packs — to every device you install it on.
        </p>
        <Button onClick={() => navigate("/auth")} className="w-full">
          <Cloud className="w-4 h-4 mr-2" /> Sign in to sync
        </Button>
      </section>
    );
  }

  return (
    <section className="planner-card space-y-3">
      <div className="flex items-center gap-2">
        <Cloud className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl">Sync</h2>
      </div>
      <div className="text-sm">
        <p className="text-muted-foreground">Signed in as</p>
        <p className="font-medium">{user.email}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {lastSync ? `Last synced ${formatAgo(lastSync)}` : "Syncing…"}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const m = await import("@/lib/sync");
              await m.reconcileNow();
              setLastSync(await m.getLastSyncAt());
              toast.success("Synced");
            } finally {
              setBusy(false);
            }
          }}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${busy ? "animate-spin" : ""}`} /> Sync now
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await syncSignOut();
            toast.success("Signed out");
            navigate("/auth", { replace: true });
          }}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>
    </section>
  );
}

function SubscriptionSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, isActive, loading } = useSubscription();
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  if (loading) return null;

  const openPortal = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-portal-session", {
        body: {
          returnUrl: window.location.origin + "/settings",
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.url) throw new Error(error?.message || "Couldn't open billing portal");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open billing portal");
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  if (!subscription) {
    return (
      <section className="planner-card space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-display text-xl">Planner membership</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Your $21.97/month membership keeps the planner open, backed up in the cloud, synced on every device and connected to your calendar.
        </p>
        <Button className="w-full" onClick={() => navigate("/subscribe")}>
          Start my membership — $21.97/month
        </Button>
      </section>
    );
  }

  const statusLabel: Record<string, string> = {
    active: "Active",
    trialing: "Trial",
    past_due: "Payment past due",
    canceled: "Canceled",
    incomplete: "Incomplete",
    unpaid: "Unpaid",
    paused: "Paused",
  };

  return (
    <section className="planner-card space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl">Planner membership</h2>
      </div>
      <div className="text-sm space-y-1">
        <p>
          Status:{" "}
          <span className={`font-medium ${isActive ? "text-primary" : "text-destructive"}`}>
            {statusLabel[subscription.status] ?? subscription.status}
          </span>
        </p>
        {subscription.cancel_at_period_end && subscription.current_period_end && (
          <p className="text-xs text-muted-foreground">
            Cancels on {formatDate(subscription.current_period_end)}
          </p>
        )}
        {!subscription.cancel_at_period_end && subscription.current_period_end && isActive && (
          <p className="text-xs text-muted-foreground">
            Renews {formatDate(subscription.current_period_end)}
          </p>
        )}
        {subscription.status === "past_due" && (
          <p className="text-xs text-destructive">
            Update your card in the billing portal to keep your planner open.
          </p>
        )}
      </div>
      <Button variant="outline" className="w-full" onClick={openPortal} disabled={busy}>
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
        Manage subscription
      </Button>
      {!isActive && (
        <Button className="w-full" onClick={() => navigate("/subscribe")}>
          Resubscribe
        </Button>
      )}
    </section>
  );
}
