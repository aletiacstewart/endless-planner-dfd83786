import type { PageTypeDef, FieldValue } from "@/lib/pageTypes";
import { PageRenderer } from "@/components/PageRenderer";
import { cn } from "@/lib/utils";

interface Props {
  pageType: PageTypeDef;
  values: Record<string, FieldValue>;
  onChange: (key: string, value: FieldValue) => void;
  /** Optional per-side split; defaults to first-half / second-half by section index. */
  split?: number;
  className?: string;
}

/**
 * Two-page spread wrapper used inside Entry pages.
 * On lg+ shows the entry as a left and right page with a subtle spine.
 * Below lg, falls back to a single-column stack.
 */
export function PlannerSpread({ pageType, values, onChange, split, className }: Props) {
  const sections = pageType.sections;
  const mid = split ?? Math.ceil(sections.length / 2);
  const leftPage: PageTypeDef = { ...pageType, sections: sections.slice(0, mid) };
  const rightPage: PageTypeDef = { ...pageType, sections: sections.slice(mid) };

  return (
    <div
      className={cn(
        "relative rounded-3xl paper-dot shadow-[var(--shadow-soft)] border border-border/60 overflow-hidden",
        className,
      )}
    >
      {/* Spine */}
      <div
        aria-hidden
        className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 spread-spine z-10 pointer-events-none"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 p-5 lg:p-10">
        <div className="min-w-0 lg:pr-6">
          <PageRenderer pageType={leftPage} values={values} onChange={onChange} />
        </div>
        <div className="min-w-0 lg:pl-6">
          <PageRenderer pageType={rightPage} values={values} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
