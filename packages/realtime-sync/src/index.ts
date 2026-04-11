/**
 * @mfc/realtime-sync
 * Unified realtime sync engine with IndexedDB and Supabase integration
 */

// Core
export { SyncEngine, createSyncEngine } from './core/SyncEngine';

// Realtime
export { RealtimeManager, createRealtimeManager, REALTIME_EVENT_NAME } from './realtime/RealtimeManager';

// Strategies
export { BaseStrategy } from './strategies/BaseStrategy';
export { ManagerStrategy, createManagerStrategy } from './strategies/ManagerStrategy';
export {
    WebManagerTodayStrategy,
    createWebManagerTodayStrategy,
} from './strategies/WebManagerTodayStrategy';

// React
export { RealtimeSyncProvider, useRealtimeSync } from './react/RealtimeSyncProvider';
export type { RealtimeSyncContextType, RealtimeSyncProviderProps } from './react/RealtimeSyncProvider';

// Types
export type {
    ISyncStrategy,
    SyncQueryContext,
    SyncTransformContext,
    RealtimeConfig,
    SyncServiceConfig,
    SyncProgress,
    SyncMetrics,
    RealtimeEventPayload,
    TableSyncConfig,
    StrategyConfig,
} from './types';
export { SyncError, SyncErrorCode } from './types';

// Utils
export { NameCache, createNameCache, CacheKeys } from './utils/name-cache';
export { RetryStrategy, createRetryStrategy } from './utils/retry-strategy';
export { PerformanceMonitor } from './utils/performance-monitor';
