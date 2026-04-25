import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { listEntries, exportAll, importAll, type PlannerEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<PlannerEntry[]>([]);

  useEffect(() => {
    (async () => {
      const all = await listEntries();
      const c: Record<string, number> = {};
      all.forEach((e) => (c[e.pageType] = (c[e.pageType] || 0) + 1));
      setCounts(c);
      setRecent(all.slice(0, 4));
    })();
  }, []);

  const handleExport = async () => {
    const json = await exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const n = await importAll(String(reader.result), "merge");
        toast.success(`Restored ${n} entries`);
        location.reload();
      } catch (e) {
        toast.error("Couldn't read backup file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      <header className="px-5 pt-10 pb-6">
        <p className="font-script text-2xl text-primary">change of life</p>
        <h1 className="section-title">Planner & Journal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your private space — saved on this device.
        </p>
      </header>

      <main className="px-5 space-y-6">
        {recent.length > 0 && (
          <section>
            <h2 className="font-display text-xl mb-3">Recent entries</h2>
            <div className="space-y-2">
              {recent.map((e) => {
                const pt = PAGE_TYPES.find((p) => p.id === e.pageType);
                return (
                  <Link
                    key={e.id}
                    to={`/entry/${e.id}`}
                    className="planner-card flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {pt?.summary?.(e.values) || pt?.name || "Entry"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {pt?.name} · {new Date(e.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Icons.ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-xl mb-3">Sections</h2>
          <div className="grid grid-cols-2 gap-3">
            {PAGE_TYPES.map((pt) => {
              const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pt.icon] ?? Icons.FileText;
              return (
                <Link
                  key={pt.id}
                  to={`/section/${pt.id}`}
                  className="planner-card flex flex-col gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-medium text-sm">{pt.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {counts[pt.id] || 0} {counts[pt.id] === 1 ? "entry" : "entries"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="planner-card">
          <h2 className="font-display text-lg mb-3">Backup & restore</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Icons.Download className="w-4 h-4 mr-1" /> Export backup
            </Button>
            <label>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              />
              <Button variant="outline" size="sm" asChild>
                <span><Icons.Upload className="w-4 h-4 mr-1" /> Restore</span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Add this app to your home screen: tap Share on iPhone or the menu on Android.
          </p>
        </section>
      </main>
    </div>
  );
}
