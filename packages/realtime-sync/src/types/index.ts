/**
 * Core Types for Realtime Sync
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MFCBillDeskDB } from '@mfc/database';

/**
 * Sync Strategy Interface
 * Defines how data should be fetched and transformed for a specific context
 */
export interface ISyncStrategy {
    /**
     * Get list of tables to sync
     */
    getTablesToSync(): string[];

    /**
     * Get Supabase query for a specific table
     */
    getTableQuery(
        tableName: string,
        lastSync: string | null,
        context?: SyncQueryContext
    ): any;

    /**
     * Transform a record before storing in IndexedDB
     */
    transformRecord(tableName: string, record: any): Promise<any>;

    /**
     * Get dependent tables that should be synced after this table
     */
    getDependentTables(tableName: string): string[];

    /**
     * Check if a table should be synced for this strategy
     */
    shouldSyncTable(tableName: string): boolean;

    /**
     * Get realtime channel configuration
     */
    getRealtimeConfig(): RealtimeConfig;
}

/**
 * Context for sync queries
 */
export interface SyncQueryContext {
    userId?: string;
    [key: string]: any;
}

/**
 * Context passed to transform functions
 */
export interface SyncTransformContext {
    supabase: SupabaseClient;
    db: MFCBillDeskDB;
    cache: Map<string, any>;
    userId?: string;
}

/**
 * Realtime configuration
 */
export interface RealtimeConfig {
    /**
     * Channel name or function to generate channel name
     */
    channelName: string | ((context?: SyncQueryContext) => string);

    /**
     * Event name to listen for (optional, only for broadcast mode)
     */
    eventName?: string;

    /**
     * Channel type (postgres_changes or broadcast)
     */
    channelType?: 'postgres_changes' | 'broadcast';

    /**
     * Tables to monitor for realtime changes
     */
    tables?: string[];
}

/**
 * Sync service configuration
 */
export interface SyncServiceConfig {
    /**
     * Supabase client instance
     */
    supabaseClient: SupabaseClient;

    /**
     * IndexedDB database instance
     */
    database: MFCBillDeskDB;

    /**
     * Sync strategy to use
     */
    strategy: ISyncStrategy;

    /**
     * Query context (e.g., userId for user-specific sync)
     */
    context?: SyncQueryContext;

    /**
     * Callbacks
     */
    onSyncStart?: () => void;
    onSyncComplete?: () => void;
    onSyncError?: (error: Error) => void;
    onSyncProgress?: (progress: SyncProgress) => void;
}

/**
 * Sync progress information
 */
export interface SyncProgress {
    currentTable: string;
    totalTables: number;
    completedTables: number;
    recordCount: number;
}

/**
 * Sync metrics for monitoring
 */
export interface SyncMetrics {
    tableName: string;
    recordCount: number;
    duration: number;
    success: boolean;
    error?: string;
    startedAt: string;
    completedAt: string;
}

/**
 * Realtime event payload
 */
export interface RealtimeEventPayload {
    table: string;
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    recordId?: string;
    schema?: string;
    timestamp?: string;
}

/**
 * Table sync configuration
 */
export interface TableSyncConfig {
    /**
     * Columns to select
     */
    columns: string | string[];

    /**
     * Additional filter function
     */
    filter?: (query: any, context?: SyncQueryContext) => any;

    /**
     * Transform function for records
     */
    transform?: (record: any, context: SyncTransformContext) => Promise<any>;

    /**
     * Whether to sync this table
     */
    enabled: boolean;

    /**
     * Dependent tables
     */
    dependsOn?: string[];
}

/**
 * Strategy configuration
 */
export interface StrategyConfig {
    /**
     * Tables configuration
     */
    tables: Record<string, TableSyncConfig>;

    /**
     * Realtime configuration
     */
    realtime: RealtimeConfig;

    /**
     * Columns to exclude from all tables
     */
    excludeColumns?: string[];
}

/**
 * Sync error types
 */
export enum SyncErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
    STRATEGY_ERROR = 'STRATEGY_ERROR',
    REALTIME_ERROR = 'REALTIME_ERROR',
}

/**
 * Sync error class
 */
export class SyncError extends Error {
    code: SyncErrorCode;
    tableName?: string;
    originalError?: Error;

    constructor(
        message: string,
        code: SyncErrorCode,
        tableName?: string,
        originalError?: Error
    ) {
        super(message);
        this.name = 'SyncError';
        this.code = code;
        this.tableName = tableName;
        this.originalError = originalError;
    }
}
