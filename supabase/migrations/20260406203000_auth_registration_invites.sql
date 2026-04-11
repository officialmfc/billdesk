ALTER TABLE public.public_registrations
    DROP CONSTRAINT IF EXISTS public_registrations_id_fkey;

ALTER TABLE public.public_registrations
    ALTER COLUMN id SET DEFAULT extensions.uuid_generate_v4();

ALTER TABLE public.public_registrations
    ADD COLUMN IF NOT EXISTS auth_user_id uuid,
    ADD COLUMN IF NOT EXISTS registration_kind text NOT NULL DEFAULT 'self_signup',
    ADD COLUMN IF NOT EXISTS approval_target text NOT NULL DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS requested_app text,
    ADD COLUMN IF NOT EXISTS requested_platform text,
    ADD COLUMN IF NOT EXISTS requested_user_type public.user_type,
    ADD COLUMN IF NOT EXISTS requested_default_role public.default_role,
    ADD COLUMN IF NOT EXISTS requested_staff_role public.staff_type,
    ADD COLUMN IF NOT EXISTS invite_token text,
    ADD COLUMN IF NOT EXISTS invite_expires_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS invited_by uuid,
    ADD COLUMN IF NOT EXISTS approved_record_id uuid,
    ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone,
    ADD COLUMN IF NOT EXISTS rejection_reason text;

UPDATE public.public_registrations
SET auth_user_id = id
WHERE auth_user_id IS NULL;

ALTER TABLE public.public_registrations
    ADD CONSTRAINT public_registrations_auth_user_id_fkey
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.public_registrations
    ADD CONSTRAINT public_registrations_invited_by_fkey
    FOREIGN KEY (invited_by) REFERENCES public.mfc_staff(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_public_registrations_auth_user_id
    ON public.public_registrations (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_public_registrations_invite_token
    ON public.public_registrations (invite_token)
    WHERE invite_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_public_registrations_email_status
    ON public.public_registrations (lower(email), status);

COMMENT ON COLUMN public.public_registrations.id IS
    'Stable registration/request id. No longer doubles as the auth user id.';

COMMENT ON COLUMN public.public_registrations.auth_user_id IS
    'Linked auth.users id after the person actually signs up or accepts an invite.';

COMMENT ON COLUMN public.public_registrations.registration_kind IS
    'How the request entered the system: self_signup, user_invite, or manager_invite.';

COMMENT ON COLUMN public.public_registrations.approval_target IS
    'Final approval destination: public.users or public.mfc_staff.';

CREATE OR REPLACE FUNCTION public.cleanup_pending_registrations() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_cutoff timestamp with time zone := timezone('Asia/Kolkata', now()) - interval '7 days';
BEGIN
  DELETE FROM public.public_registrations
  WHERE status = 'pending'
    AND created_at < v_cutoff
    AND auth_user_id IS NULL;

  DELETE FROM auth.users
  WHERE id IN (
    SELECT auth_user_id
    FROM public.public_registrations
    WHERE status = 'pending'
      AND created_at < v_cutoff
      AND auth_user_id IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_signup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_full_name text := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'name', '')
  );
  v_business_name text := NULLIF(NEW.raw_user_meta_data->>'business_name', '');
  v_phone text := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  v_message text := NULLIF(NEW.raw_user_meta_data->>'message', '');
  v_requested_app text := COALESCE(NULLIF(NEW.raw_user_meta_data->>'requested_app', ''), 'user');
  v_requested_platform text := NULLIF(NEW.raw_user_meta_data->>'requested_platform', '');
  v_invite_token text := NULLIF(NEW.raw_user_meta_data->>'invite_token', '');
  v_requested_user_type public.user_type;
  v_requested_default_role public.default_role;
  v_registration_id uuid;
BEGIN
  IF NEW.raw_user_meta_data->>'requested_user_type' IN ('vendor', 'business') THEN
    v_requested_user_type := (NEW.raw_user_meta_data->>'requested_user_type')::public.user_type;
  END IF;

  IF NEW.raw_user_meta_data->>'requested_default_role' IN ('buyer', 'seller') THEN
    v_requested_default_role := (NEW.raw_user_meta_data->>'requested_default_role')::public.default_role;
  END IF;

  IF v_invite_token IS NOT NULL THEN
    UPDATE public.public_registrations
    SET
      auth_user_id = NEW.id,
      email = NEW.email,
      full_name = COALESCE(public.public_registrations.full_name, v_full_name),
      business_name = COALESCE(public.public_registrations.business_name, v_business_name),
      phone = COALESCE(public.public_registrations.phone, v_phone),
      message = COALESCE(public.public_registrations.message, v_message),
      requested_app = COALESCE(public.public_registrations.requested_app, v_requested_app),
      requested_platform = COALESCE(public.public_registrations.requested_platform, v_requested_platform),
      requested_user_type = COALESCE(public.public_registrations.requested_user_type, v_requested_user_type),
      requested_default_role = COALESCE(public.public_registrations.requested_default_role, v_requested_default_role),
      updated_at = timezone('Asia/Kolkata', now())
    WHERE invite_token = v_invite_token
      AND status = 'pending'
      AND auth_user_id IS NULL
      AND lower(email) = lower(NEW.email)
      AND (invite_expires_at IS NULL OR invite_expires_at >= timezone('Asia/Kolkata', now()))
    RETURNING id INTO v_registration_id;
  END IF;

  IF v_registration_id IS NULL THEN
    INSERT INTO public.public_registrations (
      auth_user_id,
      email,
      full_name,
      business_name,
      phone,
      message,
      status,
      registration_kind,
      approval_target,
      requested_app,
      requested_platform,
      requested_user_type,
      requested_default_role
    )
    VALUES (
      NEW.id,
      NEW.email,
      v_full_name,
      v_business_name,
      v_phone,
      v_message,
      'pending',
      'self_signup',
      'user',
      v_requested_app,
      v_requested_platform,
      v_requested_user_type,
      v_requested_default_role
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email text,
  p_full_name text,
  p_business_name text DEFAULT NULL::text,
  p_phone text DEFAULT NULL::text,
  p_user_type public.user_type DEFAULT 'vendor'::public.user_type,
  p_default_role public.default_role DEFAULT 'buyer'::public.default_role,
  p_requested_platform text DEFAULT 'mobile'::text
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_registration_id uuid;
  v_existing_auth_id uuid;
  v_email text := lower(trim(p_email));
  v_full_name text := NULLIF(trim(p_full_name), '');
  v_business_name text := NULLIF(trim(COALESCE(p_business_name, '')), '');
  v_phone text := NULLIF(trim(COALESCE(p_phone, '')), '');
  v_invite_token text := gen_random_uuid()::text;
  v_platform text := lower(trim(COALESCE(p_requested_platform, 'mobile')));
  v_current_staff_id uuid := auth.uid();
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Invite email is required.';
  END IF;

  IF v_platform NOT IN ('web', 'desktop', 'mobile') THEN
    RAISE EXCEPTION 'Requested platform must be web, desktop, or mobile.';
  END IF;

  SELECT id INTO v_existing_auth_id
  FROM auth.users
  WHERE lower(email) = v_email
  LIMIT 1;

  IF v_existing_auth_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.users WHERE auth_user_id = v_existing_auth_id
  ) THEN
    RAISE EXCEPTION 'A linked user account already exists for %.', v_email;
  END IF;

  SELECT id INTO v_registration_id
  FROM public.public_registrations
  WHERE lower(email) = v_email
    AND approval_target = 'user'
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_registration_id IS NOT NULL THEN
    UPDATE public.public_registrations
    SET
      full_name = COALESCE(v_full_name, public.public_registrations.full_name),
      business_name = COALESCE(v_business_name, public.public_registrations.business_name),
      phone = COALESCE(v_phone, public.public_registrations.phone),
      registration_kind = 'user_invite',
      approval_target = 'user',
      requested_app = 'user',
      requested_platform = v_platform,
      requested_user_type = p_user_type,
      requested_default_role = p_default_role,
      invite_token = v_invite_token,
      invite_expires_at = timezone('Asia/Kolkata', now()) + interval '7 days',
      invited_by = v_current_staff_id,
      rejected_at = NULL,
      rejection_reason = NULL,
      updated_at = timezone('Asia/Kolkata', now()),
      updated_by = v_current_staff_id
    WHERE id = v_registration_id;
  ELSE
    INSERT INTO public.public_registrations (
      email,
      full_name,
      business_name,
      phone,
      status,
      registration_kind,
      approval_target,
      requested_app,
      requested_platform,
      requested_user_type,
      requested_default_role,
      invite_token,
      invite_expires_at,
      invited_by,
      updated_by
    )
    VALUES (
      v_email,
      v_full_name,
      v_business_name,
      v_phone,
      'pending',
      'user_invite',
      'user',
      'user',
      v_platform,
      p_user_type,
      p_default_role,
      v_invite_token,
      timezone('Asia/Kolkata', now()) + interval '7 days',
      v_current_staff_id,
      v_current_staff_id
    )
    RETURNING id INTO v_registration_id;
  END IF;

  RETURN jsonb_build_object(
    'registration_id', v_registration_id,
    'invite_token', v_invite_token,
    'requested_app', 'user',
    'requested_platform', v_platform,
    'signup_path', format('/signup?app=user&platform=%s&invite=%s', v_platform, v_invite_token)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_manager_invitation(
  p_email text,
  p_full_name text,
  p_requested_platform text DEFAULT 'desktop'::text
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_registration_id uuid;
  v_existing_auth_id uuid;
  v_email text := lower(trim(p_email));
  v_full_name text := NULLIF(trim(p_full_name), '');
  v_invite_token text := gen_random_uuid()::text;
  v_platform text := lower(trim(COALESCE(p_requested_platform, 'desktop')));
  v_current_staff_id uuid := auth.uid();
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin']);

  IF v_email IS NULL OR v_email = '' THEN
    RAISE EXCEPTION 'Invite email is required.';
  END IF;

  IF v_platform NOT IN ('web', 'desktop', 'mobile') THEN
    RAISE EXCEPTION 'Requested platform must be web, desktop, or mobile.';
  END IF;

  SELECT id INTO v_existing_auth_id
  FROM auth.users
  WHERE lower(email) = v_email
  LIMIT 1;

  IF v_existing_auth_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.mfc_staff WHERE id = v_existing_auth_id
  ) THEN
    RAISE EXCEPTION 'A staff account already exists for %.', v_email;
  END IF;

  SELECT id INTO v_registration_id
  FROM public.public_registrations
  WHERE lower(email) = v_email
    AND approval_target = 'staff'
    AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_registration_id IS NOT NULL THEN
    UPDATE public.public_registrations
    SET
      full_name = COALESCE(v_full_name, public.public_registrations.full_name),
      registration_kind = 'manager_invite',
      approval_target = 'staff',
      requested_app = 'manager',
      requested_platform = v_platform,
      requested_staff_role = 'manager'::public.staff_type,
      invite_token = v_invite_token,
      invite_expires_at = timezone('Asia/Kolkata', now()) + interval '7 days',
      invited_by = v_current_staff_id,
      rejected_at = NULL,
      rejection_reason = NULL,
      updated_at = timezone('Asia/Kolkata', now()),
      updated_by = v_current_staff_id
    WHERE id = v_registration_id;
  ELSE
    INSERT INTO public.public_registrations (
      email,
      full_name,
      status,
      registration_kind,
      approval_target,
      requested_app,
      requested_platform,
      requested_staff_role,
      invite_token,
      invite_expires_at,
      invited_by,
      updated_by
    )
    VALUES (
      v_email,
      v_full_name,
      'pending',
      'manager_invite',
      'staff',
      'manager',
      v_platform,
      'manager'::public.staff_type,
      v_invite_token,
      timezone('Asia/Kolkata', now()) + interval '7 days',
      v_current_staff_id,
      v_current_staff_id
    )
    RETURNING id INTO v_registration_id;
  END IF;

  RETURN jsonb_build_object(
    'registration_id', v_registration_id,
    'invite_token', v_invite_token,
    'requested_app', 'manager',
    'requested_platform', v_platform,
    'signup_path', format('/signup?app=manager&platform=%s&invite=%s', v_platform, v_invite_token)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_registration_invite_context(
  p_invite_token text
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_registration public.public_registrations%ROWTYPE;
BEGIN
  SELECT *
  INTO v_registration
  FROM public.public_registrations
  WHERE invite_token = p_invite_token
    AND status = 'pending'
    AND (invite_expires_at IS NULL OR invite_expires_at >= timezone('Asia/Kolkata', now()))
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_registration IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'registration_id', v_registration.id,
    'email', v_registration.email,
    'full_name', v_registration.full_name,
    'business_name', v_registration.business_name,
    'phone', v_registration.phone,
    'registration_kind', v_registration.registration_kind,
    'approval_target', v_registration.approval_target,
    'requested_app', v_registration.requested_app,
    'requested_platform', v_registration.requested_platform,
    'requested_user_type', v_registration.requested_user_type,
    'requested_default_role', v_registration.requested_default_role,
    'requested_staff_role', v_registration.requested_staff_role,
    'invite_expires_at', v_registration.invite_expires_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_user(
  p_registration_id uuid,
  p_default_role public.default_role DEFAULT NULL::public.default_role,
  p_user_type public.user_type DEFAULT NULL::public.user_type,
  p_address jsonb DEFAULT NULL::jsonb,
  p_profile_photo_url text DEFAULT NULL::text
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  new_user_id uuid;
  v_staff_id uuid := auth.uid();
  v_reg_record public.public_registrations%ROWTYPE;
  v_auth_user_id uuid;
  v_default_role public.default_role;
  v_user_type public.user_type;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT * INTO v_reg_record
  FROM public.public_registrations
  WHERE id = p_registration_id;

  IF v_reg_record IS NULL THEN
    RAISE EXCEPTION 'Registration record not found';
  END IF;

  IF v_reg_record.approval_target <> 'user' THEN
    RAISE EXCEPTION 'Registration % is not a user registration.', p_registration_id;
  END IF;

  IF v_reg_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Registration % is already %.', p_registration_id, v_reg_record.status;
  END IF;

  v_auth_user_id := v_reg_record.auth_user_id;

  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'The invited user has not completed sign-up yet.';
  END IF;

  v_default_role := COALESCE(p_default_role, v_reg_record.requested_default_role);
  v_user_type := COALESCE(p_user_type, v_reg_record.requested_user_type);

  IF v_default_role IS NULL OR v_user_type IS NULL THEN
    RAISE EXCEPTION 'User type and default role are required to approve this registration.';
  END IF;

  SELECT id
  INTO new_user_id
  FROM public.users
  WHERE auth_user_id = v_auth_user_id
  LIMIT 1;

  IF new_user_id IS NULL THEN
    INSERT INTO public.users (
      auth_user_id,
      name,
      business_name,
      phone,
      user_type,
      default_role,
      address,
      profile_photo_url,
      created_by,
      updated_by
    )
    VALUES (
      v_auth_user_id,
      COALESCE(v_reg_record.full_name, split_part(v_reg_record.email, '@', 1)),
      v_reg_record.business_name,
      v_reg_record.phone,
      v_user_type,
      v_default_role,
      COALESCE(p_address, '{}'::jsonb),
      p_profile_photo_url,
      v_staff_id,
      v_staff_id
    )
    RETURNING id INTO new_user_id;
  ELSE
    UPDATE public.users
    SET
      name = COALESCE(v_reg_record.full_name, public.users.name),
      business_name = COALESCE(v_reg_record.business_name, public.users.business_name),
      phone = COALESCE(v_reg_record.phone, public.users.phone),
      user_type = v_user_type,
      default_role = v_default_role,
      address = COALESCE(p_address, public.users.address),
      profile_photo_url = COALESCE(p_profile_photo_url, public.users.profile_photo_url),
      is_active = true,
      updated_at = timezone('Asia/Kolkata', now()),
      updated_by = v_staff_id
    WHERE id = new_user_id;
  END IF;

  UPDATE public.public_registrations
  SET
    status = 'approved',
    approved_record_id = new_user_id,
    approved_at = timezone('Asia/Kolkata', now()),
    updated_at = timezone('Asia/Kolkata', now()),
    updated_by = v_staff_id,
    rejected_at = NULL,
    rejection_reason = NULL
  WHERE id = p_registration_id;

  RETURN new_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_manager_invitation(
  p_registration_id uuid
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_reg_record public.public_registrations%ROWTYPE;
  v_auth_user_id uuid;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin']);

  SELECT * INTO v_reg_record
  FROM public.public_registrations
  WHERE id = p_registration_id;

  IF v_reg_record IS NULL THEN
    RAISE EXCEPTION 'Registration record not found';
  END IF;

  IF v_reg_record.approval_target <> 'staff' THEN
    RAISE EXCEPTION 'Registration % is not a manager invitation.', p_registration_id;
  END IF;

  IF v_reg_record.status <> 'pending' THEN
    RAISE EXCEPTION 'Registration % is already %.', p_registration_id, v_reg_record.status;
  END IF;

  v_auth_user_id := v_reg_record.auth_user_id;

  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'The invited manager has not completed sign-up yet.';
  END IF;

  INSERT INTO public.mfc_staff (
    id,
    full_name,
    role,
    is_active,
    is_default_admin,
    created_by,
    updated_by
  )
  VALUES (
    v_auth_user_id,
    COALESCE(v_reg_record.full_name, split_part(v_reg_record.email, '@', 1)),
    COALESCE(v_reg_record.requested_staff_role, 'manager'::public.staff_type),
    true,
    false,
    v_staff_id,
    v_staff_id
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = true,
    updated_at = timezone('Asia/Kolkata', now()),
    updated_by = v_staff_id;

  UPDATE public.public_registrations
  SET
    status = 'approved',
    approved_record_id = v_auth_user_id,
    approved_at = timezone('Asia/Kolkata', now()),
    updated_at = timezone('Asia/Kolkata', now()),
    updated_by = v_staff_id,
    rejected_at = NULL,
    rejection_reason = NULL
  WHERE id = p_registration_id;

  RETURN v_auth_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_registration(
  p_registration_id uuid,
  p_reason text DEFAULT NULL::text
) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_auth_user_id uuid;
  v_status public.registration_status;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT auth_user_id, status
  INTO v_auth_user_id, v_status
  FROM public.public_registrations
  WHERE id = p_registration_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Registration record not found';
  END IF;

  IF v_status = 'approved' THEN
    RAISE EXCEPTION 'Approved registrations cannot be rejected.';
  END IF;

  UPDATE public.public_registrations
  SET
    status = 'rejected',
    rejected_at = timezone('Asia/Kolkata', now()),
    rejection_reason = NULLIF(trim(COALESCE(p_reason, '')), ''),
    updated_at = timezone('Asia/Kolkata', now()),
    updated_by = v_staff_id
  WHERE id = p_registration_id;

  IF v_auth_user_id IS NOT NULL THEN
    DELETE FROM auth.users WHERE id = v_auth_user_id;
  END IF;
END;
$$;
