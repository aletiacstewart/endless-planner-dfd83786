import { PAGE_TYPES } from "@/lib/pageTypes";
import heroImage from "@/assets/page-images/complete-tracker.png";

export interface PlannerDef {
  id: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  priceUSD: number;
  priceId: string; // Stripe lookup key
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
      "Track your habits, health, goals, meals, workouts, and reflections in one beautifully organized planner. Built for the seasons of change — perimenopause, menopause, recovery, growth, and everything in between.",
    heroImage,
    priceUSD: 19.97,
    priceId: "wellness_journey_lifetime",
    pageTypeIds: PAGE_TYPES.map((p) => p.id),
    highlights: [
      "25+ guided pages — calendars, habits, health, goals & reflection",
      "Two-way sync between your daily, monthly, and yearly trackers",
      "Pick from 80+ beautiful covers to make it yours",
      "Installs on phone, tablet, and desktop — works offline",
      "One-time payment, lifetime access",
    ],
    available: true,
  },
];

export function getPlanner(id: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === id);
}
