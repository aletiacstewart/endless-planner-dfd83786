ALTER TABLE public.signal_campaigns ADD COLUMN subject TEXT, ADD COLUMN email_body TEXT, ADD COLUMN sms_body TEXT, ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE TABLE public.signal_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  email_opt_in BOOLEAN NOT NULL DEFAULT false,
  sms_opt_in BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.signal_contacts TO authenticated;
GRANT ALL ON public.signal_contacts TO service_role;
ALTER TABLE public.signal_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view" ON public.signal_contacts FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Members add" ON public.signal_contacts FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Members edit" ON public.signal_contacts FOR UPDATE TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Managers delete" ON public.signal_contacts FOR DELETE TO authenticated USING (public.is_org_manager(org_id));