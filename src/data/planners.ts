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

export const PLANNERS: PlannerDef[] = [
  {
    id: "wellness-journey",
    name: "Change of Life — Wellness Journey",
    tagline: "One planner for your whole life — health, home, money, and mind.",
    description:
      "Track habits, health, goals, meals, workouts, budget, home, and mental wellness in one beautifully organized planner. A one-time $19.97 activation gets you the planner plus 1 cover & matching icon set of your choice. Add more covers à la carte for $5 each — 5+ save 10%.",
    heroImage,
    priceUSD: 19.97,
    priceId: "wellness_journey_setup",
    pageTypeIds: PAGE_TYPES.map((p) => p.id),
    highlights: [
      "35+ guided pages — calendars, habits, health, goals, budget, home & mind",
      "Budget, debt & savings pages built in",
      "Home management: cleaning zones, meal plan & grocery lists",
      "Mental health: mood journal, therapy prep & coping toolkit",
      "Includes 1 cover & matching icon set — add more for $5 each",
      "Cloud backup + restore on any device",
    ],
    available: true,
  },
];

export function getPlanner(id: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === id);
}
