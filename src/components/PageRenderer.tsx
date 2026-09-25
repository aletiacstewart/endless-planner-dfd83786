import { Component, memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PageTypeDef, FieldValue, SectionDef } from "@/lib/pageTypes";
import { FieldRenderer } from "./FieldRenderer";
import { cn } from "@/lib/utils";
import { listDoctors } from "@/lib/doctors";
import { getCoverPageIcon } from "@/lib/coverIcons";
import { Button } from "@/components/ui/button";
import { ScanLine } from "lucide-react";
import { MedicalScannerDialog, type ScanMode } from "./medical/MedicalScannerDialog";
import { ContactImportBar } from "./contacts/ContactImportBar";

/** Camera scanning for medication labels and medical paperwork. */
function ScanBar({
  mode,
  values,
  onChange,
}: {
  mode: ScanMode;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="planner-card flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-display text-lg">
          {mode === "prescription" ? "Scan a prescription" : "Scan medical papers"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "prescription"
            ? "Photograph a bottle label and the medication details fill themselves in."
            : "Photograph a visit summary, lab report or appointment slip to fill this record in."}
        </p>
      </div>
      <Button type="button" onClick={() => setOpen(true)} className="touch-manipulation">
        <ScanLine className="mr-2 h-4 w-4" />
        {mode === "prescription" ? "Scan prescription bottle" : "Scan medical papers"}
      </Button>
      <MedicalScannerDialog mode={mode} open={open} onOpenChange={setOpen} values={values} onChange={onChange} />
    </div>
  );
}

/** "Notes for Dr. X" caption shown on sections whose fields are scoped by doctor. */
function ScopeHint({ section, values }: { section: SectionDef; values: Record<string, FieldValue> }) {
  const scopeKey = section.fields.find((f) => f.scopeByKey)?.scopeByKey;
  const scopeValue = scopeKey ? ((values[scopeKey] as string) || "") : "";
  const [name, setName] = useState("");

  useEffect(() => {
    if (!scopeValue) { setName(""); return; }
    let alive = true;
    listDoctors()
      .then((list) => { if (alive) setName(list.find((d) => d.id === scopeValue)?.name ?? ""); })
      .catch(() => {});
    return () => { alive = false; };
  }, [scopeValue]);

  if (!scopeKey) return null;
  return (
    <p className="text-xs text-muted-foreground mb-2">
      {scopeValue
        ? `Notes for ${name || "the selected doctor"} — each doctor keeps their own notes.`
        : "Select a doctor above to keep these notes with that doctor."}
    </p>
  );
}

interface Props {
  pageType: PageTypeDef;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
  coverId?: string | null;
  showPageGraphic?: boolean;
}

class SectionBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err: unknown) { console.error("Section failed to render", err); }
  render() {
    if (this.state.failed) {
      return <p className="text-sm text-muted-foreground">Couldn't load this section. Your other sections still work.</p>;
    }
    return this.props.children;
  }
}

/** Big pages (Complete Tracker) render a few sections first, then the rest in small batches so the page appears right away. */
const FIRST_BATCH = 3;
const BATCH = 3;
function useStagedCount(total: number, resetKey: string) {
  const [count, setCount] = useState(Math.min(total, FIRST_BATCH));
  useEffect(() => { setCount(Math.min(total, FIRST_BATCH)); }, [resetKey, total]);
  useEffect(() => {
    if (count >= total) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    let id: number;
    if (w.requestIdleCallback) {
      id = w.requestIdleCallback(() => setCount((c) => Math.min(total, c + BATCH)), { timeout: 120 });
      return () => w.cancelIdleCallback?.(id);
    }
    id = window.setTimeout(() => setCount((c) => Math.min(total, c + BATCH)), 16);
    return () => window.clearTimeout(id);
  }, [count, total]);
  return count;
}


type SectionProps = { section: SectionDef; idx: number; values: Record<string, FieldValue>; onChange: (key: string, value: FieldValue) => void; version: number };
/** Re-renders only when `version` changes — computed from which keys changed. */
const SectionView = memo(function SectionView({ section, idx, values, onChange }: SectionProps) {
  return (
        <section className="planner-card" style={idx >= FIRST_BATCH ? { contentVisibility: "auto", containIntrinsicSize: "auto 600px" } : undefined}>
          <SectionBoundary>
          {section.title && (
            <h2 className="font-display text-xl mb-1">{section.title}</h2>
          )}
          {section.description && (
            <p className="text-sm text-muted-foreground mb-3">{section.description}</p>
          )}
          <ScopeHint section={section} values={values} />
          {section.columnTitles && section.columnTitles.length > 0 && (
            <div
              className={cn(
                "grid gap-4 mt-3",
                section.columns === 2 && "sm:grid-cols-2",
                section.columns === 3 && "sm:grid-cols-2 md:grid-cols-3"
              )}
            >
              {section.columnTitles.map((t, i) => (
                <h3 key={i} className="font-display text-lg">{t}</h3>
              ))}
            </div>
          )}
          {section.groups && section.groups.length > 0 ? (
            <div
              className={cn(
                "grid gap-6 mt-3",
                section.groups.length === 2 && "sm:grid-cols-2",
                section.groups.length === 3 && "sm:grid-cols-2 lg:grid-cols-3",
                section.groups.length === 4 && "sm:grid-cols-2 lg:grid-cols-[2.2fr_0.9fr_0.8fr_1.4fr]",
                section.groups.length >= 5 && "sm:grid-cols-2 lg:grid-cols-5"
              )}
            >
              {section.groups.map((group, gi) => (
                <div key={gi} className="space-y-4 min-w-0">
                  {group.title && (
                    <h3 className="font-display text-lg">{group.title}</h3>
                  )}
                  <div
                    className={cn(
                      "grid gap-3",
                      (!group.columns || group.columns === 1) && "grid-cols-1",
                      group.columns === 2 && "grid-cols-1 sm:grid-cols-2",
                      group.columns === 3 && "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                    )}
                  >
                    {(() => {
                      const firstPairedKey = group.fields.find(f => f.type === "paired-compact")?.key;
                      return group.fields.map((field) => (
                        <div
                          key={field.key}
                          className={cn(
                            "min-w-0",
                            field.span === 2 && group.columns === 2 && "sm:col-span-2",
                            field.span === 2 && group.columns === 3 && "sm:col-span-2 xl:col-span-3"
                          )}
                        >
                          <FieldRenderer
                            field={field}
                            value={values[field.key] ?? null}
                            allValues={values}
                            onChange={(v) => onChange(field.key, v)}
                            onChangeAny={onChange}
                            showPairHeaders={field.key === firstPairedKey}
                          />
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4 mt-3",
                section.columns === 2 && "sm:grid-cols-2",
                section.columns === 3 && "sm:grid-cols-2 md:grid-cols-3"
              )}
            >
              {(() => {
                const firstPairedKey = section.fields.find(f => f.type === "paired-compact")?.key;
                return section.fields.map((field) => (
                  <div
                    key={field.key}
                    className={cn(
                      "min-w-0",
                      field.span === 2 && section.columns === 2 && "sm:col-span-2",
                      field.span === 2 && section.columns === 3 && "sm:col-span-2 md:col-span-3",
                    )}
                  >
                    <FieldRenderer
                      field={field}
                      value={values[field.key] ?? null}
                      allValues={values}
                      onChange={(v) => onChange(field.key, v)}
                      onChangeAny={onChange}
                      showPairHeaders={field.key === firstPairedKey}
                    />
                  </div>
                ));
              })()}
            </div>
          )}
          </SectionBoundary>
        </section>
  );
}, (a, b) => a.version === b.version && a.section === b.section && a.idx === b.idx);

export function PageRenderer({ pageType, values, onChange, coverId, showPageGraphic = true }: Props) {
  const visibleCount = useStagedCount(pageType.sections.length, pageType.id);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const stableOnChange = useCallback((k: string, v: FieldValue) => onChangeRef.current(k, v), []);
  // Map each field key to its section so typing only redraws that section.
  const keyToSection = useMemo(() => {
    const m = new Map<string, number>();
    pageType.sections.forEach((sec, i) => {
      const fields = sec.groups?.length ? sec.groups.flatMap((g) => g.fields) : sec.fields;
      fields.forEach((f) => m.set(f.key, i));
    });
    return m;
  }, [pageType]);
  const prevValues = useRef(values);
  const versionsRef = useRef<number[]>([]);
  const versions = useMemo(() => {
    const prev = prevValues.current;
    prevValues.current = values;
    const v = versionsRef.current.slice();
    if (prev !== values) {
      const keys = new Set([...Object.keys(prev), ...Object.keys(values)]);
      let bumpAll = false;
      const bump = new Set<number>();
      keys.forEach((k) => {
        if (prev[k] === values[k]) return;
        const i = keyToSection.get(k);
        // Shared keys (date/month/year, paired or scoped keys) can affect other sections.
        if (i === undefined || k === "date" || k === "month" || k === "year" || k === "daily_goal") bumpAll = true;
        else bump.add(i);
      });
      pageType.sections.forEach((_, i) => { if (bumpAll || bump.has(i)) v[i] = (v[i] ?? 0) + 1; });
    }
    versionsRef.current = v;
    return v;
  }, [values, keyToSection, pageType]);
  const pageGraphic = showPageGraphic ? getCoverPageIcon(coverId, pageType.id) : undefined;

  return (
    <div className="space-y-6">
      {pageGraphic && (
        <div className="flex justify-center py-1" aria-label={`${pageType.name} themed page graphic`}>
          <img
            src={pageGraphic}
            alt=""
            className="h-28 w-28 sm:h-32 sm:w-32 lg:h-36 lg:w-36 rounded-2xl object-cover shadow-sm ring-1 ring-border/50"
          />
        </div>
      )}
      {showPageGraphic && pageType.id === "medications" && (
        <ScanBar mode="prescription" values={values} onChange={onChange} />
      )}
      {showPageGraphic && pageType.id === "medical-records" && (
        <ScanBar mode="medical" values={values} onChange={onChange} />
      )}
      {showPageGraphic && pageType.id === "contacts" && (
        <ContactImportBar variant="contacts" values={values} onChange={onChange} />
      )}
      {showPageGraphic && pageType.id === "emergency-contacts" && (
        <ContactImportBar variant="emergency" values={values} onChange={onChange} />
      )}
      {pageType.sections.slice(0, visibleCount).map((section, idx) => (
        <SectionView key={idx} section={section} idx={idx} values={values} onChange={stableOnChange} version={versions[idx] ?? 0} />
      ))}
    </div>
  );
}
