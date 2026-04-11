DROP INDEX IF EXISTS public.idx_customer_payments_daily_bill_id;
DROP INDEX IF EXISTS public.idx_seller_payments_chalan_id;

COMMENT ON INDEX public.idx_daily_bills_created_by_bill_date IS
  'Manager-facing sync and dashboard index. Scope staff-owned bills by created_by instead of display-name matching.';

COMMENT ON INDEX public.idx_customer_payments_created_by_payment_date IS
  'Manager-facing sync and collection-history index. Scope customer payments by created_by instead of created_by_name.';

COMMENT ON INDEX public.idx_seller_payments_created_by_payment_date IS
  'Manager-facing sync and payout-history index. Scope seller payouts by created_by instead of created_by_name.';

COMMENT ON INDEX public.idx_chalans_created_by_chalan_date IS
  'Manager-facing sync and operations index. Scope chalans by created_by instead of display-name matching.';

COMMENT ON INDEX public.idx_users_active_lower_name IS
  'Active-user autocomplete index for manager sale, payment, and operations screens.';

COMMENT ON INDEX public.idx_users_active_lower_business_name IS
  'Active-business autocomplete index for manager sale, payment, and operations screens.';

COMMENT ON INDEX public.idx_mfc_staff_active_lower_full_name IS
  'Active-staff autocomplete index for manager assignment and seller lookups.';

COMMENT ON INDEX public.idx_stock_batches_supplier_created_at IS
  'Supplier and recency index for manager stock purchase and stock review flows.';

COMMENT ON FUNCTION public.get_my_staff_role() IS
  'Stable staff-role lookup for RLS and manager sync. Use staff ids and created_by for scoping, not display-name matching.';

COMMENT ON FUNCTION public.get_my_user_id() IS
  'Stable current-user lookup for RLS. Prefer ids for ownership checks and sync rules.';

COMMENT ON FUNCTION public.check_user_role(text[]) IS
  'Stable role-check helper for consolidated staff RLS policies.';

COMMENT ON FUNCTION public.authorize_staff(text[]) IS
  'Stable authorization helper for staff RPC entry points. Prefer id-based filtering in downstream sync rules.';
