// Cover Packs = cover + matching page-icon set, sold as add-ons.
//
// Pricing:
//   $5 per pack, with a volume discount on the whole cart:
//     1 pack        → full price
//     2–5 packs     → 10% off
//     6 or more     → 20% off

import { COVERS, getCover } from "@/data/covers";

export const PACK_PRICE_USD = 5;

// Kept for backward compat with existing imports; nothing is included for free.
export const INCLUDED_PACK_IDS: readonly string[] = [];

export function isCoverIncluded(_coverId: string): boolean {
  return false;
}

export function isCoverPaid(_coverId: string): boolean {
  return true;
}

/** Cart-wide discount rate (0, 0.1 or 0.2) for a given number of packs. */
export function discountRateForCount(count: number): number {
  if (count >= 6) return 0.2;
  if (count >= 2) return 0.1;
  return 0;
}

/** Per-pack price shown in the picker (list price — discount applies to the cart). */
export function getPackPriceUSD(_indexInCart: number): number {
  return PACK_PRICE_USD;
}

/** Cart subtotal before any discount. */
export function calcPackSubtotalUSD(packIds: string[]): number {
  return round2(packIds.length * PACK_PRICE_USD);
}

/** Dollar amount saved on this cart. */
export function calcPackDiscountUSD(packIds: string[]): number {
  return round2(calcPackSubtotalUSD(packIds) * discountRateForCount(packIds.length));
}

/** Cart total with the volume discount applied. */
export function calcPackTotalUSD(packIds: string[]): number {
  return round2(calcPackSubtotalUSD(packIds) - calcPackDiscountUSD(packIds));
}

export function getDiscountLabel(count: number): string | null {
  const rate = discountRateForCount(count);
  if (rate === 0) return null;
  return `${Math.round(rate * 100)}% off ${count} covers`;
}

/** Short hint shown before/while building a cart. */
export const PACK_DISCOUNT_HINT = "$5 each — 10% off 2–5 covers, 20% off 6 or more.";

export function listAllPaidCovers() {
  return COVERS;
}

export function getPack(coverId: string) {
  return getCover(coverId);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
