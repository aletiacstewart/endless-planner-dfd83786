import { useCallback, useEffect, useRef, useState } from "react";
import type { PlannerEntry } from "@/lib/db";

const LIMIT = 50;
const COALESCE_MS = 600;

/**
 * In-memory undo/redo for the entry being edited.
 *
 * Snapshots are coalesced so typing a sentence is one undo step, not one per
 * keystroke. History resets whenever a different entry is opened.
 */
export function useEntryHistory(
  entry: PlannerEntry | null,
  apply: (e: PlannerEntry) => void,
) {
  const past = useRef<PlannerEntry[]>([]);
  const future = useRef<PlannerEntry[]>([]);
  const lastPush = useRef(0);
  const currentId = useRef<string | null>(null);
  const suppress = useRef(false);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  // Reset when switching entries.
  useEffect(() => {
    if (!entry) return;
    if (currentId.current !== entry.id) {
      currentId.current = entry.id;
      past.current = [];
      future.current = [];
      lastPush.current = 0;
      rerender();
    }
  }, [entry?.id]);

  /** Record the pre-change snapshot, then apply the new entry. */
  const commit = useCallback(
    (prev: PlannerEntry, next: PlannerEntry) => {
      const now = Date.now();
      if (now - lastPush.current > COALESCE_MS) {
        past.current = [...past.current, prev].slice(-LIMIT);
        future.current = [];
        rerender();
      }
      lastPush.current = now;
      apply(next);
    },
    [apply],
  );

  const undo = useCallback(() => {
    if (!entry || past.current.length === 0) return;
    const prev = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [entry, ...future.current].slice(0, LIMIT);
    suppress.current = true;
    lastPush.current = 0;
    apply(prev);
    rerender();
  }, [entry, apply]);

  const redo = useCallback(() => {
    if (!entry || future.current.length === 0) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, entry].slice(-LIMIT);
    suppress.current = true;
    lastPush.current = 0;
    apply(next);
    rerender();
  }, [entry, apply]);

  // Keyboard shortcuts (ignored while typing modifier-free in inputs).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return {
    commit,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
