import type { PageTypeDef, FieldValue } from "@/lib/pageTypes";
import { FieldRenderer } from "./FieldRenderer";
import { cn } from "@/lib/utils";

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
          <div
            className={cn(
              "grid gap-4 mt-3",
              section.columns === 2 && "sm:grid-cols-2",
              section.columns === 3 && "sm:grid-cols-2 md:grid-cols-3"
            )}
          >
            {section.fields.map((field) => (
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
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
