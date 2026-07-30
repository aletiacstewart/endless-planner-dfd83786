-- 1. Roles ------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Seed the project owner as admin.
INSERT INTO public.user_roles (user_id, role)
VALUES ('f3348861-92e3-4e5f-bb59-2ae877d452d3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Entitlements are server-written only ------------------------------------
DROP POLICY IF EXISTS "Users manage own packs" ON public.user_packs;
DROP POLICY IF EXISTS "Users manage own planner unlocks" ON public.user_planner_unlocks;

REVOKE INSERT, UPDATE, DELETE ON public.user_packs FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_planner_unlocks FROM authenticated, anon;
GRANT SELECT ON public.user_packs TO authenticated;
GRANT SELECT ON public.user_planner_unlocks TO authenticated;
GRANT ALL ON public.user_packs TO service_role;
GRANT ALL ON public.user_planner_unlocks TO service_role;

CREATE POLICY "Users view own packs"
  ON public.user_packs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users view own planner unlocks"
  ON public.user_planner_unlocks FOR SELECT TO authenticated
  USING (user_id = auth.uid());
