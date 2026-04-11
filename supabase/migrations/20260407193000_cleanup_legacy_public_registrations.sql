-- Remove the legacy public registration workflow after moving registration handling
-- into the auth server + D1 flow.

DROP FUNCTION IF EXISTS public.reject_registration(uuid, text);
DROP FUNCTION IF EXISTS public.approve_manager_invitation(uuid);
DROP FUNCTION IF EXISTS public.approve_user(
  uuid,
  public.default_role,
  public.user_type,
  jsonb,
  text
);
DROP FUNCTION IF EXISTS public.get_registration_invite_context(text);
DROP FUNCTION IF EXISTS public.create_manager_invitation(text, text, text);
DROP FUNCTION IF EXISTS public.create_user_invitation(
  text,
  text,
  text,
  text,
  public.user_type,
  public.default_role,
  text
);

DO $$
BEGIN
  EXECUTE 'DROP TABLE IF EXISTS public.public_registrations CASCADE';
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END;
$$;
