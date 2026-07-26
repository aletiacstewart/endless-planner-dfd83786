import type { PageTypeDef, FieldValue, SectionDef } from "@/lib/pageTypes";
import { PageRenderer } from "@/components/PageRenderer";
import { cn } from "@/lib/utils";

interface Props {
  pageType: PageTypeDef;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
  /** Optional per-side split; defaults to first-half / second-half by narrow-section index. */
  split?: number;
  className?: string;
}

/** Field types that need the full spread width to render without clipping. */
const WIDE_TYPES = new Set([
  "yearly-habit-grid",
  "habit-grid",
  "month-tracker",
  "calendar-grid",
  "daily-month-grid",
  "measurement-grid",
]);

function isWide(section: SectionDef): boolean {
  return section.fields.some((f) => WIDE_TYPES.has(f.type));
}

/**
 * Two-page spread wrapper used inside Entry pages.
 *
 * Layout:
 *   - Narrow sections split left / right around a subtle spine.
 *   - Any section containing a wide grid renders full-bleed across both pages
 *     (with horizontal scroll fallback) so nothing gets clipped.
 *   - Below lg, everything collapses to a single column.
 */
export function PlannerSpread({ pageType, values, onChange, split, className }: Props) {
  const narrow: SectionDef[] = [];
  const wide: SectionDef[] = [];
  for (const s of pageType.sections) {
    (isWide(s) ? wide : narrow).push(s);
  }

  const mid = split ?? Math.ceil(narrow.length / 2);
  const leftPage: PageTypeDef = { ...pageType, sections: narrow.slice(0, mid) };
  const rightPage: PageTypeDef = { ...pageType, sections: narrow.slice(mid) };

  const hasNarrow = narrow.length > 0;
  const hasWide = wide.length > 0;
  const showSpine = hasNarrow && narrow.length > 1;

  return (
    <div
      className={cn(
        "relative rounded-3xl paper-dot shadow-[var(--shadow-soft)] border border-border/60 overflow-hidden",
        className,
      )}
    >
      {showSpine && (
        <div
          aria-hidden
          className="hidden lg:block absolute left-1/2 -translate-x-1/2 w-8 spread-spine z-10 pointer-events-none"
          style={{ top: 0, bottom: hasWide ? "auto" : 0, height: hasWide ? "var(--spine-h, 100%)" : undefined }}
        />
      )}

      <div className="p-5 lg:p-10 space-y-8">
        {hasNarrow && (
          narrow.length === 1 ? (
            <div>
              <PageRenderer pageType={leftPage} values={values} onChange={onChange} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              <div className="min-w-0 lg:pr-6">
                <PageRenderer pageType={leftPage} values={values} onChange={onChange} />
              </div>
              <div className="min-w-0 lg:pl-6">
                <PageRenderer pageType={rightPage} values={values} onChange={onChange} />
              </div>
            </div>
          )
        )}

        {hasWide && wide.map((section, i) => {
          const sub: PageTypeDef = { ...pageType, sections: [section] };
          return (
            <div key={i} className="overflow-x-auto -mx-2 px-2">
              <div className="min-w-full">
                <PageRenderer pageType={sub} values={values} onChange={onChange} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
