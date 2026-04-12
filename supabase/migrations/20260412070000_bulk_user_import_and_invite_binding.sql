CREATE OR REPLACE FUNCTION public.normalize_phone_text(p_phone text) RETURNS text
    LANGUAGE sql IMMUTABLE
    SET search_path TO 'public'
AS $$
  SELECT NULLIF(
    regexp_replace(trim(COALESCE(p_phone, '')), '[^0-9+]', '', 'g'),
    ''
  );
$$;

COMMENT ON FUNCTION public.normalize_phone_text(text) IS
  'Normalizes phone numbers for import and duplicate checks.';

CREATE OR REPLACE FUNCTION public.bulk_create_users_from_import(
  p_rows jsonb,
  p_dry_run boolean DEFAULT false
) RETURNS jsonb
    LANGUAGE plpgsql
    SET search_path TO 'public'
AS $$
DECLARE
  v_row jsonb;
  v_index integer := 0;
  v_total integer := 0;
  v_created integer := 0;
  v_skipped integer := 0;
  v_failed integer := 0;
  v_seen_phones text[] := ARRAY[]::text[];
  v_phone text;
  v_full_name text;
  v_business_name text;
  v_user_type_text text;
  v_default_role_text text;
  v_user_type public.user_type;
  v_default_role public.default_role;
  v_profile_photo_url text;
  v_address jsonb;
  v_existing_user_id uuid;
  v_existing_auth_user_id uuid;
  v_new_user_id uuid;
  v_reason text;
  v_created_rows jsonb := '[]'::jsonb;
  v_skipped_rows jsonb := '[]'::jsonb;
  v_failed_rows jsonb := '[]'::jsonb;
BEGIN
  IF coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Service role access required.';
  END IF;

  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RAISE EXCEPTION 'Rows payload must be a JSON array.';
  END IF;

  FOR v_row, v_index IN
    SELECT value, ordinality::int
    FROM jsonb_array_elements(p_rows) WITH ORDINALITY AS item(value, ordinality)
  LOOP
    v_total := v_total + 1;
    v_full_name := NULLIF(trim(COALESCE(v_row->>'full_name', v_row->>'name', '')), '');
    v_business_name := NULLIF(trim(COALESCE(v_row->>'business_name', '')), '');
    v_phone := public.normalize_phone_text(v_row->>'phone');
    v_user_type_text := lower(trim(COALESCE(v_row->>'user_type', '')));
    v_default_role_text := lower(trim(COALESCE(v_row->>'default_role', '')));
    v_profile_photo_url := NULLIF(trim(COALESCE(v_row->>'profile_photo_url', '')), '');
    v_address := COALESCE(v_row->'address_json', '{}'::jsonb);
    v_reason := NULL;

    IF v_full_name IS NULL THEN
      v_reason := 'full_name is required';
    ELSIF v_phone IS NULL THEN
      v_reason := 'phone is required';
    ELSIF v_user_type_text NOT IN ('vendor', 'business') THEN
      v_reason := 'user_type must be vendor or business';
    ELSIF v_default_role_text NOT IN ('buyer', 'seller') THEN
      v_reason := 'default_role must be buyer or seller';
    END IF;

    IF v_reason IS NOT NULL THEN
      v_failed := v_failed + 1;
      v_failed_rows := v_failed_rows || jsonb_build_array(
        jsonb_build_object(
          'row_number', v_index,
          'status', 'failed',
          'reason', v_reason,
          'full_name', v_full_name,
          'phone', v_phone,
          'user_type', v_user_type_text,
          'default_role', v_default_role_text
        )
      );
      CONTINUE;
    END IF;

    v_user_type := v_user_type_text::public.user_type;
    v_default_role := v_default_role_text::public.default_role;

    IF v_phone = ANY(v_seen_phones) THEN
      v_skipped := v_skipped + 1;
      v_skipped_rows := v_skipped_rows || jsonb_build_array(
        jsonb_build_object(
          'row_number', v_index,
          'status', 'skipped',
          'reason', 'duplicate phone in file',
          'full_name', v_full_name,
          'phone', v_phone
        )
      );
      CONTINUE;
    END IF;

    v_seen_phones := array_append(v_seen_phones, v_phone);

    SELECT id, auth_user_id
    INTO v_existing_user_id, v_existing_auth_user_id
    FROM public.users
    WHERE public.normalize_phone_text(phone) = v_phone
    LIMIT 1;

    IF v_existing_user_id IS NOT NULL THEN
      v_skipped := v_skipped + 1;
      v_skipped_rows := v_skipped_rows || jsonb_build_array(
        jsonb_build_object(
          'row_number', v_index,
          'status', 'skipped',
          'reason', CASE
            WHEN v_existing_auth_user_id IS NULL THEN 'phone already exists'
            ELSE 'phone already linked to an auth account'
          END,
          'user_id', v_existing_user_id,
          'phone', v_phone,
          'full_name', v_full_name
        )
      );
      CONTINUE;
    END IF;

    IF p_dry_run THEN
      v_created := v_created + 1;
      v_created_rows := v_created_rows || jsonb_build_array(
        jsonb_build_object(
          'row_number', v_index,
          'status', 'created',
          'would_create', true,
          'user_id', NULL,
          'phone', v_phone,
          'full_name', v_full_name
        )
      );
      CONTINUE;
    END IF;

    INSERT INTO public.users (
      auth_user_id,
      name,
      business_name,
      phone,
      user_type,
      default_role,
      address,
      profile_photo_url,
      is_active,
      created_by,
      updated_by
    )
    VALUES (
      NULL,
      v_full_name,
      v_business_name,
      v_phone,
      v_user_type,
      v_default_role,
      v_address,
      v_profile_photo_url,
      true,
      NULL,
      NULL
    )
    RETURNING id INTO v_new_user_id;

    v_created := v_created + 1;
    v_created_rows := v_created_rows || jsonb_build_array(
      jsonb_build_object(
        'row_number', v_index,
        'status', 'created',
        'user_id', v_new_user_id,
        'phone', v_phone,
        'full_name', v_full_name
      )
    );
  END LOOP;

  RETURN jsonb_build_object(
    'dry_run', p_dry_run,
    'total', v_total,
    'created', v_created,
    'skipped', v_skipped,
    'failed', v_failed,
    'created_rows', v_created_rows,
    'skipped_rows', v_skipped_rows,
    'failed_rows', v_failed_rows
  );
END;
$$;

COMMENT ON FUNCTION public.bulk_create_users_from_import(jsonb, boolean) IS
  'Service-role bulk import for public.users from Excel uploads without creating auth accounts.';

GRANT EXECUTE ON FUNCTION public.bulk_create_users_from_import(jsonb, boolean) TO service_role;
