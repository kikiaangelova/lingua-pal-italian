
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

revoke execute on function public.hourly_calls_for_user(uuid) from public, anon;
grant execute on function public.hourly_calls_for_user(uuid) to authenticated;
