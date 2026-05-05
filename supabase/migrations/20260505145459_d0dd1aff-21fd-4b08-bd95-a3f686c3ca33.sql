create table public.device_activations (
  id uuid primary key default gen_random_uuid(),
  unlock_code text not null,
  device_id text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (unlock_code, device_id)
);
create index idx_device_activations_code on public.device_activations(unlock_code);
alter table public.device_activations enable row level security;
create policy "service role manages activations"
  on public.device_activations for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
create index if not exists idx_purchases_email on public.purchases(lower(email));
create index if not exists idx_purchases_session on public.purchases(stripe_session_id);
