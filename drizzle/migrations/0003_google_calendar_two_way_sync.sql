CREATE TABLE IF NOT EXISTS public.app_user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connector_id text NOT NULL,
  connection_key_ciphertext text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, connector_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_user_connections TO service_role;
ALTER TABLE public.app_user_connections ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.google_sync_state (
  user_id uuid PRIMARY KEY,
  google_email text,
  last_sync_at timestamptz,
  last_result jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.google_sync_state TO authenticated;
GRANT ALL ON public.google_sync_state TO service_role;
ALTER TABLE public.google_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own google sync state"
  ON public.google_sync_state
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);