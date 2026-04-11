# Database Package Migration Notes

## Overview

The `@mfc/database` package has been refactored to focus solely on schema and type definitions. Business logic has been removed from this package and should be implemented in `@mfc/data-access`.

## Deprecated Files

The following files contain business logic and should NOT be used directly. They are kept temporarily for backward compatibility but will be removed in a future version:

### `src/helpers.ts`
Contains sync settings and metadata management functions. These should be moved to `@mfc/data-access`:
- `isAutoSyncEnabled()` → Move to sync coordinator
- `setAutoSync()` → Move to sync coordinator
- `getSyncSettings()` → Move to sync coordinator
- `updateSyncSettings()` → Move to sync coordinator
- `shouldAutoUpload()` → Move to sync coordinator
- `getLastSyncTime()` → Move to sync coordinator
- `updateSyncMetadata()` → Move to sync coordinator

### `src/utils.ts`
Contains database utility functions. These should be moved to `@mfc/data-access`:
- `clearAllData()` → Move to data access client
- `exportData()` → Move to data access client
- `getDatabaseSize()` → Move to data access client
- `formatBytes()` → Move to `@mfc/utils`
- `getDatabaseStats()` → Move to data access client
- `compactDatabase()` → Move to data access client

### `src/db-utils.ts`
Contains low-level database operations. These should be moved to `@mfc/data-access`:
- `bulkUpsert()` → Move to data access client
- `clearTable()` → Move to data access client
- `getTableCount()` → Move to data access client
- `exportTableToJSON()` → Move to data access client
- `importFromJSON()` → Move to data access client
- `getMigrationVersion()` → Already available in migrations.ts
- `runMigrations()` → Already available in migrations.ts

### `src/settings-helpers.ts`
Contains settings management functions. These should be moved to `@mfc/data-access`:
- `getAutoUploadSettings()` → Move to sync coordinator
- `setAutoUploadSettings()` → Move to sync coordinator
- `updateAutoUploadSetting()` → Move to sync coordinator

## Migration Path

1. **Phase 1** (Current): Remove these files from main exports in `index.ts`
2. **Phase 2**: Implement equivalent functionality in `@mfc/data-access`
3. **Phase 3**: Update all consumers to use `@mfc/data-access` instead
4. **Phase 4**: Delete deprecated files

## What Remains in @mfc/database

- `schema.ts` - IndexedDB schema and type definitions
- `migrations.ts` - Schema versioning and migration logic
- `instance.ts` - Database singleton instance
- `types/` - Type definitions for domain entities
- `index.ts` - Clean exports of schema, types, and migrations only

## Usage After Migration

```typescript
// ✅ Correct - Use for schema and types only
import { db, LocalUser, LocalProduct } from '@mfc/database';

// ❌ Incorrect - Don't use for business logic
import { clearAllData, getSyncSettings } from '@mfc/database';

// ✅ Correct - Use data-access for business logic
import { dataAccess } from '@mfc/data-access';
await dataAccess.clearAllData();
await dataAccess.getSyncSettings();
```
