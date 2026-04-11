CREATE OR REPLACE FUNCTION public._get_current_staff_profile_by_role(
  p_role public.staff_type
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
DECLARE
    v_profile jsonb;
    v_is_valid boolean;
BEGIN
    SELECT to_jsonb(s) INTO v_profile
    FROM public.mfc_staff s
    WHERE s.id = auth.uid()
      AND s.role = p_role
      AND s.is_active = true;

    v_is_valid := v_profile IS NOT NULL;

    RETURN jsonb_build_object(
        'profile', v_profile,
        'is_valid', v_is_valid
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_staff_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role::text
    INTO v_role
    FROM public.mfc_staff
    WHERE id = auth.uid()
      AND is_active = true
    LIMIT 1;

    RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_user_id() RETURNS uuid
    LANGUAGE sql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
  SELECT id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.check_user_role(required_roles text[]) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
  SELECT public.get_my_staff_role() = ANY(required_roles)
$$;

CREATE OR REPLACE FUNCTION public.authorize_staff(p_required_roles text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
DECLARE
    v_role text;
BEGIN
    v_role := public.get_my_staff_role();

    IF v_role IS NULL OR NOT (v_role = ANY(p_required_roles)) THEN
        RAISE EXCEPTION 'Unauthorized: User does not have one of the required roles (%).', array_to_string(p_required_roles, ', ');
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_admin_profile() RETURNS jsonb
    LANGUAGE sql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
  SELECT public._get_current_staff_profile_by_role('admin')
$$;

CREATE OR REPLACE FUNCTION public.get_current_manager_info() RETURNS jsonb
    LANGUAGE sql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
  SELECT public._get_current_staff_profile_by_role('manager')
$$;

CREATE OR REPLACE FUNCTION public.get_current_mfc_seller_profile() RETURNS jsonb
    LANGUAGE sql SECURITY DEFINER STABLE
    SET search_path TO 'public'
AS $$
  SELECT public._get_current_staff_profile_by_role('mfc_seller')
$$;

ALTER FUNCTION public.approve_user(uuid, public.default_role, public.user_type, jsonb, text)
  SET search_path TO 'public';
ALTER FUNCTION public.create_auction_sale(uuid, jsonb, numeric, numeric, date)
  SET search_path TO 'public';
ALTER FUNCTION public.create_floor_sale(jsonb, date)
  SET search_path TO 'public';
ALTER FUNCTION public.create_quote(uuid, uuid, date, text, jsonb, text)
  SET search_path TO 'public';
ALTER FUNCTION public.create_sale_for_single_customer(uuid, jsonb, date)
  SET search_path TO 'public';
ALTER FUNCTION public.create_seller_batch_sale(uuid, jsonb, date)
  SET search_path TO 'public';
ALTER FUNCTION public.create_stock_batches(jsonb)
  SET search_path TO 'public';
ALTER FUNCTION public.create_user_as_staff(text, text, text, text, text, public.user_type, public.default_role, jsonb, text)
  SET search_path TO 'public';
ALTER FUNCTION public.get_staff_profile(uuid)
  SET search_path TO 'public';
ALTER FUNCTION public.get_user_profile(uuid)
  SET search_path TO 'public';
ALTER FUNCTION public.log_quote_advance(uuid, numeric)
  SET search_path TO 'public';
ALTER FUNCTION public.purchase_stock_from_seller(uuid, numeric, uuid, jsonb, date)
  SET search_path TO 'public';
ALTER FUNCTION public.reject_registration(uuid)
  SET search_path TO 'public';
ALTER FUNCTION public.register_fcm_token(text)
  SET search_path TO 'public';
ALTER FUNCTION public.submit_lump_sum_payment(uuid, numeric, public.payment_method_enum, date)
  SET search_path TO 'public';
ALTER FUNCTION public.submit_specific_bill_payment(uuid, numeric, public.payment_method_enum, date)
  SET search_path TO 'public';

DO $$
DECLARE
  v_table text;
  v_read_tables text[] := ARRAY[
    'chalans',
    'customer_balance',
    'customer_payments',
    'daily_bill_counters',
    'daily_bills',
    'deleted_records',
    'fcm_device_tokens',
    'mfc_staff',
    'products',
    'public_registrations',
    'quote_items',
    'quotes',
    'sale_transactions',
    'seller_balance',
    'seller_payments',
    'stock_batches',
    'system_config',
    'users'
  ];
  v_insert_tables text[] := ARRAY[
    'chalans',
    'customer_balance',
    'customer_payments',
    'daily_bill_counters',
    'daily_bills',
    'deleted_records',
    'fcm_device_tokens',
    'products',
    'public_registrations',
    'quote_items',
    'quotes',
    'sale_transactions',
    'seller_balance',
    'seller_payments',
    'stock_batches',
    'system_config',
    'users'
  ];
BEGIN
  FOREACH v_table IN ARRAY v_read_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Admin full access on ' || v_table, v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Manager read access on ' || v_table, v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Staff read access on ' || v_table, v_table);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL USING (public.check_user_role(ARRAY[''admin''])) WITH CHECK (public.check_user_role(ARRAY[''admin'']))',
      'Admin full access on ' || v_table,
      v_table
    );

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT USING (public.check_user_role(ARRAY[''admin'',''manager'']))',
      'Staff read access on ' || v_table,
      v_table
    );
  END LOOP;

  FOREACH v_table IN ARRAY v_insert_tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Manager insert access on ' || v_table, v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Staff insert access on ' || v_table, v_table);

    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT WITH CHECK (public.check_user_role(ARRAY[''admin'',''manager'']))',
      'Staff insert access on ' || v_table,
      v_table
    );
  END LOOP;
END;
$$;
