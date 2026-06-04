
-- ============ updated_at trigger helper ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============ profiles ============
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email) VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ planner_entries ============
CREATE TABLE public.planner_entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL,
  title TEXT,
  values JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_created_at BIGINT NOT NULL,
  client_updated_at BIGINT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX planner_entries_user_idx ON public.planner_entries(user_id);
CREATE INDEX planner_entries_user_updated_idx ON public.planner_entries(user_id, client_updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_entries TO authenticated;
GRANT ALL ON public.planner_entries TO service_role;
ALTER TABLE public.planner_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own entries" ON public.planner_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER planner_entries_updated_at BEFORE UPDATE ON public.planner_entries FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ user_settings ============
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  planner_name TEXT NOT NULL DEFAULT '',
  owner_name TEXT NOT NULL DEFAULT '',
  cover_id TEXT NOT NULL DEFAULT '',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  client_updated_at BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ user_packs ============
CREATE TABLE public.user_packs (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL,
  unlock_code TEXT,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, pack_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_packs TO authenticated;
GRANT ALL ON public.user_packs TO service_role;
ALTER TABLE public.user_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packs" ON public.user_packs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ user_planner_unlocks ============
CREATE TABLE public.user_planner_unlocks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  planner_id TEXT NOT NULL,
  unlock_code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, planner_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_planner_unlocks TO authenticated;
GRANT ALL ON public.user_planner_unlocks TO service_role;
ALTER TABLE public.user_planner_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own planner unlocks" ON public.user_planner_unlocks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.planner_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
