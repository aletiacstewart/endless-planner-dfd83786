import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntryPersonalization } from "@/components/entry/EntryPersonalization";
import { StylePreview } from "@/components/entry/StylePreview";
import { useUserSettings } from "@/hooks/useUserSettings";
import { applyPlannerStyle, isStyleEmpty, type ApplyMode } from "@/lib/plannerStyle";
import type { EntryMeta, PlannerStyle, TypoSpec } from "@/lib/entryMeta";

/**
 * Planner-wide look, edited on the second page of the open planner. Changes are
 * a draft until "Apply to all pages" is pressed, which asks whether pages the
 * user styled by hand should be overwritten too.
 */
export function PlannerStyleCard() {
  const { settings, update } = useUserSettings();
  const saved = settings?.pageStyle;
  const [draft, setDraft] = useState<PlannerStyle>({});
  const [askOpen, setAskOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Seed the draft from the saved look once it has loaded.
  useEffect(() => {
    if (dirty) return;
    setDraft(saved ?? {});
  }, [saved, dirty]);

  const onChange = (patch: Partial<EntryMeta>) => {
    setDirty(true);
    setDraft((d) => ({ ...d, ...(patch as Partial<PlannerStyle>) }));
  };

  const onTypography = (group: "title" | "subtitle" | "body", patch: Partial<TypoSpec>) => {
    setDirty(true);
    setDraft((d) => ({
      ...d,
      typography: { ...(d.typography ?? {}), [group]: { ...(d.typography?.[group] ?? {}), ...patch } },
    }));
  };

  const resetDraft = () => {
    setDirty(true);
    setDraft({});
  };

  const apply = async (mode: ApplyMode) => {
    setBusy(true);
    try {
      await update({ pageStyle: draft, pageStyleAppliedAt: Date.now() });
      const changed = await applyPlannerStyle(mode);
      setDirty(false);
      setAskOpen(false);
      toast.success(
        mode === "all"
          ? `Look applied to every page${changed ? ` (${changed} refreshed)` : ""}`
          : "Look applied — pages you styled yourself were left alone",
      );
    } catch {
      toast.error("Could not apply the look. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="planner-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg leading-tight">Planner style</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set the fonts, colours, paper and spacing for every page, then apply.
          </p>
        </div>
        {!dirty && !isStyleEmpty(saved) && (
          <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1 shrink-0">
            <Check className="w-3 h-3" /> In use
          </span>
        )}
      </div>

      <div className="min-w-0">
        <EntryPersonalization
          meta={draft as EntryMeta}
          onChange={onChange}
          onTypography={onTypography}
          onReset={resetDraft}
          hideStickers
          resetLabel="Clear"
        />
      </div>

      <div className="mt-4 max-w-[13rem]">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Preview</p>
        <StylePreview meta={draft as EntryMeta} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => setAskOpen(true)} disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
          Apply to all pages
        </Button>
        {dirty && (
          <Button size="sm" variant="ghost" onClick={() => { setDirty(false); setDraft(saved ?? {}); }}>
            Discard changes
          </Button>
        )}
      </div>

      <Dialog open={askOpen} onOpenChange={setAskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apply this look where?</DialogTitle>
            <DialogDescription>
              Some pages may have been styled on their own. Choose whether those keep their look.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => apply("all")}
              disabled={busy}
              className="w-full text-left rounded-lg border border-border p-3 hover:border-primary hover:bg-primary/5"
            >
              <p className="text-sm font-medium">All pages</p>
              <p className="text-xs text-muted-foreground">
                Every page matches this look, including ones you styled yourself.
              </p>
            </button>
            <button
              type="button"
              onClick={() => apply("untouched")}
              disabled={busy}
              className="w-full text-left rounded-lg border border-border p-3 hover:border-primary hover:bg-primary/5"
            >
              <p className="text-sm font-medium">Only pages I haven't styled myself</p>
              <p className="text-xs text-muted-foreground">
                Pages you customised keep their own look.
              </p>
            </button>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setAskOpen(false)} disabled={busy}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
