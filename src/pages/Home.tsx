import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { useEffect, useState } from "react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { listEntries, exportAll, importAll, type PlannerEntry } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";
import { getCover } from "@/data/covers";
import { CoverImage } from "@/components/cover/CoverImage";

export default function Home() {
  const { settings } = useUserSettings();
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
      } catch {
        toast.error("Couldn't read backup file");
      }
    };
    reader.readAsText(file);
  };

  const cover = getCover(settings?.coverId);
  const plannerName = settings?.plannerName || "My Planner";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      {/* Cover hero — show the full artwork, no aggressive cropping. */}
      <div className="relative w-full">
        {/* Settings cog floats over the cover, top-right. */}
        <Link
          to="/settings"
          aria-label="Settings"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors"
        >
          <Icons.Settings className="w-5 h-5" />
        </Link>

        {/* Square hero — every cover is normalized to 1:1 so it shows
            fully on every device without cropping. Capped width on desktop
            so it doesn't dominate the page. */}
        <div className="relative mx-auto w-full aspect-square max-w-md overflow-hidden rounded-2xl shadow-xl">
          <CoverImage
            cover={cover}
            plannerName={plannerName}
            ownerName={settings?.ownerName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Bottom gradient — strong enough to keep the title readable on
              any cover, but transparent at the top so artwork breathes. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white drop-shadow-lg">
              {plannerName}
            </h1>
            {settings?.ownerName && (
              <p className="font-script text-xl text-white/90 drop-shadow">
                {settings.ownerName}
              </p>
            )}
          </div>
        </div>
      </div>


      <main className="px-5 pt-6 space-y-6">
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
