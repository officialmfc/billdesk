-- Keep the publication explicit so PowerSync only replicates the intended
-- manager read model instead of using a broad FOR ALL TABLES publication.

DROP PUBLICATION IF EXISTS powersync;

CREATE PUBLICATION powersync FOR TABLE
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
  public.system_config;
