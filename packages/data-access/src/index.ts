/**
 * @mfc/data-access
 * 
 * Unified data access layer for MFC BillDesk
 */

// Core client
export { DataAccessClient } from './client';
export { CacheManager, generateCacheKey } from './cache';

// Types
export type {
    QueryOptions,
    MutationOptions,
    SubscriptionOptions,
    Subscription,
    UseQueryResult,
    UseMutationResult,
    CacheEntry,
    ICacheManager,
    SyncQueueItem,
    SyncResult,
    DataAccessConfig,
} from './types';

export {
    DataAccessError,
    NetworkError,
    ValidationError,
    PermissionError,
    ConflictError,
    DatabaseError,
    SyncError,
} from './types';

// Error logging
export { errorLogger, logError } from './error-logger';
export type { ErrorLogEntry } from './error-logger';

// React hooks
export {
    useQuery,
    useMutation,
    useDataAccess,
    DataAccessProvider,
    DataAccessContext,
} from './hooks';

// Context providers
export {
    AppStateProvider,
    useAppState,
    useIsOnline,
    useAppIsSyncing,
    usePendingChanges,
    useCurrentUser,
    SyncStatusProvider,
    useSyncStatus,
    useIsSyncing,
    useSyncProgress,
    useSyncError,
    useLastSyncTime,
    NotificationProvider,
    useNotifications,
    useNotify,
    type AppState,
    type AppStateContextValue,
    type SyncStatus,
    type SyncStatusContextValue,
    type Notification,
    type NotificationType,
    type NotificationContextValue,
} from './providers';

// Create singleton instance (optional, for direct usage)
import { DataAccessClient } from './client';
import { createClient } from '@mfc/supabase-config';
import { db } from '@mfc/database';

let dalInstance: DataAccessClient | null = null;

/**
 * Get or create the singleton DAL instance
 * Use this for direct access outside of React components
 */
export function getDAL(): DataAccessClient {
    if (!dalInstance) {
        dalInstance = new DataAccessClient({
            supabase: createClient(),
            indexedDB: db,
            defaultCacheTTL: 30000,
            enableSync: true,
            enableRealtime: true,
        });
    }
    return dalInstance;
}

/**
 * Singleton instance for convenience
 * Use hooks in React components instead
 */
export const dal = getDAL();
