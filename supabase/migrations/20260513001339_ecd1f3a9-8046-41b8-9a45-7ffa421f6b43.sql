
revoke execute on function public.current_app_user_id() from public, anon;
revoke execute on function public.current_user_role() from public, anon;
revoke execute on function public.current_user_company_id() from public, anon;
revoke execute on function public.link_auth_user_on_signup() from public, anon, authenticated;
grant execute on function public.current_app_user_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.current_user_company_id() to authenticated;
