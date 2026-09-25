import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllEntries, newId, saveEntry, type PlannerEntry } from "@/lib/db";
import { PAGE_TYPES } from "@/lib/pageTypes";
import { calendarYear, entryYear, getActiveYear, setActiveYear } from "@/lib/plannerYear";
import { loadSettings, saveSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

/** Pages that usually carry over to a new year. */
const CARRY_OVER = new Set([
  "contacts", "emergency-contacts", "important-dates", "gift-tracker", "medications", "medication-tracker",
  "doctors", "recipes", "household-info", "debt-tracker", "savings-goals", "my-goals", "goals",
]);

export default function YearRollover() {
  const navigate = useNavigate();
  const toYear = Math.max(calendarYear(), getActiveYear());
  const [fromYear, setFromYear] = useState(toYear - 1);
  const [all, setAll] = useState<PlannerEntry[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAllEntries().then((list) => {
      const valid = new Set(PAGE_TYPES.map((p) => p.id));
      const items = list.filter((e) => valid.has(e.pageType) && !e.values?.__deleted);
      setAll(items);
      const years = [...new Set(items.map(entryYear))].filter((y) => y < toYear).sort((a, b) => b - a);
      if (years.length && !years.includes(toYear - 1)) setFromYear(years[0]);
    });
  }, [toYear]);

  const groups = useMemo(() => {
    const m = new Map<string, PlannerEntry[]>();
    for (const e of all) if (entryYear(e) === fromYear) m.set(e.pageType, [...(m.get(e.pageType) ?? []), e]);
    return PAGE_TYPES.filter((p) => m.has(p.id)).map((p) => ({ page: p, entries: m.get(p.id)! }));
  }, [all, fromYear]);

  useEffect(() => {
    setPicked(new Set(groups.filter((g) => CARRY_OVER.has(g.page.id)).map((g) => g.page.id)));
  }, [groups]);

  const finish = async (move: boolean) => {
    setBusy(true);
    try {
      let copied = 0;
      if (move) {
        const now = Date.now();
        for (const g of groups) {
          if (!picked.has(g.page.id)) continue;
          for (const e of g.entries) {
            const values: Record<string, import("@/lib/db").FieldValue> = { ...e.values, __year: toYear };
            if (values.year != null && String(values.year).trim() !== "") values.year = String(toYear);
            await saveEntry({ ...e, id: newId(), values, createdAt: now, updatedAt: now });
            copied++;
          }
        }
      }
      const s = await loadSettings();
      await saveSettings({ rolloverDone: { ...(s.rolloverDone ?? {}), [String(toYear)]: true } });
      await setActiveYear(toYear);
      toast.success(move && copied ? `Moved ${copied} page${copied === 1 ? "" : "s"} into ${toYear}` : `Your ${toYear} planner is ready`);
      navigate("/app");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: string) =>
    setPicked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-xl mx-auto bg-card rounded-2xl shadow-lg p-6 space-y-5">
        <div>
          <h1 className="font-display text-3xl">Start your {toYear} planner</h1>
          <p className="text-muted-foreground mt-2">
            Your {toYear} pages start fresh with this year's dates. Choose any pages from {fromYear} to copy over. Your {fromYear} planner stays exactly as it is, and you can open it any time from the year switcher on Home.
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">There are no pages from {fromYear} to move.</p>
        ) : (
          <>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="min-h-11" onClick={() => setPicked(new Set(groups.map((g) => g.page.id)))}>Select all</Button>
              <Button variant="outline" size="sm" className="min-h-11" onClick={() => setPicked(new Set())}>Clear all</Button>
            </div>
            <ul className="divide-y divide-border border border-border rounded-xl">
              {groups.map((g) => (
                <li key={g.page.id}>
                  <label className="flex items-center gap-3 px-4 min-h-12 cursor-pointer touch-manipulation">
                    <Checkbox checked={picked.has(g.page.id)} onCheckedChange={() => toggle(g.page.id)} />
                    <span className="flex-1">{g.page.name}</span>
                    <span className="text-sm text-muted-foreground">{g.entries.length}</span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button className="min-h-11 flex-1" disabled={busy || picked.size === 0} onClick={() => finish(true)}>
            Move selected
          </Button>
          <Button variant="outline" className="min-h-11 flex-1" disabled={busy} onClick={() => finish(false)}>
            Start fresh
          </Button>
        </div>
      </div>
    </div>
  );
}
