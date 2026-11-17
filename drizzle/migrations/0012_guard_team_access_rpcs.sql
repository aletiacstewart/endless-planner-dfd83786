CREATE OR REPLACE FUNCTION public.list_org_members(_org_id uuid)
RETURNS TABLE (id uuid, user_id uuid, email text, role text, created_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_org_member(_org_id) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  RETURN QUERY SELECT m.id, m.user_id, u.email::text, m.role, m.created_at
    FROM public.organization_members m LEFT JOIN auth.users u ON u.id = m.user_id
    WHERE m.org_id = _org_id ORDER BY m.created_at;
END $$;
REVOKE ALL ON FUNCTION public.list_org_members(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_org_members(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.add_org_member_by_email(_org_id uuid, _email text, _role text)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid;
BEGIN
  IF NOT public.is_org_manager(_org_id) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _role NOT IN ('admin','member') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  SELECT u.id INTO uid FROM auth.users u WHERE lower(u.email) = lower(trim(_email)) LIMIT 1;
  IF uid IS NULL THEN RETURN 'no_account'; END IF;
  IF EXISTS (SELECT 1 FROM public.organization_members WHERE org_id = _org_id AND user_id = uid) THEN RETURN 'already_member'; END IF;
  INSERT INTO public.organization_members (org_id, user_id, role) VALUES (_org_id, uid, _role);
  RETURN 'added';
END $$;
REVOKE ALL ON FUNCTION public.add_org_member_by_email(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_org_member_by_email(uuid, text, text) TO authenticated;