-- Clean app-only install script generated from public.sql.
-- Safe to run in a fresh Supabase SQL editor session.
-- It excludes dump-only ownership, grant, publication, and row-security noise.

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

SET check_function_bodies = false;






CREATE SCHEMA IF NOT EXISTS public;




CREATE TYPE public.default_role AS ENUM (
    'buyer',
    'seller'
);




CREATE TYPE public.payment_method_enum AS ENUM (
    'cash',
    'bank_transfer',
    'card',
    'upi',
    'initial_payout'
);




CREATE TYPE public.payment_status AS ENUM (
    'due',
    'partially_paid',
    'paid'
);




CREATE TYPE public.quote_status AS ENUM (
    'pending',
    'confirmed',
    'delivered',
    'cancelled'
);




CREATE TYPE public.registration_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);




CREATE TYPE public.sale_type AS ENUM (
    'auction',
    'direct_sell'
);




CREATE TYPE public.staff_type AS ENUM (
    'admin',
    'manager',
    'mfc_seller'
);




CREATE TYPE public.user_type AS ENUM (
    'vendor',
    'business'
);




CREATE FUNCTION public._get_current_staff_profile_by_role(p_role public.staff_type) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_profile jsonb;
    v_is_valid boolean;
BEGIN
    -- This internal function checks if the currently logged-in user has the specified active role.
    SELECT to_jsonb(s) INTO v_profile
    FROM public.mfc_staff s
    WHERE s.id = auth.uid() AND s.role = p_role AND s.is_active = true;

    v_is_valid := v_profile IS NOT NULL;

    RETURN jsonb_build_object(
        'profile', v_profile,
        'is_valid', v_is_valid
    );
END;
$$;




CREATE FUNCTION public._internal_create_sale_and_update_stock(p_daily_bill_id uuid, p_chalan_id uuid, p_staff_id uuid, p_sale_item jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_item_weight numeric;
    v_item_stock_batch_id uuid;
    v_product_id uuid;
BEGIN
    v_item_weight := (p_sale_item->>'weight')::numeric;
    v_item_stock_batch_id := (p_sale_item->>'stock_batch_id')::uuid;

    v_product_id := NULL;
    IF p_sale_item->>'product_id' IS NOT NULL THEN
      BEGIN
        v_product_id := (p_sale_item->>'product_id')::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_product_id := NULL;
      END;
    END IF;

    INSERT INTO public.sale_transactions (daily_bill_id, chalan_id, stock_batch_id, product_id, product_description, weight_kg, price_per_kg, created_by, updated_by, sale_type)
    VALUES (p_daily_bill_id, p_chalan_id, v_item_stock_batch_id, v_product_id, (p_sale_item->>'product_description')::text, v_item_weight, (p_sale_item->>'rate')::numeric, p_staff_id, p_staff_id, 'direct_sell');

    IF v_item_stock_batch_id IS NOT NULL THEN
        UPDATE public.stock_batches SET current_weight_kg = current_weight_kg - v_item_weight WHERE id = v_item_stock_batch_id;
    END IF;
END;
$$;




CREATE FUNCTION public._internal_validate_stock_availability(p_sale_items jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_sale_item jsonb;
    v_item_stock_batch_id uuid;
    v_current_stock numeric;
BEGIN
    FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
        v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
        IF v_item_stock_batch_id IS NOT NULL THEN
            SELECT current_weight_kg INTO v_current_stock
            FROM public.stock_batches WHERE id = v_item_stock_batch_id FOR UPDATE;

            IF v_current_stock <= 0 THEN
                RAISE EXCEPTION 'Stock for batch % is already depleted.',
                    (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
            END IF;
        END IF;
    END LOOP;
END;
$$;




CREATE FUNCTION public.approve_user(p_registration_id uuid, p_default_role public.default_role, p_user_type public.user_type, p_address jsonb DEFAULT NULL::jsonb, p_profile_photo_url text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  new_user_id uuid;
  v_staff_id uuid := auth.uid();
  v_reg_record public.public_registrations%ROWTYPE;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT * INTO v_reg_record FROM public.public_registrations WHERE id = p_registration_id;
  IF v_reg_record IS NULL THEN RAISE EXCEPTION 'Registration record not found'; END IF;

  INSERT INTO public.users (
    auth_user_id, name, business_name, phone, user_type, default_role,
    address, profile_photo_url, created_by, updated_by
  )
  VALUES (
    p_registration_id, v_reg_record.full_name, v_reg_record.business_name,
    v_reg_record.phone, p_user_type, p_default_role, p_address,
    p_profile_photo_url, v_staff_id, v_staff_id
  )
  RETURNING id INTO new_user_id;

  DELETE FROM public.public_registrations WHERE id = p_registration_id;
  RETURN new_user_id;
END;
$$;




CREATE FUNCTION public.authorize_staff(p_required_roles text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
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




CREATE FUNCTION public.check_user_role(required_roles text[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_role text;
BEGIN
    v_role := public.get_my_staff_role();
    RETURN v_role = ANY(required_roles);
END;
$$;




CREATE FUNCTION public.cleanup_pending_registrations() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM auth.users
  WHERE id IN (
    SELECT id
    FROM public.public_registrations
    WHERE status = 'pending'
    AND created_at < (timezone('Asia/Kolkata', now()) - interval '7 days')
  );
END;
$$;




CREATE FUNCTION public.create_auction_sale(p_seller_id uuid, p_sale_items jsonb, p_commission_percentage numeric DEFAULT 6.0, p_paid_amount numeric DEFAULT NULL::numeric, p_chalan_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_chalan_id uuid;
  v_staff_id uuid := auth.uid();
  v_chalan_number_generated TEXT;
  v_sale_item jsonb;
  v_item_buyer_id uuid;
  v_item_bill_id uuid;
  v_final_rounded_net_amount numeric;
  v_payment_to_log numeric;
  v_product_id uuid;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  v_chalan_number_generated := 'MFC-CH-' || nextval('public.chalan_number_seq');

  INSERT INTO public.chalans (
    seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent,
    created_by, updated_by
  )
  VALUES (
    p_seller_id, NULL, v_chalan_number_generated, p_chalan_date, p_commission_percentage,
    v_staff_id, v_staff_id
  )
  RETURNING id INTO v_chalan_id;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
  LOOP
    v_item_buyer_id := (v_sale_item->>'buyer_id')::uuid;

    v_product_id := NULL;
    IF v_sale_item->>'product_id' IS NOT NULL THEN
      BEGIN
        v_product_id := (v_sale_item->>'product_id')::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_product_id := NULL;
      END;
    END IF;

    v_item_bill_id := public.get_or_create_daily_bill(
      v_item_buyer_id,
      p_chalan_date,
      v_staff_id
    );

    INSERT INTO public.sale_transactions (
      daily_bill_id, chalan_id, product_id, product_description,
      weight_kg, price_per_kg, created_by, updated_by,
      sale_type
    )
    VALUES (
      v_item_bill_id, v_chalan_id, v_product_id, (v_sale_item->>'product_description')::text,
      (v_sale_item->>'weight')::numeric, (v_sale_item->>'rate')::numeric, v_staff_id, v_staff_id,
      'auction'
    );
  END LOOP;

  SELECT net_payable INTO v_final_rounded_net_amount
  FROM public.chalans WHERE id = v_chalan_id;

  IF p_paid_amount IS NULL THEN
    v_payment_to_log := v_final_rounded_net_amount;
  ELSE
    v_payment_to_log := p_paid_amount;
  END IF;

  INSERT INTO public.seller_payments (chalan_id, amount, payment_date, created_by, updated_by, payment_method)
  VALUES (v_chalan_id, v_payment_to_log, p_chalan_date, v_staff_id, v_staff_id, 'initial_payout');

  UPDATE public.chalans
  SET amount_paid = v_payment_to_log,
      status = CASE
        WHEN v_payment_to_log >= v_final_rounded_net_amount THEN 'paid'::public.payment_status
        WHEN v_payment_to_log = 0 AND v_final_rounded_net_amount > 0 THEN 'due'::public.payment_status
        WHEN v_payment_to_log > 0 THEN 'partially_paid'::public.payment_status
        ELSE 'paid'::public.payment_status
      END
  WHERE id = v_chalan_id;

  RETURN v_chalan_id;
END;
$$;




CREATE FUNCTION public.create_floor_sale(p_sale_items jsonb, p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid(); v_staff_role TEXT; v_sale_item jsonb;
  v_item_buyer_id uuid; v_item_bill_id uuid; v_item_seller_id uuid; v_chalan_id uuid;
  v_item_stock_batch_id uuid; v_item_weight numeric; v_current_stock numeric;
  v_chalan_number_generated TEXT; seller_chalan_map jsonb := '{}'::jsonb;
  v_created_chalan_ids uuid[] := ARRAY[]::uuid[]; v_created_bill_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  SELECT role::text INTO v_staff_role FROM public.mfc_staff WHERE id = v_staff_id;
  IF v_staff_role NOT IN ('admin', 'manager') THEN RAISE EXCEPTION 'Not authorized'; END IF;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
    IF v_item_stock_batch_id IS NOT NULL THEN
      SELECT current_weight_kg INTO v_current_stock FROM public.stock_batches WHERE id = v_item_stock_batch_id FOR UPDATE;
      IF v_current_stock <= 0 THEN
        RAISE EXCEPTION 'Stock for batch % is already depleted.', (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
      END IF;
    END IF;
  END LOOP;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_seller_id := (v_sale_item->>'mfc_seller_id')::uuid;
    v_item_buyer_id := (v_sale_item->>'buyer_id')::uuid;

    v_chalan_id := (seller_chalan_map->>v_item_seller_id::text)::uuid;
    IF v_chalan_id IS NULL THEN
      v_chalan_number_generated := 'MFC-FL-' || nextval('public.mfc_floor_sale_seq');
      INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
      VALUES (NULL, v_item_seller_id, v_chalan_number_generated, p_sale_date, 0, v_staff_id, v_staff_id)
      RETURNING id INTO v_chalan_id;
      seller_chalan_map := seller_chalan_map || jsonb_build_object(v_item_seller_id, v_chalan_id);
      v_created_chalan_ids := array_append(v_created_chalan_ids, v_chalan_id);
    END IF;

    v_item_bill_id := public.get_or_create_daily_bill(v_item_buyer_id, p_sale_date, v_staff_id);
    v_created_bill_ids := array_append(v_created_bill_ids, v_item_bill_id);

    v_item_weight := (v_sale_item->>'weight')::numeric;
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;

    PERFORM public._internal_create_sale_and_update_stock(v_item_bill_id, v_chalan_id, v_staff_id, v_sale_item);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'created_chalans', (SELECT array_agg(DISTINCT e) FROM unnest(v_created_chalan_ids) e),
    'created_bills', (SELECT array_agg(DISTINCT e) FROM unnest(v_created_bill_ids) e)
  );
END;
$$;




CREATE FUNCTION public.create_quote(p_customer_id uuid, p_assigned_mfc_seller_id uuid, p_delivery_date date, p_quote_number text, p_items jsonb, p_notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_quote_id uuid;
  v_staff_id uuid := auth.uid();
  v_item jsonb;
  v_line_total numeric;
  v_total_amount numeric := 0;
  v_product_id uuid;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager', 'mfc_seller']);

  INSERT INTO public.quotes (
    customer_id, assigned_mfc_seller_id, delivery_date, quote_number,
    status, notes, created_by, updated_by
  ) VALUES (
    p_customer_id, p_assigned_mfc_seller_id, p_delivery_date, p_quote_number,
    'pending'::public.quote_status, p_notes, v_staff_id, v_staff_id
  ) RETURNING id INTO v_quote_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_line_total := (v_item->>'weight_kg')::numeric * (v_item->>'price_per_kg')::numeric;
    v_total_amount := v_total_amount + v_line_total;

    v_product_id := NULL;
    IF v_item->>'product_id' IS NOT NULL THEN
      BEGIN
        v_product_id := (v_item->>'product_id')::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_product_id := NULL;
      END;
    END IF;

    INSERT INTO public.quote_items (
      quote_id, product_id, product_description, weight_kg, price_per_kg, line_total
    ) VALUES (
      v_quote_id, v_product_id, v_item->>'product_description',
      (v_item->>'weight_kg')::numeric, (v_item->>'price_per_kg')::numeric, v_line_total
    );
  END LOOP;

  UPDATE public.quotes
  SET total_amount = v_total_amount
  WHERE id = v_quote_id;
  RETURN v_quote_id;
END;
$$;




CREATE FUNCTION public.create_sale_for_single_customer(p_buyer_id uuid, p_sale_items jsonb, p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_sale_item jsonb;
  v_item_stock_batch_id uuid;
  v_current_stock numeric;
  v_bill_id uuid;
  v_item_seller_id uuid;
  v_chalan_id uuid;
  seller_chalan_map jsonb := '{}'::jsonb;
  v_chalan_number_generated TEXT;
  v_item_weight numeric;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
    IF v_item_stock_batch_id IS NOT NULL THEN
      SELECT current_weight_kg INTO v_current_stock FROM public.stock_batches WHERE id = v_item_stock_batch_id FOR UPDATE;
      IF v_current_stock <= 0 THEN
        RAISE EXCEPTION 'Stock for batch % is already depleted.', (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
      END IF;
    END IF;
  END LOOP;

  v_bill_id := public.get_or_create_daily_bill(p_buyer_id, p_sale_date, v_staff_id);

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_seller_id := (v_sale_item->>'mfc_seller_id')::uuid;
    v_chalan_id := (seller_chalan_map->>v_item_seller_id::text)::uuid;
    IF v_chalan_id IS NULL THEN
      v_chalan_number_generated := 'MFC-S-' || nextval('public.mfc_single_bill_seq');
      INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
      VALUES (NULL, v_item_seller_id, v_chalan_number_generated, p_sale_date, 0, v_staff_id, v_staff_id)
      RETURNING id INTO v_chalan_id;
      seller_chalan_map := seller_chalan_map || jsonb_build_object(v_item_seller_id, v_chalan_id);
    END IF;

    v_item_weight := (v_sale_item->>'weight')::numeric;
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;

    PERFORM public._internal_create_sale_and_update_stock(v_bill_id, v_chalan_id, v_staff_id, v_sale_item);
  END LOOP;

  RETURN v_bill_id;
END;
$$;




CREATE FUNCTION public.create_seller_batch_sale(p_mfc_seller_id uuid, p_sale_items jsonb, p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid(); v_staff_role TEXT; v_sale_item jsonb;
  v_item_buyer_id uuid; v_item_bill_id uuid; v_item_stock_batch_id uuid;
  v_item_weight numeric; v_current_stock numeric; v_chalan_id uuid;
  v_chalan_number_generated TEXT;
BEGIN
  SELECT role::text INTO v_staff_role FROM public.mfc_staff WHERE id = v_staff_id;
  IF v_staff_role NOT IN ('admin', 'manager') THEN RAISE EXCEPTION 'Not authorized'; END IF;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
    IF v_item_stock_batch_id IS NOT NULL THEN
      SELECT current_weight_kg INTO v_current_stock FROM public.stock_batches WHERE id = v_item_stock_batch_id FOR UPDATE;
      IF v_current_stock <= 0 THEN
        RAISE EXCEPTION 'Stock for batch % is already depleted.', (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
      END IF;
    END IF;
  END LOOP;

  v_chalan_number_generated := 'MFC-B-' || nextval('public.mfc_batch_bill_seq');
  INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
  VALUES (NULL, p_mfc_seller_id, v_chalan_number_generated, p_sale_date, 0, v_staff_id, v_staff_id)
  RETURNING id INTO v_chalan_id;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_buyer_id := (v_sale_item->>'buyer_id')::uuid;
    v_item_bill_id := public.get_or_create_daily_bill(v_item_buyer_id, p_sale_date, v_staff_id);
    v_item_weight := (v_sale_item->>'weight')::numeric;
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;

    PERFORM public._internal_create_sale_and_update_stock(v_item_bill_id, v_chalan_id, v_staff_id, v_sale_item);
  END LOOP;

  RETURN v_chalan_id;
END;
$$;




CREATE FUNCTION public.create_stock_batches(p_batches jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_batch jsonb;
  v_product_id uuid;
  v_product_name text;
  v_created_batch_ids uuid[] := ARRAY[]::uuid[];
  v_batch_id uuid;
BEGIN
  -- Authorize: Only admin or manager can create stock batches
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);
  
  -- Loop through each batch
  FOR v_batch IN SELECT * FROM jsonb_array_elements(p_batches)
  LOOP
    v_product_id := (v_batch->>'product_id')::uuid;
    v_product_name := v_batch->>'product_name';
    
    -- If product_id is null but product_name is provided, create new product
    IF v_product_id IS NULL AND v_product_name IS NOT NULL AND v_product_name != '' THEN
      INSERT INTO public.products (name, created_by, updated_by)
      VALUES (v_product_name, v_staff_id, v_staff_id)
      RETURNING id INTO v_product_id;
      
      RAISE NOTICE 'Created new product: % with ID: %', v_product_name, v_product_id;
    END IF;
    
    -- Validate required fields
    IF v_product_id IS NULL THEN
      RAISE EXCEPTION 'Product ID or product name is required for batch creation';
    END IF;
    
    IF (v_batch->>'mfc_seller_id')::uuid IS NULL THEN
      RAISE EXCEPTION 'MFC seller ID is required for batch creation';
    END IF;
    
    IF (v_batch->>'initial_weight_kg')::numeric <= 0 THEN
      RAISE EXCEPTION 'Initial weight must be greater than 0';
    END IF;
    
    -- Insert stock batch
    INSERT INTO public.stock_batches (
      product_id,
      mfc_seller_id,
      supplier_id,
      initial_weight_kg,
      current_weight_kg,
      cost_per_kg,
      created_by,
      updated_by
    )
    VALUES (
      v_product_id,
      (v_batch->>'mfc_seller_id')::uuid,
      (v_batch->>'supplier_id')::uuid,
      (v_batch->>'initial_weight_kg')::numeric,
      (v_batch->>'initial_weight_kg')::numeric, -- current = initial at creation
      (v_batch->>'cost_per_kg')::numeric,
      v_staff_id,
      v_staff_id
    )
    RETURNING id INTO v_batch_id;
    
    v_created_batch_ids := array_append(v_created_batch_ids, v_batch_id);
  END LOOP;
  
  -- Return created batch IDs
  RETURN jsonb_build_object(
    'success', true,
    'batch_ids', to_jsonb(v_created_batch_ids),
    'count', array_length(v_created_batch_ids, 1)
  );
END;
$$;




CREATE FUNCTION public.create_user_as_staff(p_email text, p_password text, p_full_name text, p_business_name text, p_phone text, p_user_type public.user_type, p_default_role public.default_role, p_address jsonb DEFAULT NULL::jsonb, p_profile_photo_url text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  new_auth_user_id uuid;
  new_user_id uuid;
  v_staff_id uuid := auth.uid();
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  IF p_email IS NOT NULL AND p_password IS NOT NULL THEN
    new_auth_user_id := auth.admin.create_user(
      email := p_email, password := p_password, email_confirm := true
    );
  END IF;

  INSERT INTO public.users (
    auth_user_id, name, business_name, phone, user_type, default_role,
    address, profile_photo_url, created_by, updated_by
  )
  VALUES (
    new_auth_user_id, p_full_name, p_business_name, p_phone, p_user_type,
    p_default_role, p_address, p_profile_photo_url, v_staff_id, v_staff_id
  )
  RETURNING id INTO new_user_id;
  RETURN new_user_id;
END;
$$;




CREATE FUNCTION public.debug_rls_status() RETURNS TABLE(auth_uid uuid, staff_role text, is_staff_active boolean, user_id uuid, user_type text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        auth.uid(),
        (SELECT role::text FROM public.mfc_staff WHERE id = auth.uid()),
        (SELECT is_active FROM public.mfc_staff WHERE id = auth.uid()),
        (SELECT id FROM public.users WHERE auth_user_id = auth.uid()),
        (SELECT user_type::text FROM public.users WHERE auth_user_id = auth.uid());
END;
$$;




CREATE FUNCTION public.get_auth_id_or_default() RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_auth_id uuid;
BEGIN
  -- Try to get the current user's ID
  v_auth_id := auth.uid();
  -- If null (e.g., system process), return the nil UUID for clear audit trails.
  RETURN COALESCE(v_auth_id, '00000000-0000-0000-0000-000000000000'::uuid);
END;
$$;




CREATE FUNCTION public.get_current_admin_profile() RETURNS jsonb
    LANGUAGE sql SECURITY DEFINER
    AS $$
  -- Wrapper function to check for 'admin' role.
  SELECT public._get_current_staff_profile_by_role('admin');
$$;




CREATE FUNCTION public.get_current_manager_info() RETURNS jsonb
    LANGUAGE sql SECURITY DEFINER
    AS $$
  -- Wrapper function to check for 'manager' role.
  SELECT public._get_current_staff_profile_by_role('manager');
$$;




CREATE FUNCTION public.get_current_mfc_seller_profile() RETURNS jsonb
    LANGUAGE sql SECURITY DEFINER
    AS $$
  -- Wrapper function to check for 'mfc_seller' role.
  SELECT public._get_current_staff_profile_by_role('mfc_seller');
$$;




CREATE FUNCTION public.get_my_staff_role() RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_role text;
BEGIN
    SELECT role::text INTO v_role
    FROM public.mfc_staff
    WHERE id = auth.uid()
    AND is_active = true
    LIMIT 1;

    RETURN v_role;
END;
$$;




CREATE FUNCTION public.get_my_user_id() RETURNS uuid
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id FROM public.users WHERE auth_user_id = auth.uid()
$$;




CREATE FUNCTION public.get_or_create_daily_bill(p_customer_id uuid, p_bill_date date, p_created_by uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_bill_id uuid;
  v_bill_number TEXT;
  v_daily_count integer;
BEGIN
  SELECT id INTO v_bill_id
  FROM public.daily_bills
  WHERE customer_id = p_customer_id AND bill_date = p_bill_date;

  IF v_bill_id IS NOT NULL THEN
    RETURN v_bill_id;
  END IF;

  INSERT INTO public.daily_bill_counters (bill_date, last_bill_number)
  VALUES (p_bill_date, 1)
  ON CONFLICT (bill_date)
  DO UPDATE SET
    last_bill_number = public.daily_bill_counters.last_bill_number + 1
  RETURNING last_bill_number INTO v_daily_count;

  v_bill_number := 'BILL-' || to_char(p_bill_date, 'DDMMYY') || '-' || v_daily_count::text;

  INSERT INTO public.daily_bills (
    customer_id, bill_date, created_by, updated_by, bill_number
  )
  VALUES (
    p_customer_id, p_bill_date, p_created_by, p_created_by, v_bill_number
  )
  RETURNING id INTO v_bill_id;

  RETURN v_bill_id;
END;
$$;




CREATE FUNCTION public.get_recently_updated(p_table_name text, p_minutes integer DEFAULT 5) RETURNS TABLE(id uuid, updated_at timestamp with time zone, updated_by uuid, updated_by_name text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF public.get_my_staff_role() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY EXECUTE format(
    'SELECT t.id, t.updated_at, t.updated_by, s.full_name as updated_by_name
     FROM public.%I t
     LEFT JOIN public.mfc_staff s ON t.updated_by = s.id
     WHERE t.updated_at > timezone(''Asia/Kolkata'', now()) - interval ''%s minutes''
     ORDER BY t.updated_at DESC
     LIMIT 100',
    p_table_name,
    p_minutes
  );
END;
$$;




CREATE FUNCTION public.get_staff_profile(p_staff_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_profile jsonb;
BEGIN
    SELECT to_jsonb(s) INTO v_profile
    FROM public.mfc_staff s
    WHERE s.id = p_staff_id;

    RETURN v_profile;
END;
$$;




CREATE FUNCTION public.get_user_profile(p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_profile jsonb;
    v_staff_role TEXT := public.get_my_staff_role();
    v_my_user_id uuid := public.get_my_user_id();
BEGIN
    -- Security check: Allow access only to admins, managers, or the user themselves.
    IF v_staff_role IN ('admin', 'manager') OR v_my_user_id = p_user_id THEN
    SELECT to_jsonb(u) INTO v_profile
    FROM public.users u
    WHERE u.id = p_user_id;

    RETURN v_profile;
    ELSE
        RAISE EXCEPTION 'Unauthorized to access this user profile.';
    END IF;
END;
$$;




CREATE FUNCTION public.handle_audit_stamps() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  NEW.updated_at := timezone('Asia/Kolkata', now());
  NEW.updated_by := public.get_auth_id_or_default();
  RETURN NEW;
END;
$$;




CREATE FUNCTION public.handle_new_user_signup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.public_registrations (id, email, full_name, business_name, phone, message, status)
  VALUES (
    NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'business_name', NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'message', 'pending'
  );
  RETURN NEW;
END;
$$;




CREATE FUNCTION public.initialize_user_balance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.customer_balance (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.seller_balance (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;




CREATE FUNCTION public.log_quote_advance(p_quote_id uuid, p_amount_paid numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager', 'mfc_seller']);

  UPDATE public.quotes
  SET advance_paid = advance_paid + p_amount_paid,
      status = 'confirmed'::public.quote_status,
      updated_at = timezone('Asia/Kolkata', now()),
      updated_by = v_staff_id
  WHERE id = p_quote_id;
END;
$$;




CREATE FUNCTION public.mark_deletions_synced(p_deletion_ids uuid[]) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_updated_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.deleted_records
  SET
    synced_to_clients = true,
    sync_completed_at = timezone('Asia/Kolkata', now())
  WHERE id = ANY(p_deletion_ids)
    AND synced_to_clients = false;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN v_updated_count;
END;
$$;




CREATE FUNCTION public.notify_user_of_record_change() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_user_auth_id uuid;
  v_buyer_auth_id uuid;
  v_seller_auth_id uuid;
  v_topic TEXT;
  v_payload jsonb;
  v_record_id uuid;
  v_record jsonb;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_record := to_jsonb(OLD);
    v_record_id := OLD.id;
  ELSE
    v_record := to_jsonb(NEW);
    v_record_id := NEW.id;
  END IF;

  CASE TG_TABLE_NAME

    WHEN 'deleted_records' THEN
      IF (TG_OP = 'INSERT') THEN
        v_user_auth_id := (v_record ->> 'record_owner_auth_id')::uuid;
        IF v_user_auth_id IS NOT NULL THEN
          v_topic := 'user-notifications:' || v_user_auth_id;
          v_payload := jsonb_build_object(
            'table', (v_record ->> 'table_name'),
            'operation', 'DELETE',
            'record_id', (v_record ->> 'record_id')::uuid
          );
          PERFORM realtime.send(v_payload, 'data_updated', v_topic, true);
        END IF;
      END IF;
      RETURN NULL;

    WHEN 'sale_transactions' THEN
      v_payload := jsonb_build_object('table', TG_TABLE_NAME, 'operation', TG_OP, 'record_id', v_record_id);

      SELECT u.auth_user_id INTO v_buyer_auth_id
      FROM public.daily_bills db JOIN public.users u ON db.customer_id = u.id
      WHERE db.id = (v_record ->> 'daily_bill_id')::uuid;

      IF v_buyer_auth_id IS NOT NULL THEN
        v_topic := 'user-notifications:' || v_buyer_auth_id;
        PERFORM realtime.send(v_payload, 'data_updated', v_topic, true);
      END IF;

      SELECT u.auth_user_id INTO v_seller_auth_id
      FROM public.chalans c JOIN public.users u ON c.seller_id = u.id
      WHERE c.id = (v_record ->> 'chalan_id')::uuid AND c.seller_id IS NOT NULL;

      IF v_seller_auth_id IS NOT NULL THEN
        v_topic := 'user-notifications:' || v_seller_auth_id;
        PERFORM realtime.send(v_payload, 'data_updated', v_topic, true);
      END IF;
      RETURN NULL;

    WHEN 'quote_items' THEN
      SELECT u.auth_user_id INTO v_user_auth_id
      FROM public.quotes q JOIN public.users u ON q.customer_id = u.id
      WHERE q.id = (v_record ->> 'quote_id')::uuid;

    WHEN 'daily_bills' THEN
      SELECT auth_user_id INTO v_user_auth_id FROM users WHERE id = (v_record ->> 'customer_id')::uuid;
    WHEN 'chalans' THEN
      SELECT auth_user_id INTO v_user_auth_id FROM users WHERE id = (v_record ->> 'seller_id')::uuid;
    WHEN 'quotes' THEN
      SELECT auth_user_id INTO v_user_auth_id FROM users WHERE id = (v_record ->> 'customer_id')::uuid;
    WHEN 'stock_batches' THEN
      SELECT auth_user_id INTO v_user_auth_id FROM users WHERE id = (v_record ->> 'supplier_id')::uuid;
    WHEN 'customer_payments' THEN
      SELECT u.auth_user_id INTO v_user_auth_id
      FROM daily_bills db JOIN users u ON db.customer_id = u.id
      WHERE db.id = (v_record ->> 'daily_bill_id')::uuid;
    WHEN 'seller_payments' THEN
      SELECT u.auth_user_id INTO v_user_auth_id
      FROM chalans c JOIN users u ON c.seller_id = u.id
      WHERE c.id = (v_record ->> 'chalan_id')::uuid;
    WHEN 'users' THEN
      v_user_auth_id := (v_record ->> 'auth_user_id')::uuid;
    ELSE
      RETURN NULL;
  END CASE;

  IF v_user_auth_id IS NOT NULL THEN
    v_topic := 'user-notifications:' || v_user_auth_id;

    v_payload := jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', v_record_id
    );

    PERFORM realtime.send(
      v_payload,
      'data_updated',
      v_topic,
      true
    );
  END IF;

  RETURN NULL;
END;
$$;




CREATE FUNCTION public.prevent_last_default_admin_removal() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    IF (TG_OP = 'DELETE' AND OLD.is_default_admin) OR (TG_OP = 'UPDATE' AND OLD.is_default_admin AND NOT NEW.is_default_admin) THEN
        IF (SELECT COUNT(*) FROM public.mfc_staff WHERE is_default_admin = true) = 1 THEN
            RAISE EXCEPTION 'Cannot remove or demote the last default admin. Please set another staff member as the default admin first.';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        RETURN NEW;
    ELSE
        RETURN OLD;
    END IF;
END;
$$;




CREATE FUNCTION public.purchase_stock_from_seller(p_seller_id uuid, p_commission_percentage numeric, p_mfc_seller_id_to_assign uuid, p_purchase_items jsonb, p_purchase_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_mfc_stock_buyer_id uuid;
  v_chalan_number_generated TEXT;
  v_chalan_id uuid;
  v_mfc_bill_id uuid;
  v_item jsonb;
  v_item_weight numeric;
  v_item_rate numeric;
  v_item_product_id uuid;
  v_net_payable numeric;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT mfc_stock_buyer_id INTO v_mfc_stock_buyer_id FROM public.system_config WHERE id = 1;
  IF v_mfc_stock_buyer_id IS NULL THEN
    RAISE EXCEPTION 'System buyer ID is not configured.';
  END IF;

  v_chalan_number_generated := 'MFC-P-' || nextval('public.chalan_number_seq');
  INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
  VALUES (p_seller_id, NULL, v_chalan_number_generated, p_purchase_date, p_commission_percentage, v_staff_id, v_staff_id)
  RETURNING id INTO v_chalan_id;

  v_mfc_bill_id := public.get_or_create_daily_bill(v_mfc_stock_buyer_id, p_purchase_date, v_staff_id);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_purchase_items) LOOP
    v_item_weight := (v_item->>'weight')::numeric;
    v_item_rate := (v_item->>'rate')::numeric;

    v_item_product_id := NULL;
    IF v_item->>'product_id' IS NOT NULL THEN
      BEGIN
        v_item_product_id := (v_item->>'product_id')::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_item_product_id := NULL;
      END;
    END IF;

    INSERT INTO public.sale_transactions (daily_bill_id, chalan_id, product_id, product_description, weight_kg, price_per_kg, created_by, updated_by, sale_type)
    VALUES (v_mfc_bill_id, v_chalan_id, v_item_product_id, (v_item->>'product_description')::text, v_item_weight, v_item_rate, v_staff_id, v_staff_id, 'auction');

    INSERT INTO public.stock_batches (product_id, supplier_id, mfc_seller_id, initial_weight_kg, current_weight_kg, cost_per_kg, created_by, updated_by)
    VALUES (v_item_product_id, p_seller_id, p_mfc_seller_id_to_assign, v_item_weight, v_item_weight, v_item_rate, v_staff_id, v_staff_id);
  END LOOP;

  SELECT net_payable INTO v_net_payable FROM public.chalans WHERE id = v_chalan_id;

  INSERT INTO public.seller_payments (chalan_id, amount, payment_date, created_by, updated_by, payment_method)
  VALUES (v_chalan_id, v_net_payable, p_purchase_date, v_staff_id, v_staff_id, 'initial_payout');

  UPDATE public.chalans SET amount_paid = v_net_payable, status = 'paid'::public.payment_status WHERE id = v_chalan_id;

  RETURN v_chalan_id;
END;
$$;




CREATE FUNCTION public.purge_old_deletions() RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_deleted_count integer;
BEGIN
  DELETE FROM public.deleted_records
  WHERE synced_to_clients = true
    AND sync_completed_at < (timezone('Asia/Kolkata', now()) - interval '30 days');

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RAISE NOTICE 'Purged % old deletion records', v_deleted_count;

  RETURN v_deleted_count;
END;
$$;




CREATE FUNCTION public.register_fcm_token(p_device_token text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.fcm_device_tokens (user_auth_id, device_token)
  VALUES (auth.uid(), p_device_token)
  ON CONFLICT (device_token) DO UPDATE SET
    user_auth_id = auth.uid(),
    created_at = timezone('Asia/Kolkata', now());
END;
$$;




CREATE FUNCTION public.reject_registration(p_registration_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);
  DELETE FROM auth.users WHERE id = p_registration_id;
END;
$$;




CREATE FUNCTION public.set_stock_batch_code() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_today_prefix TEXT;
  v_next_id BIGINT;
BEGIN
  v_today_prefix := to_char(timezone('Asia/Kolkata', now()), 'DDMMYY');
  v_next_id := nextval('public.daily_batch_sequence');
  NEW.batch_code := v_today_prefix || '-' || v_next_id;
  RETURN NEW;
END;
$$;




CREATE FUNCTION public.submit_lump_sum_payment(p_customer_id uuid, p_total_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_staff_role TEXT;
  v_remaining_payment numeric := p_total_amount;
  v_unpaid_bill RECORD;
  v_amount_due_on_bill numeric;
  v_amount_to_apply numeric;
  v_payments_made jsonb[] := ARRAY[]::jsonb[];
  v_payment_result jsonb;
BEGIN
  -- Authorize staff: only admin and manager can submit lump sum payments.
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  FOR v_unpaid_bill IN
    SELECT id, total_amount, amount_paid
    FROM public.daily_bills
    WHERE customer_id = p_customer_id
      AND status IN ('due', 'partially_paid')
      AND is_migration_bill = false
    ORDER BY bill_date ASC, created_at ASC
  LOOP
    IF v_remaining_payment <= 0 THEN
      EXIT;
    END IF;

    v_amount_due_on_bill := v_unpaid_bill.total_amount - v_unpaid_bill.amount_paid;
    v_amount_to_apply := LEAST(v_remaining_payment, v_amount_due_on_bill);

    SELECT public.submit_specific_bill_payment(
      v_unpaid_bill.id,
      v_amount_to_apply,
      p_payment_method,
      p_payment_date
    ) INTO v_payment_result;

    IF (v_payment_result->>'success')::boolean = false THEN
      RAISE EXCEPTION 'Lump sum payment failed on bill %: %', v_unpaid_bill.id, (v_payment_result->>'error');
    END IF;

    v_remaining_payment := v_remaining_payment - v_amount_to_apply;
    v_payments_made := array_append(v_payments_made, v_payment_result);

  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total_applied', p_total_amount - v_remaining_payment,
    'unapplied_amount', v_remaining_payment,
    'payments_made', to_jsonb(v_payments_made)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;




CREATE FUNCTION public.submit_seller_payout(p_chalan_id uuid, p_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_new_payment_id uuid;
  v_staff_id uuid := auth.uid();
  v_staff_role TEXT;
  v_chalan record;
  v_new_amount_paid numeric;
  v_new_status public.payment_status;
BEGIN
  SELECT role::text INTO v_staff_role FROM public.mfc_staff WHERE id = v_staff_id;
  IF v_staff_role NOT IN ('admin', 'manager') THEN RAISE EXCEPTION 'Not authorized'; END IF;

  SELECT * INTO v_chalan FROM public.chalans WHERE id = p_chalan_id;
  IF v_chalan IS NULL THEN RAISE EXCEPTION 'Chalan not found'; END IF;

  INSERT INTO public.seller_payments (
    chalan_id, payment_date, amount, payment_method, created_by, updated_by
  )
  VALUES (p_chalan_id, p_payment_date, p_amount, p_payment_method, v_staff_id, v_staff_id)
  RETURNING id INTO v_new_payment_id;

  v_new_amount_paid := v_chalan.amount_paid + p_amount;

  IF v_new_amount_paid >= v_chalan.net_payable THEN v_new_status := 'paid'::public.payment_status;
  ELSE v_new_status := 'partially_paid'::public.payment_status;
  END IF;

  UPDATE public.chalans
  SET amount_paid = v_new_amount_paid, status = v_new_status
  WHERE id = p_chalan_id;

  RETURN v_new_payment_id;
END;
$$;




CREATE FUNCTION public.submit_specific_bill_payment(p_daily_bill_id uuid, p_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_staff_role TEXT;
  v_bill record;
  v_new_payment_id uuid;
  v_new_amount_paid numeric;
  v_new_status TEXT;
  v_amount_due numeric;
BEGIN
  -- Authorize staff: only admin and manager can submit payments.
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT * INTO v_bill
  FROM public.daily_bills
  WHERE id = p_daily_bill_id FOR UPDATE;

  IF v_bill IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Daily bill not found');
  END IF;

  v_amount_due := v_bill.total_amount - v_bill.amount_paid;
  IF p_amount > v_amount_due THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Payment of ' || p_amount || ' is greater than the amount due (' || v_amount_due || ')'
    );
  END IF;

  INSERT INTO public.customer_payments (
    daily_bill_id, payment_date, amount, payment_method, created_by, updated_by
  )
  VALUES (p_daily_bill_id, p_payment_date, p_amount, p_payment_method, v_staff_id, v_staff_id)
  RETURNING id INTO v_new_payment_id;

  v_new_amount_paid := v_bill.amount_paid + p_amount;

  IF v_new_amount_paid >= v_bill.total_amount THEN
    v_new_status := 'paid'::public.payment_status;
  ELSE
    v_new_status := 'partially_paid'::public.payment_status;
  END IF;

  UPDATE public.daily_bills
  SET amount_paid = v_new_amount_paid, status = v_new_status
  WHERE id = p_daily_bill_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_new_payment_id,
    'bill_id', p_daily_bill_id,
    'new_status', v_new_status
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;




CREATE FUNCTION public.sync_system_config_default_admin() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    DECLARE
      v_default_admin_id uuid;
    BEGIN
      SELECT id INTO v_default_admin_id
      FROM public.mfc_staff
      WHERE is_default_admin = true
      LIMIT 1;

      IF v_default_admin_id IS NOT NULL THEN
        UPDATE public.system_config
        SET default_admin_id = v_default_admin_id
        WHERE id = 1;
      END IF;

      RETURN NULL;
    END;
$$;




CREATE FUNCTION public.track_deletion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_deleted_by uuid;
  v_metadata jsonb;
  v_deletion_source TEXT;
  v_owner_auth_id uuid;
BEGIN
  v_deleted_by := auth.uid();

  IF v_deleted_by IS NULL THEN
    v_deletion_source := 'dashboard/system';
    v_deleted_by := public.get_auth_id_or_default();
  ELSE
    v_deletion_source := 'application';
  END IF;

  v_metadata := jsonb_build_object('table', TG_TABLE_NAME, 'id', OLD.id);

  CASE TG_TABLE_NAME
    WHEN 'mfc_staff' THEN
      v_metadata := v_metadata || jsonb_build_object('full_name', OLD.full_name, 'role', OLD.role);
      v_owner_auth_id := OLD.id;

    WHEN 'public_registrations' THEN
      v_metadata := v_metadata || jsonb_build_object('email', OLD.email, 'status', OLD.status);
      v_owner_auth_id := OLD.id;

    WHEN 'users' THEN
      v_metadata := v_metadata || jsonb_build_object(
        'name', OLD.name,
        'user_type', OLD.user_type,
        'phone', OLD.phone
      );
      v_owner_auth_id := OLD.auth_user_id;

    WHEN 'products' THEN
      v_metadata := v_metadata || jsonb_build_object('name', OLD.name);
      v_owner_auth_id := OLD.created_by;

    WHEN 'stock_batches' THEN
      v_metadata := v_metadata || jsonb_build_object(
        'batch_code', OLD.batch_code,
        'product_id', OLD.product_id
      );
      v_owner_auth_id := OLD.created_by;

    WHEN 'sale_transactions' THEN
      v_metadata := v_metadata || jsonb_build_object(
        'daily_bill_id', OLD.daily_bill_id,
        'chalan_id', OLD.chalan_id,
        'amount', OLD.amount
      );

      v_owner_auth_id := (SELECT u.auth_user_id FROM public.users u JOIN public.daily_bills db ON u.id = db.customer_id WHERE db.id = OLD.daily_bill_id);
      IF v_owner_auth_id IS NOT NULL THEN
        INSERT INTO public.deleted_records (table_name, record_id, record_owner_auth_id, deleted_by, record_metadata, deletion_source)
        VALUES (TG_TABLE_NAME, OLD.id, v_owner_auth_id, v_deleted_by, v_metadata, v_deletion_source) ON CONFLICT (table_name, record_id, record_owner_auth_id) DO NOTHING;
      END IF;

      v_owner_auth_id := (SELECT COALESCE(c.mfc_seller_id, u.auth_user_id) FROM public.chalans c LEFT JOIN public.users u ON c.seller_id = u.id WHERE c.id = OLD.chalan_id);
      IF v_owner_auth_id IS NOT NULL THEN
        INSERT INTO public.deleted_records (table_name, record_id, record_owner_auth_id, deleted_by, record_metadata, deletion_source)
        VALUES (TG_TABLE_NAME, OLD.id, v_owner_auth_id, v_deleted_by, v_metadata, v_deletion_source) ON CONFLICT (table_name, record_id, record_owner_auth_id) DO NOTHING;
      END IF;

      RETURN OLD;

    WHEN 'chalans' THEN
      v_metadata := v_metadata || jsonb_build_object('chalan_number', OLD.chalan_number, 'seller_id', OLD.seller_id, 'mfc_seller_id', OLD.mfc_seller_id);
      v_owner_auth_id := COALESCE(OLD.mfc_seller_id, (SELECT auth_user_id FROM users WHERE id = OLD.seller_id));

    WHEN 'daily_bills' THEN
      v_metadata := v_metadata || jsonb_build_object('bill_number', OLD.bill_number, 'customer_id', OLD.customer_id);
      v_owner_auth_id := (SELECT auth_user_id FROM users WHERE id = OLD.customer_id);

    WHEN 'customer_payments' THEN
      v_metadata := v_metadata || jsonb_build_object('daily_bill_id', OLD.daily_bill_id, 'amount', OLD.amount);
      v_owner_auth_id := (SELECT u.auth_user_id FROM public.users u JOIN public.daily_bills db ON u.id = db.customer_id WHERE db.id = OLD.daily_bill_id);

    WHEN 'seller_payments' THEN
      v_metadata := v_metadata || jsonb_build_object('chalan_id', OLD.chalan_id, 'amount', OLD.amount);
      v_owner_auth_id := (SELECT COALESCE(c.mfc_seller_id, u.auth_user_id) FROM public.chalans c LEFT JOIN public.users u ON c.seller_id = u.id WHERE c.id = OLD.chalan_id);

    WHEN 'quotes' THEN
      v_metadata := v_metadata || jsonb_build_object('quote_number', OLD.quote_number, 'customer_id', OLD.customer_id);
      v_owner_auth_id := (SELECT auth_user_id FROM users WHERE id = OLD.customer_id);

    WHEN 'quote_items' THEN
      v_metadata := v_metadata || jsonb_build_object('quote_id', OLD.quote_id, 'line_total', OLD.line_total);

      v_owner_auth_id := (SELECT u.auth_user_id FROM public.users u JOIN public.quotes q ON u.id = q.customer_id WHERE q.id = OLD.quote_id);
      IF v_owner_auth_id IS NOT NULL THEN
        INSERT INTO public.deleted_records (table_name, record_id, record_owner_auth_id, deleted_by, record_metadata, deletion_source)
        VALUES (TG_TABLE_NAME, OLD.id, v_owner_auth_id, v_deleted_by, v_metadata, v_deletion_source) ON CONFLICT (table_name, record_id, record_owner_auth_id) DO NOTHING;
      END IF;

      v_owner_auth_id := (SELECT q.assigned_mfc_seller_id FROM public.quotes q WHERE q.id = OLD.quote_id);
      IF v_owner_auth_id IS NOT NULL THEN
        INSERT INTO public.deleted_records (table_name, record_id, record_owner_auth_id, deleted_by, record_metadata, deletion_source)
        VALUES (TG_TABLE_NAME, OLD.id, v_owner_auth_id, v_deleted_by, v_metadata, v_deletion_source) ON CONFLICT (table_name, record_id, record_owner_auth_id) DO NOTHING;
      END IF;

      RETURN OLD;

  END CASE;

  INSERT INTO public.deleted_records (table_name, record_id, record_owner_auth_id, deleted_by, record_metadata, deletion_source)
  VALUES (TG_TABLE_NAME, OLD.id, v_owner_auth_id, v_deleted_by, v_metadata, v_deletion_source)
  ON CONFLICT (table_name, record_id, record_owner_auth_id) DO UPDATE
  SET
    deleted_at = timezone('Asia/Kolkata'::text, now()),
    deleted_by = v_deleted_by,
    record_metadata = v_metadata,
    deletion_source = v_deletion_source,
    synced_to_clients = false;

  RETURN OLD;
END;
$$;




CREATE FUNCTION public.trigger_recalculate_financials_from_sale() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_bill_id uuid;
  v_chalan_id uuid;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_bill_id := OLD.daily_bill_id;
    v_chalan_id := OLD.chalan_id;
  ELSE
    v_bill_id := NEW.daily_bill_id;
    v_chalan_id := NEW.chalan_id;
  END IF;

  IF v_bill_id IS NOT NULL THEN
    UPDATE public.daily_bills
    SET total_amount = (SELECT COALESCE(SUM(amount), 0) FROM public.sale_transactions WHERE daily_bill_id = v_bill_id)
    WHERE id = v_bill_id;
  END IF;

  IF v_chalan_id IS NOT NULL THEN
    UPDATE public.chalans
    SET total_sale_value = (SELECT COALESCE(SUM(amount), 0) FROM public.sale_transactions WHERE chalan_id = v_chalan_id)
    WHERE id = v_chalan_id;
  END IF;

  RETURN NULL;
END;
$$;




CREATE FUNCTION public.trigger_set_chalan_calculations() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_raw_commission numeric;
  v_integer_commission numeric;
  v_initial_net_amount numeric;
BEGIN
  IF (TG_OP = 'INSERT' OR NEW.total_sale_value != OLD.total_sale_value OR NEW.commission_rate_percent != OLD.commission_rate_percent) THEN
    v_raw_commission := (NEW.total_sale_value * NEW.commission_rate_percent) / 100.0;
    v_integer_commission := trunc(v_raw_commission);
    v_initial_net_amount := NEW.total_sale_value - v_integer_commission;

    NEW.net_payable := floor(v_initial_net_amount / 5) * 5;
    NEW.commission_amount := NEW.total_sale_value - NEW.net_payable;
  END IF;
  RETURN NEW;
END;
$$;




CREATE FUNCTION public.trigger_set_sale_transaction_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.amount = NEW.weight_kg * NEW.price_per_kg;
  RETURN NEW;
END;
$$;




CREATE FUNCTION public.update_customer_balance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_user_id uuid;
  v_total_billed numeric;
  v_total_paid numeric;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF (TG_TABLE_NAME = 'daily_bills') THEN v_user_id := OLD.customer_id;
    ELSEIF (TG_TABLE_NAME = 'customer_payments') THEN v_user_id := (SELECT customer_id FROM daily_bills WHERE id = OLD.daily_bill_id);
    END IF;
  ELSE
    IF (TG_TABLE_NAME = 'daily_bills') THEN v_user_id := NEW.customer_id;
    ELSEIF (TG_TABLE_NAME = 'customer_payments') THEN v_user_id := (SELECT customer_id FROM daily_bills WHERE id = NEW.daily_bill_id);
    END IF;
  END IF;

  IF v_user_id IS NULL THEN RETURN NULL; END IF;

  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_billed
  FROM public.daily_bills WHERE customer_id = v_user_id;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.customer_payments p
  JOIN public.daily_bills db ON p.daily_bill_id = db.id
  WHERE db.customer_id = v_user_id;

  INSERT INTO public.customer_balance (user_id, total_billed, total_paid, current_due, updated_at)
  VALUES (v_user_id, v_total_billed, v_total_paid, v_total_billed - v_total_paid, timezone('Asia/Kolkata', now()))
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_billed = v_total_billed,
    total_paid = v_total_paid,
    current_due = v_total_billed - v_total_paid,
    updated_at = timezone('Asia/Kolkata', now());
  RETURN NULL;
END;
$$;




CREATE FUNCTION public.update_seller_balance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_user_id uuid;
  v_total_earned numeric;
  v_total_paid_out numeric;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF (TG_TABLE_NAME = 'chalans') THEN v_user_id := OLD.seller_id;
    ELSEIF (TG_TABLE_NAME = 'seller_payments') THEN v_user_id := (SELECT seller_id FROM chalans WHERE id = OLD.chalan_id);
    END IF;
  ELSE
    IF (TG_TABLE_NAME = 'chalans') THEN v_user_id := NEW.seller_id;
    ELSEIF (TG_TABLE_NAME = 'seller_payments') THEN v_user_id := (SELECT seller_id FROM chalans WHERE id = NEW.chalan_id);
    END IF;
  END IF;

  IF v_user_id IS NULL THEN RETURN NULL; END IF;

  SELECT COALESCE(SUM(net_payable), 0) INTO v_total_earned
  FROM public.chalans WHERE seller_id = v_user_id;

  SELECT COALESCE(SUM(p.amount), 0) INTO v_total_paid_out
  FROM public.seller_payments p
  JOIN public.chalans c ON p.chalan_id = c.id
  WHERE c.seller_id = v_user_id;

  INSERT INTO public.seller_balance (user_id, total_earned, total_paid_out, current_due, updated_at)
      VALUES (v_user_id, v_total_earned, v_total_paid_out, v_total_earned - v_total_paid_out, timezone('Asia/Kolkata', now()))  ON CONFLICT (user_id)
  DO UPDATE SET
    total_earned = v_total_earned,
    total_paid_out = v_total_paid_out,
    current_due = v_total_earned - v_total_paid_out,
    updated_at = timezone('Asia/Kolkata', now());
  RETURN NULL;
END;
$$;



SET default_tablespace = '';

SET default_table_access_method = heap;


CREATE TABLE public.chalans (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    chalan_number text NOT NULL,
    seller_id uuid,
    mfc_seller_id uuid,
    chalan_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date NOT NULL,
    total_sale_value numeric DEFAULT 0 NOT NULL,
    commission_rate_percent numeric DEFAULT 0 NOT NULL,
    commission_amount numeric DEFAULT 0 NOT NULL,
    net_payable numeric DEFAULT 0 NOT NULL,
    amount_paid numeric DEFAULT 0 NOT NULL,
    status public.payment_status DEFAULT 'due'::public.payment_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT chalan_seller_type_check CHECK ((((seller_id IS NOT NULL) AND (mfc_seller_id IS NULL)) OR ((seller_id IS NULL) AND (mfc_seller_id IS NOT NULL))))
);

ALTER TABLE ONLY public.chalans FORCE ROW LEVEL SECURITY;




CREATE TABLE public.daily_bills (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    bill_number text NOT NULL,
    customer_id uuid NOT NULL,
    bill_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date NOT NULL,
    total_amount numeric DEFAULT 0 NOT NULL,
    amount_paid numeric DEFAULT 0 NOT NULL,
    status public.payment_status DEFAULT 'due'::public.payment_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    is_migration_bill boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY public.daily_bills FORCE ROW LEVEL SECURITY;




CREATE TABLE public.mfc_staff (
    id uuid NOT NULL,
    full_name text NOT NULL,
    role public.staff_type NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_default_admin boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid
);

ALTER TABLE ONLY public.mfc_staff FORCE ROW LEVEL SECURITY;




CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    is_stock_tracked boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid
);

ALTER TABLE ONLY public.products FORCE ROW LEVEL SECURITY;




CREATE TABLE public.sale_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    daily_bill_id uuid NOT NULL,
    stock_batch_id uuid,
    chalan_id uuid NOT NULL,
    product_id uuid,
    product_description text,
    weight_kg numeric NOT NULL,
    price_per_kg numeric NOT NULL,
    amount numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    sale_type public.sale_type NOT NULL
);

ALTER TABLE ONLY public.sale_transactions FORCE ROW LEVEL SECURITY;




CREATE VIEW public.buyer_sales_view AS
 SELECT si.id AS sale_item_id,
    db.id AS bill_id,
    db.bill_number,
    db.bill_date,
    db.customer_id,
    COALESCE(p.description, si.product_description) AS product_name,
    si.weight_kg,
    si.price_per_kg,
    si.amount,
        CASE
            WHEN (c.mfc_seller_id IS NOT NULL) THEN 'Sold by MFC'::text
            ELSE 'Sold via Auction'::text
        END AS sale_source,
    si.created_at,
    s.full_name AS created_by_name,
    GREATEST(si.updated_at, db.updated_at, COALESCE(p.updated_at, si.updated_at)) AS last_updated_at
   FROM ((((public.sale_transactions si
     JOIN public.daily_bills db ON ((si.daily_bill_id = db.id)))
     JOIN public.chalans c ON ((si.chalan_id = c.id)))
     LEFT JOIN public.products p ON ((si.product_id = p.id)))
     LEFT JOIN public.mfc_staff s ON ((si.created_by = s.id)));




CREATE SEQUENCE public.chalan_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




CREATE TABLE public.customer_balance (
    user_id uuid NOT NULL,
    total_billed numeric DEFAULT 0 NOT NULL,
    total_paid numeric DEFAULT 0 NOT NULL,
    current_due numeric DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.customer_balance FORCE ROW LEVEL SECURITY;




CREATE TABLE public.customer_payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    daily_bill_id uuid NOT NULL,
    payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date NOT NULL,
    amount numeric NOT NULL,
    payment_method public.payment_method_enum DEFAULT 'cash'::public.payment_method_enum NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid
);

ALTER TABLE ONLY public.customer_payments FORCE ROW LEVEL SECURITY;




CREATE SEQUENCE public.daily_batch_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




CREATE TABLE public.daily_bill_counters (
    bill_date date NOT NULL,
    last_bill_number integer DEFAULT 0 NOT NULL
);




CREATE TABLE public.seller_balance (
    user_id uuid NOT NULL,
    total_earned numeric DEFAULT 0 NOT NULL,
    total_paid_out numeric DEFAULT 0 NOT NULL,
    current_due numeric DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.seller_balance FORCE ROW LEVEL SECURITY;




CREATE TABLE public.stock_batches (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    product_id uuid NOT NULL,
    batch_code text,
    supplier_id uuid,
    initial_weight_kg numeric NOT NULL,
    current_weight_kg numeric NOT NULL,
    cost_per_kg numeric,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    mfc_seller_id uuid,
    CONSTRAINT stock_batches_initial_weight_kg_check CHECK ((initial_weight_kg > (0)::numeric))
);

ALTER TABLE ONLY public.stock_batches FORCE ROW LEVEL SECURITY;




CREATE TABLE public.users (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    auth_user_id uuid,
    name text NOT NULL,
    business_name text,
    phone text,
    user_type public.user_type DEFAULT 'vendor'::public.user_type NOT NULL,
    default_role public.default_role DEFAULT 'buyer'::public.default_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    address jsonb,
    profile_photo_url text,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid
);

ALTER TABLE ONLY public.users FORCE ROW LEVEL SECURITY;




CREATE MATERIALIZED VIEW public.dashboard_stats_for_admin AS
 SELECT ( SELECT count(*) AS count
           FROM public.users
          WHERE (users.is_active = true)) AS active_users,
    ( SELECT count(*) AS count
           FROM public.users
          WHERE (users.user_type = 'vendor'::public.user_type)) AS vendor_count,
    ( SELECT count(*) AS count
           FROM public.users
          WHERE (users.user_type = 'business'::public.user_type)) AS business_count,
    ( SELECT count(*) AS count
           FROM public.daily_bills
          WHERE (daily_bills.bill_date = CURRENT_DATE)) AS bills_today,
    ( SELECT COALESCE(sum(daily_bills.total_amount), (0)::numeric) AS "coalesce"
           FROM public.daily_bills
          WHERE (daily_bills.bill_date = CURRENT_DATE)) AS total_sales_today,
    ( SELECT COALESCE(sum(chalans.commission_amount), (0)::numeric) AS "coalesce"
           FROM public.chalans
          WHERE (chalans.chalan_date = CURRENT_DATE)) AS total_commission_gained_today,
    ( SELECT COALESCE(sum(customer_payments.amount), (0)::numeric) AS "coalesce"
           FROM public.customer_payments
          WHERE (customer_payments.payment_date = CURRENT_DATE)) AS total_collection_today,
    ( SELECT count(*) AS count
           FROM public.chalans
          WHERE (chalans.chalan_date = CURRENT_DATE)) AS chalans_today,
    ( SELECT COALESCE(sum(customer_balance.current_due), (0)::numeric) AS "coalesce"
           FROM public.customer_balance
          WHERE (customer_balance.current_due > (0)::numeric)) AS total_customer_due,
    ( SELECT COALESCE(sum(seller_balance.current_due), (0)::numeric) AS "coalesce"
           FROM public.seller_balance
          WHERE (seller_balance.current_due > (0)::numeric)) AS total_seller_due,
    ( SELECT count(*) AS count
           FROM public.stock_batches
          WHERE (stock_batches.current_weight_kg > (0)::numeric)) AS active_batches,
    ( SELECT COALESCE(sum(stock_batches.current_weight_kg), (0)::numeric) AS "coalesce"
           FROM public.stock_batches) AS total_stock_kg,
    timezone('Asia/Kolkata'::text, now()) AS last_updated
  WITH NO DATA;




CREATE TABLE public.deleted_records (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    table_name text NOT NULL,
    record_id uuid NOT NULL,
    record_owner_auth_id uuid,
    deleted_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    deleted_by uuid,
    deletion_source text DEFAULT 'application'::text NOT NULL,
    deletion_reason text,
    record_metadata jsonb,
    synced_to_clients boolean DEFAULT false NOT NULL,
    sync_completed_at timestamp with time zone
);

ALTER TABLE ONLY public.deleted_records FORCE ROW LEVEL SECURITY;




CREATE TABLE public.fcm_device_tokens (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_auth_id uuid NOT NULL,
    device_token text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.fcm_device_tokens FORCE ROW LEVEL SECURITY;




CREATE SEQUENCE public.mfc_batch_bill_seq
    START WITH 1001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




CREATE SEQUENCE public.mfc_floor_sale_seq
    START WITH 1001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




CREATE VIEW public.mfc_seller_sales_view AS
 SELECT si.id AS sale_item_id,
    c.id AS chalan_id,
    c.chalan_number,
    c.chalan_date,
    c.mfc_seller_id,
    db.customer_id,
    u.name AS customer_name,
    p.description AS product_name,
    si.weight_kg,
    si.price_per_kg,
    si.amount,
    si.created_at,
    s.full_name AS created_by_name,
    GREATEST(si.updated_at, c.updated_at, COALESCE(p.updated_at, si.updated_at), db.updated_at) AS last_updated_at
   FROM (((((public.sale_transactions si
     JOIN public.chalans c ON ((si.chalan_id = c.id)))
     JOIN public.daily_bills db ON ((si.daily_bill_id = db.id)))
     JOIN public.users u ON ((db.customer_id = u.id)))
     LEFT JOIN public.products p ON ((si.product_id = p.id)))
     LEFT JOIN public.mfc_staff s ON ((si.created_by = s.id)))
  WHERE (c.mfc_seller_id IS NOT NULL);




CREATE SEQUENCE public.mfc_single_bill_seq
    START WITH 1001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




CREATE TABLE public.public_registrations (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    business_name text,
    phone text,
    message text,
    status public.registration_status DEFAULT 'pending'::public.registration_status NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_by uuid
);

ALTER TABLE ONLY public.public_registrations FORCE ROW LEVEL SECURITY;




CREATE TABLE public.quote_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    quote_id uuid NOT NULL,
    product_id uuid,
    product_description text,
    weight_kg numeric NOT NULL,
    price_per_kg numeric NOT NULL,
    line_total numeric NOT NULL
);

ALTER TABLE ONLY public.quote_items FORCE ROW LEVEL SECURITY;




CREATE TABLE public.quotes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    quote_number text NOT NULL,
    customer_id uuid NOT NULL,
    assigned_mfc_seller_id uuid,
    delivery_date date NOT NULL,
    total_amount numeric DEFAULT 0 NOT NULL,
    advance_paid numeric DEFAULT 0 NOT NULL,
    status public.quote_status DEFAULT 'pending'::public.quote_status NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid
);

ALTER TABLE ONLY public.quotes FORCE ROW LEVEL SECURITY;




CREATE TABLE public.seller_payments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    chalan_id uuid NOT NULL,
    payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date NOT NULL,
    amount numeric NOT NULL,
    payment_method public.payment_method_enum DEFAULT 'bank_transfer'::public.payment_method_enum NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid
);

ALTER TABLE ONLY public.seller_payments FORCE ROW LEVEL SECURITY;




CREATE VIEW public.seller_sales_view AS
 SELECT si.id AS sale_item_id,
    c.id AS chalan_id,
    c.chalan_number,
    c.chalan_date,
    c.seller_id,
    COALESCE(p.description, si.product_description) AS product_name,
    si.weight_kg,
    si.price_per_kg,
    si.amount,
    si.created_at,
    s.full_name AS created_by_name,
    GREATEST(si.updated_at, c.updated_at, COALESCE(p.updated_at, si.updated_at)) AS last_updated_at
   FROM (((public.sale_transactions si
     JOIN public.chalans c ON ((si.chalan_id = c.id)))
     LEFT JOIN public.products p ON ((si.product_id = p.id)))
     LEFT JOIN public.mfc_staff s ON ((si.created_by = s.id)))
  WHERE (c.seller_id IS NOT NULL);




CREATE TABLE public.system_config (
    id integer DEFAULT 1 NOT NULL,
    default_admin_id uuid NOT NULL,
    mfc_stock_buyer_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    CONSTRAINT system_config_id_check CHECK ((id = 1))
);

ALTER TABLE ONLY public.system_config FORCE ROW LEVEL SECURITY;




ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_chalan_number_key UNIQUE (chalan_number);



ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.customer_balance
    ADD CONSTRAINT customer_balance_pkey PRIMARY KEY (user_id);



ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.daily_bill_counters
    ADD CONSTRAINT daily_bill_counters_pkey PRIMARY KEY (bill_date);



ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_bill_number_key UNIQUE (bill_number);



ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.deleted_records
    ADD CONSTRAINT deleted_records_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.deleted_records
    ADD CONSTRAINT deleted_records_table_record_owner_unique UNIQUE (table_name, record_id, record_owner_auth_id);



ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_device_token_key UNIQUE (device_token);



ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.mfc_staff
    ADD CONSTRAINT mfc_staff_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);



ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.public_registrations
    ADD CONSTRAINT public_registrations_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_quote_number_key UNIQUE (quote_number);



ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.seller_balance
    ADD CONSTRAINT seller_balance_pkey PRIMARY KEY (user_id);



ALTER TABLE ONLY public.seller_payments
    ADD CONSTRAINT seller_payments_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_batch_code_key UNIQUE (batch_code);



ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_default_admin_id_key UNIQUE (default_admin_id);



ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);



ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);



ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);



CREATE INDEX idx_chalans_chalan_date ON public.chalans USING btree (chalan_date);



CREATE INDEX idx_chalans_mfc_seller_id ON public.chalans USING btree (mfc_seller_id);



CREATE INDEX idx_chalans_seller_date ON public.chalans USING btree (seller_id, chalan_date DESC);



CREATE INDEX idx_chalans_status ON public.chalans USING btree (status);



CREATE INDEX idx_chalans_unpaid ON public.chalans USING btree (seller_id, chalan_date DESC) WHERE (status = ANY (ARRAY['due'::public.payment_status, 'partially_paid'::public.payment_status]));



CREATE INDEX idx_chalans_updated_at ON public.chalans USING btree (updated_at);



CREATE INDEX idx_customer_balance_current_due ON public.customer_balance USING btree (current_due);



CREATE INDEX idx_customer_payments_bill ON public.customer_payments USING btree (daily_bill_id, payment_date DESC);



CREATE INDEX idx_customer_payments_daily_bill_id ON public.customer_payments USING btree (daily_bill_id);



CREATE INDEX idx_customer_payments_payment_date ON public.customer_payments USING btree (payment_date);



CREATE INDEX idx_customer_payments_updated_at ON public.customer_payments USING btree (updated_at);



CREATE INDEX idx_daily_bills_bill_date ON public.daily_bills USING btree (bill_date);



CREATE INDEX idx_daily_bills_customer_date ON public.daily_bills USING btree (customer_id, bill_date DESC);



CREATE INDEX idx_daily_bills_status ON public.daily_bills USING btree (status);



CREATE INDEX idx_daily_bills_unpaid ON public.daily_bills USING btree (customer_id, bill_date DESC) WHERE (status = ANY (ARRAY['due'::public.payment_status, 'partially_paid'::public.payment_status]));



CREATE INDEX idx_daily_bills_updated_at ON public.daily_bills USING btree (updated_at);



CREATE UNIQUE INDEX idx_dashboard_stats_singleton ON public.dashboard_stats_for_admin USING btree ((1));



CREATE INDEX idx_deleted_records_deleted_at ON public.deleted_records USING btree (deleted_at);



CREATE INDEX idx_deleted_records_owner_id ON public.deleted_records USING btree (record_owner_auth_id);



CREATE INDEX idx_deleted_records_synced ON public.deleted_records USING btree (synced_to_clients, deleted_at);



CREATE INDEX idx_deleted_records_table_name ON public.deleted_records USING btree (table_name);



CREATE INDEX idx_deleted_records_table_record ON public.deleted_records USING btree (table_name, record_id);



CREATE INDEX idx_fcm_device_tokens_user_auth_id ON public.fcm_device_tokens USING btree (user_auth_id);



CREATE INDEX idx_mfc_staff_active ON public.mfc_staff USING btree (full_name) WHERE (is_active = true);



CREATE INDEX idx_mfc_staff_is_active ON public.mfc_staff USING btree (is_active);



CREATE INDEX idx_mfc_staff_role ON public.mfc_staff USING btree (role);



CREATE INDEX idx_mfc_staff_updated_at ON public.mfc_staff USING btree (updated_at);



CREATE INDEX idx_products_created_by ON public.products USING btree (created_by);



CREATE INDEX idx_products_updated_at ON public.products USING btree (updated_at);



CREATE INDEX idx_public_registrations_status_created_at ON public.public_registrations USING btree (status, created_at);



CREATE INDEX idx_quote_items_product_id ON public.quote_items USING btree (product_id);



CREATE INDEX idx_quote_items_quote_id ON public.quote_items USING btree (quote_id);



CREATE INDEX idx_quotes_active ON public.quotes USING btree (customer_id, delivery_date) WHERE (status = ANY (ARRAY['pending'::public.quote_status, 'confirmed'::public.quote_status]));



CREATE INDEX idx_quotes_assigned_mfc_seller_id ON public.quotes USING btree (assigned_mfc_seller_id);



CREATE INDEX idx_quotes_customer ON public.quotes USING btree (customer_id, delivery_date DESC);



CREATE INDEX idx_quotes_delivery_date ON public.quotes USING btree (delivery_date);



CREATE INDEX idx_quotes_status ON public.quotes USING btree (status);



CREATE INDEX idx_quotes_updated_at ON public.quotes USING btree (updated_at);



CREATE INDEX idx_sale_transactions_bill ON public.sale_transactions USING btree (daily_bill_id, updated_at);



CREATE INDEX idx_sale_transactions_chalan ON public.sale_transactions USING btree (chalan_id, updated_at);



CREATE INDEX idx_sale_transactions_created_at ON public.sale_transactions USING btree (created_at);



CREATE INDEX idx_sale_transactions_stock_batch_id ON public.sale_transactions USING btree (stock_batch_id);



CREATE INDEX idx_sale_transactions_updated_at ON public.sale_transactions USING btree (updated_at);



CREATE INDEX idx_seller_balance_current_due ON public.seller_balance USING btree (current_due);



CREATE INDEX idx_seller_payments_chalan ON public.seller_payments USING btree (chalan_id, payment_date DESC);



CREATE INDEX idx_seller_payments_chalan_id ON public.seller_payments USING btree (chalan_id);



CREATE INDEX idx_seller_payments_payment_date ON public.seller_payments USING btree (payment_date);



CREATE INDEX idx_seller_payments_updated_at ON public.seller_payments USING btree (updated_at);



CREATE INDEX idx_stock_batches_available ON public.stock_batches USING btree (product_id, current_weight_kg DESC) WHERE (current_weight_kg > (0)::numeric);



CREATE INDEX idx_stock_batches_current_weight ON public.stock_batches USING btree (current_weight_kg);



CREATE INDEX idx_stock_batches_mfc_seller ON public.stock_batches USING btree (mfc_seller_id);



CREATE INDEX idx_stock_batches_product ON public.stock_batches USING btree (product_id, current_weight_kg);



CREATE INDEX idx_stock_batches_updated_at ON public.stock_batches USING btree (updated_at);



CREATE INDEX idx_users_active ON public.users USING btree (name) WHERE (is_active = true);



CREATE INDEX idx_users_name ON public.users USING btree (name);



CREATE INDEX idx_users_phone ON public.users USING btree (phone);



CREATE INDEX idx_users_updated_at ON public.users USING btree (updated_at);



CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);



CREATE UNIQUE INDEX mfc_staff_one_default_admin_only ON public.mfc_staff USING btree (is_default_admin) WHERE (is_default_admin = true);



CREATE TRIGGER enforce_last_admin_exists BEFORE DELETE OR UPDATE ON public.mfc_staff FOR EACH ROW EXECUTE FUNCTION public.prevent_last_default_admin_removal();



CREATE TRIGGER handle_batch_update BEFORE UPDATE ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_bill_update BEFORE UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_chalan_update BEFORE UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_customer_payment_update BEFORE UPDATE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_product_update BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_quote_update BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_registration_update BEFORE UPDATE ON public.public_registrations FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_sale_transaction_update BEFORE UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_seller_payment_update BEFORE UPDATE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_staff_update BEFORE UPDATE ON public.mfc_staff FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER handle_user_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();



CREATE TRIGGER initialize_balance_for_new_user AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.initialize_user_balance();



CREATE TRIGGER on_bill_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_chalan_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_customer_payment_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_delete_notify_user AFTER INSERT ON public.deleted_records FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_quote_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_quote_item_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_sale_tx_change_notify_users AFTER INSERT OR DELETE OR UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_seller_payment_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_stock_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER on_user_change_notify_user AFTER INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();



CREATE TRIGGER set_batch_code_trigger BEFORE INSERT ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.set_stock_batch_code();



CREATE TRIGGER track_chalan_deletion BEFORE DELETE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_customer_payment_deletion BEFORE DELETE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_daily_bill_deletion BEFORE DELETE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_product_deletion BEFORE DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_quote_deletion BEFORE DELETE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_quote_item_deletion BEFORE DELETE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_registration_deletion BEFORE DELETE ON public.public_registrations FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_sale_transaction_deletion BEFORE DELETE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_seller_payment_deletion BEFORE DELETE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_staff_deletion BEFORE DELETE ON public.mfc_staff FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_stock_batch_deletion BEFORE DELETE ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER track_user_deletion BEFORE DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.track_deletion();



CREATE TRIGGER trigger_recalc_parents AFTER INSERT OR DELETE OR UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_financials_from_sale();



CREATE TRIGGER trigger_set_chalan_calcs BEFORE INSERT OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.trigger_set_chalan_calculations();



CREATE TRIGGER trigger_set_sale_amount BEFORE INSERT OR UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_sale_transaction_amount();



CREATE TRIGGER trigger_sync_default_admin_on_staff_change AFTER INSERT OR UPDATE OF is_default_admin ON public.mfc_staff FOR EACH STATEMENT EXECUTE FUNCTION public.sync_system_config_default_admin();



CREATE TRIGGER trigger_update_customer_balance_bill AFTER INSERT OR DELETE OR UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.update_customer_balance();



CREATE TRIGGER trigger_update_customer_balance_payment AFTER INSERT OR DELETE OR UPDATE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.update_customer_balance();



CREATE TRIGGER trigger_update_seller_balance_chalan AFTER INSERT OR DELETE OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.update_seller_balance();



CREATE TRIGGER trigger_update_seller_balance_payment AFTER INSERT OR DELETE OR UPDATE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.update_seller_balance();



ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_mfc_seller_id_fkey FOREIGN KEY (mfc_seller_id) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);



ALTER TABLE ONLY public.customer_balance
    ADD CONSTRAINT customer_balance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_daily_bill_id_fkey FOREIGN KEY (daily_bill_id) REFERENCES public.daily_bills(id);



ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);



ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT fk_chalans_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT fk_customer_payments_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT fk_daily_bills_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT fk_default_admin FOREIGN KEY (default_admin_id) REFERENCES public.mfc_staff(id) ON DELETE RESTRICT;



ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT fk_mfc_stock_buyer FOREIGN KEY (mfc_stock_buyer_id) REFERENCES public.users(id);



ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quotes_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT fk_sale_transactions_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.seller_payments
    ADD CONSTRAINT fk_seller_payments_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT fk_stock_batches_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT fk_stock_batches_mfc_seller FOREIGN KEY (mfc_seller_id) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.mfc_staff
    ADD CONSTRAINT mfc_staff_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;



ALTER TABLE ONLY public.public_registrations
    ADD CONSTRAINT public_registrations_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.public_registrations
    ADD CONSTRAINT public_registrations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);



ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_assigned_mfc_seller_id_fkey FOREIGN KEY (assigned_mfc_seller_id) REFERENCES public.mfc_staff(id);



ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);



ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_chalan_id_fkey FOREIGN KEY (chalan_id) REFERENCES public.chalans(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_daily_bill_id_fkey FOREIGN KEY (daily_bill_id) REFERENCES public.daily_bills(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);



ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_stock_batch_id_fkey FOREIGN KEY (stock_batch_id) REFERENCES public.stock_batches(id);



ALTER TABLE ONLY public.seller_balance
    ADD CONSTRAINT seller_balance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;



ALTER TABLE ONLY public.seller_payments
    ADD CONSTRAINT seller_payments_chalan_id_fkey FOREIGN KEY (chalan_id) REFERENCES public.chalans(id);



ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);



ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.users(id);



ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;



CREATE POLICY "Admin full access on chalans" ON public.chalans USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on customer_balance" ON public.customer_balance USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on customer_payments" ON public.customer_payments USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on daily_bill_counters" ON public.daily_bill_counters USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on daily_bills" ON public.daily_bills USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on deleted_records" ON public.deleted_records USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on fcm_device_tokens" ON public.fcm_device_tokens USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on mfc_staff" ON public.mfc_staff USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on products" ON public.products USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on public_registrations" ON public.public_registrations USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on quote_items" ON public.quote_items USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on quotes" ON public.quotes USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on sale_transactions" ON public.sale_transactions USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on seller_balance" ON public.seller_balance USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on seller_payments" ON public.seller_payments USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on stock_batches" ON public.stock_batches USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on system_config" ON public.system_config USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Admin full access on users" ON public.users USING ((public.get_my_staff_role() = 'admin'::text));



CREATE POLICY "Anyone can insert registration" ON public.public_registrations FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated read access on mfc_staff" ON public.mfc_staff FOR SELECT TO authenticated USING (true);



CREATE POLICY "Authenticated read access on products" ON public.products FOR SELECT TO authenticated USING (true);



CREATE POLICY "Authenticated read access on system_config" ON public.system_config FOR SELECT TO authenticated USING (true);



CREATE POLICY "MFC Seller read assigned quotes" ON public.quotes FOR SELECT USING ((assigned_mfc_seller_id = auth.uid()));



CREATE POLICY "MFC Seller read own chalans" ON public.chalans FOR SELECT USING ((mfc_seller_id = auth.uid()));



CREATE POLICY "MFC Seller read own sale transactions" ON public.sale_transactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chalans c
  WHERE ((c.id = sale_transactions.chalan_id) AND (c.mfc_seller_id = auth.uid())))));



CREATE POLICY "MFC Seller read own stock batches" ON public.stock_batches FOR SELECT USING ((mfc_seller_id = auth.uid()));



CREATE POLICY "MFC Seller read quote items" ON public.quote_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_items.quote_id) AND (q.assigned_mfc_seller_id = auth.uid())))));



CREATE POLICY "Manager insert access on chalans" ON public.chalans FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on customer_balance" ON public.customer_balance FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on customer_payments" ON public.customer_payments FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on daily_bill_counters" ON public.daily_bill_counters FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on daily_bills" ON public.daily_bills FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on deleted_records" ON public.deleted_records FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on fcm_device_tokens" ON public.fcm_device_tokens FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on products" ON public.products FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on public_registrations" ON public.public_registrations FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on quote_items" ON public.quote_items FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on quotes" ON public.quotes FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on sale_transactions" ON public.sale_transactions FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on seller_balance" ON public.seller_balance FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on seller_payments" ON public.seller_payments FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on stock_batches" ON public.stock_batches FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on system_config" ON public.system_config FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager insert access on users" ON public.users FOR INSERT WITH CHECK ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on chalans" ON public.chalans FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on customer_balance" ON public.customer_balance FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on customer_payments" ON public.customer_payments FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on daily_bill_counters" ON public.daily_bill_counters FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on daily_bills" ON public.daily_bills FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on deleted_records" ON public.deleted_records FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on fcm_device_tokens" ON public.fcm_device_tokens FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on mfc_staff" ON public.mfc_staff FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on products" ON public.products FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on public_registrations" ON public.public_registrations FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on quote_items" ON public.quote_items FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on quotes" ON public.quotes FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on sale_transactions" ON public.sale_transactions FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on seller_balance" ON public.seller_balance FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on seller_payments" ON public.seller_payments FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on stock_batches" ON public.stock_batches FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on system_config" ON public.system_config FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager read access on users" ON public.users FOR SELECT USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "Manager update access on users" ON public.users FOR UPDATE USING ((public.get_my_staff_role() = 'manager'::text));



CREATE POLICY "User read own chalans" ON public.chalans FOR SELECT USING ((seller_id = public.get_my_user_id()));



CREATE POLICY "User read own customer balance" ON public.customer_balance FOR SELECT USING ((user_id = public.get_my_user_id()));



CREATE POLICY "User read own customer payments" ON public.customer_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.daily_bills db
  WHERE ((db.id = customer_payments.daily_bill_id) AND (db.customer_id = public.get_my_user_id())))));



CREATE POLICY "User read own daily bills" ON public.daily_bills FOR SELECT USING ((customer_id = public.get_my_user_id()));



CREATE POLICY "User read own profile" ON public.users FOR SELECT USING ((auth_user_id = auth.uid()));



CREATE POLICY "User read own quote items" ON public.quote_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_items.quote_id) AND (q.customer_id = public.get_my_user_id())))));



CREATE POLICY "User read own quotes" ON public.quotes FOR SELECT USING ((customer_id = public.get_my_user_id()));



CREATE POLICY "User read own sale transactions (buyer)" ON public.sale_transactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.daily_bills db
  WHERE ((db.id = sale_transactions.daily_bill_id) AND (db.customer_id = public.get_my_user_id())))));



CREATE POLICY "User read own sale transactions (seller)" ON public.sale_transactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chalans c
  WHERE ((c.id = sale_transactions.chalan_id) AND (c.seller_id = public.get_my_user_id())))));



CREATE POLICY "User read own seller balance" ON public.seller_balance FOR SELECT USING ((user_id = public.get_my_user_id()));



CREATE POLICY "User read own seller payments" ON public.seller_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chalans c
  WHERE ((c.id = seller_payments.chalan_id) AND (c.seller_id = public.get_my_user_id())))));



CREATE POLICY "User view own deleted records" ON public.deleted_records FOR SELECT USING (((record_owner_auth_id = auth.uid()) OR (public.get_my_staff_role() = ANY (ARRAY['admin'::text, 'manager'::text]))));



CREATE POLICY "User view own tokens" ON public.fcm_device_tokens FOR SELECT USING ((user_auth_id = auth.uid()));



ALTER TABLE public.chalans ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.customer_balance ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.daily_bill_counters ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.daily_bills ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.deleted_records ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.fcm_device_tokens ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.mfc_staff ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.public_registrations ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.sale_transactions ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.seller_balance ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.seller_payments ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;



-- Folded in from 20260405123000_manager_document_numbering_cleanup.sql
CREATE TABLE IF NOT EXISTS public.document_counters (
  document_type text NOT NULL,
  counter_date date NOT NULL,
  last_number integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
  CONSTRAINT document_counters_pkey PRIMARY KEY (document_type, counter_date),
  CONSTRAINT document_counters_document_type_check CHECK (
    document_type = ANY (
      ARRAY[
        'auction_chalan'::text,
        'batch_chalan'::text,
        'bill'::text,
        'floor_chalan'::text,
        'purchase_chalan'::text,
        'single_chalan'::text
      ]
    )
  )
);

COMMENT ON TABLE public.document_counters IS
  'Date-scoped counters for generated business documents. Replaces legacy global sequences and reset jobs.';

COMMENT ON COLUMN public.document_counters.document_type IS
  'Document family: bill, auction_chalan, purchase_chalan, single_chalan, batch_chalan, or floor_chalan.';

COMMENT ON COLUMN public.document_counters.counter_date IS
  'Business date for the generated sequence, stored in Asia/Kolkata date terms.';

COMMENT ON COLUMN public.document_counters.last_number IS
  'Most recently issued number for this document type on this date.';

REVOKE ALL ON TABLE public.document_counters FROM anon, authenticated, public;

INSERT INTO public.document_counters (document_type, counter_date, last_number)
SELECT
  'bill',
  bill_date,
  MAX(last_bill_number)
FROM public.daily_bill_counters
GROUP BY bill_date
ON CONFLICT (document_type, counter_date)
DO UPDATE SET
  last_number = GREATEST(public.document_counters.last_number, EXCLUDED.last_number),
  updated_at = timezone('Asia/Kolkata'::text, now());

INSERT INTO public.document_counters (document_type, counter_date, last_number)
SELECT
  'bill',
  db.bill_date,
  MAX(COALESCE((substring(db.bill_number FROM '([0-9]+)$'))::integer, 0))
FROM public.daily_bills db
GROUP BY db.bill_date
ON CONFLICT (document_type, counter_date)
DO UPDATE SET
  last_number = GREATEST(public.document_counters.last_number, EXCLUDED.last_number),
  updated_at = timezone('Asia/Kolkata'::text, now());

WITH typed_chalans AS (
  SELECT
    CASE
      WHEN c.chalan_number LIKE 'MFC-CH-%' THEN 'auction_chalan'
      WHEN c.chalan_number LIKE 'MFC-P-%' THEN 'purchase_chalan'
      WHEN c.chalan_number LIKE 'MFC-S-%' THEN 'single_chalan'
      WHEN c.chalan_number LIKE 'MFC-B-%' THEN 'batch_chalan'
      WHEN c.chalan_number LIKE 'MFC-FL-%' THEN 'floor_chalan'
      ELSE NULL
    END AS document_type,
    c.chalan_date AS counter_date,
    COALESCE((substring(c.chalan_number FROM '([0-9]+)$'))::integer, 0) AS last_number
  FROM public.chalans c
)
INSERT INTO public.document_counters (document_type, counter_date, last_number)
SELECT
  document_type,
  counter_date,
  MAX(last_number)
FROM typed_chalans
WHERE document_type IS NOT NULL
GROUP BY document_type, counter_date
ON CONFLICT (document_type, counter_date)
DO UPDATE SET
  last_number = GREATEST(public.document_counters.last_number, EXCLUDED.last_number),
  updated_at = timezone('Asia/Kolkata'::text, now());

CREATE OR REPLACE FUNCTION public._next_document_counter_value(
  p_document_type text,
  p_counter_date date
) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_next integer;
  v_counter_date date := COALESCE(
    p_counter_date,
    (timezone('Asia/Kolkata'::text, now()))::date
  );
BEGIN
  INSERT INTO public.document_counters (
    document_type,
    counter_date,
    last_number
  )
  VALUES (
    p_document_type,
    v_counter_date,
    1
  )
  ON CONFLICT (document_type, counter_date)
  DO UPDATE SET
    last_number = public.document_counters.last_number + 1,
    updated_at = timezone('Asia/Kolkata'::text, now())
  RETURNING last_number INTO v_next;

  RETURN v_next;
END;
$$;

REVOKE ALL ON FUNCTION public._next_document_counter_value(text, date) FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.generate_document_number(
  p_document_type text,
  p_document_date date
) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_document_date date := COALESCE(
    p_document_date,
    (timezone('Asia/Kolkata'::text, now()))::date
  );
  v_next integer;
  v_prefix text;
BEGIN
  CASE p_document_type
    WHEN 'bill' THEN
      v_prefix := 'BILL';
    WHEN 'auction_chalan' THEN
      v_prefix := 'MFC-CH';
    WHEN 'purchase_chalan' THEN
      v_prefix := 'MFC-P';
    WHEN 'single_chalan' THEN
      v_prefix := 'MFC-S';
    WHEN 'batch_chalan' THEN
      v_prefix := 'MFC-B';
    WHEN 'floor_chalan' THEN
      v_prefix := 'MFC-FL';
    ELSE
      RAISE EXCEPTION 'Unknown document type: %', p_document_type;
  END CASE;

  v_next := public._next_document_counter_value(p_document_type, v_document_date);

  RETURN v_prefix || '-' || to_char(v_document_date, 'DDMMYY') || '-' || v_next::text;
END;
$$;

COMMENT ON FUNCTION public.generate_document_number(text, date) IS
  'Generates business document numbers using date-scoped counters instead of global sequences.';

REVOKE ALL ON FUNCTION public.generate_document_number(text, date) FROM anon, authenticated, public;

CREATE OR REPLACE FUNCTION public.get_or_create_daily_bill(
  p_customer_id uuid,
  p_bill_date date,
  p_created_by uuid
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_bill_id uuid;
  v_bill_number text;
BEGIN
  SELECT id
  INTO v_bill_id
  FROM public.daily_bills
  WHERE customer_id = p_customer_id
    AND bill_date = p_bill_date;

  IF v_bill_id IS NOT NULL THEN
    RETURN v_bill_id;
  END IF;

  v_bill_number := public.generate_document_number('bill', p_bill_date);

  INSERT INTO public.daily_bills (
    customer_id,
    bill_date,
    created_by,
    updated_by,
    bill_number
  )
  VALUES (
    p_customer_id,
    p_bill_date,
    p_created_by,
    p_created_by,
    v_bill_number
  )
  ON CONFLICT (customer_id, bill_date)
  DO UPDATE SET updated_by = EXCLUDED.updated_by
  RETURNING id INTO v_bill_id;

  RETURN v_bill_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_auction_sale(
  p_seller_id uuid,
  p_sale_items jsonb,
  p_commission_percentage numeric DEFAULT 6.0,
  p_paid_amount numeric DEFAULT NULL::numeric,
  p_chalan_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_chalan_id uuid;
  v_staff_id uuid := auth.uid();
  v_chalan_number_generated text;
  v_sale_item jsonb;
  v_item_buyer_id uuid;
  v_item_bill_id uuid;
  v_final_rounded_net_amount numeric;
  v_payment_to_log numeric;
  v_product_id uuid;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  v_chalan_number_generated := public.generate_document_number('auction_chalan', p_chalan_date);

  INSERT INTO public.chalans (
    seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent,
    created_by, updated_by
  )
  VALUES (
    p_seller_id, NULL, v_chalan_number_generated, p_chalan_date, p_commission_percentage,
    v_staff_id, v_staff_id
  )
  RETURNING id INTO v_chalan_id;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items)
  LOOP
    v_item_buyer_id := (v_sale_item->>'buyer_id')::uuid;

    v_product_id := NULL;
    IF v_sale_item->>'product_id' IS NOT NULL THEN
      BEGIN
        v_product_id := (v_sale_item->>'product_id')::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_product_id := NULL;
      END;
    END IF;

    v_item_bill_id := public.get_or_create_daily_bill(
      v_item_buyer_id,
      p_chalan_date,
      v_staff_id
    );

    INSERT INTO public.sale_transactions (
      daily_bill_id, chalan_id, product_id, product_description,
      weight_kg, price_per_kg, created_by, updated_by,
      sale_type
    )
    VALUES (
      v_item_bill_id, v_chalan_id, v_product_id, (v_sale_item->>'product_description')::text,
      (v_sale_item->>'weight')::numeric, (v_sale_item->>'rate')::numeric, v_staff_id, v_staff_id,
      'auction'
    );
  END LOOP;

  SELECT net_payable INTO v_final_rounded_net_amount
  FROM public.chalans WHERE id = v_chalan_id;

  IF p_paid_amount IS NULL THEN
    v_payment_to_log := v_final_rounded_net_amount;
  ELSE
    v_payment_to_log := p_paid_amount;
  END IF;

  INSERT INTO public.seller_payments (chalan_id, amount, payment_date, created_by, updated_by, payment_method)
  VALUES (v_chalan_id, v_payment_to_log, p_chalan_date, v_staff_id, v_staff_id, 'initial_payout');

  UPDATE public.chalans
  SET amount_paid = v_payment_to_log,
      status = CASE
        WHEN v_payment_to_log >= v_final_rounded_net_amount THEN 'paid'::public.payment_status
        WHEN v_payment_to_log = 0 AND v_final_rounded_net_amount > 0 THEN 'due'::public.payment_status
        WHEN v_payment_to_log > 0 THEN 'partially_paid'::public.payment_status
        ELSE 'paid'::public.payment_status
      END
  WHERE id = v_chalan_id;

  RETURN v_chalan_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_floor_sale(
  p_sale_items jsonb,
  p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_staff_role text;
  v_sale_item jsonb;
  v_item_buyer_id uuid;
  v_item_bill_id uuid;
  v_item_seller_id uuid;
  v_chalan_id uuid;
  v_item_stock_batch_id uuid;
  v_current_stock numeric;
  v_chalan_number_generated text;
  seller_chalan_map jsonb := '{}'::jsonb;
  v_created_chalan_ids uuid[] := ARRAY[]::uuid[];
  v_created_bill_ids uuid[] := ARRAY[]::uuid[];
BEGIN
  SELECT role::text INTO v_staff_role FROM public.mfc_staff WHERE id = v_staff_id;
  IF v_staff_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
    IF v_item_stock_batch_id IS NOT NULL THEN
      SELECT current_weight_kg INTO v_current_stock
      FROM public.stock_batches
      WHERE id = v_item_stock_batch_id
      FOR UPDATE;

      IF v_current_stock <= 0 THEN
        RAISE EXCEPTION 'Stock for batch % is already depleted.', (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
      END IF;
    END IF;
  END LOOP;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_seller_id := (v_sale_item->>'mfc_seller_id')::uuid;
    v_item_buyer_id := (v_sale_item->>'buyer_id')::uuid;

    v_chalan_id := (seller_chalan_map->>v_item_seller_id::text)::uuid;
    IF v_chalan_id IS NULL THEN
      v_chalan_number_generated := public.generate_document_number('floor_chalan', p_sale_date);
      INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
      VALUES (NULL, v_item_seller_id, v_chalan_number_generated, p_sale_date, 0, v_staff_id, v_staff_id)
      RETURNING id INTO v_chalan_id;
      seller_chalan_map := seller_chalan_map || jsonb_build_object(v_item_seller_id, v_chalan_id);
      v_created_chalan_ids := array_append(v_created_chalan_ids, v_chalan_id);
    END IF;

    v_item_bill_id := public.get_or_create_daily_bill(v_item_buyer_id, p_sale_date, v_staff_id);
    v_created_bill_ids := array_append(v_created_bill_ids, v_item_bill_id);

    PERFORM public._internal_create_sale_and_update_stock(v_item_bill_id, v_chalan_id, v_staff_id, v_sale_item);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'created_chalans', (SELECT array_agg(DISTINCT e) FROM unnest(v_created_chalan_ids) e),
    'created_bills', (SELECT array_agg(DISTINCT e) FROM unnest(v_created_bill_ids) e)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.create_sale_for_single_customer(
  p_buyer_id uuid,
  p_sale_items jsonb,
  p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_sale_item jsonb;
  v_item_stock_batch_id uuid;
  v_current_stock numeric;
  v_bill_id uuid;
  v_item_seller_id uuid;
  v_chalan_id uuid;
  seller_chalan_map jsonb := '{}'::jsonb;
  v_chalan_number_generated text;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
    IF v_item_stock_batch_id IS NOT NULL THEN
      SELECT current_weight_kg INTO v_current_stock
      FROM public.stock_batches
      WHERE id = v_item_stock_batch_id
      FOR UPDATE;

      IF v_current_stock <= 0 THEN
        RAISE EXCEPTION 'Stock for batch % is already depleted.', (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
      END IF;
    END IF;
  END LOOP;

  v_bill_id := public.get_or_create_daily_bill(p_buyer_id, p_sale_date, v_staff_id);

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_seller_id := (v_sale_item->>'mfc_seller_id')::uuid;
    v_chalan_id := (seller_chalan_map->>v_item_seller_id::text)::uuid;
    IF v_chalan_id IS NULL THEN
      v_chalan_number_generated := public.generate_document_number('single_chalan', p_sale_date);
      INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
      VALUES (NULL, v_item_seller_id, v_chalan_number_generated, p_sale_date, 0, v_staff_id, v_staff_id)
      RETURNING id INTO v_chalan_id;
      seller_chalan_map := seller_chalan_map || jsonb_build_object(v_item_seller_id, v_chalan_id);
    END IF;

    PERFORM public._internal_create_sale_and_update_stock(v_bill_id, v_chalan_id, v_staff_id, v_sale_item);
  END LOOP;

  RETURN v_bill_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_seller_batch_sale(
  p_mfc_seller_id uuid,
  p_sale_items jsonb,
  p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_staff_role text;
  v_sale_item jsonb;
  v_item_buyer_id uuid;
  v_item_bill_id uuid;
  v_item_stock_batch_id uuid;
  v_current_stock numeric;
  v_chalan_id uuid;
  v_chalan_number_generated text;
BEGIN
  SELECT role::text INTO v_staff_role FROM public.mfc_staff WHERE id = v_staff_id;
  IF v_staff_role NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_stock_batch_id := (v_sale_item->>'stock_batch_id')::uuid;
    IF v_item_stock_batch_id IS NOT NULL THEN
      SELECT current_weight_kg INTO v_current_stock
      FROM public.stock_batches
      WHERE id = v_item_stock_batch_id
      FOR UPDATE;

      IF v_current_stock <= 0 THEN
        RAISE EXCEPTION 'Stock for batch % is already depleted.', (SELECT batch_code FROM stock_batches WHERE id = v_item_stock_batch_id);
      END IF;
    END IF;
  END LOOP;

  v_chalan_number_generated := public.generate_document_number('batch_chalan', p_sale_date);
  INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
  VALUES (NULL, p_mfc_seller_id, v_chalan_number_generated, p_sale_date, 0, v_staff_id, v_staff_id)
  RETURNING id INTO v_chalan_id;

  FOR v_sale_item IN SELECT * FROM jsonb_array_elements(p_sale_items) LOOP
    v_item_buyer_id := (v_sale_item->>'buyer_id')::uuid;
    v_item_bill_id := public.get_or_create_daily_bill(v_item_buyer_id, p_sale_date, v_staff_id);

    PERFORM public._internal_create_sale_and_update_stock(v_item_bill_id, v_chalan_id, v_staff_id, v_sale_item);
  END LOOP;

  RETURN v_chalan_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.purchase_stock_from_seller(
  p_seller_id uuid,
  p_commission_percentage numeric,
  p_mfc_seller_id_to_assign uuid,
  p_purchase_items jsonb,
  p_purchase_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_mfc_stock_buyer_id uuid;
  v_chalan_number_generated text;
  v_chalan_id uuid;
  v_mfc_bill_id uuid;
  v_item jsonb;
  v_item_weight numeric;
  v_item_rate numeric;
  v_item_product_id uuid;
  v_net_payable numeric;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT mfc_stock_buyer_id INTO v_mfc_stock_buyer_id FROM public.system_config WHERE id = 1;
  IF v_mfc_stock_buyer_id IS NULL THEN
    RAISE EXCEPTION 'System buyer ID is not configured.';
  END IF;

  v_chalan_number_generated := public.generate_document_number('purchase_chalan', p_purchase_date);
  INSERT INTO public.chalans (seller_id, mfc_seller_id, chalan_number, chalan_date, commission_rate_percent, created_by, updated_by)
  VALUES (p_seller_id, NULL, v_chalan_number_generated, p_purchase_date, p_commission_percentage, v_staff_id, v_staff_id)
  RETURNING id INTO v_chalan_id;

  v_mfc_bill_id := public.get_or_create_daily_bill(v_mfc_stock_buyer_id, p_purchase_date, v_staff_id);

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_purchase_items) LOOP
    v_item_weight := (v_item->>'weight')::numeric;
    v_item_rate := (v_item->>'rate')::numeric;

    v_item_product_id := NULL;
    IF v_item->>'product_id' IS NOT NULL THEN
      BEGIN
        v_item_product_id := (v_item->>'product_id')::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          v_item_product_id := NULL;
      END;
    END IF;

    INSERT INTO public.sale_transactions (
      daily_bill_id, chalan_id, product_id, product_description, weight_kg,
      price_per_kg, created_by, updated_by, sale_type
    )
    VALUES (
      v_mfc_bill_id, v_chalan_id, v_item_product_id, (v_item->>'product_description')::text,
      v_item_weight, v_item_rate, v_staff_id, v_staff_id, 'auction'
    );

    INSERT INTO public.stock_batches (
      product_id, supplier_id, mfc_seller_id, initial_weight_kg, current_weight_kg,
      cost_per_kg, created_by, updated_by
    )
    VALUES (
      v_item_product_id, p_seller_id, p_mfc_seller_id_to_assign, v_item_weight,
      v_item_weight, v_item_rate, v_staff_id, v_staff_id
    );
  END LOOP;

  SELECT net_payable INTO v_net_payable FROM public.chalans WHERE id = v_chalan_id;

  INSERT INTO public.seller_payments (chalan_id, amount, payment_date, created_by, updated_by, payment_method)
  VALUES (v_chalan_id, v_net_payable, p_purchase_date, v_staff_id, v_staff_id, 'initial_payout');

  UPDATE public.chalans
  SET amount_paid = v_net_payable,
      status = 'paid'::public.payment_status
  WHERE id = v_chalan_id;

  RETURN v_chalan_id;
END;
$$;

DO $$
DECLARE
  v_job_id bigint;
BEGIN
  IF to_regclass('cron.job') IS NOT NULL THEN
    FOR v_job_id IN
      SELECT jobid
      FROM cron.job
      WHERE command ILIKE '%setval(''public.chalan_number_seq''%'
         OR command ILIKE '%setval(''public.mfc_single_bill_seq''%'
         OR command ILIKE '%setval(''public.mfc_batch_bill_seq''%'
         OR command ILIKE '%setval(''public.mfc_floor_sale_seq''%'
    LOOP
      PERFORM cron.unschedule(v_job_id);
    END LOOP;
  END IF;
END;
$$;

DO $$
DECLARE
  v_daily_bill_counters regclass := to_regclass('public.daily_bill_counters');
BEGIN
  IF v_daily_bill_counters IS NOT NULL AND EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    WHERE p.pubname = 'supabase_realtime'
      AND pr.prrelid = v_daily_bill_counters
  ) THEN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.daily_bill_counters;
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.daily_bill_counters') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Admin full access on daily_bill_counters" ON public.daily_bill_counters;
    DROP POLICY IF EXISTS "Staff insert access on daily_bill_counters" ON public.daily_bill_counters;
    DROP POLICY IF EXISTS "Staff read access on daily_bill_counters" ON public.daily_bill_counters;
  END IF;
END;
$$;

DROP TABLE IF EXISTS public.daily_bill_counters;

DROP SEQUENCE IF EXISTS public.chalan_number_seq;
DROP SEQUENCE IF EXISTS public.mfc_single_bill_seq;
DROP SEQUENCE IF EXISTS public.mfc_batch_bill_seq;
DROP SEQUENCE IF EXISTS public.mfc_floor_sale_seq;


-- Folded in from 20260405170000_spendings_admin_user_rollout.sql
CREATE TABLE IF NOT EXISTS public.manager_spendings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    spent_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date NOT NULL,
    title text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    amount numeric NOT NULL,
    note text,
    payment_method public.payment_method_enum DEFAULT 'cash'::public.payment_method_enum NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT manager_spendings_amount_check CHECK ((amount > (0)::numeric))
);

ALTER TABLE ONLY public.manager_spendings
    ADD CONSTRAINT manager_spendings_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.manager_spendings FORCE ROW LEVEL SECURITY;
ALTER TABLE public.manager_spendings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_manager_spendings_spent_date
    ON public.manager_spendings USING btree (spent_date DESC);

CREATE INDEX IF NOT EXISTS idx_manager_spendings_created_by_spent_date
    ON public.manager_spendings USING btree (created_by, spent_date DESC);

CREATE INDEX IF NOT EXISTS idx_manager_spendings_category_spent_date
    ON public.manager_spendings USING btree (category, spent_date DESC);

ALTER TABLE ONLY public.manager_spendings
    ADD CONSTRAINT manager_spendings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.manager_spendings
    ADD CONSTRAINT manager_spendings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.mfc_staff(id) ON DELETE SET NULL;

ALTER TABLE public.fcm_device_tokens
    ADD COLUMN IF NOT EXISTS app_scope text DEFAULT 'manager'::text NOT NULL,
    ADD COLUMN IF NOT EXISTS platform text DEFAULT 'android'::text NOT NULL,
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fcm_device_tokens_app_scope_check'
    ) THEN
        ALTER TABLE public.fcm_device_tokens
            ADD CONSTRAINT fcm_device_tokens_app_scope_check
            CHECK (app_scope = ANY (ARRAY['manager'::text, 'admin'::text, 'user'::text]));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fcm_device_tokens_platform_check'
    ) THEN
        ALTER TABLE public.fcm_device_tokens
            ADD CONSTRAINT fcm_device_tokens_platform_check
            CHECK (platform = ANY (ARRAY['android'::text, 'ios'::text, 'web'::text, 'desktop'::text]));
    END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_fcm_device_tokens_scope_active
    ON public.fcm_device_tokens USING btree (app_scope, is_active, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_outbox (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_auth_id uuid NOT NULL,
    app_scope text DEFAULT 'user'::text NOT NULL,
    event_type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempt_count integer DEFAULT 0 NOT NULL,
    source_table text,
    source_record_id uuid,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    processed_at timestamp with time zone,
    last_error text,
    CONSTRAINT notification_outbox_status_check CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text])),
    CONSTRAINT notification_outbox_app_scope_check CHECK (app_scope = ANY (ARRAY['user'::text, 'manager'::text, 'admin'::text]))
);

ALTER TABLE ONLY public.notification_outbox
    ADD CONSTRAINT notification_outbox_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.notification_outbox FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

ALTER TABLE ONLY public.notification_outbox
    ADD CONSTRAINT notification_outbox_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notification_outbox_status_created_at
    ON public.notification_outbox USING btree (status, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_user_scope
    ON public.notification_outbox USING btree (user_auth_id, app_scope, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_outbox_source
    ON public.notification_outbox USING btree (source_table, source_record_id);

DROP FUNCTION IF EXISTS public.register_fcm_token(text);

CREATE FUNCTION public.register_fcm_token(
    p_device_token text,
    p_app_scope text DEFAULT 'manager'::text,
    p_platform text DEFAULT 'android'::text
) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    INSERT INTO public.fcm_device_tokens (
        user_auth_id,
        device_token,
        app_scope,
        platform,
        created_at,
        updated_at,
        last_seen_at,
        is_active
    )
    VALUES (
        auth.uid(),
        p_device_token,
        COALESCE(NULLIF(trim(p_app_scope), ''), 'manager'),
        COALESCE(NULLIF(trim(p_platform), ''), 'android'),
        timezone('Asia/Kolkata', now()),
        timezone('Asia/Kolkata', now()),
        timezone('Asia/Kolkata', now()),
        true
    )
    ON CONFLICT (device_token) DO UPDATE SET
        user_auth_id = auth.uid(),
        app_scope = EXCLUDED.app_scope,
        platform = EXCLUDED.platform,
        updated_at = timezone('Asia/Kolkata', now()),
        last_seen_at = timezone('Asia/Kolkata', now()),
        is_active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_manager_spending(
    p_title text,
    p_amount numeric,
    p_spent_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date,
    p_category text DEFAULT 'general'::text,
    p_note text DEFAULT NULL::text,
    p_payment_method public.payment_method_enum DEFAULT 'cash'::public.payment_method_enum
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_staff_id uuid := auth.uid();
    v_spending_id uuid;
BEGIN
    PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

    INSERT INTO public.manager_spendings (
        spent_date,
        title,
        category,
        amount,
        note,
        payment_method,
        created_by,
        updated_by
    )
    VALUES (
        COALESCE(p_spent_date, (timezone('Asia/Kolkata', now()))::date),
        trim(p_title),
        COALESCE(NULLIF(trim(p_category), ''), 'general'),
        p_amount,
        NULLIF(trim(COALESCE(p_note, '')), ''),
        COALESCE(p_payment_method, 'cash'::public.payment_method_enum),
        v_staff_id,
        v_staff_id
    )
    RETURNING id INTO v_spending_id;

    RETURN v_spending_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_my_profile(
    p_name text DEFAULT NULL::text,
    p_business_name text DEFAULT NULL::text,
    p_phone text DEFAULT NULL::text,
    p_address jsonb DEFAULT NULL::jsonb,
    p_default_role public.default_role DEFAULT NULL::public.default_role
) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_user_id uuid := public.get_my_user_id();
    v_profile jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized to update profile.';
    END IF;

    UPDATE public.users
    SET
        name = COALESCE(NULLIF(trim(COALESCE(p_name, '')), ''), name),
        business_name = COALESCE(NULLIF(trim(COALESCE(p_business_name, '')), ''), business_name),
        phone = COALESCE(NULLIF(trim(COALESCE(p_phone, '')), ''), phone),
        address = COALESCE(p_address, address),
        default_role = COALESCE(p_default_role, default_role),
        updated_at = timezone('Asia/Kolkata', now()),
        updated_by = v_user_id
    WHERE id = v_user_id;

    SELECT to_jsonb(u) INTO v_profile
    FROM public.users u
    WHERE u.id = v_user_id;

    RETURN v_profile;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_insight_snapshot(p_date date)
RETURNS TABLE(
    selected_date date,
    total_sales numeric,
    total_collection numeric,
    total_spend numeric,
    total_chalans bigint,
    total_payable numeric,
    total_bills bigint
)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    PERFORM public.authorize_staff(ARRAY['admin']);

    RETURN QUERY
    SELECT
        p_date AS selected_date,
        COALESCE((SELECT SUM(db.total_amount) FROM public.daily_bills db WHERE db.bill_date = p_date), 0)::numeric AS total_sales,
        COALESCE((SELECT SUM(cp.amount) FROM public.customer_payments cp WHERE cp.payment_date = p_date), 0)::numeric AS total_collection,
        COALESCE((SELECT SUM(ms.amount) FROM public.manager_spendings ms WHERE ms.spent_date = p_date), 0)::numeric AS total_spend,
        COALESCE((SELECT COUNT(*) FROM public.chalans c WHERE c.chalan_date = p_date), 0)::bigint AS total_chalans,
        COALESCE((SELECT SUM(c.net_payable) FROM public.chalans c WHERE c.chalan_date = p_date), 0)::numeric AS total_payable,
        COALESCE((SELECT COUNT(*) FROM public.daily_bills db WHERE db.bill_date = p_date), 0)::bigint AS total_bills;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_manager_breakdown(p_date date)
RETURNS TABLE(
    staff_id uuid,
    manager_name text,
    staff_role public.staff_type,
    sales_total numeric,
    collection_total numeric,
    spend_total numeric,
    chalan_count bigint,
    payable_total numeric,
    bill_count bigint
)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    PERFORM public.authorize_staff(ARRAY['admin']);

    RETURN QUERY
    SELECT
        s.id AS staff_id,
        s.full_name AS manager_name,
        s.role AS staff_role,
        COALESCE(bills.sales_total, 0)::numeric AS sales_total,
        COALESCE(collections.collection_total, 0)::numeric AS collection_total,
        COALESCE(spendings.spend_total, 0)::numeric AS spend_total,
        COALESCE(chalans.chalan_count, 0)::bigint AS chalan_count,
        COALESCE(chalans.payable_total, 0)::numeric AS payable_total,
        COALESCE(bills.bill_count, 0)::bigint AS bill_count
    FROM public.mfc_staff s
    LEFT JOIN (
        SELECT
            created_by AS staff_id,
            SUM(total_amount) AS sales_total,
            COUNT(*) AS bill_count
        FROM public.daily_bills
        WHERE bill_date = p_date
          AND created_by IS NOT NULL
        GROUP BY created_by
    ) bills ON bills.staff_id = s.id
    LEFT JOIN (
        SELECT
            created_by AS staff_id,
            SUM(amount) AS collection_total
        FROM public.customer_payments
        WHERE payment_date = p_date
          AND created_by IS NOT NULL
        GROUP BY created_by
    ) collections ON collections.staff_id = s.id
    LEFT JOIN (
        SELECT
            created_by AS staff_id,
            SUM(amount) AS spend_total
        FROM public.manager_spendings
        WHERE spent_date = p_date
          AND created_by IS NOT NULL
        GROUP BY created_by
    ) spendings ON spendings.staff_id = s.id
    LEFT JOIN (
        SELECT
            created_by AS staff_id,
            COUNT(*) AS chalan_count,
            SUM(net_payable) AS payable_total
        FROM public.chalans
        WHERE chalan_date = p_date
          AND created_by IS NOT NULL
        GROUP BY created_by
    ) chalans ON chalans.staff_id = s.id
    WHERE s.role = ANY (ARRAY['admin'::public.staff_type, 'manager'::public.staff_type])
      AND s.is_active = true
    ORDER BY s.full_name ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_recent_days(p_days integer DEFAULT 7)
RETURNS TABLE(
    snapshot_date date,
    total_sales numeric,
    total_collection numeric,
    total_spend numeric,
    total_chalans bigint,
    total_payable numeric,
    total_bills bigint
)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_days integer := GREATEST(COALESCE(p_days, 7), 1);
BEGIN
    PERFORM public.authorize_staff(ARRAY['admin']);

    RETURN QUERY
    SELECT
        day_ref.snapshot_date,
        COALESCE((SELECT SUM(db.total_amount) FROM public.daily_bills db WHERE db.bill_date = day_ref.snapshot_date), 0)::numeric AS total_sales,
        COALESCE((SELECT SUM(cp.amount) FROM public.customer_payments cp WHERE cp.payment_date = day_ref.snapshot_date), 0)::numeric AS total_collection,
        COALESCE((SELECT SUM(ms.amount) FROM public.manager_spendings ms WHERE ms.spent_date = day_ref.snapshot_date), 0)::numeric AS total_spend,
        COALESCE((SELECT COUNT(*) FROM public.chalans c WHERE c.chalan_date = day_ref.snapshot_date), 0)::bigint AS total_chalans,
        COALESCE((SELECT SUM(c.net_payable) FROM public.chalans c WHERE c.chalan_date = day_ref.snapshot_date), 0)::numeric AS total_payable,
        COALESCE((SELECT COUNT(*) FROM public.daily_bills db WHERE db.bill_date = day_ref.snapshot_date), 0)::bigint AS total_bills
    FROM (
        SELECT generate_series(
            ((timezone('Asia/Kolkata', now()))::date - (v_days - 1)),
            (timezone('Asia/Kolkata', now()))::date,
            interval '1 day'
        )::date AS snapshot_date
    ) AS day_ref
    ORDER BY day_ref.snapshot_date DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_user_notification_outbox()
RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
    v_user_auth_id uuid;
    v_title text;
    v_body text;
    v_payload jsonb;
BEGIN
    IF TG_TABLE_NAME = 'daily_bills' THEN
        SELECT u.auth_user_id
        INTO v_user_auth_id
        FROM public.users u
        WHERE u.id = NEW.customer_id;

        IF v_user_auth_id IS NULL THEN
            RETURN NULL;
        END IF;

        v_title := 'Thank you for purchasing';
        v_body := CASE
            WHEN TG_OP = 'INSERT'
                THEN format('Your bill %s is ready. Tap to view the updated bill.', NEW.bill_number)
            ELSE format('Your bill %s was updated. Tap to view the latest bill.', NEW.bill_number)
        END;

        v_payload := jsonb_build_object(
            'target_screen', 'today',
            'entity_type', 'bill',
            'entity_id', NEW.id,
            'selected_date', NEW.bill_date,
            'bill_number', NEW.bill_number
        );
    ELSIF TG_TABLE_NAME = 'customer_payments' THEN
        SELECT
            u.auth_user_id,
            jsonb_build_object(
                'target_screen', 'history',
                'entity_type', 'payment',
                'entity_id', NEW.id,
                'selected_date', db.bill_date,
                'bill_id', db.id,
                'bill_number', db.bill_number
            )
        INTO v_user_auth_id, v_payload
        FROM public.daily_bills db
        JOIN public.users u ON u.id = db.customer_id
        WHERE db.id = NEW.daily_bill_id;

        IF v_user_auth_id IS NULL THEN
            RETURN NULL;
        END IF;

        v_title := 'Payment received';
        v_body := format('Payment of ₹%s was recorded. Tap to view your updated bill.', trim(to_char(NEW.amount, 'FM9999999990D00')));
    ELSIF TG_TABLE_NAME = 'chalans' THEN
        SELECT u.auth_user_id
        INTO v_user_auth_id
        FROM public.users u
        WHERE u.id = NEW.seller_id;

        IF v_user_auth_id IS NULL THEN
            RETURN NULL;
        END IF;

        v_title := 'Seller chalan';
        v_body := CASE
            WHEN TG_OP = 'INSERT'
                THEN format('Your chalan %s is ready. Tap to view the latest payable.', NEW.chalan_number)
            ELSE format('Your chalan %s was updated. Tap to view the latest payable.', NEW.chalan_number)
        END;

        v_payload := jsonb_build_object(
            'target_screen', 'today',
            'entity_type', 'chalan',
            'entity_id', NEW.id,
            'selected_date', NEW.chalan_date,
            'chalan_number', NEW.chalan_number
        );
    ELSIF TG_TABLE_NAME = 'seller_payments' THEN
        SELECT
            u.auth_user_id,
            jsonb_build_object(
                'target_screen', 'history',
                'entity_type', 'payout',
                'entity_id', NEW.id,
                'selected_date', c.chalan_date,
                'chalan_id', c.id,
                'chalan_number', c.chalan_number
            )
        INTO v_user_auth_id, v_payload
        FROM public.chalans c
        JOIN public.users u ON u.id = c.seller_id
        WHERE c.id = NEW.chalan_id;

        IF v_user_auth_id IS NULL THEN
            RETURN NULL;
        END IF;

        v_title := 'Payout recorded';
        v_body := format('Payout of ₹%s was recorded. Tap to view your updated chalan.', trim(to_char(NEW.amount, 'FM9999999990D00')));
    ELSE
        RETURN NULL;
    END IF;

    INSERT INTO public.notification_outbox (
        user_auth_id,
        app_scope,
        event_type,
        title,
        body,
        payload,
        source_table,
        source_record_id
    )
    VALUES (
        v_user_auth_id,
        'user',
        TG_TABLE_NAME || '_' || lower(TG_OP),
        v_title,
        v_body,
        v_payload,
        TG_TABLE_NAME,
        NEW.id
    );

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_enqueue_bill_notification ON public.daily_bills;
CREATE TRIGGER trg_enqueue_bill_notification
AFTER INSERT OR UPDATE ON public.daily_bills
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_user_notification_outbox();

DROP TRIGGER IF EXISTS trg_enqueue_customer_payment_notification ON public.customer_payments;
CREATE TRIGGER trg_enqueue_customer_payment_notification
AFTER INSERT ON public.customer_payments
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_user_notification_outbox();

DROP TRIGGER IF EXISTS trg_enqueue_chalan_notification ON public.chalans;
CREATE TRIGGER trg_enqueue_chalan_notification
AFTER INSERT OR UPDATE ON public.chalans
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_user_notification_outbox();

DROP TRIGGER IF EXISTS trg_enqueue_seller_payment_notification ON public.seller_payments;
CREATE TRIGGER trg_enqueue_seller_payment_notification
AFTER INSERT ON public.seller_payments
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_user_notification_outbox();

DROP POLICY IF EXISTS "Admin full access on manager_spendings" ON public.manager_spendings;
CREATE POLICY "Admin full access on manager_spendings"
    ON public.manager_spendings
    USING (public.check_user_role(ARRAY['admin'::text]))
    WITH CHECK (public.check_user_role(ARRAY['admin'::text]));

DROP POLICY IF EXISTS "Staff read access on manager_spendings" ON public.manager_spendings;
CREATE POLICY "Staff read access on manager_spendings"
    ON public.manager_spendings FOR SELECT
    USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));

DROP POLICY IF EXISTS "Staff insert access on manager_spendings" ON public.manager_spendings;
CREATE POLICY "Staff insert access on manager_spendings"
    ON public.manager_spendings FOR INSERT
    WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));

DROP POLICY IF EXISTS "Admin full access on notification_outbox" ON public.notification_outbox;
CREATE POLICY "Admin full access on notification_outbox"
    ON public.notification_outbox
    USING (public.check_user_role(ARRAY['admin'::text]))
    WITH CHECK (public.check_user_role(ARRAY['admin'::text]));

DROP POLICY IF EXISTS "Staff read access on notification_outbox" ON public.notification_outbox;
CREATE POLICY "Staff read access on notification_outbox"
    ON public.notification_outbox FOR SELECT
    USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));

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
