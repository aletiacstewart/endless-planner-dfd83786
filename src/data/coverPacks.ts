// Cover Packs = cover + matching page-icon set, sold as add-ons.
//
// Pricing:
//   $10 per pack (flat)
//   Discounts on pack subtotal:
//     - 3 packs         → 10% off
//     - 4 packs         → buy 4, get the 5th free (still 10% off for 4)
//     - 5 packs         → pay for 4 (5th is free)
//     - 6+ packs        → 25% off entire pack subtotal

import { COVERS, getCover } from "@/data/covers";

export const PACK_PRICE_USD = 10;

// Kept for backward compat with existing imports; nothing is included for free.
export const INCLUDED_PACK_IDS: readonly string[] = [];

export function isCoverIncluded(_coverId: string): boolean {
  return false;
}

export function isCoverPaid(_coverId: string): boolean {
  return true;
}

/** Per-pack price shown in the picker (pre-discount). */
export function getPackPriceUSD(_indexInCart: number): number {
  return PACK_PRICE_USD;
}

/** Discounted total for a cart of pack ids. */
export function calcPackTotalUSD(packIds: string[]): number {
  const n = packIds.length;
  if (n === 0) return 0;
  const gross = n * PACK_PRICE_USD;

  // 5+ packs: 5th is free → charge for max(paid) packs
  if (n >= 6) {
    return round2(gross * 0.75); // 25% off entire order
  }
  if (n === 5) {
    return 4 * PACK_PRICE_USD; // 5th free
  }
  if (n === 4) {
    return round2(gross * 0.9); // 10% off
  }
  if (n === 3) {
    return round2(gross * 0.9); // 10% off
  }
  return gross;
}

export function getDiscountLabel(count: number): string | null {
  if (count >= 6) return "25% off entire order";
  if (count === 5) return "5th pack free";
  if (count === 4) return "10% off · one more for a free pack";
  if (count === 3) return "10% off";
  if (count === 2) return "Add 1 more for 10% off";
  if (count === 1) return "Add 2 more for 10% off";
  return null;
}

export function listAllPaidCovers() {
  return COVERS;
}

export function getPack(coverId: string) {
  return getCover(coverId);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
