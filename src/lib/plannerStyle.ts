import { getAllEntries, saveEntry, type FieldValue } from "./db";
import { getMeta, hasOwnStyle, stripEntryStyle, type PlannerStyle } from "./entryMeta";

export type ApplyMode = "all" | "untouched";

/**
 * Clear per-page style overrides so the planner-wide look shows through.
 * "all" resets every page; "untouched" leaves pages the user styled by hand.
 * Stickers are never touched.
 */
export async function applyPlannerStyle(mode: ApplyMode): Promise<number> {
  const entries = await getAllEntries();
  let changed = 0;
  for (const entry of entries) {
    const meta = getMeta(entry);
    if (mode === "untouched" && hasOwnStyle(meta)) continue;
    if (!hasOwnStyle(meta)) continue; // nothing to clear
    const next = stripEntryStyle(meta);
    await saveEntry({
      ...entry,
      updatedAt: entry.updatedAt,
      values: { ...entry.values, __meta: next as unknown as FieldValue },
    });
    changed += 1;
  }
  return changed;
}

/** Everything in a planner style is optional — is anything actually set? */
export function isStyleEmpty(style: PlannerStyle | undefined): boolean {
  if (!style) return true;
  const t = style.typography;
  const typoSet =
    !!t &&
    (["title", "subtitle", "body"] as const).some((g) => {
      const spec = t[g];
      return !!spec && (spec.font || spec.size || spec.color);
    });
  return !typoSet && !style.background && !style.sectionTint && !style.accentWidth && !style.density && !style.color;
}
