create or replace function public.get_access_context(p_auth_user_id uuid)
returns table (
  is_admin boolean,
  is_manager boolean,
  has_user_profile boolean,
  staff_id uuid,
  user_id uuid
)
language sql
security definer
set search_path = auth_app, public, pg_temp
as $$
  select *
  from auth_app.get_access_context(p_auth_user_id);
$$;

revoke all on function public.get_access_context(uuid) from public;
grant execute on function public.get_access_context(uuid) to service_role;

create or replace function public.finalize_manager_registration(
  p_actor_staff_id uuid,
  p_auth_user_id uuid,
  p_email text,
  p_full_name text,
  p_payload jsonb
)
returns uuid
language sql
security definer
set search_path = auth_app, public, pg_temp
as $$
  select auth_app.finalize_manager_registration(
    p_auth_user_id => p_auth_user_id,
    p_email => p_email,
    p_full_name => p_full_name,
    p_payload => p_payload,
    p_actor_staff_id => p_actor_staff_id
  );
$$;

revoke all on function public.finalize_manager_registration(uuid, uuid, text, text, jsonb) from public;
grant execute on function public.finalize_manager_registration(uuid, uuid, text, text, jsonb) to service_role;

create or replace function public.finalize_user_registration(
  p_actor_staff_id uuid,
  p_auth_user_id uuid,
  p_email text,
  p_full_name text,
  p_payload jsonb
)
returns uuid
language sql
security definer
set search_path = auth_app, public, pg_temp
as $$
  select auth_app.finalize_user_registration(
    p_auth_user_id => p_auth_user_id,
    p_email => p_email,
    p_full_name => p_full_name,
    p_payload => p_payload,
    p_actor_staff_id => p_actor_staff_id
  );
$$;

revoke all on function public.finalize_user_registration(uuid, uuid, text, text, jsonb) from public;
grant execute on function public.finalize_user_registration(uuid, uuid, text, text, jsonb) to service_role;
