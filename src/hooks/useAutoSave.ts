import { useEffect, useRef, useState } from "react";
import { saveEntry, type PlannerEntry } from "@/lib/db";
import { syncFromIndividual, syncLinkedEntries } from "@/lib/linkedEntries";

type SaveState = "idle" | "saving" | "saved";

const REVERSE_SYNC_TYPES = new Set([
  "daily-tracker",
  "blood-sugar-tracker",
  "blood-pressure-tracker",
  "oxygen-tracker",
  "self-care-checklist",
  "monthly-calendar",
  "cleaning-checklist",
  "yearly-calendar",
  "weekly-calendar",
  "habit-tracker",
  "yearly-habit-tracker",
]);

export function useAutoSave(entry: PlannerEntry | null, debounceMs = 500) {
  const [state, setState] = useState<SaveState>("idle");
  const [linkedSummary, setLinkedSummary] = useState<string[]>([]);
  const timer = useRef<number | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!entry) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setState("saving");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const next = { ...entry, updatedAt: Date.now() };
      await saveEntry(next);
      if (next.pageType === "complete-tracker") {
        const synced = await syncLinkedEntries(next);
        setLinkedSummary(synced);
      } else if (REVERSE_SYNC_TYPES.has(next.pageType)) {
        const synced = await syncFromIndividual(next);
        setLinkedSummary(synced);
      }
      setState("saved");
      window.setTimeout(() => setState("idle"), 1200);
    }, debounceMs);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.values, entry?.title]);

  return { state, linkedSummary } as const;
}

