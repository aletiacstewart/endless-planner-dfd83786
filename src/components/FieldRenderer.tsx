import { Fragment, useEffect, useRef, useState, useCallback } from "react";
import { Plus, X, Angry, Frown, Meh, Smile, Laugh, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { FieldDef, FieldValue } from "@/lib/pageTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { listDoctors, addDoctor, type Doctor } from "@/lib/doctors";
import { RichTextField } from "@/components/entry/RichTextField";

interface Props {
  field: FieldDef;
  value: FieldValue;
  allValues?: Record<string, FieldValue>;
  onChange: (v: FieldValue) => void;
  onChangeAny?: (key: string, v: FieldValue) => void;
  showPairHeaders?: boolean;
}

/**
 * Scoped-field wrapper: when a field declares `scopeByKey` (e.g. medical notes
 * scoped by `doctor_id`), its value is read/written under `${key}__${scopeValue}`
 * so each doctor keeps their own notes. Legacy unscoped values are migrated onto
 * the first doctor selected.
 */
export function FieldRenderer(props: Props) {
  const { field, value, allValues, onChange, onChangeAny } = props;
  const scopeValue = field.scopeByKey ? ((allValues?.[field.scopeByKey] as string) || "") : "";
  const scopedKey = scopeValue ? `${field.key}__${scopeValue}` : field.key;
  const migrated = useRef<string | null>(null);

  // One-time migration: existing unscoped text moves under the first doctor picked.
  useEffect(() => {
    if (!scopeValue || !allValues || !onChangeAny) return;
    if (migrated.current === scopedKey) return;
    const plain = allValues[field.key];
    const scoped = allValues[scopedKey];
    const hasOtherScoped = Object.keys(allValues).some(
      (k) => k.startsWith(`${field.key}__`) && k !== scopedKey && !!allValues[k],
    );
    if (typeof plain === "string" && plain.trim() && scoped === undefined && !hasOtherScoped) {
      migrated.current = scopedKey;
      onChangeAny(scopedKey, plain);
      onChangeAny(field.key, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedKey, scopeValue]);

  if (scopedKey === field.key) return <FieldRendererInner {...props} />;
  return (
    <FieldRendererInner
      {...props}
      value={allValues?.[scopedKey] ?? null}
      onChange={(v) => (onChangeAny ? onChangeAny(scopedKey, v) : onChange(v))}
    />
  );
}

function FieldRendererInner({ field, value, allValues, onChange, onChangeAny, showPairHeaders }: Props) {

  const isMobile = useIsMobile();
  const label = (
    <label className="field-label block mb-1.5" htmlFor={field.key}>
      {field.label}
    </label>
  );

  switch (field.type) {
    case "text":
    case "year":
      if (field.compact && isMobile) {
        return (
          <div>
            {label}
            <MobileEditButton
              value={(value as string) ?? ""}
              onSave={(v) => onChange(v)}
              title={field.label}
              placeholder={field.placeholder ?? "—"}
              inputMode="numeric"
              className="w-24 text-center"
              ariaLabel={field.label}
            />
          </div>
        );
      }
      return (
        <div>
          {label}
          <Input
            id={field.key}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              "bg-background/60",
              field.compact && "h-9 w-20 px-2 text-center"
            )}
            inputMode={field.compact ? "numeric" : undefined}
            maxLength={field.compact ? 4 : undefined}
          />
        </div>
      );
    case "month":
      return (
        <div>
          {label}
          <select
            id={field.key}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background/60 px-3 text-sm"
          >
            <option value="">Select month</option>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      );
    case "select":
    case "time-select": {
      const opts = field.type === "time-select" ? TIME_OPTIONS : (field.options ?? []);
      return (
        <div>
          {label}
          <select
            id={field.key}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background/60 px-3 text-sm"
          >
            <option value="">{field.placeholder ?? "Select"}</option>
            {opts.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      );
    }
    case "date":
      return (
        <div>
          {label}
          <Input
            id={field.key}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-background/60"
          />
        </div>
      );
    case "number":
      return (
        <div>
          {label}
          <Input
            id={field.key}
            type="number"
            inputMode="numeric"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="bg-background/60"
          />
        </div>
      );
    case "textarea":
      return (
        <div>
          {label}
          <RichTextField
            id={field.key}
            rows={field.rows ?? 3}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(v) => onChange(v)}
          />
        </div>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2 select-none">
          <Checkbox
            checked={!!value}
            onCheckedChange={(c) => onChange(!!c)}
          />
          <span className="text-sm">{field.label}</span>
        </label>
      );
    case "checkbox-group": {
      const arr = (value as string[]) ?? [];
      const otherKey = field.otherKey;
      const otherVal = otherKey ? ((allValues?.[otherKey] as string) ?? "") : "";
      return (
        <div>
          {label}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {(field.options ?? []).map((opt, i) => {
                const id = `${opt}-${i}`;
                const active = arr.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onChange(active ? arr.filter((x) => x !== id) : [...arr, id]);
                    }}
                    className={cn(
                      "min-w-9 h-9 px-2 rounded-md border text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background/60 border-input text-muted-foreground"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {otherKey && onChangeAny && (
              <Input
                type="text"
                value={otherVal}
                onChange={(e) => onChangeAny(otherKey, e.target.value)}
                placeholder="Other"
                aria-label={`${field.label} — Other`}
                className="bg-background/60 h-9 w-32 px-2 text-xs"
              />
            )}
          </div>
        </div>
      );
    }
    case "rating": {
      const max = field.max ?? 5;
      const current = Number(value) || 0;
      const otherKey = field.otherKey;
      const otherVal = otherKey ? ((allValues?.[otherKey] as string) ?? "") : "";
      return (
        <div>
          {label}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-0.5 flex-nowrap">
              {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onChange(current === n ? 0 : n)}
                  className={cn(
                    "w-6 h-6 rounded-full border text-[11px] font-medium transition-colors flex items-center justify-center shrink-0",
                    n <= current
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background/60 border-input text-muted-foreground"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            {otherKey && onChangeAny && (
              <Input
                type="text"
                inputMode="numeric"
                maxLength={3}
                value={otherVal}
                onChange={(e) => onChangeAny(otherKey, e.target.value)}
                placeholder="Other"
                aria-label={`${field.label} — Other`}
                className="bg-background/60 h-8 w-14 px-2 text-center text-xs"
              />
            )}
          </div>
        </div>
      );
    }
    case "mood-rating": {
      const current = Number(value) || 0;
      const moods = [
        { n: 1, Icon: Angry, label: "Awful" },
        { n: 2, Icon: Frown, label: "Low" },
        { n: 3, Icon: Meh, label: "Okay" },
        { n: 4, Icon: Smile, label: "Good" },
        { n: 5, Icon: Laugh, label: "Great" },
      ];
      return (
        <div>
          {label}
          <div className="flex gap-2 flex-wrap">
            {moods.map(({ n, Icon, label: l }) => {
              const active = current === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={l}
                  title={l}
                  onClick={() => onChange(active ? 0 : n)}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center transition-colors",
                    active
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background/60 border-input text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    case "success-fail": {
      const current = (value as string) ?? "";
      const opts: { v: "success" | "failed"; label: string }[] = [
        { v: "success", label: "Success" },
        { v: "failed", label: "Failed" },
      ];
      const inputKey = field.inputKey;
      const inputVal = inputKey ? ((allValues?.[inputKey] as string) ?? "") : "";
      const modeKey = field.modeKey;
      const modeVal = modeKey ? ((allValues?.[modeKey] as string) ?? "") : "";
      const modeOpts: { v: "begin" | "break"; label: string }[] = [
        { v: "begin", label: "Begin" },
        { v: "break", label: "Break" },
      ];
      return (
        <div>
          {!inputKey && label}
          <div className="flex items-center gap-2 flex-wrap">
            {modeKey && onChangeAny && (
              <div className="flex gap-1">
                {modeOpts.map(({ v, label: l }) => {
                  const active = modeVal === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onChangeAny(modeKey, active ? "" : v)}
                      className={cn(
                        "px-2.5 h-9 rounded-full border text-xs font-medium transition-colors",
                        active
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background/60 border-input text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            )}
            {inputKey && onChangeAny && (
              <Input
                type="text"
                value={inputVal}
                onChange={(e) => onChangeAny(inputKey, e.target.value)}
                placeholder={field.inputPlaceholder ?? ""}
                aria-label={field.label}
                className="bg-background/60 h-9 flex-1 min-w-[120px]"
              />
            )}
            <div className="flex gap-2 flex-wrap">
              {opts.map(({ v, label: l }) => {
                const active = current === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onChange(active ? "" : v)}
                    className={cn(
                      "px-4 h-9 rounded-full border text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background/60 border-input text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    case "ingredients-list":
      return <IngredientsList value={value as string[]} onChange={onChange} />;
    case "calendar-grid": {
      // Prefer explicit month/year fields, otherwise derive from a date field (e.g. daily tracker).
      let derivedMonth = typeof allValues?.month === "string" ? (allValues.month as string) : "";
      let derivedYear =
        typeof allValues?.year === "string" || typeof allValues?.year === "number"
          ? String(allValues.year)
          : "";
      if ((!derivedMonth || !derivedYear) && typeof allValues?.date === "string" && allValues.date) {
        const d = new Date(allValues.date as string);
        if (!Number.isNaN(d.getTime())) {
          if (!derivedMonth) derivedMonth = String(d.getMonth() + 1);
          if (!derivedYear) derivedYear = String(d.getFullYear());
        }
      }
      return (
        <CalendarGrid
          value={value as Record<string, string>}
          month={derivedMonth}
          year={derivedYear}
          compact={field.compact}
          hidePanel={field.hideNotePanel}
          filterType={field.filterType}
          onChange={onChange}
        />
      );
    }

    case "habit-grid":
      return (
        <HabitGrid
          value={value as { habits: string[]; marks: Record<string, boolean> }}
          defaults={field.defaultItems ?? []}
          onChange={onChange}
        />
      );
    case "water-grid": {
      const goalRaw = allValues?.daily_goal;
      const goalNum = parseInt(String(goalRaw ?? ""), 10);
      const goal = Number.isFinite(goalNum) ? Math.min(12, Math.max(1, goalNum)) : 8;
      const monthName = typeof allValues?.month === "string" ? (allValues.month as string) : "";
      return (
        <WaterGrid
          value={value as { marks: Record<string, boolean> } | null}
          goal={goal}
          monthName={monthName}
          onChange={onChange}
        />
      );
    }
    case "month-tracker":
      return (
        <MonthTracker
          value={value as { items: string[]; marks: Record<string, boolean> }}
          defaults={field.defaultItems ?? []}
          onChange={onChange}
        />
      );
    case "measurement-grid":
      return (
        <MeasurementGrid
          value={value as Record<string, string>}
          columns={field.columns ?? []}
          columnKinds={field.columnKinds}
          columnOptions={field.columnOptions}
          columnWidths={field.columnWidths}
          rowCount={field.rowCount ?? 26}
          rowLabel={field.rowLabel ?? "Row"}
          rowLabels={field.rowLabels}
          label={field.label}
          growable={field.growable}
          addLabel={field.addLabel}
          onChange={onChange}
        />
      );
    case "calendar-notes":
      return (
        <CalendarNotes
          value={value as Record<string, string>}
          month={typeof allValues?.month === "string" ? (allValues.month as string) : undefined}
          year={typeof allValues?.year === "string" ? (allValues.year as string) : undefined}
          label={field.label}
          filterType={field.filterType}
          onChange={onChange}
        />
      );
    case "month-note-picker":
      return (
        <MonthNotePicker
          label={field.label}
          allValues={allValues ?? {}}
          onChangeAny={onChangeAny}
        />
      );
    case "daily-month-grid":
      return (
        <DailyMonthGrid
          value={value as { rowLabel?: string; cells: Record<string, string>; achieved: Record<string, boolean>; notes?: Record<string, string> }}
          label={field.label}
          onChange={onChange}
        />
      );
    case "yearly-habit-grid":
      return (
        <YearlyHabitGrid
          value={value as { rows: { mode: "begin" | "break" | ""; label: string }[]; marks: Record<string, boolean> }}
          onChange={onChange}
        />
      );
    case "med-list":
      return (
        <MedList
          value={value as Record<string, string>}
          rowCount={field.rowCount ?? 12}
          growable={field.growable}
          addLabel={field.addLabel}
          onChange={onChange}
        />
      );
    case "doctor-picker":
      return (
        <div>
          {label}
          <DoctorPicker
            value={(value as string) ?? ""}
            onChange={(v) => onChange(v)}
            ariaLabel={field.label}
          />
        </div>
      );
    case "paired-compact": {
      const [k1, k2] = field.pairKeys ?? ["", ""];
      const [l1, l2] = field.pairLabels ?? ["Start", "Finish"];
      const v1 = (allValues?.[k1] as string) ?? "";
      const v2 = (allValues?.[k2] as string) ?? "";
      if (isMobile) {
        return (
          <PairedCompactMobile
            label={field.label}
            keys={[k1, k2]}
            subLabels={[l1, l2]}
            values={[v1, v2]}
            onSave={(a, b) => {
              onChangeAny?.(k1, a);
              onChangeAny?.(k2, b);
            }}
          />
        );
      }
      return (
        <div className="flex items-center justify-between gap-2">
          <span className="field-label whitespace-nowrap">{field.label}</span>
          <div className="flex items-end gap-1.5 shrink-0">
            <div className="flex flex-col items-center">
              {showPairHeaders && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{l1}</span>
              )}
              <Input
                value={v1}
                onChange={(e) => onChangeAny?.(k1, e.target.value)}
                className="bg-background/60 h-8 w-12 px-1 text-center text-sm"
                inputMode="numeric"
                maxLength={5}
                aria-label={`${field.label} ${l1}`}
                title={l1}
              />
            </div>
            <div className="flex flex-col items-center">
              {showPairHeaders && (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{l2}</span>
              )}
              <Input
                value={v2}
                onChange={(e) => onChangeAny?.(k2, e.target.value)}
                className="bg-background/60 h-8 w-12 px-1 text-center text-sm"
                inputMode="numeric"
                maxLength={5}
                aria-label={`${field.label} ${l2}`}
                title={l2}
              />
            </div>
          </div>
        </div>
      );
    }
    case "priority-list":
      return (
        <PriorityList
          value={value as unknown as { done: boolean; text: string }[]}
          count={field.max ?? 3}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    case "time-schedule":
      return (
        <TimeSchedule
          value={value as unknown as { time: string; text: string }[] | Record<string, string>}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    case "hourly-timeline":
      return (
        <HourlyTimeline
          value={value as unknown as Record<string, string>}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    case "note-style":
      return (
        <NoteStyleField
          value={value as unknown as { style: string; body: string }}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    case "smart-goal":
      return (
        <SmartGoal
          value={value as unknown as Record<string, string>}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    case "mood-log":
      return (
        <MoodLog
          value={value as unknown as Record<string, number>}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    case "gratitude-list":
      return (
        <GratitudeList
          value={value as unknown as string[]}
          count={field.max ?? 3}
          label={field.label}
          onChange={(v) => onChange(v as unknown as FieldValue)}
        />
      );
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  MobileEditButton — tap-to-edit cell that opens a focused dialog.          */
/* -------------------------------------------------------------------------- */

function MobileEditButton({
  value,
  onSave,
  title,
  placeholder,
  className,
  inputMode,
  inputType,
  rows,
  ariaLabel,
}: {
  value: string;
  onSave: (v: string) => void;
  title: string;
  placeholder?: string;
  className?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel";
  inputType?: "input" | "textarea";
  rows?: number;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const filled = (value ?? "").trim().length > 0;
  const handleOpen = () => {
    setDraft(value ?? "");
    setOpen(true);
  };
  const handleSave = () => {
    onSave(draft);
    setOpen(false);
  };
  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={ariaLabel ?? title}
        className={cn(
          "h-9 w-full rounded-md border px-2 text-sm text-left truncate transition-colors",
          filled
            ? "bg-primary-soft/40 border-primary/40 text-foreground"
            : "bg-background/60 border-input text-muted-foreground/70 hover:border-primary/60",
          className
        )}
      >
        {filled ? value : (placeholder ?? "Tap to edit")}
      </button>
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {inputType === "textarea" ? (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={rows ?? 4}
              placeholder={placeholder}
              className="bg-background/60 resize-none"
              autoFocus
            />
          ) : (
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              inputMode={inputMode}
              className="bg-background/60 h-11 text-base"
              autoFocus
            />
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  PairedCompactMobile — single button, opens dialog with two inputs.        */
/* -------------------------------------------------------------------------- */

function PairedCompactMobile({
  label,
  keys,
  subLabels,
  values,
  onSave,
}: {
  label: string;
  keys: [string, string];
  subLabels: [string, string];
  values: [string, string];
  onSave: (a: string, b: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [d1, setD1] = useState(values[0]);
  const [d2, setD2] = useState(values[1]);
  const filled1 = (values[0] ?? "").trim().length > 0;
  const filled2 = (values[1] ?? "").trim().length > 0;
  const filled = filled1 || filled2;
  const summary = `${values[0] || "—"} / ${values[1] || "—"}`;
  const handleOpen = () => {
    setD1(values[0] ?? "");
    setD2(values[1] ?? "");
    setOpen(true);
  };
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="field-label whitespace-nowrap">{label}</span>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={`${label} ${subLabels[0]} / ${subLabels[1]}`}
        className={cn(
          "h-9 min-w-[6rem] rounded-md border px-3 text-sm transition-colors",
          filled
            ? "bg-primary-soft/40 border-primary/40 text-foreground"
            : "bg-background/60 border-input text-muted-foreground/70 hover:border-primary/60"
        )}
      >
        {summary}
      </button>
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="field-label block mb-1.5" htmlFor={`${keys[0]}-edit`}>{subLabels[0]}</label>
              <Input
                id={`${keys[0]}-edit`}
                value={d1}
                onChange={(e) => setD1(e.target.value)}
                inputMode="numeric"
                className="bg-background/60 h-11 text-base"
                autoFocus
              />
            </div>
            <div>
              <label className="field-label block mb-1.5" htmlFor={`${keys[1]}-edit`}>{subLabels[1]}</label>
              <Input
                id={`${keys[1]}-edit`}
                value={d2}
                onChange={(e) => setD2(e.target.value)}
                inputMode="numeric"
                className="bg-background/60 h-11 text-base"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => { onSave(d1, d2); setOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function IngredientsList({
  value,
  onChange,
}: {
  value: string[] | null;
  onChange: (v: FieldValue) => void;
}) {
  const items = value ?? [""];
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  return (
    <div>
      <label className="field-label block mb-1.5">Ingredients</label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={it}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Ingredient ${i + 1}`}
              className="bg-background/60"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label="Remove ingredient"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, ""])}
        >
          <Plus className="w-4 h-4 mr-1" /> Add ingredient
        </Button>
      </div>
    </div>
  );
}

function MedList({
  value,
  rowCount,
  growable,
  addLabel,
  onChange,
}: {
  value: Record<string, string> | null;
  rowCount: number;
  growable?: boolean;
  addLabel?: string;
  onChange: (v: FieldValue) => void;
}) {
  const isMobile = useIsMobile();
  const data = value ?? {};
  const extra = Number(data.__rows ?? "") || 0;
  const visibleRows = growable ? Math.max(rowCount, extra) : rowCount;
  const update = (key: string, v: string) => onChange({ ...data, [key]: v });
  const cols = "grid-cols-[1.25rem_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1.6fr)_minmax(0,1.4fr)_5rem]";
  const slots: { k: "m" | "a" | "n"; label: string }[] = [
    { k: "m", label: "M" },
    { k: "a", label: "A" },
    { k: "n", label: "N" },
  ];
  const renderTextCell = (n: number, key: "name" | "strength" | "reason" | "doctor", title: string) => {
    const k = `${n}_${key}`;
    const v = data[k] ?? "";
    if (isMobile) {
      return (
        <MobileEditButton
          value={v}
          onSave={(nv) => update(k, nv)}
          title={`Med ${n} · ${title}`}
          placeholder="—"
          className="h-8 text-xs"
          ariaLabel={`Med ${n} ${title}`}
        />
      );
    }
    return (
      <Input
        value={v}
        onChange={(e) => update(k, e.target.value)}
        className="bg-background/60 h-8 px-2 text-sm"
        aria-label={`Med ${n} ${title}`}
      />
    );
  };
  return (
    <div>
      <div className={cn("grid gap-x-2 gap-y-1 items-end mb-1", cols)}>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground" />
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-1">Name</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-1">Strength</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-1">Reason</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground px-1">Doctor</span>
        <div className="grid grid-cols-3 gap-1 text-center">
          {slots.map((s) => (
            <span key={s.k} className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground" title={s.k === "m" ? "Morning" : s.k === "a" ? "Afternoon" : "Night"}>
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        {Array.from({ length: visibleRows }, (_, i) => i + 1).map((n) => (
          <div key={n} className={cn("grid gap-x-2 items-center", cols)}>
            <span className="text-xs text-muted-foreground text-right pr-1">{n}.</span>
            {renderTextCell(n, "name", "Name")}
            {renderTextCell(n, "strength", "Strength/Dose")}
            {renderTextCell(n, "reason", "Reason")}
            <DoctorPicker
              compact
              value={data[`${n}_doctor_id`] ?? ""}
              fallbackName={data[`${n}_doctor`] ?? ""}
              onChange={(v) => update(`${n}_doctor_id`, v)}
              ariaLabel={`Med ${n} Doctor`}
            />
            <div className="grid grid-cols-3 gap-1 justify-items-center">
              {slots.map((s) => {
                const key = `${n}_${s.k}`;
                const checked = data[key] === "1";
                return (
                  <Checkbox
                    key={s.k}
                    checked={checked}
                    onCheckedChange={(c) => update(key, c ? "1" : "")}
                    aria-label={`Med ${n} ${s.label}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {growable && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => onChange({ ...data, __rows: String(visibleRows + 1) })}
        >
          <Plus className="w-4 h-4 mr-1" /> {addLabel ?? "Add row"}
        </Button>
      )}
      <div className="mt-3">
        <label className="field-label block mb-1.5">More / Other</label>
        <Textarea
          value={data.more ?? ""}
          rows={2}
          onChange={(e) => update("more", e.target.value)}
          className="bg-background/60 resize-none"
        />
      </div>
    </div>
  );
}

const MONTH_NAMES = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Appointment / event types a calendar day note can be tagged with. */
export const APPT_TYPES = ["Medical", "Work", "School", "Family", "Personal", "Other"] as const;
const DEFAULT_APPT_TYPE = "Other";

function CalendarGrid({
  value,
  month,
  year,
  compact,
  hidePanel,
  filterType,
  onChange,
}: {
  value: Record<string, string> | null;
  month?: string;
  year?: string;
  compact?: boolean;
  /** Hide the inline note panel (notes are edited in a dialog / on the other page). */
  hidePanel?: boolean;
  /** Only show/edit notes of this appointment type (e.g. "Medical"). */
  filterType?: string;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? {};
  const typeOf = (day: number) => data[`t${day}`] || DEFAULT_APPT_TYPE;
  const update = (day: number, v: string, type?: string) => {
    const next: Record<string, string> = { ...data, [String(day)]: v };
    const t = type ?? filterType ?? typeOf(day);
    if (v.trim()) next[`t${day}`] = t;
    else delete next[`t${day}`];
    onChange(next);
  };

  const now = new Date();
  const monthLookup = (month ?? "").trim().toLowerCase();
  let monthIndex = MONTH_NAMES.indexOf(monthLookup);
  if (monthIndex === -1) {
    const numeric = parseInt(monthLookup, 10);
    if (!Number.isNaN(numeric) && numeric >= 1 && numeric <= 12) {
      monthIndex = numeric - 1;
    } else {
      monthIndex = now.getMonth();
    }
  }
  const yearNum = (() => {
    const n = parseInt((year ?? "").trim(), 10);
    return Number.isNaN(n) || n < 1000 || n > 9999 ? now.getFullYear() : n;
  })();

  const monthName = MONTH_NAMES[monthIndex].charAt(0).toUpperCase() + MONTH_NAMES[monthIndex].slice(1);
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();
  const startWeekday = new Date(yearNum, monthIndex, 1).getDay();

  // Open day in a popup so the cell stays clean and notes are fully visible.
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState<string>(filterType ?? DEFAULT_APPT_TYPE);
  const [viewType, setViewType] = useState<string>("All");
  const isMobile = useIsMobile();

  /** A day's note counts as visible when it matches the active type filter. */
  const visibleNote = (d: number) => {
    const note = data[String(d)] ?? "";
    if (!note.trim()) return "";
    const t = typeOf(d);
    if (filterType) return t === filterType ? note : "";
    if (viewType !== "All" && t !== viewType) return "";
    return note;
  };

  const openCell = (d: number) => {
    setDraft(visibleNote(d));
    setDraftType(filterType ?? (data[String(d)]?.trim() ? typeOf(d) : viewType !== "All" ? viewType : DEFAULT_APPT_TYPE));
    setOpenDay(d);
  };
  const saveCell = () => {
    if (openDay !== null) update(openDay, draft, draftType);
    setOpenDay(null);
  };

  // Auto-save the draft as the user types so the inline panel feels seamless.
  const updateDraft = (v: string) => {
    setDraft(v);
    if (openDay !== null) update(openDay, v, draftType);
  };
  const updateDraftType = (t: string) => {
    setDraftType(t);
    if (openDay !== null && draft.trim()) update(openDay, draft, t);
  };

  const typeSelect = filterType ? null : (
    <div className="mb-2">
      <label className="field-label block mb-1">Type</label>
      <select
        value={draftType}
        onChange={(e) => updateDraftType(e.target.value)}
        className="w-full h-9 rounded-md border border-input bg-background/60 px-2 text-sm"
        aria-label="Appointment type"
      >
        {APPT_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  );

  const calendar = (
    <div className={cn("min-w-0", compact && "max-w-xs")}>
      <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <label className="field-label block">
          {filterType
            ? `${monthName} ${yearNum} — ${filterType.toLowerCase()} appointments`
            : compact
            ? `${monthName} ${yearNum} — tap a day`
            : "Days of the month — tap to add a note"}
        </label>
        {!filterType && !compact && (
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="h-8 rounded-md border border-input bg-background/60 px-2 text-xs"
            aria-label="Filter by type"
          >
            <option value="All">All types</option>
            {APPT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
      </div>
      <div className={cn("grid grid-cols-7 mb-1.5", compact ? "gap-0.5" : "gap-1.5")}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className={cn(
              "font-medium uppercase tracking-wide text-muted-foreground text-center",
              compact ? "text-[9px]" : "text-[10px]"
            )}
          >
            {compact ? w[0] : w}
          </div>
        ))}
      </div>
      <div className={cn("grid grid-cols-7", compact ? "gap-0.5" : "gap-1.5")}>
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square" aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const note = visibleNote(d);
          const filled = note.trim().length > 0;
          const isOpen = openDay === d;
          return (
            <button
              type="button"
              key={d}
              onClick={() => openCell(d)}
              aria-label={`${monthName} ${d}${filled ? " — has note" : ""}`}
              aria-pressed={isOpen}
              className={cn(
                "aspect-square rounded-md border flex flex-col items-stretch text-left transition-colors hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring",
                compact ? "p-0.5 items-center justify-center" : "p-1",
                isOpen
                  ? "bg-primary/15 border-primary ring-2 ring-primary/40"
                  : filled
                  ? "bg-primary-soft/40 border-primary/40"
                  : "bg-background/60 border-border"
              )}
            >
              <span
                className={cn(
                  "text-muted-foreground leading-none",
                  compact ? "text-[10px] text-foreground/80" : "text-[10px]"
                )}
              >
                {d}
              </span>
              {filled && !compact && (
                <span className="mt-0.5 text-[9px] leading-tight text-foreground/80 line-clamp-2 break-words">
                  {note}
                </span>
              )}
              {filled && compact && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // Inline editor panel shown next to the calendar on >= md screens.
  const inlinePanel = (
    <div className="min-w-0 hidden md:flex md:flex-col rounded-lg border border-border bg-background/60 p-3">
      {openDay !== null ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="font-display text-base">
              {monthName} {openDay}, {yearNum}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpenDay(null)}
              aria-label="Close note"
            >
              Close
            </Button>
          </div>
          {typeSelect}
          <Textarea
            value={draft}
            onChange={(e) => updateDraft(e.target.value)}
            rows={8}
            placeholder="Add a note for this day…"
            className="bg-background/60 resize-none flex-1"
            autoFocus
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-sm text-muted-foreground p-4">
          Tap a day to add or view a note.
        </div>
      )}
    </div>
  );

  // Mobile dialog so small screens still get a full-size editor.
  // IMPORTANT: only mount the Dialog on mobile so the backdrop doesn't dim desktop.
  const mobileDialog = isMobile || hidePanel ? (
    <Dialog
      open={openDay !== null}
      onOpenChange={(o) => {
        if (!o) setOpenDay(null);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {openDay !== null ? `${monthName} ${openDay}, ${yearNum}` : ""}
          </DialogTitle>
        </DialogHeader>
        {typeSelect}
        <Textarea
          value={draft}
          onChange={(e) => updateDraft(e.target.value)}
          rows={6}
          placeholder="Add a note for this day…"
          className="bg-background/60 resize-none"
          autoFocus
        />
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => setOpenDay(null)}>
            Close
          </Button>
          <Button onClick={saveCell}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  return (
    <div className={cn(compact && "max-w-2xl")}>
      <div
        className={cn(
          "grid gap-4 md:items-start",
          !hidePanel && "md:grid-cols-[auto_1fr]",
        )}
      >
        {calendar}
        {!hidePanel && inlinePanel}
      </div>
      {mobileDialog}
    </div>
  );
}

function HabitGrid({
  value,
  defaults,
  onChange,
}: {
  value: { habits: string[]; marks: Record<string, boolean> } | null;
  defaults: string[];
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? { habits: defaults, marks: {} };
  const setHabit = (i: number, v: string) => {
    const habits = [...data.habits];
    habits[i] = v;
    onChange({ ...data, habits });
  };
  const toggle = (i: number, d: number) => {
    const k = `${i}-${d}`;
    const marks = { ...data.marks, [k]: !data.marks[k] };
    onChange({ ...data, marks });
  };
  const addHabit = () => onChange({ ...data, habits: [...data.habits, ""] });
  const removeHabit = (i: number) => {
    const habits = data.habits.filter((_, idx) => idx !== i);
    const marks: Record<string, boolean> = {};
    Object.entries(data.marks).forEach(([k, v]) => {
      const [hi, di] = k.split("-").map(Number);
      if (hi < i) marks[k] = v;
      else if (hi > i) marks[`${hi - 1}-${di}`] = v;
    });
    onChange({ habits, marks });
  };

  const isMobile = useIsMobile();

  const renderTable = (dayStart: number, dayEnd: number, showRemove: boolean) => {
    const days = Array.from({ length: dayEnd - dayStart + 1 }, (_, i) => i + dayStart);
    return (
      <table className="text-xs border-separate border-spacing-1 w-full table-fixed">
        <thead>
          <tr>
            <th className="text-left font-normal text-muted-foreground pr-2">Habit</th>
            {days.map((d) => (
              <th key={d} className="font-normal text-muted-foreground w-6">{d}</th>
            ))}
            {showRemove && <th />}
          </tr>
        </thead>
        <tbody>
          {data.habits.map((h, i) => (
            <tr key={i}>
              <td className="pr-2">
                <Input
                  value={h}
                  onChange={(e) => setHabit(i, e.target.value)}
                  className="h-7 text-xs min-w-[6rem] bg-background/60"
                />
              </td>
              {days.map((d) => {
                const k = `${i}-${d}`;
                const on = !!data.marks[k];
                return (
                  <td key={d}>
                    <button
                      type="button"
                      onClick={() => toggle(i, d)}
                      className={cn(
                        "w-5 h-5 rounded-sm border",
                        on ? "bg-primary border-primary" : "bg-background/60 border-input"
                      )}
                      aria-label={`Day ${d}`}
                    />
                  </td>
                );
              })}
              {showRemove && (
                <td>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeHabit(i)}
                    aria-label="Remove habit"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <label className="field-label block mb-2">Habits — tap to mark</label>
      {isMobile ? (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Days 1–16</div>
            {renderTable(1, 16, false)}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Days 17–31</div>
            {renderTable(17, 31, true)}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2 pb-2 max-w-full" style={{ WebkitOverflowScrolling: "touch" }}>
          {renderTable(1, 31, true)}
        </div>
      )}
      <Button type="button" variant="outline" size="sm" onClick={addHabit} className="mt-2">
        <Plus className="w-4 h-4 mr-1" /> Add habit
      </Button>
    </div>
  );
}

/** Glasses (rows) x days of the month (columns). Rows are fixed by the daily goal. */
function WaterGrid({
  value,
  goal,
  monthName,
  onChange,
}: {
  value: { marks: Record<string, boolean> } | null;
  goal: number;
  monthName: string;
  onChange: (v: FieldValue) => void;
}) {
  const isMobile = useIsMobile();
  const marks = value?.marks ?? {};
  const idx = MONTH_NAMES.indexOf((monthName || "").trim().toLowerCase());
  const year = new Date().getFullYear();
  const dayCount = idx >= 0 ? new Date(year, idx + 1, 0).getDate() : 31;

  const toggle = (glass: number, day: number) => {
    const k = `${glass}-${day}`;
    onChange({ ...(value ?? {}), marks: { ...marks, [k]: !marks[k] } });
  };

  const glasses = Array.from({ length: goal }, (_, i) => i + 1);

  const renderTable = (from: number, to: number) => {
    const days = Array.from({ length: Math.max(0, Math.min(to, dayCount) - from + 1) }, (_, i) => from + i);
    if (days.length === 0) return null;
    return (
      <table className="text-xs border-separate border-spacing-y-1 w-full table-fixed">
        <colgroup>
          <col className="w-[3.75rem]" />
          {days.map((d) => (
            <col key={d} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="text-left font-normal text-muted-foreground pr-2">Glass</th>
            {days.map((d) => (
              <th key={d} className="font-normal text-muted-foreground text-center">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {glasses.map((g) => (
            <tr key={g}>
              <td className="pr-2 whitespace-nowrap text-muted-foreground">Glass {g}</td>
              {days.map((d) => {
                const on = !!marks[`${g}-${d}`];
                return (
                  <td key={d} className="text-center">
                    <button
                      type="button"
                      onClick={() => toggle(g, d)}
                      className={cn(
                        "mx-auto block w-4 h-4 lg:w-[1.15rem] lg:h-[1.15rem] rounded-full border transition-colors",
                        on ? "bg-primary border-primary" : "bg-background/60 border-input",
                      )}
                      aria-label={`Glass ${g}, day ${d}`}
                      aria-pressed={on}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="pr-2 text-[10px] uppercase tracking-wide text-muted-foreground">Total</td>
            {days.map((d) => {
              const count = glasses.reduce((n, g) => n + (marks[`${g}-${d}`] ? 1 : 0), 0);
              const hit = count >= goal;
              return (
                <td
                  key={d}
                  className={cn(
                    "text-center text-[10px]",
                    hit ? "text-primary font-semibold" : "text-muted-foreground",
                  )}
                >
                  {count}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <label className="field-label block mb-2">Glasses per day — tap to fill</label>
      {isMobile ? (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Days 1–16</div>
            {renderTable(1, 16)}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Days 17–{dayCount}</div>
            {renderTable(17, dayCount)}
          </div>
        </div>
      ) : (
        <div className="w-full pb-2">{renderTable(1, dayCount)}</div>
      )}
      <p className="text-[11px] text-muted-foreground mt-2">
        Goal: {goal} {goal === 1 ? "glass" : "glasses"} a day — change the daily goal above to add or remove rows.
      </p>
    </div>
  );
}

function MonthTracker({
  value,
  defaults,
  onChange,
}: {
  value: { items: string[]; marks: Record<string, boolean> } | null;
  defaults: string[];
  onChange: (v: FieldValue) => void;
}) {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const data = value ?? { items: defaults, marks: {} };
  const setItem = (i: number, v: string) => {
    const items = [...data.items];
    items[i] = v;
    onChange({ ...data, items });
  };
  const toggle = (i: number, m: number) => {
    const k = `${i}-${m}`;
    onChange({ ...data, marks: { ...data.marks, [k]: !data.marks[k] } });
  };
  const isMobile = useIsMobile();

  const renderTable = (start: number, end: number) => {
    const slice = months.slice(start, end);
    return (
      <table className="text-xs border-separate border-spacing-1 w-full table-fixed">
        <thead>
          <tr>
            <th className="text-left font-normal text-muted-foreground pr-2">Activity</th>
            {slice.map((m, i) => (
              <th key={start + i} className="font-normal text-muted-foreground w-6">{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.items.map((it, i) => (
            <tr key={i}>
              <td className="pr-2">
                <Input
                  value={it}
                  onChange={(e) => setItem(i, e.target.value)}
                  className="h-7 text-xs min-w-[6rem] w-full sm:w-40 bg-background/60"
                />
              </td>
              {slice.map((_, idx) => {
                const mi = start + idx;
                const k = `${i}-${mi}`;
                const on = !!data.marks[k];
                return (
                  <td key={mi}>
                    <button
                      type="button"
                      onClick={() => toggle(i, mi)}
                      className={cn(
                        "w-5 h-5 rounded-sm border",
                        on ? "bg-accent border-accent" : "bg-background/60 border-input"
                      )}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <label className="field-label block mb-2">Activities by month</label>
      {isMobile ? (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Jan – Jun</div>
            {renderTable(0, 6)}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Jul – Dec</div>
            {renderTable(6, 12)}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2 pb-2 max-w-full" style={{ WebkitOverflowScrolling: "touch" }}>
          {renderTable(0, 12)}
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange({ ...data, items: [...data.items, ""] })}
        className="mt-2"
      >
        <Plus className="w-4 h-4 mr-1" /> Add activity
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Measurement grid — fixed N rows × labelled free-text columns.             */
/*  Used by Bi-Monthly Weight (4 cols) and Bi-Monthly Measurements (8 cols).  */
/* -------------------------------------------------------------------------- */

const OCCASION_OPTIONS = [
  "Birthday",
  "Anniversary",
  "Wedding",
  "Graduation",
  "Holiday",
  "Memorial",
  "Work",
  "Other",
];

/** Occasion cell: preset dropdown with an inline text box when "Other". */
function OccasionCell({
  value,
  otherValue,
  onChange,
  onOtherChange,
  ariaLabel,
}: {
  value: string;
  otherValue: string;
  onChange: (v: string) => void;
  onOtherChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="h-7 text-xs min-w-[7rem] bg-background/60" aria-label={ariaLabel}>
          <SelectValue placeholder="—" />
        </SelectTrigger>
        <SelectContent>
          {OCCASION_OPTIONS.map((o) => (
            <SelectItem key={o} value={o} className="text-xs">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === "Other" && (
        <Input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Which?"
          aria-label={`${ariaLabel} — other`}
          className="h-7 text-xs min-w-[5rem] bg-background/60"
        />
      )}
    </div>
  );
}

/** Date cell: pop-out calendar for day / month / year. */
function DateCell({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const parsed = value ? new Date(`${value}T00:00:00`) : undefined;
  const valid = parsed && !isNaN(parsed.getTime()) ? parsed : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={ariaLabel}
          className={cn(
            "h-7 px-2 text-xs font-normal justify-start min-w-[7rem] bg-background/60",
            !valid && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="w-3 h-3 mr-1 shrink-0" />
          {valid
            ? valid.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "Pick date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={valid}
          defaultMonth={valid}
          captionLayout="dropdown-buttons"
          fromYear={1900}
          toYear={new Date().getFullYear() + 10}
          onSelect={(d) => {
            if (d) {
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              onChange(iso);
            } else {
              onChange("");
            }
            setOpen(false);
          }}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}

const GRID_COL_WIDTH: Record<string, string> = {
  xs: "min-w-[3rem] max-w-[4.5rem]",
  sm: "min-w-[5rem] max-w-[7rem]",
  md: "min-w-[7rem]",
  lg: "min-w-[9rem] w-full",
};

function MeasurementGrid({
  value,
  columns,
  columnKinds,
  columnOptions,
  columnWidths,
  rowCount,
  rowLabel,
  rowLabels,
  label,
  growable,
  addLabel,
  onChange,
}: {
  value: Record<string, string> | null;
  columns: string[];
  columnKinds?: ("text" | "occasion" | "date" | "time" | "select" | "check")[];
  columnOptions?: (string[] | null)[];
  columnWidths?: ("xs" | "sm" | "md" | "lg")[];
  rowCount: number;
  rowLabel: string;
  rowLabels?: string[];
  label: string;
  growable?: boolean;
  addLabel?: string;
  onChange: (v: FieldValue) => void;
}) {
  const isMobile = useIsMobile();
  const data = value ?? {};
  const set = (row: number, col: string, v: string) =>
    onChange({ ...data, [`${row}-${col}`]: v });

  const storedRows = Number(data.__rows);
  const visibleRows = growable
    ? Math.max(rowCount, Number.isFinite(storedRows) ? storedRows : 0)
    : rowCount;

  /** Legacy fallback: a renamed column keeps showing values saved under its old name. */
  const cellValue = (row: number, col: string) => {
    const v = data[`${row}-${col}`];
    if (v != null && v !== "") return v;
    const legacy = col.includes("/") ? col.split("/")[0] : null;
    return (legacy ? data[`${row}-${legacy}`] : undefined) ?? "";
  };

  return (
    <div className="min-w-0">
      <label className="field-label block mb-2">{label}</label>
      <div className="overflow-x-auto -mx-2 px-2 pb-2 max-w-full" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="text-xs border-separate border-spacing-1 w-full min-w-full table-fixed">
          <thead>
            <tr>
              <th className="text-left font-normal text-muted-foreground pr-2 w-10">
                {rowLabel}
              </th>
              {columns.map((c) => (
                <th key={c} className="font-normal text-muted-foreground text-left px-1">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: visibleRows }, (_, i) => i + 1).map((row) => (
              <tr key={row}>
                <td className="pr-2 text-muted-foreground text-center whitespace-nowrap">
                  {rowLabels?.[row - 1] ?? row}
                </td>
                {columns.map((c, ci) => {
                  const kind = columnKinds?.[ci] ?? "text";
                  const width = GRID_COL_WIDTH[columnWidths?.[ci] ?? "md"];
                  const cv = cellValue(row, c);
                  const rowName = rowLabels?.[row - 1] ?? `${rowLabel} ${row}`;
                  return (
                    <td key={c} className={width}>
                      {kind === "occasion" ? (
                        <OccasionCell
                          value={cv}
                          otherValue={data[`${row}-${c}-other`] ?? ""}
                          onChange={(v) => set(row, c, v)}
                          onOtherChange={(v) => set(row, `${c}-other`, v)}
                          ariaLabel={`${rowName} ${c}`}
                        />
                      ) : kind === "date" ? (
                        <DateCell
                          value={cv}
                          onChange={(v) => set(row, c, v)}
                          ariaLabel={`${rowName} ${c}`}
                        />
                      ) : kind === "check" ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={cv === "x"}
                            onCheckedChange={(ck) => set(row, c, ck ? "x" : "")}
                            aria-label={`${rowName} ${c}`}
                          />
                        </div>
                      ) : kind === "time" || kind === "select" ? (
                        <GridSelectCell
                          value={cv}
                          options={kind === "time" ? TIME_OPTIONS : (columnOptions?.[ci] ?? [])}
                          onChange={(v) => set(row, c, v)}
                          ariaLabel={`${rowName} ${c}`}
                        />
                      ) : isMobile ? (
                        <MobileEditButton
                          value={cv}
                          onSave={(nv) => set(row, c, nv)}
                          title={`${rowName} · ${c}`}
                          placeholder="—"
                          className="h-7 text-xs w-full"
                          ariaLabel={`${rowName} ${c}`}
                        />
                      ) : (
                        <Input
                          value={cv}
                          onChange={(e) => set(row, c, e.target.value)}
                          className="h-7 text-xs w-full bg-background/60"
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {growable && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 rounded-full"
          onClick={() => onChange({ ...data, __rows: String(visibleRows + 1) })}
        >
          <Plus className="w-4 h-4 mr-1" /> {addLabel ?? "Add row"}
        </Button>
      )}
    </div>
  );
}

/** Small dropdown cell used for time / fixed-option grid columns. */
function GridSelectCell({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="h-7 w-full rounded-md border border-input bg-background/60 px-1 text-xs"
    >
      <option value="">—</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

/* -------------------------------------------------------------------------- */
/*  Calendar notes — the day notes of a calendar-grid, listed and editable.    */
/* -------------------------------------------------------------------------- */

function CalendarNotes({
  value,
  month,
  year,
  label,
  filterType,
  onChange,
}: {
  value: Record<string, string> | null;
  month?: string;
  year?: string;
  label: string;
  /** Only list notes of this appointment type (e.g. "Medical"). */
  filterType?: string;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? {};
  const typeOf = (d: number) => data[`t${d}`] || DEFAULT_APPT_TYPE;
  const now = new Date();
  const lookup = (month ?? "").trim().toLowerCase();
  let monthIndex = MONTH_NAMES.indexOf(lookup);
  if (monthIndex === -1) {
    const numeric = parseInt(lookup, 10);
    monthIndex = !Number.isNaN(numeric) && numeric >= 1 && numeric <= 12 ? numeric - 1 : now.getMonth();
  }
  const yearNum = (() => {
    const n = parseInt((year ?? "").trim(), 10);
    return Number.isNaN(n) || n < 1000 || n > 9999 ? now.getFullYear() : n;
  })();
  const monthName = MONTH_NAMES[monthIndex].charAt(0).toUpperCase() + MONTH_NAMES[monthIndex].slice(1);

  const days = Object.keys(data)
    .map((k) => parseInt(k, 10))
    .filter((d) => Number.isFinite(d) && (data[String(d)] ?? "").trim().length > 0)
    .filter((d) => !filterType || typeOf(d) === filterType)
    .sort((a, b) => a - b);

  return (
    <div>
      <label className="field-label block mb-2">{label}</label>
      {days.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filterType
            ? `Tap a day on the calendar to add a ${filterType.toLowerCase()} appointment — it shows up here.`
            : "Tap a day on the calendar to add a note — it shows up here."}
        </p>
      ) : (
        <div className="space-y-3">
          {days.map((d) => (
            <div key={d} className="rounded-lg border border-border bg-background/60 p-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <p className="font-display text-sm">
                  {monthName} {d}, {yearNum}
                </p>
                {filterType ? (
                  <span className="text-[10px] uppercase tracking-wide rounded-full border border-primary/40 bg-primary-soft/40 px-2 py-0.5">
                    {filterType}
                  </span>
                ) : (
                  <select
                    value={typeOf(d)}
                    onChange={(e) => onChange({ ...data, [`t${d}`]: e.target.value })}
                    className="h-7 rounded-md border border-input bg-background/60 px-1.5 text-xs"
                    aria-label={`Type for ${monthName} ${d}`}
                  >
                    {APPT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              </div>
              <Textarea
                value={data[String(d)] ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    [d]: e.target.value,
                    ...(e.target.value.trim() ? { [`t${d}`]: typeOf(d) } : {}),
                  })
                }
                rows={3}
                className="bg-background/60 resize-none"
                aria-label={`Note for ${monthName} ${d}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Month note picker — pick a date, write a note, append to that month.       */
/* -------------------------------------------------------------------------- */

function MonthNotePicker({
  label,
  allValues,
  onChangeAny,
}: {
  label: string;
  allValues: Record<string, FieldValue>;
  onChangeAny?: (key: string, v: FieldValue) => void;
}) {
  const [date, setDate] = useState<Date | undefined>();
  const [note, setNote] = useState("");

  const add = () => {
    if (!date || !note.trim() || !onChangeAny) return;
    const monthKey = `month_${MONTH_NAMES[date.getMonth()]}`;
    const current = (allValues[monthKey] as string | undefined) ?? "";
    const line = `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${note.trim()}`;
    onChangeAny(monthKey, current.trim() ? `${current.trim()}\n${line}` : line);
    setNote("");
  };

  return (
    <div>
      <label className="field-label block mb-2">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full sm:w-[220px] justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {date ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "Pick a day"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <div className="flex-1 min-w-0">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What's happening that day?"
            className="bg-background/60 resize-none"
            aria-label="Note for the selected day"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 rounded-full"
            onClick={add}
            disabled={!date || !note.trim()}
          >
            <Plus className="w-4 h-4 mr-1" /> Add to month notes
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Daily × Month grid — 31 day rows × 12 month cols + Achieved column.       */
/*  Used by Blood Sugar / BP / O2 / Cleaning / Self-Care.                     */
/* -------------------------------------------------------------------------- */

const MONTH_INITIALS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function DailyMonthGrid({
  value,
  label,
  onChange,
}: {
  value: {
    rowLabel?: string;
    cells: Record<string, string>;
    achieved: Record<string, boolean>;
    notes?: Record<string, string>;
  } | null;
  label: string;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? { rowLabel: "", cells: {}, achieved: {}, notes: {} };
  const notes = data.notes ?? {};
  const setCell = (day: number, month: number, v: string) =>
    onChange({ ...data, notes, cells: { ...data.cells, [`${day}-${month}`]: v } });
  const toggleAchieved = (day: number) =>
    onChange({
      ...data,
      notes,
      achieved: { ...data.achieved, [day]: !data.achieved[day] },
    });
  const setNote = (day: number, v: string) =>
    onChange({ ...data, notes: { ...notes, [day]: v } });
  const setRowLabel = (v: string) => onChange({ ...data, notes, rowLabel: v });

  const isMobile = useIsMobile();

  const FULL_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Popup state — either editing a single month/day cell or a per-day note.
  type Editing =
    | { kind: "cell"; day: number; month: number }
    | { kind: "note"; day: number }
    | null;
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState("");

  const openCell = (day: number, month: number) => {
    setDraft(data.cells[`${day}-${month}`] ?? "");
    setEditing({ kind: "cell", day, month });
  };
  const openNote = (day: number) => {
    setDraft(notes[day] ?? "");
    setEditing({ kind: "note", day });
  };
  const saveEditing = () => {
    if (!editing) return;
    if (editing.kind === "cell") setCell(editing.day, editing.month, draft);
    else setNote(editing.day, draft);
    setEditing(null);
  };

  const dialogTitle = (() => {
    if (!editing) return "";
    if (editing.kind === "cell") return `Day ${editing.day} · ${FULL_MONTH_NAMES[editing.month]}`;
    return `Day ${editing.day} · Note`;
  })();

  const renderTable = (mStart: number, mEnd: number) => {
    const monthSlice = MONTH_INITIALS.slice(mStart, mEnd);
    const colCount = monthSlice.length;
    return (
      <table className="text-xs border-separate border-spacing-1 w-full table-fixed">
        <thead>
          <tr>
            <th className="font-normal text-muted-foreground pr-2 w-8 text-left">Day</th>
            {monthSlice.map((m, idx) => (
              <th key={mStart + idx} className="font-normal text-muted-foreground w-8">{m}</th>
            ))}
            <th className="font-normal text-muted-foreground w-8">✓</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const noteText = notes[day] ?? "";
            const noteFilled = noteText.trim().length > 0;
            return (
              <Fragment key={day}>
                <tr>
                  <td className="pr-2 text-muted-foreground text-center align-middle">{day}</td>
                  {monthSlice.map((_, idx) => {
                    const mi = mStart + idx;
                    const cellVal = data.cells[`${day}-${mi}`] ?? "";
                    const filled = cellVal.trim().length > 0;
                    return (
                      <td key={mi}>
                        <button
                          type="button"
                          onClick={() => openCell(day, mi)}
                          aria-label={`Day ${day} ${FULL_MONTH_NAMES[mi]}${filled ? ` — ${cellVal}` : ""}`}
                          className={cn(
                            "w-full min-w-0 h-7 px-1 text-[10px] text-center rounded border truncate transition-colors",
                            filled
                              ? "bg-primary-soft/40 border-primary/40 text-foreground"
                              : "bg-background/60 border-input text-muted-foreground hover:border-primary/60"
                          )}
                        >
                          {filled ? cellVal : ""}
                        </button>
                      </td>
                    );
                  })}
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleAchieved(day)}
                      className={cn(
                        "w-5 h-5 rounded-sm border",
                        data.achieved[day]
                          ? "bg-primary border-primary"
                          : "bg-background/60 border-input"
                      )}
                      aria-label={`Day ${day} achieved`}
                    />
                  </td>
                </tr>
                <tr>
                  <td />
                  <td colSpan={colCount + 1} className="pb-1">
                    <button
                      type="button"
                      onClick={() => openNote(day)}
                      aria-label={`Day ${day} note${noteFilled ? ` — ${noteText}` : ""}`}
                      className={cn(
                        "w-full min-w-0 h-7 px-2 text-[10px] text-left rounded border truncate transition-colors",
                        noteFilled
                          ? "bg-primary-soft/30 border-primary/40 text-foreground"
                          : "bg-background/40 border-dashed border-input text-muted-foreground/70 hover:border-primary/60"
                      )}
                    >
                      {noteFilled ? noteText : "Note…"}
                    </button>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div>
      <label className="field-label block mb-2">{label}</label>
      <div className="mb-2">
        <Input
          value={data.rowLabel ?? ""}
          onChange={(e) => setRowLabel(e.target.value)}
          placeholder="Label name (Title)"
          className="h-8 text-xs bg-background/60 max-w-md"
        />
      </div>
      {isMobile ? (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Jan – Jun</div>
            {renderTable(0, 6)}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1">Jul – Dec</div>
            {renderTable(6, 12)}
          </div>
        </div>
      ) : (
        <div
          className="overflow-x-auto -mx-2 px-2 pb-2 max-w-full"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {renderTable(0, 12)}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={editing?.kind === "note" ? 6 : 3}
            placeholder={editing?.kind === "note" ? "Add a note for this day…" : "Enter value…"}
            className="bg-background/60 resize-none"
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEditing}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Yearly Habit Grid — 12 months: Begin/Break + label + 31 check cells.      */
/* -------------------------------------------------------------------------- */

const FULL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function YearlyHabitGrid({
  value,
  onChange,
}: {
  value: { rows: { mode: "begin" | "break" | ""; label: string }[]; marks: Record<string, boolean> } | null;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? {
    rows: FULL_MONTHS.map(() => ({ mode: "" as const, label: "" })),
    marks: {} as Record<string, boolean>,
  };
  // Defensive: ensure 12 rows.
  const rows = data.rows.length === 12
    ? data.rows
    : [...data.rows, ...Array(12 - data.rows.length).fill({ mode: "", label: "" })];

  const setMode = (i: number, mode: "begin" | "break" | "") => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, mode } : r));
    onChange({ ...data, rows: next });
  };
  const setLabel = (i: number, label: string) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, label } : r));
    onChange({ ...data, rows: next });
  };
  const toggleDay = (i: number, d: number) => {
    const k = `${i}-${d}`;
    onChange({ ...data, marks: { ...data.marks, [k]: !data.marks[k] } });
  };

  const isMobile = useIsMobile();

  const modeButtons = (i: number, row: { mode: "begin" | "break" | ""; label: string }) => (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => setMode(i, row.mode === "begin" ? "" : "begin")}
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] border",
          row.mode === "begin"
            ? "bg-accent text-accent-foreground border-accent"
            : "bg-background/60 border-input text-muted-foreground"
        )}
      >
        Begin
      </button>
      <button
        type="button"
        onClick={() => setMode(i, row.mode === "break" ? "" : "break")}
        className={cn(
          "px-1.5 py-0.5 rounded text-[10px] border",
          row.mode === "break"
            ? "bg-accent text-accent-foreground border-accent"
            : "bg-background/60 border-input text-muted-foreground"
        )}
      >
        Break
      </button>
    </div>
  );

  if (isMobile) {
    const renderHalf = (start: number, end: number, title: string) => (
      <div>
        <div className="text-[10px] text-muted-foreground mb-1">{title}</div>
        <div className="space-y-3">
          {rows.slice(start, end).map((row, idx) => {
            const i = start + idx;
            return (
              <div key={i} className="rounded-md border border-border/40 p-2 bg-background/30">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-xs font-medium text-muted-foreground w-10 shrink-0">
                    {FULL_MONTHS[i].slice(0, 3)}
                  </div>
                  {modeButtons(i, row)}
                </div>
                <Input
                  value={row.label}
                  onChange={(e) => setLabel(i, e.target.value)}
                  placeholder="Habit"
                  className="h-7 text-xs bg-background/60 mb-2"
                />
                <div className="grid grid-cols-[repeat(auto-fill,minmax(1.5rem,1fr))] gap-1">
                  {Array.from({ length: 31 }, (_, di) => di + 1).map((d) => {
                    const k = `${i}-${d}`;
                    const on = !!data.marks[k];
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDay(i, d)}
                        className={cn(
                          "h-6 rounded-sm border text-[9px] leading-none",
                          on
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background/60 border-input text-muted-foreground"
                        )}
                        aria-label={`${FULL_MONTHS[i]} day ${d}`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div>
        <label className="field-label block mb-2">Monthly habit to begin or break</label>
        <div className="space-y-4">
          {renderHalf(0, 6, "Jan – Jun")}
          {renderHalf(6, 12, "Jul – Dec")}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="field-label block mb-2">Monthly habit to begin or break</label>
      <div className="overflow-x-auto -mx-2 px-2 pb-2 max-w-full" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="font-normal text-muted-foreground pr-2 w-12">Month</th>
              <th className="font-normal text-muted-foreground pr-2 w-32">Begin / Break + Habit</th>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <th key={d} className="font-normal text-muted-foreground w-6">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="pr-2 text-muted-foreground">
                  {FULL_MONTHS[i].slice(0, 3)}
                </td>
                <td className="pr-2">
                  <div className="flex flex-col gap-1 min-w-[10rem]">
                    {modeButtons(i, row)}
                    <Input
                      value={row.label}
                      onChange={(e) => setLabel(i, e.target.value)}
                      placeholder="Habit"
                      className="h-7 text-xs bg-background/60"
                    />
                  </div>
                </td>
                {Array.from({ length: 31 }, (_, di) => di + 1).map((d) => {
                  const k = `${i}-${d}`;
                  const on = !!data.marks[k];
                  return (
                    <td key={d}>
                      <button
                        type="button"
                        onClick={() => toggleDay(i, d)}
                        className={cn(
                          "w-5 h-5 rounded-sm border",
                          on ? "bg-primary border-primary" : "bg-background/60 border-input"
                        )}
                        aria-label={`${FULL_MONTHS[i]} day ${d}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DoctorPicker — dropdown of shared doctors with inline "Add doctor" dialog */
/* -------------------------------------------------------------------------- */

let _doctorListeners: Array<() => void> = [];
function notifyDoctorChange() {
  for (const fn of _doctorListeners) fn();
}

function useDoctors(): { doctors: Doctor[]; refresh: () => void } {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const refresh = useCallback(() => {
    void listDoctors().then(setDoctors);
  }, []);
  useEffect(() => {
    refresh();
    _doctorListeners.push(refresh);
    return () => {
      _doctorListeners = _doctorListeners.filter((f) => f !== refresh);
    };
  }, [refresh]);
  return { doctors, refresh };
}

function DoctorPicker({
  value,
  onChange,
  ariaLabel,
  fallbackName,
  compact,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel?: string;
  fallbackName?: string;
  compact?: boolean;
}) {
  const { doctors } = useDoctors();
  const [adding, setAdding] = useState(false);
  const known = doctors.some((d) => d.id === value);
  const placeholder = !known && fallbackName?.trim() ? fallbackName : "Select doctor";

  return (
    <div className="flex items-center gap-1 min-w-0">
      <select
        value={known ? value : ""}
        onChange={(e) => {
          if (e.target.value === "__add__") {
            setAdding(true);
            return;
          }
          onChange(e.target.value);
        }}
        aria-label={ariaLabel}
        className={cn(
          "flex-1 min-w-0 rounded-md border border-input bg-background/60 text-sm",
          compact ? "h-8 px-1 text-xs" : "h-10 px-3"
        )}
      >
        <option value="">{placeholder}</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.practice ? `${d.name} — ${d.practice}` : d.name}
          </option>
        ))}
        <option value="__add__">+ Add doctor…</option>
      </select>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setAdding(true)}
        aria-label="Add doctor"
        className={cn(compact ? "h-8 w-8" : "h-9 w-9")}
      >
        <Plus className="w-4 h-4" />
      </Button>
      <AddDoctorDialog
        open={adding}
        onOpenChange={setAdding}
        onCreated={(d) => {
          onChange(d.id);
          notifyDoctorChange();
        }}
      />
    </div>
  );
}

function AddDoctorDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (d: Doctor) => void;
}) {
  const [name, setName] = useState("");
  const [practice, setPractice] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(""); setPractice(""); setPhone(""); setEmail(""); setNotes("");
    }
  }, [open]);

  const save = async () => {
    if (!name.trim()) return;
    const d = await addDoctor({
      name: name.trim(),
      practice: practice.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onCreated(d);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="field-label block mb-1.5">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background/60" autoFocus />
          </div>
          <div>
            <label className="field-label block mb-1.5">Practice</label>
            <Input value={practice} onChange={(e) => setPractice(e.target.value)} className="bg-background/60" />
          </div>
          <div>
            <label className="field-label block mb-1.5">Phone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="bg-background/60" />
          </div>
          <div>
            <label className="field-label block mb-1.5">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" className="bg-background/60" />
          </div>
          <div>
            <label className="field-label block mb-1.5">Notes</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="bg-background/60 resize-none" />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  PriorityList — Top 3 (or N) numbered rows: checkbox + text                */
/* -------------------------------------------------------------------------- */

function PriorityList({
  value,
  count,
  label,
  onChange,
}: {
  value: { done: boolean; text: string }[] | undefined;
  count: number;
  label: string;
  onChange: (v: { done: boolean; text: string }[]) => void;
}) {
  const rows = Array.from({ length: count }, (_, i) => value?.[i] ?? { done: false, text: "" });
  const update = (i: number, patch: Partial<{ done: boolean; text: string }>) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange(next);
  };
  return (
    <div>
      <label className="field-label block mb-1.5">{label}</label>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="font-script text-primary/70 text-lg w-5 shrink-0">{i + 1}</span>
            <Checkbox checked={r.done} onCheckedChange={(c) => update(i, { done: !!c })} />
            <Input
              value={r.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder={`Priority ${i + 1}`}
              className={cn("bg-background/60 flex-1", r.done && "line-through text-muted-foreground")}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  HourlyTimeline — text slot per hour (6am–10pm by default)                 */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  TimeSchedule — add-a-row schedule with 15-minute time dropdowns.          */
/* -------------------------------------------------------------------------- */

/** "12:00 AM" … "11:45 PM" in 15-minute steps. */
const TIME_OPTIONS: string[] = Array.from({ length: 96 }, (_, i) => {
  const h24 = Math.floor(i / 4);
  const min = (i % 4) * 15;
  const ap = h24 >= 12 ? "PM" : "AM";
  const hh = ((h24 + 11) % 12) + 1;
  return `${hh}:${String(min).padStart(2, "0")} ${ap}`;
});

const timeIndex = (t: string) => {
  const i = TIME_OPTIONS.indexOf(t);
  return i < 0 ? 9999 : i;
};

type ScheduleRow = { time: string; text: string };

function TimeSchedule({
  value,
  label,
  onChange,
}: {
  value: ScheduleRow[] | Record<string, string> | undefined;
  label: string;
  onChange: (v: ScheduleRow[]) => void;
}) {
  // Migrate legacy hourly maps ({ "6": "walk" }) into rows at their old hour.
  const rows: ScheduleRow[] = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.entries(value)
          .filter(([, text]) => (text ?? "").trim().length > 0)
          .map(([h, text]) => ({ time: TIME_OPTIONS[Number(h) * 4] ?? "", text }))
      : [];

  const list = rows.length > 0 ? rows : [{ time: "", text: "" }, { time: "", text: "" }, { time: "", text: "" }];

  const commit = (next: ScheduleRow[]) =>
    onChange([...next].sort((a, b) => timeIndex(a.time) - timeIndex(b.time)));

  const setRow = (i: number, patch: Partial<ScheduleRow>) =>
    commit(list.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeRow = (i: number) => commit(list.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="field-label block mb-1.5">{label}</label>
      <div className="rounded-md border border-border/60 bg-background/40 divide-y divide-border/40">
        {list.map((row, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1">
            <select
              value={row.time}
              onChange={(e) => setRow(i, { time: e.target.value })}
              aria-label={`Row ${i + 1} time`}
              className="w-[6.5rem] shrink-0 h-8 rounded-md border border-input bg-background/60 px-1 text-xs"
            >
              <option value="">Time</option>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Input
              value={row.text}
              onChange={(e) => setRow(i, { text: e.target.value })}
              className="bg-transparent border-0 h-8 flex-1 min-w-0 px-1 text-sm focus-visible:ring-0"
              placeholder="What's happening…"
              aria-label={`Row ${i + 1} plan`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => removeRow(i)}
              aria-label={`Remove row ${i + 1}`}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-2"
        onClick={() => commit([...list, { time: "", text: "" }])}
      >
        <Plus className="w-3.5 h-3.5 mr-1" /> Add time block
      </Button>
    </div>
  );
}

function HourlyTimeline({
  value,
  label,
  onChange,
}: {
  value: Record<string, string> | undefined;
  label: string;
  onChange: (v: Record<string, string>) => void;
}) {
  const v = value ?? {};
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22
  const fmt = (h: number) => {
    const ap = h >= 12 ? "PM" : "AM";
    const hh = ((h + 11) % 12) + 1;
    return `${hh} ${ap}`;
  };
  return (
    <div>
      <label className="field-label block mb-1.5">{label}</label>
      <div className="rounded-md border border-border/60 bg-background/40 divide-y divide-border/40">
        {hours.map((h) => (
          <div key={h} className="flex items-center gap-2 px-2 py-1">
            <span className="w-14 shrink-0 text-[11px] uppercase tracking-widest text-muted-foreground">
              {fmt(h)}
            </span>
            <Input
              value={v[String(h)] ?? ""}
              onChange={(e) => onChange({ ...v, [String(h)]: e.target.value })}
              className="bg-transparent border-0 h-8 flex-1 px-1 text-sm focus-visible:ring-0"
              placeholder="—"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  NoteStyleField — paper style picker + rich body on that paper             */
/* -------------------------------------------------------------------------- */

function NoteStyleField({
  value,
  label,
  onChange,
}: {
  value: { style: string; body: string } | undefined;
  label: string;
  onChange: (v: { style: string; body: string }) => void;
}) {
  const style = value?.style ?? "lined";
  const body = value?.body ?? "";
  const styles = [
    { id: "blank", label: "Blank" },
    { id: "lined", label: "Lined" },
    { id: "dot", label: "Dot grid" },
    { id: "cornell", label: "Cornell" },
  ];
  const paperBg =
    style === "lined"
      ? "repeating-linear-gradient(0deg, transparent 0 27px, hsl(var(--foreground) / 0.12) 27px 28px)"
      : style === "dot"
        ? "radial-gradient(hsl(var(--foreground) / 0.2) 1px, transparent 1px)"
        : undefined;
  const paperSize = style === "dot" ? "18px 18px" : style === "lined" ? "100% 28px" : undefined;

  if (style === "cornell") {
    const cues = value ? (value as unknown as { cues?: string }).cues ?? "" : "";
    const summary = value ? (value as unknown as { summary?: string }).summary ?? "" : "";
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="field-label">{label}</label>
          <StylePicker style={style} styles={styles} onChange={(s) => onChange({ ...(value ?? { body: "" }), style: s })} />
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr] min-h-[220px]">
            <Textarea
              value={cues}
              onChange={(e) => onChange({ ...(value ?? { body: "" }), style, cues: e.target.value } as never)}
              placeholder="Cues / questions"
              className="rounded-none border-0 border-r border-border/60 resize-none bg-transparent text-sm"
            />
            <Textarea
              value={body}
              onChange={(e) => onChange({ ...(value ?? { body: "" }), style, body: e.target.value })}
              placeholder="Notes"
              className="rounded-none border-0 resize-none bg-transparent text-sm"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 27px, hsl(var(--foreground) / 0.12) 27px 28px)",
                backgroundSize: "100% 28px",
              }}
            />
          </div>
          <Textarea
            value={summary}
            onChange={(e) => onChange({ ...(value ?? { body: "" }), style, summary: e.target.value } as never)}
            placeholder="Summary"
            rows={2}
            className="rounded-none border-0 border-t border-border/60 resize-none bg-transparent text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="field-label">{label}</label>
        <StylePicker style={style} styles={styles} onChange={(s) => onChange({ ...(value ?? { body: "" }), style: s })} />
      </div>
      <Textarea
        value={body}
        rows={14}
        onChange={(e) => onChange({ style, body: e.target.value })}
        className="bg-background/40 resize-none leading-7"
        style={{
          backgroundImage: paperBg,
          backgroundSize: paperSize,
        }}
        placeholder="Start writing…"
      />
    </div>
  );
}

function StylePicker({
  style,
  styles,
  onChange,
}: {
  style: string;
  styles: { id: string; label: string }[];
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {styles.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={cn(
            "px-2 h-7 rounded-full border text-[11px] font-medium transition-colors",
            style === s.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background/60 border-input text-muted-foreground hover:text-foreground"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SmartGoal — structured Specific / Measurable / Achievable / Relevant / Time */
/* -------------------------------------------------------------------------- */

function SmartGoal({
  value,
  label,
  onChange,
}: {
  value: Record<string, string> | undefined;
  label: string;
  onChange: (v: Record<string, string>) => void;
}) {
  const v = value ?? {};
  const set = (k: string, val: string) => onChange({ ...v, [k]: val });
  const rows: [string, string, string][] = [
    ["specific", "Specific", "What exactly do I want?"],
    ["measurable", "Measurable", "How will I measure it?"],
    ["achievable", "Achievable", "Is it realistic?"],
    ["relevant", "Relevant", "Why does it matter?"],
    ["time", "Time-bound", "By when?"],
  ];
  return (
    <div>
      <label className="field-label block mb-1.5">{label}</label>
      <div className="rounded-md border border-border/60 bg-background/40 divide-y divide-border/40">
        {rows.map(([k, l, ph]) => (
          <div key={k} className="grid grid-cols-[90px_1fr] gap-2 items-start p-2">
            <span className="font-display text-sm text-primary/80 pt-1.5">{l}</span>
            <Textarea
              value={v[k] ?? ""}
              onChange={(e) => set(k, e.target.value)}
              rows={2}
              placeholder={ph}
              className="bg-transparent border-0 resize-none text-sm focus-visible:ring-0 min-h-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  MoodLog — 7-day mood face row (S M T W T F S)                             */
/* -------------------------------------------------------------------------- */

function MoodLog({
  value,
  label,
  onChange,
}: {
  value: Record<string, number> | undefined;
  label: string;
  onChange: (v: Record<string, number>) => void;
}) {
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const v = value ?? {};
  const icons = [Angry, Frown, Meh, Smile, Laugh];
  return (
    <div>
      <label className="field-label block mb-1.5">{label}</label>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const cur = v[String(i)] ?? 0;
          const next = ((cur % 5) + 1);
          const Icon = cur > 0 ? icons[cur - 1] : Meh;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange({ ...v, [String(i)]: cur >= 5 ? 0 : next })}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 rounded-md border transition-colors",
                cur > 0
                  ? "bg-accent/20 border-accent text-accent-foreground"
                  : "bg-background/60 border-input text-muted-foreground"
              )}
            >
              <span className="text-[10px] uppercase tracking-widest">{d}</span>
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  GratitudeList — numbered text rows                                        */
/* -------------------------------------------------------------------------- */

function GratitudeList({
  value,
  count,
  label,
  onChange,
}: {
  value: string[] | undefined;
  count: number;
  label: string;
  onChange: (v: string[]) => void;
}) {
  const rows = Array.from({ length: count }, (_, i) => value?.[i] ?? "");
  const set = (i: number, s: string) => {
    const next = rows.slice();
    next[i] = s;
    onChange(next);
  };
  return (
    <div>
      <label className="field-label block mb-1.5">{label}</label>
      <ol className="space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="font-script text-primary/70 text-lg w-5 shrink-0">{i + 1}</span>
            <Input
              value={r}
              onChange={(e) => set(i, e.target.value)}
              placeholder="I'm grateful for…"
              className="bg-background/60 flex-1"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
