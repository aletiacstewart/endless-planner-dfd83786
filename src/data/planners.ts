import { PAGE_TYPES } from "@/lib/pageTypes";
const heroImage = "";

export interface PlannerDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  /** One-time activation fee. */
  priceUSD: number;
  /** Recurring monthly subscription for updates + cloud backup. */
  monthlyPriceUSD: number;
  /** Stripe lookup key for the one-time setup fee. */
  priceId: string;
  /** Stripe lookup key for the $10/mo recurring plan. */
  monthlyPriceId: string;
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
      "Track your habits, health, goals, meals, workouts, and reflections in one beautifully organized planner. $19.97 gets you set up. $10/month keeps your planner updated, backed up in the cloud, and available on every device you own — phone, tablet, and desktop.",
    heroImage,
    priceUSD: 19.97,
    monthlyPriceUSD: 10,
    priceId: "wellness_journey_setup",
    monthlyPriceId: "wellness_journey_monthly",
    pageTypeIds: PAGE_TYPES.map((p) => p.id),
    highlights: [
      "25+ guided pages — calendars, habits, health, goals & reflection",
      "Two-way sync between your daily, monthly, and yearly trackers",
      "Pick one cover & matching icon set to install — add more anytime",
      "Cloud backup + restore on any device (phone, tablet, desktop)",
      "$19.97 to start, then $10/month for updates & cloud hosting",
    ],
    available: true,
  },
];

export function getPlanner(id: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === id);
}
