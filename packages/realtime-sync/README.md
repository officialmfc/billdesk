# @mfc/realtime-sync

Unified realtime sync engine with IndexedDB and Supabase integration. This package consolidates `@mfc/dexigo`, `@mfc/dexigo-react`, and `@mfc/sync` into a single, reusable, and configurable solution.

## Features

- ✅ **Bidirectional Sync**: Sync data between IndexedDB and Supabase
- ✅ **Realtime Updates**: Automatic sync on database changes
- ✅ **Strategy Pattern**: Easily configure different sync strategies
- ✅ **React Integration**: Ready-to-use React hooks and providers
- ✅ **Offline-First**: Works completely offline with automatic sync when online
- ✅ **Type-Safe**: Full TypeScript support
- ✅ **Performance Optimized**: Name caching, retry logic, and batch operations
- ✅ **Configurable**: Easy to extend and customize

## Installation

```bash
pnpm add @mfc/realtime-sync
```

## Quick Start

### 1. Create a Strategy

```typescript
import { createManagerStrategy } from '@mfc/realtime-sync';
import { createClient } from '@mfc/supabase-config';
import { db } from '@mfc/database';

const supabase = createClient();
const strategy = createManagerStrategy(supabase, db);
```

### 2. Wrap Your App with Provider

```typescript
import { RealtimeSyncProvider } from '@mfc/realtime-sync/react';

function App() {
  return (
    <RealtimeSyncProvider
      supabaseClient={supabase}
      database={db}
      strategy={strategy}
      autoSync={true}
    >
      <YourApp />
    </RealtimeSyncProvider>
  );
}
```

### 3. Use the Hook

```typescript
import { useRealtimeSync } from '@mfc/realtime-sync/react';

function MyComponent() {
  const { isSyncing, syncNow, lastSyncTime, isOnline } = useRealtimeSync();

  return (
    <div>
      <button onClick={syncNow} disabled={isSyncing}>
        {isSyncing ? 'Syncing...' : 'Sync Now'}
      </button>
      {lastSyncTime && <p>Last sync: {lastSyncTime.toLocaleString()}</p>}
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
    </div>
  );
}
```

## Creating Custom Strategies

### Extend BaseStrategy

```typescript
import { BaseStrategy } from '@mfc/realtime-sync';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { MFCBillDeskDB } from '@mfc/database';
import type { StrategyConfig, SyncTransformContext } from '@mfc/realtime-sync';

export class CustomStrategy extends BaseStrategy {
  constructor(supabase: SupabaseClient, db: MFCBillDeskDB) {
    const config: StrategyConfig = {
      tables: {
        users: {
          columns: 'id, name, email, updated_at',
          enabled: true,
          filter: (query, context) => {
            // Add custom filters
            if (context?.userId) {
              return query.eq('id', context.userId);
            }
            return query;
          },
          transform: async (record, context) => {
            // Transform record before storing
            return {
              ...record,
              display_name: record.name || record.email,
            };
          },
        },
        // Add more tables...
      },
      realtime: {
        channelName: 'my-custom-channel',
        eventName: 'postgres_changes',
        channelType: 'postgres_changes',
        tables: ['users'],
      },
      excludeColumns: ['password', 'secret_key'],
    };

    super(supabase, db, config);
  }

  protected getTransformContext(): SyncTransformContext {
    return {
      supabase: this.supabase,
      db: this.db,
      cache: new Map(),
    };
  }
}
```

## Advanced Usage

### Manual Sync Control

```typescript
import { createSyncEngine } from '@mfc/realtime-sync/core';

const syncEngine = createSyncEngine({
  supabaseClient: supabase,
  database: db,
  strategy: strategy,
  onSyncStart: () => console.log('Sync started'),
  onSyncComplete: () => console.log('Sync completed'),
  onSyncError: (error) => console.error('Sync error:', error),
  onSyncProgress: (progress) => {
    console.log(`Syncing ${progress.currentTable} (${progress.completedTables}/${progress.totalTables})`);
  },
});

// Sync all tables
await syncEngine.fullSync();

// Sync specific table
await syncEngine.syncTable('users');

// Check if syncing
if (syncEngine.isSyncInProgress()) {
  console.log('Sync in progress...');
}

// Get metrics
const metrics = syncEngine.getMetrics();
console.log('Sync metrics:', metrics);

// Cleanup
syncEngine.cleanup();
```

### Realtime Only

```typescript
import { createRealtimeManager } from '@mfc/realtime-sync/realtime';

const realtimeManager = createRealtimeManager({
  supabaseClient: supabase,
  realtimeConfig: {
    channelName: 'my-channel',
    eventName: 'postgres_changes',
    channelType: 'postgres_changes',
    tables: ['users', 'products'],
  },
  onEvent: (payload) => {
    console.log('Realtime event:', payload);
    // Handle the event
  },
});

// Initialize
await realtimeManager.initialize();

// Cleanup
await realtimeManager.cleanup();
```

## Configuration Options

### SyncServiceConfig

```typescript
interface SyncServiceConfig {
  supabaseClient: SupabaseClient;
  database: MFCBillDeskDB;
  strategy: ISyncStrategy;
  context?: SyncQueryContext; // e.g., { userId: '123' }
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
  onSyncProgress?: (progress: SyncProgress) => void;
}
```

### StrategyConfig

```typescript
interface StrategyConfig {
  tables: Record<string, TableSyncConfig>;
  realtime: RealtimeConfig;
  excludeColumns?: string[];
}

interface TableSyncConfig {
  columns: string | string[];
  filter?: (query: any, context?: SyncQueryContext) => any;
  transform?: (record: any, context: SyncTransformContext) => Promise<any>;
  enabled: boolean;
  dependsOn?: string[];
}
```

### RealtimeConfig

```typescript
interface RealtimeConfig {
  channelName: string | ((context?: SyncQueryContext) => string);
  eventName: string;
  channelType?: 'postgres_changes' | 'broadcast';
  tables?: string[];
}
```

## Best Practices

1. **Use Strategy Pattern**: Create separate strategies for different user types (manager, user, admin)
2. **Enable Auto-Sync**: Let the provider handle sync automatically
3. **Handle Errors**: Always provide error callbacks
4. **Cache Names**: Use the built-in name cache for performance
5. **Cleanup**: Always cleanup resources on unmount
6. **Test Offline**: Test your app in offline mode
7. **Monitor Performance**: Use metrics to track sync performance

## Migration from Old Packages

### From @mfc/sync

```typescript
// Old
import { SyncProvider, useSync } from '@mfc/sync';

// New
import { RealtimeSyncProvider, useRealtimeSync } from '@mfc/realtime-sync/react';
```

### From @mfc/dexigo-react

```typescript
// Old
import { DexiGoProvider, useDexiGo } from '@mfc/dexigo-react';

// New - Use RealtimeSyncProvider instead
import { RealtimeSyncProvider } from '@mfc/realtime-sync/react';
```

## API Reference

### Hooks

- `useRealtimeSync()` - Access sync context

### Components

- `<RealtimeSyncProvider>` - Wrap your app

### Classes

- `SyncEngine` - Core sync engine
- `RealtimeManager` - Realtime subscription manager
- `BaseStrategy` - Base class for strategies
- `ManagerStrategy` - Pre-built manager strategy

### Utilities

- `NameCache` - Cache for name lookups
- `RetryStrategy` - Retry failed operations
- `PerformanceMonitor` - Track sync performance

## License

MIT
