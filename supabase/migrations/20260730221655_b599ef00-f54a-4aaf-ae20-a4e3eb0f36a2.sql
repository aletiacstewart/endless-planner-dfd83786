REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.link_user_purchases() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.link_user_purchases() TO authenticated, service_role;