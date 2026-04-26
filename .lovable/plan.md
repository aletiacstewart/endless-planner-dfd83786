## Goal

On mobile (<768px), tiny inputs (compact text boxes, paired Start/Finish, medication grid, weekly measurement grid) are hard to tap and fill. Wrap them with a tap-to-edit popup pattern — already used by the calendar and daily-month grids — so each value opens in a focused dialog with a comfortably-sized input and Save/Cancel buttons.

## What changes for the user

On phones:

- Tapping any **compact text input** (Workout cardio/weights/yoga, Result Weight, etc.) opens a popup with a full-width input and a Save button.
- Tapping either box in a **paired Start/Finish** field (Neck, Chest, Bicep, Waist, Hips, Thigh, Calf, Body Fat %, Weight) opens one popup that lets you enter Start and Finish together with large inputs and clear labels.
- Tapping any cell in the **Medication list** (Name, Reason, Doctor) opens a popup with a full-width input. Morning/Afternoon/Night checkboxes stay inline (already big enough to tap).
- Tapping any cell in the **Weekly Measurement / Weight grid** (26 weeks × multiple columns) opens a popup with a labeled input for that week + column.

On desktop and tablet (≥768px), nothing changes — fields stay inline as they are now.

## Visual indicator

Compact buttons on mobile show the current value (or a placeholder like "—") and have a subtle border; tapping opens the dialog. The look matches the existing tap-to-edit cells in the monthly calendar so it feels consistent.

## Technical Details

Reuse the existing `Dialog` pattern already in `CalendarGrid` and `DailyMonthGrid` (controlled `editing`/`draft` state, `Save`/`Cancel` footer, `autoFocus` on the input).

**Files to update**: `src/components/FieldRenderer.tsx`

1. **`text` case (when `field.compact === true`)** — on mobile, render a button showing the value; clicking opens a dialog with one `Input` and Save/Cancel. Desktop keeps current inline narrow input.

2. **`paired-compact` case** — on mobile, render a single button labeled with the field name + current `start / finish` summary. Dialog has two stacked labeled inputs (Start / Finish or Start / Goal) with one Save action that writes both keys via `onChangeAny`.

3. **`MedList`** — on mobile only, swap each `Name` / `Reason` / `Doctor` `Input` for a tap-to-edit button + dialog. Keep the row layout (#, three text cells, M/A/N checkboxes) but each text cell becomes a button that previews its value.

4. **`MeasurementGrid`** (used by Weekly Weight Tracker and Bi-Monthly Measurement Tracker) — on mobile, replace each cell `Input` with a tap-to-edit button + dialog. Dialog title shows "Wk N · {Column}".

Add a small shared helper inside the file (e.g. `useCellEditor`) that returns `{ open, openWith, draft, setDraft, save, cancel, isOpen }` to avoid duplicating dialog state across the four call sites.

Mobile detection uses the existing `useIsMobile()` hook (already imported).

No schema/data changes — values are written through the same `onChange` / `onChangeAny` callbacks. Existing entries remain compatible.

## Out of scope

- Standard-size inputs (regular text/textarea/date/number) — already easy to tap.
- Rating / mood-rating / success-fail buttons — already 32–40px tap targets.
- Calendar grid and daily-month grid — already use this popup pattern.
- Habit grids — checkboxes only, already finger-friendly.