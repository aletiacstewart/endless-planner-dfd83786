CREATE TABLE public.reminder_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  morning_digest boolean NOT NULL DEFAULT false,
  timezone text NOT NULL DEFAULT 'America/Chicago',
  last_digest_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_preferences TO authenticated;
GRANT ALL ON public.reminder_preferences TO service_role;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own reminder prefs select" ON public.reminder_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own reminder prefs insert" ON public.reminder_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own reminder prefs update" ON public.reminder_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own reminder prefs delete" ON public.reminder_preferences FOR DELETE TO authenticated USING (auth.uid() = user_id);