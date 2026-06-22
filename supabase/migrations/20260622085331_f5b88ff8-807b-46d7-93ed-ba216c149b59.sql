
-- Create a private schema not exposed by the Data API (PostgREST).
create schema if not exists private;
grant usage on schema private to authenticated, service_role;

-- ============================================================
-- has_role: move SECURITY DEFINER helper into private schema
-- ============================================================

-- Drop policies that depend on public.has_role so we can replace the function.
drop policy if exists "Admins read all roles" on public.user_roles;
drop policy if exists "Usage select by admin" on public.tutor_chat_usage;
drop policy if exists "Admins can view all profiles" on public.profiles;

create or replace function private.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

revoke execute on function private.has_role(uuid, public.app_role) from public, anon;
grant execute on function private.has_role(uuid, public.app_role) to authenticated, service_role;

drop function if exists public.has_role(uuid, public.app_role);

-- Recreate admin policies against the private helper.
create policy "Admins read all roles"
on public.user_roles for select
to authenticated
using (private.has_role(auth.uid(), 'admin'));

create policy "Usage select by admin"
on public.tutor_chat_usage for select
to authenticated
using (private.has_role(auth.uid(), 'admin'));

-- profiles admin-read policy (only recreated if profiles table exists; safe no-op otherwise)
do $$ begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'profiles') then
    execute $p$create policy "Admins can view all profiles"
      on public.profiles for select
      to authenticated
      using (private.has_role(auth.uid(), 'admin'))$p$;
  end if;
end $$;

-- ============================================================
-- hourly_calls_for_user: keep only a service_role wrapper in public
-- (called via supabase.rpc from the tutor-chat edge function with the
--  service role key; service_role bypasses RLS so SECURITY INVOKER is safe).
-- ============================================================

drop function if exists public.hourly_calls_for_user(uuid);

create or replace function public.hourly_calls_for_user(_user_id uuid)
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::int from public.tutor_chat_usage
  where user_id = _user_id and created_at > now() - interval '1 hour'
$$;

revoke execute on function public.hourly_calls_for_user(uuid) from public, anon, authenticated;
grant execute on function public.hourly_calls_for_user(uuid) to service_role;
