# Migration Guide: Manager App to @mfc/realtime-sync

## Step-by-Step Migration

### 1. Update Package Dependencies

```json
// apps/web/manager/package.json
{
  "dependencies": {
    "@mfc/realtime-sync": "workspace:*"
    // Remove these:
    // "@mfc/dexigo": "workspace:*",
    // "@mfc/dexigo-react": "workspace:*",
    // "@mfc/sync": "workspace:*"
  }
}
```

### 2. Replace SyncProviderWrapper

**Old File**: `apps/web/manager/src/components/providers/SyncProviderWrapper.tsx`

```typescript
// DELETE THIS FILE - No longer needed
```

**New Usage**: In your layout file

```typescript
// apps/web/manager/src/app/(portal)/layout.tsx
import { RealtimeSyncProvider } from "@mfc/realtime-sync/react";
import { createManagerStrategy } from "@mfc/realtime-sync";
import { createClient } from "@mfc/supabase-config";
import { db } from "@mfc/database";

export default function PortalLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const strategy = createManagerStrategy(supabase, db);

  return (
    <RealtimeSyncProvider
      supabaseClient={supabase}
      database={db}
      strategy={strategy}
      autoSync={true}
    >
      {children}
    </RealtimeSyncProvider>
  );
}
```

### 3. Update Component Imports

**Old**:

```typescript
import { useSync } from "@mfc/sync";

function MyComponent() {
  const { isSyncing, syncNow } = useSync();
  // ...
}
```

**New**:

```typescript
import { useRealtimeSync } from "@mfc/realtime-sync/react";

function MyComponent() {
  const { isSyncing, syncNow } = useRealtimeSync();
  // ...
}
```

### 4. Remove Old Sync Config

**Delete**: `apps/web/manager/src/config/sync-config.ts`

The configuration is now in the strategy itself.

### 5. Remove Old Sync Adapter

**Delete**: `apps/web/manager/src/lib/sync/sync-adapter.ts`

No longer needed - the strategy handles everything.

### 6. Update Layout Files

**File**: `apps/web/manager/src/components/layouts/DesktopPortalLayout.tsx`

```typescript
// Old
import { useSync } from "@mfc/sync";

// New
import { useRealtimeSync } from "@mfc/realtime-sync/react";

function DesktopPortalLayoutInner({ children }: { children: ReactNode }) {
  // Old
  const { syncNow, isSyncing } = useSync();

  // New
  const { syncNow, isSyncing } = useRealtimeSync();

  // Rest stays the same
}
```

### 7. Complete Example

Here's a complete example of the new portal layout:

```typescript
// apps/web/manager/src/app/(portal)/layout.tsx
"use client";

import { ReactNode, useMemo } from "react";
import dynamic from "next/dynamic";
import { useDeviceType } from "@/hooks/useDeviceType";
import { RealtimeSyncProvider } from "@mfc/realtime-sync/react";
import { createManagerStrategy } from "@mfc/realtime-sync";
import { createClient } from "@mfc/supabase-config";
import { db } from "@mfc/database";

const MobilePortalLayout = dynamic(
  () =>
    import("@/components/layouts/MobilePortalLayout").then((m) => ({
      default: m.MobilePortalLayout,
    })),
  { ssr: false }
);

const DesktopPortalLayout = dynamic(
  () =>
    import("@/components/layouts/DesktopPortalLayout").then((m) => ({
      default: m.DesktopPortalLayout,
    })),
  { ssr: false }
);

export default function PortalLayout({ children }: { children: ReactNode }) {
  const deviceType = useDeviceType();
  const supabase = useMemo(() => createClient(), []);
  const strategy = useMemo(
    () => createManagerStrategy(supabase, db),
    [supabase]
  );

  return (
    <RealtimeSyncProvider
      supabaseClient={supabase}
      database={db}
      strategy={strategy}
      autoSync={true}
    >
      {deviceType === "mobile" ? (
        <MobilePortalLayout>{children}</MobilePortalLayout>
      ) : (
        <DesktopPortalLayout>{children}</DesktopPortalLayout>
      )}
    </RealtimeSyncProvider>
  );
}
```

## Files to Delete

After migration, delete these files:

```
apps/web/manager/src/
├── components/providers/
│   └── SyncProviderWrapper.tsx          ❌ DELETE
├── config/
│   └── sync-config.ts                   ❌ DELETE
└── lib/sync/
    └── sync-adapter.ts                  ❌ DELETE
```

## Testing Checklist

After migration, test:

- [ ] App loads without errors
- [ ] Initial sync works on mount
- [ ] Manual sync button works
- [ ] Realtime updates work (test by updating a record in Supabase)
- [ ] Offline mode works (disconnect network)
- [ ] Reconnect sync works (reconnect network)
- [ ] No memory leaks (mount/unmount multiple times)
- [ ] Performance is good (check console for sync times)

## Troubleshooting

### Issue: "useRealtimeSync must be used within a RealtimeSyncProvider"

**Solution**: Make sure `RealtimeSyncProvider` wraps your component tree.

### Issue: Sync not working

**Solution**: Check browser console for errors. Verify:

1. Supabase client is initialized
2. Database is initialized
3. Strategy is created correctly
4. User is authenticated

### Issue: Realtime not working

**Solution**: Check:

1. Supabase realtime is enabled
2. Tables have realtime enabled in Supabase dashboard
3. RLS policies allow realtime access
4. Check browser console for realtime connection status

### Issue: Performance issues

**Solution**:

1. Check sync metrics: `syncEngine.getMetrics()`
2. Reduce number of tables if not needed
3. Use filters to reduce data
4. Check network tab for large queries

## Benefits After Migration

1. ✅ **Cleaner Code**: No more wrapper components
2. ✅ **Better Performance**: Optimized sync engine
3. ✅ **Type Safety**: Full TypeScript support
4. ✅ **Easier Debugging**: Better error messages
5. ✅ **More Flexible**: Easy to customize
6. ✅ **Better Docs**: Comprehensive documentation
7. ✅ **No Dead Code**: Only what you need

## Support

If you encounter issues:

1. Check the README.md
2. Check the examples in this guide
3. Check browser console for errors
4. Review the strategy configuration

## Next Steps

After successful migration:

1. Remove old packages from workspace
2. Update other apps (admin, user) when ready
3. Create custom strategies as needed
4. Enjoy the cleaner codebase!
