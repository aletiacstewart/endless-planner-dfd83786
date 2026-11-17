export interface CartLine { item_id: string; title: string; price_cents: number; qty: number; stock_qty: number }

export function cartTotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.price_cents * l.qty, 0);
}

/** Adds one of a product, never going above what's in stock. */
export function addToCart(lines: CartLine[], p: Omit<CartLine, "qty">): CartLine[] {
  const existing = lines.find((l) => l.item_id === p.item_id);
  if (existing) {
    if (existing.qty >= p.stock_qty) return lines;
    return lines.map((l) => (l.item_id === p.item_id ? { ...l, qty: l.qty + 1 } : l));
  }
  if (p.stock_qty < 1) return lines;
  return [...lines, { ...p, qty: 1 }];
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

/** "12.50" -> 1250; returns null for invalid input. */
export function parseDollars(input: string): number | null {
  const n = Number(input.replace(/[$,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
