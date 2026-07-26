# Planner Expansion — 20 PDFs → Sections + New Planners

Goal: match the structure of the uploaded PDFs, rendered inside our existing paper/spine/side-tab planner theme. Interactive fields (auto-totals, progress bars, computed stats) where the source page needs them. Ship in three category phases.

## What becomes what

Change-of-Life planner gets new sections; three PDFs graduate into their own planner products.

| Source PDF | Destination |
|---|---|
| Brain Dump Bundle | New section: **Brain Dump** |
| Notes A4 | New section: **Notes** (multi-style) |
| Goal Planner Bundle | Upgrade existing **My Goals** layout |
| Self-Care Wellness | Upgrade existing **Self-Care** layout |
| Monthly Calendar (minimalist) | Upgrade existing **Monthly Calendar** |
| Fitness / Weight Loss | New section: **Fitness Tracker** |
| ADHD Planner | New section: **ADHD Toolkit** |
| All-In-One Digital Planner | Reference — pull best patterns into base spread system |
| Ultimate Annual Budget | New **Budget Planner** product |
| Home Management Binder | New **Home Management** planner product |
| Mental Health Planner + Bundle + Anxiety + Depression + Introvert + Self-Control + 300 Prompts | New **Mental Health Planner** product |

## Phase A — Redesign existing pages (Batch 1 style transfer)

Match structure of the PDFs on pages we already ship, keep current styling.

1. **My Goals** — SMART goal grid, milestones checklist, "why it matters" prompt, deadline, obstacles, action steps, weekly review row (from Goal Planner Bundle).
2. **Self-Care** — categorized checklists (physical/emotional/spiritual/social), weekly self-care ritual grid, mood log, sleep + water + gratitude row (from Self-Care Wellness).
3. **Monthly Calendar** — clean minimalist month grid + goals column + notes column + habit strip (from White Minimalist Monthly Calendar).
4. **Notes** — 4 new note styles: dot-grid, lined, cornell, blank (from Notes A4). Chosen per entry.
5. **Daily Tracker** — pull All-In-One patterns: top 3 priorities, hourly timeline, water tracker, mood ring, appointment strip.

## Phase B — New sections in the current planner

6. **Brain Dump** — quick-capture spread: freeform area, "categorize later" tags, action extract column, priority stars.
7. **Fitness Tracker** — weight log with computed trend (start/current/goal/lost), measurements grid (arms/waist/hips/thighs) with delta, weekly workout log, activity minutes bar, calorie summary.
8. **ADHD Toolkit** — daily brain state check-in, task dump → "must / should / could" bucketing, focus session timer log, dopamine menu, transitions checklist, wins column.

## Phase C — Three new standalone planners

Each gets a catalog entry, cover picker, side-tab set, and its own section list. Sold like the Change-of-Life planner.

9. **Budget Planner** — Annual Overview, Monthly Budget (income − expenses with auto-total and remaining), Category Breakdown (fixed / variable / savings / debt), Bill Tracker, Savings Goals with progress bars, Debt Payoff tracker with balance rolldown, Net Worth snapshot, Year-in-review chart.
10. **Home Management** — Household Info, Emergency Contacts, Cleaning Schedule (daily/weekly/monthly/seasonal), Meal Planner + Grocery List, Recipe cards, Home Maintenance log, Repair log, Warranties & Manuals, Important Dates, Password vault-style page.
11. **Mental Health Planner** — Mood tracker with color grid and computed averages, Anxiety log (trigger / thought / evidence / reframe / rating before-after), Depression check-in (energy/sleep/appetite/social sliders), Introvert recharge planner (social battery meter, boundary scripts), Self-Control activities (urge log, replacement behavior, coping menu), Journal Prompts library (300 prompts from the three prompt PDFs, tagged Anxiety / Self-Reflective / Mental Health, with "prompt of the day" and freeform entry).

## Technical notes

- New page kinds needed in `src/lib/pageTypes.ts`: `note-styled` (dot/lined/cornell), `hourly-timeline`, `smart-goal`, `weight-log`, `measurement-log`, `budget-grid`, `debt-tracker`, `savings-goal`, `mood-grid`, `anxiety-log`, `prompt-journal`, `bill-tracker`, `meal-plan`, `cleaning-schedule`.
- Field renderer additions in `src/components/FieldRenderer.tsx` for each new type. Auto-math derived in the render layer from `allValues` (already supported by `onChangeAny`).
- New planners registered in `src/data/planners.ts` with their own `pageIds`, cover series, and Stripe product entries. Reuse existing sync, entry storage, cover pack, and unlock flows unchanged.
- Side-tab groups updated per planner so each product shows only its own sections.
- Prompt library ships as static JSON under `src/data/prompts/` and gets surfaced via a `prompt-journal` field type; entries store the prompt id + user response.

## Deliverable per phase

Each phase ends with: updated `pageTypes` + `FieldRenderer`, live entry pages, side-tab wiring, and (for phase C) a new planner card on the storefront. I'll show you Phase A before starting Phase B, and Phase B before starting Phase C.
