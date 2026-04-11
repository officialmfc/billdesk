-- PowerSync managed-hosting setup for Supabase Postgres.
-- Replace the password before running this in a real environment.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'powersync_role'
  ) THEN
    CREATE ROLE powersync_role
      WITH LOGIN
      PASSWORD 'replace-me-before-running'
      REPLICATION
      BYPASSRLS;
  ELSE
    ALTER ROLE powersync_role
      WITH LOGIN
      PASSWORD 'replace-me-before-running'
      REPLICATION
      BYPASSRLS;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO powersync_role;

GRANT SELECT ON TABLE
  public.users,
  public.mfc_staff,
  public.products,
  public.stock_batches,
  public.daily_bills,
  public.chalans,
  public.sale_transactions,
  public.customer_payments,
  public.seller_payments,
  public.quotes,
  public.quote_items,
  public.customer_balance,
  public.seller_balance,
  public.public_registrations,
  public.system_config
TO powersync_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO powersync_role;
