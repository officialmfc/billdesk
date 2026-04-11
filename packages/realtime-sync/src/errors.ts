/**
 * Sync System Error Classes
 * Custom error types for better error handling
 */

/**
 * Base sync error class
 */
export class SyncError extends Error {
    public readonly code: string;
    public readonly tableName?: string;
    public readonly originalError?: Error;

    constructor(
        message: string,
        code: string,
        tableName?: string,
        originalError?: Error
    ) {
        super(message);
        this.name = 'SyncError';
        this.code = code;
        this.tableName = tableName;
        this.originalError = originalError;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SyncError);
        }
    }
}

/**
 * Error thrown when a table is not found in the strategy configuration
 */
export class TableNotFoundError extends SyncError {
    constructor(tableName: string) {
        super(
            `Table "${tableName}" not found in sync strategy configuration`,
            'TABLE_NOT_FOUND',
            tableName
        );
        this.name = 'TableNotFoundError';
    }
}

/**
 * Error thrown when strategy configuration is invalid
 */
export class StrategyError extends SyncError {
    constructor(message: string, originalError?: Error) {
        super(message, 'STRATEGY_ERROR', undefined, originalError);
        this.name = 'StrategyError';
    }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends SyncError {
    public readonly retryable: boolean;

    constructor(message: string, tableName?: string, originalError?: Error) {
        super(message, 'NETWORK_ERROR', tableName, originalError);
        this.name = 'NetworkError';
        this.retryable = true;
    }
}

/**
 * Error thrown when user doesn't have permission to access data
 */
export class PermissionError extends SyncError {
    constructor(message: string, tableName?: string, originalError?: Error) {
        super(message, 'PERMISSION_ERROR', tableName, originalError);
        this.name = 'PermissionError';
    }
}

/**
 * Error thrown when data validation fails
 */
export class ValidationError extends SyncError {
    public readonly invalidRecords: any[];

    constructor(
        message: string,
        tableName: string,
        invalidRecords: any[] = []
    ) {
        super(message, 'VALIDATION_ERROR', tableName);
        this.name = 'ValidationError';
        this.invalidRecords = invalidRecords;
    }
}

/**
 * Error thrown when IndexedDB operation fails
 */
export class DatabaseError extends SyncError {
    constructor(message: string, tableName?: string, originalError?: Error) {
        super(message, 'DATABASE_ERROR', tableName, originalError);
        this.name = 'DatabaseError';
    }
}

/**
 * Error thrown when realtime subscription fails
 */
export class RealtimeError extends SyncError {
    public readonly channelName: string;

    constructor(message: string, channelName: string, originalError?: Error) {
        super(message, 'REALTIME_ERROR', undefined, originalError);
        this.name = 'RealtimeError';
        this.channelName = channelName;
    }
}

/**
 * Error codes enum for easy reference
 */
export enum SyncErrorCode {
    TABLE_NOT_FOUND = 'TABLE_NOT_FOUND',
    STRATEGY_ERROR = 'STRATEGY_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    REALTIME_ERROR = 'REALTIME_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: Error): boolean {
    if (error instanceof NetworkError) {
        return error.retryable;
    }

    // Check for common network error messages
    const networkErrorPatterns = [
        'network',
        'timeout',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'fetch failed',
    ];

    const errorMessage = error.message.toLowerCase();
    return networkErrorPatterns.some((pattern) =>
        errorMessage.includes(pattern.toLowerCase())
    );
}

/**
 * Convert unknown error to SyncError
 */
export function toSyncError(
    error: unknown,
    tableName?: string
): SyncError {
    if (error instanceof SyncError) {
        return error;
    }

    if (error instanceof Error) {
        // Check if it's a network error
        if (isRetryableError(error)) {
            return new NetworkError(error.message, tableName, error);
        }

        // Check if it's a permission error
        if (
            error.message.includes('permission') ||
            error.message.includes('unauthorized') ||
            error.message.includes('forbidden')
        ) {
            return new PermissionError(error.message, tableName, error);
        }

        // Default to generic SyncError
        return new SyncError(
            error.message,
            SyncErrorCode.UNKNOWN_ERROR,
            tableName,
            error
        );
    }

    // Handle non-Error objects
    return new SyncError(
        String(error),
        SyncErrorCode.UNKNOWN_ERROR,
        tableName
    );
}
