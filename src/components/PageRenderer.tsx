import { useEffect, useState } from "react";
import type { PageTypeDef, FieldValue, SectionDef } from "@/lib/pageTypes";
import { FieldRenderer } from "./FieldRenderer";
import { cn } from "@/lib/utils";
import { listDoctors } from "@/lib/doctors";

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
}

export function PageRenderer({ pageType, values, onChange }: Props) {
  return (
    <div className="space-y-6">
      {pageType.sections.map((section, idx) => (
        <section key={idx} className="planner-card">
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
                      group.columns === 2 && "grid-cols-2",
                      group.columns === 3 && "grid-cols-3"
                    )}
                  >
                    {(() => {
                      const firstPairedKey = group.fields.find(f => f.type === "paired-compact")?.key;
                      return group.fields.map((field) => (
                        <div
                          key={field.key}
                          className={cn(
                            "min-w-0",
                            field.span === 2 && group.columns === 2 && "col-span-2",
                            field.span === 2 && group.columns === 3 && "col-span-3"
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
                    className={cn(field.span === 2 && "sm:col-span-2 md:col-span-3")}
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
        </section>
      ))}
    </div>
  );
}
