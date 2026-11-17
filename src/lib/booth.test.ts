import { describe, it, expect } from "vitest";
import { addToCart, cartTotalCents, parseDollars } from "./booth";

const kit = { item_id: "a", title: "QR Display Kit", price_cents: 4900, stock_qty: 2 };

describe("booth cart", () => {
  it("cannot add more than what's in stock", () => {
    let cart = addToCart([], kit);
    cart = addToCart(cart, kit);
    cart = addToCart(cart, kit);
    expect(cart[0].qty).toBe(2);
  });
  it("cannot add a sold-out product", () => {
    expect(addToCart([], { ...kit, stock_qty: 0 })).toHaveLength(0);
  });
  it("totals price times quantity", () => {
    const cart = addToCart(addToCart([], kit), { item_id: "b", title: "Stand", price_cents: 7900, stock_qty: 5 });
    expect(cartTotalCents(addToCart(cart, kit))).toBe(4900 * 2 + 7900);
  });
  it("parses dollar prices to cents", () => {
    expect(parseDollars("$49.00")).toBe(4900);
    expect(parseDollars("-1")).toBeNull();
  });
});
