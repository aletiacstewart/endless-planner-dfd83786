
revoke execute on function public.validate_unlock(text) from anon, authenticated;
drop function if exists public.validate_unlock(text);
