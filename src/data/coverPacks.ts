// Cover Packs = covers + matching page-icon set, sold as paid add-ons.
// One pack = one cover (1:1). Forget-me-nots-ladybugs is included free
// with every planner purchase. Every other cover is a paid add-on.
//
// Pricing (per cart):
//   1st add-on pack  → $4.99
//   each additional  → $2.99

import { COVERS, getCover } from "@/data/covers";

export const INCLUDED_PACK_IDS = ["patriotic-roses"] as const;

export const FIRST_PACK_PRICE_USD = 4.99;
export const ADDITIONAL_PACK_PRICE_USD = 2.99;

export function isCoverIncluded(coverId: string): boolean {
  return (INCLUDED_PACK_IDS as readonly string[]).includes(coverId);
}

export function isCoverPaid(coverId: string): boolean {
  return !isCoverIncluded(coverId);
}

/** Price for the Nth (0-indexed) paid pack in a cart. */
export function getPackPriceUSD(indexInCart: number): number {
  return indexInCart === 0 ? FIRST_PACK_PRICE_USD : ADDITIONAL_PACK_PRICE_USD;
}

export function calcPackTotalUSD(packIds: string[]): number {
  return packIds.reduce((sum, _id, i) => sum + getPackPriceUSD(i), 0);
}

export function listAllPaidCovers() {
  return COVERS.filter((c) => isCoverPaid(c.id));
}

export function getPack(coverId: string) {
  return getCover(coverId);
}
