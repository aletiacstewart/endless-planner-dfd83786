ALTER TABLE public.care_tickets ADD COLUMN client_name TEXT, ADD COLUMN client_email TEXT, ADD COLUMN details TEXT, ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE TABLE public.care_onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  task TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.care_onboarding_tasks TO authenticated;
GRANT ALL ON public.care_onboarding_tasks TO service_role;
ALTER TABLE public.care_onboarding_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view" ON public.care_onboarding_tasks FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Members add" ON public.care_onboarding_tasks FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Members edit" ON public.care_onboarding_tasks FOR UPDATE TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id));
CREATE POLICY "Managers delete" ON public.care_onboarding_tasks FOR DELETE TO authenticated USING (public.is_org_manager(org_id));