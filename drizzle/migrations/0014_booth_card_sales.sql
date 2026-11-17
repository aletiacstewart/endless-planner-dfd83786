ALTER TABLE public.booth_sales ADD COLUMN IF NOT EXISTS stripe_session_id TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.record_booth_card_sale(_org_id uuid, _items jsonb, _session_id text, _created_by uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  line jsonb; item record; qty int; total int := 0; out_items jsonb := '[]'::jsonb; sale_id uuid;
BEGIN
  SELECT id INTO sale_id FROM public.booth_sales WHERE stripe_session_id = _session_id;
  IF FOUND THEN RETURN sale_id; END IF;
  FOR line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    qty := (line->>'qty')::int;
    SELECT * INTO item FROM public.booth_items WHERE id = (line->>'item_id')::uuid AND org_id = _org_id FOR UPDATE;
    IF NOT FOUND OR qty IS NULL OR qty < 1 THEN CONTINUE; END IF;
    -- Money is already taken, so never block here; just don't go below zero.
    UPDATE public.booth_items SET stock_qty = GREATEST(stock_qty - qty, 0) WHERE id = item.id;
    total := total + item.price_cents * qty;
    out_items := out_items || jsonb_build_object('item_id', item.id, 'sku', item.sku, 'title', item.title, 'qty', qty, 'price_cents', item.price_cents);
  END LOOP;
  INSERT INTO public.booth_sales (org_id, items, total_cents, payment_method, created_by, stripe_session_id)
  VALUES (_org_id, out_items, total, 'card', _created_by, _session_id)
  ON CONFLICT (stripe_session_id) DO NOTHING
  RETURNING id INTO sale_id;
  RETURN sale_id;
END $$;
REVOKE ALL ON FUNCTION public.record_booth_card_sale(uuid, jsonb, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_booth_card_sale(uuid, jsonb, text, uuid) TO service_role;