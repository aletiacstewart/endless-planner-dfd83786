CREATE TABLE public.booth_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
  payment_method TEXT NOT NULL DEFAULT 'card' CHECK (payment_method IN ('cash','card','other')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.booth_sales(org_id, created_at DESC);
GRANT SELECT, DELETE ON public.booth_sales TO authenticated;
GRANT ALL ON public.booth_sales TO service_role;
ALTER TABLE public.booth_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view sales" ON public.booth_sales FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Managers delete sales" ON public.booth_sales FOR DELETE TO authenticated USING (public.is_org_manager(org_id));

CREATE OR REPLACE FUNCTION public.record_booth_sale(_org_id uuid, _items jsonb, _payment_method text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  line jsonb; item record; qty int; total int := 0; out_items jsonb := '[]'::jsonb; sale_id uuid;
BEGIN
  IF NOT public.is_org_member(_org_id) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _payment_method NOT IN ('cash','card','other') THEN RAISE EXCEPTION 'Invalid payment method'; END IF;
  IF jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN RAISE EXCEPTION 'Cart is empty'; END IF;
  FOR line IN SELECT * FROM jsonb_array_elements(_items) LOOP
    qty := (line->>'qty')::int;
    IF qty IS NULL OR qty < 1 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
    SELECT * INTO item FROM public.booth_items WHERE id = (line->>'item_id')::uuid AND org_id = _org_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Product not found'; END IF;
    IF item.stock_qty < qty THEN RAISE EXCEPTION 'Not enough stock for %', item.title; END IF;
    UPDATE public.booth_items SET stock_qty = stock_qty - qty WHERE id = item.id;
    total := total + item.price_cents * qty;
    out_items := out_items || jsonb_build_object('item_id', item.id, 'sku', item.sku, 'title', item.title, 'qty', qty, 'price_cents', item.price_cents);
  END LOOP;
  INSERT INTO public.booth_sales (org_id, items, total_cents, payment_method, created_by)
  VALUES (_org_id, out_items, total, _payment_method, auth.uid()) RETURNING id INTO sale_id;
  RETURN sale_id;
END $$;
REVOKE ALL ON FUNCTION public.record_booth_sale(uuid, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_booth_sale(uuid, jsonb, text) TO authenticated;