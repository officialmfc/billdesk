--
-- PostgreSQL database dump
--

\restrict rVgSbhr9XvHKHCngiT9dnqJDCsBXWTpgUXEf1rrAYWLjUVEW8OcI97rGL0tsW9s

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime_messages_publication;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP PUBLICATION IF EXISTS powersync;
DROP POLICY IF EXISTS "User view own tokens" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "User view own deleted records" ON public.deleted_records;
DROP POLICY IF EXISTS "User read own seller payments" ON public.seller_payments;
DROP POLICY IF EXISTS "User read own seller balance" ON public.seller_balance;
DROP POLICY IF EXISTS "User read own sale transactions (seller)" ON public.sale_transactions;
DROP POLICY IF EXISTS "User read own sale transactions (buyer)" ON public.sale_transactions;
DROP POLICY IF EXISTS "User read own quotes" ON public.quotes;
DROP POLICY IF EXISTS "User read own quote items" ON public.quote_items;
DROP POLICY IF EXISTS "User read own profile" ON public.users;
DROP POLICY IF EXISTS "User read own daily bills" ON public.daily_bills;
DROP POLICY IF EXISTS "User read own customer payments" ON public.customer_payments;
DROP POLICY IF EXISTS "User read own customer balance" ON public.customer_balance;
DROP POLICY IF EXISTS "User read own chalans" ON public.chalans;
DROP POLICY IF EXISTS "Staff read access on users" ON public.users;
DROP POLICY IF EXISTS "Staff read access on system_config" ON public.system_config;
DROP POLICY IF EXISTS "Staff read access on stock_batches" ON public.stock_batches;
DROP POLICY IF EXISTS "Staff read access on seller_payments" ON public.seller_payments;
DROP POLICY IF EXISTS "Staff read access on seller_balance" ON public.seller_balance;
DROP POLICY IF EXISTS "Staff read access on sale_transactions" ON public.sale_transactions;
DROP POLICY IF EXISTS "Staff read access on quotes" ON public.quotes;
DROP POLICY IF EXISTS "Staff read access on quote_items" ON public.quote_items;
DROP POLICY IF EXISTS "Staff read access on public_registrations" ON public.public_registrations;
DROP POLICY IF EXISTS "Staff read access on products" ON public.products;
DROP POLICY IF EXISTS "Staff read access on notification_outbox" ON public.notification_outbox;
DROP POLICY IF EXISTS "Staff read access on mfc_staff" ON public.mfc_staff;
DROP POLICY IF EXISTS "Staff read access on manager_spendings" ON public.manager_spendings;
DROP POLICY IF EXISTS "Staff read access on fcm_device_tokens" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "Staff read access on deleted_records" ON public.deleted_records;
DROP POLICY IF EXISTS "Staff read access on daily_bills" ON public.daily_bills;
DROP POLICY IF EXISTS "Staff read access on customer_payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Staff read access on customer_balance" ON public.customer_balance;
DROP POLICY IF EXISTS "Staff read access on chalans" ON public.chalans;
DROP POLICY IF EXISTS "Staff insert access on users" ON public.users;
DROP POLICY IF EXISTS "Staff insert access on system_config" ON public.system_config;
DROP POLICY IF EXISTS "Staff insert access on stock_batches" ON public.stock_batches;
DROP POLICY IF EXISTS "Staff insert access on seller_payments" ON public.seller_payments;
DROP POLICY IF EXISTS "Staff insert access on seller_balance" ON public.seller_balance;
DROP POLICY IF EXISTS "Staff insert access on sale_transactions" ON public.sale_transactions;
DROP POLICY IF EXISTS "Staff insert access on quotes" ON public.quotes;
DROP POLICY IF EXISTS "Staff insert access on quote_items" ON public.quote_items;
DROP POLICY IF EXISTS "Staff insert access on public_registrations" ON public.public_registrations;
DROP POLICY IF EXISTS "Staff insert access on products" ON public.products;
DROP POLICY IF EXISTS "Staff insert access on manager_spendings" ON public.manager_spendings;
DROP POLICY IF EXISTS "Staff insert access on fcm_device_tokens" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "Staff insert access on deleted_records" ON public.deleted_records;
DROP POLICY IF EXISTS "Staff insert access on daily_bills" ON public.daily_bills;
DROP POLICY IF EXISTS "Staff insert access on customer_payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Staff insert access on customer_balance" ON public.customer_balance;
DROP POLICY IF EXISTS "Staff insert access on chalans" ON public.chalans;
DROP POLICY IF EXISTS "Manager update access on users" ON public.users;
DROP POLICY IF EXISTS "MFC Seller read quote items" ON public.quote_items;
DROP POLICY IF EXISTS "MFC Seller read own stock batches" ON public.stock_batches;
DROP POLICY IF EXISTS "MFC Seller read own sale transactions" ON public.sale_transactions;
DROP POLICY IF EXISTS "MFC Seller read own chalans" ON public.chalans;
DROP POLICY IF EXISTS "MFC Seller read assigned quotes" ON public.quotes;
DROP POLICY IF EXISTS "Authenticated read access on system_config" ON public.system_config;
DROP POLICY IF EXISTS "Authenticated read access on products" ON public.products;
DROP POLICY IF EXISTS "Authenticated read access on mfc_staff" ON public.mfc_staff;
DROP POLICY IF EXISTS "Anyone can insert registration" ON public.public_registrations;
DROP POLICY IF EXISTS "Admin full access on users" ON public.users;
DROP POLICY IF EXISTS "Admin full access on system_config" ON public.system_config;
DROP POLICY IF EXISTS "Admin full access on stock_batches" ON public.stock_batches;
DROP POLICY IF EXISTS "Admin full access on seller_payments" ON public.seller_payments;
DROP POLICY IF EXISTS "Admin full access on seller_balance" ON public.seller_balance;
DROP POLICY IF EXISTS "Admin full access on sale_transactions" ON public.sale_transactions;
DROP POLICY IF EXISTS "Admin full access on quotes" ON public.quotes;
DROP POLICY IF EXISTS "Admin full access on quote_items" ON public.quote_items;
DROP POLICY IF EXISTS "Admin full access on public_registrations" ON public.public_registrations;
DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
DROP POLICY IF EXISTS "Admin full access on notification_outbox" ON public.notification_outbox;
DROP POLICY IF EXISTS "Admin full access on mfc_staff" ON public.mfc_staff;
DROP POLICY IF EXISTS "Admin full access on manager_spendings" ON public.manager_spendings;
DROP POLICY IF EXISTS "Admin full access on fcm_device_tokens" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "Admin full access on deleted_records" ON public.deleted_records;
DROP POLICY IF EXISTS "Admin full access on daily_bills" ON public.daily_bills;
DROP POLICY IF EXISTS "Admin full access on customer_payments" ON public.customer_payments;
DROP POLICY IF EXISTS "Admin full access on customer_balance" ON public.customer_balance;
DROP POLICY IF EXISTS "Admin full access on chalans" ON public.chalans;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_auth_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_batches DROP CONSTRAINT IF EXISTS stock_batches_supplier_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_batches DROP CONSTRAINT IF EXISTS stock_batches_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seller_payments DROP CONSTRAINT IF EXISTS seller_payments_chalan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.seller_balance DROP CONSTRAINT IF EXISTS seller_balance_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_transactions DROP CONSTRAINT IF EXISTS sale_transactions_stock_batch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_transactions DROP CONSTRAINT IF EXISTS sale_transactions_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_transactions DROP CONSTRAINT IF EXISTS sale_transactions_daily_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sale_transactions DROP CONSTRAINT IF EXISTS sale_transactions_chalan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_assigned_mfc_seller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quote_items DROP CONSTRAINT IF EXISTS quote_items_quote_id_fkey;
ALTER TABLE IF EXISTS ONLY public.quote_items DROP CONSTRAINT IF EXISTS quote_items_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.public_registrations DROP CONSTRAINT IF EXISTS public_registrations_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.public_registrations DROP CONSTRAINT IF EXISTS public_registrations_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_outbox DROP CONSTRAINT IF EXISTS notification_outbox_user_auth_id_fkey;
ALTER TABLE IF EXISTS ONLY public.mfc_staff DROP CONSTRAINT IF EXISTS mfc_staff_id_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_spendings DROP CONSTRAINT IF EXISTS manager_spendings_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.manager_spendings DROP CONSTRAINT IF EXISTS manager_spendings_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.stock_batches DROP CONSTRAINT IF EXISTS fk_stock_batches_mfc_seller;
ALTER TABLE IF EXISTS ONLY public.stock_batches DROP CONSTRAINT IF EXISTS fk_stock_batches_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.seller_payments DROP CONSTRAINT IF EXISTS fk_seller_payments_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.sale_transactions DROP CONSTRAINT IF EXISTS fk_sale_transactions_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS fk_quotes_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS fk_products_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS fk_mfc_stock_buyer;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS fk_default_admin;
ALTER TABLE IF EXISTS ONLY public.daily_bills DROP CONSTRAINT IF EXISTS fk_daily_bills_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.customer_payments DROP CONSTRAINT IF EXISTS fk_customer_payments_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.chalans DROP CONSTRAINT IF EXISTS fk_chalans_created_by_mfc_staff;
ALTER TABLE IF EXISTS ONLY public.fcm_device_tokens DROP CONSTRAINT IF EXISTS fcm_device_tokens_user_auth_id_fkey;
ALTER TABLE IF EXISTS ONLY public.daily_bills DROP CONSTRAINT IF EXISTS daily_bills_customer_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_payments DROP CONSTRAINT IF EXISTS customer_payments_daily_bill_id_fkey;
ALTER TABLE IF EXISTS ONLY public.customer_balance DROP CONSTRAINT IF EXISTS customer_balance_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.chalans DROP CONSTRAINT IF EXISTS chalans_seller_id_fkey;
ALTER TABLE IF EXISTS ONLY public.chalans DROP CONSTRAINT IF EXISTS chalans_mfc_seller_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_credentials DROP CONSTRAINT IF EXISTS webauthn_credentials_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_oauth_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_client_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS protect_objects_delete ON storage.objects;
DROP TRIGGER IF EXISTS protect_buckets_delete ON storage.buckets;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP TRIGGER IF EXISTS trigger_update_seller_balance_payment ON public.seller_payments;
DROP TRIGGER IF EXISTS trigger_update_seller_balance_chalan ON public.chalans;
DROP TRIGGER IF EXISTS trigger_update_customer_balance_payment ON public.customer_payments;
DROP TRIGGER IF EXISTS trigger_update_customer_balance_bill ON public.daily_bills;
DROP TRIGGER IF EXISTS trigger_sync_default_admin_on_staff_change ON public.mfc_staff;
DROP TRIGGER IF EXISTS trigger_set_sale_amount ON public.sale_transactions;
DROP TRIGGER IF EXISTS trigger_set_chalan_calcs ON public.chalans;
DROP TRIGGER IF EXISTS trigger_recalc_parents ON public.sale_transactions;
DROP TRIGGER IF EXISTS trg_enqueue_seller_payment_notification ON public.seller_payments;
DROP TRIGGER IF EXISTS trg_enqueue_customer_payment_notification ON public.customer_payments;
DROP TRIGGER IF EXISTS trg_enqueue_chalan_notification ON public.chalans;
DROP TRIGGER IF EXISTS trg_enqueue_bill_notification ON public.daily_bills;
DROP TRIGGER IF EXISTS track_user_deletion ON public.users;
DROP TRIGGER IF EXISTS track_stock_batch_deletion ON public.stock_batches;
DROP TRIGGER IF EXISTS track_staff_deletion ON public.mfc_staff;
DROP TRIGGER IF EXISTS track_seller_payment_deletion ON public.seller_payments;
DROP TRIGGER IF EXISTS track_sale_transaction_deletion ON public.sale_transactions;
DROP TRIGGER IF EXISTS track_registration_deletion ON public.public_registrations;
DROP TRIGGER IF EXISTS track_quote_item_deletion ON public.quote_items;
DROP TRIGGER IF EXISTS track_quote_deletion ON public.quotes;
DROP TRIGGER IF EXISTS track_product_deletion ON public.products;
DROP TRIGGER IF EXISTS track_daily_bill_deletion ON public.daily_bills;
DROP TRIGGER IF EXISTS track_customer_payment_deletion ON public.customer_payments;
DROP TRIGGER IF EXISTS track_chalan_deletion ON public.chalans;
DROP TRIGGER IF EXISTS set_batch_code_trigger ON public.stock_batches;
DROP TRIGGER IF EXISTS on_user_change_notify_user ON public.users;
DROP TRIGGER IF EXISTS on_stock_change_notify_user ON public.stock_batches;
DROP TRIGGER IF EXISTS on_seller_payment_change_notify_user ON public.seller_payments;
DROP TRIGGER IF EXISTS on_sale_tx_change_notify_users ON public.sale_transactions;
DROP TRIGGER IF EXISTS on_quote_item_change_notify_user ON public.quote_items;
DROP TRIGGER IF EXISTS on_quote_change_notify_user ON public.quotes;
DROP TRIGGER IF EXISTS on_delete_notify_user ON public.deleted_records;
DROP TRIGGER IF EXISTS on_customer_payment_change_notify_user ON public.customer_payments;
DROP TRIGGER IF EXISTS on_chalan_change_notify_user ON public.chalans;
DROP TRIGGER IF EXISTS on_bill_change_notify_user ON public.daily_bills;
DROP TRIGGER IF EXISTS initialize_balance_for_new_user ON public.users;
DROP TRIGGER IF EXISTS handle_user_update ON public.users;
DROP TRIGGER IF EXISTS handle_staff_update ON public.mfc_staff;
DROP TRIGGER IF EXISTS handle_seller_payment_update ON public.seller_payments;
DROP TRIGGER IF EXISTS handle_sale_transaction_update ON public.sale_transactions;
DROP TRIGGER IF EXISTS handle_registration_update ON public.public_registrations;
DROP TRIGGER IF EXISTS handle_quote_update ON public.quotes;
DROP TRIGGER IF EXISTS handle_product_update ON public.products;
DROP TRIGGER IF EXISTS handle_customer_payment_update ON public.customer_payments;
DROP TRIGGER IF EXISTS handle_chalan_update ON public.chalans;
DROP TRIGGER IF EXISTS handle_bill_update ON public.daily_bills;
DROP TRIGGER IF EXISTS handle_batch_update ON public.stock_batches;
DROP TRIGGER IF EXISTS enforce_last_admin_exists ON public.mfc_staff;
DROP INDEX IF EXISTS storage.vector_indexes_name_bucket_id_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name_lower;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.buckets_analytics_unique_name_idx;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_action_filter_key;
DROP INDEX IF EXISTS realtime.messages_inserted_at_topic_index;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.mfc_staff_one_default_admin_only;
DROP INDEX IF EXISTS public.idx_users_user_type;
DROP INDEX IF EXISTS public.idx_users_updated_at;
DROP INDEX IF EXISTS public.idx_users_phone;
DROP INDEX IF EXISTS public.idx_users_name;
DROP INDEX IF EXISTS public.idx_users_active_lower_name;
DROP INDEX IF EXISTS public.idx_users_active_lower_business_name;
DROP INDEX IF EXISTS public.idx_users_active;
DROP INDEX IF EXISTS public.idx_stock_batches_updated_at;
DROP INDEX IF EXISTS public.idx_stock_batches_supplier_created_at;
DROP INDEX IF EXISTS public.idx_stock_batches_product;
DROP INDEX IF EXISTS public.idx_stock_batches_mfc_seller;
DROP INDEX IF EXISTS public.idx_stock_batches_current_weight;
DROP INDEX IF EXISTS public.idx_stock_batches_available;
DROP INDEX IF EXISTS public.idx_seller_payments_updated_at;
DROP INDEX IF EXISTS public.idx_seller_payments_payment_date;
DROP INDEX IF EXISTS public.idx_seller_payments_created_by_payment_date;
DROP INDEX IF EXISTS public.idx_seller_payments_chalan;
DROP INDEX IF EXISTS public.idx_seller_balance_current_due;
DROP INDEX IF EXISTS public.idx_sale_transactions_updated_at;
DROP INDEX IF EXISTS public.idx_sale_transactions_stock_batch_id;
DROP INDEX IF EXISTS public.idx_sale_transactions_created_at;
DROP INDEX IF EXISTS public.idx_sale_transactions_chalan;
DROP INDEX IF EXISTS public.idx_sale_transactions_bill;
DROP INDEX IF EXISTS public.idx_quotes_updated_at;
DROP INDEX IF EXISTS public.idx_quotes_status;
DROP INDEX IF EXISTS public.idx_quotes_delivery_date;
DROP INDEX IF EXISTS public.idx_quotes_customer;
DROP INDEX IF EXISTS public.idx_quotes_assigned_mfc_seller_id;
DROP INDEX IF EXISTS public.idx_quotes_active;
DROP INDEX IF EXISTS public.idx_quote_items_quote_id;
DROP INDEX IF EXISTS public.idx_quote_items_product_id;
DROP INDEX IF EXISTS public.idx_public_registrations_status_created_at;
DROP INDEX IF EXISTS public.idx_products_updated_at;
DROP INDEX IF EXISTS public.idx_products_created_by;
DROP INDEX IF EXISTS public.idx_notification_outbox_user_scope;
DROP INDEX IF EXISTS public.idx_notification_outbox_status_created_at;
DROP INDEX IF EXISTS public.idx_notification_outbox_source;
DROP INDEX IF EXISTS public.idx_mfc_staff_updated_at;
DROP INDEX IF EXISTS public.idx_mfc_staff_role;
DROP INDEX IF EXISTS public.idx_mfc_staff_is_active;
DROP INDEX IF EXISTS public.idx_mfc_staff_active_lower_full_name;
DROP INDEX IF EXISTS public.idx_mfc_staff_active;
DROP INDEX IF EXISTS public.idx_manager_spendings_spent_date;
DROP INDEX IF EXISTS public.idx_manager_spendings_created_by_spent_date;
DROP INDEX IF EXISTS public.idx_manager_spendings_category_spent_date;
DROP INDEX IF EXISTS public.idx_fcm_device_tokens_user_auth_id;
DROP INDEX IF EXISTS public.idx_fcm_device_tokens_scope_active;
DROP INDEX IF EXISTS public.idx_deleted_records_table_record;
DROP INDEX IF EXISTS public.idx_deleted_records_table_name;
DROP INDEX IF EXISTS public.idx_deleted_records_synced;
DROP INDEX IF EXISTS public.idx_deleted_records_owner_id;
DROP INDEX IF EXISTS public.idx_deleted_records_deleted_at;
DROP INDEX IF EXISTS public.idx_dashboard_stats_singleton;
DROP INDEX IF EXISTS public.idx_daily_bills_updated_at;
DROP INDEX IF EXISTS public.idx_daily_bills_unpaid;
DROP INDEX IF EXISTS public.idx_daily_bills_status;
DROP INDEX IF EXISTS public.idx_daily_bills_customer_date;
DROP INDEX IF EXISTS public.idx_daily_bills_created_by_bill_date;
DROP INDEX IF EXISTS public.idx_daily_bills_bill_date;
DROP INDEX IF EXISTS public.idx_customer_payments_updated_at;
DROP INDEX IF EXISTS public.idx_customer_payments_payment_date;
DROP INDEX IF EXISTS public.idx_customer_payments_created_by_payment_date;
DROP INDEX IF EXISTS public.idx_customer_payments_bill;
DROP INDEX IF EXISTS public.idx_customer_balance_current_due;
DROP INDEX IF EXISTS public.idx_chalans_updated_at;
DROP INDEX IF EXISTS public.idx_chalans_unpaid;
DROP INDEX IF EXISTS public.idx_chalans_status;
DROP INDEX IF EXISTS public.idx_chalans_seller_date;
DROP INDEX IF EXISTS public.idx_chalans_mfc_seller_id;
DROP INDEX IF EXISTS public.idx_chalans_created_by_chalan_date;
DROP INDEX IF EXISTS public.idx_chalans_chalan_date;
DROP INDEX IF EXISTS auth.webauthn_credentials_user_id_idx;
DROP INDEX IF EXISTS auth.webauthn_credentials_credential_id_key;
DROP INDEX IF EXISTS auth.webauthn_challenges_user_id_idx;
DROP INDEX IF EXISTS auth.webauthn_challenges_expires_at_idx;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_oauth_client_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_consents_user_order_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_user_client_idx;
DROP INDEX IF EXISTS auth.oauth_consents_active_client_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_auth_pending_exp_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_oauth_client_states_created_at;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_provider_type_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_identifier_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_enabled_idx;
DROP INDEX IF EXISTS auth.custom_oauth_providers_created_at_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY supabase_migrations.seed_files DROP CONSTRAINT IF EXISTS seed_files_pkey;
ALTER TABLE IF EXISTS ONLY supabase_migrations.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.vector_indexes DROP CONSTRAINT IF EXISTS vector_indexes_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets_vectors DROP CONSTRAINT IF EXISTS buckets_vectors_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_08 DROP CONSTRAINT IF EXISTS messages_2026_04_08_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_07 DROP CONSTRAINT IF EXISTS messages_2026_04_07_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_06 DROP CONSTRAINT IF EXISTS messages_2026_04_06_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_05 DROP CONSTRAINT IF EXISTS messages_2026_04_05_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_04 DROP CONSTRAINT IF EXISTS messages_2026_04_04_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_03 DROP CONSTRAINT IF EXISTS messages_2026_04_03_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2026_04_02 DROP CONSTRAINT IF EXISTS messages_2026_04_02_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_auth_user_id_key;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS system_config_pkey;
ALTER TABLE IF EXISTS ONLY public.system_config DROP CONSTRAINT IF EXISTS system_config_default_admin_id_key;
ALTER TABLE IF EXISTS ONLY public.stock_batches DROP CONSTRAINT IF EXISTS stock_batches_pkey;
ALTER TABLE IF EXISTS ONLY public.stock_batches DROP CONSTRAINT IF EXISTS stock_batches_batch_code_key;
ALTER TABLE IF EXISTS ONLY public.seller_payments DROP CONSTRAINT IF EXISTS seller_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.seller_balance DROP CONSTRAINT IF EXISTS seller_balance_pkey;
ALTER TABLE IF EXISTS ONLY public.sale_transactions DROP CONSTRAINT IF EXISTS sale_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_quote_number_key;
ALTER TABLE IF EXISTS ONLY public.quotes DROP CONSTRAINT IF EXISTS quotes_pkey;
ALTER TABLE IF EXISTS ONLY public.quote_items DROP CONSTRAINT IF EXISTS quote_items_pkey;
ALTER TABLE IF EXISTS ONLY public.public_registrations DROP CONSTRAINT IF EXISTS public_registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_pkey;
ALTER TABLE IF EXISTS ONLY public.products DROP CONSTRAINT IF EXISTS products_name_key;
ALTER TABLE IF EXISTS ONLY public.notification_outbox DROP CONSTRAINT IF EXISTS notification_outbox_pkey;
ALTER TABLE IF EXISTS ONLY public.mfc_staff DROP CONSTRAINT IF EXISTS mfc_staff_pkey;
ALTER TABLE IF EXISTS ONLY public.manager_spendings DROP CONSTRAINT IF EXISTS manager_spendings_pkey;
ALTER TABLE IF EXISTS ONLY public.fcm_device_tokens DROP CONSTRAINT IF EXISTS fcm_device_tokens_pkey;
ALTER TABLE IF EXISTS ONLY public.fcm_device_tokens DROP CONSTRAINT IF EXISTS fcm_device_tokens_device_token_key;
ALTER TABLE IF EXISTS ONLY public.document_counters DROP CONSTRAINT IF EXISTS document_counters_pkey;
ALTER TABLE IF EXISTS ONLY public.deleted_records DROP CONSTRAINT IF EXISTS deleted_records_table_record_owner_unique;
ALTER TABLE IF EXISTS ONLY public.deleted_records DROP CONSTRAINT IF EXISTS deleted_records_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_bills DROP CONSTRAINT IF EXISTS daily_bills_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_bills DROP CONSTRAINT IF EXISTS daily_bills_customer_id_bill_date_key;
ALTER TABLE IF EXISTS ONLY public.daily_bills DROP CONSTRAINT IF EXISTS daily_bills_bill_number_key;
ALTER TABLE IF EXISTS ONLY public.customer_payments DROP CONSTRAINT IF EXISTS customer_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.customer_balance DROP CONSTRAINT IF EXISTS customer_balance_pkey;
ALTER TABLE IF EXISTS ONLY public.chalans DROP CONSTRAINT IF EXISTS chalans_pkey;
ALTER TABLE IF EXISTS ONLY public.chalans DROP CONSTRAINT IF EXISTS chalans_chalan_number_key;
ALTER TABLE IF EXISTS ONLY auth.webauthn_credentials DROP CONSTRAINT IF EXISTS webauthn_credentials_pkey;
ALTER TABLE IF EXISTS ONLY auth.webauthn_challenges DROP CONSTRAINT IF EXISTS webauthn_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_user_client_unique;
ALTER TABLE IF EXISTS ONLY auth.oauth_consents DROP CONSTRAINT IF EXISTS oauth_consents_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_client_states DROP CONSTRAINT IF EXISTS oauth_client_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_id_key;
ALTER TABLE IF EXISTS ONLY auth.oauth_authorizations DROP CONSTRAINT IF EXISTS oauth_authorizations_authorization_code_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.custom_oauth_providers DROP CONSTRAINT IF EXISTS custom_oauth_providers_identifier_key;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS supabase_migrations.seed_files;
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;
DROP TABLE IF EXISTS storage.vector_indexes;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets_vectors;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages_2026_04_08;
DROP TABLE IF EXISTS realtime.messages_2026_04_07;
DROP TABLE IF EXISTS realtime.messages_2026_04_06;
DROP TABLE IF EXISTS realtime.messages_2026_04_05;
DROP TABLE IF EXISTS realtime.messages_2026_04_04;
DROP TABLE IF EXISTS realtime.messages_2026_04_03;
DROP TABLE IF EXISTS realtime.messages_2026_04_02;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.system_config;
DROP VIEW IF EXISTS public.seller_sales_view;
DROP TABLE IF EXISTS public.seller_payments;
DROP TABLE IF EXISTS public.quotes;
DROP TABLE IF EXISTS public.quote_items;
DROP TABLE IF EXISTS public.public_registrations;
DROP TABLE IF EXISTS public.notification_outbox;
DROP VIEW IF EXISTS public.mfc_seller_sales_view;
DROP TABLE IF EXISTS public.manager_spendings;
DROP TABLE IF EXISTS public.fcm_device_tokens;
DROP TABLE IF EXISTS public.document_counters;
DROP TABLE IF EXISTS public.deleted_records;
DROP MATERIALIZED VIEW IF EXISTS public.dashboard_stats_for_admin;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.stock_batches;
DROP TABLE IF EXISTS public.seller_balance;
DROP SEQUENCE IF EXISTS public.daily_batch_sequence;
DROP TABLE IF EXISTS public.customer_payments;
DROP TABLE IF EXISTS public.customer_balance;
DROP VIEW IF EXISTS public.buyer_sales_view;
DROP TABLE IF EXISTS public.sale_transactions;
DROP TABLE IF EXISTS public.products;
DROP TABLE IF EXISTS public.mfc_staff;
DROP TABLE IF EXISTS public.daily_bills;
DROP TABLE IF EXISTS public.chalans;
DROP TABLE IF EXISTS auth.webauthn_credentials;
DROP TABLE IF EXISTS auth.webauthn_challenges;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_consents;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.oauth_client_states;
DROP TABLE IF EXISTS auth.oauth_authorizations;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.custom_oauth_providers;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.protect_delete();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.delete_leaf_prefixes(bucket_ids text[], names text[]);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.update_seller_balance();
DROP FUNCTION IF EXISTS public.update_my_profile(p_name text, p_business_name text, p_phone text, p_address jsonb, p_default_role public.default_role);
DROP FUNCTION IF EXISTS public.update_customer_balance();
DROP FUNCTION IF EXISTS public.trigger_set_sale_transaction_amount();
DROP FUNCTION IF EXISTS public.trigger_set_chalan_calculations();
DROP FUNCTION IF EXISTS public.trigger_recalculate_financials_from_sale();
DROP FUNCTION IF EXISTS public.track_deletion();
DROP FUNCTION IF EXISTS public.sync_system_config_default_admin();
DROP FUNCTION IF EXISTS public.submit_specific_bill_payment(p_daily_bill_id uuid, p_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date);
DROP FUNCTION IF EXISTS public.submit_seller_payout(p_chalan_id uuid, p_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date);
DROP FUNCTION IF EXISTS public.submit_lump_sum_payment(p_customer_id uuid, p_total_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date);
DROP FUNCTION IF EXISTS public.set_stock_batch_code();
DROP FUNCTION IF EXISTS public.reject_registration(p_registration_id uuid);
DROP FUNCTION IF EXISTS public.register_fcm_token(p_device_token text, p_app_scope text, p_platform text);
DROP FUNCTION IF EXISTS public.purge_old_deletions();
DROP FUNCTION IF EXISTS public.purchase_stock_from_seller(p_seller_id uuid, p_commission_percentage numeric, p_mfc_seller_id_to_assign uuid, p_purchase_items jsonb, p_purchase_date date);
DROP FUNCTION IF EXISTS public.prevent_last_default_admin_removal();
DROP FUNCTION IF EXISTS public.notify_user_of_record_change();
DROP FUNCTION IF EXISTS public.mark_deletions_synced(p_deletion_ids uuid[]);
DROP FUNCTION IF EXISTS public.log_quote_advance(p_quote_id uuid, p_amount_paid numeric);
DROP FUNCTION IF EXISTS public.initialize_user_balance();
DROP FUNCTION IF EXISTS public.handle_new_user_signup();
DROP FUNCTION IF EXISTS public.handle_audit_stamps();
DROP FUNCTION IF EXISTS public.get_user_profile(p_user_id uuid);
DROP FUNCTION IF EXISTS public.get_staff_profile(p_staff_id uuid);
DROP FUNCTION IF EXISTS public.get_recently_updated(p_table_name text, p_minutes integer);
DROP FUNCTION IF EXISTS public.get_or_create_daily_bill(p_customer_id uuid, p_bill_date date, p_created_by uuid);
DROP FUNCTION IF EXISTS public.get_my_user_id();
DROP FUNCTION IF EXISTS public.get_my_staff_role();
DROP FUNCTION IF EXISTS public.get_current_mfc_seller_profile();
DROP FUNCTION IF EXISTS public.get_current_manager_info();
DROP FUNCTION IF EXISTS public.get_current_admin_profile();
DROP FUNCTION IF EXISTS public.get_auth_id_or_default();
DROP FUNCTION IF EXISTS public.get_admin_recent_days(p_days integer);
DROP FUNCTION IF EXISTS public.get_admin_manager_breakdown(p_date date);
DROP FUNCTION IF EXISTS public.get_admin_insight_snapshot(p_date date);
DROP FUNCTION IF EXISTS public.generate_document_number(p_document_type text, p_document_date date);
DROP FUNCTION IF EXISTS public.enqueue_user_notification_outbox();
DROP FUNCTION IF EXISTS public.debug_rls_status();
DROP FUNCTION IF EXISTS public.create_user_as_staff(p_email text, p_password text, p_full_name text, p_business_name text, p_phone text, p_user_type public.user_type, p_default_role public.default_role, p_address jsonb, p_profile_photo_url text);
DROP FUNCTION IF EXISTS public.create_stock_batches(p_batches jsonb);
DROP FUNCTION IF EXISTS public.create_seller_batch_sale(p_mfc_seller_id uuid, p_sale_items jsonb, p_sale_date date);
DROP FUNCTION IF EXISTS public.create_sale_for_single_customer(p_buyer_id uuid, p_sale_items jsonb, p_sale_date date);
DROP FUNCTION IF EXISTS public.create_quote(p_customer_id uuid, p_assigned_mfc_seller_id uuid, p_delivery_date date, p_quote_number text, p_items jsonb, p_notes text);
DROP FUNCTION IF EXISTS public.create_manager_spending(p_title text, p_amount numeric, p_spent_date date, p_category text, p_note text, p_payment_method public.payment_method_enum);
DROP FUNCTION IF EXISTS public.create_floor_sale(p_sale_items jsonb, p_sale_date date);
DROP FUNCTION IF EXISTS public.create_auction_sale(p_seller_id uuid, p_sale_items jsonb, p_commission_percentage numeric, p_paid_amount numeric, p_chalan_date date);
DROP FUNCTION IF EXISTS public.cleanup_pending_registrations();
DROP FUNCTION IF EXISTS public.check_user_role(required_roles text[]);
DROP FUNCTION IF EXISTS public.authorize_staff(p_required_roles text[]);
DROP FUNCTION IF EXISTS public.approve_user(p_registration_id uuid, p_default_role public.default_role, p_user_type public.user_type, p_address jsonb, p_profile_photo_url text);
DROP FUNCTION IF EXISTS public._next_document_counter_value(p_document_type text, p_counter_date date);
DROP FUNCTION IF EXISTS public._internal_validate_stock_availability(p_sale_items jsonb);
DROP FUNCTION IF EXISTS public._internal_create_sale_and_update_stock(p_daily_bill_id uuid, p_chalan_id uuid, p_staff_id uuid, p_sale_item jsonb);
DROP FUNCTION IF EXISTS public._get_current_staff_profile_by_role(p_role public.staff_type);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS public.user_type;
DROP TYPE IF EXISTS public.staff_type;
DROP TYPE IF EXISTS public.sale_type;
DROP TYPE IF EXISTS public.registration_status;
DROP TYPE IF EXISTS public.quote_status;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method_enum;
DROP TYPE IF EXISTS public.default_role;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_response_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.oauth_client_type;
DROP TYPE IF EXISTS auth.oauth_authorization_status;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS supabase_migrations;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
-- *not* dropping schema, since initdb creates it
DROP SCHEMA IF EXISTS pgbouncer;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP EXTENSION IF EXISTS pg_cron;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: default_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.default_role AS ENUM (
    'buyer',
    'seller'
);


--
-- Name: payment_method_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_method_enum AS ENUM (
    'cash',
    'bank_transfer',
    'card',
    'upi',
    'initial_payout'
);


--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'due',
    'partially_paid',
    'paid'
);


--
-- Name: quote_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.quote_status AS ENUM (
    'pending',
    'confirmed',
    'delivered',
    'cancelled'
);


--
-- Name: registration_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.registration_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: sale_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sale_type AS ENUM (
    'auction',
    'direct_sell'
);


--
-- Name: staff_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.staff_type AS ENUM (
    'admin',
    'manager',
    'mfc_seller'
);


--
-- Name: user_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_type AS ENUM (
    'vendor',
    'business'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: _get_current_staff_profile_by_role(public.staff_type); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._get_current_staff_profile_by_role(p_role public.staff_type) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
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


--
-- Name: _internal_create_sale_and_update_stock(uuid, uuid, uuid, jsonb); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: _internal_validate_stock_availability(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: _next_document_counter_value(text, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._next_document_counter_value(p_document_type text, p_counter_date date) RETURNS integer
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


--
-- Name: approve_user(uuid, public.default_role, public.user_type, jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.approve_user(p_registration_id uuid, p_default_role public.default_role, p_user_type public.user_type, p_address jsonb DEFAULT NULL::jsonb, p_profile_photo_url text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: authorize_staff(text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.authorize_staff(p_required_roles text[]) RETURNS void
    LANGUAGE plpgsql STABLE SECURITY DEFINER
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


--
-- Name: FUNCTION authorize_staff(p_required_roles text[]); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.authorize_staff(p_required_roles text[]) IS 'Stable authorization helper for staff RPC entry points. Prefer id-based filtering in downstream sync rules.';


--
-- Name: check_user_role(text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_user_role(required_roles text[]) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.get_my_staff_role() = ANY(required_roles)
$$;


--
-- Name: FUNCTION check_user_role(required_roles text[]); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.check_user_role(required_roles text[]) IS 'Stable role-check helper for consolidated staff RLS policies.';


--
-- Name: cleanup_pending_registrations(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: create_auction_sale(uuid, jsonb, numeric, numeric, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_auction_sale(p_seller_id uuid, p_sale_items jsonb, p_commission_percentage numeric DEFAULT 6.0, p_paid_amount numeric DEFAULT NULL::numeric, p_chalan_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
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


--
-- Name: create_floor_sale(jsonb, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_floor_sale(p_sale_items jsonb, p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS jsonb
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


--
-- Name: create_manager_spending(text, numeric, date, text, text, public.payment_method_enum); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_manager_spending(p_title text, p_amount numeric, p_spent_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date, p_category text DEFAULT 'general'::text, p_note text DEFAULT NULL::text, p_payment_method public.payment_method_enum DEFAULT 'cash'::public.payment_method_enum) RETURNS uuid
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


--
-- Name: create_quote(uuid, uuid, date, text, jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_quote(p_customer_id uuid, p_assigned_mfc_seller_id uuid, p_delivery_date date, p_quote_number text, p_items jsonb, p_notes text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: create_sale_for_single_customer(uuid, jsonb, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_sale_for_single_customer(p_buyer_id uuid, p_sale_items jsonb, p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
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


--
-- Name: create_seller_batch_sale(uuid, jsonb, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_seller_batch_sale(p_mfc_seller_id uuid, p_sale_items jsonb, p_sale_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
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


--
-- Name: create_stock_batches(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_stock_batches(p_batches jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: FUNCTION create_stock_batches(p_batches jsonb); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.create_stock_batches(p_batches jsonb) IS 'Creates stock batches with authorization check. Can create new products if product_name is provided without product_id. Only accessible by admin and manager roles.';


--
-- Name: create_user_as_staff(text, text, text, text, text, public.user_type, public.default_role, jsonb, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_as_staff(p_email text, p_password text, p_full_name text, p_business_name text, p_phone text, p_user_type public.user_type, p_default_role public.default_role, p_address jsonb DEFAULT NULL::jsonb, p_profile_photo_url text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: debug_rls_status(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: enqueue_user_notification_outbox(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.enqueue_user_notification_outbox() RETURNS trigger
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


--
-- Name: generate_document_number(text, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_document_number(p_document_type text, p_document_date date) RETURNS text
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


--
-- Name: FUNCTION generate_document_number(p_document_type text, p_document_date date); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.generate_document_number(p_document_type text, p_document_date date) IS 'Generates business document numbers using date-scoped counters instead of global sequences.';


--
-- Name: get_admin_insight_snapshot(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_insight_snapshot(p_date date) RETURNS TABLE(selected_date date, total_sales numeric, total_collection numeric, total_spend numeric, total_chalans bigint, total_payable numeric, total_bills bigint)
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


--
-- Name: get_admin_manager_breakdown(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_manager_breakdown(p_date date) RETURNS TABLE(staff_id uuid, manager_name text, staff_role public.staff_type, sales_total numeric, collection_total numeric, spend_total numeric, chalan_count bigint, payable_total numeric, bill_count bigint)
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


--
-- Name: get_admin_recent_days(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_admin_recent_days(p_days integer DEFAULT 7) RETURNS TABLE(snapshot_date date, total_sales numeric, total_collection numeric, total_spend numeric, total_chalans bigint, total_payable numeric, total_bills bigint)
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


--
-- Name: get_auth_id_or_default(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: get_current_admin_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_admin_profile() RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public._get_current_staff_profile_by_role('admin')
$$;


--
-- Name: get_current_manager_info(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_manager_info() RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public._get_current_staff_profile_by_role('manager')
$$;


--
-- Name: get_current_mfc_seller_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_current_mfc_seller_profile() RETURNS jsonb
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public._get_current_staff_profile_by_role('mfc_seller')
$$;


--
-- Name: get_my_staff_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_staff_role() RETURNS text
    LANGUAGE plpgsql STABLE SECURITY DEFINER
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


--
-- Name: FUNCTION get_my_staff_role(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_my_staff_role() IS 'Stable staff-role lookup for RLS and manager sync. Use staff ids and created_by for scoping, not display-name matching.';


--
-- Name: get_my_user_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_my_user_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT id
  FROM public.users
  WHERE auth_user_id = auth.uid()
  LIMIT 1
$$;


--
-- Name: FUNCTION get_my_user_id(); Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON FUNCTION public.get_my_user_id() IS 'Stable current-user lookup for RLS. Prefer ids for ownership checks and sync rules.';


--
-- Name: get_or_create_daily_bill(uuid, date, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_or_create_daily_bill(p_customer_id uuid, p_bill_date date, p_created_by uuid) RETURNS uuid
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


--
-- Name: get_recently_updated(text, integer); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: get_staff_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_staff_profile(p_staff_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: get_user_profile(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_profile(p_user_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: handle_audit_stamps(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_audit_stamps() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  NEW.updated_at := timezone('Asia/Kolkata', now());
  NEW.updated_by := public.get_auth_id_or_default();
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_signup(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: initialize_user_balance(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.initialize_user_balance() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.customer_balance (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.seller_balance (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: log_quote_advance(uuid, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_quote_advance(p_quote_id uuid, p_amount_paid numeric) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: mark_deletions_synced(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: notify_user_of_record_change(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: prevent_last_default_admin_removal(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: purchase_stock_from_seller(uuid, numeric, uuid, jsonb, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.purchase_stock_from_seller(p_seller_id uuid, p_commission_percentage numeric, p_mfc_seller_id_to_assign uuid, p_purchase_items jsonb, p_purchase_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
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


--
-- Name: purge_old_deletions(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: register_fcm_token(text, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.register_fcm_token(p_device_token text, p_app_scope text DEFAULT 'manager'::text, p_platform text DEFAULT 'android'::text) RETURNS void
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


--
-- Name: reject_registration(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reject_registration(p_registration_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);
  DELETE FROM auth.users WHERE id = p_registration_id;
END;
$$;


--
-- Name: set_stock_batch_code(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: submit_lump_sum_payment(uuid, numeric, public.payment_method_enum, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_lump_sum_payment(p_customer_id uuid, p_total_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
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


--
-- Name: submit_seller_payout(uuid, numeric, public.payment_method_enum, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_seller_payout(p_chalan_id uuid, p_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS uuid
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


--
-- Name: submit_specific_bill_payment(uuid, numeric, public.payment_method_enum, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.submit_specific_bill_payment(p_daily_bill_id uuid, p_amount numeric, p_payment_method public.payment_method_enum, p_payment_date date DEFAULT (timezone('Asia/Kolkata'::text, now()))::date) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_staff_role TEXT;
  v_bill record;
  v_new_payment_id uuid;
  v_new_amount_paid numeric;
  v_new_status public.payment_status;
  v_amount_due numeric;
BEGIN
  PERFORM public.authorize_staff(ARRAY['admin', 'manager']);

  SELECT * INTO v_bill
  FROM public.daily_bills
  WHERE id = p_daily_bill_id
  FOR UPDATE;

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
  SET amount_paid = v_new_amount_paid,
      status = v_new_status
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


--
-- Name: sync_system_config_default_admin(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: track_deletion(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: trigger_recalculate_financials_from_sale(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: trigger_set_chalan_calculations(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: trigger_set_sale_transaction_amount(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_sale_transaction_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.amount = NEW.weight_kg * NEW.price_per_kg;
  RETURN NEW;
END;
$$;


--
-- Name: update_customer_balance(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: update_my_profile(text, text, text, jsonb, public.default_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_my_profile(p_name text DEFAULT NULL::text, p_business_name text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_address jsonb DEFAULT NULL::jsonb, p_default_role public.default_role DEFAULT NULL::public.default_role) RETURNS jsonb
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


--
-- Name: update_seller_balance(); Type: FUNCTION; Schema: public; Owner: -
--

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


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


--
-- Name: chalans; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: daily_bills; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: mfc_staff; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: sale_transactions; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: buyer_sales_view; Type: VIEW; Schema: public; Owner: -
--

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


--
-- Name: customer_balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_balance (
    user_id uuid NOT NULL,
    total_billed numeric DEFAULT 0 NOT NULL,
    total_paid numeric DEFAULT 0 NOT NULL,
    current_due numeric DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.customer_balance FORCE ROW LEVEL SECURITY;


--
-- Name: customer_payments; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: daily_batch_sequence; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_batch_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: seller_balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seller_balance (
    user_id uuid NOT NULL,
    total_earned numeric DEFAULT 0 NOT NULL,
    total_paid_out numeric DEFAULT 0 NOT NULL,
    current_due numeric DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL
);

ALTER TABLE ONLY public.seller_balance FORCE ROW LEVEL SECURITY;


--
-- Name: stock_batches; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: dashboard_stats_for_admin; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

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


--
-- Name: deleted_records; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: document_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_counters (
    document_type text NOT NULL,
    counter_date date NOT NULL,
    last_number integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    CONSTRAINT document_counters_document_type_check CHECK ((document_type = ANY (ARRAY['auction_chalan'::text, 'batch_chalan'::text, 'bill'::text, 'floor_chalan'::text, 'purchase_chalan'::text, 'single_chalan'::text])))
);


--
-- Name: TABLE document_counters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.document_counters IS 'Date-scoped counters for generated business documents. Replaces legacy global sequences and reset jobs.';


--
-- Name: COLUMN document_counters.document_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.document_counters.document_type IS 'Document family: bill, auction_chalan, purchase_chalan, single_chalan, batch_chalan, or floor_chalan.';


--
-- Name: COLUMN document_counters.counter_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.document_counters.counter_date IS 'Business date for the generated sequence, stored in Asia/Kolkata date terms.';


--
-- Name: COLUMN document_counters.last_number; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.document_counters.last_number IS 'Most recently issued number for this document type on this date.';


--
-- Name: fcm_device_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fcm_device_tokens (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_auth_id uuid NOT NULL,
    device_token text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    app_scope text DEFAULT 'manager'::text NOT NULL,
    platform text DEFAULT 'android'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    last_seen_at timestamp with time zone DEFAULT timezone('Asia/Kolkata'::text, now()) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT fcm_device_tokens_app_scope_check CHECK ((app_scope = ANY (ARRAY['manager'::text, 'admin'::text, 'user'::text]))),
    CONSTRAINT fcm_device_tokens_platform_check CHECK ((platform = ANY (ARRAY['android'::text, 'ios'::text, 'web'::text, 'desktop'::text])))
);

ALTER TABLE ONLY public.fcm_device_tokens FORCE ROW LEVEL SECURITY;


--
-- Name: manager_spendings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_spendings (
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

ALTER TABLE ONLY public.manager_spendings FORCE ROW LEVEL SECURITY;


--
-- Name: mfc_seller_sales_view; Type: VIEW; Schema: public; Owner: -
--

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


--
-- Name: notification_outbox; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_outbox (
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
    CONSTRAINT notification_outbox_app_scope_check CHECK ((app_scope = ANY (ARRAY['user'::text, 'manager'::text, 'admin'::text]))),
    CONSTRAINT notification_outbox_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text])))
);

ALTER TABLE ONLY public.notification_outbox FORCE ROW LEVEL SECURITY;


--
-- Name: public_registrations; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: quotes; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: seller_payments; Type: TABLE; Schema: public; Owner: -
--

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


--
-- Name: seller_sales_view; Type: VIEW; Schema: public; Owner: -
--

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


--
-- Name: system_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_config (
    id integer DEFAULT 1 NOT NULL,
    default_admin_id uuid NOT NULL,
    mfc_stock_buyer_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid NOT NULL,
    CONSTRAINT system_config_id_check CHECK ((id = 1))
);

ALTER TABLE ONLY public.system_config FORCE ROW LEVEL SECURITY;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2026_04_02; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_04_03; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_04_04; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_04_05; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_04_06; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_04_07; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2026_04_08; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2026_04_08 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: messages_2026_04_02; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_02 FOR VALUES FROM ('2026-04-02 00:00:00') TO ('2026-04-03 00:00:00');


--
-- Name: messages_2026_04_03; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_03 FOR VALUES FROM ('2026-04-03 00:00:00') TO ('2026-04-04 00:00:00');


--
-- Name: messages_2026_04_04; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_04 FOR VALUES FROM ('2026-04-04 00:00:00') TO ('2026-04-05 00:00:00');


--
-- Name: messages_2026_04_05; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_05 FOR VALUES FROM ('2026-04-05 00:00:00') TO ('2026-04-06 00:00:00');


--
-- Name: messages_2026_04_06; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_06 FOR VALUES FROM ('2026-04-06 00:00:00') TO ('2026-04-07 00:00:00');


--
-- Name: messages_2026_04_07; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_07 FOR VALUES FROM ('2026-04-07 00:00:00') TO ('2026-04-08 00:00:00');


--
-- Name: messages_2026_04_08; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_04_08 FOR VALUES FROM ('2026-04-08 00:00:00') TO ('2026-04-09 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	ed60d2d9-d49f-444c-9c10-0c843cd2d1a3	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"manager@test.local","user_id":"8d124f7d-8eab-4be6-a1d7-55bcdc34753d","user_phone":""}}	2025-11-09 17:52:16.148044+00	
00000000-0000-0000-0000-000000000000	1bd9c934-ab82-4a06-a876-2ffbf77fca1f	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"asmatbyte@gmail.com","user_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","user_phone":""}}	2025-11-09 17:52:42.267382+00	
00000000-0000-0000-0000-000000000000	f172a1bf-34de-41d0-903b-fb557ad7b65c	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"seller@test.local","user_id":"c0044c8b-cf12-4613-bdb1-40749779b927","user_phone":""}}	2025-11-09 17:53:11.444033+00	
00000000-0000-0000-0000-000000000000	44073d47-036e-4211-8a66-4014e8871b01	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"mondalfishcenter2005@gmail.com","user_id":"38322fdd-1346-4f01-9325-955d246a89af","user_phone":""}}	2025-11-09 17:53:50.328335+00	
00000000-0000-0000-0000-000000000000	7d42d5d0-7b30-4b0a-b2f8-db499a843b4b	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"manager2@test.local","user_id":"6308420e-5192-4590-967d-d69c8e93aa75","user_phone":""}}	2025-11-09 18:05:47.797676+00	
00000000-0000-0000-0000-000000000000	184bdd78-2e06-46d3-9cb9-8f4054ef98f9	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:06:52.249243+00	
00000000-0000-0000-0000-000000000000	8a398a19-6a0a-49fd-afd3-b1d052b46359	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:06:53.585678+00	
00000000-0000-0000-0000-000000000000	f31d440d-69df-406b-889b-cfb8c5f288ff	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:07:00.454988+00	
00000000-0000-0000-0000-000000000000	9b753adf-8588-48ab-8f4a-f38cf230698b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:07:00.786639+00	
00000000-0000-0000-0000-000000000000	3894e3d0-3da2-448d-bc85-84b4edc6433e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:07:07.656612+00	
00000000-0000-0000-0000-000000000000	20db7669-b339-413a-afba-c97fd4e31dfe	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:07:08.017625+00	
00000000-0000-0000-0000-000000000000	8fda6565-dae4-47a5-9855-3e5e43b0add1	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:07:09.785264+00	
00000000-0000-0000-0000-000000000000	ad6d11fa-7120-4a84-9460-e9342a70fb96	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:07:10.146961+00	
00000000-0000-0000-0000-000000000000	b4f2d48d-0516-4a84-a628-bb8030340047	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:07:11.335847+00	
00000000-0000-0000-0000-000000000000	ba3f33ac-903b-4767-8d07-a0548d57beb0	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:07:11.707385+00	
00000000-0000-0000-0000-000000000000	d0b0f43a-ccf9-4f76-be5c-1e62e1996d72	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:07:22.517948+00	
00000000-0000-0000-0000-000000000000	5caa4b1e-ba50-4647-8336-e3a7c144cf18	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:07:22.91435+00	
00000000-0000-0000-0000-000000000000	76c0f6d6-9396-4ce5-bbb1-254bf0755536	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:07:44.20909+00	
00000000-0000-0000-0000-000000000000	f96d2e3a-6635-453a-8528-5e2ec178404b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:07:44.553789+00	
00000000-0000-0000-0000-000000000000	e2c4335f-6da9-41df-ad8b-bf6f08fcaf68	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:08:30.383515+00	
00000000-0000-0000-0000-000000000000	51395083-8655-4ed1-9cb3-6894f39daffc	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:08:30.783228+00	
00000000-0000-0000-0000-000000000000	086b0439-9b57-4931-8467-7456e2f4717a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:08:38.652418+00	
00000000-0000-0000-0000-000000000000	d8425779-d039-415b-820d-bc8d60a660fe	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:08:39.223776+00	
00000000-0000-0000-0000-000000000000	b2414f84-bd72-4517-a235-67d25eb196e9	{"action":"login","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:16:41.43855+00	
00000000-0000-0000-0000-000000000000	5e55d705-751f-492b-9ba2-24ba4898ed34	{"action":"logout","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:16:42.010609+00	
00000000-0000-0000-0000-000000000000	6688ac31-771f-452f-a10d-c766db608ba5	{"action":"login","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:17:06.795994+00	
00000000-0000-0000-0000-000000000000	7c81a8bc-6fc4-4fce-9b83-58b8b7d4d10b	{"action":"logout","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:17:07.157049+00	
00000000-0000-0000-0000-000000000000	52bd87ea-8cb7-4a74-950b-83dd6d608c5f	{"action":"login","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:17:15.315036+00	
00000000-0000-0000-0000-000000000000	a0648133-1904-413c-b647-02ca9f622bac	{"action":"logout","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:17:15.674043+00	
00000000-0000-0000-0000-000000000000	6d9a06dd-07eb-4143-b6f4-04ab6591d2a8	{"action":"login","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:17:26.743168+00	
00000000-0000-0000-0000-000000000000	6bd77490-f12e-4d8d-9656-d4a1d2c39fd0	{"action":"logout","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:17:27.212981+00	
00000000-0000-0000-0000-000000000000	1addc46f-b1e0-4eeb-82a0-1dec7dcbce9f	{"action":"login","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:20:51.997581+00	
00000000-0000-0000-0000-000000000000	23632b9c-cb9e-4868-85b3-53bd2391e158	{"action":"logout","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:20:53.054642+00	
00000000-0000-0000-0000-000000000000	bed386fe-d3e4-4d5f-8695-f14939b55958	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:25:53.755492+00	
00000000-0000-0000-0000-000000000000	cf1f92ab-7b65-4a4f-9aec-1d7df43f9f72	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:25:54.223412+00	
00000000-0000-0000-0000-000000000000	81fb51b3-b54a-4549-a248-2745a7d73548	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:31:25.60829+00	
00000000-0000-0000-0000-000000000000	9c33aa00-fd0c-48b1-b5da-d8ddbb049b46	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:31:25.620228+00	
00000000-0000-0000-0000-000000000000	f27a7a81-e205-49e0-bf1d-2071ca18063a	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:31:25.997636+00	
00000000-0000-0000-0000-000000000000	aa2f89fa-9be6-4bfb-87b9-c13343b6dd98	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:32:35.283453+00	
00000000-0000-0000-0000-000000000000	3aa5a06c-37f0-425c-a898-f4724cade451	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:32:35.870305+00	
00000000-0000-0000-0000-000000000000	2e4f0a5f-6444-4631-a84b-438676dc8737	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:33:02.207018+00	
00000000-0000-0000-0000-000000000000	9bd71058-7754-4661-8845-74ac200afc03	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 18:33:02.509976+00	
00000000-0000-0000-0000-000000000000	95abf393-47f9-4e4d-8a35-fee962f26996	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:37:37.477297+00	
00000000-0000-0000-0000-000000000000	9300e9ff-70f3-43e8-a960-603b7d820b45	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-09 18:57:55.416242+00	
00000000-0000-0000-0000-000000000000	1e2b517e-faf8-4b6b-87d8-d21bd598460e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-09 20:46:31.211938+00	
00000000-0000-0000-0000-000000000000	c482204e-a0a2-44ca-910a-3f2a4ea8fa80	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-09 20:46:31.239292+00	
00000000-0000-0000-0000-000000000000	fc8a0089-9afb-410b-88d1-d521323e546c	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-09 20:46:33.645112+00	
00000000-0000-0000-0000-000000000000	4479fbe1-25ba-404a-853f-24270c83a62b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 06:10:05.509038+00	
00000000-0000-0000-0000-000000000000	6f311ef3-73a1-4612-833c-59e894179e9d	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 06:10:06.870045+00	
00000000-0000-0000-0000-000000000000	586ff909-44e0-4f76-be45-0602673047dd	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 06:13:02.140734+00	
00000000-0000-0000-0000-000000000000	f307850f-2371-4d46-85a0-73477cc3fd18	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 06:13:02.8599+00	
00000000-0000-0000-0000-000000000000	537561c2-19fc-4235-9b98-e1933b62f30b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 06:19:08.180311+00	
00000000-0000-0000-0000-000000000000	4669526a-fc38-459e-82c3-85f3576f8651	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 06:19:09.280194+00	
00000000-0000-0000-0000-000000000000	23d9d024-9fc5-48c8-9094-8adbcd7ec13d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 06:45:20.591624+00	
00000000-0000-0000-0000-000000000000	de8ead46-c179-4cdf-aa87-fe46a8585fad	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 06:45:21.933276+00	
00000000-0000-0000-0000-000000000000	ba1a0400-ce86-44b2-943a-c3b42fa4c6e3	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 06:47:26.834207+00	
00000000-0000-0000-0000-000000000000	9a0e3e58-e1bf-4f8e-94a1-c012ed244801	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 06:47:27.478002+00	
00000000-0000-0000-0000-000000000000	f7d11792-f107-455d-8b18-d6699a4126a4	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 06:57:07.048166+00	
00000000-0000-0000-0000-000000000000	dffef18d-1701-4254-84f7-c6db0393400c	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 06:57:07.886325+00	
00000000-0000-0000-0000-000000000000	0a345ba2-81c3-48be-bdcd-3da9d997a1ed	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 07:36:02.725819+00	
00000000-0000-0000-0000-000000000000	9ef99519-e6b4-4ad7-abd1-bb47df91ae7e	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 07:36:03.840031+00	
00000000-0000-0000-0000-000000000000	07e15fa4-78ce-4657-875a-68bd5a62336b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 07:36:09.099115+00	
00000000-0000-0000-0000-000000000000	c634279e-955a-4120-b91f-6cc7fb153971	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 07:36:09.67957+00	
00000000-0000-0000-0000-000000000000	7f084eb2-5fd2-4bc6-b33f-3c5ccd2b9cf4	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 07:36:45.813318+00	
00000000-0000-0000-0000-000000000000	5a450f86-9849-45bf-9c1a-2f699b4631f8	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 07:36:46.330117+00	
00000000-0000-0000-0000-000000000000	8f675e46-8526-4007-af53-60442ac439e5	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 07:37:32.039107+00	
00000000-0000-0000-0000-000000000000	f203c6c9-bdbb-434c-b400-9bbd8422054b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 07:37:32.515459+00	
00000000-0000-0000-0000-000000000000	0dbb4151-5e8c-49fb-ba76-43f4115df884	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 08:19:47.216405+00	
00000000-0000-0000-0000-000000000000	eb270c17-cfd5-40f8-9712-3e7222fe46b9	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-10 12:38:06.446768+00	
00000000-0000-0000-0000-000000000000	ba7f4b83-bdd1-4d1a-a73d-ecc78aa8494a	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-10 12:38:06.470207+00	
00000000-0000-0000-0000-000000000000	7f89707d-747b-4058-87bb-5eb06c6dca58	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 12:38:09.781556+00	
00000000-0000-0000-0000-000000000000	907a0ca6-382b-4813-a70a-9e760a72573c	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 13:00:31.888737+00	
00000000-0000-0000-0000-000000000000	83a49c05-2a3c-4e92-a915-11d21f0b6d62	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-10 14:02:19.18123+00	
00000000-0000-0000-0000-000000000000	a048aaea-a335-4f97-b904-3391bd87b2eb	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-10 14:02:19.191275+00	
00000000-0000-0000-0000-000000000000	7572ebec-32f3-4b0d-b30c-b49bd4e0dd40	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 14:02:20.207351+00	
00000000-0000-0000-0000-000000000000	f7588e4e-deeb-4132-a642-c3a30c39cdd5	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:06:30.96585+00	
00000000-0000-0000-0000-000000000000	1717322b-af1f-4579-8be1-9a270f87d0b4	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:06:33.304983+00	
00000000-0000-0000-0000-000000000000	93764a91-950e-4f05-9225-084f5e49def4	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:06:51.780484+00	
00000000-0000-0000-0000-000000000000	bf6b2a00-6267-46e1-8970-a75defa48fe7	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:06:52.657341+00	
00000000-0000-0000-0000-000000000000	d3c16b23-04c0-45d3-9790-4fb83eff2400	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:25:00.362414+00	
00000000-0000-0000-0000-000000000000	b95a796c-2eb6-43bf-8aed-b53dcbabe522	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:25:04.87165+00	
00000000-0000-0000-0000-000000000000	8f4b5db2-266d-49bd-b327-15eae5936db9	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:25:07.563813+00	
00000000-0000-0000-0000-000000000000	d70402a6-a4ca-41f6-a128-e7019befa0a2	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:25:08.471+00	
00000000-0000-0000-0000-000000000000	b594dab6-cfa3-4a04-8552-f82e152c6a52	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:34:25.233667+00	
00000000-0000-0000-0000-000000000000	3485d865-7844-4935-845b-133dc3a024be	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:34:26.160717+00	
00000000-0000-0000-0000-000000000000	53fa573a-daf2-4a6c-907a-3fd2da4e0ec6	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:35:57.560058+00	
00000000-0000-0000-0000-000000000000	0ca5904f-5eed-47b9-af4b-6f8ce74d7743	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:35:59.460544+00	
00000000-0000-0000-0000-000000000000	590d659a-6751-4062-b7e0-26987e89862e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 16:38:43.183266+00	
00000000-0000-0000-0000-000000000000	0ccf5905-509b-495d-8d44-57fb6f83c0ae	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 16:38:44.324982+00	
00000000-0000-0000-0000-000000000000	e98d98f1-0d6f-4501-bf6b-373398328b6b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:22:21.491753+00	
00000000-0000-0000-0000-000000000000	3305502d-d20b-4a2c-89ef-6ec7d53d5e5b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:22:22.563923+00	
00000000-0000-0000-0000-000000000000	e8652f85-24e2-44f8-b5e2-ab9d3a1915ff	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:23:03.94126+00	
00000000-0000-0000-0000-000000000000	f2603d28-82e5-4eb9-997c-187ad0af3403	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:23:04.513325+00	
00000000-0000-0000-0000-000000000000	949a153c-341b-4d0a-91f7-f373d5ac5e89	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:23:24.548809+00	
00000000-0000-0000-0000-000000000000	9ef3fca3-2541-41ce-a642-5b7a9e3bf283	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:23:25.019125+00	
00000000-0000-0000-0000-000000000000	afeb7718-9652-442d-8512-bf57adb87062	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:25:55.384387+00	
00000000-0000-0000-0000-000000000000	9426ca3e-d959-4057-9772-35bab27ad6ee	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:25:56.090665+00	
00000000-0000-0000-0000-000000000000	060c4998-b0fd-4e36-a2f9-d00cf6844f7e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:26:01.182728+00	
00000000-0000-0000-0000-000000000000	a48352fe-1006-4c55-a45b-9c28777786be	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:26:01.540578+00	
00000000-0000-0000-0000-000000000000	4dc5d448-c996-4d11-8269-1fb18f98d389	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:26:02.647954+00	
00000000-0000-0000-0000-000000000000	ef30f0dd-2468-431f-b578-8321c8a0f038	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:26:02.999572+00	
00000000-0000-0000-0000-000000000000	35dc8776-ec0a-462a-b2ce-e23ab637307a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:26:03.963834+00	
00000000-0000-0000-0000-000000000000	1e75d585-a162-42ee-872c-f933b4a1ac0f	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:26:04.47453+00	
00000000-0000-0000-0000-000000000000	a4d55216-28d9-4a78-8f40-80ba5eafc851	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:26:29.502093+00	
00000000-0000-0000-0000-000000000000	2ae5adde-67c7-4408-9904-280df6be2eff	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:26:29.880802+00	
00000000-0000-0000-0000-000000000000	23b0d5e5-7685-4181-b554-5afa75c13583	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:28:14.002681+00	
00000000-0000-0000-0000-000000000000	864e270d-9871-4ee7-aaec-ffaa936ac6e3	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:28:14.947565+00	
00000000-0000-0000-0000-000000000000	bcf3ddfa-ce2a-445c-ab4d-25d88549b928	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:28:40.540979+00	
00000000-0000-0000-0000-000000000000	bf46256f-c7a3-42ea-9eee-babe94305c4f	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:28:41.145651+00	
00000000-0000-0000-0000-000000000000	ffa91bb2-6844-432c-9ca5-393b778c217e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:29:24.510352+00	
00000000-0000-0000-0000-000000000000	a5640892-3f19-4c09-a316-608cc4ddbc5d	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:29:24.918437+00	
00000000-0000-0000-0000-000000000000	f2606ef4-caa1-4dfd-b43f-6fb5ec7a7d61	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:34:02.579965+00	
00000000-0000-0000-0000-000000000000	b6495720-251f-4ad8-92e7-ed7737f7b5e9	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:34:03.721529+00	
00000000-0000-0000-0000-000000000000	e66fb450-a1ca-4119-939c-ef1959f72397	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:34:06.826434+00	
00000000-0000-0000-0000-000000000000	fa52183b-32f4-4514-9d65-818756172f7c	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:34:07.390167+00	
00000000-0000-0000-0000-000000000000	6097b50f-3fa9-4fcb-8a3e-94d3c80353cd	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:34:08.418075+00	
00000000-0000-0000-0000-000000000000	47c550e1-8d2f-44f6-a22f-14ebc3efca71	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:34:08.910478+00	
00000000-0000-0000-0000-000000000000	7aec6d2f-97aa-4d6e-a1bd-51cf3369a16f	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:34:09.917319+00	
00000000-0000-0000-0000-000000000000	efa2cc3e-14c4-4355-88dc-17b120199ec0	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:34:10.316653+00	
00000000-0000-0000-0000-000000000000	60605b2e-3abc-4632-8329-8f92d11dd150	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:34:38.97871+00	
00000000-0000-0000-0000-000000000000	be3b8e1d-c7b7-45ef-935c-36eed98d47bc	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:34:40.699803+00	
00000000-0000-0000-0000-000000000000	c06fccd7-f092-4e17-805d-49fe37bf147d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:49:29.550251+00	
00000000-0000-0000-0000-000000000000	cfe53803-99f7-47f0-a582-eb777444e334	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:49:31.431907+00	
00000000-0000-0000-0000-000000000000	efd89dfd-aa93-4d6f-b9c8-4fb2d54e0110	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:49:34.051426+00	
00000000-0000-0000-0000-000000000000	255f1315-00ec-487f-91a7-7d4aec086c22	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:49:34.441958+00	
00000000-0000-0000-0000-000000000000	1383d147-8d3a-47a5-bda8-5354f9c9229b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-10 18:49:35.815443+00	
00000000-0000-0000-0000-000000000000	68daf80c-cc04-41c6-a478-3d85bc97982e	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-10 18:49:36.381947+00	
00000000-0000-0000-0000-000000000000	4207e72f-f6b2-4036-a0a3-1d970dd2979a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 00:32:36.158253+00	
00000000-0000-0000-0000-000000000000	7ce5f013-77c9-4ac2-833c-6b0d9b598766	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-12 00:32:37.479935+00	
00000000-0000-0000-0000-000000000000	fd39d261-ac8a-43c0-85dd-64e932799444	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 00:32:56.530444+00	
00000000-0000-0000-0000-000000000000	43183523-3307-48b9-9bd4-a19af47f8702	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-12 00:32:57.895065+00	
00000000-0000-0000-0000-000000000000	13940c35-c619-4824-865e-e26c4c44899f	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 00:40:22.600482+00	
00000000-0000-0000-0000-000000000000	08d6af00-e7dd-4080-b393-fe836af6b0c4	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 01:38:26.421671+00	
00000000-0000-0000-0000-000000000000	eb6c1263-7436-493a-b364-6e95f9f438d9	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-12 01:38:32.457252+00	
00000000-0000-0000-0000-000000000000	4d91e5dc-328f-4ad0-ae55-6ac391be2139	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 01:38:46.68358+00	
00000000-0000-0000-0000-000000000000	ab32d05a-3629-4e07-85d2-dcc7e57eace6	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 01:41:16.460291+00	
00000000-0000-0000-0000-000000000000	c0c494dc-8130-454b-9b3c-250a18d33a0e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 01:46:49.158086+00	
00000000-0000-0000-0000-000000000000	5d0b8b29-2832-48c5-9694-ff832f197653	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 01:55:19.894111+00	
00000000-0000-0000-0000-000000000000	63042367-72c1-4f40-a481-e9be56db8129	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-12 02:00:08.111338+00	
00000000-0000-0000-0000-000000000000	447ddbed-d1ea-41c4-90b1-668fa31affc0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-12 05:54:40.929787+00	
00000000-0000-0000-0000-000000000000	4d6049f6-a953-4e50-bc67-690bb6fa8bfb	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-12 05:54:40.942065+00	
00000000-0000-0000-0000-000000000000	3ef1e41b-7505-49f0-98d4-2b750943a5ed	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-14 20:37:03.026547+00	
00000000-0000-0000-0000-000000000000	ea066d2f-fe71-460e-84be-ad9f13baaac9	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-14 20:37:03.056915+00	
00000000-0000-0000-0000-000000000000	b2ac3a5c-ab3f-46f5-aa9b-8a5b6876f124	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 02:22:22.81284+00	
00000000-0000-0000-0000-000000000000	1de26757-25be-4a47-9b1c-3438d4b11082	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-15 02:22:23.842627+00	
00000000-0000-0000-0000-000000000000	9d8ae041-ab46-485c-9b95-a16832c68dcb	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 02:23:27.708029+00	
00000000-0000-0000-0000-000000000000	64723bef-1669-4bf3-b909-e2065541cc45	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-15 02:23:28.216625+00	
00000000-0000-0000-0000-000000000000	e9275586-94c2-4456-ae35-1cfb8501bfae	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 02:26:31.985183+00	
00000000-0000-0000-0000-000000000000	3e42aecd-1f1c-4f69-a31b-71dfb56da915	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-15 02:26:32.429918+00	
00000000-0000-0000-0000-000000000000	d6ad2d79-a622-4f2b-9842-86ef3a9ac582	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 02:33:09.519686+00	
00000000-0000-0000-0000-000000000000	615df67e-0030-4461-8401-857e19bc0aef	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 02:37:01.333244+00	
00000000-0000-0000-0000-000000000000	00f51ca1-7841-4f13-9643-2f233f09df4e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 02:38:02.92461+00	
00000000-0000-0000-0000-000000000000	b9197d3a-dc47-4616-8bb5-c21c03c13e1e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 03:37:26.550812+00	
00000000-0000-0000-0000-000000000000	0c57b386-314e-4c46-8e82-f37f4349f130	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 03:37:26.577567+00	
00000000-0000-0000-0000-000000000000	3662e3e2-f5a9-44f2-b53e-36de8940c505	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 04:29:36.128333+00	
00000000-0000-0000-0000-000000000000	1560d794-d3cc-425a-8bd7-c44b87dbed2d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 04:38:37.319707+00	
00000000-0000-0000-0000-000000000000	54026d04-5987-47ff-84be-3eea15d7f65a	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 04:38:37.32447+00	
00000000-0000-0000-0000-000000000000	6952d592-4f60-47de-801a-8149af31a340	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 04:38:48.155+00	
00000000-0000-0000-0000-000000000000	c1a3ae70-87e3-4975-813e-a53030f0ea77	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 05:56:38.300965+00	
00000000-0000-0000-0000-000000000000	2e4aa8f3-ddfc-46b0-8932-f8a6dcf8f1d9	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 05:56:38.328762+00	
00000000-0000-0000-0000-000000000000	ddb15ed2-86c1-4b87-a4ea-a79dc6a2436b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 06:11:50.746785+00	
00000000-0000-0000-0000-000000000000	f5ebb9f7-bb6d-463d-a497-5a5566c34c90	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 06:13:54.745852+00	
00000000-0000-0000-0000-000000000000	fe062afd-958a-41b7-8c85-5433f72f39bb	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 06:13:54.750286+00	
00000000-0000-0000-0000-000000000000	e5b50506-72c9-4f33-9b61-032954efb7f3	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 06:25:19.205764+00	
00000000-0000-0000-0000-000000000000	d5f367cc-0eca-45cc-b7c1-9f3598f148aa	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 06:27:47.41711+00	
00000000-0000-0000-0000-000000000000	50b03c13-9cac-4eec-a69a-7db182484d1c	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 06:28:24.706963+00	
00000000-0000-0000-0000-000000000000	9d1b6656-bad9-4527-bb22-b5ead6a4573a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 06:34:14.433252+00	
00000000-0000-0000-0000-000000000000	b3400aa1-6397-4ba9-80fd-ff7bb126cf0f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 11:47:06.331938+00	
00000000-0000-0000-0000-000000000000	7c4675ee-3683-47b8-8d7d-35376e4068e2	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 11:47:06.343745+00	
00000000-0000-0000-0000-000000000000	ff2ebea0-cced-470a-91ad-225b3dfc6f89	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 11:51:10.227588+00	
00000000-0000-0000-0000-000000000000	ad07db2f-f076-4df3-84fe-0ebfdf18bf73	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 11:51:10.241987+00	
00000000-0000-0000-0000-000000000000	cc1344c7-1671-4011-bbd9-40773af1a183	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-15 11:58:55.93253+00	
00000000-0000-0000-0000-000000000000	9bfe015b-d8b1-4735-9d84-3c8d6286307a	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 12:45:58.503187+00	
00000000-0000-0000-0000-000000000000	d687eb6f-b45c-407e-a640-38494bf676b3	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 12:45:58.525086+00	
00000000-0000-0000-0000-000000000000	81865427-bdfe-4085-9e84-10507e968f2e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 13:44:59.344548+00	
00000000-0000-0000-0000-000000000000	e270d9d7-85eb-4c55-886e-220ecd87b04b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-15 13:44:59.375198+00	
00000000-0000-0000-0000-000000000000	79dacb19-9603-4e54-98bf-02a7b5cc424b	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-18 01:00:10.554145+00	
00000000-0000-0000-0000-000000000000	2208897a-ef46-4624-a8c2-ed8dbedc74c8	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-18 01:00:10.579497+00	
00000000-0000-0000-0000-000000000000	f90cd645-9141-489a-a771-74dea91f5b90	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:02:50.326016+00	
00000000-0000-0000-0000-000000000000	4ddc9a92-4a57-48ef-be9a-cc517cb68f7b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:02:51.389866+00	
00000000-0000-0000-0000-000000000000	5bfc0a29-7f6f-4737-895e-5ed63132c668	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:10:30.285025+00	
00000000-0000-0000-0000-000000000000	92142aad-17be-4227-a79a-1b7977b474a3	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:10:30.806674+00	
00000000-0000-0000-0000-000000000000	67a5ad1f-7339-4cb6-b084-572be2ab1556	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:11:43.029336+00	
00000000-0000-0000-0000-000000000000	348376ad-6daf-48a8-bf09-e47720c6975e	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:11:43.343481+00	
00000000-0000-0000-0000-000000000000	856011b3-8db5-472b-93fb-1971f136a87d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:14:35.245287+00	
00000000-0000-0000-0000-000000000000	d07b5d98-7128-4bea-aa99-dbe36277e640	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:14:38.543146+00	
00000000-0000-0000-0000-000000000000	dfcc79df-aa02-4550-b13f-7d904fe2b29b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:30:24.707038+00	
00000000-0000-0000-0000-000000000000	2d2b2676-55d6-4737-b25c-ef0fb003cfd7	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:30:25.41027+00	
00000000-0000-0000-0000-000000000000	a340a58b-795a-4c31-a16a-09300a086925	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:32:52.637416+00	
00000000-0000-0000-0000-000000000000	73dbeaf7-ec83-48ac-9b25-123b5f4e3ba9	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:32:53.127403+00	
00000000-0000-0000-0000-000000000000	16c68021-432c-428d-a82e-13973a71dcf4	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 01:43:35.44559+00	
00000000-0000-0000-0000-000000000000	7b665e1e-9621-4b50-94b1-2febfe86838c	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 01:43:35.987241+00	
00000000-0000-0000-0000-000000000000	82f1c9c0-3e37-45eb-873d-3a0451972c73	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:08:04.391977+00	
00000000-0000-0000-0000-000000000000	57928ac7-7ec3-4252-a334-9ebbadafa7a1	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:08:05.555468+00	
00000000-0000-0000-0000-000000000000	8dec31f8-5c33-4741-a88d-4a6f1b35b664	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:11:01.608301+00	
00000000-0000-0000-0000-000000000000	c928ef75-df12-4b37-9628-9bd5e763a69f	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:11:01.946357+00	
00000000-0000-0000-0000-000000000000	07144bc3-9401-4f0c-99b0-f4c6d1b66071	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:21:27.551794+00	
00000000-0000-0000-0000-000000000000	211d5d97-2928-44c1-8ae0-ac3879103b00	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:21:28.429062+00	
00000000-0000-0000-0000-000000000000	ffe8614b-3975-43fd-9566-9f1fd42a40b0	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:23:55.318683+00	
00000000-0000-0000-0000-000000000000	81de7299-9c8f-4335-a8d5-dc661da99718	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:23:56.34437+00	
00000000-0000-0000-0000-000000000000	75c14029-46ec-4bbc-a86d-1fa7520c8066	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:33:18.509318+00	
00000000-0000-0000-0000-000000000000	fe990580-4764-4e44-b462-9602091a2a74	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:33:19.174411+00	
00000000-0000-0000-0000-000000000000	3f10f54f-e7f8-48d6-8c7f-7050b9ba265c	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:34:06.140611+00	
00000000-0000-0000-0000-000000000000	abde499a-d431-4804-becc-694dac85ed03	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:34:06.451705+00	
00000000-0000-0000-0000-000000000000	475762ae-f21a-4409-aa90-f5299ec1916a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 02:38:31.653122+00	
00000000-0000-0000-0000-000000000000	3b29ae95-98c2-4f82-ac4a-c89b9644dc12	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 02:38:32.058782+00	
00000000-0000-0000-0000-000000000000	7cad01f2-cc37-4328-99f3-ed9115616498	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:04:07.742445+00	
00000000-0000-0000-0000-000000000000	dc3378a8-b554-45cc-affb-c99dbe98196c	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:04:08.329247+00	
00000000-0000-0000-0000-000000000000	aa971fbe-b9ee-4850-b90d-dea3a2017e3d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:04:27.740672+00	
00000000-0000-0000-0000-000000000000	6cda06a5-9fe6-4648-89ac-8071fdc69c3e	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:04:28.141523+00	
00000000-0000-0000-0000-000000000000	fbce54c0-e689-440d-980e-29be6a31f01d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:06:19.221012+00	
00000000-0000-0000-0000-000000000000	d37d3a4b-f079-4ddc-b98f-7cf411875a6b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:06:19.652359+00	
00000000-0000-0000-0000-000000000000	75eefda4-5b04-4202-842a-3bc073e92050	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:08:36.497682+00	
00000000-0000-0000-0000-000000000000	d6c85be8-e2ca-4299-806c-60621d44a692	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:08:37.072152+00	
00000000-0000-0000-0000-000000000000	638da0f4-3567-4f27-902e-61fd0ee6a81b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:09:01.350591+00	
00000000-0000-0000-0000-000000000000	72c2a74a-70b5-474f-abed-42fcad1d8064	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:09:02.109442+00	
00000000-0000-0000-0000-000000000000	deed3233-cf30-4bd8-9371-89d92b254191	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:09:32.554033+00	
00000000-0000-0000-0000-000000000000	b66dbd4f-914b-498d-acc0-f7ed529acab0	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:09:32.8782+00	
00000000-0000-0000-0000-000000000000	9e71119f-4fa4-4028-a6d1-6ebb0bab0abf	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:13:39.293632+00	
00000000-0000-0000-0000-000000000000	e7a25f6f-f9d7-42ea-90fe-df3ddb0311fb	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:13:40.200422+00	
00000000-0000-0000-0000-000000000000	8ef5dc5a-8def-44ca-b7f4-a5543fd23334	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:14:11.658417+00	
00000000-0000-0000-0000-000000000000	6ec450db-cf6b-4607-b078-c2a8cd9f9ab6	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:14:12.185754+00	
00000000-0000-0000-0000-000000000000	cbb3b896-5b2d-444c-a2db-adc3cc237402	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:14:21.150658+00	
00000000-0000-0000-0000-000000000000	95077e81-5861-4732-9905-13cdd400be2c	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:14:21.553401+00	
00000000-0000-0000-0000-000000000000	8f98722c-92ba-4972-8d95-d009a46f50cc	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:14:28.274383+00	
00000000-0000-0000-0000-000000000000	3f068a84-60be-4b2a-96ec-0b406537ee3f	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:14:28.853519+00	
00000000-0000-0000-0000-000000000000	19b8dae8-ff06-45bb-8fda-44f2ec5701d4	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:14:53.582797+00	
00000000-0000-0000-0000-000000000000	7286777c-6c6b-4a4c-b1c9-72ff4e525dcd	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 03:14:54.158674+00	
00000000-0000-0000-0000-000000000000	bf3b32b1-7613-4e85-95e2-14f74a9b651d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 03:15:11.913009+00	
00000000-0000-0000-0000-000000000000	a52041e1-f012-426b-b91a-662cf13d883a	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-18 04:13:15.793602+00	
00000000-0000-0000-0000-000000000000	1975ce1a-91e5-4131-8608-07211586ae6e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-18 04:13:15.805654+00	
00000000-0000-0000-0000-000000000000	7ddb5295-15aa-4575-961f-1c8adcbd8e22	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 04:33:43.911395+00	
00000000-0000-0000-0000-000000000000	ebce6f20-eb85-416f-b606-7631ca837582	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 04:34:51.083748+00	
00000000-0000-0000-0000-000000000000	eecd5484-7c28-4b3c-b64f-cd2f7715a253	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 04:37:13.628005+00	
00000000-0000-0000-0000-000000000000	5cadf1ee-2cc8-4ede-b24a-7e4a57c0d99f	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 04:38:17.45702+00	
00000000-0000-0000-0000-000000000000	04c4c693-60dd-4b19-9879-6f81b35759a3	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 04:40:31.473208+00	
00000000-0000-0000-0000-000000000000	80ebdfd8-c305-4a1c-8fd5-64fadd69c0f2	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 04:41:06.704927+00	
00000000-0000-0000-0000-000000000000	9c8ebadb-9201-4c62-bc5a-e26feca4c372	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 04:46:14.697295+00	
00000000-0000-0000-0000-000000000000	866b7249-1ad9-4d13-b1a1-f26324e51692	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 04:46:28.899069+00	
00000000-0000-0000-0000-000000000000	8ad67eaf-c0de-4445-9761-36e9b200bc99	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 04:57:38.595513+00	
00000000-0000-0000-0000-000000000000	b15d44e2-b3c0-4ba2-8575-8fb9df487660	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:06:21.633635+00	
00000000-0000-0000-0000-000000000000	07ca56c5-4e1c-4bb9-b79a-b898789d0328	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 05:08:51.780524+00	
00000000-0000-0000-0000-000000000000	957a24e4-f789-4a95-815a-c3ef19f2f227	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:09:01.742395+00	
00000000-0000-0000-0000-000000000000	af7a8404-a390-49b4-9b49-9433fcdc5736	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 05:15:30.515319+00	
00000000-0000-0000-0000-000000000000	e1eb094d-d6df-4278-aae9-c541a36902ea	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:15:34.910172+00	
00000000-0000-0000-0000-000000000000	948e02da-a663-45c7-bfb7-3f6d097b26cc	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 05:17:33.318977+00	
00000000-0000-0000-0000-000000000000	ab493435-013d-4328-98cd-f66d9e37aee2	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:17:37.532103+00	
00000000-0000-0000-0000-000000000000	75a15fd1-c91f-485d-a5f0-36f97e9db5e2	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 05:23:57.007583+00	
00000000-0000-0000-0000-000000000000	21b09168-bf31-4e1c-a9e1-67f68b3544a8	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:24:00.516424+00	
00000000-0000-0000-0000-000000000000	382cdaf1-8cde-4719-afc1-5a0dda9d292a	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 05:40:18.445902+00	
00000000-0000-0000-0000-000000000000	0071306f-f364-46a1-bcaf-5e39491a3c4a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:40:22.539068+00	
00000000-0000-0000-0000-000000000000	63a2f6a5-341b-4be0-9bd1-65e4dd2ae38d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 05:55:10.001458+00	
00000000-0000-0000-0000-000000000000	28eb972f-4f5e-41bb-a424-ff410b6b1ac7	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-18 06:15:25.694338+00	
00000000-0000-0000-0000-000000000000	8250a72d-a573-4851-9385-2185d5b04152	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-18 06:15:30.673985+00	
00000000-0000-0000-0000-000000000000	0eada9fd-0b3c-4c20-8603-6bcb5adcc9c1	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 10:37:04.378677+00	
00000000-0000-0000-0000-000000000000	2d73ad6a-a0c9-49c9-89ae-3f22823efc64	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 10:37:04.389022+00	
00000000-0000-0000-0000-000000000000	ea8c809f-e68b-4f7b-8900-3c44c509a7a2	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 10:37:33.658754+00	
00000000-0000-0000-0000-000000000000	ed105d29-4b39-4639-8070-2d1f6388e0a5	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-21 10:57:01.663385+00	
00000000-0000-0000-0000-000000000000	ad7627db-c81c-471b-9ca3-37a1c895d149	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 10:57:12.707146+00	
00000000-0000-0000-0000-000000000000	4ee12204-a1fb-455c-a310-5bad35b50197	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 11:55:35.408779+00	
00000000-0000-0000-0000-000000000000	c7218b0c-4588-4615-9097-7b734abe9ae4	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 11:55:35.436508+00	
00000000-0000-0000-0000-000000000000	2dd1bdc7-4e1d-4fb8-aa78-45e0ada14010	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 12:26:53.876929+00	
00000000-0000-0000-0000-000000000000	e596c87e-d81e-49d5-b1ef-6736a85ea506	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-21 12:52:05.550182+00	
00000000-0000-0000-0000-000000000000	1df2aba6-7615-4ed4-91eb-ad882c16fa8c	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 12:52:08.868045+00	
00000000-0000-0000-0000-000000000000	ca4f79e1-4ddb-43da-bd8d-f554b64c3050	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 13:50:16.545422+00	
00000000-0000-0000-0000-000000000000	498190c1-b8ca-4113-a97f-f26170d0faf6	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 13:50:16.569561+00	
00000000-0000-0000-0000-000000000000	57e9e7f9-5f78-4512-8d50-1e70257fc417	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 14:48:46.084254+00	
00000000-0000-0000-0000-000000000000	a6e6fab0-64fa-48d6-8f57-d36e02ea3517	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 14:48:46.09643+00	
00000000-0000-0000-0000-000000000000	f3772475-40a7-4768-975f-4bd5a3c3f69b	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 15:47:15.264819+00	
00000000-0000-0000-0000-000000000000	70dd3858-60dd-40fc-870c-4c854c28bb6e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 15:47:15.280699+00	
00000000-0000-0000-0000-000000000000	f0c9b056-6628-485c-80aa-d5b08236ba76	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 16:45:17.641967+00	
00000000-0000-0000-0000-000000000000	8a4591c8-1b1d-4da7-bc6e-19363942c802	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 16:45:17.661323+00	
00000000-0000-0000-0000-000000000000	287af251-c5d6-44d8-b906-e49bfbc6f27a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 18:08:24.393415+00	
00000000-0000-0000-0000-000000000000	08511ab8-5ef0-4db2-a1b1-0d13666045bc	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 18:08:56.353714+00	
00000000-0000-0000-0000-000000000000	6d7ad284-d6c3-4ec8-8e54-43d3b4282882	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-21 18:08:56.355892+00	
00000000-0000-0000-0000-000000000000	9627ffbc-961b-454a-b5ac-4985b401608b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 18:25:15.241318+00	
00000000-0000-0000-0000-000000000000	a27165c7-78e0-453f-bbda-3cc77cc6e534	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 18:46:07.271027+00	
00000000-0000-0000-0000-000000000000	275ad0d8-3099-494b-bbec-4049f8008d22	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 18:56:12.584299+00	
00000000-0000-0000-0000-000000000000	756583f3-bcd7-4f6e-9d57-16200519c8fb	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-21 19:04:29.48381+00	
00000000-0000-0000-0000-000000000000	0d6eb335-b75b-4028-a78a-268601a9c7a1	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 03:20:43.75244+00	
00000000-0000-0000-0000-000000000000	3b394658-262a-4fe9-9578-090fc5b678af	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 03:20:43.782776+00	
00000000-0000-0000-0000-000000000000	fb5c71bd-4e85-45e7-9095-9d5fed0dea49	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 05:36:00.915254+00	
00000000-0000-0000-0000-000000000000	70c07202-d265-49e1-b94f-36908d0ec07d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 06:34:11.810129+00	
00000000-0000-0000-0000-000000000000	8d1a6668-5800-4b66-af94-f72e0c9cba2b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 06:34:11.835011+00	
00000000-0000-0000-0000-000000000000	39742390-ea93-4bcf-a786-d4a388d05351	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 07:16:57.467064+00	
00000000-0000-0000-0000-000000000000	e0041f5a-5496-4e9a-a652-48ca98a6c231	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 08:15:03.54408+00	
00000000-0000-0000-0000-000000000000	f4300f2e-caa3-49ae-8b86-7de463e64d44	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 08:15:03.570251+00	
00000000-0000-0000-0000-000000000000	a9ce0b6d-b1f6-499f-aab9-de75df8d13f3	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 11:50:24.124375+00	
00000000-0000-0000-0000-000000000000	de476eaf-1b4a-4f10-9f1d-a17ecfb2cf18	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 11:50:24.149468+00	
00000000-0000-0000-0000-000000000000	fbbe02d0-83b8-42f3-8570-2dc6b2b6c7f9	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 12:23:34.444665+00	
00000000-0000-0000-0000-000000000000	e775b00c-8b3a-416e-9798-ac8e8c13b4f2	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-27 12:23:57.682537+00	
00000000-0000-0000-0000-000000000000	f6c1ef6c-4029-43bd-9ce8-4ab909800c5a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 12:24:07.745597+00	
00000000-0000-0000-0000-000000000000	126630a4-1919-46e1-a857-206eb858d62b	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 12:24:57.042518+00	
00000000-0000-0000-0000-000000000000	2359d477-9463-4f04-9b11-fbed130923b0	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 12:43:38.444114+00	
00000000-0000-0000-0000-000000000000	daec7eca-cdd5-4373-b870-02e64753f144	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 13:42:00.579264+00	
00000000-0000-0000-0000-000000000000	61d4d95f-5a14-4f62-b0cf-100b867d9bd0	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 13:42:00.603157+00	
00000000-0000-0000-0000-000000000000	71d85b04-8036-4bc5-9e16-9e1c3d32b064	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 14:05:38.080094+00	
00000000-0000-0000-0000-000000000000	40e27ef5-3734-45af-9366-f22b45870e44	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 15:19:37.253724+00	
00000000-0000-0000-0000-000000000000	525697c7-09ef-4a5a-bf60-b6716c3fdb48	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 15:19:37.279485+00	
00000000-0000-0000-0000-000000000000	99506895-59b8-4909-bfdb-76a3b3f65c1e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 16:21:04.456954+00	
00000000-0000-0000-0000-000000000000	a6d0fa12-1c9f-42df-bb4c-36aee59c8ce5	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-27 16:21:04.474673+00	
00000000-0000-0000-0000-000000000000	324d67a9-fe1a-400f-b56a-1d255015eac3	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-27 16:21:49.760984+00	
00000000-0000-0000-0000-000000000000	7d8e6830-b141-4faf-8027-d5784c3ece8f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 09:41:37.191625+00	
00000000-0000-0000-0000-000000000000	a3e8257a-fb7c-440c-847f-59d9aa8b862d	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 09:41:37.225253+00	
00000000-0000-0000-0000-000000000000	616968c2-b99b-49d2-b41d-bce8d079f84a	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 09:41:58.919457+00	
00000000-0000-0000-0000-000000000000	09233638-a2a5-4861-9966-a67ce3a1d21c	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 11:13:24.663336+00	
00000000-0000-0000-0000-000000000000	aa012cf6-cc4d-4bc5-8d24-665c78eae223	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 11:13:24.700579+00	
00000000-0000-0000-0000-000000000000	734c8e33-14a1-44f6-bc67-6f8bfb3da04d	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 11:58:26.654994+00	
00000000-0000-0000-0000-000000000000	816f0039-6ed4-4c3a-a1d6-3f52c21d072b	{"action":"logout","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account"}	2025-11-28 12:42:18.823051+00	
00000000-0000-0000-0000-000000000000	d3b53950-6301-4db5-a32a-c60913350b86	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-28 12:42:22.653901+00	
00000000-0000-0000-0000-000000000000	2cf33868-3e8f-40b1-8b02-903dafd32830	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 13:48:15.513901+00	
00000000-0000-0000-0000-000000000000	a42b932a-3e28-41eb-8f91-bf731a8bea7f	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 13:48:15.538163+00	
00000000-0000-0000-0000-000000000000	c902dfbc-74d7-441d-b56c-5d929dc2cac2	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-28 14:15:55.018758+00	
00000000-0000-0000-0000-000000000000	4ddc88c8-121e-4f78-ada7-d266da8a19dd	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-11-29 04:23:14.806068+00	
00000000-0000-0000-0000-000000000000	e149bce1-403f-4c55-b2b9-ac3d3241c893	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 04:33:08.100183+00	
00000000-0000-0000-0000-000000000000	1ee8b473-f805-4aac-9faa-63b7e0be18f4	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 04:33:08.12473+00	
00000000-0000-0000-0000-000000000000	e812f28e-bd3c-4ed7-a421-a50b58659be0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 06:01:18.085295+00	
00000000-0000-0000-0000-000000000000	9e8cb76a-a4bd-4e38-8bf6-d75043227c23	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 06:01:18.116351+00	
00000000-0000-0000-0000-000000000000	9960fafb-4573-40f2-b1e5-e87f077cd4dd	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 07:14:57.134359+00	
00000000-0000-0000-0000-000000000000	9e77f33c-8484-4c23-a43e-a08fe9851e5b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 07:14:57.157114+00	
00000000-0000-0000-0000-000000000000	c8f4b1ce-b2dc-4477-9700-91aee430d71d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 09:01:31.753391+00	
00000000-0000-0000-0000-000000000000	59988173-64a7-4610-9f06-d721e5d6574d	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 09:01:31.780258+00	
00000000-0000-0000-0000-000000000000	6f378909-f3dd-4e15-a596-edce5c51a431	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 09:59:54.726792+00	
00000000-0000-0000-0000-000000000000	8f846dd2-3ba3-490d-ad1c-dac12db66b85	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-29 09:59:54.733782+00	
00000000-0000-0000-0000-000000000000	d829d65a-e8a9-47ad-bc55-1f70280d63f5	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-30 11:52:40.438797+00	
00000000-0000-0000-0000-000000000000	bf7dc0fe-3c51-416f-9121-91c33eb9dc5e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-30 11:52:40.46618+00	
00000000-0000-0000-0000-000000000000	cab6bfe6-cbc6-4e1b-bbd8-1d225293e03a	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-30 12:50:57.659571+00	
00000000-0000-0000-0000-000000000000	74300b10-f764-4c2a-b185-b1388bb159e6	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-11-30 12:50:57.674693+00	
00000000-0000-0000-0000-000000000000	3957b5d7-e253-4bea-9a15-d52cd68e0d16	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-02 16:58:40.754575+00	
00000000-0000-0000-0000-000000000000	e2f260b3-10b7-47dd-9f18-9dfb2299e783	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-02 16:58:40.785547+00	
00000000-0000-0000-0000-000000000000	9f518b36-fdc3-41e7-9221-93ca5f4e22ef	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-02 16:59:20.477948+00	
00000000-0000-0000-0000-000000000000	e629593b-7715-4ac9-95e8-1634ef6b0e51	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 19:26:30.293956+00	
00000000-0000-0000-0000-000000000000	47c1152b-ac28-4a28-a117-3d852b074931	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 19:26:30.32356+00	
00000000-0000-0000-0000-000000000000	f16d7d6c-ab74-4b70-b8b0-815c98084300	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-03 19:27:50.887584+00	
00000000-0000-0000-0000-000000000000	a27784f0-f904-4d48-8f19-f7fbe4ec2e49	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 20:26:50.23535+00	
00000000-0000-0000-0000-000000000000	0d66ae52-3692-47f7-99fe-28892092a9f0	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 20:26:50.256441+00	
00000000-0000-0000-0000-000000000000	36b71b82-043c-45fb-9d13-7e6c356a7fac	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-12-03 20:27:23.366047+00	
00000000-0000-0000-0000-000000000000	3611b585-ee32-4f7b-9e5b-8adeb57410bc	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 21:25:31.13458+00	
00000000-0000-0000-0000-000000000000	27ee642b-503c-4cb5-ad48-04f131f6ae21	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 21:25:31.153574+00	
00000000-0000-0000-0000-000000000000	4df389cb-3461-408e-8ffd-0318705b66d0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 22:23:35.905045+00	
00000000-0000-0000-0000-000000000000	982bebc7-7913-4252-be40-61ca2a1be490	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 22:23:35.929971+00	
00000000-0000-0000-0000-000000000000	c6391cf1-d8ae-4d59-b760-56851ccd9e3d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 23:40:06.042606+00	
00000000-0000-0000-0000-000000000000	f44daeb0-0312-4074-bdfa-d23a59706368	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-03 23:40:06.061014+00	
00000000-0000-0000-0000-000000000000	28710a2a-5108-442b-b707-e0be326619de	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 00:29:02.821985+00	
00000000-0000-0000-0000-000000000000	40372902-d2a8-4171-bcbc-cec1afb479fe	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 02:23:45.176744+00	
00000000-0000-0000-0000-000000000000	42f95be7-44e5-411a-a868-05ff56d96bf5	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 02:54:29.280353+00	
00000000-0000-0000-0000-000000000000	aca97dda-f5b4-4531-9c65-40493564db3a	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 03:53:20.131411+00	
00000000-0000-0000-0000-000000000000	4569aaa7-2449-4a90-8b07-3c50d6c53c9c	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 03:53:20.148322+00	
00000000-0000-0000-0000-000000000000	6983d3cd-6315-423f-93da-452e5bc1cd8e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 06:07:50.069594+00	
00000000-0000-0000-0000-000000000000	a9e1069c-7460-4c5d-9928-ff7a8676170c	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2025-12-04 06:07:50.100265+00	
00000000-0000-0000-0000-000000000000	1d1b3811-7695-4a97-a4e5-19817f79f2c4	{"action":"login","actor_id":"38322fdd-1346-4f01-9325-955d246a89af","actor_name":"MFC","actor_username":"mondalfishcenter2005@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2026-01-27 15:50:30.175687+00	
00000000-0000-0000-0000-000000000000	7c469368-fb85-4153-8b24-870d50317ce1	{"action":"login","actor_id":"38322fdd-1346-4f01-9325-955d246a89af","actor_name":"MFC","actor_username":"mondalfishcenter2005@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"google"}}	2026-01-27 15:50:32.239177+00	
00000000-0000-0000-0000-000000000000	5e6385fd-bc18-450b-bad4-e6d192166864	{"action":"logout","actor_id":"38322fdd-1346-4f01-9325-955d246a89af","actor_name":"MFC","actor_username":"mondalfishcenter2005@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-01-27 15:50:33.797384+00	
00000000-0000-0000-0000-000000000000	27b193fe-900e-4afc-b583-937a8f76eeb8	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"manager3@test.local","user_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","user_phone":""}}	2026-01-27 15:56:33.078811+00	
00000000-0000-0000-0000-000000000000	7c6c9b50-4103-4189-8936-0ca23ff4e247	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-27 15:56:47.585128+00	
00000000-0000-0000-0000-000000000000	9363caac-5c0d-4234-8876-1408ec4c2c54	{"action":"logout","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account"}	2026-01-27 15:56:48.713612+00	
00000000-0000-0000-0000-000000000000	f606dcae-f73c-4c0d-b957-a388ca758582	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-27 15:59:21.184414+00	
00000000-0000-0000-0000-000000000000	fa7b5b68-9120-4a8b-840d-e2811df7fba1	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 16:58:08.666046+00	
00000000-0000-0000-0000-000000000000	215eb5f0-b9d1-4809-a5fc-46469ffa3066	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 16:58:08.691268+00	
00000000-0000-0000-0000-000000000000	031b5ea0-8c4f-4735-8a3f-0584919c72b0	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 18:09:12.942291+00	
00000000-0000-0000-0000-000000000000	d6800052-b638-4448-957a-7827fece9741	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 18:09:12.966567+00	
00000000-0000-0000-0000-000000000000	5f8dd347-5564-4a6f-9409-3935e5b7da25	{"action":"logout","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account"}	2026-01-27 18:52:58.799074+00	
00000000-0000-0000-0000-000000000000	230361a9-2339-4c42-9256-471c735f8110	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-27 18:53:14.487507+00	
00000000-0000-0000-0000-000000000000	da15a1e0-6080-40f8-86c6-c2f85dcc581e	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 19:58:11.078265+00	
00000000-0000-0000-0000-000000000000	cf4fd641-3372-4e8e-aebc-d4a3d38e1c1c	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 19:58:11.096748+00	
00000000-0000-0000-0000-000000000000	d0c1f151-0b99-4d60-b4d0-a3a3485522e6	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 21:00:06.596573+00	
00000000-0000-0000-0000-000000000000	725c538e-bb05-4e19-9b9f-9d035b22cfeb	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 21:00:06.618618+00	
00000000-0000-0000-0000-000000000000	96007ee4-2761-4d38-ab1c-e3203899f3d5	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 21:59:40.24146+00	
00000000-0000-0000-0000-000000000000	1e576ec4-60b9-44e1-90f0-990b15c0b121	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 21:59:40.267965+00	
00000000-0000-0000-0000-000000000000	4b6363d4-409c-4beb-842f-22a7545c932b	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 23:01:51.757067+00	
00000000-0000-0000-0000-000000000000	4628963a-9d14-4ed6-90f5-4144d6735e46	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-27 23:01:51.784357+00	
00000000-0000-0000-0000-000000000000	eb77b6cf-3d6d-431f-8ae6-34ab822fa4c2	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 00:04:09.142251+00	
00000000-0000-0000-0000-000000000000	7c55241e-d8fa-4497-8aa1-d7130d24ebc9	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 00:04:09.166709+00	
00000000-0000-0000-0000-000000000000	4ba2b079-a811-413c-acda-039e529103f1	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 01:06:32.854455+00	
00000000-0000-0000-0000-000000000000	4f677b58-a121-4526-aa5d-91f803e729b4	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 01:06:32.86618+00	
00000000-0000-0000-0000-000000000000	e5621660-7504-4073-976f-59e25a97b64f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 02:09:06.741816+00	
00000000-0000-0000-0000-000000000000	0bec8bb2-a604-424c-ac05-f49efa826f62	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 02:09:06.75711+00	
00000000-0000-0000-0000-000000000000	61404efc-a0f0-4613-afb0-4c160baf5200	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 03:22:02.963714+00	
00000000-0000-0000-0000-000000000000	b734e61d-7004-473b-b6f6-0226cea2d45a	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 03:22:02.985934+00	
00000000-0000-0000-0000-000000000000	3ef8efe1-b048-4abd-9224-549ce4305328	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 04:23:00.17066+00	
00000000-0000-0000-0000-000000000000	dec18db7-7a77-406a-a5b7-9667385eb21f	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 04:23:00.187816+00	
00000000-0000-0000-0000-000000000000	3f4889ab-8cd2-48fe-bbce-2170e74a830f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 05:23:49.329028+00	
00000000-0000-0000-0000-000000000000	21e055f8-b98b-4347-a074-d87a1b38c371	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 05:23:49.343818+00	
00000000-0000-0000-0000-000000000000	2afcddd9-b96d-4224-95b9-3ad8a7ead48f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 06:25:06.328449+00	
00000000-0000-0000-0000-000000000000	fee66291-dcf3-4bbc-815f-1bf3196c1b06	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 06:25:06.347674+00	
00000000-0000-0000-0000-000000000000	d2f4523c-096b-4555-bb78-7d435a1c979b	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 07:25:52.588115+00	
00000000-0000-0000-0000-000000000000	6cc6c3b0-08ab-4e72-9d62-80851c60bb2b	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 07:25:52.606618+00	
00000000-0000-0000-0000-000000000000	569eeb87-7f3d-402c-8c5e-e0ddd8278a3b	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 08:27:13.701322+00	
00000000-0000-0000-0000-000000000000	c5390f8d-b89f-4178-9e0c-c5993d68ff4b	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 08:27:13.719354+00	
00000000-0000-0000-0000-000000000000	a3d305b2-cd67-4388-b17e-768f45d52d6d	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 09:27:51.219317+00	
00000000-0000-0000-0000-000000000000	f3e89252-4037-495c-8c9e-01caaaa52208	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 09:27:51.226778+00	
00000000-0000-0000-0000-000000000000	4be1fb69-3714-4c1f-a425-f22d4e7b8147	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 10:28:54.690746+00	
00000000-0000-0000-0000-000000000000	e15fa8a7-2efc-4d31-90c5-d39074eaff61	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 10:28:54.703782+00	
00000000-0000-0000-0000-000000000000	ee0b1ea4-c67c-49e6-b254-c30e66638fa6	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 11:29:51.12982+00	
00000000-0000-0000-0000-000000000000	ad623d2e-635c-49b8-8134-7fb270f01ab4	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 11:29:51.138405+00	
00000000-0000-0000-0000-000000000000	6725b051-f6f0-4320-9c77-fc711a0f8328	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 12:31:18.09516+00	
00000000-0000-0000-0000-000000000000	b5f3c451-960e-412a-bd63-7ae534d7ecc6	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 12:31:18.106837+00	
00000000-0000-0000-0000-000000000000	fbd2fa51-ac4e-4135-bbf3-2d4e77193619	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 13:29:21.515035+00	
00000000-0000-0000-0000-000000000000	027345c8-5c9a-4089-8a8e-fe4e0725f974	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 13:29:21.52465+00	
00000000-0000-0000-0000-000000000000	661d4801-75b9-4727-b04c-76366fb05c24	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 14:27:32.46967+00	
00000000-0000-0000-0000-000000000000	f18bba5a-611d-483a-a72b-dea5b780f3fb	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 14:27:32.475542+00	
00000000-0000-0000-0000-000000000000	36ec722b-efa2-4d15-9d55-2c8697c758c4	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 15:26:10.816387+00	
00000000-0000-0000-0000-000000000000	406cc07e-b887-42bd-8e84-a82a47725a12	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 15:26:10.821057+00	
00000000-0000-0000-0000-000000000000	ffb36774-fb22-4ce3-9b68-34ad6abe4d60	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-01-28 15:53:59.972197+00	
00000000-0000-0000-0000-000000000000	68f08f51-c6ed-464a-90e3-01573922ad5f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 16:30:27.68213+00	
00000000-0000-0000-0000-000000000000	ad28a0d5-da11-4e46-b040-1121d2525aa7	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-01-28 16:30:27.704887+00	
00000000-0000-0000-0000-000000000000	91cc02d6-1709-4cb7-98b5-1f485f07b679	{"action":"login","actor_id":"38322fdd-1346-4f01-9325-955d246a89af","actor_name":"MFC","actor_username":"mondalfishcenter2005@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2026-03-25 05:47:48.113828+00	
00000000-0000-0000-0000-000000000000	36e15d52-78a3-4e86-aa90-577b7d6d1db9	{"action":"login","actor_id":"38322fdd-1346-4f01-9325-955d246a89af","actor_name":"MFC","actor_username":"mondalfishcenter2005@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider_type":"google"}}	2026-03-25 05:47:50.154244+00	
00000000-0000-0000-0000-000000000000	568f9307-3147-4e0e-9f97-06facc07fcda	{"action":"logout","actor_id":"38322fdd-1346-4f01-9325-955d246a89af","actor_name":"MFC","actor_username":"mondalfishcenter2005@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-03-25 05:47:51.99806+00	
00000000-0000-0000-0000-000000000000	23f798dd-15ba-4826-bb20-28d7a9dad351	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"manager@test.local","user_id":"8d124f7d-8eab-4be6-a1d7-55bcdc34753d","user_phone":""}}	2026-03-25 05:55:06.642964+00	
00000000-0000-0000-0000-000000000000	d018837a-4b2b-4c3d-b33a-21cca2826392	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"manager4@test.local","user_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","user_phone":""}}	2026-03-25 05:59:34.722366+00	
00000000-0000-0000-0000-000000000000	68ee5fbd-1b33-479a-80d2-838e109496da	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-25 06:01:26.690833+00	
00000000-0000-0000-0000-000000000000	5ab7f969-f993-4a0d-a9f0-c2ad7eb05750	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 06:59:51.97124+00	
00000000-0000-0000-0000-000000000000	bc2dab29-d36a-4553-96e8-4df707ae4be0	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 06:59:51.999458+00	
00000000-0000-0000-0000-000000000000	7b04ac6a-b23e-4ffa-b932-94def6a98858	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 07:58:15.586294+00	
00000000-0000-0000-0000-000000000000	7408e321-8390-48ce-a0c7-e1dd28f2d6d8	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 07:58:15.602613+00	
00000000-0000-0000-0000-000000000000	ce9277ab-cfd7-42a0-9650-ba821591a91f	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 08:56:24.084537+00	
00000000-0000-0000-0000-000000000000	2a36ae26-88b3-4a91-ab6c-f1a7cfa03662	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 08:56:24.107448+00	
00000000-0000-0000-0000-000000000000	f60cba24-5efd-48c8-bb62-668396689f9f	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 09:55:00.495679+00	
00000000-0000-0000-0000-000000000000	d9b0d38b-8a5d-4c4c-b2b9-06b4385eaeab	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 09:55:00.508772+00	
00000000-0000-0000-0000-000000000000	39e6290a-49cd-483c-bee3-ed774c4b1c90	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 11:27:23.421724+00	
00000000-0000-0000-0000-000000000000	65f42283-e9ba-4a97-880c-5f6460b136bd	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 11:27:23.444834+00	
00000000-0000-0000-0000-000000000000	271e15a9-177c-4e0a-a60d-5d5d4d52f464	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 12:30:43.961543+00	
00000000-0000-0000-0000-000000000000	362e5b43-5296-4d9d-ba6b-0bae728276fd	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 12:30:43.981139+00	
00000000-0000-0000-0000-000000000000	10b07cc2-3e1f-42d8-8669-f2605a149516	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 13:29:56.90224+00	
00000000-0000-0000-0000-000000000000	79f6970e-ff74-426c-8b2b-a4a2a57f5347	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 13:29:56.910043+00	
00000000-0000-0000-0000-000000000000	bbf6c668-0033-474f-bd52-f1a2f334b941	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 14:35:07.015644+00	
00000000-0000-0000-0000-000000000000	2b37771d-0104-43d2-8494-510d0a6deb22	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 14:35:07.034482+00	
00000000-0000-0000-0000-000000000000	44d00cfe-c9d2-46b2-bd28-f103884935e9	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 15:36:32.870835+00	
00000000-0000-0000-0000-000000000000	96590c2e-9a99-4214-bfea-064d150d8a05	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 16:34:50.530278+00	
00000000-0000-0000-0000-000000000000	d833c877-b4d2-4af6-8b99-c0ec95ff21b3	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 16:34:50.556803+00	
00000000-0000-0000-0000-000000000000	34fd20d6-33f4-4bf3-ac3e-b02c2a85fce8	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 17:34:18.846492+00	
00000000-0000-0000-0000-000000000000	0eaec8b0-e28a-4b7f-bfdc-45ca905c479d	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-25 17:34:18.86758+00	
00000000-0000-0000-0000-000000000000	6907f7ef-abd6-473a-9c59-de25623d93b5	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-27 20:29:13.234315+00	
00000000-0000-0000-0000-000000000000	b0d174c7-0f3b-46d6-bd51-ef8be6f00879	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-27 20:44:56.414766+00	
00000000-0000-0000-0000-000000000000	09c66493-7fbf-445f-b909-9b7304726b51	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-27 21:01:40.473851+00	
00000000-0000-0000-0000-000000000000	a99c92af-5778-4469-b15b-e21206ac192a	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 21:03:29.670764+00	
00000000-0000-0000-0000-000000000000	91e0833e-7426-40c3-8f27-393010b7543c	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 21:03:29.675037+00	
00000000-0000-0000-0000-000000000000	86fdd119-a20c-43c8-a9c3-a04c36d29be5	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-27 21:03:58.767799+00	
00000000-0000-0000-0000-000000000000	6dbad81a-6c8f-40f0-8332-0d8e60a2a2c2	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 22:02:22.647939+00	
00000000-0000-0000-0000-000000000000	68b43fcb-c2e2-4e09-a4a5-f5315c498b57	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 22:02:22.677558+00	
00000000-0000-0000-0000-000000000000	5935e73a-1fe1-4f92-bd6c-c8c8b91a8271	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 22:03:02.286669+00	
00000000-0000-0000-0000-000000000000	c8cd8b06-6965-467b-a084-29187a82e9b9	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 22:03:02.287407+00	
00000000-0000-0000-0000-000000000000	8d80879e-3674-4f6a-8554-feb8304928cf	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 23:02:03.531787+00	
00000000-0000-0000-0000-000000000000	4b18d95a-c371-47dc-947c-fe538277eca8	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 23:02:03.549174+00	
00000000-0000-0000-0000-000000000000	97bb9899-c9b2-41e5-8f96-aa755a020a7a	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 23:03:17.463102+00	
00000000-0000-0000-0000-000000000000	f51d1d61-fd9d-411c-899f-81e3ffa597d8	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-27 23:03:17.464488+00	
00000000-0000-0000-0000-000000000000	5c9e13d4-b21a-4407-ad03-8736e16d40a6	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-27 23:19:06.538163+00	
00000000-0000-0000-0000-000000000000	a6fe38a3-8881-4b08-b555-848092873b32	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 00:35:58.962637+00	
00000000-0000-0000-0000-000000000000	9af3a53d-bd7f-410f-aa8d-6d4e1338dbad	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 00:35:58.982569+00	
00000000-0000-0000-0000-000000000000	58b378e9-7f50-4e43-8de9-19b2b65459fb	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 01:49:11.872514+00	
00000000-0000-0000-0000-000000000000	50e91bb8-c360-440b-aa6a-701e6c7d9451	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 01:49:11.892471+00	
00000000-0000-0000-0000-000000000000	0a96f122-440b-4359-8f6b-f0b415c16c7c	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 03:04:04.764353+00	
00000000-0000-0000-0000-000000000000	a00ff2a9-d7d9-4f1e-8bfc-c8e3ad7686cf	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 03:04:04.784529+00	
00000000-0000-0000-0000-000000000000	5c201343-1b13-4356-ac2a-7b277e204dd6	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 03:19:12.106743+00	
00000000-0000-0000-0000-000000000000	7be5bdab-51ba-4dd3-90f2-72b185f9aeed	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 04:20:59.711021+00	
00000000-0000-0000-0000-000000000000	0c25cee3-891c-4549-9a62-14e3499b36b0	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 04:20:59.734329+00	
00000000-0000-0000-0000-000000000000	5d675f44-ce8b-41b4-a359-d144e87330a8	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 05:23:50.896766+00	
00000000-0000-0000-0000-000000000000	af31c1a6-91f1-48bf-b536-42ce79188c34	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 05:23:50.912035+00	
00000000-0000-0000-0000-000000000000	09612a3c-1898-46d7-9078-a427e1d001a4	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 06:25:23.541576+00	
00000000-0000-0000-0000-000000000000	f29a5e68-243a-4001-b0dc-e4c4f677723d	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 06:25:23.560889+00	
00000000-0000-0000-0000-000000000000	319ed6a3-bd92-4c93-93a6-a5ff3ff3645c	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 06:47:08.733663+00	
00000000-0000-0000-0000-000000000000	7cf1b642-45a9-42de-af59-c270169115de	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 06:47:08.744042+00	
00000000-0000-0000-0000-000000000000	1f65b080-0fcd-4f17-9961-0bc725d2a90e	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 07:17:41.84471+00	
00000000-0000-0000-0000-000000000000	d9c0d5d3-f791-4c17-8523-fc65ae071c28	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 07:24:16.601524+00	
00000000-0000-0000-0000-000000000000	b8788ddc-9eb7-4c4f-b957-26a1e5697b1e	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 07:24:16.613095+00	
00000000-0000-0000-0000-000000000000	5b07a72b-a992-4612-be75-86aebc6db716	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 07:45:11.607324+00	
00000000-0000-0000-0000-000000000000	31b61d06-9e0f-4953-b490-13fa988822a2	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 07:45:11.625612+00	
00000000-0000-0000-0000-000000000000	6077e4af-bafb-4f0c-9643-abe725f3bb00	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 08:16:16.583933+00	
00000000-0000-0000-0000-000000000000	083954d6-4cb9-49e3-b51f-d3e4385f03f9	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 08:16:16.592477+00	
00000000-0000-0000-0000-000000000000	ae546a8b-fd91-4100-b818-d38482f59fad	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 08:23:42.391678+00	
00000000-0000-0000-0000-000000000000	7b4fda00-3c45-47b3-9a46-7a240201797e	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 08:23:42.407876+00	
00000000-0000-0000-0000-000000000000	0a2c1723-55f7-499f-be4f-9bb9b96fe85c	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 09:15:10.271118+00	
00000000-0000-0000-0000-000000000000	a7d93aac-d91b-4cf7-b192-48844408bdf8	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 09:15:10.291023+00	
00000000-0000-0000-0000-000000000000	536598ba-7fff-44af-be6f-75a002e498b0	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 09:22:21.830311+00	
00000000-0000-0000-0000-000000000000	d04dea2c-cd95-4a31-bc4c-b90d3e338762	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 09:22:21.841315+00	
00000000-0000-0000-0000-000000000000	9291a663-f605-4372-ba6f-7255f8d00af8	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 09:42:25.383645+00	
00000000-0000-0000-0000-000000000000	fef59ecf-4ff5-4468-abcb-078789eb2085	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 09:42:25.396837+00	
00000000-0000-0000-0000-000000000000	e794b843-8323-4c4a-8bdc-a3a67a770770	{"action":"logout","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account"}	2026-03-28 10:03:08.514944+00	
00000000-0000-0000-0000-000000000000	390a1d5e-fc1f-474f-8dcc-fc727e38fea9	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 10:04:45.183651+00	
00000000-0000-0000-0000-000000000000	c510e40e-bca7-4c01-ab5e-480241a6e598	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 10:16:34.379979+00	
00000000-0000-0000-0000-000000000000	f2d7bbe8-bdff-4892-ac0d-74a6da50fe74	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 10:26:40.629487+00	
00000000-0000-0000-0000-000000000000	51e07591-1021-49ac-9743-bdc1a87dabea	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 11:02:54.869177+00	
00000000-0000-0000-0000-000000000000	d9ed7456-608f-4580-a589-8e69b509ebeb	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 11:02:54.881736+00	
00000000-0000-0000-0000-000000000000	0dcc2983-eb55-4795-93f5-69b90ef87829	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 11:25:15.949345+00	
00000000-0000-0000-0000-000000000000	066258b2-9b00-4ac9-b0e0-ea61b9ef71b9	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 11:25:15.958347+00	
00000000-0000-0000-0000-000000000000	81a81ea2-515b-4e60-b814-4fa747ff8db2	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 11:28:16.231075+00	
00000000-0000-0000-0000-000000000000	c222c3ce-79fd-4026-bd53-25e5c93547aa	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 11:28:16.233414+00	
00000000-0000-0000-0000-000000000000	c4eb6b9f-a23f-4205-beea-bb6add8a3dae	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 12:02:16.117552+00	
00000000-0000-0000-0000-000000000000	247dbd99-64c1-4d9f-a098-ba49062119a6	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 12:02:16.132288+00	
00000000-0000-0000-0000-000000000000	b329a2c2-6244-44e0-8587-68a3bea0eadf	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 12:24:15.80489+00	
00000000-0000-0000-0000-000000000000	88246186-9c8a-4905-88e5-41a16e5aa8a3	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 12:24:15.820244+00	
00000000-0000-0000-0000-000000000000	46cb754d-9abd-4ffb-9ebd-fb0411bb52bd	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 13:02:05.697929+00	
00000000-0000-0000-0000-000000000000	6429621d-1131-4d26-bd94-05a7be78a2a6	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 13:02:05.722968+00	
00000000-0000-0000-0000-000000000000	19431784-3948-41ce-801e-ef673a4cb723	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 13:59:31.45636+00	
00000000-0000-0000-0000-000000000000	5ff0c66a-d083-47de-b89a-1c83c182ee99	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 13:59:31.467856+00	
00000000-0000-0000-0000-000000000000	7d7c7fa6-0b79-40a9-99b6-51db994c4372	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 14:01:16.141176+00	
00000000-0000-0000-0000-000000000000	2d71fe9d-b5af-4e4e-8413-8b3f7c75f9f0	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 14:01:16.142425+00	
00000000-0000-0000-0000-000000000000	d804b503-9746-4445-9d1e-2d62094d3f91	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 14:38:15.704574+00	
00000000-0000-0000-0000-000000000000	def18dc5-5975-4037-9a3a-fbc09842a6bc	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 15:00:16.050353+00	
00000000-0000-0000-0000-000000000000	9de6f115-c703-459e-ba6d-b5c8c25a1d87	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 15:00:16.056909+00	
00000000-0000-0000-0000-000000000000	208a08ac-7d06-479d-bd24-78cf154ce5a1	{"action":"logout","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account"}	2026-03-28 15:01:13.917096+00	
00000000-0000-0000-0000-000000000000	514379fd-799c-4b38-a35d-71e7684639c0	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 15:01:42.724079+00	
00000000-0000-0000-0000-000000000000	19f8eb2b-2098-44cd-9b91-8d60bd1f6b6c	{"action":"logout","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account"}	2026-03-28 15:02:38.466621+00	
00000000-0000-0000-0000-000000000000	6a4ea3aa-3c86-450c-ba59-d6ef5371d8ab	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 15:05:43.504342+00	
00000000-0000-0000-0000-000000000000	1de112b3-dd98-41fa-a706-9d736d45b761	{"action":"logout","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account"}	2026-03-28 15:09:42.810355+00	
00000000-0000-0000-0000-000000000000	3996054e-1d82-4fd1-adad-090b1ab9101a	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 15:11:31.760532+00	
00000000-0000-0000-0000-000000000000	4299daf2-525f-4d17-82a2-d8c0cc4d1632	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 16:26:06.475263+00	
00000000-0000-0000-0000-000000000000	d22b4836-59c3-4281-9e23-939154a0eda7	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 16:26:06.495371+00	
00000000-0000-0000-0000-000000000000	649c2817-9a0a-4662-81fe-269594e9a55d	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 16:26:59.716367+00	
00000000-0000-0000-0000-000000000000	9e108807-ccb8-4121-b504-8faa212687a0	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 16:26:59.717589+00	
00000000-0000-0000-0000-000000000000	e5c9e822-fa08-4735-acf6-79c539a098e5	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 16:51:06.955164+00	
00000000-0000-0000-0000-000000000000	cdcb9a10-886e-4eb1-b813-15b05f1a4d6e	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-28 16:52:30.364897+00	
00000000-0000-0000-0000-000000000000	65f3901c-6ee0-410c-99b7-11d0057e73e1	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 17:22:28.842546+00	
00000000-0000-0000-0000-000000000000	a89bd3c0-9667-4401-874f-7fceade51b06	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 17:49:15.622641+00	
00000000-0000-0000-0000-000000000000	22b6d67e-3d16-4e5d-9706-460c3107d882	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 17:49:15.640645+00	
00000000-0000-0000-0000-000000000000	2c5d4327-c74f-4566-8ef0-eb5053afac53	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 17:50:54.690761+00	
00000000-0000-0000-0000-000000000000	e0df9416-884e-434c-8a39-102855b7f6ba	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 17:50:54.692614+00	
00000000-0000-0000-0000-000000000000	ce724f91-9b81-4d76-9ce8-a91b1a56a6d7	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:24:18.023483+00	
00000000-0000-0000-0000-000000000000	b4233c25-f4c1-4409-93a5-1581d2d368c0	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:24:18.042168+00	
00000000-0000-0000-0000-000000000000	c3243c63-eaa0-405f-8d38-75f0b0980e68	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:45:59.479301+00	
00000000-0000-0000-0000-000000000000	4ccf4a0d-cbc5-4d11-8751-c54d2728503f	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:45:59.489178+00	
00000000-0000-0000-0000-000000000000	7e52ae40-9f9f-4d94-8eae-7544e864b5e9	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:47:52.569702+00	
00000000-0000-0000-0000-000000000000	97d4004b-ddda-4dbe-a614-0b0ec48a8c23	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:47:52.5726+00	
00000000-0000-0000-0000-000000000000	c83c83f8-191f-47e9-87af-1b6222cd59d0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:49:04.089743+00	
00000000-0000-0000-0000-000000000000	0fcb8964-d228-47a3-8aeb-7a266ddc2d63	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 18:49:04.091221+00	
00000000-0000-0000-0000-000000000000	dba24c67-5884-4aff-8e43-2bf6495ea316	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:22:37.413808+00	
00000000-0000-0000-0000-000000000000	36d74467-0ade-44e6-b473-e1fdcbd9d06d	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:22:37.426383+00	
00000000-0000-0000-0000-000000000000	f9fa0ae0-d094-4f39-923f-f4dca612eee3	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:44:21.554011+00	
00000000-0000-0000-0000-000000000000	cae66aeb-fad8-4417-bde4-c83826ddc3b6	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:44:21.56531+00	
00000000-0000-0000-0000-000000000000	e8dfe334-8d8f-4aa0-8b74-4e38d58fd151	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:47:05.008194+00	
00000000-0000-0000-0000-000000000000	ac372b45-ceda-49b8-9819-143ace4bfa45	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:47:05.020528+00	
00000000-0000-0000-0000-000000000000	b5338ecd-c30e-410a-a109-fc04ff23c449	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:47:15.570905+00	
00000000-0000-0000-0000-000000000000	4cec3240-09ed-4101-ac54-8866a873f7a8	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 19:47:15.571566+00	
00000000-0000-0000-0000-000000000000	deb3fbed-7058-458a-bfd8-93a7b3f1e460	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 20:20:59.331351+00	
00000000-0000-0000-0000-000000000000	86cfcfc9-ec6a-45b5-9ac5-459ebc34e46b	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 20:20:59.344498+00	
00000000-0000-0000-0000-000000000000	a48f52c1-d132-4bf7-9383-2f4a5876696f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 21:06:55.509607+00	
00000000-0000-0000-0000-000000000000	c488427a-5cae-4944-b0ac-2ffbb09f8c51	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-28 21:06:55.512029+00	
00000000-0000-0000-0000-000000000000	ed567550-2205-4c8e-b0ae-508abc26aecf	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:38:39.795604+00	
00000000-0000-0000-0000-000000000000	d03a34ff-e59f-4232-a958-5f5ca961c373	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:38:39.818838+00	
00000000-0000-0000-0000-000000000000	5207257b-89fb-41ab-a239-bc5ead810694	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:39:36.550812+00	
00000000-0000-0000-0000-000000000000	85ba2474-409a-4e3e-95aa-68acdef720c8	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:39:36.55328+00	
00000000-0000-0000-0000-000000000000	7c7b9ad2-d1ad-48ae-94ee-7129acb54dce	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:40:08.196023+00	
00000000-0000-0000-0000-000000000000	4c5db3d5-de7e-4b1c-af47-13490d4af2d1	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:40:08.199144+00	
00000000-0000-0000-0000-000000000000	7c9ec8ae-73e0-497e-b4a8-8f078f428dba	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:40:30.394544+00	
00000000-0000-0000-0000-000000000000	aa24e6f6-0e78-4bc7-b5d9-72fc5c5c1b0e	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 09:40:30.395598+00	
00000000-0000-0000-0000-000000000000	5b67214b-7344-4821-8f8e-9095cadda835	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 10:37:37.863143+00	
00000000-0000-0000-0000-000000000000	bd214fde-7a0a-4dd4-a15f-716bbbb490ea	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 10:37:37.881865+00	
00000000-0000-0000-0000-000000000000	93479caf-ac23-4335-8cef-981757ecdc5f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 10:39:49.038986+00	
00000000-0000-0000-0000-000000000000	e3ddbe0d-85c3-4094-8edf-7ba801910e8d	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 10:39:49.045191+00	
00000000-0000-0000-0000-000000000000	c8064af7-a3d3-455f-b643-a3f66046d7fa	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 11:35:46.632655+00	
00000000-0000-0000-0000-000000000000	dffeabd9-0fe2-43b9-b2a9-98316924f3d9	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 11:35:46.652299+00	
00000000-0000-0000-0000-000000000000	84058b30-a218-4553-be89-24b7ce037f9c	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 12:28:22.656144+00	
00000000-0000-0000-0000-000000000000	15c19c20-79ce-4eb8-968c-46c42eda6455	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 12:28:22.674561+00	
00000000-0000-0000-0000-000000000000	1f1d209d-7bd4-4eaa-9590-ee236b7f3652	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 16:20:13.724469+00	
00000000-0000-0000-0000-000000000000	cf3e7cfd-1ea5-4816-92f5-5a7609d75450	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 16:20:13.741537+00	
00000000-0000-0000-0000-000000000000	e577a68b-310e-444d-be3e-3c8f80c77123	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 16:20:51.863707+00	
00000000-0000-0000-0000-000000000000	b962afbc-5326-468c-8d00-7ffcc4ef956d	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 16:20:51.867596+00	
00000000-0000-0000-0000-000000000000	a2676837-fe67-4c84-9384-e2becf71c592	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 17:30:14.689544+00	
00000000-0000-0000-0000-000000000000	e950481a-b475-42e7-8ce0-a19fadbb4bfb	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 17:30:14.711416+00	
00000000-0000-0000-0000-000000000000	88c47973-0446-4a68-b80d-38232c96c178	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 18:01:19.565633+00	
00000000-0000-0000-0000-000000000000	db996097-bb10-48a1-9070-9bb09788f348	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 18:01:19.574699+00	
00000000-0000-0000-0000-000000000000	0dde9742-5733-4cc6-9caa-14da8519c31e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 18:56:05.071963+00	
00000000-0000-0000-0000-000000000000	d5b1d990-87cf-4121-84ac-2bc5c6b6de8e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 18:56:05.086743+00	
00000000-0000-0000-0000-000000000000	4468ae3c-9a55-45c2-87bb-bce2a087e756	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 19:23:46.094544+00	
00000000-0000-0000-0000-000000000000	21cffec2-31a8-4a4b-9283-fb9bd61f5d07	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 19:23:46.104447+00	
00000000-0000-0000-0000-000000000000	20af91d1-45bf-4bd9-869b-95f5863672db	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 19:56:19.033033+00	
00000000-0000-0000-0000-000000000000	d26089e7-bf61-4670-9156-492b1fac86cf	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 19:56:19.048613+00	
00000000-0000-0000-0000-000000000000	9369a1d9-4fca-452a-9f8a-52348282217a	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 20:24:16.243271+00	
00000000-0000-0000-0000-000000000000	e4b7571c-a0fa-433c-a435-850698a97941	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 20:24:16.257393+00	
00000000-0000-0000-0000-000000000000	a267769e-65c3-4538-9fa5-a6ee3cf29fc9	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 21:13:37.70085+00	
00000000-0000-0000-0000-000000000000	e7dd2484-5df2-4bb2-b8f3-3aa0aa211c2e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 21:13:37.722357+00	
00000000-0000-0000-0000-000000000000	bc301a5c-7d7d-44d5-8e09-32fd1b351a86	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 21:25:31.13957+00	
00000000-0000-0000-0000-000000000000	685dad14-b7da-4517-9b6c-678d43601fdd	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 21:25:31.148814+00	
00000000-0000-0000-0000-000000000000	7be34e23-8004-4228-bf79-44f0059499d2	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 22:26:16.301917+00	
00000000-0000-0000-0000-000000000000	dd85b821-4ab5-48a9-a812-66467acfcf09	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 22:26:16.310511+00	
00000000-0000-0000-0000-000000000000	3f2b21cb-cc7b-4494-9954-dc0535fc0796	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 22:26:19.019086+00	
00000000-0000-0000-0000-000000000000	f6c6a4b3-65d7-42ee-a9da-14aebe9013ba	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 22:26:19.022125+00	
00000000-0000-0000-0000-000000000000	268d70f4-05ff-4d19-a012-1bdd52ce934f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 23:27:12.064857+00	
00000000-0000-0000-0000-000000000000	7a249249-efe3-4689-b3ba-49efb79fed12	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 23:27:12.091335+00	
00000000-0000-0000-0000-000000000000	fac9cdb3-2042-45dc-b0f7-2a10861cf2f2	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 23:27:25.078995+00	
00000000-0000-0000-0000-000000000000	c8b560c1-f7c3-458d-8826-e34d9f1c897e	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-29 23:27:25.085058+00	
00000000-0000-0000-0000-000000000000	7a6012ec-29d5-4fe5-b41f-ebb61352a5e8	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 01:29:34.532207+00	
00000000-0000-0000-0000-000000000000	890b95eb-f11a-4e06-a256-1ece8199468f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 01:29:34.53238+00	
00000000-0000-0000-0000-000000000000	ffcce636-de91-44e5-9fbc-5202a1e20ee5	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 01:29:34.55571+00	
00000000-0000-0000-0000-000000000000	2c940b1f-26e5-492f-b3d7-b92c98523582	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 01:29:34.55561+00	
00000000-0000-0000-0000-000000000000	3e8b4f22-192d-45de-9b48-0d8ac8259172	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 03:31:26.478738+00	
00000000-0000-0000-0000-000000000000	ab8aff45-5786-4c91-ab87-773ccee08b15	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 03:31:26.478635+00	
00000000-0000-0000-0000-000000000000	928972c2-1c07-4d18-8902-edae7dc060b0	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 03:31:26.496417+00	
00000000-0000-0000-0000-000000000000	77cb96e0-c6f5-454b-b699-32184d5a289d	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 03:31:26.496314+00	
00000000-0000-0000-0000-000000000000	22e6e39e-2481-45af-9cb1-30ab0db0f15b	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 04:30:49.920649+00	
00000000-0000-0000-0000-000000000000	ad56672b-f27a-452a-bd33-233dab28aa83	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 04:30:49.938027+00	
00000000-0000-0000-0000-000000000000	a4e0d532-ee5e-4e11-aa74-eaf479e77f23	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 04:37:22.490176+00	
00000000-0000-0000-0000-000000000000	bd1de45e-84b0-4bc0-a802-a7593e4dc4b4	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 04:37:22.499638+00	
00000000-0000-0000-0000-000000000000	99ab852e-8b46-498a-b20d-fa1e2787c0e6	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 05:32:39.946622+00	
00000000-0000-0000-0000-000000000000	671af53f-987b-468e-9422-4ee1c9dc85e4	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 05:32:39.955872+00	
00000000-0000-0000-0000-000000000000	bec31abc-dac8-4f89-8458-e963384124cc	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 06:33:33.737077+00	
00000000-0000-0000-0000-000000000000	84eb014c-2453-47be-a061-4b908424871b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 06:33:33.755396+00	
00000000-0000-0000-0000-000000000000	c5fc5915-a414-4ef9-a063-c08dca6a4b7b	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 07:34:29.165996+00	
00000000-0000-0000-0000-000000000000	6a2d27f2-448e-45a3-8267-052bc6844f9e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 07:34:29.181822+00	
00000000-0000-0000-0000-000000000000	7447b918-be77-43b9-ac45-27cb9daaf592	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 08:35:46.703362+00	
00000000-0000-0000-0000-000000000000	345ef94e-6ca5-47cb-bb54-71466bcb957b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 08:35:46.716458+00	
00000000-0000-0000-0000-000000000000	1565d6c4-5938-48c8-97f8-01fe712cec42	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 09:36:31.543351+00	
00000000-0000-0000-0000-000000000000	4ab03520-3b48-4267-b678-669a20b2fd61	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 09:36:31.554392+00	
00000000-0000-0000-0000-000000000000	05091c70-3c2d-4acf-9f9d-f0fb83923f5b	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 10:08:13.370994+00	
00000000-0000-0000-0000-000000000000	cb578b36-8df2-4598-819d-a463d0c6e5e5	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 10:08:13.384327+00	
00000000-0000-0000-0000-000000000000	55cbdad2-9ce9-4d36-bff2-a54916a6d2f0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 10:37:15.612383+00	
00000000-0000-0000-0000-000000000000	00b56c2e-757f-43c3-b097-93eb3c6d5729	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 10:37:15.623193+00	
00000000-0000-0000-0000-000000000000	e6b58da1-2f6c-458d-a654-8e77da125ba1	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 11:28:40.42124+00	
00000000-0000-0000-0000-000000000000	07ef6edb-34c1-425d-9782-f9563375f870	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 11:28:40.436666+00	
00000000-0000-0000-0000-000000000000	5cb32d26-7182-4878-848b-c6c3177180cd	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 11:38:09.425603+00	
00000000-0000-0000-0000-000000000000	d6e9091e-aa88-4863-b170-b049898bd7d8	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 11:38:09.434888+00	
00000000-0000-0000-0000-000000000000	4813eb63-3632-4935-a9be-b1d3677a4269	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 12:39:11.565949+00	
00000000-0000-0000-0000-000000000000	f02a690c-45d9-43a1-a726-81b01cf0b619	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 12:39:11.584768+00	
00000000-0000-0000-0000-000000000000	b89ee6b7-944e-43b9-b399-e2d2c03d5a7e	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 12:39:18.263498+00	
00000000-0000-0000-0000-000000000000	0f0de266-d88b-4abf-b0f8-db82fcf2f0ce	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 12:39:18.271875+00	
00000000-0000-0000-0000-000000000000	f4230e9e-3239-40d9-a488-cf63216389e9	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 13:52:20.773784+00	
00000000-0000-0000-0000-000000000000	a727c826-9ac9-4820-bff8-97f41de1baa0	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 13:52:20.786157+00	
00000000-0000-0000-0000-000000000000	0de6af48-e464-4b68-a4e2-f3eb2a522304	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 13:52:34.957415+00	
00000000-0000-0000-0000-000000000000	09aa1033-73f4-4866-bad2-aab12b46d217	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 13:52:34.959481+00	
00000000-0000-0000-0000-000000000000	c06802a7-e8ca-429f-9633-d7c98ba95fbe	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 15:30:41.864094+00	
00000000-0000-0000-0000-000000000000	425b6c4e-6c74-4e0b-a107-799e125e19f1	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 15:30:41.879518+00	
00000000-0000-0000-0000-000000000000	dee8eb7b-e347-4705-8dc4-dae071f25eb7	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 15:30:42.526933+00	
00000000-0000-0000-0000-000000000000	4c215b88-b7fd-484b-8119-19eabb038e4b	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 15:30:42.528474+00	
00000000-0000-0000-0000-000000000000	888ba87c-7ddc-4144-9e19-dcf2551c5e13	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 16:43:16.795607+00	
00000000-0000-0000-0000-000000000000	7b2b65a5-bc19-4053-9c5f-8dd8e732959c	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 16:43:16.816445+00	
00000000-0000-0000-0000-000000000000	4ffed866-19d0-4b75-8bd5-ba7149e9496a	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 16:43:16.879812+00	
00000000-0000-0000-0000-000000000000	94f168f3-a280-4243-add2-ccd3a506016c	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 16:43:16.880599+00	
00000000-0000-0000-0000-000000000000	ce4772be-df06-4e9b-be82-d0895fa03c4f	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 17:44:28.798244+00	
00000000-0000-0000-0000-000000000000	55eed9e3-b599-4634-9f2b-47e582f816d7	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 17:44:28.797568+00	
00000000-0000-0000-0000-000000000000	81baa6b7-4bc4-4d2f-874c-432c514cc6cc	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 17:44:28.818453+00	
00000000-0000-0000-0000-000000000000	12ba8baa-e372-433e-9c25-c2e2291bab1f	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 17:44:28.818643+00	
00000000-0000-0000-0000-000000000000	184f7718-2b62-4765-b918-fc7356c3404b	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 18:45:32.72869+00	
00000000-0000-0000-0000-000000000000	050b2dc3-94c0-4c1c-8aee-843f7a4b5521	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 18:45:32.740598+00	
00000000-0000-0000-0000-000000000000	f4958cca-1e48-4a59-a9d7-b9940ec5cd66	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 18:45:51.194765+00	
00000000-0000-0000-0000-000000000000	fddf9908-3b2a-45f6-95cc-8a0e789c518c	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 18:45:51.198606+00	
00000000-0000-0000-0000-000000000000	20b46807-5c42-4d6e-9b82-88c296cd71bf	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 20:02:20.122203+00	
00000000-0000-0000-0000-000000000000	7ca64494-6ca3-45d7-8662-41249fde96a9	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 20:02:20.134478+00	
00000000-0000-0000-0000-000000000000	0d6c63d1-755a-4924-b327-7e7ee1f192e7	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 21:03:31.113699+00	
00000000-0000-0000-0000-000000000000	dacfe06e-e2fa-49e7-9a81-c0949d7ea37b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 21:03:31.128303+00	
00000000-0000-0000-0000-000000000000	0def7423-4d8a-4e80-8f9d-9db1cd9ccc39	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 22:05:06.92737+00	
00000000-0000-0000-0000-000000000000	9348c35e-189d-446f-b098-59533c5742fa	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 22:05:06.933505+00	
00000000-0000-0000-0000-000000000000	c2477e19-cee3-4876-b24e-1135aea8a439	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 22:49:12.836875+00	
00000000-0000-0000-0000-000000000000	0689a4d7-2855-4fb8-b8d3-c999ffb1ffa4	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 22:49:12.849108+00	
00000000-0000-0000-0000-000000000000	2052a128-39eb-4ed2-924f-4ec7e2e7d75a	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 23:23:35.598719+00	
00000000-0000-0000-0000-000000000000	18e5a910-eb15-47a7-b0b8-e60ff203f2e6	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 23:23:35.610532+00	
00000000-0000-0000-0000-000000000000	692c105a-b444-4045-8b9d-95744745aa77	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 23:50:12.915492+00	
00000000-0000-0000-0000-000000000000	0c39193d-fd6d-42c3-91fd-67ad0935d3c5	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-30 23:50:12.929767+00	
00000000-0000-0000-0000-000000000000	a090f746-d24d-4f23-aff7-f16480d6c36c	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 02:04:10.168508+00	
00000000-0000-0000-0000-000000000000	8015782e-e447-43db-8580-6b9f3d5b13e2	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 02:04:10.19225+00	
00000000-0000-0000-0000-000000000000	a576ff50-0e6a-4f98-a422-a81f6b1b7340	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 02:04:14.080023+00	
00000000-0000-0000-0000-000000000000	fd52e5dd-dba8-4865-ba2d-6597993e7c05	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 02:04:14.08152+00	
00000000-0000-0000-0000-000000000000	df386312-636f-4bda-a0a5-a5905b4532a2	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 03:58:58.052747+00	
00000000-0000-0000-0000-000000000000	ad8eb362-3ed9-484a-8127-d0a514f29c29	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 03:58:58.065756+00	
00000000-0000-0000-0000-000000000000	d7b03037-9a12-4a4e-b93d-2940de31ff5d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 03:59:09.957871+00	
00000000-0000-0000-0000-000000000000	9f05a602-62d5-4a2c-8b25-ff514ea36f1b	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 03:59:09.959257+00	
00000000-0000-0000-0000-000000000000	2776d547-7982-4675-ba73-a3a9b47b7295	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 05:16:10.072528+00	
00000000-0000-0000-0000-000000000000	3e4a2518-0891-4b1d-a92d-acae23acc922	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 05:16:10.083997+00	
00000000-0000-0000-0000-000000000000	68b90447-d734-45d4-bdef-fc2480a28ea1	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 05:16:12.422693+00	
00000000-0000-0000-0000-000000000000	c6dd4e72-d922-43b6-b6a6-fa70d8e784a7	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 05:16:12.424461+00	
00000000-0000-0000-0000-000000000000	f5d54da5-e9a5-4656-bd82-643119d13b11	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 06:48:15.140231+00	
00000000-0000-0000-0000-000000000000	c6a79245-f3a0-4ba4-9f7e-b60d2394ee32	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 06:48:15.151326+00	
00000000-0000-0000-0000-000000000000	b8e8ea1b-d6cc-4376-80d4-4f463f5f8779	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 06:48:18.177615+00	
00000000-0000-0000-0000-000000000000	72743559-e7a6-4575-9410-6013af3ec9af	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 06:48:18.178322+00	
00000000-0000-0000-0000-000000000000	41dc61af-08f6-425e-97fd-2798a2aa11d6	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 07:58:25.808616+00	
00000000-0000-0000-0000-000000000000	885e0df7-1a82-478f-99fc-b76839723f44	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 07:58:25.806872+00	
00000000-0000-0000-0000-000000000000	9ef506ac-a80e-492b-a004-76b1b95f2bec	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 07:58:25.820637+00	
00000000-0000-0000-0000-000000000000	10552396-668e-43f3-a8f4-975558171049	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 07:58:25.820738+00	
00000000-0000-0000-0000-000000000000	a7f92ed3-b455-4744-8327-99bfd7d24f73	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 08:59:14.31209+00	
00000000-0000-0000-0000-000000000000	09c13633-b2de-4f90-80ab-6fbd149415bd	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 08:59:14.311925+00	
00000000-0000-0000-0000-000000000000	db83b2c9-5958-4481-9994-da4fd6fa482c	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 08:59:14.325398+00	
00000000-0000-0000-0000-000000000000	68dfe8bc-f4b0-466a-8624-9a89ea5b12ee	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 08:59:14.325541+00	
00000000-0000-0000-0000-000000000000	c574a2d0-01df-4d2f-89ed-972ef1b9caaa	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 10:00:41.549533+00	
00000000-0000-0000-0000-000000000000	2fd5e3f1-547b-4703-9212-0a1073357b5d	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 10:00:41.563916+00	
00000000-0000-0000-0000-000000000000	3e46e872-be33-49f0-9a88-4034449ed998	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 10:00:42.258835+00	
00000000-0000-0000-0000-000000000000	8da1f15f-e70f-4d43-b005-a998bbcde788	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 10:00:42.261528+00	
00000000-0000-0000-0000-000000000000	97f48bbe-327f-4103-9fa4-2ff96dbca324	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:12:15.716724+00	
00000000-0000-0000-0000-000000000000	5f2c5142-9751-4a95-a77d-72cfe0085fe9	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:12:15.74655+00	
00000000-0000-0000-0000-000000000000	fbed924f-3fa4-4c16-a19c-9b5958aa2378	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:12:49.656754+00	
00000000-0000-0000-0000-000000000000	bf3849c5-b9bb-4ac9-854d-a82d06b31e91	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:12:49.673843+00	
00000000-0000-0000-0000-000000000000	8d76d442-214d-403d-b7ef-f0a9acb1286c	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:14:38.354768+00	
00000000-0000-0000-0000-000000000000	3c996ea0-98d3-4e01-a01a-53aaa2870d3e	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:14:38.365313+00	
00000000-0000-0000-0000-000000000000	204148f8-c535-4090-b4b6-b25914436887	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:55:25.218245+00	
00000000-0000-0000-0000-000000000000	d1a4faac-b9c9-4eb7-9edd-b3ca7320d7a4	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 13:55:25.230699+00	
00000000-0000-0000-0000-000000000000	d2023022-4ee8-415b-b110-d1fb62f0a357	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 14:10:32.747361+00	
00000000-0000-0000-0000-000000000000	2230b3aa-6c23-4b39-8b27-92efc952c869	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 14:10:32.75758+00	
00000000-0000-0000-0000-000000000000	6639d673-2859-49d1-b7ed-c41ee1d795e7	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 14:30:07.511135+00	
00000000-0000-0000-0000-000000000000	389d7a29-77c9-4465-a2cc-6375283e42e8	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 14:30:07.522638+00	
00000000-0000-0000-0000-000000000000	e8aed602-3bc2-4c38-8ffd-44b7eab43002	{"action":"login","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-03-31 14:37:55.626513+00	
00000000-0000-0000-0000-000000000000	0de07278-6f87-4ab6-9883-f7601af7c29f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 15:08:42.122228+00	
00000000-0000-0000-0000-000000000000	c1a79eed-9d43-4eb8-9bea-1cce25cbb9c0	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 15:08:42.134673+00	
00000000-0000-0000-0000-000000000000	083ea987-16f9-4700-aa4d-a7551bf5f5e3	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 15:36:22.323026+00	
00000000-0000-0000-0000-000000000000	d2636d35-24ae-4f84-9436-3e2c34b7033c	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 15:36:22.333752+00	
00000000-0000-0000-0000-000000000000	5e52078e-7ba9-4516-aaeb-943e706949f8	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 16:07:12.340161+00	
00000000-0000-0000-0000-000000000000	3b877da1-7f9d-406e-8793-6504b2e7515e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 16:07:12.350673+00	
00000000-0000-0000-0000-000000000000	311df8ef-ae03-410d-914f-48909adce2b2	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 16:35:13.610124+00	
00000000-0000-0000-0000-000000000000	f66cfa41-f48e-4cb1-99db-356b1859e02d	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 16:35:13.619833+00	
00000000-0000-0000-0000-000000000000	6b4abb1a-35c7-41ed-a2c0-54cec8510ba5	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 17:05:13.002277+00	
00000000-0000-0000-0000-000000000000	36bd86a7-7371-48e0-adb8-f333164fcb37	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 17:05:13.016041+00	
00000000-0000-0000-0000-000000000000	ef0b9d59-c99d-4e0f-9b4a-56714740fc61	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 17:33:43.157092+00	
00000000-0000-0000-0000-000000000000	61d15c59-6629-4637-a391-b2688ee4f9ce	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 17:33:43.177578+00	
00000000-0000-0000-0000-000000000000	7433a01c-dead-4484-bfa9-bbefefe6ae58	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 18:03:43.647228+00	
00000000-0000-0000-0000-000000000000	a2daff40-a7ac-4826-b11e-ba12a46f593d	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 18:03:43.659458+00	
00000000-0000-0000-0000-000000000000	f5d1e450-2a45-4327-8a17-4df3855106b1	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 18:32:00.915487+00	
00000000-0000-0000-0000-000000000000	236782a0-347a-4a78-8c23-af8ceae3c458	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 18:32:00.924454+00	
00000000-0000-0000-0000-000000000000	3062e37e-c04b-48ed-b380-e998eaf9e8fe	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 19:01:43.891642+00	
00000000-0000-0000-0000-000000000000	c0803495-a37a-40be-85d4-7430256a698d	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-03-31 19:01:43.900716+00	
00000000-0000-0000-0000-000000000000	fedacabd-0826-4f81-bbeb-ae53dbb30a11	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 05:47:43.48166+00	
00000000-0000-0000-0000-000000000000	d1be2a1a-e233-4563-8c5c-b707045ddd17	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 05:47:43.492812+00	
00000000-0000-0000-0000-000000000000	f386386f-fb83-4485-bc70-34404428b6db	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 05:48:42.089421+00	
00000000-0000-0000-0000-000000000000	a5f60f14-9cbd-4d2d-8b1d-72ab7463d843	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 05:48:42.090091+00	
00000000-0000-0000-0000-000000000000	770e7fb7-99de-410e-8cb3-ca1d226d3665	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:23:09.399341+00	
00000000-0000-0000-0000-000000000000	8707f54f-f404-4a14-b4c4-42f944783e56	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:23:09.422853+00	
00000000-0000-0000-0000-000000000000	fd6e158c-4e7f-4c75-b532-4e16e99050b3	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:23:09.74295+00	
00000000-0000-0000-0000-000000000000	97166783-2c4b-42fb-bfd1-839125a845a3	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:23:09.746825+00	
00000000-0000-0000-0000-000000000000	494633b0-eb74-47f4-bdff-c175962c0fa3	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:23:16.364162+00	
00000000-0000-0000-0000-000000000000	16916ac7-beb5-4984-80e8-2e05586725c4	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:27:11.409193+00	
00000000-0000-0000-0000-000000000000	6ac5ca36-5742-4010-a3b7-a0623ec7586d	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-01 07:27:11.417578+00	
00000000-0000-0000-0000-000000000000	0080123a-7ed0-47cc-a9de-69d94624ad6b	{"action":"token_refreshed","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 04:46:33.280388+00	
00000000-0000-0000-0000-000000000000	b5bb3fe1-0b83-48c8-a04b-29f030f4cd13	{"action":"token_revoked","actor_id":"24766c66-a4fd-407b-bc73-afd6feedd8c2","actor_username":"manager3@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 04:46:33.305373+00	
00000000-0000-0000-0000-000000000000	f4d3e78b-3b43-4e0f-ac77-c2a8937c6c4c	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-02 04:47:09.265523+00	
00000000-0000-0000-0000-000000000000	62c12743-6d74-4c3c-99c6-68456ef0e81d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 05:45:58.12703+00	
00000000-0000-0000-0000-000000000000	c148c723-303e-4a7d-b348-0a5ee11f1fdc	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 05:45:58.142188+00	
00000000-0000-0000-0000-000000000000	e3133757-2a66-4f25-976a-37e8c3996047	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 07:48:42.156606+00	
00000000-0000-0000-0000-000000000000	76dc7ee2-8d03-420b-bd5d-f53d10fbfd9f	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 07:48:42.182412+00	
00000000-0000-0000-0000-000000000000	6de60f68-17ac-4925-9885-bbde33631605	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 08:49:48.632104+00	
00000000-0000-0000-0000-000000000000	e49e0721-0efd-4b0a-bc45-3a4268be5be2	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 08:49:48.64635+00	
00000000-0000-0000-0000-000000000000	6016e41b-154a-49dd-aea1-0ce717d1924c	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 09:50:55.263706+00	
00000000-0000-0000-0000-000000000000	3b9dd50d-ea86-45ff-a659-fb00ab7edfcf	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 09:50:55.283303+00	
00000000-0000-0000-0000-000000000000	f9c6cf8c-7fd9-4a5d-bb48-e2dc4a1a5a87	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 10:52:00.078761+00	
00000000-0000-0000-0000-000000000000	b4de8b49-4b65-422a-b030-af9c3ff06a72	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 10:52:00.101925+00	
00000000-0000-0000-0000-000000000000	12bf1d32-5026-4a41-b02e-9ce0928ee77b	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 11:52:58.852637+00	
00000000-0000-0000-0000-000000000000	1e640d29-a0d0-4d6e-8990-58fac933ca23	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 11:52:58.863951+00	
00000000-0000-0000-0000-000000000000	abce9824-e0cf-4728-b500-3fc0a0a375c0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 12:54:27.650842+00	
00000000-0000-0000-0000-000000000000	f8630065-23f8-4dd3-aa11-e41e1bdb3c6f	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 12:54:27.664575+00	
00000000-0000-0000-0000-000000000000	45e751da-f631-417f-ba87-4d419e3fbe9f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 13:54:51.918827+00	
00000000-0000-0000-0000-000000000000	d58b77f0-a46b-4eb3-89cb-7c8ec996ec47	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 13:54:51.93229+00	
00000000-0000-0000-0000-000000000000	006f19a8-aaf1-4977-8140-20a21ab3c024	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 14:53:09.947713+00	
00000000-0000-0000-0000-000000000000	1b7681aa-0019-42cc-986a-d822e0969213	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 14:53:09.964986+00	
00000000-0000-0000-0000-000000000000	f0452795-e401-4f23-812b-796bf457470f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 15:51:27.939633+00	
00000000-0000-0000-0000-000000000000	f6b3b0bd-f87c-4f80-a436-f7e99de8270f	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 15:51:27.957258+00	
00000000-0000-0000-0000-000000000000	9d78cac5-2408-469b-b6e8-1bdb56c03d8d	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 16:49:29.081343+00	
00000000-0000-0000-0000-000000000000	4b6d1358-38f3-44cc-a8ec-0b75904903cc	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 16:49:29.09427+00	
00000000-0000-0000-0000-000000000000	a506bd74-73e0-4df1-bec3-7d13ab5499d0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 17:48:06.417513+00	
00000000-0000-0000-0000-000000000000	afc3b0f4-b633-4176-96fb-1b2bd3169697	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-02 17:48:06.438553+00	
00000000-0000-0000-0000-000000000000	8c736553-7d5a-4f8b-945f-ab213ac0debf	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 05:41:54.509308+00	
00000000-0000-0000-0000-000000000000	ed6e8d2e-4bc3-485d-9be7-152eab15e7d8	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 05:41:54.533963+00	
00000000-0000-0000-0000-000000000000	c936a5af-7515-42cc-95e1-7cce2d7a2e08	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 06:40:18.504614+00	
00000000-0000-0000-0000-000000000000	cdafaf1c-0dda-49d9-83f0-e8f3cbc58304	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 06:40:18.534472+00	
00000000-0000-0000-0000-000000000000	dd7b50d3-bdad-4c2d-a667-8f42e002013a	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 10:47:20.347656+00	
00000000-0000-0000-0000-000000000000	0b13e186-8a99-4945-8243-4652403f1a9c	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 10:47:20.377019+00	
00000000-0000-0000-0000-000000000000	26367082-14a5-4669-a6b6-722a0e2326be	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 11:46:33.016032+00	
00000000-0000-0000-0000-000000000000	8f4a773e-3389-43e2-ad09-3d3576e4a478	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 11:46:33.028147+00	
00000000-0000-0000-0000-000000000000	e751fe1c-2ce6-40e5-906d-ab77f7f343dc	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 13:09:36.426818+00	
00000000-0000-0000-0000-000000000000	c9218227-aa73-4857-b0a4-638f56c5e805	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 13:09:36.454234+00	
00000000-0000-0000-0000-000000000000	b427181b-ee26-4cb0-9d7e-2dadc8ce8d47	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 13:43:47.257343+00	
00000000-0000-0000-0000-000000000000	b791410c-3cff-46a5-8b84-e0599e75616c	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 14:49:48.214806+00	
00000000-0000-0000-0000-000000000000	cb4bbb53-9471-443b-8145-7581872631c8	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 14:49:48.238351+00	
00000000-0000-0000-0000-000000000000	93d82c72-10b0-4c64-bb5c-7143d4445193	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 15:48:01.319439+00	
00000000-0000-0000-0000-000000000000	cb6effde-afed-49e3-a915-017fc6dc45e4	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 15:48:01.341714+00	
00000000-0000-0000-0000-000000000000	56e6d364-e6c6-4206-bc0c-9d233cc6e0e9	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 16:46:18.264391+00	
00000000-0000-0000-0000-000000000000	63525491-864c-4b8e-8081-fbebff61d463	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 16:46:18.275067+00	
00000000-0000-0000-0000-000000000000	2b937ef0-86e9-4e33-ae6b-4e733cae3bbe	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 17:44:48.347103+00	
00000000-0000-0000-0000-000000000000	23283fd1-b71b-42d8-b9ea-8ce819847508	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 17:44:48.366906+00	
00000000-0000-0000-0000-000000000000	abeb4fd1-3533-4c4e-afc2-0e08695e1a50	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 18:43:18.14813+00	
00000000-0000-0000-0000-000000000000	fa65d0a2-c7f0-4819-9b98-f4ac4d4d1e3d	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 18:43:18.171946+00	
00000000-0000-0000-0000-000000000000	07776181-0335-4ce2-8796-02ef4d3b27b0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 19:41:48.181915+00	
00000000-0000-0000-0000-000000000000	15a0202a-c09f-40ba-a6cc-85b951de3fa5	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 19:41:48.192471+00	
00000000-0000-0000-0000-000000000000	3c868bf2-0031-45b5-89a2-3edc86ccdcc5	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 20:40:57.14569+00	
00000000-0000-0000-0000-000000000000	4ff676d8-61ae-4a8a-89d7-6525f9200d60	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 20:40:57.1613+00	
00000000-0000-0000-0000-000000000000	a4a5e777-6a8c-4273-a0e7-f14fccf742e6	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 21:39:17.730557+00	
00000000-0000-0000-0000-000000000000	ec3b22de-71c9-4ca7-baf3-10352ad6f316	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 21:39:17.741342+00	
00000000-0000-0000-0000-000000000000	90053108-0666-4564-a74e-a343d49c8728	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 22:37:48.251801+00	
00000000-0000-0000-0000-000000000000	10b7890e-166d-4403-9a13-68b71a13262a	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 22:37:48.2648+00	
00000000-0000-0000-0000-000000000000	8186ed0b-5852-4acc-8559-bff68343c5a0	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 23:36:18.223201+00	
00000000-0000-0000-0000-000000000000	dda04611-0248-4700-9cd4-b1b31c0aefa9	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-03 23:36:18.236172+00	
00000000-0000-0000-0000-000000000000	c2bdc00a-d710-489f-b7ae-5d02cb89bde1	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 00:34:48.248785+00	
00000000-0000-0000-0000-000000000000	1978b6df-3e37-45b3-a56b-6290c66ac16c	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 00:34:48.260135+00	
00000000-0000-0000-0000-000000000000	4310180d-12a5-4b4e-81ad-185abd355e19	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 01:33:18.157055+00	
00000000-0000-0000-0000-000000000000	31b7ec14-b0c6-48a6-8290-cc824eb2e303	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 01:33:18.168568+00	
00000000-0000-0000-0000-000000000000	68febf78-6d14-48d3-ad46-c84578c82082	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 02:31:48.351449+00	
00000000-0000-0000-0000-000000000000	66e21eaf-084a-4112-842e-290a657f1cdb	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 02:31:48.3642+00	
00000000-0000-0000-0000-000000000000	62432955-c1a8-420f-acc5-0e2e8cd401eb	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 03:30:18.214031+00	
00000000-0000-0000-0000-000000000000	9069cfe1-6529-4dd0-bdac-f45e3cce03cc	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 03:30:18.233372+00	
00000000-0000-0000-0000-000000000000	a897fedc-444c-4897-866a-704270223f60	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 11:22:20.445594+00	
00000000-0000-0000-0000-000000000000	eb84bed9-0939-487d-96ba-ebfe4b4985e6	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 11:22:20.460202+00	
00000000-0000-0000-0000-000000000000	2bd1847a-039d-4cac-8333-0c648a62a8e2	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 15:02:33.230411+00	
00000000-0000-0000-0000-000000000000	ee75054f-ac77-4bda-84ed-0b885136675e	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 15:02:33.252002+00	
00000000-0000-0000-0000-000000000000	1f118a51-3ed1-4428-b69c-0ed0abd9c7bd	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 15:53:36.679467+00	
00000000-0000-0000-0000-000000000000	0ea98df6-e5a9-47c1-bd1d-38510325fc4e	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 15:53:36.696406+00	
00000000-0000-0000-0000-000000000000	b6b50f40-9c7b-496d-9e83-ba01706f1999	{"action":"token_refreshed","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 16:59:17.018313+00	
00000000-0000-0000-0000-000000000000	127b3f3a-7cb1-4cc7-9461-dea6b33a560b	{"action":"token_revoked","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-04 16:59:17.033536+00	
00000000-0000-0000-0000-000000000000	0c96920d-c752-4f33-8c92-c309b1c0e1d3	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-04 17:27:56.079441+00	
00000000-0000-0000-0000-000000000000	4e3a9160-bcb0-4445-8c50-7079ad589403	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 03:38:04.218049+00	
00000000-0000-0000-0000-000000000000	81ee2652-6610-4c84-a4c9-11c692349def	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 03:38:04.230187+00	
00000000-0000-0000-0000-000000000000	a37166c6-e4cc-4e10-b58a-79144e5c6dea	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 03:38:32.333828+00	
00000000-0000-0000-0000-000000000000	6ae28a94-7890-4b76-b76c-08fe21be1655	{"action":"login","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 03:39:39.309017+00	
00000000-0000-0000-0000-000000000000	ee8153c0-3bbd-41c7-a76a-b62cfc1e5532	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 03:51:29.346651+00	
00000000-0000-0000-0000-000000000000	bee1142c-3b0a-46b4-bc16-86178d118a47	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 03:51:29.357807+00	
00000000-0000-0000-0000-000000000000	493b8a4a-9d25-4fd8-8f80-17b12510ce75	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 04:49:31.247898+00	
00000000-0000-0000-0000-000000000000	1abbcb20-9258-438d-b4e4-616b60f82e75	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 04:49:31.268692+00	
00000000-0000-0000-0000-000000000000	a0290ffe-99ff-4fe8-abc3-66b256d080a3	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"bultu@test.local","user_id":"a2473357-5896-4e88-a313-35c70d3f3432","user_phone":""}}	2026-04-05 04:50:16.596415+00	
00000000-0000-0000-0000-000000000000	f265ed53-7361-470f-bc9c-dd283d59e3ca	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 04:51:22.418637+00	
00000000-0000-0000-0000-000000000000	ebd45ac8-2deb-4f41-a7f8-a8aa54c0ba48	{"action":"token_refreshed","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 05:49:47.821176+00	
00000000-0000-0000-0000-000000000000	8740ebe9-5478-4d59-a2aa-17d5a4cf9221	{"action":"token_revoked","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 05:49:47.834018+00	
00000000-0000-0000-0000-000000000000	96d3b3f3-4a52-4773-b8fe-8c4fc35660d2	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 06:00:16.613866+00	
00000000-0000-0000-0000-000000000000	69610e50-6afb-4256-abd5-f515809301d8	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 06:45:32.743003+00	
00000000-0000-0000-0000-000000000000	ac90b30d-b538-44c4-ab95-1ee3c115c322	{"action":"token_refreshed","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 07:52:37.052183+00	
00000000-0000-0000-0000-000000000000	1cec6f5f-4418-4b48-8252-dec079b9f667	{"action":"token_revoked","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 07:52:37.076055+00	
00000000-0000-0000-0000-000000000000	e0ae0f9c-c679-472e-aa05-dd5c56deb170	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 08:01:15.850521+00	
00000000-0000-0000-0000-000000000000	21e5b6b4-f7c1-4a78-9541-b8b33c41e71c	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 08:14:24.764183+00	
00000000-0000-0000-0000-000000000000	a5723443-5abd-4c20-99aa-448bd29cae07	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 08:24:37.120503+00	
00000000-0000-0000-0000-000000000000	b76607b3-b3a6-4cab-be06-74e8f802a139	{"action":"login","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 08:33:16.624745+00	
00000000-0000-0000-0000-000000000000	1e2707bc-a237-4d49-b2f5-3f91de6137c3	{"action":"login","actor_id":"4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9","actor_name":"Asmat Mondal","actor_username":"asmatbyte@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2026-04-05 08:59:35.416351+00	
00000000-0000-0000-0000-000000000000	db3dd4f0-4e70-4e40-90db-f98f6fd6ba56	{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"admin@test.local","user_id":"fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002","user_phone":""}}	2026-04-05 09:03:23.053278+00	
00000000-0000-0000-0000-000000000000	814c0610-0b27-4a00-b7f9-9f5231affaa2	{"action":"login","actor_id":"fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002","actor_username":"admin@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 09:05:48.531428+00	
00000000-0000-0000-0000-000000000000	8a2017ff-615a-4872-beb8-e7d5f1b51c2b	{"action":"login","actor_id":"d442332e-65d2-43b9-be79-f214a3d53bd3","actor_username":"manager4@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 09:14:29.091375+00	
00000000-0000-0000-0000-000000000000	20ba43f1-ee2c-4a4c-a956-f5a1c59369f4	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 09:16:50.440101+00	
00000000-0000-0000-0000-000000000000	816890c0-63ba-4da3-9878-4fb8835d1724	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 09:16:50.444519+00	
00000000-0000-0000-0000-000000000000	da636233-5c1b-4779-a1c3-e4f8e2aa1863	{"action":"login","actor_id":"fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002","actor_username":"admin@test.local","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-04-05 09:35:09.694872+00	
00000000-0000-0000-0000-000000000000	2ead51ee-305c-4330-8492-2c83d24453ba	{"action":"token_refreshed","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 09:37:57.844359+00	
00000000-0000-0000-0000-000000000000	7dfe954b-adca-4faa-b656-c8de80673549	{"action":"token_revoked","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 09:37:57.846694+00	
00000000-0000-0000-0000-000000000000	faa64342-d501-4156-8bb8-414bbafebe41	{"action":"logout","actor_id":"a2473357-5896-4e88-a313-35c70d3f3432","actor_username":"bultu@test.local","actor_via_sso":false,"log_type":"account"}	2026-04-05 09:52:54.971368+00	
00000000-0000-0000-0000-000000000000	93098730-3556-41c3-a8d9-ab8cb134912f	{"action":"token_refreshed","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 10:27:07.921156+00	
00000000-0000-0000-0000-000000000000	ddbebaf5-85f4-4ad2-8434-527764e1f614	{"action":"token_revoked","actor_id":"6308420e-5192-4590-967d-d69c8e93aa75","actor_username":"manager2@test.local","actor_via_sso":false,"log_type":"token"}	2026-04-05 10:27:07.938656+00	
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
118efd61-c177-4eab-80d4-6549049780de	\N	edee51be-88dc-4bf1-bb95-3c66da7a7730	s256	y4htX5VNnPWqp6qcs4-tTrsFqlp7huwp-Rm1nkVEy1k	google			2026-01-27 15:49:55.604845+00	2026-01-27 15:49:55.604845+00	oauth	\N	\N	\N	\N	\N	f
b2266081-2816-44c1-917f-6e72fa0276e1	\N	\N	\N	\N	google			2026-04-05 08:58:55.355079+00	2026-04-05 08:58:55.355079+00	oauth	\N	\N	http://localhost:3000	\N	\N	f
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	{"sub": "4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9", "email": "asmatbyte@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-09 17:52:42.265717+00	2025-11-09 17:52:42.266422+00	2025-11-09 17:52:42.266422+00	7837398c-6d3c-4957-bbaa-e304353934f5
c0044c8b-cf12-4613-bdb1-40749779b927	c0044c8b-cf12-4613-bdb1-40749779b927	{"sub": "c0044c8b-cf12-4613-bdb1-40749779b927", "email": "seller@test.local", "email_verified": false, "phone_verified": false}	email	2025-11-09 17:53:11.431819+00	2025-11-09 17:53:11.433028+00	2025-11-09 17:53:11.433028+00	9f9a74df-6b92-4004-9d71-bd6f7a1dc5b7
38322fdd-1346-4f01-9325-955d246a89af	38322fdd-1346-4f01-9325-955d246a89af	{"sub": "38322fdd-1346-4f01-9325-955d246a89af", "email": "mondalfishcenter2005@gmail.com", "email_verified": false, "phone_verified": false}	email	2025-11-09 17:53:50.317983+00	2025-11-09 17:53:50.318045+00	2025-11-09 17:53:50.318045+00	469c7ac7-b3c0-462c-aa96-a709b8b65ad1
6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	{"sub": "6308420e-5192-4590-967d-d69c8e93aa75", "email": "manager2@test.local", "email_verified": false, "phone_verified": false}	email	2025-11-09 18:05:47.795236+00	2025-11-09 18:05:47.795296+00	2025-11-09 18:05:47.795296+00	eaf10dd8-287d-4814-bf31-fc339e669368
24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	{"sub": "24766c66-a4fd-407b-bc73-afd6feedd8c2", "email": "manager3@test.local", "email_verified": false, "phone_verified": false}	email	2026-01-27 15:56:33.074277+00	2026-01-27 15:56:33.074337+00	2026-01-27 15:56:33.074337+00	3206ee9f-7eaf-4648-90b2-4c13202cfa2a
103911283362604170395	38322fdd-1346-4f01-9325-955d246a89af	{"iss": "https://accounts.google.com", "sub": "103911283362604170395", "name": "MFC", "email": "mondalfishcenter2005@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKoimiV-Hogs7qgQ5n2Tl1UBsNY6Se1p7kt1G-543gksr-6vWYu=s96-c", "full_name": "MFC", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKoimiV-Hogs7qgQ5n2Tl1UBsNY6Se1p7kt1G-543gksr-6vWYu=s96-c", "provider_id": "103911283362604170395", "email_verified": true, "phone_verified": false}	google	2026-01-27 15:50:30.138328+00	2026-01-27 15:50:30.138383+00	2026-03-25 05:47:48.082506+00	7eec4cab-f1eb-40cf-a66f-949284f80c8c
d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	{"sub": "d442332e-65d2-43b9-be79-f214a3d53bd3", "email": "manager4@test.local", "email_verified": false, "phone_verified": false}	email	2026-03-25 05:59:34.719421+00	2026-03-25 05:59:34.719479+00	2026-03-25 05:59:34.719479+00	6bcb297d-b6bd-4a44-b61f-b1cda18276f7
a2473357-5896-4e88-a313-35c70d3f3432	a2473357-5896-4e88-a313-35c70d3f3432	{"sub": "a2473357-5896-4e88-a313-35c70d3f3432", "email": "bultu@test.local", "email_verified": false, "phone_verified": false}	email	2026-04-05 04:50:16.591993+00	2026-04-05 04:50:16.59205+00	2026-04-05 04:50:16.59205+00	2a848ad4-e820-4460-a433-b3fc3155f1c2
107417267988249177465	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	{"iss": "https://accounts.google.com", "sub": "107417267988249177465", "name": "Asmat Mondal", "email": "asmatbyte@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocK00XMQwSsPPDRba5CjH41gCB71pEBTfnqEVyGoLceDDmm0u-em=s96-c", "full_name": "Asmat Mondal", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocK00XMQwSsPPDRba5CjH41gCB71pEBTfnqEVyGoLceDDmm0u-em=s96-c", "provider_id": "107417267988249177465", "email_verified": true, "phone_verified": false}	google	2026-04-05 08:59:35.408733+00	2026-04-05 08:59:35.408778+00	2026-04-05 08:59:35.408778+00	3ec1822a-a52e-4ee9-8990-588f4bf061c1
fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	{"sub": "fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002", "email": "admin@test.local", "email_verified": false, "phone_verified": false}	email	2026-04-05 09:03:23.050261+00	2026-04-05 09:03:23.050313+00	2026-04-05 09:03:23.050313+00	ce855121-d66f-4e4c-9c91-d27e663cce83
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
6e123c82-7923-4853-852c-f41800d66a4f	2026-03-28 15:11:31.765165+00	2026-03-28 15:11:31.765165+00	password	7634239b-0970-4a9d-a7bf-afdc1a96744e
6540aad9-6c67-4399-8c1a-7375fff08acb	2026-03-28 16:51:07.022611+00	2026-03-28 16:51:07.022611+00	password	ec8cdc31-5429-43f0-a47e-66bbcd86bbfb
c5e4f322-fb88-4529-8a70-14ecea2c451c	2026-03-28 16:52:30.407815+00	2026-03-28 16:52:30.407815+00	password	1195142e-ad1e-4a4e-b800-6c38e9362c0b
be865793-3d3f-42b1-a620-97d435255b99	2026-03-31 14:37:55.677616+00	2026-03-31 14:37:55.677616+00	password	609dcaf7-73a1-4bac-8c06-03ff06b2b658
5c322fc8-989a-4173-afe8-dc493f754934	2026-04-02 04:47:09.28302+00	2026-04-02 04:47:09.28302+00	password	10ba5927-5c49-4299-8602-02d771fe831f
66481c13-a3ec-4a08-93c4-6fe7465cf34d	2026-04-04 17:27:56.15266+00	2026-04-04 17:27:56.15266+00	password	03400afb-3705-4cec-9944-76eb6528bba6
480f3d78-5787-40b9-a137-fbc2371faa1d	2026-04-05 03:38:32.351708+00	2026-04-05 03:38:32.351708+00	password	abe540cb-61f5-4467-ba28-9be612d720b5
42d3a03e-4781-4701-93a6-c9d00d28f81b	2026-04-05 03:39:39.343258+00	2026-04-05 03:39:39.343258+00	password	38e9322d-f895-4a37-b3dd-aec315886d0e
32a00d01-ca76-48b5-855b-5855d940a7b5	2026-04-05 04:51:22.430978+00	2026-04-05 04:51:22.430978+00	password	90d2ea9d-3954-4a6d-a0d2-a796a6794687
ffd4e8ed-aec3-4e1c-bfcf-198622ec7856	2026-04-05 06:00:16.717269+00	2026-04-05 06:00:16.717269+00	password	91840f53-39d6-4bd5-bbbf-64970a698425
9ef104a3-9ac2-485d-af36-28da8b2433da	2026-04-05 06:45:32.83052+00	2026-04-05 06:45:32.83052+00	password	ba453dee-8753-435a-b1d4-6e5e6b415b43
d87dfe3f-fac4-4c8a-8879-04e7251cb06a	2026-04-05 08:01:15.92803+00	2026-04-05 08:01:15.92803+00	password	98d6b769-d017-4743-a937-2a63ac4978bd
5690d7bb-2b7d-4412-9f69-4af23579d60d	2026-04-05 08:14:24.826197+00	2026-04-05 08:14:24.826197+00	password	629e778b-c76a-4c77-b64d-431bec6b68a5
1089668f-ee9f-4d33-a29f-5c1b6dd370ce	2026-04-05 08:24:37.159678+00	2026-04-05 08:24:37.159678+00	password	691ac452-26a1-4fdd-829b-5fc34931b0a0
9d1645d0-3541-4d9f-aa8e-af1a19b0ef4c	2026-04-05 08:59:35.461685+00	2026-04-05 08:59:35.461685+00	oauth	a612e971-20dc-4b3f-953d-6718da63b103
c95177c6-7e91-4ea9-920a-aec35236055f	2026-04-05 09:05:48.555067+00	2026-04-05 09:05:48.555067+00	password	8599ea14-446d-4c83-afe5-86e16c84d1ee
b1ad7294-0451-4309-a69d-4297b7d87f38	2026-04-05 09:14:29.144863+00	2026-04-05 09:14:29.144863+00	password	8680e6ce-dc08-4bb2-bdd4-b22ee8cd3b5c
51656f7d-2a8d-4445-bc2d-21d81d5f773c	2026-04-05 09:35:09.721807+00	2026-04-05 09:35:09.721807+00	password	84568085-e19c-47a8-bd81-fec400268dac
c989a1c8-5917-4d47-b430-659a4de9fd83	2025-11-28 12:42:22.70079+00	2025-11-28 12:42:22.70079+00	password	23a0b92d-f2d4-4b57-b650-e9f5f8596de7
3ee08765-5ea4-4741-9d5a-74ab225caaed	2025-11-29 04:23:14.945314+00	2025-11-29 04:23:14.945314+00	password	acdc5786-6301-48b3-b370-c5937c103fe2
8e625aab-2977-4c77-8f5e-a7aa5d465083	2025-12-02 16:59:20.492947+00	2025-12-02 16:59:20.492947+00	password	ac9fcfe0-d492-4af3-8358-49a8e417f86a
87eea701-7da2-4e96-a315-968c4df4b408	2025-12-03 19:27:50.906556+00	2025-12-03 19:27:50.906556+00	password	7810e3cb-d5f1-49c1-accf-cd45d36c261f
7ca8913b-4dc2-41ee-b64d-55237c4d8670	2025-12-03 20:27:23.381812+00	2025-12-03 20:27:23.381812+00	password	1116c8e3-db19-47b9-b298-2fb258891078
ed77465b-c33d-4769-9fbe-bf45e21c1d17	2026-01-27 18:53:14.518818+00	2026-01-27 18:53:14.518818+00	password	95185b60-3cbc-4f7c-b2e7-1e535c308385
61822b99-50bf-452b-823e-84142987842e	2026-01-28 15:54:00.074327+00	2026-01-28 15:54:00.074327+00	password	b17a84c9-1743-4312-aa04-b13574c94a3d
a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7	2026-03-28 10:04:45.296074+00	2026-03-28 10:04:45.296074+00	password	d7ff979c-efa3-4081-b948-81777972e9b3
ac90f371-7197-40b0-8f55-e8f798bbdfd3	2026-03-28 10:26:40.687259+00	2026-03-28 10:26:40.687259+00	password	9a3db296-05c7-4749-bb6f-ed43a4f08681
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	618	ja6gw7ztikkm	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-03 23:40:06.086069+00	2025-12-04 03:53:20.149127+00	eaxca5bedgbz	7ca8913b-4dc2-41ee-b64d-55237c4d8670
00000000-0000-0000-0000-000000000000	844	ux4s5x55ox6i	d442332e-65d2-43b9-be79-f214a3d53bd3	f	2026-04-04 16:59:17.044724+00	2026-04-04 16:59:17.044724+00	6r3n3qvd2zmf	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	619	i2f3toejv7my	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-04 03:53:20.161168+00	2025-12-04 06:07:50.10496+00	ja6gw7ztikkm	7ca8913b-4dc2-41ee-b64d-55237c4d8670
00000000-0000-0000-0000-000000000000	620	qx7jpbne464e	6308420e-5192-4590-967d-d69c8e93aa75	f	2025-12-04 06:07:50.125872+00	2025-12-04 06:07:50.125872+00	i2f3toejv7my	7ca8913b-4dc2-41ee-b64d-55237c4d8670
00000000-0000-0000-0000-000000000000	759	vcrlckoyvyqq	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 15:30:41.894683+00	2026-03-30 16:43:16.818268+00	7p5pmep6fpma	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	686	btf4oguyx4ee	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 10:04:45.248367+00	2026-03-28 11:02:54.883573+00	\N	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	760	fqgyktu6wkzu	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 15:30:42.530798+00	2026-03-30 16:43:16.881507+00	k3mgx2gd2ckl	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	688	gtgswmbhqylq	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 10:26:40.666767+00	2026-03-28 11:25:15.959709+00	\N	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	626	s5hegt2zmhgr	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-27 18:53:14.507712+00	2026-01-27 19:58:11.097541+00	\N	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	689	knl2n2nc4xsh	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 11:02:54.904175+00	2026-03-28 12:02:16.134365+00	btf4oguyx4ee	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	627	bd5kcixt3kcs	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-27 19:58:11.116233+00	2026-01-27 21:00:06.621882+00	s5hegt2zmhgr	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	628	ffgogsu4slih	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-27 21:00:06.641326+00	2026-01-27 21:59:40.271589+00	bd5kcixt3kcs	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	690	vzqj2oq5ir5i	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 11:25:15.977648+00	2026-03-28 12:24:15.823037+00	gtgswmbhqylq	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	629	6pavfkv3fuva	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-27 21:59:40.291648+00	2026-01-27 23:01:51.785197+00	ffgogsu4slih	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	692	h4ts3ixkpege	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 12:02:16.150495+00	2026-03-28 13:02:05.724293+00	knl2n2nc4xsh	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	630	4b3nfyne4dru	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-27 23:01:51.812195+00	2026-01-28 00:04:09.170815+00	6pavfkv3fuva	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	631	7tdzts5f57cc	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 00:04:09.195232+00	2026-01-28 01:06:32.867025+00	4b3nfyne4dru	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	632	vdrctqaopnhb	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 01:06:32.876456+00	2026-01-28 02:09:06.757887+00	7tdzts5f57cc	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	633	w5i7drqmquwz	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 02:09:06.771652+00	2026-01-28 03:22:02.988262+00	vdrctqaopnhb	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	634	b5fgdasqobfc	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 03:22:03.008194+00	2026-01-28 04:23:00.190037+00	w5i7drqmquwz	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	635	yjlnl5qqp4uy	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 04:23:00.204439+00	2026-01-28 05:23:49.345072+00	b5fgdasqobfc	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	636	yikppjqb3ftn	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 05:23:49.35767+00	2026-01-28 06:25:06.352454+00	yjlnl5qqp4uy	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	600	trebzt5g7gkx	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-28 12:42:22.675647+00	2025-11-28 13:48:15.538948+00	\N	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	602	csjx4bvyzeql	6308420e-5192-4590-967d-d69c8e93aa75	f	2025-11-29 04:23:14.89209+00	2025-11-29 04:23:14.89209+00	\N	3ee08765-5ea4-4741-9d5a-74ab225caaed
00000000-0000-0000-0000-000000000000	601	emc3yffipvnp	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-28 13:48:15.557429+00	2025-11-29 04:33:08.126118+00	trebzt5g7gkx	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	637	akjfy2uv25ay	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 06:25:06.373084+00	2026-01-28 07:25:52.607396+00	yikppjqb3ftn	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	603	5aqwjoaxeixp	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-29 04:33:08.142191+00	2025-11-29 06:01:18.117871+00	emc3yffipvnp	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	604	7vyidzyvm7ag	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-29 06:01:18.140811+00	2025-11-29 07:14:57.166286+00	5aqwjoaxeixp	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	638	t6wx2aoie7tt	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 07:25:52.626924+00	2026-01-28 08:27:13.722739+00	akjfy2uv25ay	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	605	qmzrnlyqa5qk	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-29 07:14:57.18075+00	2025-11-29 09:01:31.781014+00	7vyidzyvm7ag	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	606	qu45rjyxtiwc	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-29 09:01:31.799422+00	2025-11-29 09:59:54.73578+00	qmzrnlyqa5qk	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	639	pwjdx3zt46sn	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 08:27:13.733409+00	2026-01-28 09:27:51.229339+00	t6wx2aoie7tt	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	607	sj5xjzuud35a	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-29 09:59:54.748718+00	2025-11-30 11:52:40.467601+00	qu45rjyxtiwc	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	640	p7fyfws7kbb7	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 09:27:51.237368+00	2026-01-28 10:28:54.705513+00	pwjdx3zt46sn	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	608	fo5kxjjshrn5	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-30 11:52:40.483165+00	2025-11-30 12:50:57.679291+00	sj5xjzuud35a	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	641	4xyh3nnusmuu	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 10:28:54.720627+00	2026-01-28 11:29:51.140515+00	p7fyfws7kbb7	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	642	uivb6quwombk	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 11:29:51.149912+00	2026-01-28 12:31:18.109192+00	4xyh3nnusmuu	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	609	2ubzxn5eudta	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-11-30 12:50:57.693879+00	2025-12-02 16:58:40.788184+00	fo5kxjjshrn5	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	643	3rikfp3k62qv	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 12:31:18.119563+00	2026-01-28 13:29:21.526192+00	uivb6quwombk	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	610	4vhgujqsldki	6308420e-5192-4590-967d-d69c8e93aa75	f	2025-12-02 16:58:40.815139+00	2025-12-02 16:58:40.815139+00	2ubzxn5eudta	c989a1c8-5917-4d47-b430-659a4de9fd83
00000000-0000-0000-0000-000000000000	644	x2vaikup5lcy	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 13:29:21.53554+00	2026-01-28 14:27:32.477026+00	3rikfp3k62qv	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	611	6bjkusujjfjg	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-02 16:59:20.491629+00	2025-12-03 19:26:30.329124+00	\N	8e625aab-2977-4c77-8f5e-a7aa5d465083
00000000-0000-0000-0000-000000000000	612	i2y37q767mt5	6308420e-5192-4590-967d-d69c8e93aa75	f	2025-12-03 19:26:30.354668+00	2025-12-03 19:26:30.354668+00	6bjkusujjfjg	8e625aab-2977-4c77-8f5e-a7aa5d465083
00000000-0000-0000-0000-000000000000	613	umsrenvpijqc	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-03 19:27:50.903485+00	2025-12-03 20:26:50.257911+00	\N	87eea701-7da2-4e96-a315-968c4df4b408
00000000-0000-0000-0000-000000000000	614	wk46xq2zbdj4	6308420e-5192-4590-967d-d69c8e93aa75	f	2025-12-03 20:26:50.274183+00	2025-12-03 20:26:50.274183+00	umsrenvpijqc	87eea701-7da2-4e96-a315-968c4df4b408
00000000-0000-0000-0000-000000000000	645	pgvfupza45oe	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 14:27:32.486785+00	2026-01-28 15:26:10.822384+00	x2vaikup5lcy	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	615	dcfmxceth5sv	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-03 20:27:23.380272+00	2025-12-03 21:25:31.156841+00	\N	7ca8913b-4dc2-41ee-b64d-55237c4d8670
00000000-0000-0000-0000-000000000000	616	cbjhknimnbwe	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-03 21:25:31.174812+00	2025-12-03 22:23:35.934335+00	dcfmxceth5sv	7ca8913b-4dc2-41ee-b64d-55237c4d8670
00000000-0000-0000-0000-000000000000	647	y45r3t5d6m3i	24766c66-a4fd-407b-bc73-afd6feedd8c2	f	2026-01-28 15:54:00.035868+00	2026-01-28 15:54:00.035868+00	\N	61822b99-50bf-452b-823e-84142987842e
00000000-0000-0000-0000-000000000000	617	eaxca5bedgbz	6308420e-5192-4590-967d-d69c8e93aa75	t	2025-12-03 22:23:35.950891+00	2025-12-03 23:40:06.063667+00	cbjhknimnbwe	7ca8913b-4dc2-41ee-b64d-55237c4d8670
00000000-0000-0000-0000-000000000000	646	4uzsdx4kyd3y	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-01-28 15:26:10.831735+00	2026-01-28 16:30:27.706847+00	pgvfupza45oe	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	648	n65s3bg4fnen	24766c66-a4fd-407b-bc73-afd6feedd8c2	f	2026-01-28 16:30:27.724092+00	2026-01-28 16:30:27.724092+00	4uzsdx4kyd3y	ed77465b-c33d-4769-9fbe-bf45e21c1d17
00000000-0000-0000-0000-000000000000	845	gn43mbck3e3o	d442332e-65d2-43b9-be79-f214a3d53bd3	f	2026-04-04 17:27:56.130042+00	2026-04-04 17:27:56.130042+00	\N	66481c13-a3ec-4a08-93c4-6fe7465cf34d
00000000-0000-0000-0000-000000000000	718	b7kcbbuscoaz	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 09:38:39.843141+00	2026-03-31 13:14:38.367448+00	wr4fpltzt5ko	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	720	vpj4mbfxw2o4	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-29 09:40:08.200904+00	2026-03-31 13:55:25.232087+00	yhfmaea526ss	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	694	ilfj57aao2dd	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 13:02:05.746262+00	2026-03-28 14:01:16.143022+00	h4ts3ixkpege	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	696	xmpubzzishwj	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 14:01:16.143809+00	2026-03-28 15:00:16.057742+00	ilfj57aao2dd	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	698	hcqh45reeswe	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 15:00:16.067624+00	2026-03-28 16:26:06.497201+00	xmpubzzishwj	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	702	vkww5gdchxk4	24766c66-a4fd-407b-bc73-afd6feedd8c2	f	2026-03-28 16:26:06.518101+00	2026-03-28 16:26:06.518101+00	hcqh45reeswe	a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7
00000000-0000-0000-0000-000000000000	701	k5g2elibci5y	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-28 15:11:31.76308+00	2026-03-28 16:26:59.718868+00	\N	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	704	eur2bqadxucx	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 16:51:07.002236+00	2026-03-28 17:49:15.643848+00	\N	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	705	4fpvpxpunvsa	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-28 16:52:30.392014+00	2026-03-28 17:50:54.693322+00	\N	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	703	sckufecpcbh4	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-28 16:26:59.719907+00	2026-03-28 18:24:18.042945+00	k5g2elibci5y	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	693	54vkeesbcnfv	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 12:24:15.834728+00	2026-03-28 18:45:59.492352+00	vzqj2oq5ir5i	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	706	minkmpwxyqod	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 17:49:15.662628+00	2026-03-28 18:47:52.573183+00	eur2bqadxucx	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	707	eppafl4pqhqg	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-28 17:50:54.694127+00	2026-03-28 18:49:04.091874+00	4fpvpxpunvsa	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	708	xexhjunxgmly	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-28 18:24:18.059769+00	2026-03-28 19:22:37.427806+00	sckufecpcbh4	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	709	cdjesdebsthm	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 18:45:59.502921+00	2026-03-28 19:44:21.566101+00	54vkeesbcnfv	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	711	ffzeysciadbj	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-28 18:49:04.092622+00	2026-03-28 19:47:05.021283+00	eppafl4pqhqg	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	710	vnxs3uw3w2gf	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 18:47:52.576774+00	2026-03-28 19:47:15.573237+00	minkmpwxyqod	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	712	jx2sety4fpbj	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-28 19:22:37.438857+00	2026-03-28 20:20:59.345279+00	xexhjunxgmly	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	715	5ahnessdejmj	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 19:47:15.574168+00	2026-03-28 21:06:55.512714+00	vnxs3uw3w2gf	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	713	wr4fpltzt5ko	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 19:44:21.574644+00	2026-03-29 09:38:39.819536+00	cdjesdebsthm	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	714	asgv5iaq3ppp	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-28 19:47:05.026083+00	2026-03-29 09:39:36.554575+00	ffzeysciadbj	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	716	yhfmaea526ss	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-28 20:20:59.355962+00	2026-03-29 09:40:08.200498+00	jx2sety4fpbj	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	717	uebu3bvxivb4	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-28 21:06:55.53176+00	2026-03-29 09:40:30.39627+00	5ahnessdejmj	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	719	tjb73hyw3zjc	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 09:39:36.554965+00	2026-03-29 10:37:37.883204+00	asgv5iaq3ppp	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	721	e3zfhzlurlyn	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 09:40:30.396652+00	2026-03-29 10:39:49.045958+00	uebu3bvxivb4	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	722	2nf2px6g4cvy	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 10:37:37.891427+00	2026-03-29 11:35:46.653585+00	tjb73hyw3zjc	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	723	q5k3llsinqke	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 10:39:49.04886+00	2026-03-29 12:28:22.676047+00	e3zfhzlurlyn	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	724	tu55ixhsav2i	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 11:35:46.665962+00	2026-03-29 16:20:13.743706+00	2nf2px6g4cvy	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	725	a4xpfl4s6pnf	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 12:28:22.690524+00	2026-03-29 16:20:51.868356+00	q5k3llsinqke	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	726	7fz5g2clswk2	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 16:20:13.756448+00	2026-03-29 17:30:14.71388+00	tu55ixhsav2i	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	727	46jdku2fs342	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 16:20:51.870178+00	2026-03-29 18:01:19.576027+00	a4xpfl4s6pnf	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	728	nljdos5cczcn	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 17:30:14.7361+00	2026-03-29 18:56:05.088929+00	7fz5g2clswk2	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	729	o3ybrvbdyopk	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 18:01:19.586339+00	2026-03-29 19:23:46.105121+00	46jdku2fs342	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	730	xfb2xtolamhx	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 18:56:05.103315+00	2026-03-29 19:56:19.051116+00	nljdos5cczcn	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	731	bhqxyw64l4cw	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 19:23:46.114575+00	2026-03-29 20:24:16.258604+00	o3ybrvbdyopk	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	732	yezmpv5tlj2z	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 19:56:19.065861+00	2026-03-29 21:13:37.724287+00	xfb2xtolamhx	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	733	nxnaivbaw7ax	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 20:24:16.268323+00	2026-03-29 21:25:31.150255+00	bhqxyw64l4cw	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	734	gciabphc7mnb	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 21:13:37.747297+00	2026-03-29 22:26:16.311819+00	yezmpv5tlj2z	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	735	hrpwmu3afhil	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 21:25:31.161952+00	2026-03-29 22:26:19.024168+00	nxnaivbaw7ax	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	736	p6grcngzpgcd	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 22:26:16.318229+00	2026-03-29 23:27:12.09218+00	gciabphc7mnb	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	737	rdlvr6fpy3tu	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 22:26:19.024528+00	2026-03-29 23:27:25.085747+00	hrpwmu3afhil	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	739	nmul7neq6zts	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-29 23:27:25.087574+00	2026-03-30 01:29:34.557705+00	rdlvr6fpy3tu	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	738	xtsxitesjcja	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-29 23:27:12.110572+00	2026-03-30 01:29:34.557094+00	p6grcngzpgcd	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	741	z5k5evd5m2dn	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 01:29:34.578887+00	2026-03-30 03:31:26.49723+00	xtsxitesjcja	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	740	up4nv6lgfkvm	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 01:29:34.578875+00	2026-03-30 03:31:26.501518+00	nmul7neq6zts	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	742	zevj2f4u6m4m	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 03:31:26.511935+00	2026-03-30 04:30:49.93928+00	z5k5evd5m2dn	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	743	3jhicrfpzohg	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 03:31:26.511961+00	2026-03-30 04:37:22.500412+00	up4nv6lgfkvm	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	744	nlzsnut7ghw6	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 04:30:49.961063+00	2026-03-30 05:32:39.957978+00	zevj2f4u6m4m	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	746	fkafzam63vhw	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 05:32:39.967791+00	2026-03-30 06:33:33.756115+00	nlzsnut7ghw6	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	745	6ktu4zxz4fwn	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 04:37:22.506434+00	2026-03-30 10:08:13.386655+00	3jhicrfpzohg	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	757	7p5pmep6fpma	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 13:52:20.795827+00	2026-03-30 15:30:41.882402+00	hbyktzpp7vfn	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	747	m5ps2my5rtba	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 06:33:33.770031+00	2026-03-30 07:34:29.184507+00	fkafzam63vhw	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	758	k3mgx2gd2ckl	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 13:52:34.963013+00	2026-03-30 15:30:42.530437+00	u66udoxa44fd	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	748	7tzp6rkc5i5t	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 07:34:29.206029+00	2026-03-30 08:35:46.717729+00	m5ps2my5rtba	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	846	suovkvoo567b	6308420e-5192-4590-967d-d69c8e93aa75	f	2026-04-05 03:38:04.241674+00	2026-04-05 03:38:04.241674+00	pxzdaedlpufi	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	749	d5c3dc6sj6sr	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 08:35:46.729876+00	2026-03-30 09:36:31.55501+00	7tzp6rkc5i5t	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	762	duixox6embqo	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 16:43:16.881889+00	2026-03-30 17:44:28.82068+00	fqgyktu6wkzu	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	761	iszhszz7uh4c	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 16:43:16.828918+00	2026-03-30 17:44:28.819193+00	vcrlckoyvyqq	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	750	omvpok63ka2t	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 09:36:31.566962+00	2026-03-30 10:37:15.624592+00	d5c3dc6sj6sr	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	751	d35bg7cbx7pv	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 10:08:13.394+00	2026-03-30 11:28:40.437367+00	6ktu4zxz4fwn	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	752	vahtkot47xch	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 10:37:15.631998+00	2026-03-30 11:38:09.435557+00	omvpok63ka2t	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	763	nv6ya2ebfeaq	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 17:44:28.840334+00	2026-03-30 18:45:32.741365+00	iszhszz7uh4c	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	753	wejrdmeqxvyn	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 11:28:40.449963+00	2026-03-30 12:39:11.586738+00	d35bg7cbx7pv	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	754	wtg2m4xhby4y	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 11:38:09.439463+00	2026-03-30 12:39:18.273796+00	vahtkot47xch	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	764	bvrfptlujg5n	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 17:44:28.840336+00	2026-03-30 18:45:51.199276+00	duixox6embqo	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	756	hbyktzpp7vfn	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 12:39:18.274172+00	2026-03-30 13:52:20.787684+00	wtg2m4xhby4y	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	755	u66udoxa44fd	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 12:39:11.60073+00	2026-03-30 13:52:34.961928+00	wejrdmeqxvyn	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	765	l3b7nno5nifu	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 18:45:32.750874+00	2026-03-30 20:02:20.136726+00	nv6ya2ebfeaq	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	767	qnlfigiyzr55	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 20:02:20.146944+00	2026-03-30 21:03:31.129693+00	l3b7nno5nifu	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	768	ro43khfiaspw	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 21:03:31.141525+00	2026-03-30 22:05:06.934131+00	qnlfigiyzr55	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	766	em3etcmecf26	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 18:45:51.199629+00	2026-03-30 22:49:12.849863+00	bvrfptlujg5n	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	769	34eox4zcv366	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 22:05:06.942625+00	2026-03-30 23:23:35.611486+00	ro43khfiaspw	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	770	trap3ubhp2bg	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 22:49:12.863603+00	2026-03-30 23:50:12.931193+00	em3etcmecf26	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	771	dganfjxcdlin	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-30 23:23:35.619026+00	2026-03-31 02:04:10.192922+00	34eox4zcv366	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	772	z7fj2vispwr5	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-30 23:50:12.951135+00	2026-03-31 02:04:14.087403+00	trap3ubhp2bg	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	774	xmqs2t6pdlz7	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 02:04:14.088547+00	2026-03-31 03:58:58.066381+00	z7fj2vispwr5	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	773	e7tae7ip6sey	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 02:04:10.205256+00	2026-03-31 03:59:09.959854+00	dganfjxcdlin	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	775	szzulvazebch	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 03:58:58.079554+00	2026-03-31 05:16:10.084687+00	xmqs2t6pdlz7	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	776	gk4lszwu6uya	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 03:59:09.960238+00	2026-03-31 05:16:12.425111+00	e7tae7ip6sey	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	778	447fftb3cayw	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 05:16:12.425486+00	2026-03-31 06:48:15.154575+00	gk4lszwu6uya	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	777	btmpvrc4nlny	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 05:16:10.09565+00	2026-03-31 06:48:18.178916+00	szzulvazebch	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	780	2mouwkm6upfx	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 06:48:18.17949+00	2026-03-31 07:58:25.821248+00	btmpvrc4nlny	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	779	yd4q3deva64x	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 06:48:15.161194+00	2026-03-31 07:58:25.821272+00	447fftb3cayw	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	782	33gt2yzqbaj6	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 07:58:25.829551+00	2026-03-31 08:59:14.32746+00	yd4q3deva64x	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	781	kzsq6jk2fofn	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 07:58:25.829548+00	2026-03-31 08:59:14.326858+00	2mouwkm6upfx	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	784	cqzeo3zvolpq	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 08:59:14.336103+00	2026-03-31 10:00:41.564684+00	33gt2yzqbaj6	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	783	qfimk2wljdsm	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 08:59:14.336262+00	2026-03-31 10:00:42.264195+00	kzsq6jk2fofn	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	785	fq3slm7zp3fx	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 10:00:41.576305+00	2026-03-31 13:12:15.74915+00	cqzeo3zvolpq	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	786	mvvvxuhse73w	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 10:00:42.265363+00	2026-03-31 13:12:49.677667+00	qfimk2wljdsm	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	789	ewc7x2blu77q	24766c66-a4fd-407b-bc73-afd6feedd8c2	f	2026-03-31 13:14:38.371884+00	2026-03-31 13:14:38.371884+00	b7kcbbuscoaz	ac90f371-7197-40b0-8f55-e8f798bbdfd3
00000000-0000-0000-0000-000000000000	787	62xngq4sbk2x	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 13:12:15.775368+00	2026-03-31 14:10:32.759037+00	fq3slm7zp3fx	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	788	ph4ll6ygbaz3	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 13:12:49.69467+00	2026-03-31 14:30:07.52342+00	mvvvxuhse73w	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	792	svmraqxzurp2	24766c66-a4fd-407b-bc73-afd6feedd8c2	f	2026-03-31 14:30:07.533142+00	2026-03-31 14:30:07.533142+00	ph4ll6ygbaz3	6540aad9-6c67-4399-8c1a-7375fff08acb
00000000-0000-0000-0000-000000000000	791	6izjpnbvgacy	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 14:10:32.769881+00	2026-03-31 15:08:42.136615+00	62xngq4sbk2x	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	793	kfcme5yoesiz	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 14:37:55.668189+00	2026-03-31 15:36:22.334443+00	\N	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	794	afxelamrh762	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 15:08:42.150184+00	2026-03-31 16:07:12.352154+00	6izjpnbvgacy	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	795	d4bgg2dne4kv	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 15:36:22.347184+00	2026-03-31 16:35:13.623239+00	kfcme5yoesiz	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	796	xh47sq2ay3cs	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 16:07:12.360615+00	2026-03-31 17:05:13.016779+00	afxelamrh762	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	797	dbaxcmptzvjx	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 16:35:13.630899+00	2026-03-31 17:33:43.180771+00	d4bgg2dne4kv	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	798	x5ejnnxx2olm	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 17:05:13.023782+00	2026-03-31 18:03:43.660721+00	xh47sq2ay3cs	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	790	s5n2yawjxewl	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-03-31 13:55:25.241806+00	2026-04-01 07:27:11.418236+00	vpj4mbfxw2o4	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	843	6r3n3qvd2zmf	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-04-04 15:53:36.711527+00	2026-04-04 16:59:17.037502+00	yczsxjlwygor	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	840	pxzdaedlpufi	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-04 03:30:18.253348+00	2026-04-05 03:38:04.232192+00	4uy577w2ocgl	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	799	cnfzpkvuva5r	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 17:33:43.199743+00	2026-03-31 18:32:00.926357+00	dbaxcmptzvjx	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	847	iw4gpfkurpuy	6308420e-5192-4590-967d-d69c8e93aa75	f	2026-04-05 03:38:32.349829+00	2026-04-05 03:38:32.349829+00	\N	480f3d78-5787-40b9-a137-fbc2371faa1d
00000000-0000-0000-0000-000000000000	800	fsefvinefjtx	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 18:03:43.673265+00	2026-03-31 19:01:43.902606+00	x5ejnnxx2olm	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	848	igmffcyqkmxk	6308420e-5192-4590-967d-d69c8e93aa75	f	2026-04-05 03:39:39.33038+00	2026-04-05 03:39:39.33038+00	\N	42d3a03e-4781-4701-93a6-c9d00d28f81b
00000000-0000-0000-0000-000000000000	802	7ydrz4pnyjyu	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-03-31 19:01:43.914775+00	2026-04-01 05:47:43.495487+00	fsefvinefjtx	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	842	wh54zlgw47m7	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-04 15:02:33.266516+00	2026-04-05 03:51:29.35976+00	u2ueymbxtn6t	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	801	dd5dtxfeqhli	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-03-31 18:32:00.932366+00	2026-04-01 05:48:42.091871+00	cnfzpkvuva5r	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	803	sjdx4bltojwl	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-01 05:47:43.508043+00	2026-04-01 07:23:09.427186+00	7ydrz4pnyjyu	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	849	fzbmct53yhys	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-05 03:51:29.369086+00	2026-04-05 04:49:31.270088+00	wh54zlgw47m7	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	804	nofkibtahc2a	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-04-01 05:48:42.092254+00	2026-04-01 07:23:09.747487+00	dd5dtxfeqhli	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	806	7ljqqhqvrqr3	24766c66-a4fd-407b-bc73-afd6feedd8c2	t	2026-04-01 07:23:09.748023+00	2026-04-02 04:46:33.307806+00	nofkibtahc2a	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	808	sjwlczzx64wv	24766c66-a4fd-407b-bc73-afd6feedd8c2	f	2026-04-02 04:46:33.324743+00	2026-04-02 04:46:33.324743+00	7ljqqhqvrqr3	be865793-3d3f-42b1-a620-97d435255b99
00000000-0000-0000-0000-000000000000	851	hcfjdfbrmv7m	a2473357-5896-4e88-a313-35c70d3f3432	t	2026-04-05 04:51:22.428641+00	2026-04-05 05:49:47.835341+00	\N	32a00d01-ca76-48b5-855b-5855d940a7b5
00000000-0000-0000-0000-000000000000	809	swzytuzpuf2s	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 04:47:09.281658+00	2026-04-02 05:45:58.144639+00	\N	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	850	eorsyjwy53q7	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-05 04:49:31.284042+00	2026-04-05 09:16:50.445956+00	fzbmct53yhys	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	810	sewonjewrv4y	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 05:45:58.157293+00	2026-04-02 07:48:42.184426+00	swzytuzpuf2s	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	811	h5jfc4o6wfin	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 07:48:42.202132+00	2026-04-02 08:49:48.647699+00	sewonjewrv4y	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	812	rlpmo7mefjtd	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 08:49:48.661122+00	2026-04-02 09:50:55.284656+00	h5jfc4o6wfin	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	813	urkz2popb3r7	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 09:50:55.294523+00	2026-04-02 10:52:00.10393+00	rlpmo7mefjtd	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	814	x6bxk7m3p4n7	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 10:52:00.121752+00	2026-04-02 11:52:58.86499+00	urkz2popb3r7	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	815	d7jkovzfwzdm	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 11:52:58.878934+00	2026-04-02 12:54:27.666497+00	x6bxk7m3p4n7	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	816	sz42ws4fhylo	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 12:54:27.676801+00	2026-04-02 13:54:51.935129+00	d7jkovzfwzdm	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	817	p5y7btdu5yo2	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 13:54:51.945276+00	2026-04-02 14:53:09.965649+00	sz42ws4fhylo	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	818	xocvywhhwdif	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 14:53:09.982444+00	2026-04-02 15:51:27.95799+00	p5y7btdu5yo2	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	819	k3ylwoz7ssn5	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 15:51:27.977967+00	2026-04-02 16:49:29.096152+00	xocvywhhwdif	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	820	dinxoxmkgdtk	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 16:49:29.105022+00	2026-04-02 17:48:06.439206+00	k3ylwoz7ssn5	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	821	hrjtkfsmryl7	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-02 17:48:06.453468+00	2026-04-03 05:41:54.535843+00	dinxoxmkgdtk	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	822	exosmo5lwmhq	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 05:41:54.555502+00	2026-04-03 06:40:18.543376+00	hrjtkfsmryl7	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	823	uvtkeosxt4gc	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 06:40:18.563392+00	2026-04-03 10:47:20.378918+00	exosmo5lwmhq	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	824	vbk3kkb44qsg	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 10:47:20.396863+00	2026-04-03 11:46:33.03016+00	uvtkeosxt4gc	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	825	usjcpxuqjrz2	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 11:46:33.042398+00	2026-04-03 13:09:36.454987+00	vbk3kkb44qsg	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	826	vqyevoe56a7u	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 13:09:36.479568+00	2026-04-03 14:49:48.238951+00	usjcpxuqjrz2	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	827	xx5jgokkzrek	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 14:49:48.259005+00	2026-04-03 15:48:01.344169+00	vqyevoe56a7u	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	828	m4dg6qlmfk4i	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 15:48:01.357504+00	2026-04-03 16:46:18.275752+00	xx5jgokkzrek	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	829	wb4tstvnikzb	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 16:46:18.284086+00	2026-04-03 17:44:48.367685+00	m4dg6qlmfk4i	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	830	gqzgx37gladf	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 17:44:48.381653+00	2026-04-03 18:43:18.174563+00	wb4tstvnikzb	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	831	acfbjjvh4l2w	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 18:43:18.195737+00	2026-04-03 19:41:48.193274+00	gqzgx37gladf	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	832	o7bfojfzpa6a	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 19:41:48.204987+00	2026-04-03 20:40:57.162662+00	acfbjjvh4l2w	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	833	hp77n4vt7wt4	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 20:40:57.183669+00	2026-04-03 21:39:17.743893+00	o7bfojfzpa6a	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	834	pveubwaljrue	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 21:39:17.753625+00	2026-04-03 22:37:48.266043+00	hp77n4vt7wt4	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	835	m5dqnnqxluoq	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 22:37:48.277409+00	2026-04-03 23:36:18.238114+00	pveubwaljrue	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	836	srshz2mmh3eo	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-03 23:36:18.248908+00	2026-04-04 00:34:48.26142+00	m5dqnnqxluoq	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	837	c3b47q3u6m2v	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-04 00:34:48.269237+00	2026-04-04 01:33:18.169426+00	srshz2mmh3eo	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	838	uckmlcgoagn5	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-04 01:33:18.180436+00	2026-04-04 02:31:48.365381+00	c3b47q3u6m2v	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	839	4uy577w2ocgl	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-04 02:31:48.377444+00	2026-04-04 03:30:18.235753+00	uckmlcgoagn5	5c322fc8-989a-4173-afe8-dc493f754934
00000000-0000-0000-0000-000000000000	805	r47mmxp73ooq	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-01 07:23:09.449201+00	2026-04-04 11:22:20.462257+00	sjdx4bltojwl	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	841	u2ueymbxtn6t	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-04 11:22:20.471264+00	2026-04-04 15:02:33.253881+00	r47mmxp73ooq	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	807	yczsxjlwygor	d442332e-65d2-43b9-be79-f214a3d53bd3	t	2026-04-01 07:27:11.423875+00	2026-04-04 15:53:36.697248+00	s5n2yawjxewl	6e123c82-7923-4853-852c-f41800d66a4f
00000000-0000-0000-0000-000000000000	852	l4l3lu4otqjn	a2473357-5896-4e88-a313-35c70d3f3432	f	2026-04-05 05:49:47.850082+00	2026-04-05 05:49:47.850082+00	hcfjdfbrmv7m	32a00d01-ca76-48b5-855b-5855d940a7b5
00000000-0000-0000-0000-000000000000	853	qtw3nht6huag	a2473357-5896-4e88-a313-35c70d3f3432	f	2026-04-05 06:00:16.676915+00	2026-04-05 06:00:16.676915+00	\N	ffd4e8ed-aec3-4e1c-bfcf-198622ec7856
00000000-0000-0000-0000-000000000000	854	snihdt3shjho	a2473357-5896-4e88-a313-35c70d3f3432	t	2026-04-05 06:45:32.794719+00	2026-04-05 07:52:37.077462+00	\N	9ef104a3-9ac2-485d-af36-28da8b2433da
00000000-0000-0000-0000-000000000000	855	xyutwjkn4tj5	a2473357-5896-4e88-a313-35c70d3f3432	f	2026-04-05 07:52:37.098761+00	2026-04-05 07:52:37.098761+00	snihdt3shjho	9ef104a3-9ac2-485d-af36-28da8b2433da
00000000-0000-0000-0000-000000000000	856	lvirkbkbwx2a	a2473357-5896-4e88-a313-35c70d3f3432	f	2026-04-05 08:01:15.901764+00	2026-04-05 08:01:15.901764+00	\N	d87dfe3f-fac4-4c8a-8879-04e7251cb06a
00000000-0000-0000-0000-000000000000	857	bt22qzwq4i3z	a2473357-5896-4e88-a313-35c70d3f3432	f	2026-04-05 08:14:24.803115+00	2026-04-05 08:14:24.803115+00	\N	5690d7bb-2b7d-4412-9f69-4af23579d60d
00000000-0000-0000-0000-000000000000	858	epyohx52274b	a2473357-5896-4e88-a313-35c70d3f3432	f	2026-04-05 08:24:37.146919+00	2026-04-05 08:24:37.146919+00	\N	1089668f-ee9f-4d33-a29f-5c1b6dd370ce
00000000-0000-0000-0000-000000000000	860	5gwc3hmbnd5o	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	f	2026-04-05 08:59:35.444161+00	2026-04-05 08:59:35.444161+00	\N	9d1645d0-3541-4d9f-aa8e-af1a19b0ef4c
00000000-0000-0000-0000-000000000000	861	7k4xkoqje3ee	fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	f	2026-04-05 09:05:48.546813+00	2026-04-05 09:05:48.546813+00	\N	c95177c6-7e91-4ea9-920a-aec35236055f
00000000-0000-0000-0000-000000000000	862	jds63ulbmypx	d442332e-65d2-43b9-be79-f214a3d53bd3	f	2026-04-05 09:14:29.129302+00	2026-04-05 09:14:29.129302+00	\N	b1ad7294-0451-4309-a69d-4297b7d87f38
00000000-0000-0000-0000-000000000000	864	pri4v2igkw5r	fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	f	2026-04-05 09:35:09.713729+00	2026-04-05 09:35:09.713729+00	\N	51656f7d-2a8d-4445-bc2d-21d81d5f773c
00000000-0000-0000-0000-000000000000	863	d2yibodkakf7	6308420e-5192-4590-967d-d69c8e93aa75	t	2026-04-05 09:16:50.449054+00	2026-04-05 10:27:07.940646+00	eorsyjwy53q7	c5e4f322-fb88-4529-8a70-14ecea2c451c
00000000-0000-0000-0000-000000000000	866	lgrd76l5uoqs	6308420e-5192-4590-967d-d69c8e93aa75	f	2026-04-05 10:27:07.954125+00	2026-04-05 10:27:07.954125+00	d2yibodkakf7	c5e4f322-fb88-4529-8a70-14ecea2c451c
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
6540aad9-6c67-4399-8c1a-7375fff08acb	24766c66-a4fd-407b-bc73-afd6feedd8c2	2026-03-28 16:51:06.97519+00	2026-03-31 14:30:07.544687+00	\N	aal1	\N	2026-03-31 14:30:07.54458	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	152.56.133.0	\N	\N	\N	\N	\N
3ee08765-5ea4-4741-9d5a-74ab225caaed	6308420e-5192-4590-967d-d69c8e93aa75	2025-11-29 04:23:14.844364+00	2025-11-29 04:23:14.844364+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	152.59.161.238	\N	\N	\N	\N	\N
c95177c6-7e91-4ea9-920a-aec35236055f	fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	2026-04-05 09:05:48.535922+00	2026-04-05 09:05:48.535922+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.161.153	\N	\N	\N	\N	\N
b1ad7294-0451-4309-a69d-4297b7d87f38	d442332e-65d2-43b9-be79-f214a3d53bd3	2026-04-05 09:14:29.108039+00	2026-04-05 09:14:29.108039+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.161.153	\N	\N	\N	\N	\N
c989a1c8-5917-4d47-b430-659a4de9fd83	6308420e-5192-4590-967d-d69c8e93aa75	2025-11-28 12:42:22.662685+00	2025-12-02 16:58:40.849401+00	\N	aal1	\N	2025-12-02 16:58:40.849274	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36	103.252.166.243	\N	\N	\N	\N	\N
8e625aab-2977-4c77-8f5e-a7aa5d465083	6308420e-5192-4590-967d-d69c8e93aa75	2025-12-02 16:59:20.48149+00	2025-12-03 19:26:30.388337+00	\N	aal1	\N	2025-12-03 19:26:30.388221	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	103.252.166.31	\N	\N	\N	\N	\N
87eea701-7da2-4e96-a315-968c4df4b408	6308420e-5192-4590-967d-d69c8e93aa75	2025-12-03 19:27:50.893132+00	2025-12-03 20:26:50.29394+00	\N	aal1	\N	2025-12-03 20:26:50.293295	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	103.252.166.31	\N	\N	\N	\N	\N
51656f7d-2a8d-4445-bc2d-21d81d5f773c	fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	2026-04-05 09:35:09.704858+00	2026-04-05 09:35:09.704858+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.161.153	\N	\N	\N	\N	\N
c5e4f322-fb88-4529-8a70-14ecea2c451c	6308420e-5192-4590-967d-d69c8e93aa75	2026-03-28 16:52:30.381383+00	2026-04-05 10:27:07.980774+00	\N	aal1	\N	2026-04-05 10:27:07.980665	node	152.59.161.153	\N	\N	\N	\N	\N
7ca8913b-4dc2-41ee-b64d-55237c4d8670	6308420e-5192-4590-967d-d69c8e93aa75	2025-12-03 20:27:23.366914+00	2025-12-04 06:07:50.150818+00	\N	aal1	\N	2025-12-04 06:07:50.150105	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36	103.252.166.31	\N	\N	\N	\N	\N
61822b99-50bf-452b-823e-84142987842e	24766c66-a4fd-407b-bc73-afd6feedd8c2	2026-01-28 15:53:59.994757+00	2026-01-28 15:53:59.994757+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	152.59.158.222	\N	\N	\N	\N	\N
ed77465b-c33d-4769-9fbe-bf45e21c1d17	24766c66-a4fd-407b-bc73-afd6feedd8c2	2026-01-27 18:53:14.490701+00	2026-01-28 16:30:27.747602+00	\N	aal1	\N	2026-01-28 16:30:27.747477	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36	152.59.158.222	\N	\N	\N	\N	\N
6e123c82-7923-4853-852c-f41800d66a4f	d442332e-65d2-43b9-be79-f214a3d53bd3	2026-03-28 15:11:31.761672+00	2026-04-04 16:59:17.064619+00	\N	aal1	\N	2026-04-04 16:59:17.064513	okhttp/4.12.0	152.59.167.104	\N	\N	\N	\N	\N
66481c13-a3ec-4a08-93c4-6fe7465cf34d	d442332e-65d2-43b9-be79-f214a3d53bd3	2026-04-04 17:27:56.101+00	2026-04-04 17:27:56.101+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.167.104	\N	\N	\N	\N	\N
5c322fc8-989a-4173-afe8-dc493f754934	6308420e-5192-4590-967d-d69c8e93aa75	2026-04-02 04:47:09.268899+00	2026-04-05 03:38:04.262115+00	\N	aal1	\N	2026-04-05 03:38:04.262009	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	152.59.167.175	\N	\N	\N	\N	\N
be865793-3d3f-42b1-a620-97d435255b99	24766c66-a4fd-407b-bc73-afd6feedd8c2	2026-03-31 14:37:55.643766+00	2026-04-02 04:46:33.345333+00	\N	aal1	\N	2026-04-02 04:46:33.345223	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	104.28.155.19	\N	\N	\N	\N	\N
a9b9a7a7-5bbd-4a42-9e5b-5ba589899fa7	24766c66-a4fd-407b-bc73-afd6feedd8c2	2026-03-28 10:04:45.213929+00	2026-03-28 16:26:06.543156+00	\N	aal1	\N	2026-03-28 16:26:06.543048	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	104.28.164.46	\N	\N	\N	\N	\N
480f3d78-5787-40b9-a137-fbc2371faa1d	6308420e-5192-4590-967d-d69c8e93aa75	2026-04-05 03:38:32.336363+00	2026-04-05 03:38:32.336363+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	152.59.167.175	\N	\N	\N	\N	\N
42d3a03e-4781-4701-93a6-c9d00d28f81b	6308420e-5192-4590-967d-d69c8e93aa75	2026-04-05 03:39:39.32178+00	2026-04-05 03:39:39.32178+00	\N	aal1	\N	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	152.59.167.175	\N	\N	\N	\N	\N
32a00d01-ca76-48b5-855b-5855d940a7b5	a2473357-5896-4e88-a313-35c70d3f3432	2026-04-05 04:51:22.42137+00	2026-04-05 05:49:47.866026+00	\N	aal1	\N	2026-04-05 05:49:47.865925	okhttp/4.12.0	152.58.138.122	\N	\N	\N	\N	\N
ffd4e8ed-aec3-4e1c-bfcf-198622ec7856	a2473357-5896-4e88-a313-35c70d3f3432	2026-04-05 06:00:16.638016+00	2026-04-05 06:00:16.638016+00	\N	aal1	\N	\N	okhttp/4.12.0	152.58.138.174	\N	\N	\N	\N	\N
ac90f371-7197-40b0-8f55-e8f798bbdfd3	24766c66-a4fd-407b-bc73-afd6feedd8c2	2026-03-28 10:26:40.647955+00	2026-03-31 13:14:38.383982+00	\N	aal1	\N	2026-03-31 13:14:38.383855	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36	104.28.164.33	\N	\N	\N	\N	\N
9ef104a3-9ac2-485d-af36-28da8b2433da	a2473357-5896-4e88-a313-35c70d3f3432	2026-04-05 06:45:32.764387+00	2026-04-05 07:52:37.121004+00	\N	aal1	\N	2026-04-05 07:52:37.120889	okhttp/4.12.0	152.59.162.136	\N	\N	\N	\N	\N
d87dfe3f-fac4-4c8a-8879-04e7251cb06a	a2473357-5896-4e88-a313-35c70d3f3432	2026-04-05 08:01:15.875592+00	2026-04-05 08:01:15.875592+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.162.136	\N	\N	\N	\N	\N
5690d7bb-2b7d-4412-9f69-4af23579d60d	a2473357-5896-4e88-a313-35c70d3f3432	2026-04-05 08:14:24.779414+00	2026-04-05 08:14:24.779414+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.162.136	\N	\N	\N	\N	\N
1089668f-ee9f-4d33-a29f-5c1b6dd370ce	a2473357-5896-4e88-a313-35c70d3f3432	2026-04-05 08:24:37.131658+00	2026-04-05 08:24:37.131658+00	\N	aal1	\N	\N	okhttp/4.12.0	152.59.162.136	\N	\N	\N	\N	\N
9d1645d0-3541-4d9f-aa8e-af1a19b0ef4c	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	2026-04-05 08:59:35.426918+00	2026-04-05 08:59:35.426918+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36	152.59.161.153	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	38322fdd-1346-4f01-9325-955d246a89af	authenticated	authenticated	mondalfishcenter2005@gmail.com	$2a$10$hgPAnwy38v9/JAto7mGBU.QDlpx9z6l2BD2uhyoD2EHRZVykP7rhu	2025-11-09 17:53:50.335763+00	\N		\N		\N			\N	2026-03-25 05:47:50.156957+00	{"provider": "email", "providers": ["email", "google"]}	{"iss": "https://accounts.google.com", "sub": "103911283362604170395", "name": "MFC", "email": "mondalfishcenter2005@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKoimiV-Hogs7qgQ5n2Tl1UBsNY6Se1p7kt1G-543gksr-6vWYu=s96-c", "full_name": "MFC", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKoimiV-Hogs7qgQ5n2Tl1UBsNY6Se1p7kt1G-543gksr-6vWYu=s96-c", "provider_id": "103911283362604170395", "email_verified": true, "phone_verified": false}	\N	2025-11-09 17:53:50.263159+00	2026-03-25 05:47:50.193204+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c0044c8b-cf12-4613-bdb1-40749779b927	authenticated	authenticated	seller@test.local	$2a$10$wPV2SLWlg/movp4aBqLMpuNgHpOh6If7UZT0EquUBtrnMzal2SZL2	2025-11-09 17:53:11.454683+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-09 17:53:11.385308+00	2025-11-09 17:53:11.462182+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	d442332e-65d2-43b9-be79-f214a3d53bd3	authenticated	authenticated	manager4@test.local	$2a$10$pFucfVxl4Njxblu4qkVqG.FkvpwC3oQI6aMUxGn4outqF8VoRqc96	2026-03-25 05:59:34.723978+00	\N		\N		\N			\N	2026-04-05 09:14:29.104409+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-03-25 05:59:34.70058+00	2026-04-05 09:14:29.138887+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	authenticated	authenticated	admin@test.local	$2a$10$UPpggDld9ozZ3PaD7axWyOYXMl3SL8M/cwIlvopZBDnIXRkH14Bt2	2026-04-05 09:03:23.061654+00	\N		\N		\N			\N	2026-04-05 09:35:09.704753+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-05 09:03:23.037189+00	2026-04-05 09:35:09.720287+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a2473357-5896-4e88-a313-35c70d3f3432	authenticated	authenticated	bultu@test.local	$2a$10$zxhOh8Nr.fR0jTLbXBBx3uKJ0svrrNke7CKZ2Y1.mzsRAMLN8TzoO	2026-04-05 04:50:16.602589+00	\N		\N		\N			\N	2026-04-05 08:33:16.645517+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-04-05 04:50:16.57456+00	2026-04-05 09:37:57.856697+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6308420e-5192-4590-967d-d69c8e93aa75	authenticated	authenticated	manager2@test.local	$2a$10$ZinB8C.JSVIq.NQSKNE7zu/KpZGLYMsn9SKOFVsc3n5epKQk1f58W	2025-11-09 18:05:47.799295+00	\N		\N		\N			\N	2026-04-05 03:39:39.320458+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-11-09 18:05:47.787783+00	2026-04-05 10:27:07.965165+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	authenticated	authenticated	asmatbyte@gmail.com	$2a$10$QgnaNbDTDv0GVoX1qJhaf.DFrjIuY76VWqGsJR/TvfcFTvmElkFR.	2025-11-09 17:52:42.270738+00	\N		\N		\N			\N	2026-04-05 08:59:35.425881+00	{"provider": "email", "providers": ["email", "google"]}	{"iss": "https://accounts.google.com", "sub": "107417267988249177465", "name": "Asmat Mondal", "email": "asmatbyte@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocK00XMQwSsPPDRba5CjH41gCB71pEBTfnqEVyGoLceDDmm0u-em=s96-c", "full_name": "Asmat Mondal", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocK00XMQwSsPPDRba5CjH41gCB71pEBTfnqEVyGoLceDDmm0u-em=s96-c", "provider_id": "107417267988249177465", "email_verified": true, "phone_verified": false}	\N	2025-11-09 17:52:42.26426+00	2026-04-05 08:59:35.459875+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	24766c66-a4fd-407b-bc73-afd6feedd8c2	authenticated	authenticated	manager3@test.local	$2a$10$pC7ALUtEZnraJG6Rw8OZj.3.yFBxdxp1wUk.2Dsn/HK3.HJEBYr9G	2026-01-27 15:56:33.088933+00	\N		\N		\N			\N	2026-03-31 14:37:55.643614+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-01-27 15:56:33.057253+00	2026-04-02 04:46:33.334608+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: -
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
1	30 18 * * *	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	localhost	5432	postgres	postgres	t	reset-daily-batch-sequence
5	0 23 * * 0	\n  SELECT public.cleanup_pending_registrations();\n  	localhost	5432	postgres	postgres	t	weekly-registration-cleanup
\.


--
-- Data for Name: job_run_details; Type: TABLE DATA; Schema: cron; Owner: -
--

COPY cron.job_run_details (jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time) FROM stdin;
2	35	1318626	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-17 18:30:00.308492+00	2025-11-17 18:30:00.334816+00
2	39	1363372	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-18 18:30:00.413721+00	2025-11-18 18:30:00.426089+00
2	1	977390	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-09 18:30:00.272348+00	2025-11-09 18:30:00.277272+00
4	36	1318627	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-17 18:30:00.317366+00	2025-11-17 18:30:00.338247+00
1	28	1233745	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-15 18:30:00.332947+00	2025-11-15 18:30:00.348132+00
2	26	1233743	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-15 18:30:00.321448+00	2025-11-15 18:30:00.350285+00
1	3	977392	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-09 18:30:00.284093+00	2025-11-09 18:30:00.291346+00
2	22	1190566	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-14 18:30:00.321717+00	2025-11-14 18:30:00.343785+00
4	2	977391	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-09 18:30:00.289983+00	2025-11-09 18:30:00.29591+00
4	11	1063413	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-11 18:30:00.316996+00	2025-11-11 18:30:00.332997+00
3	4	977393	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-09 18:30:00.297569+00	2025-11-09 18:30:00.300177+00
2	10	1063412	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-11 18:30:00.314423+00	2025-11-11 18:30:00.336366+00
1	12	1063414	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-11 18:30:00.318386+00	2025-11-11 18:30:00.339303+00
3	13	1063415	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-11 18:30:00.320875+00	2025-11-11 18:30:00.341012+00
5	5	985599	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-11-09 23:00:00.310104+00	2025-11-09 23:00:00.461979+00
4	23	1190567	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-14 18:30:00.324276+00	2025-11-14 18:30:00.347314+00
1	24	1190568	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-14 18:30:00.319377+00	2025-11-14 18:30:00.350774+00
3	25	1190569	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-14 18:30:00.325573+00	2025-11-14 18:30:00.353571+00
4	27	1233744	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-15 18:30:00.326806+00	2025-11-15 18:30:00.353102+00
2	18	1148360	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-13 18:30:00.323385+00	2025-11-13 18:30:00.340663+00
4	19	1148361	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-13 18:30:00.320906+00	2025-11-13 18:30:00.343452+00
1	20	1148362	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-13 18:30:00.31623+00	2025-11-13 18:30:00.34629+00
2	6	1020852	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-10 18:30:00.289442+00	2025-11-10 18:30:00.294605+00
4	7	1020853	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-10 18:30:00.290632+00	2025-11-10 18:30:00.296729+00
1	8	1020854	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-10 18:30:00.286933+00	2025-11-10 18:30:00.299446+00
3	9	1020855	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-10 18:30:00.292652+00	2025-11-10 18:30:00.30084+00
3	21	1148363	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-13 18:30:00.325865+00	2025-11-13 18:30:00.34847+00
3	29	1233746	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-15 18:30:00.335398+00	2025-11-15 18:30:00.354658+00
4	15	1106085	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-12 18:30:00.305995+00	2025-11-12 18:30:00.329132+00
2	14	1106084	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-12 18:30:00.310928+00	2025-11-12 18:30:00.332399+00
1	16	1106086	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-12 18:30:00.307293+00	2025-11-12 18:30:00.335912+00
3	17	1106087	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-12 18:30:00.312259+00	2025-11-12 18:30:00.339294+00
5	34	1284115	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-11-16 23:00:00.308004+00	2025-11-16 23:00:00.482567+00
3	38	1318629	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-17 18:30:00.319769+00	2025-11-17 18:30:00.34107+00
1	32	1276204	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-16 18:30:00.35877+00	2025-11-16 18:30:00.382381+00
2	30	1276202	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-16 18:30:00.361183+00	2025-11-16 18:30:00.385701+00
1	37	1318628	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-17 18:30:00.314265+00	2025-11-17 18:30:00.342622+00
4	31	1276203	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-16 18:30:00.356238+00	2025-11-16 18:30:00.388583+00
3	33	1276205	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-16 18:30:00.362508+00	2025-11-16 18:30:00.390851+00
2	43	1405117	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-19 18:30:00.310757+00	2025-11-19 18:30:00.339816+00
3	42	1363375	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-18 18:30:00.412465+00	2025-11-18 18:30:00.432736+00
4	40	1363373	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-18 18:30:00.409637+00	2025-11-18 18:30:00.428419+00
1	41	1363374	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-18 18:30:00.411079+00	2025-11-18 18:30:00.430452+00
4	44	1405118	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-19 18:30:00.312055+00	2025-11-19 18:30:00.341429+00
1	45	1405119	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-19 18:30:00.326398+00	2025-11-19 18:30:00.344648+00
3	46	1405120	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-19 18:30:00.314637+00	2025-11-19 18:30:00.337434+00
4	77	1749140	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-27 18:30:00.330004+00	2025-11-27 18:30:00.35538+00
5	63	1584378	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-11-23 23:00:00.273939+00	2025-11-23 23:00:00.485528+00
1	78	1749141	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-27 18:30:00.325155+00	2025-11-27 18:30:00.357603+00
4	81	1792054	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-28 18:30:00.331493+00	2025-11-28 18:30:00.356661+00
1	57	1531870	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-22 18:30:00.33235+00	2025-11-22 18:30:00.34356+00
2	55	1531868	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-22 18:30:00.319354+00	2025-11-22 18:30:00.347026+00
4	56	1531869	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-22 18:30:00.329846+00	2025-11-22 18:30:00.351153+00
1	49	1446870	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-20 18:30:00.321525+00	2025-11-20 18:30:00.339862+00
2	47	1446868	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-20 18:30:00.315254+00	2025-11-20 18:30:00.342787+00
4	48	1446869	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-20 18:30:00.31787+00	2025-11-20 18:30:00.346901+00
3	50	1446871	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-20 18:30:00.32027+00	2025-11-20 18:30:00.349796+00
3	58	1531871	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-22 18:30:00.326802+00	2025-11-22 18:30:00.353375+00
1	82	1792055	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-28 18:30:00.332655+00	2025-11-28 18:30:00.359675+00
3	83	1792056	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-28 18:30:00.328342+00	2025-11-28 18:30:00.361231+00
2	51	1489708	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-21 18:30:00.251388+00	2025-11-21 18:30:00.259601+00
1	74	1706171	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-26 18:30:00.341073+00	2025-11-26 18:30:00.35482+00
4	69	1660887	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-25 18:30:00.288701+00	2025-11-25 18:30:00.309574+00
2	68	1660886	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-25 18:30:00.284235+00	2025-11-25 18:30:00.312494+00
3	54	1489711	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-21 18:30:00.266641+00	2025-11-21 18:30:00.270383+00
1	53	1489710	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-21 18:30:00.268075+00	2025-11-21 18:30:00.272748+00
4	52	1489709	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-21 18:30:00.256369+00	2025-11-21 18:30:00.274422+00
1	70	1660888	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-25 18:30:00.296122+00	2025-11-25 18:30:00.316072+00
3	71	1660889	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-25 18:30:00.297392+00	2025-11-25 18:30:00.318958+00
2	64	1618635	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-24 18:30:00.353118+00	2025-11-24 18:30:00.377715+00
4	65	1618636	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-24 18:30:00.360655+00	2025-11-24 18:30:00.380585+00
1	66	1618637	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-24 18:30:00.361844+00	2025-11-24 18:30:00.382088+00
3	67	1618638	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-24 18:30:00.363046+00	2025-11-24 18:30:00.384272+00
1	61	1576668	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-23 18:30:00.344049+00	2025-11-23 18:30:00.356899+00
2	59	1576666	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-23 18:30:00.333709+00	2025-11-23 18:30:00.360164+00
4	60	1576667	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-23 18:30:00.340561+00	2025-11-23 18:30:00.365159+00
3	62	1576669	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-23 18:30:00.34663+00	2025-11-23 18:30:00.36665+00
2	72	1706169	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-26 18:30:00.331018+00	2025-11-26 18:30:00.358092+00
4	73	1706170	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-26 18:30:00.337881+00	2025-11-26 18:30:00.360238+00
3	75	1706172	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-26 18:30:00.335387+00	2025-11-26 18:30:00.362446+00
3	87	1834887	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-29 18:30:00.327689+00	2025-11-29 18:30:00.343442+00
3	79	1749142	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-27 18:30:00.326325+00	2025-11-27 18:30:00.348334+00
4	85	1834885	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-29 18:30:00.330038+00	2025-11-29 18:30:00.349087+00
2	76	1749139	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-27 18:30:00.327473+00	2025-11-27 18:30:00.351956+00
2	84	1834884	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-29 18:30:00.318932+00	2025-11-29 18:30:00.345565+00
1	86	1834886	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-29 18:30:00.322834+00	2025-11-29 18:30:00.350701+00
2	80	1792053	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-28 18:30:00.329546+00	2025-11-28 18:30:00.353372+00
2	88	1877338	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-11-30 18:30:00.32966+00	2025-11-30 18:30:00.355929+00
4	89	1877339	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-30 18:30:00.331638+00	2025-11-30 18:30:00.358341+00
2	333	198892	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-28 18:30:00.204691+00	2026-01-28 18:30:00.220665+00
3	91	1877341	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-11-30 18:30:00.346534+00	2025-11-30 18:30:00.359875+00
1	90	1877340	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-11-30 18:30:00.334013+00	2025-11-30 18:30:00.353249+00
3	108	2047237	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-04 18:30:00.341228+00	2025-12-04 18:30:00.367556+00
5	92	1885247	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-11-30 23:00:00.288186+00	2025-11-30 23:00:00.481462+00
5	121	2183289	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-12-07 23:00:00.304636+00	2025-12-07 23:00:00.529462+00
1	124	2218114	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-08 18:30:00.326773+00	2025-12-08 18:30:00.357988+00
2	101	2004409	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-03 18:30:00.33083+00	2025-12-03 18:30:00.354804+00
4	102	2004410	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-03 18:30:00.329574+00	2025-12-03 18:30:00.358635+00
1	95	1919610	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-01 18:30:00.297581+00	2025-12-01 18:30:00.314003+00
2	93	1919608	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-01 18:30:00.290699+00	2025-12-01 18:30:00.316065+00
4	94	1919609	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-01 18:30:00.29201+00	2025-12-01 18:30:00.317624+00
3	96	1919611	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-01 18:30:00.296119+00	2025-12-01 18:30:00.319029+00
1	103	2004411	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-03 18:30:00.336868+00	2025-12-03 18:30:00.360853+00
3	104	2004412	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-03 18:30:00.33808+00	2025-12-03 18:30:00.363186+00
3	129	2260864	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-09 18:30:00.320704+00	2025-12-09 18:30:00.337402+00
2	117	2175388	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-07 18:30:00.311611+00	2025-12-07 18:30:00.335831+00
2	113	2132618	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-06 18:30:00.331845+00	2025-12-06 18:30:00.357019+00
4	114	2132619	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-06 18:30:00.341206+00	2025-12-06 18:30:00.359949+00
1	115	2132620	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-06 18:30:00.342501+00	2025-12-06 18:30:00.362766+00
3	116	2132621	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-06 18:30:00.345801+00	2025-12-06 18:30:00.366276+00
2	97	1962054	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-02 18:30:00.324725+00	2025-12-02 18:30:00.346542+00
4	98	1962055	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-02 18:30:00.327177+00	2025-12-02 18:30:00.349868+00
1	99	1962056	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-02 18:30:00.322194+00	2025-12-02 18:30:00.3515+00
3	100	1962057	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-02 18:30:00.323434+00	2025-12-02 18:30:00.353083+00
2	109	2089911	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-05 18:30:00.342444+00	2025-12-05 18:30:00.369834+00
4	110	2089912	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-05 18:30:00.355788+00	2025-12-05 18:30:00.371993+00
1	111	2089913	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-05 18:30:00.353324+00	2025-12-05 18:30:00.374262+00
3	112	2089914	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-05 18:30:00.35458+00	2025-12-05 18:30:00.376589+00
4	118	2175389	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-07 18:30:00.320735+00	2025-12-07 18:30:00.339383+00
2	105	2047234	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-04 18:30:00.336527+00	2025-12-04 18:30:00.358832+00
4	106	2047235	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-04 18:30:00.3377+00	2025-12-04 18:30:00.36118+00
1	107	2047236	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-04 18:30:00.338886+00	2025-12-04 18:30:00.364636+00
1	119	2175390	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-07 18:30:00.318071+00	2025-12-07 18:30:00.341702+00
3	120	2175391	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-07 18:30:00.322078+00	2025-12-07 18:30:00.343364+00
2	126	2260861	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-09 18:30:00.317002+00	2025-12-09 18:30:00.339688+00
2	130	2303674	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-10 18:30:00.301163+00	2025-12-10 18:30:00.330616+00
4	127	2260862	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-09 18:30:00.318315+00	2025-12-09 18:30:00.341922+00
1	128	2260863	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-09 18:30:00.313043+00	2025-12-09 18:30:00.343779+00
3	125	2218115	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-08 18:30:00.338304+00	2025-12-08 18:30:00.351408+00
2	122	2218112	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-08 18:30:00.333572+00	2025-12-08 18:30:00.353595+00
4	123	2218113	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-08 18:30:00.339522+00	2025-12-08 18:30:00.355155+00
1	132	2303676	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-10 18:30:00.314205+00	2025-12-10 18:30:00.33216+00
4	131	2303675	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-10 18:30:00.318198+00	2025-12-10 18:30:00.327816+00
3	133	2303677	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-10 18:30:00.316906+00	2025-12-10 18:30:00.334445+00
2	134	2349091	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-11 18:30:00.310508+00	2025-12-11 18:30:00.342078+00
4	334	198893	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-28 18:30:00.214077+00	2026-01-28 18:30:00.218204+00
1	335	198894	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-28 18:30:00.209685+00	2026-01-28 18:30:00.222171+00
3	336	198895	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-28 18:30:00.215313+00	2026-01-28 18:30:00.224098+00
4	135	2349092	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-11 18:30:00.315612+00	2025-12-11 18:30:00.337759+00
1	136	2349093	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-11 18:30:00.333038+00	2025-12-11 18:30:00.340017+00
3	137	2349094	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-11 18:30:00.335569+00	2025-12-11 18:30:00.344326+00
3	158	2561259	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-16 18:30:00.333005+00	2025-12-16 18:30:00.355415+00
4	164	2645748	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-18 18:30:00.32777+00	2025-12-18 18:30:00.357562+00
3	154	2518943	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-15 18:30:00.340619+00	2025-12-15 18:30:00.347857+00
2	151	2518940	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-15 18:30:00.322704+00	2025-12-15 18:30:00.350786+00
4	152	2518941	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-15 18:30:00.337665+00	2025-12-15 18:30:00.353097+00
1	153	2518942	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-15 18:30:00.341839+00	2025-12-15 18:30:00.356174+00
2	138	2391993	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-12 18:30:00.318004+00	2025-12-12 18:30:00.338802+00
4	139	2391994	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-12 18:30:00.312839+00	2025-12-12 18:30:00.342307+00
1	140	2391995	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-12 18:30:00.322974+00	2025-12-12 18:30:00.34593+00
3	141	2391996	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-12 18:30:00.324284+00	2025-12-12 18:30:00.348134+00
3	149	2476782	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-14 18:30:00.332056+00	2025-12-14 18:30:00.349174+00
2	146	2476779	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-14 18:30:00.32343+00	2025-12-14 18:30:00.352364+00
4	147	2476780	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-14 18:30:00.326091+00	2025-12-14 18:30:00.35563+00
1	148	2476781	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-14 18:30:00.329671+00	2025-12-14 18:30:00.358455+00
5	150	2484571	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-12-14 23:00:00.254271+00	2025-12-14 23:00:00.451763+00
3	166	2645750	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-18 18:30:00.336106+00	2025-12-18 18:30:00.35985+00
2	142	2434507	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-13 18:30:00.314662+00	2025-12-13 18:30:00.338681+00
4	143	2434508	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-13 18:30:00.319688+00	2025-12-13 18:30:00.341446+00
1	144	2434509	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-13 18:30:00.322337+00	2025-12-13 18:30:00.343712+00
3	145	2434510	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-13 18:30:00.324845+00	2025-12-13 18:30:00.345235+00
1	169	2687904	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-19 18:30:00.303899+00	2025-12-19 18:30:00.333473+00
3	170	2687905	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-19 18:30:00.313671+00	2025-12-19 18:30:00.336306+00
4	172	2730075	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-20 18:30:00.350906+00	2025-12-20 18:30:00.366375+00
4	160	2603570	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-17 18:30:00.355858+00	2025-12-17 18:30:00.381687+00
2	159	2603569	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-17 18:30:00.358333+00	2025-12-17 18:30:00.384785+00
2	155	2561256	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-16 18:30:00.324308+00	2025-12-16 18:30:00.349002+00
4	156	2561257	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-16 18:30:00.325535+00	2025-12-16 18:30:00.351793+00
1	157	2561258	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-16 18:30:00.331731+00	2025-12-16 18:30:00.35388+00
1	161	2603571	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-17 18:30:00.359553+00	2025-12-17 18:30:00.389645+00
3	162	2603572	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-17 18:30:00.364426+00	2025-12-17 18:30:00.3918+00
2	171	2730073	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-20 18:30:00.34858+00	2025-12-20 18:30:00.368439+00
2	163	2645747	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-18 18:30:00.325986+00	2025-12-18 18:30:00.352008+00
1	165	2645749	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-18 18:30:00.333497+00	2025-12-18 18:30:00.355363+00
1	173	2730076	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-20 18:30:00.341773+00	2025-12-20 18:30:00.372406+00
3	174	2730077	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-20 18:30:00.347113+00	2025-12-20 18:30:00.373828+00
3	178	2772204	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-21 18:30:00.330027+00	2025-12-21 18:30:00.340174+00
4	168	2687903	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-19 18:30:00.310013+00	2025-12-19 18:30:00.327696+00
2	167	2687902	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-19 18:30:00.306852+00	2025-12-19 18:30:00.329852+00
2	175	2772201	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-21 18:30:00.313644+00	2025-12-21 18:30:00.336193+00
4	176	2772202	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-21 18:30:00.31899+00	2025-12-21 18:30:00.338196+00
2	337	242672	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-29 18:30:00.234637+00	2026-01-29 18:30:00.257046+00
1	177	2772203	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-21 18:30:00.320034+00	2025-12-21 18:30:00.34197+00
1	194	2940784	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-25 18:30:00.34116+00	2025-12-25 18:30:00.36684+00
5	179	2780017	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-12-21 23:00:00.282111+00	2025-12-21 23:00:00.467541+00
4	214	3152047	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-30 18:30:00.338766+00	2025-12-30 18:30:00.358555+00
1	211	3109784	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-29 18:30:00.333001+00	2025-12-29 18:30:00.357924+00
2	188	2898604	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-24 18:30:00.330304+00	2025-12-24 18:30:00.353683+00
4	189	2898605	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-24 18:30:00.334138+00	2025-12-24 18:30:00.357106+00
2	180	2814359	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-22 18:30:00.286564+00	2025-12-22 18:30:00.309394+00
4	181	2814360	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-22 18:30:00.287816+00	2025-12-22 18:30:00.31258+00
1	182	2814361	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-22 18:30:00.290352+00	2025-12-22 18:30:00.314091+00
3	183	2814362	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-22 18:30:00.294357+00	2025-12-22 18:30:00.315589+00
1	190	2898606	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-24 18:30:00.33766+00	2025-12-24 18:30:00.358598+00
3	191	2898607	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-24 18:30:00.336532+00	2025-12-24 18:30:00.363251+00
2	204	3067571	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-28 18:30:00.332825+00	2025-12-28 18:30:00.357118+00
1	202	3025238	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-27 18:30:00.35405+00	2025-12-27 18:30:00.377698+00
2	200	3025236	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-27 18:30:00.36166+00	2025-12-27 18:30:00.380747+00
4	201	3025237	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-27 18:30:00.359097+00	2025-12-27 18:30:00.384715+00
3	203	3025239	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-27 18:30:00.360388+00	2025-12-27 18:30:00.388145+00
4	185	2856467	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-23 18:30:00.35555+00	2025-12-23 18:30:00.370204+00
2	184	2856466	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-23 18:30:00.343413+00	2025-12-23 18:30:00.373092+00
1	186	2856468	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-23 18:30:00.352367+00	2025-12-23 18:30:00.377264+00
3	187	2856469	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-23 18:30:00.358083+00	2025-12-23 18:30:00.379596+00
3	199	2982990	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-26 18:30:00.373412+00	2025-12-26 18:30:00.391773+00
2	196	2982987	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-26 18:30:00.367317+00	2025-12-26 18:30:00.395003+00
4	197	2982988	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-26 18:30:00.368563+00	2025-12-26 18:30:00.399122+00
1	198	2982989	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-26 18:30:00.374658+00	2025-12-26 18:30:00.40063+00
1	206	3067573	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-28 18:30:00.339133+00	2025-12-28 18:30:00.361651+00
3	195	2940785	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-25 18:30:00.344736+00	2025-12-25 18:30:00.358516+00
2	192	2940782	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-25 18:30:00.334356+00	2025-12-25 18:30:00.360695+00
4	193	2940783	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-25 18:30:00.339968+00	2025-12-25 18:30:00.365346+00
4	205	3067572	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-28 18:30:00.33409+00	2025-12-28 18:30:00.364596+00
3	207	3067574	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-28 18:30:00.33794+00	2025-12-28 18:30:00.366724+00
1	215	3152048	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-30 18:30:00.331621+00	2025-12-30 18:30:00.360115+00
1	219	3194274	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2025-12-31 18:30:00.327447+00	2025-12-31 18:30:00.354434+00
3	216	3152049	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-30 18:30:00.333678+00	2025-12-30 18:30:00.361663+00
5	208	3075366	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2025-12-28 23:00:00.288646+00	2025-12-28 23:00:00.499766+00
2	209	3109782	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-29 18:30:00.342392+00	2025-12-29 18:30:00.361757+00
4	210	3109783	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-29 18:30:00.338181+00	2025-12-29 18:30:00.364544+00
3	212	3109785	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-29 18:30:00.345052+00	2025-12-29 18:30:00.366708+00
4	218	3194273	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-31 18:30:00.326187+00	2025-12-31 18:30:00.348636+00
2	217	3194272	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-31 18:30:00.32357+00	2025-12-31 18:30:00.351019+00
2	213	3152046	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2025-12-30 18:30:00.336188+00	2025-12-30 18:30:00.354585+00
3	220	3194275	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2025-12-31 18:30:00.331121+00	2025-12-31 18:30:00.357404+00
2	221	3236413	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-01 18:30:00.349463+00	2026-01-01 18:30:00.37914+00
3	340	242675	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-29 18:30:00.24603+00	2026-01-29 18:30:00.263276+00
4	338	242673	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-29 18:30:00.244078+00	2026-01-29 18:30:00.25878+00
1	339	242674	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-29 18:30:00.245122+00	2026-01-29 18:30:00.261417+00
1	223	3236415	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-01 18:30:00.357519+00	2026-01-01 18:30:00.375496+00
4	222	3236414	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-01 18:30:00.371889+00	2026-01-01 18:30:00.380721+00
3	224	3236416	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-01 18:30:00.373132+00	2026-01-01 18:30:00.382858+00
2	242	3447536	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-06 18:30:00.31934+00	2026-01-06 18:30:00.347764+00
1	244	3447538	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-06 18:30:00.32719+00	2026-01-06 18:30:00.350559+00
3	245	3447539	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-06 18:30:00.333129+00	2026-01-06 18:30:00.352058+00
3	241	3405128	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-05 18:30:00.327837+00	2026-01-05 18:30:00.342265+00
2	238	3405125	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-05 18:30:00.317899+00	2026-01-05 18:30:00.34533+00
4	239	3405126	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-05 18:30:00.325272+00	2026-01-05 18:30:00.350512+00
1	240	3405127	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-05 18:30:00.320924+00	2026-01-05 18:30:00.352334+00
2	225	3278669	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-02 18:30:00.332588+00	2026-01-02 18:30:00.352164+00
4	226	3278670	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-02 18:30:00.333889+00	2026-01-02 18:30:00.355022+00
1	227	3278671	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-02 18:30:00.327799+00	2026-01-02 18:30:00.356627+00
3	228	3278672	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-02 18:30:00.336383+00	2026-01-02 18:30:00.359364+00
3	249	3490191	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-07 18:30:00.341382+00	2026-01-07 18:30:00.361925+00
3	236	3362897	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-04 18:30:00.354308+00	2026-01-04 18:30:00.371953+00
2	233	3362894	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-04 18:30:00.351876+00	2026-01-04 18:30:00.374059+00
4	234	3362895	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-04 18:30:00.353042+00	2026-01-04 18:30:00.376286+00
1	235	3362896	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-04 18:30:00.349429+00	2026-01-04 18:30:00.379474+00
5	237	3370690	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-01-04 23:00:00.263798+00	2026-01-04 23:00:00.463141+00
3	232	3320767	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-03 18:30:00.341824+00	2026-01-03 18:30:00.358168+00
2	229	3320764	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-03 18:30:00.33712+00	2026-01-03 18:30:00.360818+00
4	230	3320765	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-03 18:30:00.340469+00	2026-01-03 18:30:00.362366+00
1	231	3320766	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-03 18:30:00.334538+00	2026-01-03 18:30:00.365396+00
2	250	3533048	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-08 18:30:00.330323+00	2026-01-08 18:30:00.358921+00
4	251	3533049	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-08 18:30:00.340942+00	2026-01-08 18:30:00.362484+00
3	253	3533051	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-08 18:30:00.344727+00	2026-01-08 18:30:00.363952+00
1	256	3575800	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-09 18:30:00.347655+00	2026-01-09 18:30:00.367574+00
3	261	3618452	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-10 18:30:00.311887+00	2026-01-10 18:30:00.326409+00
4	243	3447537	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-06 18:30:00.334479+00	2026-01-06 18:30:00.344525+00
1	248	3490190	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-07 18:30:00.340135+00	2026-01-07 18:30:00.35454+00
2	246	3490188	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-07 18:30:00.33764+00	2026-01-07 18:30:00.356767+00
4	247	3490189	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-07 18:30:00.331316+00	2026-01-07 18:30:00.36038+00
2	258	3618449	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-10 18:30:00.305368+00	2026-01-10 18:30:00.328727+00
1	252	3533050	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-08 18:30:00.342297+00	2026-01-08 18:30:00.356635+00
4	259	3618450	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-10 18:30:00.300731+00	2026-01-10 18:30:00.331464+00
1	260	3618451	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-10 18:30:00.310597+00	2026-01-10 18:30:00.334105+00
3	257	3575801	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-09 18:30:00.33872+00	2026-01-09 18:30:00.362106+00
2	254	3575798	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-09 18:30:00.341335+00	2026-01-09 18:30:00.364456+00
4	255	3575799	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-09 18:30:00.346348+00	2026-01-09 18:30:00.365991+00
1	264	3661024	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-11 18:30:00.330764+00	2026-01-11 18:30:00.349318+00
4	263	3661023	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-11 18:30:00.327018+00	2026-01-11 18:30:00.35305+00
2	262	3661022	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-11 18:30:00.324397+00	2026-01-11 18:30:00.351535+00
2	341	286581	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-30 18:30:00.250742+00	2026-01-30 18:30:00.279646+00
3	265	3661025	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-11 18:30:00.335042+00	2026-01-11 18:30:00.354563+00
3	282	3833367	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-15 18:30:00.321506+00	2026-01-15 18:30:00.346548+00
5	266	3668890	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-01-11 23:00:00.283764+00	2026-01-11 23:00:00.465299+00
4	301	4047012	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-20 18:30:00.347958+00	2026-01-20 18:30:00.362747+00
3	299	4004256	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-19 18:30:00.353402+00	2026-01-19 18:30:00.374579+00
2	275	3789219	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-14 18:30:00.319061+00	2026-01-14 18:30:00.341014+00
4	276	3789220	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-14 18:30:00.324982+00	2026-01-14 18:30:00.343526+00
3	270	3703664	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-12 18:30:00.3391+00	2026-01-12 18:30:00.359575+00
2	267	3703661	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-12 18:30:00.334103+00	2026-01-12 18:30:00.363639+00
4	268	3703662	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-12 18:30:00.335624+00	2026-01-12 18:30:00.366149+00
1	269	3703663	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-12 18:30:00.341493+00	2026-01-12 18:30:00.367695+00
1	277	3789221	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-14 18:30:00.323624+00	2026-01-14 18:30:00.345248+00
3	278	3789222	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-14 18:30:00.329203+00	2026-01-14 18:30:00.34736+00
4	292	3961428	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-18 18:30:00.352106+00	2026-01-18 18:30:00.36733+00
2	287	3918751	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-17 18:30:00.35766+00	2026-01-17 18:30:00.378306+00
4	288	3918752	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-17 18:30:00.354059+00	2026-01-17 18:30:00.382648+00
1	289	3918753	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-17 18:30:00.359404+00	2026-01-17 18:30:00.384156+00
3	290	3918754	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-17 18:30:00.360537+00	2026-01-17 18:30:00.38561+00
2	271	3746655	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-13 18:30:00.364263+00	2026-01-13 18:30:00.389497+00
4	272	3746656	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-13 18:30:00.36557+00	2026-01-13 18:30:00.391787+00
3	274	3746658	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-13 18:30:00.371075+00	2026-01-13 18:30:00.393829+00
1	273	3746657	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-13 18:30:00.366777+00	2026-01-13 18:30:00.396069+00
1	285	3876053	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-16 18:30:00.336534+00	2026-01-16 18:30:00.3562+00
2	283	3876051	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-16 18:30:00.331671+00	2026-01-16 18:30:00.358291+00
4	284	3876052	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-16 18:30:00.33535+00	2026-01-16 18:30:00.361711+00
3	286	3876054	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-16 18:30:00.339633+00	2026-01-16 18:30:00.365067+00
2	291	3961427	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-18 18:30:00.345948+00	2026-01-18 18:30:00.370418+00
1	281	3833366	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-15 18:30:00.320424+00	2026-01-15 18:30:00.337519+00
2	279	3833364	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-15 18:30:00.312844+00	2026-01-15 18:30:00.339663+00
4	280	3833365	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-15 18:30:00.3191+00	2026-01-15 18:30:00.343636+00
1	293	3961429	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-18 18:30:00.343578+00	2026-01-18 18:30:00.37452+00
3	294	3961430	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-18 18:30:00.349701+00	2026-01-18 18:30:00.376126+00
2	300	4047011	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-20 18:30:00.344902+00	2026-01-20 18:30:00.365733+00
1	302	4047013	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-20 18:30:00.341004+00	2026-01-20 18:30:00.368776+00
3	303	4047014	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-20 18:30:00.342206+00	2026-01-20 18:30:00.372285+00
3	307	4089513	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-21 18:30:00.35145+00	2026-01-21 18:30:00.376262+00
5	295	3969433	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-01-18 23:00:00.255087+00	2026-01-18 23:00:00.445486+00
1	298	4004255	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-19 18:30:00.350731+00	2026-01-19 18:30:00.36753+00
2	296	4004253	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-19 18:30:00.340577+00	2026-01-19 18:30:00.370336+00
4	297	4004254	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-19 18:30:00.344508+00	2026-01-19 18:30:00.372939+00
2	304	4089510	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-21 18:30:00.352929+00	2026-01-21 18:30:00.380108+00
4	305	4089511	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-21 18:30:00.354841+00	2026-01-21 18:30:00.382077+00
1	306	4089512	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-21 18:30:00.356198+00	2026-01-21 18:30:00.384318+00
2	308	4132212	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-22 18:30:00.334921+00	2026-01-22 18:30:00.36205+00
1	310	4132214	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-22 18:30:00.355734+00	2026-01-22 18:30:00.363687+00
4	342	286582	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-30 18:30:00.259571+00	2026-01-30 18:30:00.282552+00
1	343	286583	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-30 18:30:00.262122+00	2026-01-30 18:30:00.285463+00
4	309	4132213	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-22 18:30:00.33735+00	2026-01-22 18:30:00.358347+00
3	311	4132215	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-22 18:30:00.354397+00	2026-01-22 18:30:00.367273+00
2	325	109087	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-26 18:30:00.319674+00	2026-01-26 18:30:00.344703+00
4	326	109088	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-26 18:30:00.329499+00	2026-01-26 18:30:00.346878+00
1	327	109089	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-26 18:30:00.330876+00	2026-01-26 18:30:00.350442+00
3	328	109090	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-26 18:30:00.328191+00	2026-01-26 18:30:00.351981+00
4	330	152107	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-27 18:30:00.299007+00	2026-01-27 18:30:00.304697+00
3	332	152109	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-27 18:30:00.303374+00	2026-01-27 18:30:00.30736+00
4	321	66479	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-25 18:30:00.329651+00	2026-01-25 18:30:00.340239+00
2	320	66478	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-25 18:30:00.319815+00	2026-01-25 18:30:00.342305+00
3	315	4174892	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-23 18:30:00.34359+00	2026-01-23 18:30:00.358396+00
2	312	4174889	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-23 18:30:00.34597+00	2026-01-23 18:30:00.361333+00
4	313	4174890	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-23 18:30:00.334493+00	2026-01-23 18:30:00.364678+00
1	314	4174891	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-23 18:30:00.34194+00	2026-01-23 18:30:00.368011+00
1	322	66480	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-25 18:30:00.325919+00	2026-01-25 18:30:00.345824+00
3	323	66481	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-25 18:30:00.330835+00	2026-01-25 18:30:00.347333+00
3	344	286584	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-30 18:30:00.263358+00	2026-01-30 18:30:00.2773+00
5	324	74465	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-01-25 23:00:00.291627+00	2026-01-25 23:00:00.489626+00
4	350	373942	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-01 18:30:00.232372+00	2026-02-01 18:30:00.254005+00
3	319	23626	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-24 18:30:00.342335+00	2026-01-24 18:30:00.360167+00
2	316	23623	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-24 18:30:00.344738+00	2026-01-24 18:30:00.362432+00
4	317	23624	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-24 18:30:00.338487+00	2026-01-24 18:30:00.364585+00
1	318	23625	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-24 18:30:00.34669+00	2026-01-24 18:30:00.366156+00
1	351	373943	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-01 18:30:00.233608+00	2026-02-01 18:30:00.255525+00
1	356	417609	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-02 18:30:00.235689+00	2026-02-02 18:30:00.254203+00
2	354	417607	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-02 18:30:00.230077+00	2026-02-02 18:30:00.255803+00
4	359	462038	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-03 18:30:00.263909+00	2026-02-03 18:30:00.289054+00
5	353	382207	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-02-01 23:00:00.213197+00	2026-02-01 23:00:00.432045+00
2	329	152106	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-27 18:30:00.287142+00	2026-01-27 18:30:00.293059+00
4	355	417608	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-02 18:30:00.234983+00	2026-02-02 18:30:00.257376+00
3	348	330231	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-31 18:30:00.271594+00	2026-01-31 18:30:00.285118+00
2	345	330228	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-01-31 18:30:00.25893+00	2026-01-31 18:30:00.287972+00
1	331	152108	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-27 18:30:00.296633+00	2026-01-27 18:30:00.301041+00
4	346	330229	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-01-31 18:30:00.270384+00	2026-01-31 18:30:00.289595+00
1	347	330230	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-01-31 18:30:00.266489+00	2026-01-31 18:30:00.292751+00
3	357	417610	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-02 18:30:00.240804+00	2026-02-02 18:30:00.260137+00
3	352	373944	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-01 18:30:00.23481+00	2026-02-01 18:30:00.249263+00
2	349	373941	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-01 18:30:00.226196+00	2026-02-01 18:30:00.252488+00
2	358	462037	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-03 18:30:00.271171+00	2026-02-03 18:30:00.291299+00
1	360	462039	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-03 18:30:00.268849+00	2026-02-03 18:30:00.293507+00
3	361	462040	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-03 18:30:00.272341+00	2026-02-03 18:30:00.296414+00
2	362	505919	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-04 18:30:00.228314+00	2026-02-04 18:30:00.251544+00
3	365	505922	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-04 18:30:00.244818+00	2026-02-04 18:30:00.249326+00
1	364	505921	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-04 18:30:00.230341+00	2026-02-04 18:30:00.254267+00
4	363	505920	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-04 18:30:00.232323+00	2026-02-04 18:30:00.25293+00
4	396	856034	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-12 18:30:00.278076+00	2026-02-12 18:30:00.297078+00
5	382	689308	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-02-08 23:00:00.223779+00	2026-02-08 23:00:00.426923+00
1	397	856035	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-12 18:30:00.279133+00	2026-02-12 18:30:00.298398+00
2	399	899673	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-13 18:30:00.223099+00	2026-02-13 18:30:00.251291+00
3	377	637395	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-07 18:30:00.239666+00	2026-02-07 18:30:00.252324+00
2	374	637392	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-07 18:30:00.231267+00	2026-02-07 18:30:00.253334+00
4	375	637393	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-07 18:30:00.236141+00	2026-02-07 18:30:00.254028+00
3	369	549708	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-05 18:30:00.221482+00	2026-02-05 18:30:00.233862+00
2	366	549705	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-05 18:30:00.213864+00	2026-02-05 18:30:00.236998+00
4	367	549706	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-05 18:30:00.215032+00	2026-02-05 18:30:00.238402+00
1	368	549707	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-05 18:30:00.219729+00	2026-02-05 18:30:00.240775+00
1	376	637394	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-07 18:30:00.241446+00	2026-02-07 18:30:00.256795+00
4	400	899674	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-13 18:30:00.233909+00	2026-02-13 18:30:00.252628+00
3	394	812365	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-11 18:30:00.249+00	2026-02-11 18:30:00.262795+00
2	387	768650	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-10 18:30:00.232545+00	2026-02-10 18:30:00.255014+00
4	388	768651	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-10 18:30:00.238712+00	2026-02-10 18:30:00.256963+00
3	373	593435	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-06 18:30:00.257914+00	2026-02-06 18:30:00.27878+00
2	370	593432	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-06 18:30:00.254813+00	2026-02-06 18:30:00.280781+00
4	371	593433	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-06 18:30:00.260227+00	2026-02-06 18:30:00.28225+00
1	372	593434	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-06 18:30:00.261352+00	2026-02-06 18:30:00.283554+00
1	389	768652	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-10 18:30:00.241031+00	2026-02-10 18:30:00.259444+00
3	390	768653	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-10 18:30:00.23649+00	2026-02-10 18:30:00.260651+00
1	385	724843	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-09 18:30:00.266943+00	2026-02-09 18:30:00.287571+00
2	383	724841	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-09 18:30:00.269316+00	2026-02-09 18:30:00.289777+00
4	384	724842	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-09 18:30:00.265841+00	2026-02-09 18:30:00.291041+00
3	386	724844	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-09 18:30:00.262484+00	2026-02-09 18:30:00.292389+00
3	381	681138	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-08 18:30:00.234667+00	2026-02-08 18:30:00.244968+00
2	378	681135	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-08 18:30:00.2307+00	2026-02-08 18:30:00.246979+00
4	379	681136	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-08 18:30:00.233524+00	2026-02-08 18:30:00.250055+00
1	380	681137	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-08 18:30:00.225989+00	2026-02-08 18:30:00.25147+00
1	401	899675	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-13 18:30:00.236138+00	2026-02-13 18:30:00.255458+00
2	391	812362	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-11 18:30:00.244711+00	2026-02-11 18:30:00.26572+00
4	392	812363	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-11 18:30:00.242323+00	2026-02-11 18:30:00.268323+00
1	393	812364	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-11 18:30:00.247894+00	2026-02-11 18:30:00.270291+00
1	405	943382	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-14 18:30:00.258286+00	2026-02-14 18:30:00.274962+00
3	398	856036	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-12 18:30:00.281353+00	2026-02-12 18:30:00.292853+00
2	395	856033	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-12 18:30:00.269878+00	2026-02-12 18:30:00.295811+00
2	403	943380	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-14 18:30:00.256079+00	2026-02-14 18:30:00.277982+00
4	404	943381	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-14 18:30:00.252675+00	2026-02-14 18:30:00.280558+00
4	408	987099	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-15 18:30:00.272049+00	2026-02-15 18:30:00.289904+00
3	402	899676	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-13 18:30:00.231455+00	2026-02-13 18:30:00.247686+00
3	406	943383	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-14 18:30:00.254931+00	2026-02-14 18:30:00.281863+00
2	407	987098	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-15 18:30:00.270951+00	2026-02-15 18:30:00.292984+00
1	409	987100	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-15 18:30:00.273184+00	2026-02-15 18:30:00.294359+00
1	426	1164864	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-19 18:30:00.249039+00	2026-02-19 18:30:00.27032+00
3	410	987101	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-15 18:30:00.280773+00	2026-02-15 18:30:00.29739+00
3	427	1164865	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-19 18:30:00.250169+00	2026-02-19 18:30:00.272928+00
5	411	995357	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-02-15 23:00:00.224509+00	2026-02-15 23:00:00.429159+00
5	440	1304252	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-02-22 23:00:00.204696+00	2026-02-22 23:00:00.400332+00
3	423	1118476	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-18 18:30:00.266639+00	2026-02-18 18:30:00.278374+00
4	413	1030832	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-16 18:30:00.242487+00	2026-02-16 18:30:00.26479+00
2	412	1030831	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-16 18:30:00.24591+00	2026-02-16 18:30:00.266899+00
1	414	1030833	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-16 18:30:00.247102+00	2026-02-16 18:30:00.27004+00
3	415	1030834	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-16 18:30:00.251979+00	2026-02-16 18:30:00.27137+00
2	420	1118473	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-18 18:30:00.263292+00	2026-02-18 18:30:00.281138+00
4	421	1118474	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-18 18:30:00.265575+00	2026-02-18 18:30:00.283741+00
1	422	1118475	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-18 18:30:00.259914+00	2026-02-18 18:30:00.287553+00
3	439	1295918	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-22 18:30:00.293357+00	2026-02-22 18:30:00.307+00
3	435	1252275	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-21 18:30:00.243969+00	2026-02-21 18:30:00.262434+00
2	432	1252272	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-21 18:30:00.246313+00	2026-02-21 18:30:00.26455+00
1	418	1074694	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-17 18:30:00.260339+00	2026-02-17 18:30:00.274496+00
2	416	1074692	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-17 18:30:00.252606+00	2026-02-17 18:30:00.27652+00
4	417	1074693	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-17 18:30:00.259207+00	2026-02-17 18:30:00.277906+00
3	419	1074695	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-17 18:30:00.256986+00	2026-02-17 18:30:00.279382+00
4	433	1252273	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-21 18:30:00.247433+00	2026-02-21 18:30:00.266465+00
3	431	1208592	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-20 18:30:00.230083+00	2026-02-20 18:30:00.245153+00
2	428	1208589	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-20 18:30:00.231161+00	2026-02-20 18:30:00.247358+00
4	429	1208590	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-20 18:30:00.22319+00	2026-02-20 18:30:00.248677+00
1	430	1208591	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-20 18:30:00.229011+00	2026-02-20 18:30:00.251305+00
1	434	1252274	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-21 18:30:00.242831+00	2026-02-21 18:30:00.267742+00
2	424	1164862	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-19 18:30:00.244471+00	2026-02-19 18:30:00.26611+00
4	425	1164863	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-19 18:30:00.241394+00	2026-02-19 18:30:00.268292+00
4	437	1295916	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-22 18:30:00.292235+00	2026-02-22 18:30:00.309093+00
1	438	1295917	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-22 18:30:00.286675+00	2026-02-22 18:30:00.312291+00
2	436	1295915	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-22 18:30:00.29004+00	2026-02-22 18:30:00.31363+00
3	448	1383311	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-24 18:30:00.265774+00	2026-02-24 18:30:00.273029+00
4	450	1427148	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-25 18:30:00.285009+00	2026-02-25 18:30:00.302226+00
2	445	1383308	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-24 18:30:00.252879+00	2026-02-24 18:30:00.274866+00
1	443	1339688	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-23 18:30:00.241079+00	2026-02-23 18:30:00.256282+00
4	446	1383309	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-24 18:30:00.263446+00	2026-02-24 18:30:00.27699+00
2	441	1339686	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-23 18:30:00.232949+00	2026-02-23 18:30:00.258365+00
4	442	1339687	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-23 18:30:00.23535+00	2026-02-23 18:30:00.259672+00
3	444	1339689	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-23 18:30:00.242314+00	2026-02-23 18:30:00.262127+00
1	447	1383310	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-24 18:30:00.259336+00	2026-02-24 18:30:00.278224+00
2	449	1427147	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-25 18:30:00.280494+00	2026-02-25 18:30:00.305359+00
1	451	1427149	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-25 18:30:00.286153+00	2026-02-25 18:30:00.306706+00
3	452	1427150	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-25 18:30:00.287233+00	2026-02-25 18:30:00.309933+00
4	483	1777531	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-05 18:30:00.248171+00	2026-03-05 18:30:00.267946+00
5	469	1610783	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-03-01 23:00:00.17052+00	2026-03-01 23:00:00.357143+00
1	484	1777532	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-05 18:30:00.249274+00	2026-03-05 18:30:00.271273+00
3	493	1865065	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-07 18:30:00.249547+00	2026-03-07 18:30:00.270118+00
3	464	1558683	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-28 18:30:00.268877+00	2026-02-28 18:30:00.289934+00
4	462	1558681	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-28 18:30:00.272833+00	2026-02-28 18:30:00.291912+00
1	463	1558682	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-28 18:30:00.273978+00	2026-02-28 18:30:00.294578+00
3	456	1471004	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-26 18:30:00.264596+00	2026-02-26 18:30:00.282597+00
4	454	1471002	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-26 18:30:00.265722+00	2026-02-26 18:30:00.28493+00
1	455	1471003	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-26 18:30:00.267925+00	2026-02-26 18:30:00.286981+00
2	453	1471001	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-26 18:30:00.260021+00	2026-02-26 18:30:00.288192+00
2	461	1558680	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-28 18:30:00.270587+00	2026-02-28 18:30:00.296527+00
3	481	1733718	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-04 18:30:00.271376+00	2026-03-04 18:30:00.293522+00
3	477	1689983	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-03 18:30:00.280457+00	2026-03-03 18:30:00.294551+00
2	474	1689980	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-03 18:30:00.270894+00	2026-03-03 18:30:00.297112+00
3	460	1514837	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-27 18:30:00.261943+00	2026-02-27 18:30:00.278739+00
2	457	1514834	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-02-27 18:30:00.258315+00	2026-02-27 18:30:00.281882+00
4	458	1514835	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-02-27 18:30:00.259497+00	2026-02-27 18:30:00.283891+00
1	459	1514836	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-02-27 18:30:00.252637+00	2026-02-27 18:30:00.286496+00
4	475	1689981	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-03 18:30:00.276544+00	2026-03-03 18:30:00.299607+00
1	476	1689982	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-03 18:30:00.277602+00	2026-03-03 18:30:00.30342+00
3	473	1646241	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-02 18:30:00.242559+00	2026-03-02 18:30:00.255969+00
2	470	1646238	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-02 18:30:00.23572+00	2026-03-02 18:30:00.258079+00
4	471	1646239	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-02 18:30:00.23809+00	2026-03-02 18:30:00.259408+00
1	472	1646240	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-02 18:30:00.241494+00	2026-03-02 18:30:00.26182+00
3	468	1602499	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-01 18:30:00.259631+00	2026-03-01 18:30:00.272376+00
2	465	1602496	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-01 18:30:00.248575+00	2026-03-01 18:30:00.274522+00
4	466	1602497	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-01 18:30:00.258538+00	2026-03-01 18:30:00.275862+00
1	467	1602498	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-01 18:30:00.255152+00	2026-03-01 18:30:00.277149+00
2	486	1821272	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-06 18:30:00.238966+00	2026-03-06 18:30:00.26413+00
2	478	1733715	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-04 18:30:00.273764+00	2026-03-04 18:30:00.295648+00
4	479	1733716	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-04 18:30:00.275946+00	2026-03-04 18:30:00.296909+00
1	480	1733717	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-04 18:30:00.270258+00	2026-03-04 18:30:00.298203+00
4	487	1821273	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-06 18:30:00.240689+00	2026-03-06 18:30:00.265536+00
3	489	1821275	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-06 18:30:00.246282+00	2026-03-06 18:30:00.266874+00
3	485	1777533	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-05 18:30:00.250365+00	2026-03-05 18:30:00.263719+00
2	482	1777530	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-05 18:30:00.240264+00	2026-03-05 18:30:00.266576+00
4	491	1865063	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-07 18:30:00.251709+00	2026-03-07 18:30:00.273482+00
1	492	1865064	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-07 18:30:00.247204+00	2026-03-07 18:30:00.274762+00
1	488	1821274	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-06 18:30:00.244466+00	2026-03-06 18:30:00.262059+00
2	490	1865062	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-07 18:30:00.250596+00	2026-03-07 18:30:00.272076+00
1	496	1908809	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-08 18:30:00.271021+00	2026-03-08 18:30:00.287862+00
2	494	1908807	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-08 18:30:00.267475+00	2026-03-08 18:30:00.28994+00
4	495	1908808	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-08 18:30:00.282895+00	2026-03-08 18:30:00.292568+00
3	497	1908810	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-08 18:30:00.272119+00	2026-03-08 18:30:00.28554+00
1	513	2086895	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-12 18:30:00.259358+00	2026-03-12 18:30:00.283168+00
5	498	1917005	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-03-08 23:00:00.202254+00	2026-03-08 23:00:00.385875+00
2	536	2361974	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-18 18:30:00.266474+00	2026-03-18 18:30:00.287105+00
4	529	2270632	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-16 18:30:00.253055+00	2026-03-16 18:30:00.269179+00
2	528	2270631	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-16 18:30:00.250776+00	2026-03-16 18:30:00.272195+00
1	509	2041844	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-11 18:30:00.245609+00	2026-03-11 18:30:00.258731+00
2	507	2041842	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-11 18:30:00.244436+00	2026-03-11 18:30:00.261192+00
3	502	1952593	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-09 18:30:00.20355+00	2026-03-09 18:30:00.227344+00
2	499	1952590	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-09 18:30:00.2083+00	2026-03-09 18:30:00.229355+00
4	500	1952591	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-09 18:30:00.213867+00	2026-03-09 18:30:00.230626+00
1	501	1952592	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-09 18:30:00.21494+00	2026-03-09 18:30:00.231839+00
4	508	2041843	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-11 18:30:00.234133+00	2026-03-11 18:30:00.263838+00
3	510	2041845	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-11 18:30:00.246715+00	2026-03-11 18:30:00.265137+00
3	526	2225543	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-15 18:30:00.265092+00	2026-03-15 18:30:00.288947+00
2	519	2177744	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-14 18:30:00.241688+00	2026-03-14 18:30:00.264916+00
4	520	2177745	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-14 18:30:00.242947+00	2026-03-14 18:30:00.266876+00
1	521	2177746	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-14 18:30:00.247288+00	2026-03-14 18:30:00.268234+00
3	522	2177747	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-14 18:30:00.250713+00	2026-03-14 18:30:00.269505+00
3	506	1996771	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-10 18:30:00.265264+00	2026-03-10 18:30:00.277062+00
2	503	1996768	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-10 18:30:00.260062+00	2026-03-10 18:30:00.279105+00
4	504	1996769	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-10 18:30:00.262313+00	2026-03-10 18:30:00.282313+00
1	505	1996770	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-10 18:30:00.257841+00	2026-03-10 18:30:00.284845+00
1	517	2132035	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-13 18:30:00.242139+00	2026-03-13 18:30:00.258051+00
2	515	2132033	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-13 18:30:00.236108+00	2026-03-13 18:30:00.260254+00
4	516	2132034	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-13 18:30:00.240002+00	2026-03-13 18:30:00.261542+00
3	518	2132036	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-13 18:30:00.244265+00	2026-03-13 18:30:00.263525+00
2	523	2225540	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-15 18:30:00.266898+00	2026-03-15 18:30:00.290894+00
3	514	2086896	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-12 18:30:00.264404+00	2026-03-12 18:30:00.277291+00
2	511	2086893	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-12 18:30:00.253565+00	2026-03-12 18:30:00.279373+00
4	512	2086894	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-12 18:30:00.258239+00	2026-03-12 18:30:00.280641+00
4	524	2225541	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-15 18:30:00.269318+00	2026-03-15 18:30:00.293466+00
1	525	2225542	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-15 18:30:00.27053+00	2026-03-15 18:30:00.294747+00
3	535	2315609	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-17 18:30:00.267541+00	2026-03-17 18:30:00.284892+00
2	532	2315606	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-17 18:30:00.259816+00	2026-03-17 18:30:00.286871+00
4	533	2315607	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-17 18:30:00.260913+00	2026-03-17 18:30:00.288286+00
1	534	2315608	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-17 18:30:00.26532+00	2026-03-17 18:30:00.291464+00
5	527	2233938	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-03-15 23:00:00.228684+00	2026-03-15 23:00:00.43572+00
1	530	2270633	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-16 18:30:00.247388+00	2026-03-16 18:30:00.274938+00
3	531	2270634	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-16 18:30:00.255281+00	2026-03-16 18:30:00.276331+00
3	539	2361977	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-18 18:30:00.271607+00	2026-03-18 18:30:00.292548+00
4	537	2361975	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-18 18:30:00.272755+00	2026-03-18 18:30:00.293888+00
1	538	2361976	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-18 18:30:00.275073+00	2026-03-18 18:30:00.290588+00
1	571	2759760	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-26 18:30:00.257635+00	2026-03-26 18:30:00.286783+00
5	556	2568151	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-03-22 23:00:00.245312+00	2026-03-22 23:00:00.4568+00
4	570	2759759	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-26 18:30:00.263376+00	2026-03-26 18:30:00.288952+00
2	573	2808774	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-27 18:30:00.259717+00	2026-03-27 18:30:00.283748+00
3	551	2509975	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-21 18:30:00.250056+00	2026-03-21 18:30:00.268677+00
2	548	2509972	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-21 18:30:00.245603+00	2026-03-21 18:30:00.270346+00
4	549	2509973	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-21 18:30:00.24756+00	2026-03-21 18:30:00.273464+00
2	540	2411481	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-19 18:30:00.230296+00	2026-03-19 18:30:00.25513+00
4	541	2411482	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-19 18:30:00.231411+00	2026-03-19 18:30:00.257193+00
1	542	2411483	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-19 18:30:00.237114+00	2026-03-19 18:30:00.260414+00
3	543	2411484	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-19 18:30:00.238257+00	2026-03-19 18:30:00.262882+00
1	550	2509974	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-21 18:30:00.24843+00	2026-03-21 18:30:00.274678+00
4	574	2808775	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-27 18:30:00.265133+00	2026-03-27 18:30:00.285806+00
3	580	2859491	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-28 18:30:00.308953+00	2026-03-28 18:30:00.314357+00
1	567	2710733	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-25 18:30:00.260021+00	2026-03-25 18:30:00.272154+00
1	563	2658979	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-24 18:30:00.268163+00	2026-03-24 18:30:00.284798+00
2	561	2658977	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-24 18:30:00.26293+00	2026-03-24 18:30:00.28783+00
2	544	2460983	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-20 18:30:00.241237+00	2026-03-20 18:30:00.259407+00
4	545	2460984	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-20 18:30:00.238999+00	2026-03-20 18:30:00.261455+00
1	546	2460985	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-20 18:30:00.245886+00	2026-03-20 18:30:00.26419+00
3	547	2460986	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-20 18:30:00.244794+00	2026-03-20 18:30:00.265623+00
4	562	2658978	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-24 18:30:00.265877+00	2026-03-24 18:30:00.289151+00
3	564	2658980	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-24 18:30:00.261261+00	2026-03-24 18:30:00.291313+00
4	558	2607991	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-23 18:30:00.262091+00	2026-03-23 18:30:00.284978+00
1	559	2607992	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-23 18:30:00.268071+00	2026-03-23 18:30:00.287232+00
3	560	2607993	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-23 18:30:00.264289+00	2026-03-23 18:30:00.291139+00
2	557	2607990	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-23 18:30:00.2654+00	2026-03-23 18:30:00.295003+00
3	555	2558959	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-22 18:30:00.261637+00	2026-03-22 18:30:00.281526+00
2	552	2558956	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-22 18:30:00.262721+00	2026-03-22 18:30:00.283753+00
1	554	2558958	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-22 18:30:00.264383+00	2026-03-22 18:30:00.286499+00
4	553	2558957	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-22 18:30:00.259469+00	2026-03-22 18:30:00.289283+00
2	565	2710731	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-25 18:30:00.253748+00	2026-03-25 18:30:00.275067+00
4	566	2710732	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-25 18:30:00.254565+00	2026-03-25 18:30:00.27693+00
3	568	2710734	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-25 18:30:00.258029+00	2026-03-25 18:30:00.279372+00
1	575	2808776	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-27 18:30:00.268623+00	2026-03-27 18:30:00.288937+00
3	576	2808777	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-27 18:30:00.270083+00	2026-03-27 18:30:00.291471+00
3	572	2759761	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-26 18:30:00.25996+00	2026-03-26 18:30:00.281131+00
2	569	2759758	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-26 18:30:00.262318+00	2026-03-26 18:30:00.283925+00
4	578	2859489	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-28 18:30:00.300241+00	2026-03-28 18:30:00.310153+00
2	577	2859488	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-28 18:30:00.29883+00	2026-03-28 18:30:00.305144+00
1	583	2915213	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-29 18:30:00.26461+00	2026-03-29 18:30:00.277527+00
1	579	2859490	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-28 18:30:00.306591+00	2026-03-28 18:30:00.311572+00
3	584	2915214	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-29 18:30:00.268563+00	2026-03-29 18:30:00.278973+00
4	582	2915212	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-29 18:30:00.2524+00	2026-03-29 18:30:00.273638+00
2	581	2915211	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-29 18:30:00.255992+00	2026-03-29 18:30:00.271314+00
3	601	3138845	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-02 18:30:00.267335+00	2026-04-02 18:30:00.282158+00
5	585	2925615	postgres	postgres	\n  SELECT public.cleanup_pending_registrations();\n  	succeeded	1 row	2026-03-29 23:00:00.227553+00	2026-03-29 23:00:00.381359+00
2	594	3082607	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-04-01 18:30:00.268126+00	2026-04-01 18:30:00.27588+00
4	595	3082608	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-01 18:30:00.265303+00	2026-04-01 18:30:00.277375+00
1	588	2970785	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-30 18:30:00.271439+00	2026-03-30 18:30:00.278036+00
2	586	2970783	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-30 18:30:00.264452+00	2026-03-30 18:30:00.279989+00
4	587	2970784	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-30 18:30:00.26529+00	2026-03-30 18:30:00.281491+00
3	589	2970786	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-30 18:30:00.276102+00	2026-03-30 18:30:00.283595+00
1	596	3082609	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-04-01 18:30:00.268674+00	2026-04-01 18:30:00.280641+00
3	597	3082610	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-01 18:30:00.270467+00	2026-04-01 18:30:00.281348+00
1	608	3253012	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-04-04 18:30:00.294828+00	2026-04-04 18:30:00.297653+00
2	606	3253010	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-04-04 18:30:00.282762+00	2026-04-04 18:30:00.299819+00
4	607	3253011	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-04 18:30:00.290078+00	2026-04-04 18:30:00.30233+00
3	609	3253013	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-04 18:30:00.293601+00	2026-04-04 18:30:00.303998+00
3	593	3026602	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-31 18:30:00.216562+00	2026-03-31 18:30:00.219336+00
2	590	3026599	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-03-31 18:30:00.215458+00	2026-03-31 18:30:00.220504+00
1	592	3026601	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-03-31 18:30:00.216032+00	2026-03-31 18:30:00.222137+00
4	591	3026600	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-03-31 18:30:00.213294+00	2026-03-31 18:30:00.223621+00
1	604	3194818	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-04-03 18:30:00.275366+00	2026-04-03 18:30:00.284342+00
2	602	3194816	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-04-03 18:30:00.271728+00	2026-04-03 18:30:00.287872+00
3	605	3194819	postgres	postgres	\n  SELECT setval('public.mfc_single_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-03 18:30:00.277669+00	2026-04-03 18:30:00.289307+00
4	603	3194817	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-03 18:30:00.270451+00	2026-04-03 18:30:00.291983+00
4	599	3138843	postgres	postgres	\n  SELECT setval('public.mfc_batch_bill_seq', 1001, false);\n  	succeeded	1 row	2026-04-02 18:30:00.264575+00	2026-04-02 18:30:00.276182+00
2	598	3138842	postgres	postgres	\n  SELECT setval('public.chalan_number_seq', 1, false);\n  	succeeded	1 row	2026-04-02 18:30:00.263425+00	2026-04-02 18:30:00.278836+00
1	600	3138844	postgres	postgres	\n  SELECT setval('public.daily_batch_sequence', 1, false);\n  	succeeded	1 row	2026-04-02 18:30:00.268684+00	2026-04-02 18:30:00.280826+00
\.


--
-- Data for Name: chalans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.chalans (id, chalan_number, seller_id, mfc_seller_id, chalan_date, total_sale_value, commission_rate_percent, commission_amount, net_payable, amount_paid, status, created_at, updated_at, created_by, updated_by) FROM stdin;
ca63f948-2b22-4ff5-9b0a-6b79e8eedc8d	MFC-CH-5	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-01-28	3465	6	210	3255	3255	paid	2026-01-28 18:47:16.606421+00	2026-04-05 09:23:33.547607+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	6308420e-5192-4590-967d-d69c8e93aa75
01eaea0f-7761-4968-b4ea-394c3e21b1cb	MFC-CH-8	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-03-28	3192	5	162	3030	3030	paid	2026-03-28 15:14:49.470617+00	2026-04-05 09:23:45.568056+00	d442332e-65d2-43b9-be79-f214a3d53bd3	6308420e-5192-4590-967d-d69c8e93aa75
8314959b-e6ba-4afd-a54b-0bfa667031a9	MFC-CH-1	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2025-11-18	144	6	9	135	135	paid	2025-11-18 08:53:14.35388+00	2025-11-18 08:53:14.35388+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
bb89bff2-4bf7-4fda-88bc-98d9d0df7543	MFC-CH-7	09801f00-c4ba-410b-abcb-2072ea6e8c32	\N	2026-03-28	625	5	35	590	590	paid	2026-03-28 02:04:36.612034+00	2026-03-28 02:04:36.612034+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
830a0183-95fd-4050-90a4-8940957fdfcb	MFC-CH-6	09801f00-c4ba-410b-abcb-2072ea6e8c32	\N	2026-03-25	144	5	9	135	320	paid	2026-03-25 11:55:17.665164+00	2026-03-28 02:12:55.977949+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
dfd0850e-3410-453a-8bef-af29c710bbfe	MFC-CH-2	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2025-11-21	16830	6	1010	15820	15820	paid	2025-11-22 00:58:35.406965+00	2025-11-22 00:58:35.406965+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
4c2e107e-3527-4465-9da8-e730371900b3	MFC-CH-3	00000000-0000-0000-0000-000000000001	\N	2025-12-03	1476	6	91	1385	1385	paid	2025-12-04 02:48:27.140248+00	2025-12-04 02:48:27.140248+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
b077a142-43da-49de-8943-5dfdd99adbf0	MFC-CH-4	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-01-27	680	6	40	640	640	paid	2026-01-27 21:31:38.398191+00	2026-01-27 21:31:38.398191+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
e778b6fd-7252-467b-8da5-143d82329e9a	MFC-FL-1001	\N	38322fdd-1346-4f01-9325-955d246a89af	2026-01-28	144	0	4	140	0	due	2026-01-28 18:54:07.589546+00	2026-01-28 18:54:07.589546+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
a84e3448-fc65-42ad-ac7a-dae5da50fb9c	MFC-S-1001	\N	38322fdd-1346-4f01-9325-955d246a89af	2026-01-28	144	0	4	140	0	due	2026-01-28 18:54:58.49797+00	2026-01-28 18:54:58.49797+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
9701f2ff-6b64-4598-aa9c-1625b2345b30	MFC-CH-9	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-03-28	1728	5	88	1640	1640	paid	2026-03-28 16:09:15.621909+00	2026-03-28 16:09:15.621909+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
fd2483db-65a8-4cec-8c84-843cdacd4945	MFC-CH-14	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-04-01	5262	5	267	4995	4995	paid	2026-04-01 12:59:41.373448+00	2026-04-01 12:59:41.373448+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
83b7b706-ecf7-4f62-934b-915673a7db7a	MFC-CH-10	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-03-28	1824	5	94	1730	1730	paid	2026-03-28 17:05:34.647064+00	2026-03-28 17:05:34.647064+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
65e5472a-b34b-440e-91f2-2f40a304917e	MFC-CH-11	dc7e8f3c-591d-490d-8136-f6190701d55f	\N	2026-03-28	10318	6	623	9695	9695	paid	2026-03-28 20:42:47.75527+00	2026-03-28 20:42:47.75527+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
f1525d49-9a46-4f92-b7d9-d88e0066368e	MFC-CH-12	51c05237-a5d6-4d46-b70a-1515b0a0e2fd	\N	2026-03-28	16200	5	810	15390	15390	paid	2026-03-28 20:45:05.747879+00	2026-03-28 20:45:05.747879+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
5b3ef155-8261-4d8a-9bef-845c9ca36ed5	MFC-CH-13	dc7e8f3c-591d-490d-8136-f6190701d55f	\N	2026-03-28	7512	6	452	7060	7060	paid	2026-03-28 23:53:18.457919+00	2026-03-28 23:53:18.457919+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
0068c7ab-401e-41d8-bd85-951d5ffcddaa	MFC-CH-15	2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	2026-04-03	5940	6	360	5580	5580	paid	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
\.


--
-- Data for Name: customer_balance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_balance (user_id, total_billed, total_paid, current_due, updated_at) FROM stdin;
00000000-0000-0000-0000-000000000001	0	0	0	2025-11-18 08:34:02.061577+00
09801f00-c4ba-410b-abcb-2072ea6e8c32	0	0	0	2025-11-18 08:34:02.061577+00
2e1fb8a9-8539-4eff-8084-59ec5f2defcb	0	0	0	2025-11-18 08:34:02.061577+00
40254037-4a0d-4e74-9d7e-6ce583e98b22	0	0	0	2025-11-18 08:34:02.061577+00
46d6750d-2fd4-46b2-8b12-3adb7e317222	0	0	0	2025-11-18 08:34:02.061577+00
51c05237-a5d6-4d46-b70a-1515b0a0e2fd	0	0	0	2025-11-18 08:34:02.061577+00
6b707ec2-e6e5-45d3-80e0-f9d953182ad0	0	0	0	2025-11-18 08:34:02.061577+00
a94280dd-24fe-491a-a19d-5cd2aeff909d	0	0	0	2025-11-18 08:34:02.061577+00
ce31886a-3a1c-4629-a323-9e4d35efdaed	0	0	0	2025-11-18 08:34:02.061577+00
dc7e8f3c-591d-490d-8136-f6190701d55f	9084	4136	4948	2026-03-28 17:12:24.670835+00
f52920a0-1da9-4a6b-b294-e6cbaf1b6efa	16200	0	16200	2026-03-28 20:45:05.747879+00
f93a9d88-ee9b-4a47-85c2-8ddad14f5994	1440	1440	0	2026-03-31 18:47:00.178602+00
70010fcf-e689-4206-a1e3-3ebb1b16b7d0	0	0	0	2026-04-03 12:14:00.054836+00
bd0bed6f-a925-404f-9d83-4bbd32525d9e	0	0	0	2026-04-03 12:23:12.611357+00
3f8ef0db-1a43-45a0-a480-57665499ee2b	23664	20644	3020	2026-04-03 16:24:40.712394+00
befa9b73-bbd3-4f36-b56f-4e50a39e05f9	23415	10000	13415	2026-04-03 16:24:40.712394+00
821821c3-f248-4ca9-a358-acf67a10bebd	625	0	625	2026-03-28 02:04:36.612034+00
9364cbf1-5240-4f79-8f0f-aaaf570e3139	1200	0	1200	2026-03-28 15:14:49.470617+00
\.


--
-- Data for Name: customer_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.customer_payments (id, daily_bill_id, payment_date, amount, payment_method, created_at, updated_at, created_by, updated_by) FROM stdin;
b03cc65e-d2b8-419b-8e86-e3e596193463	197ad01c-3b42-4d95-ad39-ce7240ab4c15	2026-03-25	1476	cash	2026-03-25 19:10:37.336305+00	2026-03-25 19:10:37.336305+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
5708a2b4-ba3d-4d53-ac6c-381f92a16319	b3859cad-9783-419d-a28e-6dd9e3c3d1cd	2026-03-25	480	cash	2026-03-25 19:10:37.336305+00	2026-03-25 19:10:37.336305+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
5dc2bc48-2335-4187-9c9a-2eab4d079767	2f3e1ef8-13f8-4535-99b3-f6a6b90da890	2026-03-25	1044	cash	2026-03-25 19:10:37.336305+00	2026-03-25 19:10:37.336305+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
5c82ec11-2457-44c6-8427-8cf16cfb488a	5dd09457-4f9a-4624-b758-ec56c51a6b51	2026-03-25	8820	cash	2026-03-25 21:43:19.967948+00	2026-03-25 21:43:19.967948+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
2707eca3-9b02-415a-a098-4a4736118589	5ca38088-9d69-43a8-955f-4e08350531dd	2026-03-25	200	cash	2026-03-25 21:43:19.967948+00	2026-03-25 21:43:19.967948+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
ed4cddef-fc59-4c07-9f91-122c46e1b0e3	4529fccf-dfbd-427b-baa8-a547903c5ab8	2026-03-25	980	cash	2026-03-25 21:43:19.967948+00	2026-03-25 21:43:19.967948+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
a83bf217-a135-496a-800f-83b02bca93e6	2f3e1ef8-13f8-4535-99b3-f6a6b90da890	2026-03-28	680	cash	2026-03-28 02:08:15.959207+00	2026-03-28 02:08:15.959207+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
3be3e72f-5383-43b0-9cf6-525059f0a4b2	44869efb-8fe9-428c-b041-d077a64b2171	2026-03-28	56	cash	2026-03-28 17:11:12.641903+00	2026-03-28 17:11:12.641903+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
2d45cf51-0640-4a0b-90a0-fdf9b3cb0787	44869efb-8fe9-428c-b041-d077a64b2171	2026-03-28	400	cash	2026-03-28 17:12:24.670835+00	2026-03-28 17:12:24.670835+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
9d0d086c-38e6-4265-acd0-a6f254780497	3217f127-d0f2-4c55-a431-335db3a38ef8	2026-03-28	2500	cash	2026-03-28 20:44:18.159291+00	2026-03-28 20:44:18.159291+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
71f9bd44-6025-4212-8e00-24fd6a2f0cfc	9f167315-8ebf-473b-9229-bea430769b2d	2026-03-25	144	cash	2026-03-29 16:47:33.149344+00	2026-03-29 16:47:33.149344+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
11aec8d7-729e-4314-a1d9-6eb0ca2e1915	6e5c2158-ad98-4778-a840-9f35ea46f6c3	2026-03-28	144	cash	2026-03-29 16:49:20.410231+00	2026-03-29 16:49:20.410231+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
3cbc3698-df8d-45ed-8f70-396c26a4031c	e968685b-db99-43f7-a2ef-3fbb2b7cf9e5	2026-03-28	8010	cash	2026-03-29 16:49:20.410231+00	2026-03-29 16:49:20.410231+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
26bea0b4-739d-49e5-982f-583136577506	3217f127-d0f2-4c55-a431-335db3a38ef8	2026-03-28	4846	cash	2026-03-29 16:49:20.410231+00	2026-03-29 16:49:20.410231+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
407fcb54-e490-464e-966f-e06d77451c8d	1aa69f20-80e8-4599-aa31-9f33fce84a4f	2026-03-28	1440	cash	2026-03-31 18:47:00.178602+00	2026-03-31 18:47:00.178602+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
fa02b983-f081-4391-b93d-bc6beafd11c7	3217f127-d0f2-4c55-a431-335db3a38ef8	2026-04-01	838	cash	2026-04-01 13:00:39.06955+00	2026-04-01 13:00:39.06955+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
e5d92e37-c4c9-4216-96a8-1c308189d1be	1ddb5137-a193-413f-9615-9ae1f27ef2cb	2026-04-01	4162	cash	2026-04-01 13:00:39.06955+00	2026-04-01 13:00:39.06955+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
\.


--
-- Data for Name: daily_bills; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.daily_bills (id, bill_number, customer_id, bill_date, total_amount, amount_paid, status, created_at, updated_at, created_by, updated_by, is_migration_bill) FROM stdin;
c1ba4aa3-7b25-4dfb-b7d7-6515122468dc	BILL-280326-5	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	2026-03-28	8350	0	due	2026-03-28 20:42:47.75527+00	2026-03-28 23:53:18.457919+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	6308420e-5192-4590-967d-d69c8e93aa75	f
9f167315-8ebf-473b-9229-bea430769b2d	BILL-250326-1	3f8ef0db-1a43-45a0-a480-57665499ee2b	2026-03-25	144	144	paid	2026-03-25 11:55:17.665164+00	2026-03-29 16:47:33.149344+00	d442332e-65d2-43b9-be79-f214a3d53bd3	6308420e-5192-4590-967d-d69c8e93aa75	f
6e5c2158-ad98-4778-a840-9f35ea46f6c3	BILL-181125-1	3f8ef0db-1a43-45a0-a480-57665499ee2b	2025-11-18	144	144	paid	2025-11-18 08:53:14.35388+00	2026-03-29 16:49:20.410231+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	f
e968685b-db99-43f7-a2ef-3fbb2b7cf9e5	BILL-211125-1	3f8ef0db-1a43-45a0-a480-57665499ee2b	2025-11-21	8010	8010	paid	2025-11-22 00:58:35.406965+00	2026-03-29 16:49:20.410231+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	f
1aa69f20-80e8-4599-aa31-9f33fce84a4f	BILL-280326-7	f93a9d88-ee9b-4a47-85c2-8ddad14f5994	2026-03-28	1440	1440	paid	2026-03-28 23:53:18.457919+00	2026-03-31 18:47:00.178602+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	f
197ad01c-3b42-4d95-ad39-ce7240ab4c15	BILL-031225-1	dc7e8f3c-591d-490d-8136-f6190701d55f	2025-12-03	1476	1476	paid	2025-12-04 02:48:27.140248+00	2026-03-25 19:10:37.336305+00	6308420e-5192-4590-967d-d69c8e93aa75	d442332e-65d2-43b9-be79-f214a3d53bd3	f
b3859cad-9783-419d-a28e-6dd9e3c3d1cd	BILL-270126-2	dc7e8f3c-591d-490d-8136-f6190701d55f	2026-01-27	480	480	paid	2026-01-27 21:31:38.398191+00	2026-03-25 19:10:37.336305+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	d442332e-65d2-43b9-be79-f214a3d53bd3	f
5dd09457-4f9a-4624-b758-ec56c51a6b51	BILL-211125-2	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	2025-11-21	8820	8820	paid	2025-11-22 00:58:35.406965+00	2026-03-25 21:43:19.967948+00	6308420e-5192-4590-967d-d69c8e93aa75	d442332e-65d2-43b9-be79-f214a3d53bd3	f
5ca38088-9d69-43a8-955f-4e08350531dd	BILL-270126-1	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	2026-01-27	200	200	paid	2026-01-27 21:31:38.398191+00	2026-03-25 21:43:19.967948+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	d442332e-65d2-43b9-be79-f214a3d53bd3	f
4529fccf-dfbd-427b-baa8-a547903c5ab8	BILL-280126-1	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	2026-01-28	2025	980	partially_paid	2026-01-28 18:47:16.606421+00	2026-03-25 21:43:19.967948+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	d442332e-65d2-43b9-be79-f214a3d53bd3	f
64a14ad2-5175-42e8-849a-14d279296b4b	BILL-280326-1	821821c3-f248-4ca9-a358-acf67a10bebd	2026-03-28	625	0	due	2026-03-28 02:04:36.612034+00	2026-03-28 02:04:36.612034+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
2f3e1ef8-13f8-4535-99b3-f6a6b90da890	BILL-280126-2	dc7e8f3c-591d-490d-8136-f6190701d55f	2026-01-28	1728	1724	partially_paid	2026-01-28 18:47:16.606421+00	2026-03-28 02:08:15.959207+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	d442332e-65d2-43b9-be79-f214a3d53bd3	f
e32b4e07-3b3b-4c96-9517-5f5b8f5df07c	BILL-280326-3	9364cbf1-5240-4f79-8f0f-aaaf570e3139	2026-03-28	1200	0	due	2026-03-28 15:14:49.470617+00	2026-03-28 15:14:49.470617+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
7a1629c6-4a15-483c-b955-729cf667f691	BILL-010426-1	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	2026-04-01	1080	0	due	2026-04-01 12:59:41.373448+00	2026-04-01 12:59:41.373448+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
3217f127-d0f2-4c55-a431-335db3a38ef8	BILL-280326-4	3f8ef0db-1a43-45a0-a480-57665499ee2b	2026-03-28	8184	8184	paid	2026-03-28 16:09:15.621909+00	2026-04-01 13:00:39.06955+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
44869efb-8fe9-428c-b041-d077a64b2171	BILL-280326-2	dc7e8f3c-591d-490d-8136-f6190701d55f	2026-03-28	5400	456	partially_paid	2026-03-28 15:14:49.470617+00	2026-03-28 17:12:24.670835+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
d52b2231-1b01-43f7-96d1-8d011ded1c51	BILL-280326-6	f52920a0-1da9-4a6b-b294-e6cbaf1b6efa	2026-03-28	16200	0	due	2026-03-28 20:45:05.747879+00	2026-03-28 20:45:05.747879+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
1ddb5137-a193-413f-9615-9ae1f27ef2cb	BILL-010426-2	3f8ef0db-1a43-45a0-a480-57665499ee2b	2026-04-01	4182	4162	partially_paid	2026-04-01 12:59:41.373448+00	2026-04-01 13:00:39.06955+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	f
e60d2f81-a749-457f-8279-a45000b5d472	BILL-030426-2	3f8ef0db-1a43-45a0-a480-57665499ee2b	2026-04-03	3000	0	due	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	f
7bf127bf-6916-406a-97f2-b5c999084f07	BILL-030426-1	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	2026-04-03	2940	0	due	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	f
\.


--
-- Data for Name: deleted_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.deleted_records (id, table_name, record_id, record_owner_auth_id, deleted_at, deleted_by, deletion_source, deletion_reason, record_metadata, synced_to_clients, sync_completed_at) FROM stdin;
9fe35ef7-4c68-4a47-bea3-097d834500bb	products	6abc42f2-6295-44f9-b040-c0266baf3539	\N	2025-11-18 12:35:31.31178+00	00000000-0000-0000-0000-000000000000	dashboard/system	\N	{"id": "6abc42f2-6295-44f9-b040-c0266baf3539", "name": "RLS_TEST_43daa1b0-28dc-4d4c-b539-ce04c395686d", "table": "products"}	f	\N
81c4cd73-c814-4548-b7d3-f5c3d41caf48	users	a1560193-01c3-4159-a533-2bf60d04e5be	\N	2025-11-18 12:35:31.31178+00	00000000-0000-0000-0000-000000000000	dashboard/system	\N	{"id": "a1560193-01c3-4159-a533-2bf60d04e5be", "name": "RLS_TEST", "phone": null, "table": "users", "user_type": "vendor"}	f	\N
6a845966-92f6-472d-8997-ca096a142f95	stock_batches	4285b7a8-9050-4c09-9a0e-516fedc85c00	\N	2025-11-18 12:35:31.31178+00	00000000-0000-0000-0000-000000000000	dashboard/system	\N	{"id": "4285b7a8-9050-4c09-9a0e-516fedc85c00", "table": "stock_batches", "batch_code": "181125-2", "product_id": "3010fcfc-6be1-4b56-b202-aa3f7e2d50c8"}	f	\N
f3c780db-2e27-4d81-86d3-be2d78009a15	products	1c24399f-7fab-4c5f-a778-094910d61030	\N	2025-11-18 12:36:09.889602+00	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	application	\N	{"id": "1c24399f-7fab-4c5f-a778-094910d61030", "name": "RLS_TEST_e25e0f67-9d30-445c-a46a-9bc03fdd1332", "table": "products"}	f	\N
b0731df6-3970-4cd4-8c62-8ee19f5b8a17	users	d89239ea-b8c8-4c96-9b45-382200e966e5	\N	2025-11-18 12:36:09.889602+00	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	application	\N	{"id": "d89239ea-b8c8-4c96-9b45-382200e966e5", "name": "RLS_TEST", "phone": null, "table": "users", "user_type": "vendor"}	f	\N
bae3f7f8-4c8f-46d1-9371-04a993f5fe74	stock_batches	6b87ddad-1819-4f29-8ac7-9a979f448393	\N	2025-11-18 12:36:09.889602+00	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	application	\N	{"id": "6b87ddad-1819-4f29-8ac7-9a979f448393", "table": "stock_batches", "batch_code": "181125-3", "product_id": "3010fcfc-6be1-4b56-b202-aa3f7e2d50c8"}	f	\N
9c854978-ef0d-4139-9184-74400795c3b2	products	0f9f57e1-990c-46ce-b83e-1fb203f94ccc	\N	2025-11-18 12:37:17.542001+00	6308420e-5192-4590-967d-d69c8e93aa75	application	\N	{"id": "0f9f57e1-990c-46ce-b83e-1fb203f94ccc", "name": "RLS_TEST_0fc0a1f6-7b94-4280-a406-18e6e0e31795", "table": "products"}	f	\N
ef81ad4e-5ac5-45e8-a454-153f7f7bb030	users	7f99f745-5c35-4237-9c16-df37e99c3aac	\N	2025-11-18 12:37:17.542001+00	6308420e-5192-4590-967d-d69c8e93aa75	application	\N	{"id": "7f99f745-5c35-4237-9c16-df37e99c3aac", "name": "RLS_TEST", "phone": null, "table": "users", "user_type": "vendor"}	f	\N
81c07a44-7eff-479b-aa45-5b2d731c53fa	stock_batches	ab8eea2c-4fe6-4c59-bec4-8ae897e4bc15	\N	2025-11-18 12:37:17.542001+00	6308420e-5192-4590-967d-d69c8e93aa75	application	\N	{"id": "ab8eea2c-4fe6-4c59-bec4-8ae897e4bc15", "table": "stock_batches", "batch_code": "181125-4", "product_id": "3010fcfc-6be1-4b56-b202-aa3f7e2d50c8"}	f	\N
8b437242-d337-467b-8919-69ce9e460ee2	products	1a3a2b48-10aa-4533-8443-ca1a03e74d8d	\N	2025-11-18 12:37:59.145984+00	00000000-0000-0000-0000-000000000000	dashboard/system	\N	{"id": "1a3a2b48-10aa-4533-8443-ca1a03e74d8d", "name": "RLS_TEST_0de7a20a-d309-40da-9201-d84649d7194b", "table": "products"}	f	\N
3f4aa044-e812-4a22-b2e3-06a69d416677	users	5127fa2f-e672-4e47-b2f4-fb8ad26525d9	\N	2025-11-18 12:37:59.145984+00	00000000-0000-0000-0000-000000000000	dashboard/system	\N	{"id": "5127fa2f-e672-4e47-b2f4-fb8ad26525d9", "name": "RLS_TEST", "phone": null, "table": "users", "user_type": "vendor"}	f	\N
634c1d1e-6ac4-4700-a9f7-89b75f66a3b6	stock_batches	c4147380-97ae-4ec1-ae74-55c76c08bcf3	\N	2025-11-18 12:37:59.145984+00	00000000-0000-0000-0000-000000000000	dashboard/system	\N	{"id": "c4147380-97ae-4ec1-ae74-55c76c08bcf3", "table": "stock_batches", "batch_code": "181125-6", "product_id": "3010fcfc-6be1-4b56-b202-aa3f7e2d50c8"}	f	\N
\.


--
-- Data for Name: document_counters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.document_counters (document_type, counter_date, last_number, updated_at) FROM stdin;
bill	2026-01-28	2	2026-04-05 08:24:40.632337+00
bill	2025-11-21	2	2026-04-05 08:24:40.632337+00
bill	2026-04-01	2	2026-04-05 08:24:40.632337+00
bill	2026-01-27	2	2026-04-05 08:24:40.632337+00
bill	2025-12-03	1	2026-04-05 08:24:40.632337+00
bill	2026-03-25	1	2026-04-05 08:24:40.632337+00
bill	2026-04-03	2	2026-04-05 08:24:40.632337+00
bill	2025-11-18	1	2026-04-05 08:24:40.632337+00
bill	2026-03-28	7	2026-04-05 08:24:40.632337+00
auction_chalan	2026-01-27	4	2026-04-05 08:24:40.632337+00
auction_chalan	2025-11-21	2	2026-04-05 08:24:40.632337+00
auction_chalan	2026-04-03	15	2026-04-05 08:24:40.632337+00
single_chalan	2026-01-28	1001	2026-04-05 08:24:40.632337+00
auction_chalan	2025-11-18	1	2026-04-05 08:24:40.632337+00
auction_chalan	2026-04-01	14	2026-04-05 08:24:40.632337+00
auction_chalan	2025-12-03	3	2026-04-05 08:24:40.632337+00
auction_chalan	2026-03-25	6	2026-04-05 08:24:40.632337+00
auction_chalan	2026-01-28	5	2026-04-05 08:24:40.632337+00
auction_chalan	2026-03-28	13	2026-04-05 08:24:40.632337+00
floor_chalan	2026-01-28	1001	2026-04-05 08:24:40.632337+00
\.


--
-- Data for Name: fcm_device_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fcm_device_tokens (id, user_auth_id, device_token, created_at, app_scope, platform, updated_at, last_seen_at, is_active) FROM stdin;
\.


--
-- Data for Name: manager_spendings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.manager_spendings (id, spent_date, title, category, amount, note, payment_method, created_at, updated_at, created_by, updated_by) FROM stdin;
8f296877-01ca-493b-88b1-2ee5007498da	2026-04-05	tea	tea-snacks	25	\N	cash	2026-04-05 15:00:31.330961+00	2026-04-05 15:00:31.330961+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
\.


--
-- Data for Name: mfc_staff; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mfc_staff (id, full_name, role, is_active, is_default_admin, created_at, updated_at, created_by, updated_by) FROM stdin;
38322fdd-1346-4f01-9325-955d246a89af	Mondal	mfc_seller	t	f	2025-11-10 23:50:55.596096+00	2025-11-10 23:50:55.596096+00	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9
c0044c8b-cf12-4613-bdb1-40749779b927	test seller	mfc_seller	t	f	2025-11-10 23:51:43.155154+00	2025-11-10 23:51:43.155154+00	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9
6308420e-5192-4590-967d-d69c8e93aa75	manger test 2	manager	t	f	2025-11-10 23:50:25.518755+00	2025-11-21 18:20:58.398346+00	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9	00000000-0000-0000-0000-000000000000
24766c66-a4fd-407b-bc73-afd6feedd8c2	manager 3	manager	t	f	2026-01-27 21:28:55.184036+00	2026-01-27 21:28:55.184036+00	\N	\N
d442332e-65d2-43b9-be79-f214a3d53bd3	Manager four	manager	t	f	2026-03-25 11:30:59.140176+00	2026-03-25 11:30:59.140176+00	\N	\N
fa3c93b5-0ef1-4f37-8dbc-21edc1a8b002	aadmin	admin	t	t	2025-11-10 23:43:06.572038+00	2026-04-05 14:35:18.768064+00	\N	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: notification_outbox; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_outbox (id, user_auth_id, app_scope, event_type, title, body, payload, status, attempt_count, source_table, source_record_id, created_at, processed_at, last_error) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, name, description, is_stock_tracked, created_at, updated_at, created_by, updated_by) FROM stdin;
3010fcfc-6be1-4b56-b202-aa3f7e2d50c8	rui	\N	t	2025-11-18 11:30:18.420314+00	2025-11-18 11:30:18.420314+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
a6d2dbcb-b93f-4ae9-afc3-8e29d2420ac3	Test from manager context	Test	t	2025-11-18 12:41:07.168162+00	2025-11-18 12:41:07.168162+00	\N	\N
ab40f232-2b08-4a55-a9de-1b2595993e02	rui88	\N	t	2025-11-21 18:22:35.554602+00	2025-11-21 18:22:35.554602+00	\N	\N
5fe109e2-8437-4239-ac65-88703c534241	koi	\N	t	2025-11-27 18:06:31.237486+00	2025-11-27 18:06:31.237486+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
\.


--
-- Data for Name: public_registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.public_registrations (id, email, full_name, business_name, phone, message, status, created_at, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: quote_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quote_items (id, quote_id, product_id, product_description, weight_kg, price_per_kg, line_total) FROM stdin;
\.


--
-- Data for Name: quotes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.quotes (id, quote_number, customer_id, assigned_mfc_seller_id, delivery_date, total_amount, advance_paid, status, notes, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- Data for Name: sale_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sale_transactions (id, daily_bill_id, stock_batch_id, chalan_id, product_id, product_description, weight_kg, price_per_kg, amount, created_at, updated_at, created_by, updated_by, sale_type) FROM stdin;
90501f4a-04a3-48f0-8620-f0d7de0c82c9	6e5c2158-ad98-4778-a840-9f35ea46f6c3	\N	8314959b-e6ba-4afd-a54b-0bfa667031a9	\N	rui	12	12	144	2025-11-18 08:53:14.35388+00	2025-11-18 08:53:14.35388+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
9c72fd07-dd1e-4c5d-8dbf-ef0f51a3c40f	e968685b-db99-43f7-a2ef-3fbb2b7cf9e5	\N	dfd0850e-3410-453a-8bef-af29c710bbfe	\N	rui	89	90	8010	2025-11-22 00:58:35.406965+00	2025-11-22 00:58:35.406965+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
f187bb48-96e3-4f87-ad39-508459a776f7	5dd09457-4f9a-4624-b758-ec56c51a6b51	\N	dfd0850e-3410-453a-8bef-af29c710bbfe	\N	rui	98	90	8820	2025-11-22 00:58:35.406965+00	2025-11-22 00:58:35.406965+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
3dc7d9d4-39b1-473f-a4c0-f5cb2eb75fb9	197ad01c-3b42-4d95-ad39-ce7240ab4c15	\N	4c2e107e-3527-4465-9da8-e730371900b3	\N	rui	12	123	1476	2025-12-04 02:48:27.140248+00	2025-12-04 02:48:27.140248+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
6dcb47f5-b3ca-4b54-9646-5be503a799c9	5ca38088-9d69-43a8-955f-4e08350531dd	\N	b077a142-43da-49de-8943-5dfdd99adbf0	\N	rui	20	10	200	2026-01-27 21:31:38.398191+00	2026-01-27 21:31:38.398191+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	auction
88354fb4-f983-4a6d-83f9-a975f66d627e	b3859cad-9783-419d-a28e-6dd9e3c3d1cd	\N	b077a142-43da-49de-8943-5dfdd99adbf0	\N	rui	32	15	480	2026-01-27 21:31:38.398191+00	2026-01-27 21:31:38.398191+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	auction
ef9335ce-3181-45f9-80b6-7d42b76a32b1	4529fccf-dfbd-427b-baa8-a547903c5ab8	\N	ca63f948-2b22-4ff5-9b0a-6b79e8eedc8d	\N	rui	45	45	2025	2026-01-28 18:47:16.606421+00	2026-01-28 18:47:16.606421+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	auction
d3a30365-d387-45df-8f76-4f23c86ed85a	2f3e1ef8-13f8-4535-99b3-f6a6b90da890	\N	ca63f948-2b22-4ff5-9b0a-6b79e8eedc8d	\N	rui	120	12	1440	2026-01-28 18:47:16.606421+00	2026-01-28 18:47:16.606421+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	auction
95e04748-9ab7-4289-896a-53afa0eb2892	2f3e1ef8-13f8-4535-99b3-f6a6b90da890	653e31e3-c8da-4311-84c5-c0718f412a9e	e778b6fd-7252-467b-8da5-143d82329e9a	5fe109e2-8437-4239-ac65-88703c534241	\N	12	12	144	2026-01-28 18:54:07.589546+00	2026-01-28 18:54:07.589546+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	direct_sell
494212e4-d668-4f09-a8ff-63c3077157dd	2f3e1ef8-13f8-4535-99b3-f6a6b90da890	653e31e3-c8da-4311-84c5-c0718f412a9e	a84e3448-fc65-42ad-ac7a-dae5da50fb9c	5fe109e2-8437-4239-ac65-88703c534241	\N	12	12	144	2026-01-28 18:54:58.49797+00	2026-01-28 18:54:58.49797+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	direct_sell
7c522ee4-d5e4-49c8-9dfa-b3f9bfb3f041	9f167315-8ebf-473b-9229-bea430769b2d	\N	830a0183-95fd-4050-90a4-8940957fdfcb	\N	rui	12	12	144	2026-03-25 11:55:17.665164+00	2026-03-25 11:55:17.665164+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
e21d6a58-8150-48b5-95ce-0a3504376015	64a14ad2-5175-42e8-849a-14d279296b4b	\N	bb89bff2-4bf7-4fda-88bc-98d9d0df7543	\N	rui	25	25	625	2026-03-28 02:04:36.612034+00	2026-03-28 02:04:36.612034+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
903f1dd8-d635-41bd-8c39-5ee902511578	44869efb-8fe9-428c-b041-d077a64b2171	\N	01eaea0f-7761-4968-b4ea-394c3e21b1cb	\N	Rui	12	12	144	2026-03-28 15:14:49.470617+00	2026-03-28 15:14:49.470617+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
5ff8dc5a-4311-483e-98c6-ab47557e1f89	e32b4e07-3b3b-4c96-9517-5f5b8f5df07c	\N	01eaea0f-7761-4968-b4ea-394c3e21b1cb	\N	Rui	10	120	1200	2026-03-28 15:14:49.470617+00	2026-03-28 15:14:49.470617+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
2e74b693-9198-4571-8ca8-598316b9c11e	44869efb-8fe9-428c-b041-d077a64b2171	\N	01eaea0f-7761-4968-b4ea-394c3e21b1cb	\N	Rui	12	154	1848	2026-03-28 15:14:49.470617+00	2026-03-28 15:14:49.470617+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
55d90d48-f6a0-49d1-a84b-ab9bac3cefd2	44869efb-8fe9-428c-b041-d077a64b2171	\N	9701f2ff-6b64-4598-aa9c-1625b2345b30	\N	Rui	12	120	1440	2026-03-28 16:09:15.621909+00	2026-03-28 16:09:15.621909+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
b80bec44-9220-4908-a475-31ae48496548	3217f127-d0f2-4c55-a431-335db3a38ef8	\N	9701f2ff-6b64-4598-aa9c-1625b2345b30	\N	Rui	12	12	144	2026-03-28 16:09:15.621909+00	2026-03-28 16:09:15.621909+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
3b4c83ce-80b1-477f-a174-d54fb6bcf23f	44869efb-8fe9-428c-b041-d077a64b2171	\N	9701f2ff-6b64-4598-aa9c-1625b2345b30	\N	Rui	12	12	144	2026-03-28 16:09:15.621909+00	2026-03-28 16:09:15.621909+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
7b1a4564-b7ed-46a1-b230-ff9d1849fd6c	44869efb-8fe9-428c-b041-d077a64b2171	\N	83b7b706-ecf7-4f62-934b-915673a7db7a	\N	Rui	12	12	144	2026-03-28 17:05:34.647064+00	2026-03-28 17:05:34.647064+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
838abe4d-d29b-4578-8941-8773c1a36434	44869efb-8fe9-428c-b041-d077a64b2171	\N	83b7b706-ecf7-4f62-934b-915673a7db7a	\N	Rui	14	120	1680	2026-03-28 17:05:34.647064+00	2026-03-28 17:05:34.647064+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
c5cd5df4-e849-43bc-b5b1-ae4d0dd689cf	3217f127-d0f2-4c55-a431-335db3a38ef8	\N	65e5472a-b34b-440e-91f2-2f40a304917e	\N	rui	12	670	8040	2026-03-28 20:42:47.75527+00	2026-03-28 20:42:47.75527+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	auction
04e585e2-0b52-4748-b242-52aad460ac3f	c1ba4aa3-7b25-4dfb-b7d7-6515122468dc	\N	65e5472a-b34b-440e-91f2-2f40a304917e	\N	rui	34	67	2278	2026-03-28 20:42:47.75527+00	2026-03-28 20:42:47.75527+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2	auction
a666f703-a781-459f-98ad-79cecfccd926	d52b2231-1b01-43f7-96d1-8d011ded1c51	\N	f1525d49-9a46-4f92-b7d9-d88e0066368e	\N	Rui	120	135	16200	2026-03-28 20:45:05.747879+00	2026-03-28 20:45:05.747879+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
f675ad08-d8be-4067-b83e-6457e77296e6	1aa69f20-80e8-4599-aa31-9f33fce84a4f	\N	5b3ef155-8261-4d8a-9bef-845c9ca36ed5	\N	rui	12	120	1440	2026-03-28 23:53:18.457919+00	2026-03-28 23:53:18.457919+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
98352870-3e6e-437b-915b-b040e5d037e8	c1ba4aa3-7b25-4dfb-b7d7-6515122468dc	\N	5b3ef155-8261-4d8a-9bef-845c9ca36ed5	\N	rui	132	46	6072	2026-03-28 23:53:18.457919+00	2026-03-28 23:53:18.457919+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
48322ad5-b850-43ff-9717-d38d313f6355	7a1629c6-4a15-483c-b955-729cf667f691	\N	fd2483db-65a8-4cec-8c84-843cdacd4945	\N	Rui	12	90	1080	2026-04-01 12:59:41.373448+00	2026-04-01 12:59:41.373448+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
dbb5e4ba-0df4-41c2-8b1c-b2d417cb1672	1ddb5137-a193-413f-9615-9ae1f27ef2cb	\N	fd2483db-65a8-4cec-8c84-843cdacd4945	\N	Rui	34	123	4182	2026-04-01 12:59:41.373448+00	2026-04-01 12:59:41.373448+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3	auction
cfa45e8d-75df-4398-abfd-2e13360c9265	7bf127bf-6916-406a-97f2-b5c999084f07	\N	0068c7ab-401e-41d8-bd85-951d5ffcddaa	\N	rui	12	170	2040	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
38d71df7-fb23-44c2-aa65-1d7066b7a7ff	e60d2f81-a749-457f-8279-a45000b5d472	\N	0068c7ab-401e-41d8-bd85-951d5ffcddaa	\N	kat	12	250	3000	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
2975852f-9230-49ad-9df8-873310e0fb35	7bf127bf-6916-406a-97f2-b5c999084f07	\N	0068c7ab-401e-41d8-bd85-951d5ffcddaa	\N	pabda	3	300	900	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	auction
\.


--
-- Data for Name: seller_balance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seller_balance (user_id, total_earned, total_paid_out, current_due, updated_at) FROM stdin;
3f8ef0db-1a43-45a0-a480-57665499ee2b	0	0	0	2025-11-18 08:34:02.061577+00
40254037-4a0d-4e74-9d7e-6ce583e98b22	0	0	0	2025-11-18 08:34:02.061577+00
46d6750d-2fd4-46b2-8b12-3adb7e317222	0	0	0	2025-11-18 08:34:02.061577+00
6b707ec2-e6e5-45d3-80e0-f9d953182ad0	0	0	0	2025-11-18 08:34:02.061577+00
821821c3-f248-4ca9-a358-acf67a10bebd	0	0	0	2025-11-18 08:34:02.061577+00
9364cbf1-5240-4f79-8f0f-aaaf570e3139	0	0	0	2025-11-18 08:34:02.061577+00
a94280dd-24fe-491a-a19d-5cd2aeff909d	0	0	0	2025-11-18 08:34:02.061577+00
befa9b73-bbd3-4f36-b56f-4e50a39e05f9	0	0	0	2025-11-18 08:34:02.061577+00
ce31886a-3a1c-4629-a323-9e4d35efdaed	0	0	0	2025-11-18 08:34:02.061577+00
f52920a0-1da9-4a6b-b294-e6cbaf1b6efa	0	0	0	2025-11-18 08:34:02.061577+00
f93a9d88-ee9b-4a47-85c2-8ddad14f5994	0	0	0	2025-11-18 08:34:02.061577+00
51c05237-a5d6-4d46-b70a-1515b0a0e2fd	15390	15390	0	2026-03-28 20:45:05.747879+00
dc7e8f3c-591d-490d-8136-f6190701d55f	16755	16755	0	2026-03-28 23:53:18.457919+00
00000000-0000-0000-0000-000000000001	1385	1385	0	2025-12-04 02:48:27.140248+00
70010fcf-e689-4206-a1e3-3ebb1b16b7d0	0	0	0	2026-04-03 12:14:00.054836+00
bd0bed6f-a925-404f-9d83-4bbd32525d9e	0	0	0	2026-04-03 12:23:12.611357+00
2e1fb8a9-8539-4eff-8084-59ec5f2defcb	36825	36825	0	2026-04-05 09:23:45.568056+00
09801f00-c4ba-410b-abcb-2072ea6e8c32	725	910	-185	2026-03-28 02:12:55.977949+00
\.


--
-- Data for Name: seller_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.seller_payments (id, chalan_id, payment_date, amount, payment_method, created_at, updated_at, created_by, updated_by) FROM stdin;
bc729f7c-0b13-482e-b50b-6082ea344b3f	8314959b-e6ba-4afd-a54b-0bfa667031a9	2025-11-18	135	initial_payout	2025-11-18 08:53:14.35388+00	2025-11-18 08:53:14.35388+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
352af6cd-7e71-48ac-9426-05bba2dbc090	dfd0850e-3410-453a-8bef-af29c710bbfe	2025-11-21	15820	initial_payout	2025-11-22 00:58:35.406965+00	2025-11-22 00:58:35.406965+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
ae108ac7-623e-4644-a852-72d12b0a577a	4c2e107e-3527-4465-9da8-e730371900b3	2025-12-03	1385	initial_payout	2025-12-04 02:48:27.140248+00	2025-12-04 02:48:27.140248+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
8a25cc6f-9734-4cd1-89f7-f0034ec23c40	b077a142-43da-49de-8943-5dfdd99adbf0	2026-01-27	640	initial_payout	2026-01-27 21:31:38.398191+00	2026-01-27 21:31:38.398191+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
9b36a447-c7cf-45ce-b92e-51beb339809b	ca63f948-2b22-4ff5-9b0a-6b79e8eedc8d	2026-01-28	3000	initial_payout	2026-01-28 18:47:16.606421+00	2026-01-28 18:47:16.606421+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
2af21bdc-f97b-4976-974f-c0aea306e700	830a0183-95fd-4050-90a4-8940957fdfcb	2026-03-25	120	initial_payout	2026-03-25 11:55:17.665164+00	2026-03-25 11:55:17.665164+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
713c0b12-68a2-4816-b1e0-2076c2c4eac3	bb89bff2-4bf7-4fda-88bc-98d9d0df7543	2026-03-28	590	initial_payout	2026-03-28 02:04:36.612034+00	2026-03-28 02:04:36.612034+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
2cb569f7-91d4-4bf0-9adf-5b0e436cbeaf	830a0183-95fd-4050-90a4-8940957fdfcb	2026-03-28	200	cash	2026-03-28 02:12:55.977949+00	2026-03-28 02:12:55.977949+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
789acb56-a972-47a1-95ff-39913cad2f68	01eaea0f-7761-4968-b4ea-394c3e21b1cb	2026-03-28	2500	initial_payout	2026-03-28 15:14:49.470617+00	2026-03-28 15:14:49.470617+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
8c2a3bed-106d-438f-8b29-b793f5df5836	9701f2ff-6b64-4598-aa9c-1625b2345b30	2026-03-28	1640	initial_payout	2026-03-28 16:09:15.621909+00	2026-03-28 16:09:15.621909+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
19ce3232-9f82-4302-9440-f927fa1f6d49	83b7b706-ecf7-4f62-934b-915673a7db7a	2026-03-28	1730	initial_payout	2026-03-28 17:05:34.647064+00	2026-03-28 17:05:34.647064+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
58a24c0c-7f39-4511-8c8e-3666b345f517	65e5472a-b34b-440e-91f2-2f40a304917e	2026-03-28	9695	initial_payout	2026-03-28 20:42:47.75527+00	2026-03-28 20:42:47.75527+00	24766c66-a4fd-407b-bc73-afd6feedd8c2	24766c66-a4fd-407b-bc73-afd6feedd8c2
c5cddee9-6a39-4569-817b-576bc316bb07	f1525d49-9a46-4f92-b7d9-d88e0066368e	2026-03-28	15390	initial_payout	2026-03-28 20:45:05.747879+00	2026-03-28 20:45:05.747879+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
67f4306e-3a44-4c62-81ff-354f44309c3a	5b3ef155-8261-4d8a-9bef-845c9ca36ed5	2026-03-28	7060	initial_payout	2026-03-28 23:53:18.457919+00	2026-03-28 23:53:18.457919+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
bc6daf85-f87d-453c-ba96-dfd5fd5800fe	fd2483db-65a8-4cec-8c84-843cdacd4945	2026-04-01	4995	initial_payout	2026-04-01 12:59:41.373448+00	2026-04-01 12:59:41.373448+00	d442332e-65d2-43b9-be79-f214a3d53bd3	d442332e-65d2-43b9-be79-f214a3d53bd3
41fb9cc4-51b8-474a-9f49-e4030a5b01eb	0068c7ab-401e-41d8-bd85-951d5ffcddaa	2026-04-03	5580	initial_payout	2026-04-03 16:24:40.712394+00	2026-04-03 16:24:40.712394+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
e9e4aaa8-ff4c-4b33-9a11-74674b043b33	ca63f948-2b22-4ff5-9b0a-6b79e8eedc8d	2026-04-05	255	upi	2026-04-05 09:23:33.547607+00	2026-04-05 09:23:33.547607+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
853117b0-416c-4944-8e97-58ab8c935aa8	01eaea0f-7761-4968-b4ea-394c3e21b1cb	2026-04-05	530	upi	2026-04-05 09:23:45.568056+00	2026-04-05 09:23:45.568056+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
\.


--
-- Data for Name: stock_batches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stock_batches (id, product_id, batch_code, supplier_id, initial_weight_kg, current_weight_kg, cost_per_kg, created_at, updated_at, created_by, updated_by, mfc_seller_id) FROM stdin;
26f6b0e3-d19a-4ffd-bac7-be8dfb67f7e2	3010fcfc-6be1-4b56-b202-aa3f7e2d50c8	181125-1	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	120	120	34	2025-11-18 11:30:18.420314+00	2025-11-18 11:30:18.420314+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75	38322fdd-1346-4f01-9325-955d246a89af
653e31e3-c8da-4311-84c5-c0718f412a9e	5fe109e2-8437-4239-ac65-88703c534241	271125-1	befa9b73-bbd3-4f36-b56f-4e50a39e05f9	10000	9976	\N	2025-11-27 18:06:31.237486+00	2026-01-28 18:54:58.49797+00	6308420e-5192-4590-967d-d69c8e93aa75	24766c66-a4fd-407b-bc73-afd6feedd8c2	38322fdd-1346-4f01-9325-955d246a89af
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_config (id, default_admin_id, mfc_stock_buyer_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, address, profile_photo_url, created_at, updated_at, created_by, updated_by) FROM stdin;
40254037-4a0d-4e74-9d7e-6ce583e98b22	\N	Indrajit Sen	Indrajit Sen	00223679	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-06 17:18:48.030868+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	3f245e06-4cd5-475d-84c8-c75375e7f83b
46d6750d-2fd4-46b2-8b12-3adb7e317222	\N	The Royal Cafe	The Royal Cafe	9811111112	business	buyer	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-02 02:20:56.770119+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	3f245e06-4cd5-475d-84c8-c75375e7f83b
51c05237-a5d6-4d46-b70a-1515b0a0e2fd	\N	Sonajhuri Hotel	Sonajhuri	9813332211	business	buyer	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-02 06:03:20.944296+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	3f245e06-4cd5-475d-84c8-c75375e7f83b
6b707ec2-e6e5-45d3-80e0-f9d953182ad0	\N	Chandan Halder	Chandan Halder	9876543215	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-02 02:20:56.770119+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	3f245e06-4cd5-475d-84c8-c75375e7f83b
821821c3-f248-4ca9-a358-acf67a10bebd	\N	Green Leaf Eatery	Green Leaf Eat	91234333	business	buyer	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-02 05:57:58.701677+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	3f245e06-4cd5-475d-84c8-c75375e7f83b
9364cbf1-5240-4f79-8f0f-aaaf570e3139	\N	Harish Dasa	Harish Das	9876543218	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-02 05:13:28.965845+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	3f245e06-4cd5-475d-84c8-c75375e7f83b
a94280dd-24fe-491a-a19d-5cd2aeff909d	\N	Test User 1762548034618	\N	\N	vendor	buyer	t	\N	\N	2025-11-08 02:10:34.779833+00	2025-11-08 02:10:34.779833+00	2de9423d-5127-4440-91d1-a709c68ad38d	2de9423d-5127-4440-91d1-a709c68ad38d
ce31886a-3a1c-4629-a323-9e4d35efdaed	\N	Test User 1762547935686	\N	\N	vendor	buyer	t	\N	\N	2025-11-08 02:08:55.972054+00	2025-11-08 02:08:55.972054+00	2de9423d-5127-4440-91d1-a709c68ad38d	2de9423d-5127-4440-91d1-a709c68ad38d
00000000-0000-0000-0000-000000000001	\N	MFC Stock	MFC Internal Stock Account	\N	business	buyer	f	\N	\N	2025-11-07 18:45:28.021781+00	2025-11-18 12:35:31.31178+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	00000000-0000-0000-0000-000000000000
09801f00-c4ba-410b-abcb-2072ea6e8c32	\N	Test Update 5:29:57 AM	Deepak Barmana	987654321	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-18 12:36:09.889602+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	4aca1b8e-34a9-45b1-affc-bc3f26c6f2b9
2e1fb8a9-8539-4eff-8084-59ec5f2defcb	\N	Mondal	SM	\N	business	seller	t	\N	\N	2025-11-06 09:56:22.9376+00	2025-11-18 12:37:17.542001+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	6308420e-5192-4590-967d-d69c8e93aa75
3f8ef0db-1a43-45a0-a480-57665499ee2b	\N	Prasanta Roy	Prasanta Fish Co	9876543210	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-18 12:37:59.145984+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	00000000-0000-0000-0000-000000000000
dc7e8f3c-591d-490d-8136-f6190701d55f	\N	Dui Konna Restaurant	Dui Konna	981111	business	buyer	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-22 00:48:43.328911+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	6308420e-5192-4590-967d-d69c8e93aa75
f52920a0-1da9-4a6b-b294-e6cbaf1b6efa	\N	Gopal Sarkarii	Gopal Sarkar	987654321	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-22 00:49:20.596718+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	00000000-0000-0000-0000-000000000000
f93a9d88-ee9b-4a47-85c2-8ddad14f5994	\N	Bharat Mondal	Bharat Fisherr22	1223333	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2025-11-29 09:54:36.759002+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	00000000-0000-0000-0000-000000000000
70010fcf-e689-4206-a1e3-3ebb1b16b7d0	\N	dui va	dui va	7811881318	business	buyer	t	{}	\N	2026-04-03 12:14:00.054836+00	2026-04-03 12:14:00.054836+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
bd0bed6f-a925-404f-9d83-4bbd32525d9e	\N	dui vai	dui vai	7811881318	business	buyer	t	{}	\N	2026-04-03 12:23:12.611357+00	2026-04-03 12:23:12.611357+00	6308420e-5192-4590-967d-d69c8e93aa75	6308420e-5192-4590-967d-d69c8e93aa75
befa9b73-bbd3-4f36-b56f-4e50a39e05f9	a2473357-5896-4e88-a313-35c70d3f3432	Bultu Das	Bultu Fisheries	9876543	vendor	seller	t	\N	\N	2025-11-02 02:20:56.770119+00	2026-04-05 10:20:55.131025+00	3f245e06-4cd5-475d-84c8-c75375e7f83b	00000000-0000-0000-0000-000000000000
\.


--
-- Data for Name: messages_2026_04_02; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_02 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_04_03; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_04_04; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_04_05; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
user-notifications:a2473357-5896-4e88-a313-35c70d3f3432	broadcast	{"id": "d1fc8331-664a-4fbe-92f5-a8994da6834f", "table": "users", "operation": "UPDATE", "record_id": "befa9b73-bbd3-4f36-b56f-4e50a39e05f9"}	data_updated	t	2026-04-05 04:50:55.131025	2026-04-05 04:50:55.131025	d1fc8331-664a-4fbe-92f5-a8994da6834f
\.


--
-- Data for Name: messages_2026_04_06; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_04_07; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2026_04_08; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2026_04_08 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-10-19 02:00:06
20211116045059	2025-10-19 02:00:07
20211116050929	2025-10-19 02:00:07
20211116051442	2025-10-19 02:00:08
20211116212300	2025-10-19 02:00:09
20211116213355	2025-10-19 02:00:09
20211116213934	2025-10-19 02:00:10
20211116214523	2025-10-19 02:00:11
20211122062447	2025-10-19 02:00:12
20211124070109	2025-10-19 02:00:12
20211202204204	2025-10-19 02:00:13
20211202204605	2025-10-19 02:00:13
20211210212804	2025-10-19 02:00:15
20211228014915	2025-10-19 02:00:16
20220107221237	2025-10-19 02:00:17
20220228202821	2025-10-19 02:00:17
20220312004840	2025-10-19 02:00:18
20220603231003	2025-10-19 02:00:19
20220603232444	2025-10-19 02:00:19
20220615214548	2025-10-19 02:00:20
20220712093339	2025-10-19 02:00:21
20220908172859	2025-10-19 02:00:21
20220916233421	2025-10-19 02:00:22
20230119133233	2025-10-19 02:00:23
20230128025114	2025-10-19 02:00:24
20230128025212	2025-10-19 02:00:24
20230227211149	2025-10-19 02:00:25
20230228184745	2025-10-19 02:00:25
20230308225145	2025-10-19 02:00:26
20230328144023	2025-10-19 02:00:27
20231018144023	2025-10-19 02:00:27
20231204144023	2025-10-19 02:00:28
20231204144024	2025-10-19 02:00:29
20231204144025	2025-10-19 02:00:30
20240108234812	2025-10-19 02:00:30
20240109165339	2025-10-19 02:00:31
20240227174441	2025-10-19 02:00:32
20240311171622	2025-10-19 02:00:33
20240321100241	2025-10-19 02:00:34
20240401105812	2025-10-19 02:00:36
20240418121054	2025-10-19 02:00:37
20240523004032	2025-10-19 02:00:39
20240618124746	2025-10-19 02:00:40
20240801235015	2025-10-19 02:00:40
20240805133720	2025-10-19 02:00:41
20240827160934	2025-10-19 02:00:41
20240919163303	2025-10-19 02:00:42
20240919163305	2025-10-19 02:00:43
20241019105805	2025-10-19 02:00:43
20241030150047	2025-10-19 02:00:46
20241108114728	2025-10-19 02:00:47
20241121104152	2025-10-19 02:00:47
20241130184212	2025-10-19 02:00:48
20241220035512	2025-10-19 02:00:49
20241220123912	2025-10-19 02:00:49
20241224161212	2025-10-19 02:00:50
20250107150512	2025-10-19 02:00:50
20250110162412	2025-10-19 02:00:51
20250123174212	2025-10-19 02:00:52
20250128220012	2025-10-19 02:00:52
20250506224012	2025-10-19 02:00:53
20250523164012	2025-10-19 02:00:53
20250714121412	2025-10-19 02:00:54
20250905041441	2025-10-19 02:00:55
20251103001201	2025-11-11 20:37:36
20251120212548	2026-03-25 06:01:42
20251120215549	2026-03-25 06:01:43
20260218120000	2026-03-25 06:01:44
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-10-19 02:00:05.867751
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-10-19 02:00:05.873346
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-10-19 02:00:05.909303
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-10-19 02:00:05.968979
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-10-19 02:00:05.973885
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-10-19 02:00:05.990479
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-10-19 02:00:05.9975
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-10-19 02:00:06.026821
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-10-19 02:00:06.04041
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-10-19 02:00:06.045912
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-10-19 02:00:06.05148
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-10-19 02:00:06.080407
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-10-19 02:00:06.08919
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-10-19 02:00:06.095547
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-10-19 02:00:06.105459
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-10-19 02:00:06.117888
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-10-19 02:00:06.134919
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-10-19 02:00:06.145536
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-10-19 02:00:06.169132
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-10-19 02:00:06.188839
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-10-19 02:00:06.194379
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-10-19 02:00:06.199108
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-10-19 02:00:07.825641
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-01-06 10:46:52.859758
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-01-06 10:46:52.889564
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-01-06 10:46:52.969368
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-01-06 10:46:52.973002
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-01-06 10:46:53.143679
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2025-10-19 02:00:05.883317
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2025-10-19 02:00:05.982662
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2025-10-19 02:00:06.011454
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2025-10-19 02:00:06.01999
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2025-10-19 02:00:06.203937
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2025-10-19 02:00:06.224157
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2025-10-19 02:00:06.865948
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2025-10-19 02:00:06.883476
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2025-10-19 02:00:06.89243
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2025-10-19 02:00:07.219683
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2025-10-19 02:00:07.666292
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2025-10-19 02:00:07.787799
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2025-10-19 02:00:07.791982
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2025-10-19 02:00:07.810562
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2025-10-19 02:00:07.816378
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2025-10-19 02:00:07.835824
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2025-10-19 02:00:07.849427
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2025-10-19 02:00:07.855885
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2025-10-19 02:00:07.866327
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2025-10-19 02:00:07.87232
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2025-10-19 02:00:07.879068
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-01-06 10:46:52.975846
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-03-25 15:36:54.25188
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-03-25 15:36:54.330587
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-03-25 15:36:54.33204
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-03-25 15:36:54.488041
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-03-25 15:36:54.489589
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-03-25 15:36:54.491009
56	fix-optimized-search-function	cb58526ebc23048049fd5bf2fd148d18b04a2073	2026-03-25 15:36:54.497603
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 866, true);


--
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: -
--

SELECT pg_catalog.setval('cron.jobid_seq', 6, true);


--
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: -
--

SELECT pg_catalog.setval('cron.runid_seq', 609, true);


--
-- Name: daily_batch_sequence; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_batch_sequence', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 43762, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: chalans chalans_chalan_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_chalan_number_key UNIQUE (chalan_number);


--
-- Name: chalans chalans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_pkey PRIMARY KEY (id);


--
-- Name: customer_balance customer_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_balance
    ADD CONSTRAINT customer_balance_pkey PRIMARY KEY (user_id);


--
-- Name: customer_payments customer_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_pkey PRIMARY KEY (id);


--
-- Name: daily_bills daily_bills_bill_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_bill_number_key UNIQUE (bill_number);


--
-- Name: daily_bills daily_bills_customer_id_bill_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_customer_id_bill_date_key UNIQUE (customer_id, bill_date);


--
-- Name: daily_bills daily_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_pkey PRIMARY KEY (id);


--
-- Name: deleted_records deleted_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deleted_records
    ADD CONSTRAINT deleted_records_pkey PRIMARY KEY (id);


--
-- Name: deleted_records deleted_records_table_record_owner_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deleted_records
    ADD CONSTRAINT deleted_records_table_record_owner_unique UNIQUE (table_name, record_id, record_owner_auth_id);


--
-- Name: document_counters document_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_counters
    ADD CONSTRAINT document_counters_pkey PRIMARY KEY (document_type, counter_date);


--
-- Name: fcm_device_tokens fcm_device_tokens_device_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_device_token_key UNIQUE (device_token);


--
-- Name: fcm_device_tokens fcm_device_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_pkey PRIMARY KEY (id);


--
-- Name: manager_spendings manager_spendings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_spendings
    ADD CONSTRAINT manager_spendings_pkey PRIMARY KEY (id);


--
-- Name: mfc_staff mfc_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfc_staff
    ADD CONSTRAINT mfc_staff_pkey PRIMARY KEY (id);


--
-- Name: notification_outbox notification_outbox_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_outbox
    ADD CONSTRAINT notification_outbox_pkey PRIMARY KEY (id);


--
-- Name: products products_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_name_key UNIQUE (name);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: public_registrations public_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_registrations
    ADD CONSTRAINT public_registrations_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_pkey PRIMARY KEY (id);


--
-- Name: quotes quotes_quote_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_quote_number_key UNIQUE (quote_number);


--
-- Name: sale_transactions sale_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_pkey PRIMARY KEY (id);


--
-- Name: seller_balance seller_balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_balance
    ADD CONSTRAINT seller_balance_pkey PRIMARY KEY (user_id);


--
-- Name: seller_payments seller_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_payments
    ADD CONSTRAINT seller_payments_pkey PRIMARY KEY (id);


--
-- Name: stock_batches stock_batches_batch_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_batch_code_key UNIQUE (batch_code);


--
-- Name: stock_batches stock_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_default_admin_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_default_admin_id_key UNIQUE (default_admin_id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: users users_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_02 messages_2026_04_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_02
    ADD CONSTRAINT messages_2026_04_02_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_03 messages_2026_04_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_03
    ADD CONSTRAINT messages_2026_04_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_04 messages_2026_04_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_04
    ADD CONSTRAINT messages_2026_04_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_05 messages_2026_04_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_05
    ADD CONSTRAINT messages_2026_04_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_06 messages_2026_04_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_06
    ADD CONSTRAINT messages_2026_04_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_07 messages_2026_04_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_07
    ADD CONSTRAINT messages_2026_04_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_04_08 messages_2026_04_08_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2026_04_08
    ADD CONSTRAINT messages_2026_04_08_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: idx_chalans_chalan_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_chalan_date ON public.chalans USING btree (chalan_date);


--
-- Name: idx_chalans_created_by_chalan_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_created_by_chalan_date ON public.chalans USING btree (created_by, chalan_date DESC);


--
-- Name: INDEX idx_chalans_created_by_chalan_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_chalans_created_by_chalan_date IS 'Manager-facing sync and operations index. Scope chalans by created_by instead of display-name matching.';


--
-- Name: idx_chalans_mfc_seller_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_mfc_seller_id ON public.chalans USING btree (mfc_seller_id);


--
-- Name: idx_chalans_seller_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_seller_date ON public.chalans USING btree (seller_id, chalan_date DESC);


--
-- Name: idx_chalans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_status ON public.chalans USING btree (status);


--
-- Name: idx_chalans_unpaid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_unpaid ON public.chalans USING btree (seller_id, chalan_date DESC) WHERE (status = ANY (ARRAY['due'::public.payment_status, 'partially_paid'::public.payment_status]));


--
-- Name: idx_chalans_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chalans_updated_at ON public.chalans USING btree (updated_at);


--
-- Name: idx_customer_balance_current_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_balance_current_due ON public.customer_balance USING btree (current_due);


--
-- Name: idx_customer_payments_bill; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_payments_bill ON public.customer_payments USING btree (daily_bill_id, payment_date DESC);


--
-- Name: idx_customer_payments_created_by_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_payments_created_by_payment_date ON public.customer_payments USING btree (created_by, payment_date DESC);


--
-- Name: INDEX idx_customer_payments_created_by_payment_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_customer_payments_created_by_payment_date IS 'Manager-facing sync and collection-history index. Scope customer payments by created_by instead of created_by_name.';


--
-- Name: idx_customer_payments_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_payments_payment_date ON public.customer_payments USING btree (payment_date);


--
-- Name: idx_customer_payments_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_customer_payments_updated_at ON public.customer_payments USING btree (updated_at);


--
-- Name: idx_daily_bills_bill_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_bills_bill_date ON public.daily_bills USING btree (bill_date);


--
-- Name: idx_daily_bills_created_by_bill_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_bills_created_by_bill_date ON public.daily_bills USING btree (created_by, bill_date DESC);


--
-- Name: INDEX idx_daily_bills_created_by_bill_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_daily_bills_created_by_bill_date IS 'Manager-facing sync and dashboard index. Scope staff-owned bills by created_by instead of display-name matching.';


--
-- Name: idx_daily_bills_customer_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_bills_customer_date ON public.daily_bills USING btree (customer_id, bill_date DESC);


--
-- Name: idx_daily_bills_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_bills_status ON public.daily_bills USING btree (status);


--
-- Name: idx_daily_bills_unpaid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_bills_unpaid ON public.daily_bills USING btree (customer_id, bill_date DESC) WHERE (status = ANY (ARRAY['due'::public.payment_status, 'partially_paid'::public.payment_status]));


--
-- Name: idx_daily_bills_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_bills_updated_at ON public.daily_bills USING btree (updated_at);


--
-- Name: idx_dashboard_stats_singleton; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_dashboard_stats_singleton ON public.dashboard_stats_for_admin USING btree ((1));


--
-- Name: idx_deleted_records_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deleted_records_deleted_at ON public.deleted_records USING btree (deleted_at);


--
-- Name: idx_deleted_records_owner_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deleted_records_owner_id ON public.deleted_records USING btree (record_owner_auth_id);


--
-- Name: idx_deleted_records_synced; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deleted_records_synced ON public.deleted_records USING btree (synced_to_clients, deleted_at);


--
-- Name: idx_deleted_records_table_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deleted_records_table_name ON public.deleted_records USING btree (table_name);


--
-- Name: idx_deleted_records_table_record; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deleted_records_table_record ON public.deleted_records USING btree (table_name, record_id);


--
-- Name: idx_fcm_device_tokens_scope_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fcm_device_tokens_scope_active ON public.fcm_device_tokens USING btree (app_scope, is_active, updated_at DESC);


--
-- Name: idx_fcm_device_tokens_user_auth_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fcm_device_tokens_user_auth_id ON public.fcm_device_tokens USING btree (user_auth_id);


--
-- Name: idx_manager_spendings_category_spent_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_spendings_category_spent_date ON public.manager_spendings USING btree (category, spent_date DESC);


--
-- Name: idx_manager_spendings_created_by_spent_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_spendings_created_by_spent_date ON public.manager_spendings USING btree (created_by, spent_date DESC);


--
-- Name: idx_manager_spendings_spent_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_spendings_spent_date ON public.manager_spendings USING btree (spent_date DESC);


--
-- Name: idx_mfc_staff_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfc_staff_active ON public.mfc_staff USING btree (full_name) WHERE (is_active = true);


--
-- Name: idx_mfc_staff_active_lower_full_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfc_staff_active_lower_full_name ON public.mfc_staff USING btree (lower(full_name)) WHERE (is_active = true);


--
-- Name: INDEX idx_mfc_staff_active_lower_full_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_mfc_staff_active_lower_full_name IS 'Active-staff autocomplete index for manager assignment and seller lookups.';


--
-- Name: idx_mfc_staff_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfc_staff_is_active ON public.mfc_staff USING btree (is_active);


--
-- Name: idx_mfc_staff_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfc_staff_role ON public.mfc_staff USING btree (role);


--
-- Name: idx_mfc_staff_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mfc_staff_updated_at ON public.mfc_staff USING btree (updated_at);


--
-- Name: idx_notification_outbox_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_outbox_source ON public.notification_outbox USING btree (source_table, source_record_id);


--
-- Name: idx_notification_outbox_status_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_outbox_status_created_at ON public.notification_outbox USING btree (status, created_at);


--
-- Name: idx_notification_outbox_user_scope; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_outbox_user_scope ON public.notification_outbox USING btree (user_auth_id, app_scope, created_at DESC);


--
-- Name: idx_products_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_created_by ON public.products USING btree (created_by);


--
-- Name: idx_products_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_updated_at ON public.products USING btree (updated_at);


--
-- Name: idx_public_registrations_status_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_public_registrations_status_created_at ON public.public_registrations USING btree (status, created_at);


--
-- Name: idx_quote_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_items_product_id ON public.quote_items USING btree (product_id);


--
-- Name: idx_quote_items_quote_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_items_quote_id ON public.quote_items USING btree (quote_id);


--
-- Name: idx_quotes_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_active ON public.quotes USING btree (customer_id, delivery_date) WHERE (status = ANY (ARRAY['pending'::public.quote_status, 'confirmed'::public.quote_status]));


--
-- Name: idx_quotes_assigned_mfc_seller_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_assigned_mfc_seller_id ON public.quotes USING btree (assigned_mfc_seller_id);


--
-- Name: idx_quotes_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_customer ON public.quotes USING btree (customer_id, delivery_date DESC);


--
-- Name: idx_quotes_delivery_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_delivery_date ON public.quotes USING btree (delivery_date);


--
-- Name: idx_quotes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_status ON public.quotes USING btree (status);


--
-- Name: idx_quotes_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quotes_updated_at ON public.quotes USING btree (updated_at);


--
-- Name: idx_sale_transactions_bill; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_transactions_bill ON public.sale_transactions USING btree (daily_bill_id, updated_at);


--
-- Name: idx_sale_transactions_chalan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_transactions_chalan ON public.sale_transactions USING btree (chalan_id, updated_at);


--
-- Name: idx_sale_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_transactions_created_at ON public.sale_transactions USING btree (created_at);


--
-- Name: idx_sale_transactions_stock_batch_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_transactions_stock_batch_id ON public.sale_transactions USING btree (stock_batch_id);


--
-- Name: idx_sale_transactions_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sale_transactions_updated_at ON public.sale_transactions USING btree (updated_at);


--
-- Name: idx_seller_balance_current_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seller_balance_current_due ON public.seller_balance USING btree (current_due);


--
-- Name: idx_seller_payments_chalan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seller_payments_chalan ON public.seller_payments USING btree (chalan_id, payment_date DESC);


--
-- Name: idx_seller_payments_created_by_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seller_payments_created_by_payment_date ON public.seller_payments USING btree (created_by, payment_date DESC);


--
-- Name: INDEX idx_seller_payments_created_by_payment_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_seller_payments_created_by_payment_date IS 'Manager-facing sync and payout-history index. Scope seller payouts by created_by instead of created_by_name.';


--
-- Name: idx_seller_payments_payment_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seller_payments_payment_date ON public.seller_payments USING btree (payment_date);


--
-- Name: idx_seller_payments_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_seller_payments_updated_at ON public.seller_payments USING btree (updated_at);


--
-- Name: idx_stock_batches_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_batches_available ON public.stock_batches USING btree (product_id, current_weight_kg DESC) WHERE (current_weight_kg > (0)::numeric);


--
-- Name: idx_stock_batches_current_weight; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_batches_current_weight ON public.stock_batches USING btree (current_weight_kg);


--
-- Name: idx_stock_batches_mfc_seller; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_batches_mfc_seller ON public.stock_batches USING btree (mfc_seller_id);


--
-- Name: idx_stock_batches_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_batches_product ON public.stock_batches USING btree (product_id, current_weight_kg);


--
-- Name: idx_stock_batches_supplier_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_batches_supplier_created_at ON public.stock_batches USING btree (supplier_id, created_at DESC);


--
-- Name: INDEX idx_stock_batches_supplier_created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_stock_batches_supplier_created_at IS 'Supplier and recency index for manager stock purchase and stock review flows.';


--
-- Name: idx_stock_batches_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_batches_updated_at ON public.stock_batches USING btree (updated_at);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_active ON public.users USING btree (name) WHERE (is_active = true);


--
-- Name: idx_users_active_lower_business_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_active_lower_business_name ON public.users USING btree (lower(business_name)) WHERE ((is_active = true) AND (business_name IS NOT NULL));


--
-- Name: INDEX idx_users_active_lower_business_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_users_active_lower_business_name IS 'Active-business autocomplete index for manager sale, payment, and operations screens.';


--
-- Name: idx_users_active_lower_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_active_lower_name ON public.users USING btree (lower(name)) WHERE (is_active = true);


--
-- Name: INDEX idx_users_active_lower_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON INDEX public.idx_users_active_lower_name IS 'Active-user autocomplete index for manager sale, payment, and operations screens.';


--
-- Name: idx_users_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_name ON public.users USING btree (name);


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_phone ON public.users USING btree (phone);


--
-- Name: idx_users_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_updated_at ON public.users USING btree (updated_at);


--
-- Name: idx_users_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_user_type ON public.users USING btree (user_type);


--
-- Name: mfc_staff_one_default_admin_only; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX mfc_staff_one_default_admin_only ON public.mfc_staff USING btree (is_default_admin) WHERE (is_default_admin = true);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_02_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_02_inserted_at_topic_idx ON realtime.messages_2026_04_02 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_03_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_03_inserted_at_topic_idx ON realtime.messages_2026_04_03 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_04_inserted_at_topic_idx ON realtime.messages_2026_04_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_05_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_05_inserted_at_topic_idx ON realtime.messages_2026_04_05 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_06_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_06_inserted_at_topic_idx ON realtime.messages_2026_04_06 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_07_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_07_inserted_at_topic_idx ON realtime.messages_2026_04_07 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_04_08_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX messages_2026_04_08_inserted_at_topic_idx ON realtime.messages_2026_04_08 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2026_04_02_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_02_inserted_at_topic_idx;


--
-- Name: messages_2026_04_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_02_pkey;


--
-- Name: messages_2026_04_03_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_03_inserted_at_topic_idx;


--
-- Name: messages_2026_04_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_03_pkey;


--
-- Name: messages_2026_04_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_04_inserted_at_topic_idx;


--
-- Name: messages_2026_04_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_04_pkey;


--
-- Name: messages_2026_04_05_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_05_inserted_at_topic_idx;


--
-- Name: messages_2026_04_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_05_pkey;


--
-- Name: messages_2026_04_06_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_06_inserted_at_topic_idx;


--
-- Name: messages_2026_04_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_06_pkey;


--
-- Name: messages_2026_04_07_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_07_inserted_at_topic_idx;


--
-- Name: messages_2026_04_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_07_pkey;


--
-- Name: messages_2026_04_08_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_04_08_inserted_at_topic_idx;


--
-- Name: messages_2026_04_08_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_04_08_pkey;


--
-- Name: mfc_staff enforce_last_admin_exists; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER enforce_last_admin_exists BEFORE DELETE OR UPDATE ON public.mfc_staff FOR EACH ROW EXECUTE FUNCTION public.prevent_last_default_admin_removal();


--
-- Name: stock_batches handle_batch_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_batch_update BEFORE UPDATE ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: daily_bills handle_bill_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_bill_update BEFORE UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: chalans handle_chalan_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_chalan_update BEFORE UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: customer_payments handle_customer_payment_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_customer_payment_update BEFORE UPDATE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: products handle_product_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_product_update BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: quotes handle_quote_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_quote_update BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: public_registrations handle_registration_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_registration_update BEFORE UPDATE ON public.public_registrations FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: sale_transactions handle_sale_transaction_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_sale_transaction_update BEFORE UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: seller_payments handle_seller_payment_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_seller_payment_update BEFORE UPDATE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: mfc_staff handle_staff_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_staff_update BEFORE UPDATE ON public.mfc_staff FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: users handle_user_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_user_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_audit_stamps();


--
-- Name: users initialize_balance_for_new_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER initialize_balance_for_new_user AFTER INSERT ON public.users FOR EACH ROW EXECUTE FUNCTION public.initialize_user_balance();


--
-- Name: daily_bills on_bill_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_bill_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: chalans on_chalan_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_chalan_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: customer_payments on_customer_payment_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_customer_payment_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: deleted_records on_delete_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_delete_notify_user AFTER INSERT ON public.deleted_records FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: quotes on_quote_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_quote_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: quote_items on_quote_item_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_quote_item_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: sale_transactions on_sale_tx_change_notify_users; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_sale_tx_change_notify_users AFTER INSERT OR DELETE OR UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: seller_payments on_seller_payment_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_seller_payment_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: stock_batches on_stock_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_stock_change_notify_user AFTER INSERT OR DELETE OR UPDATE ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: users on_user_change_notify_user; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_user_change_notify_user AFTER INSERT OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.notify_user_of_record_change();


--
-- Name: stock_batches set_batch_code_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_batch_code_trigger BEFORE INSERT ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.set_stock_batch_code();


--
-- Name: chalans track_chalan_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_chalan_deletion BEFORE DELETE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: customer_payments track_customer_payment_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_customer_payment_deletion BEFORE DELETE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: daily_bills track_daily_bill_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_daily_bill_deletion BEFORE DELETE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: products track_product_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_product_deletion BEFORE DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: quotes track_quote_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_quote_deletion BEFORE DELETE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: quote_items track_quote_item_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_quote_item_deletion BEFORE DELETE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: public_registrations track_registration_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_registration_deletion BEFORE DELETE ON public.public_registrations FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: sale_transactions track_sale_transaction_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_sale_transaction_deletion BEFORE DELETE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: seller_payments track_seller_payment_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_seller_payment_deletion BEFORE DELETE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: mfc_staff track_staff_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_staff_deletion BEFORE DELETE ON public.mfc_staff FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: stock_batches track_stock_batch_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_stock_batch_deletion BEFORE DELETE ON public.stock_batches FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: users track_user_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER track_user_deletion BEFORE DELETE ON public.users FOR EACH ROW EXECUTE FUNCTION public.track_deletion();


--
-- Name: daily_bills trg_enqueue_bill_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enqueue_bill_notification AFTER INSERT OR UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.enqueue_user_notification_outbox();


--
-- Name: chalans trg_enqueue_chalan_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enqueue_chalan_notification AFTER INSERT OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.enqueue_user_notification_outbox();


--
-- Name: customer_payments trg_enqueue_customer_payment_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enqueue_customer_payment_notification AFTER INSERT ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.enqueue_user_notification_outbox();


--
-- Name: seller_payments trg_enqueue_seller_payment_notification; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_enqueue_seller_payment_notification AFTER INSERT ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.enqueue_user_notification_outbox();


--
-- Name: sale_transactions trigger_recalc_parents; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_recalc_parents AFTER INSERT OR DELETE OR UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_financials_from_sale();


--
-- Name: chalans trigger_set_chalan_calcs; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_chalan_calcs BEFORE INSERT OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.trigger_set_chalan_calculations();


--
-- Name: sale_transactions trigger_set_sale_amount; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_set_sale_amount BEFORE INSERT OR UPDATE ON public.sale_transactions FOR EACH ROW EXECUTE FUNCTION public.trigger_set_sale_transaction_amount();


--
-- Name: mfc_staff trigger_sync_default_admin_on_staff_change; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_sync_default_admin_on_staff_change AFTER INSERT OR UPDATE OF is_default_admin ON public.mfc_staff FOR EACH STATEMENT EXECUTE FUNCTION public.sync_system_config_default_admin();


--
-- Name: daily_bills trigger_update_customer_balance_bill; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_customer_balance_bill AFTER INSERT OR DELETE OR UPDATE ON public.daily_bills FOR EACH ROW EXECUTE FUNCTION public.update_customer_balance();


--
-- Name: customer_payments trigger_update_customer_balance_payment; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_customer_balance_payment AFTER INSERT OR DELETE OR UPDATE ON public.customer_payments FOR EACH ROW EXECUTE FUNCTION public.update_customer_balance();


--
-- Name: chalans trigger_update_seller_balance_chalan; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_seller_balance_chalan AFTER INSERT OR DELETE OR UPDATE ON public.chalans FOR EACH ROW EXECUTE FUNCTION public.update_seller_balance();


--
-- Name: seller_payments trigger_update_seller_balance_payment; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_update_seller_balance_payment AFTER INSERT OR DELETE OR UPDATE ON public.seller_payments FOR EACH ROW EXECUTE FUNCTION public.update_seller_balance();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chalans chalans_mfc_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_mfc_seller_id_fkey FOREIGN KEY (mfc_seller_id) REFERENCES public.mfc_staff(id);


--
-- Name: chalans chalans_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT chalans_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id);


--
-- Name: customer_balance customer_balance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_balance
    ADD CONSTRAINT customer_balance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: customer_payments customer_payments_daily_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT customer_payments_daily_bill_id_fkey FOREIGN KEY (daily_bill_id) REFERENCES public.daily_bills(id);


--
-- Name: daily_bills daily_bills_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT daily_bills_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: fcm_device_tokens fcm_device_tokens_user_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fcm_device_tokens
    ADD CONSTRAINT fcm_device_tokens_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chalans fk_chalans_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chalans
    ADD CONSTRAINT fk_chalans_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: customer_payments fk_customer_payments_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customer_payments
    ADD CONSTRAINT fk_customer_payments_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: daily_bills fk_daily_bills_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_bills
    ADD CONSTRAINT fk_daily_bills_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: system_config fk_default_admin; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT fk_default_admin FOREIGN KEY (default_admin_id) REFERENCES public.mfc_staff(id) ON DELETE RESTRICT;


--
-- Name: system_config fk_mfc_stock_buyer; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT fk_mfc_stock_buyer FOREIGN KEY (mfc_stock_buyer_id) REFERENCES public.users(id);


--
-- Name: products fk_products_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk_products_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: quotes fk_quotes_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT fk_quotes_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: sale_transactions fk_sale_transactions_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT fk_sale_transactions_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: seller_payments fk_seller_payments_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_payments
    ADD CONSTRAINT fk_seller_payments_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: stock_batches fk_stock_batches_created_by_mfc_staff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT fk_stock_batches_created_by_mfc_staff FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id);


--
-- Name: stock_batches fk_stock_batches_mfc_seller; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT fk_stock_batches_mfc_seller FOREIGN KEY (mfc_seller_id) REFERENCES public.mfc_staff(id);


--
-- Name: manager_spendings manager_spendings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_spendings
    ADD CONSTRAINT manager_spendings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.mfc_staff(id) ON DELETE SET NULL;


--
-- Name: manager_spendings manager_spendings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_spendings
    ADD CONSTRAINT manager_spendings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.mfc_staff(id) ON DELETE SET NULL;


--
-- Name: mfc_staff mfc_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mfc_staff
    ADD CONSTRAINT mfc_staff_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: notification_outbox notification_outbox_user_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_outbox
    ADD CONSTRAINT notification_outbox_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: public_registrations public_registrations_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_registrations
    ADD CONSTRAINT public_registrations_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: public_registrations public_registrations_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.public_registrations
    ADD CONSTRAINT public_registrations_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.mfc_staff(id);


--
-- Name: quote_items quote_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: quote_items quote_items_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES public.quotes(id) ON DELETE CASCADE;


--
-- Name: quotes quotes_assigned_mfc_seller_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_assigned_mfc_seller_id_fkey FOREIGN KEY (assigned_mfc_seller_id) REFERENCES public.mfc_staff(id);


--
-- Name: quotes quotes_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotes
    ADD CONSTRAINT quotes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: sale_transactions sale_transactions_chalan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_chalan_id_fkey FOREIGN KEY (chalan_id) REFERENCES public.chalans(id) ON DELETE CASCADE;


--
-- Name: sale_transactions sale_transactions_daily_bill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_daily_bill_id_fkey FOREIGN KEY (daily_bill_id) REFERENCES public.daily_bills(id) ON DELETE CASCADE;


--
-- Name: sale_transactions sale_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: sale_transactions sale_transactions_stock_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sale_transactions
    ADD CONSTRAINT sale_transactions_stock_batch_id_fkey FOREIGN KEY (stock_batch_id) REFERENCES public.stock_batches(id);


--
-- Name: seller_balance seller_balance_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_balance
    ADD CONSTRAINT seller_balance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: seller_payments seller_payments_chalan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seller_payments
    ADD CONSTRAINT seller_payments_chalan_id_fkey FOREIGN KEY (chalan_id) REFERENCES public.chalans(id);


--
-- Name: stock_batches stock_batches_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_batches stock_batches_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_batches
    ADD CONSTRAINT stock_batches_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.users(id);


--
-- Name: users users_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: chalans Admin full access on chalans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on chalans" ON public.chalans USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: customer_balance Admin full access on customer_balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on customer_balance" ON public.customer_balance USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: customer_payments Admin full access on customer_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on customer_payments" ON public.customer_payments USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: daily_bills Admin full access on daily_bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on daily_bills" ON public.daily_bills USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: deleted_records Admin full access on deleted_records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on deleted_records" ON public.deleted_records USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: fcm_device_tokens Admin full access on fcm_device_tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on fcm_device_tokens" ON public.fcm_device_tokens USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: manager_spendings Admin full access on manager_spendings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on manager_spendings" ON public.manager_spendings USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: mfc_staff Admin full access on mfc_staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on mfc_staff" ON public.mfc_staff USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: notification_outbox Admin full access on notification_outbox; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on notification_outbox" ON public.notification_outbox USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: products Admin full access on products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on products" ON public.products USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: public_registrations Admin full access on public_registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on public_registrations" ON public.public_registrations USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: quote_items Admin full access on quote_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on quote_items" ON public.quote_items USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: quotes Admin full access on quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on quotes" ON public.quotes USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: sale_transactions Admin full access on sale_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on sale_transactions" ON public.sale_transactions USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: seller_balance Admin full access on seller_balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on seller_balance" ON public.seller_balance USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: seller_payments Admin full access on seller_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on seller_payments" ON public.seller_payments USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: stock_batches Admin full access on stock_batches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on stock_batches" ON public.stock_batches USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: system_config Admin full access on system_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on system_config" ON public.system_config USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: users Admin full access on users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access on users" ON public.users USING (public.check_user_role(ARRAY['admin'::text])) WITH CHECK (public.check_user_role(ARRAY['admin'::text]));


--
-- Name: public_registrations Anyone can insert registration; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert registration" ON public.public_registrations FOR INSERT WITH CHECK (true);


--
-- Name: mfc_staff Authenticated read access on mfc_staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read access on mfc_staff" ON public.mfc_staff FOR SELECT TO authenticated USING (true);


--
-- Name: products Authenticated read access on products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read access on products" ON public.products FOR SELECT TO authenticated USING (true);


--
-- Name: system_config Authenticated read access on system_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated read access on system_config" ON public.system_config FOR SELECT TO authenticated USING (true);


--
-- Name: quotes MFC Seller read assigned quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "MFC Seller read assigned quotes" ON public.quotes FOR SELECT USING ((assigned_mfc_seller_id = auth.uid()));


--
-- Name: chalans MFC Seller read own chalans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "MFC Seller read own chalans" ON public.chalans FOR SELECT USING ((mfc_seller_id = auth.uid()));


--
-- Name: sale_transactions MFC Seller read own sale transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "MFC Seller read own sale transactions" ON public.sale_transactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chalans c
  WHERE ((c.id = sale_transactions.chalan_id) AND (c.mfc_seller_id = auth.uid())))));


--
-- Name: stock_batches MFC Seller read own stock batches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "MFC Seller read own stock batches" ON public.stock_batches FOR SELECT USING ((mfc_seller_id = auth.uid()));


--
-- Name: quote_items MFC Seller read quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "MFC Seller read quote items" ON public.quote_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_items.quote_id) AND (q.assigned_mfc_seller_id = auth.uid())))));


--
-- Name: users Manager update access on users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Manager update access on users" ON public.users FOR UPDATE USING ((public.get_my_staff_role() = 'manager'::text));


--
-- Name: chalans Staff insert access on chalans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on chalans" ON public.chalans FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: customer_balance Staff insert access on customer_balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on customer_balance" ON public.customer_balance FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: customer_payments Staff insert access on customer_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on customer_payments" ON public.customer_payments FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: daily_bills Staff insert access on daily_bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on daily_bills" ON public.daily_bills FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: deleted_records Staff insert access on deleted_records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on deleted_records" ON public.deleted_records FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: fcm_device_tokens Staff insert access on fcm_device_tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on fcm_device_tokens" ON public.fcm_device_tokens FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: manager_spendings Staff insert access on manager_spendings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on manager_spendings" ON public.manager_spendings FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: products Staff insert access on products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on products" ON public.products FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: public_registrations Staff insert access on public_registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on public_registrations" ON public.public_registrations FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: quote_items Staff insert access on quote_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on quote_items" ON public.quote_items FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: quotes Staff insert access on quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on quotes" ON public.quotes FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: sale_transactions Staff insert access on sale_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on sale_transactions" ON public.sale_transactions FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: seller_balance Staff insert access on seller_balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on seller_balance" ON public.seller_balance FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: seller_payments Staff insert access on seller_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on seller_payments" ON public.seller_payments FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: stock_batches Staff insert access on stock_batches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on stock_batches" ON public.stock_batches FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: system_config Staff insert access on system_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on system_config" ON public.system_config FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: users Staff insert access on users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff insert access on users" ON public.users FOR INSERT WITH CHECK (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: chalans Staff read access on chalans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on chalans" ON public.chalans FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: customer_balance Staff read access on customer_balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on customer_balance" ON public.customer_balance FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: customer_payments Staff read access on customer_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on customer_payments" ON public.customer_payments FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: daily_bills Staff read access on daily_bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on daily_bills" ON public.daily_bills FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: deleted_records Staff read access on deleted_records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on deleted_records" ON public.deleted_records FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: fcm_device_tokens Staff read access on fcm_device_tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on fcm_device_tokens" ON public.fcm_device_tokens FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: manager_spendings Staff read access on manager_spendings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on manager_spendings" ON public.manager_spendings FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: mfc_staff Staff read access on mfc_staff; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on mfc_staff" ON public.mfc_staff FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: notification_outbox Staff read access on notification_outbox; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on notification_outbox" ON public.notification_outbox FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: products Staff read access on products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on products" ON public.products FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: public_registrations Staff read access on public_registrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on public_registrations" ON public.public_registrations FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: quote_items Staff read access on quote_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on quote_items" ON public.quote_items FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: quotes Staff read access on quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on quotes" ON public.quotes FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: sale_transactions Staff read access on sale_transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on sale_transactions" ON public.sale_transactions FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: seller_balance Staff read access on seller_balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on seller_balance" ON public.seller_balance FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: seller_payments Staff read access on seller_payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on seller_payments" ON public.seller_payments FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: stock_batches Staff read access on stock_batches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on stock_batches" ON public.stock_batches FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: system_config Staff read access on system_config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on system_config" ON public.system_config FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: users Staff read access on users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff read access on users" ON public.users FOR SELECT USING (public.check_user_role(ARRAY['admin'::text, 'manager'::text]));


--
-- Name: chalans User read own chalans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own chalans" ON public.chalans FOR SELECT USING ((seller_id = public.get_my_user_id()));


--
-- Name: customer_balance User read own customer balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own customer balance" ON public.customer_balance FOR SELECT USING ((user_id = public.get_my_user_id()));


--
-- Name: customer_payments User read own customer payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own customer payments" ON public.customer_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.daily_bills db
  WHERE ((db.id = customer_payments.daily_bill_id) AND (db.customer_id = public.get_my_user_id())))));


--
-- Name: daily_bills User read own daily bills; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own daily bills" ON public.daily_bills FOR SELECT USING ((customer_id = public.get_my_user_id()));


--
-- Name: users User read own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own profile" ON public.users FOR SELECT USING ((auth_user_id = auth.uid()));


--
-- Name: quote_items User read own quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own quote items" ON public.quote_items FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.quotes q
  WHERE ((q.id = quote_items.quote_id) AND (q.customer_id = public.get_my_user_id())))));


--
-- Name: quotes User read own quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own quotes" ON public.quotes FOR SELECT USING ((customer_id = public.get_my_user_id()));


--
-- Name: sale_transactions User read own sale transactions (buyer); Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own sale transactions (buyer)" ON public.sale_transactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.daily_bills db
  WHERE ((db.id = sale_transactions.daily_bill_id) AND (db.customer_id = public.get_my_user_id())))));


--
-- Name: sale_transactions User read own sale transactions (seller); Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own sale transactions (seller)" ON public.sale_transactions FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chalans c
  WHERE ((c.id = sale_transactions.chalan_id) AND (c.seller_id = public.get_my_user_id())))));


--
-- Name: seller_balance User read own seller balance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own seller balance" ON public.seller_balance FOR SELECT USING ((user_id = public.get_my_user_id()));


--
-- Name: seller_payments User read own seller payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User read own seller payments" ON public.seller_payments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.chalans c
  WHERE ((c.id = seller_payments.chalan_id) AND (c.seller_id = public.get_my_user_id())))));


--
-- Name: deleted_records User view own deleted records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User view own deleted records" ON public.deleted_records FOR SELECT USING (((record_owner_auth_id = auth.uid()) OR (public.get_my_staff_role() = ANY (ARRAY['admin'::text, 'manager'::text]))));


--
-- Name: fcm_device_tokens User view own tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "User view own tokens" ON public.fcm_device_tokens FOR SELECT USING ((user_auth_id = auth.uid()));


--
-- Name: chalans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chalans ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_balance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customer_balance ENABLE ROW LEVEL SECURITY;

--
-- Name: customer_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_bills; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_bills ENABLE ROW LEVEL SECURITY;

--
-- Name: deleted_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deleted_records ENABLE ROW LEVEL SECURITY;

--
-- Name: fcm_device_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fcm_device_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: manager_spendings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.manager_spendings ENABLE ROW LEVEL SECURITY;

--
-- Name: mfc_staff; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mfc_staff ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_outbox; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_outbox ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: public_registrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.public_registrations ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

--
-- Name: quotes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

--
-- Name: sale_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sale_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: seller_balance; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seller_balance ENABLE ROW LEVEL SECURITY;

--
-- Name: seller_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seller_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_batches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_batches ENABLE ROW LEVEL SECURITY;

--
-- Name: system_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: powersync; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION powersync WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: powersync chalans; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.chalans;


--
-- Name: supabase_realtime chalans; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.chalans;


--
-- Name: powersync customer_balance; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.customer_balance;


--
-- Name: supabase_realtime customer_balance; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.customer_balance;


--
-- Name: powersync customer_payments; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.customer_payments;


--
-- Name: supabase_realtime customer_payments; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.customer_payments;


--
-- Name: powersync daily_bills; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.daily_bills;


--
-- Name: supabase_realtime daily_bills; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.daily_bills;


--
-- Name: supabase_realtime deleted_records; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.deleted_records;


--
-- Name: supabase_realtime fcm_device_tokens; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.fcm_device_tokens;


--
-- Name: powersync manager_spendings; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.manager_spendings;


--
-- Name: powersync mfc_staff; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.mfc_staff;


--
-- Name: supabase_realtime mfc_staff; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.mfc_staff;


--
-- Name: powersync products; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.products;


--
-- Name: supabase_realtime products; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.products;


--
-- Name: powersync public_registrations; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.public_registrations;


--
-- Name: supabase_realtime public_registrations; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.public_registrations;


--
-- Name: powersync quote_items; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.quote_items;


--
-- Name: supabase_realtime quote_items; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.quote_items;


--
-- Name: powersync quotes; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.quotes;


--
-- Name: supabase_realtime quotes; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.quotes;


--
-- Name: powersync sale_transactions; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.sale_transactions;


--
-- Name: supabase_realtime sale_transactions; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.sale_transactions;


--
-- Name: powersync seller_balance; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.seller_balance;


--
-- Name: supabase_realtime seller_balance; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.seller_balance;


--
-- Name: powersync seller_payments; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.seller_payments;


--
-- Name: supabase_realtime seller_payments; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.seller_payments;


--
-- Name: powersync stock_batches; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.stock_batches;


--
-- Name: supabase_realtime stock_batches; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.stock_batches;


--
-- Name: powersync system_config; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.system_config;


--
-- Name: supabase_realtime system_config; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.system_config;


--
-- Name: powersync users; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION powersync ADD TABLE ONLY public.users;


--
-- Name: supabase_realtime users; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.users;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- Name: dashboard_stats_for_admin; Type: MATERIALIZED VIEW DATA; Schema: public; Owner: -
--

REFRESH MATERIALIZED VIEW public.dashboard_stats_for_admin;


--
-- PostgreSQL database dump complete
--

\unrestrict rVgSbhr9XvHKHCngiT9dnqJDCsBXWTpgUXEf1rrAYWLjUVEW8OcI97rGL0tsW9s

