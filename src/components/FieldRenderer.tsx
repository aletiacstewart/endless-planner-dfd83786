import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { FieldDef, FieldValue } from "@/lib/pageTypes";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  field: FieldDef;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
}

export function FieldRenderer({ field, value, onChange }: Props) {
  const label = (
    <label className="field-label block mb-1.5" htmlFor={field.key}>
      {field.label}
    </label>
  );

  switch (field.type) {
    case "text":
    case "year":
      return (
        <div>
          {label}
          <Input
            id={field.key}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="bg-background/60"
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
          <Textarea
            id={field.key}
            rows={field.rows ?? 3}
            value={(value as string) ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className="bg-background/60 resize-none"
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
      return (
        <div>
          {label}
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
                    "w-9 h-9 rounded-md border text-xs font-medium transition-colors",
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
        </div>
      );
    }
    case "rating": {
      const max = field.max ?? 5;
      const current = Number(value) || 0;
      return (
        <div>
          {label}
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(current === n ? 0 : n)}
                className={cn(
                  "w-8 h-8 rounded-full border text-xs font-medium transition-colors",
                  n <= current
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background/60 border-input text-muted-foreground"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "ingredients-list":
      return <IngredientsList value={value as string[]} onChange={onChange} />;
    case "calendar-grid":
      return <CalendarGrid value={value as Record<string, string>} onChange={onChange} />;
    case "habit-grid":
      return (
        <HabitGrid
          value={value as { habits: string[]; marks: Record<string, boolean> }}
          defaults={field.defaultItems ?? []}
          onChange={onChange}
        />
      );
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
          rowCount={field.rowCount ?? 26}
          rowLabel={field.rowLabel ?? "Row"}
          label={field.label}
          onChange={onChange}
        />
      );
    case "daily-month-grid":
      return (
        <DailyMonthGrid
          value={value as { rowLabel?: string; cells: Record<string, string>; achieved: Record<string, boolean> }}
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
    default:
      return null;
  }
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

function CalendarGrid({
  value,
  onChange,
}: {
  value: Record<string, string> | null;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? {};
  const update = (day: number, v: string) => onChange({ ...data, [day]: v });
  return (
    <div>
      <label className="field-label block mb-2">Days of the month</label>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
          <div key={d} className="aspect-square rounded-md border border-border bg-background/60 p-1 flex flex-col">
            <span className="text-[10px] text-muted-foreground">{d}</span>
            <textarea
              value={data[d] ?? ""}
              onChange={(e) => update(d, e.target.value)}
              className="flex-1 w-full bg-transparent text-[10px] resize-none focus:outline-none"
              rows={2}
            />
          </div>
        ))}
      </div>
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

  return (
    <div>
      <label className="field-label block mb-2">Habits — tap to mark</label>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-normal text-muted-foreground sticky left-0 bg-card pr-2">Habit</th>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <th key={d} className="font-normal text-muted-foreground w-6">{d}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {data.habits.map((h, i) => (
              <tr key={i}>
                <td className="sticky left-0 bg-card pr-2">
                  <Input
                    value={h}
                    onChange={(e) => setHabit(i, e.target.value)}
                    className="h-7 text-xs min-w-[7rem] bg-background/60"
                  />
                </td>
                {Array.from({ length: 31 }, (_, di) => di + 1).map((d) => {
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addHabit} className="mt-2">
        <Plus className="w-4 h-4 mr-1" /> Add habit
      </Button>
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
  return (
    <div>
      <label className="field-label block mb-2">Activities by month</label>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left font-normal text-muted-foreground sticky left-0 bg-card pr-2">Activity</th>
              {months.map((m, i) => (
                <th key={i} className="font-normal text-muted-foreground w-6">{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((it, i) => (
              <tr key={i}>
                <td className="sticky left-0 bg-card pr-2">
                  <Input
                    value={it}
                    onChange={(e) => setItem(i, e.target.value)}
                    className="h-7 text-xs min-w-[8rem] bg-background/60"
                  />
                </td>
                {months.map((_, mi) => {
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
      </div>
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

function MeasurementGrid({
  value,
  columns,
  rowCount,
  rowLabel,
  label,
  onChange,
}: {
  value: Record<string, string> | null;
  columns: string[];
  rowCount: number;
  rowLabel: string;
  label: string;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? {};
  const set = (row: number, col: string, v: string) =>
    onChange({ ...data, [`${row}-${col}`]: v });

  return (
    <div>
      <label className="field-label block mb-2">{label}</label>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="text-xs border-separate border-spacing-1 min-w-full">
          <thead>
            <tr>
              <th className="text-left font-normal text-muted-foreground sticky left-0 bg-card pr-2 w-10">
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
            {Array.from({ length: rowCount }, (_, i) => i + 1).map((row) => (
              <tr key={row}>
                <td className="sticky left-0 bg-card pr-2 text-muted-foreground text-center">
                  {row}
                </td>
                {columns.map((c) => (
                  <td key={c}>
                    <Input
                      value={data[`${row}-${c}`] ?? ""}
                      onChange={(e) => set(row, c, e.target.value)}
                      className="h-7 text-xs min-w-[5rem] bg-background/60"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
  value: { rowLabel?: string; cells: Record<string, string>; achieved: Record<string, boolean> } | null;
  label: string;
  onChange: (v: FieldValue) => void;
}) {
  const data = value ?? { rowLabel: "", cells: {}, achieved: {} };
  const setCell = (day: number, month: number, v: string) =>
    onChange({ ...data, cells: { ...data.cells, [`${day}-${month}`]: v } });
  const toggleAchieved = (day: number) =>
    onChange({ ...data, achieved: { ...data.achieved, [day]: !data.achieved[day] } });
  const setRowLabel = (v: string) => onChange({ ...data, rowLabel: v });

  return (
    <div>
      <label className="field-label block mb-2">{label}</label>
      <div className="mb-2">
        <Input
          value={data.rowLabel ?? ""}
          onChange={(e) => setRowLabel(e.target.value)}
          placeholder="Row label (e.g. chore name, self-care item)"
          className="h-8 text-xs bg-background/60 max-w-md"
        />
      </div>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="font-normal text-muted-foreground sticky left-0 bg-card pr-2 w-10">Day</th>
              {MONTH_INITIALS.map((m, i) => (
                <th key={i} className="font-normal text-muted-foreground w-8">{m}</th>
              ))}
              <th className="font-normal text-muted-foreground w-8">✓</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <tr key={day}>
                <td className="sticky left-0 bg-card pr-2 text-muted-foreground text-center">{day}</td>
                {MONTH_INITIALS.map((_, mi) => (
                  <td key={mi}>
                    <input
                      value={data.cells[`${day}-${mi}`] ?? ""}
                      onChange={(e) => setCell(day, mi, e.target.value)}
                      className="w-8 h-7 px-1 text-[10px] text-center rounded border border-input bg-background/60 focus:outline-none focus:border-primary"
                    />
                  </td>
                ))}
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
            ))}
          </tbody>
        </table>
      </div>
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

  return (
    <div>
      <label className="field-label block mb-2">Monthly habit to begin or break</label>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="font-normal text-muted-foreground sticky left-0 bg-card pr-2 w-12">Month</th>
              <th className="font-normal text-muted-foreground pr-2 w-32">Begin / Break + Habit</th>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <th key={d} className="font-normal text-muted-foreground w-6">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="sticky left-0 bg-card pr-2 text-muted-foreground">
                  {FULL_MONTHS[i].slice(0, 3)}
                </td>
                <td className="pr-2">
                  <div className="flex flex-col gap-1 min-w-[10rem]">
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
