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
    tagline: "A complete planner for navigating life's changes with intention.",
    description:
      "Track your habits, health, goals, meals, workouts, and reflections in one beautifully organized planner. A one-time $19.97 activation gets you the planner plus 1 cover & matching icon set of your choice. Add more covers à la carte for $10 each — 3+ save 10%, 5th free, 6+ save 25%.",
    heroImage,
    priceUSD: 19.97,
    priceId: "wellness_journey_setup",
    pageTypeIds: PAGE_TYPES.map((p) => p.id),
    highlights: [
      "25+ guided pages — calendars, habits, health, goals & reflection",
      "Two-way sync between your daily, monthly, and yearly trackers",
      "Includes 1 cover & matching icon set with activation",
      "Add more covers anytime — $10 each, volume discounts apply",
      "Cloud backup + restore on any device (phone, tablet, desktop)",
    ],
    available: true,
  },
];

export function getPlanner(id: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === id);
}
