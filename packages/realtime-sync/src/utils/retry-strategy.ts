/**
 * Retry Strategy
 * Handles retry logic with exponential backoff for failed operations
 */

import { isRetryableError } from '../errors';

export interface RetryOptions {
    /**
     * Maximum number of retry attempts
     * @default 3
     */
    maxRetries?: number;

    /**
     * Base delay in milliseconds before first retry
     * @default 1000
     */
    baseDelay?: number;

    /**
     * Maximum delay in milliseconds
     * @default 30000
     */
    maxDelay?: number;

    /**
     * Multiplier for exponential backoff
     * @default 2
     */
    backoffMultiplier?: number;

    /**
     * Custom function to determine if error is retryable
     */
    isRetryable?: (error: Error) => boolean;

    /**
     * Callback called before each retry
     */
    onRetry?: (attempt: number, error: Error, delay: number) => void;
}

export class RetryStrategy {
    private maxRetries: number;
    private baseDelay: number;
    private maxDelay: number;
    private backoffMultiplier: number;
    private isRetryableFn: (error: Error) => boolean;
    private onRetry?: (attempt: number, error: Error, delay: number) => void;

    constructor(options: RetryOptions = {}) {
        this.maxRetries = options.maxRetries ?? 3;
        this.baseDelay = options.baseDelay ?? 1000;
        this.maxDelay = options.maxDelay ?? 30000;
        this.backoffMultiplier = options.backoffMultiplier ?? 2;
        this.isRetryableFn = options.isRetryable ?? isRetryableError;
        this.onRetry = options.onRetry;
    }

    /**
     * Execute an operation with retry logic
     * @param operation - Async function to execute
     * @param context - Context string for logging
     * @returns Result of the operation
     * @throws Last error if all retries fail
     */
    async executeWithRetry<T>(
        operation: () => Promise<T>,
        context: string
    ): Promise<T> {
        let lastError: Error;
        let attempt = 0;

        while (attempt <= this.maxRetries) {
            try {
                // First attempt or retry
                if (attempt > 0) {
                    console.log(
                        `🔄 Retry attempt ${attempt}/${this.maxRetries} for: ${context}`
                    );
                }

                return await operation();
            } catch (error) {
                lastError = error as Error;
                attempt++;

                // Check if we should retry
                if (attempt > this.maxRetries) {
                    console.error(
                        `❌ ${context} failed after ${this.maxRetries} retries:`,
                        lastError
                    );
                    throw lastError;
                }

                // Check if error is retryable
                if (!this.isRetryableFn(lastError)) {
                    console.error(
                        `❌ ${context} failed with non-retryable error:`,
                        lastError
                    );
                    throw lastError;
                }

                // Calculate delay with exponential backoff
                const delay = this.calculateDelay(attempt);

                console.warn(
                    `⚠️  ${context} failed (attempt ${attempt}/${this.maxRetries}):`,
                    lastError.message
                );
                console.log(`⏳ Retrying in ${delay}ms...`);

                // Call onRetry callback if provided
                if (this.onRetry) {
                    this.onRetry(attempt, lastError, delay);
                }

                // Wait before retrying
                await this.sleep(delay);
            }
        }

        // This should never be reached, but TypeScript needs it
        throw lastError!;
    }

    /**
     * Calculate delay for a given attempt using exponential backoff
     * @param attempt - Current attempt number (1-indexed)
     * @returns Delay in milliseconds
     */
    private calculateDelay(attempt: number): number {
        // Exponential backoff: baseDelay * (backoffMultiplier ^ (attempt - 1))
        const exponentialDelay =
            this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1);

        // Add jitter (random variation) to prevent thundering herd
        const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter

        // Cap at maxDelay
        return Math.min(exponentialDelay + jitter, this.maxDelay);
    }

    /**
     * Sleep for specified milliseconds
     * @param ms - Milliseconds to sleep
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Update retry options
     */
    updateOptions(options: Partial<RetryOptions>): void {
        if (options.maxRetries !== undefined) {
            this.maxRetries = options.maxRetries;
        }
        if (options.baseDelay !== undefined) {
            this.baseDelay = options.baseDelay;
        }
        if (options.maxDelay !== undefined) {
            this.maxDelay = options.maxDelay;
        }
        if (options.backoffMultiplier !== undefined) {
            this.backoffMultiplier = options.backoffMultiplier;
        }
        if (options.isRetryable !== undefined) {
            this.isRetryableFn = options.isRetryable;
        }
        if (options.onRetry !== undefined) {
            this.onRetry = options.onRetry;
        }
    }
}

/**
 * Create a retry strategy with default options
 */
export function createRetryStrategy(options?: RetryOptions): RetryStrategy {
    return new RetryStrategy(options);
}
