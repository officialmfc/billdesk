/**
 * Context Providers
 * App-level state management providers
 */

export {
    AppStateProvider,
    useAppState,
    useIsOnline,
    useIsSyncing as useAppIsSyncing,
    usePendingChanges,
    useCurrentUser,
    type AppState,
    type AppStateContextValue,
    type AppStateProviderProps,
} from './AppStateProvider';

export {
    SyncStatusProvider,
    useSyncStatus,
    useIsSyncing,
    useSyncProgress,
    useSyncError,
    useLastSyncTime,
    type SyncStatus,
    type SyncStatusContextValue,
    type SyncStatusProviderProps,
} from './SyncStatusProvider';

export {
    NotificationProvider,
    useNotifications,
    useNotify,
    type Notification,
    type NotificationType,
    type NotificationContextValue,
    type NotificationProviderProps,
} from './NotificationProvider';
