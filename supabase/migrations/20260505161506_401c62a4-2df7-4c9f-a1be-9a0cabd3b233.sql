CREATE TABLE public.pack_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  pack_id text NOT NULL,
  unlock_code text NOT NULL,
  stripe_session_id text,
  environment text NOT NULL DEFAULT 'sandbox',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_pack_purchases_unlock_code ON public.pack_purchases(unlock_code);
CREATE INDEX idx_pack_purchases_email ON public.pack_purchases(email);

ALTER TABLE public.pack_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role manages pack_purchases"
ON public.pack_purchases
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
