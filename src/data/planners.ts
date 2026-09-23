import { PAGE_TYPES } from "@/lib/pageTypes";
const heroImage = "";

export interface PlannerDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  /** Monthly membership price — planner + cloud backup, sync & calendar sync. */
  priceUSD: number;
  /** Stripe lookup key for the monthly membership price. */
  priceId: string;
  pageTypeIds: string[];
  highlights: string[];
  available: boolean;
}

export const PLANNERS: PlannerDef[] = [
  {
    id: "wellness-journey",
    name: "Change of Life — Wellness Journey",
    tagline: "One planner for your whole life — health, home, money, and mind.",
    description:
      "Track habits, health, goals, meals, workouts, budget, home, and mental wellness in one beautifully organized planner. $21.97/month includes the planner, cloud backup, sync on every device and two-way calendar sync, plus 1 cover & matching icon set of your choice. Add more covers for $5 each — 10% off 2–5, 20% off 6 or more.",
    heroImage,
    priceUSD: 21.97,
    priceId: "endless_planner_all_access_monthly",
    pageTypeIds: PAGE_TYPES.map((p) => p.id),
    highlights: [
      "40 guided pages — calendars, journal, habits, health, sleep, goals, budget, home & mind",
      "Budget, debt & savings pages built in",
      "Home management: cleaning zones, meal plan & grocery lists",
      "Mental health: mood journal, therapy prep & coping toolkit",
      "Includes 1 cover & matching icon set — add more for $5 each",
      "Cloud backup, sync on every device & two-way calendar sync included",
    ],
    available: true,
  },
];

export function getPlanner(id: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === id);
}
