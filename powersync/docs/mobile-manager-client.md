# Mobile Manager Client Contract

This document defines the read/write contract for the React Native manager app when it moves to PowerSync.

## Read path

- Connect the mobile app to the managed PowerSync service.
- Authenticate with Supabase Auth.
- Read all offline-capable manager data from the auto-subscribed `manger_data` stream stored in local PowerSync SQLite.

The local read model should cover:

- users
- mfc_staff
- products
- stock_batches
- daily_bills
- chalans
- sale_transactions
- customer_payments
- seller_payments
- quotes
- quote_items
- customer_balance
- seller_balance
- public_registrations when approvals stay client-visible
- system_config when manager clients need shared config

## Write path

- Keep writes on the existing direct Supabase flows:
  - RPC calls
  - direct table writes where already used
- Do not use the PowerSync upload queue in this phase.
- If the app is offline, disable or fail writes instead of queueing them.

## Expected initialization flow

1. Restore Supabase session.
2. Open the PowerSync local database.
3. Connect PowerSync using the authenticated Supabase identity.
4. Wait for the initial `manger_data` sync to complete.
5. Render all list/detail screens from local PowerSync SQLite.

## UI consistency rules

- treat PowerSync SQLite as the persisted read source of truth
- after a direct Supabase write succeeds, refresh UI optimistically if needed
- expect PowerSync replication to converge the authoritative local row afterward

## Shared stream

The mobile app and the future Electron app must both target the same stream definition:

- stream name: `manger_data`
- manager-only access
- same table contract
