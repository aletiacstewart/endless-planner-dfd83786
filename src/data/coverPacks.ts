// Cover Packs = cover + matching page-icon set, sold as add-ons.
//
// Pricing:
//   $5 per pack (flat)
//   Discount: 5+ packs → 10% off entire pack subtotal

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

/** Per-pack price shown in the picker (pre-discount). */
export function getPackPriceUSD(_indexInCart: number): number {
  return PACK_PRICE_USD;
}

/** Discounted total for a cart of pack ids. */
export function calcPackTotalUSD(packIds: string[]): number {
  const n = packIds.length;
  if (n === 0) return 0;
  const gross = n * PACK_PRICE_USD;
  if (n >= 5) return round2(gross * 0.9); // 10% off
  return gross;
}

export function getDiscountLabel(count: number): string | null {
  if (count >= 5) return "10% off";
  if (count > 0) return `Add ${5 - count} more for 10% off`;
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
