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
  | "paired-compact"; // single label with two small Start/Finish inputs side-by-side

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

const goalKeys = Array.from({ length: 12 }, (_, i) => `goal_${i + 1}`);

export const PAGE_TYPES: PageTypeDef[] = [
  {
    id: "my-goals",
    name: "My Goals",
    shortName: "Goals",
    description: "Capture up to 12 goals and the reward for achieving them.",
    icon: "Target",
    sections: [
      {
        title: "Goals",
        columns: 2,
        fields: goalKeys.map((k, i) => ({
          key: k,
          label: `Goal ${i + 1}`,
          type: "textarea",
          rows: 2,
          placeholder: "What do you want to achieve?",
        })),
      },
      {
        fields: [
          {
            key: "reward",
            label: "Reward for achieving all goals",
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
    id: "goals-reflection",
    name: "Goals Reflection",
    shortName: "Why & How",
    description: "For each goal: why you want it, how you'll feel, and the action steps.",
    icon: "Sparkles",
    sections: [
      {
        title: "Why do I want to reach these goals",
        fields: goalKeys.map((k, i) => ({
          key: `why_${i + 1}`,
          label: `Goal ${i + 1}`,
          type: "text",
          placeholder: "Why does this matter?",
        })),
      },
      {
        title: "How will I feel when I reach these goals",
        fields: goalKeys.map((k, i) => ({
          key: `feel_${i + 1}`,
          label: `Goal ${i + 1}`,
          type: "text",
          placeholder: "Describe the feeling",
        })),
      },
      {
        title: "Action steps to reach these goals",
        fields: goalKeys.map((k, i) => ({
          key: `action_${i + 1}`,
          label: `Goal ${i + 1}`,
          type: "text",
          placeholder: "First step",
        })),
      },
    ],
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
        title: "Monthly goals & notes",
        columns: 1,
        fields: [
          { key: "goal_1", label: "Goal 1", type: "textarea", rows: 2 },
          { key: "goal_2", label: "Goal 2", type: "textarea", rows: 2 },
          { key: "notes", label: "Notes", type: "textarea", rows: 4 },
        ],
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
        fields: [
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
        title: "Monthly Calendar",
        description: "Quick reference for the month — tap a day to add or view a note.",
        fields: [
          { key: "month_calendar", label: "Monthly calendar", type: "calendar-grid", compact: true, span: 2 },
        ],
      },
      {
        title: "Meals",
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
        title: "Wellness, Self-Care, Workout & Measurements",
        groups: [
          {
            title: "Wellness",
            fields: [
              { key: "water", label: "Water (glasses)", type: "rating", max: 8, otherKey: "water_other" },
              { key: "caffeine", label: "Caffeine / Other (cups)", type: "rating", max: 6, otherKey: "caffeine_other" },
              { key: "sweets", label: "Sweets", type: "rating", max: 4, otherKey: "sweets_other" },
              { key: "sleep", label: "Sleep (hours)", type: "rating", max: 12, otherKey: "sleep_other" },
              { key: "smoking", label: "Smoking / Vaping", type: "rating", max: 12, otherKey: "smoking_other" },
              { key: "mood", label: "Mood", type: "mood-rating", max: 5 },
            ],
          },
          {
            title: "Self-Care",
            fields: [
              { key: "self_physical", label: "Physical Self-Care", type: "textarea", rows: 3 },
              { key: "self_emotional", label: "Emotional Self-Care", type: "textarea", rows: 3 },
              { key: "self_spiritual", label: "Spiritual Self-Care", type: "textarea", rows: 3 },
            ],
          },
          {
            title: "Workout",
            fields: [
              { key: "cardio", label: "Cardio", type: "text", compact: true },
              { key: "weights", label: "Weights", type: "text", compact: true },
              { key: "yoga", label: "Yoga", type: "text", compact: true },
              { key: "stretch", label: "Stretch", type: "text", compact: true },
              { key: "rest_day", label: "Rest day", type: "checkbox" },
              { key: "other", label: "Other", type: "text", compact: true },
            ],
          },
          {
            title: "Measurements",
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
              ] as const).flatMap(([k, label]) => ([
                {
                  key: `m_${k}`,
                  label,
                  type: "paired-compact" as const,
                  pairKeys: [`m_${k}_start`, `m_${k}_finish`] as [string, string],
                  pairLabels: ["Start", "Finish"] as [string, string],
                },
                {
                  key: `m_${k}_today`,
                  label: `${label} — today`,
                  type: "text" as const,
                  compact: true,
                },
              ])),
              {
                key: "weight",
                label: "Weight",
                type: "paired-compact" as const,
                pairKeys: ["weight_start", "weight_goal"] as [string, string],
                pairLabels: ["Start", "Goal"] as [string, string],
              },
              { key: "weight_today", label: "Weight — today", type: "text", compact: true },
              { key: "weight_today_notes", label: "Weight — notes", type: "text" },
              { key: "weight_result", label: "Result Weight", type: "text", compact: true },
            ],
          },
        ],
        fields: [],
      },
      {
        fields: [
          { key: "daily_notes", label: "Wellness Notes", type: "textarea", rows: 5, span: 2 },
        ],
      },
      {
        title: "Medications",
        description: "Tick M (Morning), A (Afternoon), or N (Night) for each medication.",
        fields: [
          { key: "med_list", label: "Medications", type: "med-list", rowCount: 12, span: 2 },
        ],
      },
      {
        title: "Medical Records",
        description: "Track appointment notes, test results, and lab notes.",
        columns: 3,
        fields: [
          { key: "medical_appointment_notes", label: "Medical Appointment Notes", type: "textarea", rows: 5 },
          { key: "test_results", label: "Test Results", type: "textarea", rows: 5 },
          { key: "lab_result_notes", label: "Lab Result Notes", type: "textarea", rows: 5 },
        ],
      },
      {
        title: "Fun & Habit Tracker",
        description: "Write in your own items, then mark Success or Failed for the day. For habits, choose Begin or Break.",
        columns: 2,
        fields: Array.from({ length: 3 }, (_, i) => i + 1).flatMap((n) => [
          {
            key: `fun_${n}`,
            label: `Fun ${n}`,
            type: "success-fail" as const,
            inputKey: `fun_${n}_label`,
            inputPlaceholder: "Fun activity…",
          },
          {
            key: `habit_${n}`,
            label: `Habit ${n}`,
            type: "success-fail" as const,
            inputKey: `habit_${n}_label`,
            inputPlaceholder: "Habit…",
            modeKey: `habit_${n}_mode`,
          },
        ]),
      },
      {
        title: "Cleaning",
        description: "What you cleaned today — syncs to your yearly Cleaning Check List.",
        fields: [
          { key: "cleaning_today", label: "Cleaning today", type: "textarea", rows: 3, span: 2 },
        ],
      },
      {
        title: "This Week",
        description: "Today's note plus the week's goals & reflection — sync to your Weekly Calendar.",
        columns: 1,
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
        fields: [
          { key: "month_note_today", label: "Note for this month", type: "textarea", rows: 3, span: 2 },
          { key: "yearly_focus", label: "Yearly Focus / Word of the Year", type: "textarea", rows: 2, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date ? `${v.date}` : "Daily entry"),
  },
  {
    id: "habit-tracker",
    name: "Habit Tracker",
    shortName: "Habits",
    description: "Track up to 8 habits across 31 days.",
    icon: "CircleCheck",
    sections: [
      {
        columns: 2,
        fields: [
          { key: "month", label: "Month", type: "month" },
          { key: "year", label: "Year", type: "year" },
        ],
      },
      {
        fields: [
          {
            key: "habits",
            label: "Habits",
            type: "habit-grid",
            span: 2,
            defaultItems: [
              "Think Positive",
              "Let Go of Negativity",
              "Eat & Drink Healthy",
              "Keep an Open Mind",
              "Don't Compare to Others",
            ],
          },
        ],
      },
    ],
    summary: (v) => [v.month, v.year].filter(Boolean).join(" ") || "Habit tracker",
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
    description: "Physical, emotional, and spiritual self-care across the year.",
    icon: "HeartHandshake",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        title: "Physical Self-Care",
        fields: [
          { key: "physical", label: "Physical", type: "daily-month-grid", span: 2 },
        ],
      },
      {
        title: "Emotional Self-Care",
        fields: [
          { key: "emotional", label: "Emotional", type: "daily-month-grid", span: 2 },
        ],
      },
      {
        title: "Spiritual Self-Care",
        fields: [
          { key: "spiritual", label: "Spiritual", type: "daily-month-grid", span: 2 },
        ],
      },
    ],
    summary: (v) => (v.year ? `Self-care ${v.year}` : "Self-care check list"),
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
    id: "fun-tracker",
    name: "Fun Tracker",
    shortName: "Fun",
    description: "Track fun activities through the year.",
    icon: "PartyPopper",
    sections: [
      {
        fields: [{ key: "year", label: "Year", type: "year" }],
      },
      {
        fields: [
          {
            key: "fun_grid",
            label: "Fun activities by month",
            type: "month-tracker",
            span: 2,
            defaultItems: [
              "Learn New Skills",
              "Time with Friends & Family",
              "Find New Passion",
              "Find New Challenges",
              "DIY Projects",
            ],
          },
        ],
      },
    ],
    summary: (v) => (v.year ? `Fun ${v.year}` : "Fun tracker"),
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
    description: "Free-form notes and journaling.",
    icon: "NotebookPen",
    sections: [
      {
        fields: [
          { key: "title", label: "Title", type: "text", span: 2 },
          { key: "body", label: "Notes", type: "textarea", rows: 16, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.title as string) || (v.body as string)?.slice(0, 60) || "Untitled note",
  },
  {
    id: "wellness-tracker",
    name: "Yearly Wellness Tracker",
    shortName: "Wellness",
    description: "Daily water, caffeine, sweets, sleep, smoking and mood — across the whole year.",
    icon: "HeartPulse",
    sections: [
      { fields: [{ key: "year", label: "Year", type: "year" }] },
      { title: "Water (glasses)", fields: [{ key: "water", label: "Water", type: "daily-month-grid", span: 2 }] },
      { title: "Caffeine / Other (cups)", fields: [{ key: "caffeine", label: "Caffeine", type: "daily-month-grid", span: 2 }] },
      { title: "Sweets", fields: [{ key: "sweets", label: "Sweets", type: "daily-month-grid", span: 2 }] },
      { title: "Sleep (hours)", fields: [{ key: "sleep", label: "Sleep", type: "daily-month-grid", span: 2 }] },
      { title: "Smoking / Vaping", fields: [{ key: "smoking", label: "Smoking", type: "daily-month-grid", span: 2 }] },
      { title: "Mood (1–5)", fields: [{ key: "mood", label: "Mood", type: "daily-month-grid", span: 2 }] },
    ],
    summary: (v) => (v.year ? `Wellness ${v.year}` : "Yearly wellness"),
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
      { fields: [{ key: "date", label: "Date", type: "date" }] },
      {
        columns: 1,
        fields: [
          { key: "medical_appointment_notes", label: "Medical Appointment Notes", type: "textarea", rows: 6, span: 2 },
          { key: "test_results", label: "Test Results", type: "textarea", rows: 6, span: 2 },
          { key: "lab_result_notes", label: "Lab Result Notes", type: "textarea", rows: 6, span: 2 },
        ],
      },
    ],
    summary: (v) => (v.date as string) || "Medical record",
  },
  {
    id: "daily-goal-tracker",
    name: "Yearly Daily Goal Tracker",
    shortName: "Goals/Day",
    description: "A year-long view of your daily goals and the daily habit success/fail.",
    icon: "Target",
    sections: [
      { fields: [{ key: "year", label: "Year", type: "year" }] },
      { title: "Daily Goal", fields: [{ key: "daily_goal", label: "Daily Goal", type: "daily-month-grid", span: 2 }] },
      { title: "Daily Habit (success ✓ / fail ✗)", fields: [{ key: "daily_habit", label: "Daily Habit", type: "daily-month-grid", span: 2 }] },
    ],
    summary: (v) => (v.year ? `Daily goals ${v.year}` : "Daily goal tracker"),
  },
];

export function getPageType(id: string): PageTypeDef | undefined {
  return PAGE_TYPES.find((p) => p.id === id);
}
