create schema if not exists auth_app;

revoke all on schema auth_app from public;
revoke all on schema auth_app from anon;
revoke all on schema auth_app from authenticated;
grant usage on schema auth_app to service_role;

create or replace function auth_app.get_access_context(
  p_auth_user_id uuid
) returns table (
  is_admin boolean,
  is_manager boolean,
  has_user_profile boolean,
  staff_id uuid,
  user_id uuid
)
language sql
security definer
set search_path to public, auth_app
as $$
  select
    exists (
      select 1
      from public.mfc_staff s
      where s.id = p_auth_user_id
        and s.is_active = true
        and s.role = 'admin'::public.staff_type
    ) as is_admin,
    exists (
      select 1
      from public.mfc_staff s
      where s.id = p_auth_user_id
        and s.is_active = true
        and s.role = 'manager'::public.staff_type
    ) as is_manager,
    exists (
      select 1
      from public.users u
      where u.auth_user_id = p_auth_user_id
        and u.is_active = true
        and u.user_type is not null
        and u.default_role is not null
    ) as has_user_profile,
    (
      select s.id
      from public.mfc_staff s
      where s.id = p_auth_user_id
        and s.is_active = true
      limit 1
    ) as staff_id,
    (
      select u.id
      from public.users u
      where u.auth_user_id = p_auth_user_id
        and u.is_active = true
      limit 1
    ) as user_id;
$$;

create or replace function auth_app.finalize_manager_registration(
  p_auth_user_id uuid,
  p_email text,
  p_full_name text,
  p_payload jsonb default '{}'::jsonb,
  p_actor_staff_id uuid default null::uuid
) returns uuid
language plpgsql
security definer
set search_path to public, auth_app
as $$
declare
  v_full_name text := coalesce(nullif(trim(p_full_name), ''), split_part(p_email, '@', 1));
  v_staff_role public.staff_type := case
    when p_payload->>'requested_staff_role' in ('admin', 'manager', 'mfc_seller')
      then (p_payload->>'requested_staff_role')::public.staff_type
    else 'manager'::public.staff_type
  end;
begin
  insert into public.mfc_staff (
    id,
    full_name,
    role,
    is_active,
    is_default_admin,
    created_by,
    updated_by
  )
  values (
    p_auth_user_id,
    v_full_name,
    v_staff_role,
    true,
    false,
    p_actor_staff_id,
    p_actor_staff_id
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    role = excluded.role,
    is_active = true,
    updated_at = timezone('Asia/Kolkata', now()),
    updated_by = p_actor_staff_id;

  return p_auth_user_id;
end;
$$;

create or replace function auth_app.finalize_user_registration(
  p_auth_user_id uuid,
  p_email text,
  p_full_name text,
  p_payload jsonb default '{}'::jsonb,
  p_actor_staff_id uuid default null::uuid
) returns uuid
language plpgsql
security definer
set search_path to public, auth_app
as $$
declare
  v_user_id uuid;
  v_full_name text := coalesce(nullif(trim(p_full_name), ''), split_part(p_email, '@', 1));
  v_business_name text := nullif(trim(coalesce(p_payload->>'business_name', '')), '');
  v_phone text := nullif(trim(coalesce(p_payload->>'phone', '')), '');
  v_profile_photo_url text := nullif(trim(coalesce(p_payload->>'profile_photo_url', '')), '');
  v_default_role public.default_role;
  v_user_type public.user_type;
  v_address jsonb := coalesce(p_payload->'address', '{}'::jsonb);
begin
  if p_payload->>'requested_default_role' in ('buyer', 'seller') then
    v_default_role := (p_payload->>'requested_default_role')::public.default_role;
  end if;

  if p_payload->>'requested_user_type' in ('vendor', 'business') then
    v_user_type := (p_payload->>'requested_user_type')::public.user_type;
  end if;

  if v_default_role is null or v_user_type is null then
    raise exception 'User registrations require requested_user_type and requested_default_role in payload.';
  end if;

  select id
  into v_user_id
  from public.users
  where auth_user_id = p_auth_user_id
  limit 1;

  if v_user_id is null then
    insert into public.users (
      auth_user_id,
      name,
      business_name,
      phone,
      user_type,
      default_role,
      is_active,
      address,
      profile_photo_url,
      created_by,
      updated_by
    )
    values (
      p_auth_user_id,
      v_full_name,
      v_business_name,
      v_phone,
      v_user_type,
      v_default_role,
      true,
      v_address,
      v_profile_photo_url,
      p_actor_staff_id,
      p_actor_staff_id
    )
    returning id into v_user_id;
  else
    update public.users
    set
      name = v_full_name,
      business_name = coalesce(v_business_name, public.users.business_name),
      phone = coalesce(v_phone, public.users.phone),
      user_type = v_user_type,
      default_role = v_default_role,
      is_active = true,
      address = coalesce(v_address, public.users.address),
      profile_photo_url = coalesce(v_profile_photo_url, public.users.profile_photo_url),
      updated_at = timezone('Asia/Kolkata', now()),
      updated_by = p_actor_staff_id
    where id = v_user_id;
  end if;

  return v_user_id;
end;
$$;

revoke all on function auth_app.get_access_context(uuid) from public;
revoke all on function auth_app.get_access_context(uuid) from anon;
revoke all on function auth_app.get_access_context(uuid) from authenticated;
grant execute on function auth_app.get_access_context(uuid) to service_role;

revoke all on function auth_app.finalize_manager_registration(uuid, text, text, jsonb, uuid) from public;
revoke all on function auth_app.finalize_manager_registration(uuid, text, text, jsonb, uuid) from anon;
revoke all on function auth_app.finalize_manager_registration(uuid, text, text, jsonb, uuid) from authenticated;
grant execute on function auth_app.finalize_manager_registration(uuid, text, text, jsonb, uuid) to service_role;

revoke all on function auth_app.finalize_user_registration(uuid, text, text, jsonb, uuid) from public;
revoke all on function auth_app.finalize_user_registration(uuid, text, text, jsonb, uuid) from anon;
revoke all on function auth_app.finalize_user_registration(uuid, text, text, jsonb, uuid) from authenticated;
grant execute on function auth_app.finalize_user_registration(uuid, text, text, jsonb, uuid) to service_role;
