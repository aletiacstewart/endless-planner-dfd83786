CREATE TABLE public.admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  kind text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_events TO authenticated;
GRANT ALL ON public.admin_events TO service_role;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users log own events" ON public.admin_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read events" ON public.admin_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX admin_events_user_idx ON public.admin_events(user_id, created_at DESC);