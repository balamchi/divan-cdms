create table public.clickup_tokens (
  user_id uuid primary key references public.users(id) on delete cascade,
  access_token text not null,
  connected_at timestamptz not null default now(),
  last_used_at timestamptz
);

alter table public.clickup_tokens enable row level security;

create policy "clickup_tokens: self select"
  on public.clickup_tokens for select
  to authenticated
  using (user_id = public.current_app_user_id());

create policy "clickup_tokens: admin all"
  on public.clickup_tokens for all
  to authenticated
  using (public.current_user_role() = 'admin'::user_role)
  with check (public.current_user_role() = 'admin'::user_role);