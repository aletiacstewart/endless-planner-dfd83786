CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'starter' CHECK (plan_tier IN ('starter','growth_pro','agency')),
  promo_code TEXT,
  stripe_customer_id TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner','admin','member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
CREATE INDEX ON public.organization_members(user_id);
CREATE TABLE public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL DEFAULT '#945EB4',
  accent_color TEXT NOT NULL DEFAULT '#41D0BB',
  surface_color TEXT NOT NULL DEFAULT '#FFFFFF',
  logo_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.stash_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.signal_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','sms','omnichannel')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.booth_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  title TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  stock_qty INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, sku)
);
CREATE TABLE public.care_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations, public.organization_members, public.brand_kits, public.stash_assets, public.signal_campaigns, public.booth_items, public.care_tickets TO authenticated;
GRANT ALL ON public.organizations, public.organization_members, public.brand_kits, public.stash_assets, public.signal_campaigns, public.booth_items, public.care_tickets TO service_role;

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stash_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booth_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.care_tickets ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = _org_id AND user_id = auth.uid())
      OR public.has_role(auth.uid(), 'admin')
$$;
CREATE OR REPLACE FUNCTION public.is_org_manager(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = _org_id AND user_id = auth.uid() AND role IN ('owner','admin'))
      OR public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "Members view org" ON public.organizations FOR SELECT TO authenticated USING (public.is_org_member(id));
CREATE POLICY "Managers update org" ON public.organizations FOR UPDATE TO authenticated USING (public.is_org_manager(id)) WITH CHECK (public.is_org_manager(id));
CREATE POLICY "Managers delete org" ON public.organizations FOR DELETE TO authenticated USING (public.is_org_manager(id));

CREATE POLICY "Members view members" ON public.organization_members FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Managers add members" ON public.organization_members FOR INSERT TO authenticated WITH CHECK (public.is_org_manager(org_id));
CREATE POLICY "Managers update members" ON public.organization_members FOR UPDATE TO authenticated USING (public.is_org_manager(org_id)) WITH CHECK (public.is_org_manager(org_id));
CREATE POLICY "Managers remove members" ON public.organization_members FOR DELETE TO authenticated USING (public.is_org_manager(org_id) OR user_id = auth.uid());

CREATE POLICY "Members view brand kit" ON public.brand_kits FOR SELECT TO authenticated USING (public.is_org_member(org_id));
CREATE POLICY "Managers write brand kit" ON public.brand_kits FOR ALL TO authenticated USING (public.is_org_manager(org_id)) WITH CHECK (public.is_org_manager(org_id));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['stash_assets','signal_campaigns','booth_items','care_tickets'] LOOP
    EXECUTE format('CREATE POLICY "Members view" ON public.%I FOR SELECT TO authenticated USING (public.is_org_member(org_id))', t);
    EXECUTE format('CREATE POLICY "Members add" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_org_member(org_id))', t);
    EXECUTE format('CREATE POLICY "Members edit" ON public.%I FOR UPDATE TO authenticated USING (public.is_org_member(org_id)) WITH CHECK (public.is_org_member(org_id))', t);
    EXECUTE format('CREATE POLICY "Managers delete" ON public.%I FOR DELETE TO authenticated USING (public.is_org_manager(org_id))', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.create_organization(_name text, _slug text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF length(trim(_name)) = 0 OR _slug !~ '^[a-z0-9-]{2,48}$' THEN RAISE EXCEPTION 'Invalid name or slug'; END IF;
  INSERT INTO public.organizations (name, slug, created_by) VALUES (trim(_name), _slug, auth.uid()) RETURNING id INTO new_id;
  INSERT INTO public.organization_members (org_id, user_id, role) VALUES (new_id, auth.uid(), 'owner');
  INSERT INTO public.brand_kits (org_id) VALUES (new_id);
  RETURN new_id;
END $$;
REVOKE ALL ON FUNCTION public.create_organization(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_organization(text, text) TO authenticated;