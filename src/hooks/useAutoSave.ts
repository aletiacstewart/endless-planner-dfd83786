import { useEffect, useRef, useState } from "react";
import { saveEntry, type PlannerEntry } from "@/lib/db";
import { syncFromIndividual, syncLinkedEntries } from "@/lib/linkedEntries";

type SaveState = "idle" | "saving" | "saved";

const REVERSE_SYNC_TYPES = new Set([
  "daily-tracker",
  "daily-spend",
  "blood-sugar-tracker",
  "blood-pressure-tracker",
  "oxygen-tracker",
  "self-care-checklist",
  "monthly-calendar",
  "cleaning-checklist",
  "yearly-calendar",
  "weekly-calendar",
  "yearly-habit-tracker",
  
  "workout-tracker",
  "medical-records",
  "weight-tracker",
  "measurement-tracker",
  "medications",
  "yearly-focus",
  "gratitude-log",
  "mood-journal",
  "sleep-tracker",
  "water-tracker",
  "daily-journal",
  "meal-planning",
  "notes",
  "brain-dump",
  "adhd-toolkit",
  "therapy-session",
  "important-dates",
  "gift-tracker",
  "symptom-tracker",
]);

export function useAutoSave(entry: PlannerEntry | null, debounceMs = 500) {
  const [state, setState] = useState<SaveState>("idle");
  const [linkedSummary, setLinkedSummary] = useState<string[]>([]);
  const timer = useRef<number | null>(null);
  const linkTimer = useRef<number | null>(null);
  const linking = useRef(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (!entry) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setState("saving");
    if (timer.current) window.clearTimeout(timer.current);
    // The page's own save stays fast; the cross-page fan-out (which touches
    // dozens of linked pages) runs on a longer, non-overlapping timer so
    // typing never waits on it.
    timer.current = window.setTimeout(async () => {
      const next = { ...entry, updatedAt: Date.now() };
      await saveEntry(next);
      setState("saved");
      window.setTimeout(() => setState("idle"), 1200);

      const needsLinking =
        next.pageType === "complete-tracker" || REVERSE_SYNC_TYPES.has(next.pageType);
      if (!needsLinking) return;
      if (linkTimer.current) window.clearTimeout(linkTimer.current);
      linkTimer.current = window.setTimeout(async () => {
        if (linking.current) {
          // A run is in flight; retry shortly so the last edit still fans out.
          linkTimer.current = window.setTimeout(() => {
            void runLinking(next);
          }, 600);
          return;
        }
        void runLinking(next);
      }, 900);
    }, debounceMs);

    async function runLinking(next: PlannerEntry) {
      linking.current = true;
      try {
        const synced =
          next.pageType === "complete-tracker"
            ? await syncLinkedEntries(next)
            : await syncFromIndividual(next);
        setLinkedSummary(synced);
      } finally {
        linking.current = false;
      }
    }

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry?.values, entry?.title]);

  return { state, linkedSummary } as const;
}

