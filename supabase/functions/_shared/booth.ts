// Records a paid Booth card sale from a Stripe Checkout Session (idempotent by session id).
import type { createClient } from "npm:@supabase/supabase-js@2";

export function parseBoothItems(raw: string): { item_id: string; qty: number }[] {
  return raw.split(",").filter(Boolean).map((p) => {
    const [item_id, q] = p.split(":");
    return { item_id, qty: parseInt(q, 10) };
  });
}

export async function recordBoothCardSale(
  admin: ReturnType<typeof createClient>,
  session: any,
): Promise<string | null> {
  const meta = session.metadata || {};
  if (meta.kind !== "booth" || !meta.org_id || !meta.items) return null;
  if (session.payment_status !== "paid") return null;
  const { data, error } = await admin.rpc("record_booth_card_sale", {
    _org_id: meta.org_id,
    _items: parseBoothItems(meta.items),
    _session_id: session.id,
    _created_by: meta.seller_id || null,
  });
  if (error) throw error;
  return data as string;
}
