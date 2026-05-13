
-- Enums
create type public.user_role as enum ('client','team','admin');
create type public.approval_action as enum ('approved','changes_requested');

-- Companies
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  clickup_folder_id text unique,
  clickup_company_field_value text unique,
  brand_primary_color text,
  brand_secondary_color text,
  logo_url text,
  monthly_content_count int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Users (app-level; linked to auth.users by id when signed in)
create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'client',
  company_id uuid references public.companies(id) on delete set null,
  clickup_user_id text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create index on public.users (auth_user_id);
create index on public.users (company_id);

-- ClickUp task cache
create table public.clickup_tasks_cache (
  task_id text primary key,
  list_id text,
  folder_id text,
  company_id uuid references public.companies(id) on delete set null,
  name text,
  subject text,
  kind text,
  publish_date timestamptz,
  status text,
  assignees jsonb default '[]'::jsonb,
  due_date timestamptz,
  description text,
  attachments jsonb default '[]'::jsonb,
  url text,
  last_synced_at timestamptz not null default now()
);
create index on public.clickup_tasks_cache (company_id);
create index on public.clickup_tasks_cache (folder_id);

-- Approvals
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references public.clickup_tasks_cache(task_id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  action public.approval_action not null,
  note text,
  created_at timestamptz not null default now()
);
create index on public.approvals (task_id);

-- Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  from_user_id uuid not null references public.users(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.messages (company_id);

-- Helper functions (security definer to avoid RLS recursion)
create or replace function public.current_app_user_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.users where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.current_user_company_id()
returns uuid language sql stable security definer set search_path = public as $$
  select company_id from public.users where auth_user_id = auth.uid() limit 1;
$$;

-- Enable RLS
alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.clickup_tasks_cache enable row level security;
alter table public.approvals enable row level security;
alter table public.messages enable row level security;

-- COMPANIES
create policy "companies: client sees own"
  on public.companies for select to authenticated
  using (
    public.current_user_role() in ('team','admin')
    or id = public.current_user_company_id()
  );
create policy "companies: team update"
  on public.companies for update to authenticated
  using (public.current_user_role() in ('team','admin'));
create policy "companies: admin all"
  on public.companies for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- USERS
create policy "users: self or team/admin select"
  on public.users for select to authenticated
  using (
    auth_user_id = auth.uid()
    or public.current_user_role() in ('team','admin')
    or (public.current_user_role() = 'client' and company_id = public.current_user_company_id())
  );
create policy "users: team update"
  on public.users for update to authenticated
  using (public.current_user_role() in ('team','admin'));
create policy "users: admin all"
  on public.users for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- CLICKUP TASKS CACHE
create policy "tasks: client sees own company"
  on public.clickup_tasks_cache for select to authenticated
  using (
    public.current_user_role() in ('team','admin')
    or company_id = public.current_user_company_id()
  );
create policy "tasks: team update"
  on public.clickup_tasks_cache for update to authenticated
  using (public.current_user_role() in ('team','admin'));
create policy "tasks: admin all"
  on public.clickup_tasks_cache for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- APPROVALS
create policy "approvals: select by company or staff"
  on public.approvals for select to authenticated
  using (
    public.current_user_role() in ('team','admin')
    or exists (
      select 1 from public.clickup_tasks_cache t
      where t.task_id = approvals.task_id
        and t.company_id = public.current_user_company_id()
    )
  );
create policy "approvals: client insert own company"
  on public.approvals for insert to authenticated
  with check (
    user_id = public.current_app_user_id()
    and (
      public.current_user_role() in ('team','admin')
      or exists (
        select 1 from public.clickup_tasks_cache t
        where t.task_id = approvals.task_id
          and t.company_id = public.current_user_company_id()
      )
    )
  );
create policy "approvals: team update"
  on public.approvals for update to authenticated
  using (public.current_user_role() in ('team','admin'));
create policy "approvals: admin all"
  on public.approvals for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- MESSAGES
create policy "messages: select by company or staff"
  on public.messages for select to authenticated
  using (
    public.current_user_role() in ('team','admin')
    or company_id = public.current_user_company_id()
  );
create policy "messages: client insert own company"
  on public.messages for insert to authenticated
  with check (
    from_user_id = public.current_app_user_id()
    and (
      public.current_user_role() in ('team','admin')
      or company_id = public.current_user_company_id()
    )
  );
create policy "messages: team update"
  on public.messages for update to authenticated
  using (public.current_user_role() in ('team','admin'));
create policy "messages: admin all"
  on public.messages for all to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Trigger: when an auth user signs in for the first time, link by email
create or replace function public.link_auth_user_on_signup()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.users
    set auth_user_id = new.id
    where email = new.email and auth_user_id is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.link_auth_user_on_signup();
