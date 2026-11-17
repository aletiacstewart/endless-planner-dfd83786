import { Store, Camera, ShieldCheck, Send, Archive, HeartHandshake, LayoutGrid, BookHeart, type LucideIcon } from "lucide-react";

export interface BrandedByApp {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  href: string;
  status: "live" | "soon";
}

export const BRANDED_BY_APPS: BrandedByApp[] = [
  { id: "hub", name: "Hub", tagline: "Command center", description: "One place to run your brand, see every app and track your launch.", icon: LayoutGrid, href: "/hub", status: "soon" },
  { id: "booth", name: "Booth", tagline: "Event & pop-up checkout", description: "QR kiosk checkout, live inventory and instant tap-to-pay receipts.", icon: Store, href: "/booth", status: "live" },
  { id: "snap", name: "Snap", tagline: "AI product photos", description: "Studio-quality product photos with your brand kit applied in one click.", icon: Camera, href: "/snap", status: "live" },
  { id: "guard", name: "Guard", tagline: "Brand protection", description: "Watermark downloads, watch your brand online and manage team access.", icon: ShieldCheck, href: "/hub", status: "soon" },
  { id: "signal", name: "Signal", tagline: "Email & text campaigns", description: "QR-triggered email and text follow-ups that keep customers coming back.", icon: Send, href: "/signal", status: "live" },
  { id: "stash", name: "Stash", tagline: "Brand asset vault", description: "Store logos, files and artwork, and share delivery portals with clients.", icon: Archive, href: "/stash", status: "live" },
  { id: "care", name: "Care", tagline: "Client care", description: "Onboarding checklists, support inbox and appointment routing.", icon: HeartHandshake, href: "/care", status: "live" },
  { id: "planner", name: "Curated Planner", tagline: "Digital planner & journal", description: "Beautiful digital planners for health, home and everyday life.", icon: BookHeart, href: "/shop", status: "live" },
];

export const BRAND_PROCESS = [
  { step: "Discover", text: "We learn your story, your customers and your goals." },
  { step: "Design", text: "A look and voice that feels unmistakably yours." },
  { step: "Develop", text: "Websites, apps and tools built to grow with you." },
  { step: "Deploy", text: "Launch with confidence and keep improving." },
];
