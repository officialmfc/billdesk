/**
 * Core types for the data access layer
 */

import type { MFCBillDeskDB } from '@mfc/database';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Query options for fetching data
 */
export interface QueryOptions<T = any> {
    where?: Partial<T> | ((item: T) => boolean);
    orderBy?: keyof T | string | { field: string; direction: 'asc' | 'desc' };
    orderDirection?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    select?: string | string[];
    cacheTTL?: number; // Cache time-to-live in milliseconds
    filters?: Record<string, any>; // Additional filters
    enabled?: boolean; // Whether the query should run
}

/**
 * Mutation options for modifying data
 */
export interface MutationOptions<T = any> {
    operation: 'insert' | 'update' | 'delete';
    data?: Partial<T> | Partial<T>[];
    where?: Partial<T>;
    id?: string;
}

/**
 * Subscription options for real-time updates
 */
export interface SubscriptionOptions<T = any> {
    where?: Partial<T> | ((item: T) => boolean);
    onData?: (data: T[]) => void;
    onError?: (error: Error) => void;
    onLoading?: (loading: boolean) => void;
}

/**
 * Subscription handle for cleanup
 */
export interface Subscription {
    unsubscribe: () => void;
}

/**
 * Query result from useQuery hook
 */
export interface UseQueryResult<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

/**
 * Mutation result from useMutation hook
 */
export interface UseMutationResult<T> {
    mutate: (data: Partial<T>, options?: Partial<MutationOptions<T>>) => Promise<T | T[]>;
    loading: boolean;
    error: Error | null;
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
    key: string;
    data: T;
    timestamp: number;
    expiresAt: number;
    version: number;
}

/**
 * Cache manager interface
 */
export interface ICacheManager {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, data: T, ttl?: number): Promise<void>;
    invalidate(pattern: string): Promise<void>;
    clear(): Promise<void>;
}

/**
 * Sync queue item for offline operations
 */
export interface SyncQueueItem {
    id: string;
    table: string;
    operation: 'insert' | 'update' | 'delete';
    data: Record<string, any>;
    timestamp: number;
    retries: number;
    status: 'pending' | 'syncing' | 'failed' | 'completed';
    error?: string;
}

/**
 * Sync result
 */
export interface SyncResult {
    success: boolean;
    table: string;
    recordsProcessed: number;
    errors: Error[];
}

/**
 * Data access client configuration
 */
export interface DataAccessConfig {
    supabase: SupabaseClient;
    indexedDB: MFCBillDeskDB;
    defaultCacheTTL?: number;
    enableSync?: boolean;
    enableRealtime?: boolean;
}

/**
 * Error types with serialization and logging support
 */
export class DataAccessError extends Error {
    public timestamp: number;
    public context?: Record<string, any>;

    constructor(
        message: string,
        public code: string,
        public recoverable: boolean,
        public originalError?: Error,
        context?: Record<string, any>
    ) {
        super(message);
        this.name = 'DataAccessError';
        this.timestamp = Date.now();
        this.context = context;

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Serialize error for logging or transmission
     */
    toJSON(): Record<string, any> {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            recoverable: this.recoverable,
            timestamp: this.timestamp,
            context: this.context,
            stack: this.stack,
            originalError: this.originalError ? {
                name: this.originalError.name,
                message: this.originalError.message,
                stack: this.originalError.stack,
            } : undefined,
        };
    }

    /**
     * Log error to console with appropriate level
     */
    log(): void {
        const logData = this.toJSON();
        if (this.recoverable) {
            console.warn(`[${this.name}]`, logData);
        } else {
            console.error(`[${this.name}]`, logData);
        }
    }
}

export class NetworkError extends DataAccessError {
    constructor(message: string, originalError?: Error, context?: Record<string, any>) {
        super(message, 'NETWORK_ERROR', true, originalError, context);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends DataAccessError {
    constructor(
        message: string,
        public fields: Record<string, string>,
        originalError?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'VALIDATION_ERROR', true, originalError, context);
        this.name = 'ValidationError';
    }

    override toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            fields: this.fields,
        };
    }
}

export class PermissionError extends DataAccessError {
    constructor(
        message: string,
        public requiredPermission?: string,
        originalError?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'PERMISSION_ERROR', false, originalError, context);
        this.name = 'PermissionError';
    }

    override toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            requiredPermission: this.requiredPermission,
        };
    }
}

export class ConflictError extends DataAccessError {
    constructor(
        message: string,
        public localData: any,
        public remoteData: any,
        originalError?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'CONFLICT_ERROR', true, originalError, context);
        this.name = 'ConflictError';
    }

    override toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            localData: this.localData,
            remoteData: this.remoteData,
        };
    }
}

export class DatabaseError extends DataAccessError {
    constructor(
        message: string,
        public table?: string,
        originalError?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'DATABASE_ERROR', true, originalError, context);
        this.name = 'DatabaseError';
    }

    override toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            table: this.table,
        };
    }
}

export class SyncError extends DataAccessError {
    constructor(
        message: string,
        public syncOperation?: string,
        originalError?: Error,
        context?: Record<string, any>
    ) {
        super(message, 'SYNC_ERROR', true, originalError, context);
        this.name = 'SyncError';
    }

    override toJSON(): Record<string, any> {
        return {
            ...super.toJSON(),
            syncOperation: this.syncOperation,
        };
    }
}
