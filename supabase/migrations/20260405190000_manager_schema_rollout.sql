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
    v_source jsonb;
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
