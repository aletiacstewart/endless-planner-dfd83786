import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { listEntries, importAll, type PlannerEntry } from "@/lib/db";
import { downloadJson, downloadCsv, downloadXlsx, downloadPdf } from "@/lib/exporters";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/useUserSettings";
import { getCover } from "@/data/covers";
import { CoverImage } from "@/components/cover/CoverImage";

const LAST_BACKUP_KEY = "planner.lastBackupAt";
const BACKUP_DISMISS_KEY = "planner.backupReminderDismissedUntil";
const REMIND_AFTER_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export default function Home() {
  const { settings } = useUserSettings();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<PlannerEntry[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const backupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      const all = await listEntries();
      const c: Record<string, number> = {};
      all.forEach((e) => (c[e.pageType] = (c[e.pageType] || 0) + 1));
      setCounts(c);
      setRecent(all.slice(0, 4));
      setTotalEntries(all.length);

      // Decide whether to nudge user to back up.
      const last = Number(localStorage.getItem(LAST_BACKUP_KEY) || 0);
      const dismissUntil = Number(localStorage.getItem(BACKUP_DISMISS_KEY) || 0);
      const now = Date.now();
      const stale = !last || now - last > REMIND_AFTER_MS;
      if (all.length >= 5 && stale && now > dismissUntil) {
        setShowReminder(true);
      }
    })();
  }, []);

  const markBackedUp = () => {
    localStorage.setItem(LAST_BACKUP_KEY, String(Date.now()));
    setShowReminder(false);
  };

  const handleExport = async (
    fn: () => Promise<number>,
    label: string,
  ) => {
    try {
      const n = await fn();
      markBackedUp();
      toast.success(`Exported ${n} ${n === 1 ? "entry" : "entries"} as ${label}`);
    } catch (err) {
      console.error(err);
      toast.error(`Couldn't export as ${label}`);
    }
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

  const dismissReminder = () => {
    localStorage.setItem(BACKUP_DISMISS_KEY, String(Date.now() + DISMISS_FOR_MS));
    setShowReminder(false);
  };

  const scrollToBackup = () => {
    backupRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const cover = getCover(settings?.coverId);
  const plannerName = settings?.plannerName || "My Planner";

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--gradient-paper)" }}>
      {/* Cover hero — show the full artwork, no aggressive cropping. */}
      <div className="relative w-full">
        <Link
          to="/settings"
          aria-label="Settings"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-card/80 backdrop-blur flex items-center justify-center shadow-lg hover:bg-card transition-colors"
        >
          <Icons.Settings className="w-5 h-5" />
        </Link>

        <div className="relative mx-auto w-full aspect-square max-w-md overflow-hidden rounded-2xl shadow-xl">
          <CoverImage
            cover={cover}
            plannerName={plannerName}
            ownerName={settings?.ownerName}
            className="absolute inset-0 w-full h-full object-cover"
          />
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
        {showReminder && (
          <section className="rounded-xl border border-accent/40 bg-accent-soft/60 p-4">
            <div className="flex items-start gap-3">
              <Icons.AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Time to back up your planner
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  It's been a while since your last backup. Download a copy so you never
                  lose your entries — even if this app or service ever changes.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" onClick={scrollToBackup}>
                    Back up now
                  </Button>
                  <Button size="sm" variant="ghost" onClick={dismissReminder}>
                    Remind me later
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

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
          <div className="mb-4">
            <h2 className="font-display text-xl">Sections</h2>
            <p className="font-script text-base text-muted-foreground mt-1">
              "Small steps every day add up to a beautiful life. Begin where you are."
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...PAGE_TYPES]
              .sort((a, b) => {
                if (a.id === "complete-tracker") return -1;
                if (b.id === "complete-tracker") return 1;
                return 0;
              })
              .map((pt) => {
                const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pt.icon] ?? Icons.FileText;
                const isFeatured = pt.id === "complete-tracker";
                return (
                  <Link
                    key={pt.id}
                    to={`/section/${pt.id}`}
                    className={`planner-card flex flex-col gap-2 ${isFeatured ? "col-span-2 border-primary/40 bg-primary-soft/40" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm">{pt.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {pt.description}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-auto">
                      {counts[pt.id] || 0} {counts[pt.id] === 1 ? "entry" : "entries"}
                    </p>
                  </Link>
                );
              })}
          </div>
        </section>

        <section ref={backupRef} className="planner-card">
          <h2 className="font-display text-lg mb-1">Backup &amp; restore</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Download a complete copy of every entry, from your first day to today.
            {totalEntries > 0 && ` You currently have ${totalEntries} ${totalEntries === 1 ? "entry" : "entries"}.`}
          </p>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm">
                  <Icons.Download className="w-4 h-4 mr-1" /> Export backup
                  <Icons.ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Choose a format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport(downloadJson, "JSON")}>
                  <Icons.FileJson className="w-4 h-4 mr-2" /> JSON (full backup)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(downloadCsv, "CSV")}>
                  <Icons.FileSpreadsheet className="w-4 h-4 mr-2" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport(downloadXlsx, "Excel")}>
                  <Icons.Sheet className="w-4 h-4 mr-2" /> Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport(() => downloadPdf(plannerName), "PDF")}
                >
                  <Icons.FileText className="w-4 h-4 mr-2" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <label>
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              />
              <Button variant="outline" size="sm" asChild>
                <span><Icons.Upload className="w-4 h-4 mr-1" /> Restore (JSON)</span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Tip: JSON is the only format that can be restored back into the app. CSV,
            Excel, and PDF are for keeping your records readable in any other tool.
          </p>
        </section>
      </main>
    </div>
  );
}
