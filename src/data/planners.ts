import { PAGE_TYPES } from "@/lib/pageTypes";
const heroImage = "";

export interface PlannerDef {
  id: string;
  /** Customer-facing URL segment. Keep id stable for purchases and access records. */
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  /** One-time activation price — planner for life + 1 cover + first 30 days of cloud. */
  priceUSD: number;
  /** Stripe lookup key for the activation price (checkout adds the $10/month cloud plan). */
  priceId: string;
  pageTypeIds: string[];
  highlights: string[];
  available: boolean;
}

export const PLANNERS: PlannerDef[] = [
  {
    id: "wellness-journey",
    slug: "curated-planner",
    name: "Curated Planner",
    tagline: "One planner for your whole life — health, home, money, and mind.",
    description:
      "Track habits, health, goals, meals, workouts, budget, home, and mental wellness in one beautifully organized planner. A one-time $21.97 activation gives you the planner to keep, plus 1 cover with 42 matching page icons and access to 180 illustrated stickers and 60 emojis. Cloud backup, restore, sync on every device, updates and new calendar years are $10/month after your first 30 days free. Add more covers for $5 each — 10% off 2–5, 20% off 6 or more.",
    heroImage,
    priceUSD: 21.97,
    priceId: "curated_planner_activation_onetime",
    pageTypeIds: PAGE_TYPES.map((p) => p.id),
    highlights: [
      "42 guided pages — calendars, journal, habits, health, sleep, goals, budget, home & mind",
      "Budget, debt & savings pages built in",
      "Home management: cleaning zones, meal plan & grocery lists",
      "Mental health: mood journal, therapy prep & coping toolkit",
      "Includes 1 cover with 42 matching page icons — add more for $5 each",
      "Shared library: 180 illustrated stickers + 60 emojis (240 pieces total)",
      "First 30 days of cloud backup & sync included, then $10/month",
    ],
    available: true,
  },
];

export function getPlanner(idOrSlug: string): PlannerDef | undefined {
  return PLANNERS.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
}

/** $10/month cloud plan: backup, restore, sync, updates and new calendar years. */
export const CLOUD_PRICE_ID = "curated_planner_cloud_monthly";
export const CLOUD_PRICE_USD = 10;
