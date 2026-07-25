-- 1. Fast lookup of a user's subscription in a given environment
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_env
  ON public.subscriptions(user_id, environment);

CREATE INDEX IF NOT EXISTS idx_subscriptions_email_env
  ON public.subscriptions(lower(email), environment);

-- 2. Let signed-in users read their own subscription rows
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

GRANT SELECT ON public.subscriptions TO authenticated;

-- 3. Server-side helper for entitlement checks
CREATE OR REPLACE FUNCTION public.has_active_subscription(
  user_uuid uuid,
  check_env text DEFAULT 'sandbox'
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active','trialing','past_due')
          AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;

-- 4. Reconcile anonymous purchases/subscriptions to the current signed-in user by email.
-- Called from the client right after sign-in.
CREATE OR REPLACE FUNCTION public.link_user_purchases()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  uemail text;
  linked_planners int := 0;
  linked_packs int := 0;
  linked_subs int := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(email) INTO uemail FROM auth.users WHERE id = uid;
  IF uemail IS NULL THEN
    RETURN jsonb_build_object('planners',0,'packs',0,'subscriptions',0);
  END IF;

  -- Planner purchases → user_planner_unlocks
  WITH matched AS (
    SELECT planner_id, unlock_code
    FROM public.purchases
    WHERE lower(email) = uemail
  ),
  inserted AS (
    INSERT INTO public.user_planner_unlocks (user_id, planner_id, unlock_code)
    SELECT uid, planner_id, unlock_code FROM matched
    ON CONFLICT (user_id, planner_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO linked_planners FROM inserted;

  -- Pack purchases → user_packs
  WITH matched AS (
    SELECT pack_id, unlock_code
    FROM public.pack_purchases
    WHERE lower(email) = uemail
  ),
  inserted AS (
    INSERT INTO public.user_packs (user_id, pack_id, unlock_code)
    SELECT uid, pack_id, unlock_code FROM matched
    ON CONFLICT (user_id, pack_id) DO NOTHING
    RETURNING 1
  )
  SELECT count(*) INTO linked_packs FROM inserted;

  -- Subscriptions: stamp user_id on any rows that match by email
  UPDATE public.subscriptions
     SET user_id = uid, updated_at = now()
   WHERE user_id IS NULL
     AND lower(email) = uemail;
  GET DIAGNOSTICS linked_subs = ROW_COUNT;

  RETURN jsonb_build_object(
    'planners', linked_planners,
    'packs', linked_packs,
    'subscriptions', linked_subs
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_user_purchases() TO authenticated;