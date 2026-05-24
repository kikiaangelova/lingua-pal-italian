
-- Roles
do $$ begin
  create type public.app_role as enum ('admin','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "Roles readable by owner"
on public.user_roles for select
using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Admins can read all roles
create policy "Admins read all roles"
on public.user_roles for select
using (public.has_role(auth.uid(), 'admin'));

-- Tutor chat usage log
create table if not exists public.tutor_chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  created_at timestamptz not null default now(),
  model text,
  message_count integer not null default 0,
  char_count integer not null default 0,
  status text not null default 'ok'
);

create index if not exists tutor_chat_usage_created_at_idx
  on public.tutor_chat_usage (created_at desc);
create index if not exists tutor_chat_usage_user_id_created_at_idx
  on public.tutor_chat_usage (user_id, created_at desc);

alter table public.tutor_chat_usage enable row level security;

create policy "Usage insert by owner"
on public.tutor_chat_usage for insert
with check (auth.uid() = user_id);

create policy "Usage select by owner"
on public.tutor_chat_usage for select
using (auth.uid() = user_id);

create policy "Usage select by admin"
on public.tutor_chat_usage for select
using (public.has_role(auth.uid(), 'admin'));

-- Helper: hourly calls for a user (security definer so edge function can use it via anon key)
create or replace function public.hourly_calls_for_user(_user_id uuid)
returns integer
language sql stable security definer set search_path = public
as $$
  select count(*)::int from public.tutor_chat_usage
  where user_id = _user_id and created_at > now() - interval '1 hour'
$$;
