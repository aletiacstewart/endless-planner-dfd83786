/**
 * Schema definitions for every unique page in the Change of Life - Wellness Journey.
 * Each page type maps to a configurable form rendered by PageRenderer.
 */

export type { FieldValue } from "./db";

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "month"
  | "year"
  | "number"
  | "rating" // 1..max selectable
  | "mood-rating" // 1..5 selectable rendered as face icons
  | "success-fail" // pair of pill buttons (Success / Failed)
  | "weekday-checkboxes" // S M T W T F S
  | "checkbox"
  | "checkbox-group"
  | "ingredients-list" // dynamic list of strings
  | "calendar-grid" // 31 day cells with notes
  | "habit-grid" // habits x 31 days (boolean marks)
  | "month-tracker" // 12 months x N items grid (boolean marks)
  | "measurement-grid" // fixed N rows x labelled columns of free text
  | "daily-month-grid" // 31 days x 12 months free-text values + Achieved column
  | "yearly-habit-grid" // 12 month rows: Begin/Break + label + 31 check cells
  | "med-list" // compact medication list: # + Name + Reason + Doctor rows
  | "doctor-picker" // dropdown bound to the shared Doctors directory + add-new dialog
  | "paired-compact" // single label with two small Start/Finish inputs side-by-side
  | "priority-list" // N numbered rows of checkbox + text (Top priorities)
  | "hourly-timeline" // hourly schedule slots with text per hour
  | "note-style" // paper-style picker (blank/lined/dot/cornell) + rich body
  | "smart-goal" // structured SMART goal block
  | "mood-log" // 7-day weekday mood face row
  | "gratitude-list"; // 3 numbered gratitude text rows

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  rows?: number;
  max?: number; // for rating
  options?: string[]; // for checkbox-group
  defaultItems?: string[]; // for habit-grid / month-tracker
  span?: 1 | 2; // grid span
  /** For measurement-grid: column labels. */
  columns?: string[];
  /** For measurement-grid: number of rows (default 26). */
  rowCount?: number;
  /** For measurement-grid: row-label prefix (e.g. "Wk"). */
  rowLabel?: string;
  /** For rating: render a small companion text input on the same row, bound to this other field key. */
  otherKey?: string;
  /** For success-fail: render a blank text input alongside the buttons (user-typed label) bound to this key. Hides the field's own label. */
  inputKey?: string;
  /** Placeholder for the companion input (used with inputKey). */
  inputPlaceholder?: string;
  /** For success-fail: render a small Begin/Break toggle before the input, bound to this key. */
  modeKey?: string;
  /** For text/number: render a narrow input sized for ~3 characters. */
  compact?: boolean;
  /** For paired-compact: keys + sub-labels for the two inputs. */
  pairKeys?: [string, string];
  pairLabels?: [string, string];
}

export interface SectionDef {
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
  /** Optional column headings displayed above each column of the grid (length should match `columns`). */
  columnTitles?: string[];
  /** Which side of a two-page spread this section belongs on. Defaults to an even split. */
  page?: 1 | 2;
  fields: FieldDef[];
  /** Optional side-by-side groups rendered inside the same card. When provided, each group becomes its own column with its own title and stacked fields. */
  groups?: { title?: string; columns?: 1 | 2 | 3; fields: FieldDef[] }[];
}

export interface PageTypeDef {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // lucide icon name
  sections: SectionDef[];
  /** Build a short summary for entry list cards */
  summary?: (values: Record<string, unknown>) => string;
}

const goalKeys = Array.from({ length: 6 }, (_, i) => `goal_${i + 1}`);

export const PAGE_TYPES: PageTypeDef[] = [
  {
    id: "my-goals",
    name: "My Goals",
    shortName: "Goals",
    description: "Six SMART goals with milestones, obstacles, and a weekly review.",
    icon: "Target",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year", placeholder: "2026", span: 2 }],
      },
      ...goalKeys.map((k, i) => ({
        title: `Goal ${i + 1}`,
        columns: 2 as const,
        fields: [
          {
            key: k,
            label: "Goal",
            type: "textarea" as const,
            rows: 2,
            placeholder: "What do you want to achieve?",
            span: 2 as const,
          },
          {
            key: `smart_${i + 1}`,
            label: "SMART breakdown",
            type: "smart-goal" as const,
            span: 2 as const,
          },
          {
            key: `milestones_${i + 1}`,
            label: "Milestones",
            type: "priority-list" as const,
            max: 4,
            span: 2 as const,
          },
          {
            key: `obstacles_${i + 1}`,
            label: "Obstacles",
            type: "textarea" as const,
            rows: 2,
          },
          {
            key: `actions_${i + 1}`,
            label: "Action steps",
            type: "textarea" as const,
            rows: 2,
          },
          {
            key: `deadline_${i + 1}`,
            label: "Deadline",
            type: "date" as const,
          },
          {
            key: `review_${i + 1}`,
            label: "Weekly review",
            type: "textarea" as const,
            rows: 2,
          },
        ],
      })),
      {
        fields: [
          {
            key: "reward",
            label: "Reward for reaching all goals",
            type: "textarea",
            rows: 3,
            placeholder: "How will you celebrate?",
            span: 2,
          },
        ],
      },
    ],
    summary: (v) => (v.goal_1 as string) || "Untitled goals",
  },
  {
    id: "yearly-calendar",
    name: "Yearly Calendar",
    shortName: "Year",
    description: "Notes for each month of the year.",
    icon: "CalendarRange",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year", placeholder: "2025" }],
      },
      {
        title: "Months",
        columns: 3,
        fields: [
          "January", "February", "March",
          "April", "May", "June",
          "July", "August", "September",
          "October", "November", "December",
        ].map((m) => ({
          key: `month_${m.toLowerCase()}`,
          label: m,
          type: "textarea",
          rows: 4,
          placeholder: "Key events, plans, notes…",
        })),
      },
    ],
    summary: (v) => (v.year ? `Year ${v.year}` : "Yearly calendar"),
  },
  {
    id: "monthly-calendar",
    name: "Monthly Calendar",
    shortName: "Month",
    description: "Month grid with goals and notes.",
    icon: "Calendar",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "month", label: "Month", type: "month", placeholder: "January" },
          { key: "year", label: "Year", type: "year", placeholder: "2025" },
        ],
      },
      {
        title: "Days",
        fields: [{ key: "calendar", label: "Calendar grid", type: "calendar-grid", span: 2 }],
      },
      {
        title: "Monthly priorities",
        fields: [
          { key: "priorities", label: "Top 5 priorities this month", type: "priority-list", max: 5, span: 2 },
        ],
      },
      {
        title: "Monthly focus",
        columns: 1,
        fields: [
          { key: "focus_word", label: "Focus / word of the month", type: "text", span: 2 },
          { key: "goal_1", label: "Goal 1", type: "textarea", rows: 2, span: 2 },
          { key: "goal_2", label: "Goal 2", type: "textarea", rows: 2, span: 2 },
          { key: "notes", label: "Notes", type: "textarea", rows: 4, span: 2 },
        ],
      },
      {
        title: "Habits this month",
        description: "Mark daily habits across the month.",
        fields: [{ key: "habits", label: "Habits", type: "habit-grid", span: 2 }],
      },
    ],
    summary: (v) => [v.month, v.year].filter(Boolean).join(" ") || "Monthly calendar",
  },
  {
    id: "weekly-calendar",
    name: "Weekly Calendar",
    shortName: "Week",
    description: "Plan the week, set weekly goals, reflect on it.",
    icon: "CalendarDays",
    sections: [
      {
        fields: [{ key: "week_of", label: "Week of", type: "date", span: 2 }],
      },
      {
        title: "Days",
        columns: 1,
        fields: [
          { key: "monday", label: "Monday", type: "textarea", rows: 4 },
          { key: "tuesday", label: "Tuesday", type: "textarea", rows: 4 },
          { key: "wednesday", label: "Wednesday", type: "textarea", rows: 4 },
          { key: "thursday", label: "Thursday", type: "textarea", rows: 4 },
          { key: "friday", label: "Friday", type: "textarea", rows: 4 },
          { key: "saturday", label: "Saturday", type: "textarea", rows: 4 },
          { key: "sunday", label: "Sunday", type: "textarea", rows: 4 },
        ],
      },
      {
        fields: [
          { key: "weekly_goals", label: "Weekly Goals", type: "textarea", rows: 4, span: 2 },
          { key: "reflection", label: "How did your week go?", type: "textarea", rows: 4, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.week_of ? `Week of ${v.week_of}` : "Weekly plan"),
  },
  {
    id: "daily-tracker",
    name: "Daily Tracker",
    shortName: "Daily",
    description: "A simple daily log — date, goal, meals, and wellness notes.",
    icon: "Sun",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          {
            key: "weekday",
            label: "Day",
            type: "checkbox-group",
            options: ["S", "M", "T", "W", "T", "F", "S"],
          },
        ],
      },
      {
        columns: 2,
        fields: [
          { key: "daily_goal", label: "Daily Goal", type: "textarea", rows: 3 },
          { key: "daily_habit", label: "Daily Habit Tracker", type: "success-fail" },
        ],
      },
      {
        title: "Top 3 priorities",
        description: "The three things that matter most today.",
        fields: [
          { key: "priorities", label: "Top priorities", type: "priority-list", max: 3, span: 2 },
        ],
      },
      {
        title: "Hourly schedule",
        description: "Time-block the day.",
        fields: [
          { key: "hourly", label: "Schedule", type: "hourly-timeline", span: 2 },
        ],
      },
      {
        title: "Meals",
        fields: [
          { key: "breakfast", label: "Breakfast", type: "text", span: 2 },
          { key: "breakfast_notes", label: "Breakfast — Notes", type: "textarea", rows: 2, span: 2 },
          { key: "lunch", label: "Lunch", type: "text", span: 2 },
          { key: "lunch_notes", label: "Lunch — Notes", type: "textarea", rows: 2, span: 2 },
          { key: "dinner", label: "Dinner", type: "text", span: 2 },
          { key: "dinner_notes", label: "Dinner — Notes", type: "textarea", rows: 2, span: 2 },
          { key: "snacks", label: "Snacks", type: "text", span: 2 },
          { key: "snacks_notes", label: "Snacks — Notes", type: "textarea", rows: 2, span: 2 },
        ],
      },
      {
        title: "Wellness",
        description: "Tick a box for each unit. Add anything else in the Other field.",
        columns: 1,
        fields: [
          {
            key: "water",
            label: "Water intake (glasses)",
            type: "checkbox-group",
            options: ["1", "2", "3", "4", "5", "6", "7", "8"],
            otherKey: "water_other",
            span: 2,
          },
          {
            key: "meals",
            label: "Meal intake",
            type: "checkbox-group",
            options: ["1", "2", "3", "4", "5", "6"],
            otherKey: "meals_other",
            span: 2,
          },
          {
            key: "caffeine",
            label: "Caffeine / Other",
            type: "checkbox-group",
            options: ["1", "2", "3", "4"],
            otherKey: "caffeine_other",
            span: 2,
          },
          {
            key: "sweets",
            label: "Sweets / Savory",
            type: "checkbox-group",
            options: ["1", "2", "3", "4"],
            otherKey: "sweets_other",
            span: 2,
          },
          {
            key: "habits",
            label: "Habits (smoking, vaping, dipping, other)",
            type: "checkbox-group",
            options: ["1", "2", "3", "4", "5", "6", "7", "8"],
            otherKey: "habits_other",
            span: 2,
          },
          {
            key: "mood",
            label: "Mood",
            type: "checkbox-group",
            options: ["Anger", "Fear", "Sadness", "Disgust", "Joy"],
            otherKey: "mood_other",
            span: 2,
          },
          {
            key: "sleep",
            label: "Sleep (hours)",
            type: "checkbox-group",
            options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            otherKey: "sleep_other",
            span: 2,
          },
        ],
      },
      {
        title: "Reflection",
        columns: 2,
        fields: [
          { key: "gratitude", label: "Grateful for", type: "gratitude-list", max: 3 },
          { key: "day_rating", label: "How the day felt", type: "mood-rating" },
          { key: "daily_notes", label: "Wellness Notes", type: "textarea", rows: 5, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date ? `${v.date}` : "Daily entry"),
  },
  {
    id: "complete-tracker",
    name: "Complete Tracker",
    shortName: "Complete",
    description: "All-in-one daily log — meals, vitals, wellness, meds, measurements, monthly calendar and more. Auto-syncs to your individual trackers.",
    icon: "LayoutGrid",
    sections: [
      {
        columns: 2,
        page: 1,
        fields: [
          { key: "date", label: "Date", type: "date" },
          {
            key: "weekday",
            label: "Day",
            type: "checkbox-group",
            options: ["S", "M", "T", "W", "T", "F", "S"],
          },
        ],
      },
      {
        columns: 2,
        page: 1,
        fields: [
          { key: "daily_goal", label: "Daily Goal", type: "textarea", rows: 3 },
          { key: "daily_habit", label: "Daily Habit Tracker", type: "success-fail" },
        ],
      },
      {
        title: "Monthly Calendar",
        description: "Quick reference for the month — tap a day to add or view a note.",
        page: 1,
        fields: [
          { key: "month_calendar", label: "Monthly calendar", type: "calendar-grid", compact: true, span: 2 },
        ],
      },
      {
        title: "Meals",
        page: 2,
        fields: [
          { key: "breakfast", label: "Breakfast", type: "text", span: 2 },
          { key: "breakfast_bs", label: "Breakfast — Blood Sugar", type: "text" },
          { key: "breakfast_bp", label: "Breakfast — Blood Pressure", type: "text" },
          { key: "breakfast_o2", label: "Breakfast — O₂ Levels", type: "text" },
          { key: "breakfast_notes", label: "Breakfast — Notes", type: "textarea", rows: 3, span: 2 },

          { key: "lunch", label: "Lunch", type: "text", span: 2 },
          { key: "lunch_bs", label: "Lunch — Blood Sugar", type: "text" },
          { key: "lunch_bp", label: "Lunch — Blood Pressure", type: "text" },
          { key: "lunch_o2", label: "Lunch — O₂ Levels", type: "text" },
          { key: "lunch_notes", label: "Lunch — Notes", type: "textarea", rows: 3, span: 2 },

          { key: "dinner", label: "Dinner", type: "text", span: 2 },
          { key: "dinner_bs", label: "Dinner — Blood Sugar", type: "text" },
          { key: "dinner_bp", label: "Dinner — Blood Pressure", type: "text" },
          { key: "dinner_o2", label: "Dinner — O₂ Levels", type: "text" },
          { key: "dinner_notes", label: "Dinner — Notes", type: "textarea", rows: 3, span: 2 },

          { key: "snacks", label: "Snacks", type: "text", span: 2 },
          { key: "snacks_bs", label: "Snacks — Blood Sugar", type: "text" },
          { key: "snacks_bp", label: "Snacks — Blood Pressure", type: "text" },
          { key: "snacks_o2", label: "Snacks — O₂ Levels", type: "text" },
          { key: "snacks_notes", label: "Snacks — Notes", type: "textarea", rows: 3, span: 2 },
        ],
      },
      {
        title: "Wellness",
        page: 2,
        columns: 2,
        fields: [
              { key: "water", label: "Water intake (glasses)", type: "checkbox-group", options: ["1","2","3","4","5","6","7","8"], otherKey: "water_other", span: 2 },
              { key: "meals", label: "Meal intake", type: "checkbox-group", options: ["1","2","3","4","5","6"], otherKey: "meals_other", span: 2 },
              { key: "caffeine", label: "Caffeine / Other", type: "checkbox-group", options: ["1","2","3","4"], otherKey: "caffeine_other" },
              { key: "sweets", label: "Sweets / Savory", type: "checkbox-group", options: ["1","2","3","4"], otherKey: "sweets_other" },
              { key: "habits", label: "Habits (smoking, vaping, dipping, other)", type: "checkbox-group", options: ["1","2","3","4","5","6","7","8"], otherKey: "habits_other", span: 2 },
              { key: "mood", label: "Mood", type: "checkbox-group", options: ["Anger","Fear","Sadness","Disgust","Joy"], otherKey: "mood_other", span: 2 },
              { key: "sleep", label: "Sleep (hours)", type: "checkbox-group", options: ["1","2","3","4","5","6","7","8","9","10","11","12"], otherKey: "sleep_other", span: 2 },
        ],
      },
      {
        title: "Self-Care",
        page: 1,
        columns: 2,
        fields: [
          { key: "self_physical", label: "Physical Self-Care", type: "textarea", rows: 3, span: 2 },
          { key: "self_emotional", label: "Emotional Self-Care", type: "textarea", rows: 3, span: 2 },
          { key: "self_spiritual", label: "Spiritual Self-Care", type: "textarea", rows: 3, span: 2 },
        ],
      },
      {
        title: "Workout",
        page: 1,
        columns: 1,
        fields: [
              { key: "cardio", label: "Cardio", type: "text", span: 2 },
              { key: "yoga", label: "Yoga", type: "text", span: 2 },
              { key: "weights", label: "Weights", type: "text", span: 2 },
              { key: "stretch", label: "Stretch", type: "text", span: 2 },
              { key: "other", label: "Other", type: "text", span: 2 },
              { key: "rest_day", label: "Rest day", type: "checkbox", span: 2 },
        ],
      },
      {
        title: "Measurements",
        page: 1,
        columns: 1,
        fields: [
              ...([
                ["body_fat", "Body Fat %"],
                ["neck", "Neck"],
                ["chest", "Chest"],
                ["bicep", "Bicep"],
                ["waist", "Waist"],
                ["hips", "Hips"],
                ["thigh", "Thigh"],
                ["calf", "Calf"],
              ] as const).map(([k, label]) => ({
                key: `m_${k}`,
                label,
                type: "paired-compact" as const,
                pairKeys: [`m_${k}_start`, `m_${k}_today`] as [string, string],
                pairLabels: ["Start", "Today"] as [string, string],
              })),
              {
                key: "weight",
                label: "Weight",
                type: "paired-compact" as const,
                pairKeys: ["weight_start", "weight_today"] as [string, string],
                pairLabels: ["Start", "Today"] as [string, string],
              },
              { key: "weight_today_notes", label: "Weight — notes", type: "text" },
              { key: "weight_result", label: "Result Weight", type: "text", compact: true },
        ],
      },
      {
        page: 2,
        fields: [
          { key: "daily_notes", label: "Wellness Notes", type: "textarea", rows: 5, span: 2 },
        ],
      },
      {
        title: "Medical Records",
        description: "Track appointment notes, test results, and lab notes.",
        page: 2,
        fields: [
          { key: "doctor_id", label: "Doctor seen", type: "doctor-picker", span: 2 },
        ],
      },
      {
        columns: 1,
        page: 2,
        fields: [
          { key: "medical_appointment_notes", label: "Appointment Notes", type: "textarea", rows: 5, span: 2 },
          { key: "test_results", label: "Test Results", type: "textarea", rows: 5, span: 2 },
          { key: "lab_result_notes", label: "Lab Result Notes", type: "textarea", rows: 5, span: 2 },
        ],
      },
      {
        title: "Medicines",
        description: "Tick M (Morning), A (Afternoon), or N (Night) for each medication.",
        page: 2,
        fields: [
          { key: "med_list", label: "Medications", type: "med-list", rowCount: 12, span: 2 },
        ],
      },
      {
        title: "Fun Activity Tracker",
        description: "Write in your own fun activities, then mark Success or Failed for the day.",
        columns: 1,
        page: 1,
        fields: Array.from({ length: 3 }, (_, i) => i + 1).map((n) => ({
          key: `fun_${n}`,
          label: `Fun ${n}`,
          type: "success-fail" as const,
          inputKey: `fun_${n}_label`,
          inputPlaceholder: "Fun activity…",
          span: 2 as const,
        })),
      },
      {
        title: "Begin / Break Habits",
        description: "Write in each habit, choose Begin or Break, then mark Success or Failed for the day.",
        columns: 1,
        page: 1,
        fields: Array.from({ length: 3 }, (_, i) => i + 1).map((n) => ({
          key: `habit_${n}`,
          label: `Habit ${n}`,
          type: "success-fail" as const,
          inputKey: `habit_${n}_label`,
          inputPlaceholder: "Habit…",
          modeKey: `habit_${n}_mode`,
          span: 2 as const,
        })),
      },
      {
        title: "Cleaning",
        description: "What you cleaned today — syncs to your yearly Cleaning Check List.",
        page: 1,
        fields: [
          { key: "cleaning_today", label: "Cleaning today", type: "textarea", rows: 3, span: 2 },
        ],
      },
      {
        title: "This Week",
        description: "Today's note plus the week's goals & reflection — sync to your Weekly Calendar.",
        columns: 1,
        page: 1,
        fields: [
          { key: "week_note_today", label: "Note for today's weekday", type: "textarea", rows: 3, span: 2 },
          { key: "weekly_goals", label: "Weekly Goals", type: "textarea", rows: 3, span: 2 },
          { key: "weekly_reflection", label: "How is your week going?", type: "textarea", rows: 3, span: 2 },
        ],
      },
      {
        title: "This Year",
        description: "A note for this month plus a yearly focus — sync to your Yearly Calendar.",
        columns: 1,
        page: 1,
        fields: [
          { key: "month_note_today", label: "Note for this month", type: "textarea", rows: 3, span: 2 },
          { key: "yearly_focus", label: "Yearly Focus / Word of the Year", type: "textarea", rows: 2, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date ? `${v.date}` : "Daily entry"),
  },
  {
    id: "yearly-habit-tracker",
    name: "Yearly Habit Tracker",
    shortName: "Year Habits",
    description: "12 months of habits to begin or break, with daily check-ins.",
    icon: "CalendarCheck",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        fields: [
          {
            key: "yearly_habits",
            label: "Habits by month",
            type: "yearly-habit-grid",
            span: 2,
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Yearly habits ${v.year}` : "Yearly habit tracker"),
  },
  {
    id: "weight-tracker",
    name: "Bi-Monthly Weight Tracker",
    shortName: "Weight",
    description: "Track your weight every week for 26 weeks.",
    icon: "Scale",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "start_date", label: "Start date", type: "date" },
          { key: "goal_weight", label: "Goal weight", type: "text" },
        ],
      },
      {
        fields: [
          {
            key: "weight_log",
            label: "Weekly weight log",
            type: "measurement-grid",
            span: 2,
            rowCount: 26,
            rowLabel: "Wk",
            columns: ["Date", "Weight", "Difference", "Notes"],
          },
        ],
      },
    ],
    summary: (v) => (v.start_date ? `Weight from ${v.start_date}` : "Weight tracker"),
  },
  {
    id: "measurement-tracker",
    name: "Bi-Monthly Measurement Tracker",
    shortName: "Measure",
    description: "Body measurements every week for 26 weeks.",
    icon: "Ruler",
    sections: [
      {
        fields: [{ key: "start_date", label: "Start date", type: "date" }],
      },
      {
        fields: [
          {
            key: "measurements",
            label: "Measurements",
            type: "measurement-grid",
            span: 2,
            rowCount: 26,
            rowLabel: "Wk",
            columns: ["Fat %", "Neck", "Chest", "Bicep", "Waist", "Hips", "Thigh", "Calf"],
          },
        ],
      },
    ],
    summary: (v) => (v.start_date ? `Measurements from ${v.start_date}` : "Measurement tracker"),
  },
  {
    id: "blood-sugar-tracker",
    name: "Yearly Blood Sugar Tracker",
    shortName: "Sugar",
    description: "Daily blood sugar readings for the whole year.",
    icon: "Droplet",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        fields: [
          {
            key: "blood_sugar",
            label: "Daily readings",
            type: "daily-month-grid",
            span: 2,
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Blood sugar ${v.year}` : "Blood sugar tracker"),
  },
  {
    id: "blood-pressure-tracker",
    name: "Yearly Blood Pressure Tracker",
    shortName: "BP",
    description: "Daily blood pressure readings for the whole year.",
    icon: "HeartPulse",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        fields: [
          {
            key: "blood_pressure",
            label: "Daily readings",
            type: "daily-month-grid",
            span: 2,
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Blood pressure ${v.year}` : "Blood pressure tracker"),
  },
  {
    id: "oxygen-tracker",
    name: "Yearly Oxygen (O₂) Tracker",
    shortName: "Oxygen",
    description: "Daily oxygen (O₂) readings for the whole year.",
    icon: "Activity",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        fields: [
          {
            key: "oxygen",
            label: "Daily readings",
            type: "daily-month-grid",
            span: 2,
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Oxygen ${v.year}` : "Oxygen tracker"),
  },
  {
    id: "self-care-checklist",
    name: "Self-Care Check List",
    shortName: "Self-Care",
    description: "A weekly self-care ritual — categorized checklists, mood, sleep, and gratitude.",
    icon: "HeartHandshake",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "week_of", label: "Week of", type: "date" },
          { key: "focus_word", label: "Focus this week", type: "text" },
        ],
      },
      {
        title: "This week's self-care",
        groups: [
          {
            title: "Physical",
            fields: [
              { key: "phys_checklist", label: "Physical", type: "checkbox-group", options: ["Move", "Sleep 8h", "Hydrate", "Nourish", "Sunlight", "Stretch"] },
              { key: "phys_notes", label: "Notes", type: "textarea", rows: 3 },
            ],
          },
          {
            title: "Emotional",
            fields: [
              { key: "emo_checklist", label: "Emotional", type: "checkbox-group", options: ["Journal", "Feel it", "Cry if needed", "Talk it out", "Set a boundary", "Rest"] },
              { key: "emo_notes", label: "Notes", type: "textarea", rows: 3 },
            ],
          },
          {
            title: "Spiritual",
            fields: [
              { key: "spir_checklist", label: "Spiritual", type: "checkbox-group", options: ["Pray", "Meditate", "Nature", "Read", "Gratitude", "Silence"] },
              { key: "spir_notes", label: "Notes", type: "textarea", rows: 3 },
            ],
          },
          {
            title: "Social",
            fields: [
              { key: "soc_checklist", label: "Social", type: "checkbox-group", options: ["Call someone", "Say no", "Ask for help", "Quality time", "Alone time", "Community"] },
              { key: "soc_notes", label: "Notes", type: "textarea", rows: 3 },
            ],
          },
        ],
        fields: [],
      },
      {
        title: "How the week felt",
        columns: 2,
        fields: [
          { key: "mood_log", label: "Daily mood (S M T W T F S — tap to cycle)", type: "mood-log", span: 2 },
          { key: "water_log", label: "Water (glasses/day avg)", type: "text" },
          { key: "sleep_log", label: "Sleep (hours/night avg)", type: "text" },
          { key: "gratitude", label: "Grateful for", type: "gratitude-list", max: 3, span: 2 },
          { key: "week_reflection", label: "Weekly reflection", type: "textarea", rows: 4, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.week_of ? `Self-care ${v.week_of}` : "Self-care week"),
  },
  {
    id: "cleaning-checklist",
    name: "Cleaning Check List",
    shortName: "Cleaning",
    description: "Household chores tracked daily across the year.",
    icon: "Sparkle",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        fields: [
          {
            key: "cleaning",
            label: "Daily chores",
            type: "daily-month-grid",
            span: 2,
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Cleaning ${v.year}` : "Cleaning check list"),
  },
  {
    id: "recipe",
    name: "Recipe",
    shortName: "Recipe",
    description: "Capture a recipe with ingredients and directions.",
    icon: "ChefHat",
    sections: [
      {
        fields: [{ key: "name", label: "Recipe name", type: "text", span: 2, placeholder: "Grandma's stew" }],
      },
      {
        columns: 2,
        fields: [
          { key: "difficulty", label: "Difficulty", type: "rating", max: 5 },
          { key: "servings", label: "Servings", type: "rating", max: 5 },
          { key: "prep_time", label: "Prep time (min)", type: "number" },
          { key: "cook_time", label: "Cooking time (min)", type: "number" },
        ],
      },
      {
        fields: [{ key: "ingredients", label: "Ingredients", type: "ingredients-list", span: 2 }],
      },
      {
        fields: [{ key: "directions", label: "Directions", type: "textarea", rows: 8, span: 2 }],
      },
    ],
    summary: (v) => (v.name as string) || "New recipe",
  },
  {
    id: "notes",
    name: "Notes",
    shortName: "Note",
    description: "Free-form notes — pick your paper: blank, lined, dot grid, or Cornell.",
    icon: "NotebookPen",
    sections: [
      {
        fields: [
          { key: "title", label: "Title", type: "text", span: 2 },
          { key: "note", label: "Notes", type: "note-style", span: 2 },
        ],
      },
    ],
    summary: (v) => {
      const n = v.note as { body?: string } | undefined;
      return (v.title as string) || n?.body?.slice(0, 60) || "Untitled note";
    },
  },
  {
    id: "workout-tracker",
    name: "Yearly Workout Tracker",
    shortName: "Workout",
    description: "Daily cardio, weights, yoga, stretch and rest days across the year.",
    icon: "Dumbbell",
    sections: [
      { fields: [{ key: "year", label: "Year", type: "year" }] },
      { title: "Cardio", fields: [{ key: "cardio", label: "Cardio", type: "daily-month-grid", span: 2 }] },
      { title: "Weights", fields: [{ key: "weights", label: "Weights", type: "daily-month-grid", span: 2 }] },
      { title: "Yoga", fields: [{ key: "yoga", label: "Yoga", type: "daily-month-grid", span: 2 }] },
      { title: "Stretch", fields: [{ key: "stretch", label: "Stretch", type: "daily-month-grid", span: 2 }] },
      { title: "Rest day", fields: [{ key: "rest_day", label: "Rest day", type: "daily-month-grid", span: 2 }] },
      { title: "Other", fields: [{ key: "other", label: "Other", type: "daily-month-grid", span: 2 }] },
    ],
    summary: (v) => (v.year ? `Workout ${v.year}` : "Yearly workout"),
  },
  {
    id: "medications",
    name: "Medications",
    shortName: "Meds",
    description: "Master list of medications — name, reason, doctor and timing. Reference for the Complete Tracker.",
    icon: "Pill",
    sections: [
      {
        title: "Medications",
        description: "Tick M (Morning), A (Afternoon), or N (Night) for each medication.",
        fields: [
          { key: "med_list", label: "Medications", type: "med-list", rowCount: 20, span: 2 },
        ],
      },
    ],
    summary: (v) => {
      const list = (v.med_list as Record<string, string> | undefined) ?? {};
      const first = Object.entries(list).find(([k, val]) => k.endsWith("-name") && val)?.[1];
      return first ? `${first}…` : "Medications";
    },
  },
  {
    id: "medical-records",
    name: "Medical Records",
    shortName: "Medical",
    description: "Per-visit log of appointment notes, test results and lab notes.",
    icon: "Stethoscope",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "doctor_id", label: "Doctor seen", type: "doctor-picker" },
        ],
      },
      {
        columns: 1,
        fields: [
          { key: "medical_appointment_notes", label: "Appointment Notes", type: "textarea", rows: 6, span: 2 },
          { key: "test_results", label: "Test Results", type: "textarea", rows: 6, span: 2 },
          { key: "lab_result_notes", label: "Lab Result Notes", type: "textarea", rows: 6, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || "Medical record",
  },
  {
    id: "yearly-focus",
    name: "Yearly Focus",
    shortName: "Focus",
    description: "Your word of the year — a single guiding focus that syncs with the Complete Tracker.",
    icon: "Compass",
    sections: [
      { fields: [{ key: "year", label: "Year", type: "year" }] },
      {
        fields: [
          {
            key: "yearly_focus",
            label: "Yearly Focus / Word of the Year",
            type: "textarea",
            rows: 4,
            span: 2,
            placeholder: "What's your word or theme this year?",
          },
        ],
      },
    ],
    summary: (v) => ((v.yearly_focus as string) || "").slice(0, 60) || (v.year ? `Focus ${v.year}` : "Yearly focus"),
  },
  {
    id: "brain-dump",
    name: "Brain Dump",
    shortName: "Brain Dump",
    description: "Empty your head, then sort what matters from what can wait.",
    icon: "Brain",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "mood", label: "Mood", type: "mood-rating" },
        ],
      },
      {
        title: "Everything on your mind",
        fields: [
          { key: "dump", label: "Dump", type: "note-style", span: 2 },
        ],
      },
      {
        title: "Sort it out",
        columns: 2,
        fields: [
          { key: "do_now", label: "Do now", type: "priority-list", max: 5 },
          { key: "do_later", label: "Do later", type: "priority-list", max: 5 },
          { key: "delegate", label: "Delegate / ask for help", type: "textarea", rows: 3 },
          { key: "let_go", label: "Let go", type: "textarea", rows: 3 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || "Brain dump",
  },
  {
    id: "fitness-tracker",
    name: "Fitness Tracker",
    shortName: "Fitness",
    description: "Workouts, cardio, water, and how the body felt.",
    icon: "Dumbbell",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "weight", label: "Weight", type: "text" },
          { key: "goal", label: "Today's goal", type: "text", span: 2 },
        ],
      },
      {
        title: "Strength",
        fields: [
          {
            key: "strength",
            label: "Exercise / Sets x Reps / Weight",
            type: "measurement-grid",
            span: 2,
          },
        ],
      },
      {
        title: "Cardio & activity",
        columns: 2,
        fields: [
          { key: "cardio_type", label: "Cardio type", type: "text" },
          { key: "cardio_duration", label: "Duration (min)", type: "number" },
          { key: "cardio_distance", label: "Distance", type: "text" },
          { key: "steps", label: "Steps", type: "number" },
        ],
      },
      {
        title: "Fuel & recovery",
        columns: 2,
        fields: [
          { key: "water", label: "Water (glasses)", type: "rating", max: 10 },
          { key: "sleep_hours", label: "Sleep (hours)", type: "text" },
          { key: "energy", label: "Energy", type: "rating", max: 5 },
          { key: "soreness", label: "Soreness", type: "rating", max: 5 },
          { key: "notes", label: "How it felt", type: "textarea", rows: 3, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || (v.goal as string) || "Workout",
  },
  {
    id: "adhd-toolkit",
    name: "ADHD Daily Toolkit",
    shortName: "ADHD",
    description: "One page, one day — anchor priorities, time-block, and celebrate wins.",
    icon: "Zap",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "med_taken", label: "Meds taken", type: "checkbox" },
          { key: "focus_word", label: "One-word intention", type: "text", span: 2 },
        ],
      },
      {
        title: "The 3 that matter today",
        fields: [
          { key: "big_three", label: "Big 3", type: "priority-list", max: 3, span: 2 },
        ],
      },
      {
        title: "Time-block the day",
        fields: [
          { key: "schedule", label: "Hourly plan", type: "hourly-timeline", span: 2 },
        ],
      },
      {
        title: "Brain state check-ins",
        columns: 2,
        fields: [
          { key: "morning_mood", label: "Morning mood", type: "mood-rating" },
          { key: "midday_mood", label: "Midday mood", type: "mood-rating" },
          { key: "evening_mood", label: "Evening mood", type: "mood-rating" },
          { key: "focus_level", label: "Overall focus", type: "rating", max: 5 },
        ],
      },
      {
        title: "Distractions & wins",
        columns: 2,
        fields: [
          { key: "distractions", label: "What pulled me away", type: "textarea", rows: 4 },
          { key: "wins", label: "Wins (however small)", type: "textarea", rows: 4 },
          { key: "tomorrow", label: "Set up tomorrow — one thing", type: "textarea", rows: 2, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || (v.focus_word as string) || "ADHD toolkit",
  },

  // ============ BUDGET PLANNER ============
  {
    id: "budget-monthly",
    name: "Monthly Budget",
    shortName: "Budget",
    description: "Income, fixed expenses, variable spending, and what's left.",
    icon: "Wallet",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "month", label: "Month", type: "month" },
          { key: "target_savings", label: "Savings goal ($)", type: "number" },
        ],
      },
      {
        title: "Income",
        fields: [
          { key: "income", label: "Source / Amount", type: "measurement-grid", span: 2 },
        ],
      },
      {
        title: "Fixed expenses",
        fields: [
          { key: "fixed", label: "Bill / Due / Amount / Paid", type: "measurement-grid", span: 2 },
        ],
      },
      {
        title: "Variable spending",
        fields: [
          { key: "variable", label: "Category / Budgeted / Actual", type: "measurement-grid", span: 2 },
        ],
      },
      {
        title: "Reflection",
        columns: 2,
        fields: [
          { key: "wins", label: "Money wins", type: "textarea", rows: 3 },
          { key: "leaks", label: "Money leaks", type: "textarea", rows: 3 },
          { key: "next", label: "Next month — one change", type: "textarea", rows: 2, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.month as string) || "Monthly budget",
  },
  {
    id: "debt-tracker",
    name: "Debt Tracker",
    shortName: "Debt",
    description: "Balances, minimums, and payoff progress.",
    icon: "TrendingDown",
    sections: [
      {
        fields: [
          { key: "debts", label: "Creditor / Balance / APR / Min / Paid", type: "measurement-grid", span: 2 },
        ],
      },
      {
        columns: 2,
        fields: [
          { key: "strategy", label: "Strategy (snowball/avalanche)", type: "text" },
          { key: "payoff_date", label: "Target debt-free date", type: "date" },
          { key: "notes", label: "Notes", type: "textarea", rows: 4, span: 2 },
        ],
      },
    ],
    summary: () => "Debt tracker",
  },
  {
    id: "savings-goals",
    name: "Savings Goals",
    shortName: "Savings",
    description: "Sinking funds and long-term savings goals.",
    icon: "PiggyBank",
    sections: [
      {
        fields: [
          { key: "goals", label: "Goal / Target / Saved / Deadline", type: "measurement-grid", span: 2 },
        ],
      },
      {
        fields: [
          { key: "notes", label: "Notes", type: "textarea", rows: 4, span: 2 },
        ],
      },
    ],
    summary: () => "Savings goals",
  },

  // ============ HOME MANAGEMENT ============
  {
    id: "home-info",
    name: "Household Info",
    shortName: "Home Info",
    description: "Emergency contacts, utilities, and important accounts.",
    icon: "Home",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "address", label: "Address", type: "text", span: 2 },
          { key: "emergency", label: "Emergency contact", type: "text" },
          { key: "emergency_phone", label: "Phone", type: "text" },
        ],
      },
      {
        title: "Utilities & services",
        fields: [
          { key: "utilities", label: "Service / Provider / Account / Due", type: "measurement-grid", span: 2 },
        ],
      },
      {
        title: "Important accounts",
        fields: [
          { key: "accounts", label: "Account / Contact / Notes", type: "measurement-grid", span: 2 },
        ],
      },
    ],
    summary: (v) => (v.address as string) || "Household info",
  },
  {
    id: "weekly-cleaning",
    name: "Weekly Cleaning",
    shortName: "Cleaning Week",
    description: "Zone-based weekly cleaning by day.",
    icon: "Sparkles",
    sections: [
      {
        fields: [{ key: "week_of", label: "Week of", type: "date", span: 2 }],
      },
      {
        title: "Daily zones",
        columns: 2,
        fields: [
          { key: "monday", label: "Monday", type: "checkbox-group", options: ["Kitchen", "Trash", "Dishes", "Laundry", "Floors"] },
          { key: "tuesday", label: "Tuesday", type: "checkbox-group", options: ["Bathrooms", "Mirrors", "Toilets", "Sinks"] },
          { key: "wednesday", label: "Wednesday", type: "checkbox-group", options: ["Bedrooms", "Sheets", "Dust", "Vacuum"] },
          { key: "thursday", label: "Thursday", type: "checkbox-group", options: ["Living areas", "Vacuum", "Dust", "Windows"] },
          { key: "friday", label: "Friday", type: "checkbox-group", options: ["Kitchen deep", "Fridge", "Stove", "Sweep"] },
          { key: "saturday", label: "Saturday", type: "checkbox-group", options: ["Errands", "Groceries", "Yard", "Cars"] },
          { key: "sunday", label: "Sunday", type: "checkbox-group", options: ["Reset", "Meal prep", "Plan week", "Rest"] },
        ],
      },
    ],
    summary: (v) => (v.week_of ? `Cleaning ${v.week_of}` : "Weekly cleaning"),
  },
  {
    id: "meal-planning",
    name: "Meal Plan & Grocery",
    shortName: "Meal Plan",
    description: "Weekly meals + a grocery list that stays with them.",
    icon: "ShoppingCart",
    sections: [
      {
        fields: [{ key: "week_of", label: "Week of", type: "date", span: 2 }],
      },
      {
        title: "This week's meals",
        fields: [
          { key: "meals", label: "Day / Breakfast / Lunch / Dinner", type: "measurement-grid", span: 2 },
        ],
      },
      {
        title: "Grocery list",
        columns: 2,
        fields: [
          { key: "produce", label: "Produce", type: "ingredients-list" },
          { key: "protein", label: "Protein", type: "ingredients-list" },
          { key: "pantry", label: "Pantry", type: "ingredients-list" },
          { key: "other", label: "Other", type: "ingredients-list" },
        ],
      },
    ],
    summary: (v) => (v.week_of ? `Meals ${v.week_of}` : "Meal plan"),
  },

  // ============ MENTAL HEALTH ============
  {
    id: "mood-journal",
    name: "Mood Journal",
    shortName: "Mood",
    description: "Track how you're feeling and what shaped it.",
    icon: "Heart",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "mood", label: "Overall mood", type: "mood-rating" },
          { key: "energy", label: "Energy", type: "rating", max: 5 },
          { key: "anxiety", label: "Anxiety", type: "rating", max: 5 },
        ],
      },
      {
        title: "Today's feelings",
        fields: [
          { key: "feelings", label: "Name what you feel", type: "checkbox-group", options: ["Calm", "Happy", "Grateful", "Sad", "Anxious", "Angry", "Overwhelmed", "Lonely", "Hopeful", "Tired"], span: 2 },
        ],
      },
      {
        columns: 2,
        fields: [
          { key: "triggers", label: "What triggered it", type: "textarea", rows: 4 },
          { key: "coping", label: "What helped", type: "textarea", rows: 4 },
          { key: "gratitude", label: "Grateful for", type: "gratitude-list", max: 3, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || "Mood entry",
  },
  {
    id: "therapy-session",
    name: "Therapy Session Notes",
    shortName: "Therapy",
    description: "Prep, reflect, and track between-session homework.",
    icon: "MessageCircle",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Session date", type: "date" },
          { key: "therapist", label: "Therapist", type: "text" },
        ],
      },
      {
        title: "Bring to session",
        fields: [
          { key: "topics", label: "Topics to discuss", type: "priority-list", max: 5, span: 2 },
        ],
      },
      {
        title: "During / after",
        fields: [
          { key: "insights", label: "Insights", type: "note-style", span: 2 },
        ],
      },
      {
        title: "Homework",
        fields: [
          { key: "homework", label: "Between-session practices", type: "priority-list", max: 5, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || "Therapy notes",
  },
  {
    id: "coping-toolkit",
    name: "Coping Toolkit",
    shortName: "Coping",
    description: "The tools that work for you, ready when you need them.",
    icon: "LifeBuoy",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "grounding", label: "Grounding (5-4-3-2-1, breath)", type: "textarea", rows: 4 },
          { key: "movement", label: "Movement that helps", type: "textarea", rows: 4 },
          { key: "people", label: "People I can call", type: "textarea", rows: 4 },
          { key: "places", label: "Places that soothe", type: "textarea", rows: 4 },
          { key: "words", label: "Words / mantras", type: "textarea", rows: 4 },
          { key: "avoid", label: "Things to avoid when low", type: "textarea", rows: 4 },
        ],
      },
      {
        title: "Crisis plan",
        fields: [
          { key: "crisis", label: "Steps if things get dark", type: "textarea", rows: 6, span: 2 },
        ],
      },
    ],
    summary: () => "Coping toolkit",
  },

  // ============ SLEEP, HYDRATION & GRATITUDE ============
  {
    id: "sleep-tracker",
    name: "Sleep Tracker",
    shortName: "Sleep",
    description: "Bedtime, wake time, hours slept and sleep quality across the month.",
    icon: "Moon",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "month", label: "Month", type: "month", placeholder: "January" },
          { key: "sleep_goal", label: "Nightly goal (hours)", type: "text", compact: true },
        ],
      },
      {
        title: "Nightly log",
        description: "One row per night — note bedtime, wake time, total hours and how rested you felt.",
        fields: [
          {
            key: "sleep_log",
            label: "Sleep log",
            type: "measurement-grid",
            span: 2,
            rowCount: 31,
            rowLabel: "Day",
            columns: ["Bedtime", "Wake time", "Hours", "Quality (1-5)", "Notes"],
          },
        ],
      },
      {
        fields: [
          { key: "sleep_reflection", label: "What helped me rest", type: "textarea", rows: 4, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.month ? `Sleep — ${v.month}` : "Sleep tracker"),
  },
  {
    id: "water-tracker",
    name: "Water Intake Tracker",
    shortName: "Water",
    description: "Check off your glasses of water every day of the month.",
    icon: "Droplet",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "month", label: "Month", type: "month", placeholder: "January" },
          { key: "daily_goal", label: "Daily goal (glasses)", type: "text", compact: true },
        ],
      },
      {
        title: "Glasses per day",
        description: "Tick a glass for each cup you drink.",
        fields: [
          {
            key: "water_grid",
            label: "Water intake",
            type: "habit-grid",
            span: 2,
            defaultItems: ["1", "2", "3", "4", "5", "6", "7", "8"],
          },
        ],
      },
      {
        fields: [
          { key: "water_notes", label: "Notes", type: "textarea", rows: 3, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.month ? `Water — ${v.month}` : "Water intake"),
  },
  {
    id: "gratitude-log",
    name: "Gratitude Log",
    shortName: "Grateful",
    description: "Three good things and how the day felt — a quick daily ritual.",
    icon: "Heart",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "date", label: "Date", type: "date" },
          { key: "mood", label: "How the day felt", type: "mood-rating" },
        ],
      },
      {
        title: "Today I'm grateful for",
        fields: [
          { key: "gratitude", label: "Grateful for", type: "gratitude-list", max: 3, span: 2 },
        ],
      },
      {
        fields: [
          { key: "gratitude_note", label: "One moment worth remembering", type: "textarea", rows: 4, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || "Gratitude log",
  },
  {
    id: "emergency-contacts",
    name: "Emergency Contacts (ICE)",
    shortName: "ICE",
    description: "In-case-of-emergency contacts, allergies, blood type and your care team.",
    icon: "Phone",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "full_name", label: "Full name", type: "text" },
          { key: "blood_type", label: "Blood type", type: "text", compact: true },
          { key: "primary_doctor_id", label: "Primary doctor", type: "doctor-picker", span: 2 },
        ],
      },
      {
        title: "Emergency contacts",
        description: "Who should be called first, and in what order.",
        fields: [
          {
            key: "ice_contacts",
            label: "Contacts",
            type: "measurement-grid",
            span: 2,
            rowCount: 8,
            rowLabel: "#",
            columns: ["Name", "Relationship", "Phone", "Notes"],
          },
        ],
      },
      {
        columns: 2,
        fields: [
          { key: "allergies", label: "Known allergies", type: "textarea", rows: 4 },
          { key: "conditions", label: "Conditions & current medications", type: "textarea", rows: 4 },
          { key: "insurance", label: "Insurance / policy details", type: "textarea", rows: 3, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.full_name as string) || "Emergency contacts",
  },

  // ============ REFERENCE & OCCASIONS ============
  {
    id: "contacts",
    name: "Contacts",
    shortName: "Contacts",
    description: "Your address book — names, numbers, emails and addresses in one place.",
    icon: "Users",
    sections: [
      {
        fields: [
          { key: "list_title", label: "List name", type: "text", span: 2, placeholder: "Family, Work, Neighbours…" },
        ],
      },
      {
        title: "Address book",
        fields: [
          {
            key: "contact_rows",
            label: "Contacts",
            type: "measurement-grid",
            span: 2,
            rowCount: 20,
            rowLabel: "#",
            columns: ["Name", "Phone", "Email", "Address", "Notes"],
          },
        ],
      },
    ],
    summary: (v) => (v.list_title as string) || "Contacts",
  },
  {
    id: "important-dates",
    name: "Important Dates",
    shortName: "Dates",
    description: "Birthdays and anniversaries marked across all twelve months.",
    icon: "Cake",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year", placeholder: "2026" }],
      },
      {
        title: "Dates by month",
        description: "Add a name, then mark the months their date falls in.",
        fields: [
          {
            key: "dates_grid",
            label: "People & occasions",
            type: "month-tracker",
            span: 2,
            defaultItems: ["", "", "", "", "", "", "", "", "", "", "", ""],
          },
        ],
      },
      {
        title: "Details",
        fields: [
          {
            key: "date_details",
            label: "Who / occasion / day",
            type: "measurement-grid",
            span: 2,
            rowCount: 16,
            rowLabel: "#",
            columns: ["Name", "Occasion", "Date", "Notes"],
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Important dates ${v.year}` : "Important dates"),
  },
  {
    id: "gift-tracker",
    name: "Gift Tracker",
    shortName: "Gifts",
    description: "Gift ideas, budgets, and what's bought and wrapped.",
    icon: "Gift",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "occasion", label: "Occasion", type: "text", placeholder: "Christmas, birthdays…" },
          { key: "total_budget", label: "Total budget", type: "text" },
        ],
      },
      {
        title: "Gift list",
        description: "Mark the last two columns with an x once purchased and wrapped.",
        fields: [
          {
            key: "gift_rows",
            label: "Gifts",
            type: "measurement-grid",
            span: 2,
            rowCount: 16,
            rowLabel: "#",
            columns: ["Person", "Occasion", "Gift idea", "Budget", "Purchased", "Wrapped"],
          },
        ],
      },
      {
        fields: [
          { key: "gift_notes", label: "Notes", type: "textarea", rows: 3, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.occasion as string) || "Gift tracker",
  },
];


export function getPageType(id: string): PageTypeDef | undefined {
  return PAGE_TYPES.find((p) => p.id === id);
}
