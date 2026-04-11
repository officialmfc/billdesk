# Managed PowerSync Cloud Setup

This follows the Supabase + PowerSync managed-hosting flow.

## 1. Prepare the database

Run these SQL files against the Supabase Postgres database in this order:

1. [`../sql/01_create_powersync_role.sql`](/Users/as/workspace/billdesk/powersync/sql/01_create_powersync_role.sql)
2. [`../sql/02_update_powersync_publication.sql`](/Users/as/workspace/billdesk/powersync/sql/02_update_powersync_publication.sql)

Use the direct database connection string from Supabase, not the pooled Postgres connection string.

## 2. Create the PowerSync Cloud service

In PowerSync Cloud:

1. Create a new service for the manager read model.
2. Choose PostgreSQL / Supabase as the source.
3. Use the Supabase direct Postgres connection string.
4. Set the replication role to `powersync_role`.
5. Point the service at the publication named `powersync`.

## 3. Enable Supabase Auth integration

In the PowerSync dashboard:

1. Enable the Supabase Auth integration.
2. Set the Supabase project URL.
3. Set the Supabase anon key.
4. Verify that PowerSync can resolve `request.user_id()` from the authenticated Supabase JWT.

This setup intentionally does not use a custom token function in the repo.

## 4. Upload the sync config

Open the PowerSync Cloud service's Sync Streams / Sync Config screen and paste/upload the contents of [`../sync-rules/manger_data.yaml`](/Users/as/workspace/billdesk/powersync/sync-rules/manger_data.yaml).

Keep the repo copy as the canonical source of truth, but note that PowerSync Cloud does not load this file automatically from your repository path.

Expected behavior:

- active `manager` users auto-subscribe to the `manger_data` stream
- inactive managers, non-managers, and unauthenticated users get no synced manager rows
- the stream contains the full manager read model

## 5. Validation checklist

- `powersync_role` can connect and replicate
- publication `powersync` is explicit and does not use `FOR ALL TABLES`
- Supabase Auth is enabled in PowerSync Cloud
- the sync config deploys cleanly with `config: edition: 3`
- an active manager login produces access to `manger_data`

## 6. Runtime contract

- reads come from PowerSync SQLite
- writes go directly to Supabase
- PowerSync mirrors those writes back into the local read model
- no PowerSync upload queue is used in this phase
