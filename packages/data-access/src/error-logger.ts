/**
 * Error Logger
 * Centralized error logging with support for external services
 */

import { DataAccessError } from './types';

export interface ErrorLogEntry {
    error: ReturnType<DataAccessError['toJSON']>;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
}

class ErrorLogger {
    private logs: ErrorLogEntry[] = [];
    private maxLogs = 100;
    private externalLogger?: (entry: ErrorLogEntry) => void;

    /**
     * Configure external logging service
     */
    configure(options: {
        externalLogger?: (entry: ErrorLogEntry) => void;
        maxLogs?: number;
    }): void {
        if (options.externalLogger) {
            this.externalLogger = options.externalLogger;
        }
        if (options.maxLogs) {
            this.maxLogs = options.maxLogs;
        }
    }

    /**
     * Log an error
     */
    log(error: DataAccessError | Error, metadata?: Partial<ErrorLogEntry>): void {
        const entry: ErrorLogEntry = {
            error: error instanceof DataAccessError
                ? error.toJSON()
                : {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: 'UNKNOWN_ERROR',
                    recoverable: false,
                    timestamp: Date.now(),
                },
            userId: metadata?.userId,
            sessionId: metadata?.sessionId,
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
            url: typeof window !== 'undefined' ? window.location.href : undefined,
        };

        // Add to local logs
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Log to console
        if (error instanceof DataAccessError) {
            error.log();
        } else {
            console.error('[Error]', error);
        }

        // Send to external logger if configured
        if (this.externalLogger) {
            try {
                this.externalLogger(entry);
            } catch (err) {
                console.error('Failed to send error to external logger:', err);
            }
        }
    }

    /**
     * Get recent error logs
     */
    getLogs(count?: number): ErrorLogEntry[] {
        if (count) {
            return this.logs.slice(-count);
        }
        return [...this.logs];
    }

    /**
     * Clear error logs
     */
    clearLogs(): void {
        this.logs = [];
    }

    /**
     * Get error statistics
     */
    getStats(): {
        total: number;
        byType: Record<string, number>;
        recoverable: number;
        nonRecoverable: number;
    } {
        const stats = {
            total: this.logs.length,
            byType: {} as Record<string, number>,
            recoverable: 0,
            nonRecoverable: 0,
        };

        this.logs.forEach(log => {
            const errorName = log.error.name || 'Unknown';
            stats.byType[errorName] = (stats.byType[errorName] || 0) + 1;

            if (log.error.recoverable) {
                stats.recoverable++;
            } else {
                stats.nonRecoverable++;
            }
        });

        return stats;
    }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Helper function to log errors
 */
export function logError(error: DataAccessError | Error, metadata?: Partial<ErrorLogEntry>): void {
    errorLogger.log(error, metadata);
}
