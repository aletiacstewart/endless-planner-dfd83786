import { useEffect, useRef, useState } from "react";
import { saveEntry, type PlannerEntry } from "@/lib/db";
import { syncLinkedEntries } from "@/lib/linkedEntries";

type SaveState = "idle" | "saving" | "saved";

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
