// Cover Packs = cover + matching page-icon set, sold as add-ons.
//
// Pricing:
//   $5 per pack (flat) — no volume discounts

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

/** Flat total for a cart of pack ids — $5 each, no discounts. */
export function calcPackTotalUSD(packIds: string[]): number {
  return round2(packIds.length * PACK_PRICE_USD);
}

export function getDiscountLabel(_count: number): string | null {
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
