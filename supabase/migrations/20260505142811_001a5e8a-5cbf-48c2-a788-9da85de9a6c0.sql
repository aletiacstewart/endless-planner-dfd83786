
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  planner_id text not null,
  email text not null,
  unlock_code text not null unique,
  stripe_session_id text unique,
  environment text not null default 'sandbox',
  created_at timestamptz not null default now()
);
create index idx_purchases_email on public.purchases(email);
alter table public.purchases enable row level security;
create policy "service role manages purchases"
  on public.purchases for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create or replace function public.validate_unlock(_code text)
returns table(planner_id text, email text)
language sql stable security definer set search_path = public as $$
  select planner_id, email from public.purchases where unlock_code = _code limit 1;
$$;
grant execute on function public.validate_unlock(text) to anon, authenticated;
