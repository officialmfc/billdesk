# PowerSync Manager Read Model

This folder is the canonical PowerSync Cloud setup for manager-facing clients.

Current decisions:

- Sync stream name: `manger_data`
- Read source of truth for:
  - React Native manager app next
  - future Electron manager app
- Writes do not go through PowerSync
  - all writes stay direct to Supabase RPCs / table mutations
  - PowerSync only mirrors those writes back into the read model
- Web manager does not use PowerSync
  - web stays on Dexie for lookup data + Kolkata-today operational rows
  - older/historical reads go direct to Supabase

Folder layout:

- [`.env.example`](/Users/as/workspace/billdesk/powersync/.env.example)
- [`sql/01_create_powersync_role.sql`](/Users/as/workspace/billdesk/powersync/sql/01_create_powersync_role.sql)
- [`sql/02_update_powersync_publication.sql`](/Users/as/workspace/billdesk/powersync/sql/02_update_powersync_publication.sql)
- [`sync-rules/manger_data.yaml`](/Users/as/workspace/billdesk/powersync/sync-rules/manger_data.yaml)
- [`docs/managed-hosting.md`](/Users/as/workspace/billdesk/powersync/docs/managed-hosting.md)
- [`docs/mobile-manager-client.md`](/Users/as/workspace/billdesk/powersync/docs/mobile-manager-client.md)
- [`docs/electron-manager-client.md`](/Users/as/workspace/billdesk/powersync/docs/electron-manager-client.md)

Apply order:

1. Run [`sql/01_create_powersync_role.sql`](/Users/as/workspace/billdesk/powersync/sql/01_create_powersync_role.sql)
2. Run [`sql/02_update_powersync_publication.sql`](/Users/as/workspace/billdesk/powersync/sql/02_update_powersync_publication.sql)
3. Create the managed PowerSync Cloud instance using [`docs/managed-hosting.md`](/Users/as/workspace/billdesk/powersync/docs/managed-hosting.md)
4. Upload the contents of [`sync-rules/manger_data.yaml`](/Users/as/workspace/billdesk/powersync/sync-rules/manger_data.yaml) into the PowerSync Cloud sync-config editor for the service
5. Point mobile/Electron clients at the resulting PowerSync endpoint

Important:

- `mfc_staff` remains the canonical manager store
- there is no backend `managers` table
- only active `manager` users should auto-subscribe to the `manger_data` stream
- this repo path is the canonical source file; PowerSync Cloud does not read it from Git automatically
