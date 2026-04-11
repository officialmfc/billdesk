# Electron Manager Client Contract

The future Electron manager app should use the same PowerSync Cloud service and the same `manger_data` stream as the mobile manager app.

## Shared rules

- read from PowerSync local SQLite
- write directly to Supabase
- do not use a queued-upload layer in this phase
- do not create a separate stream for Electron

## Why Electron shares `manger_data`

- one replicated manager read model
- same authorization boundary
- same sync rules deployment
- same publication in Supabase
- less drift between mobile and desktop manager behavior

## Recommended implementation shape

1. Restore Supabase auth session in Electron.
2. Connect the PowerSync SDK to the managed service.
3. Keep all list/detail reads on PowerSync SQLite.
4. Keep mutations on the existing Supabase RPC/table write flows.
5. Use PowerSync replication to converge the read-side cache after each write.

## Data ownership reminder

`mfc_staff` stays the canonical manager store.

Do not introduce a separate backend `managers` table for Electron.
