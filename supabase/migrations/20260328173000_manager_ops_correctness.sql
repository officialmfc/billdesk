DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.daily_bills
    GROUP BY customer_id, bill_date
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION
      'Cannot enforce public.daily_bills(customer_id, bill_date) uniqueness because duplicate rows already exist. Resolve duplicates before rerunning this migration.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'daily_bills_customer_id_bill_date_key'
      AND conrelid = 'public.daily_bills'::regclass
  ) THEN
    ALTER TABLE public.daily_bills
      ADD CONSTRAINT daily_bills_customer_id_bill_date_key
      UNIQUE (customer_id, bill_date);
  END IF;
END;
$$;

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
  v_daily_count integer;
BEGIN
  SELECT id
  INTO v_bill_id
  FROM public.daily_bills
  WHERE customer_id = p_customer_id
    AND bill_date = p_bill_date;

  IF v_bill_id IS NOT NULL THEN
    RETURN v_bill_id;
  END IF;

  INSERT INTO public.daily_bill_counters (bill_date, last_bill_number)
  VALUES (p_bill_date, 1)
  ON CONFLICT (bill_date)
  DO UPDATE SET last_bill_number = public.daily_bill_counters.last_bill_number + 1
  RETURNING last_bill_number INTO v_daily_count;

  v_bill_number := 'BILL-' || to_char(p_bill_date, 'DDMMYY') || '-' || v_daily_count::text;

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

CREATE OR REPLACE FUNCTION public.submit_seller_payout(
  p_chalan_id uuid,
  p_amount numeric,
  p_payment_method public.payment_method_enum,
  p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date
) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
AS $$
DECLARE
  v_new_payment_id uuid;
  v_staff_id uuid := auth.uid();
  v_chalan record;
  v_new_amount_paid numeric;
  v_new_status public.payment_status;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT *
  INTO v_chalan
  FROM public.chalans
  WHERE id = p_chalan_id
  FOR UPDATE;

  IF v_chalan IS NULL THEN
    RAISE EXCEPTION 'Chalan not found';
  END IF;

  INSERT INTO public.seller_payments (
    chalan_id,
    payment_date,
    amount,
    payment_method,
    created_by,
    updated_by
  )
  VALUES (
    p_chalan_id,
    p_payment_date,
    p_amount,
    p_payment_method,
    v_staff_id,
    v_staff_id
  )
  RETURNING id INTO v_new_payment_id;

  v_new_amount_paid := v_chalan.amount_paid + p_amount;

  IF v_new_amount_paid >= v_chalan.net_payable THEN
    v_new_status := 'paid'::public.payment_status;
  ELSE
    v_new_status := 'partially_paid'::public.payment_status;
  END IF;

  UPDATE public.chalans
  SET amount_paid = v_new_amount_paid,
      status = v_new_status,
      updated_by = v_staff_id
  WHERE id = p_chalan_id;

  RETURN v_new_payment_id;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_daily_bills_created_by_bill_date
  ON public.daily_bills (created_by, bill_date DESC);

CREATE INDEX IF NOT EXISTS idx_customer_payments_created_by_payment_date
  ON public.customer_payments (created_by, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_seller_payments_created_by_payment_date
  ON public.seller_payments (created_by, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_chalans_created_by_chalan_date
  ON public.chalans (created_by, chalan_date DESC);

CREATE INDEX IF NOT EXISTS idx_users_active_lower_name
  ON public.users (lower(name))
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_active_lower_business_name
  ON public.users (lower(business_name))
  WHERE is_active = true
    AND business_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_mfc_staff_active_lower_full_name
  ON public.mfc_staff (lower(full_name))
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_stock_batches_supplier_created_at
  ON public.stock_batches (supplier_id, created_at DESC);
