import { PAGE_TYPES } from "@/lib/pageTypes";
const heroImage = "";

export interface PlannerDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  /** One-time activation fee, includes 1 cover of buyer's choice. */
  priceUSD: number;
  /** Stripe lookup key for the one-time activation fee. */
  priceId: string;
  pageTypeIds: string[];
  highlights: string[];
  available: boolean;
}

const BUDGET_PAGES = ["budget-monthly", "debt-tracker", "savings-goals", "notes"];
const HOME_PAGES = ["home-info", "weekly-cleaning", "meal-planning", "monthly-calendar", "notes"];
const MENTAL_PAGES = ["mood-journal", "therapy-session", "coping-toolkit", "gratitude", "self-care-checklist", "notes"];
const EXCLUDED_FROM_WELLNESS = new Set([
  ...BUDGET_PAGES,
  ...HOME_PAGES,
  ...MENTAL_PAGES.filter((id) => id !== "gratitude" && id !== "self-care-checklist" && id !== "notes"),
]);

export const PLANNERS: PlannerDef[] = [
  {
    id: "wellness-journey",
    name: "Change of Life — Wellness Journey",
    tagline: "A complete planner for navigating life's changes with intention.",
    description:
      "Track your habits, health, goals, meals, workouts, and reflections in one beautifully organized planner. A one-time $19.97 activation gets you the planner plus 1 cover & matching icon set of your choice. Add more covers à la carte for $5 each — 5+ save 10%.",
    heroImage,
    priceUSD: 19.97,
    priceId: "wellness_journey_setup",
    pageTypeIds: PAGE_TYPES.map((p) => p.id).filter((id) => !EXCLUDED_FROM_WELLNESS.has(id)),
    highlights: [
      "25+ guided pages — calendars, habits, health, goals & reflection",
      "Two-way sync between your daily, monthly, and yearly trackers",
      "Includes 1 cover & matching icon set with activation",
      "Add more covers anytime — $5 each, 5+ save 10%",
      "Cloud backup + restore on any device",
    ],
    available: true,
  },
  {
    id: "budget-planner",
    name: "Money & Budget Planner",
    tagline: "See every dollar. Pay off debt. Build savings.",
    description:
      "A focused planner for monthly budgets, debt payoff, and savings goals. Same $19.97 activation, 1 included cover, and $5 add-on covers.",
    heroImage,
    priceUSD: 19.97,
    priceId: "budget_planner_setup",
    pageTypeIds: BUDGET_PAGES,
    highlights: [
      "Monthly budget with income, fixed & variable expenses",
      "Debt tracker (snowball or avalanche)",
      "Sinking funds & savings goals",
      "Cloud backup on all your devices",
    ],
    available: true,
  },
  {
    id: "home-management",
    name: "Home Management Planner",
    tagline: "Run the house without the mental load.",
    description:
      "Household info, weekly cleaning zones, meal planning, and grocery lists — one place for everything that keeps the home running.",
    heroImage,
    priceUSD: 19.97,
    priceId: "home_management_setup",
    pageTypeIds: HOME_PAGES,
    highlights: [
      "Household info & utility accounts",
      "Weekly cleaning zones by day",
      "Meal plan + grocery list that stays with you",
      "Monthly calendar & notes",
    ],
    available: true,
  },
  {
    id: "mental-health",
    name: "Mental Health Companion",
    tagline: "A gentle daily practice for feeling better, slowly.",
    description:
      "Mood journaling, therapy session prep, and a personalized coping toolkit — designed with mental-health professionals in mind.",
    heroImage,
    priceUSD: 19.97,
    priceId: "mental_health_setup",
    pageTypeIds: MENTAL_PAGES,
    highlights: [
      "Daily mood journal with feelings & triggers",
      "Therapy session prep and homework tracking",
      "Personal coping toolkit + crisis plan",
      "Weekly self-care check-in & gratitude",
    ],
    available: true,
  },
];

export function getPlanner(id: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === id);
}
