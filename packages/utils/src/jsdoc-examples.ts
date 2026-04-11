/**
 * Example file showing JSDoc standards for the project
 * All public APIs should follow these patterns
 */

/**
 * Calculates the total amount from an array of items
 * 
 * @param items - Array of items with amount property
 * @returns Total sum of all amounts
 * 
 * @example
 * ```typescript
 * const items = [{ amount: 100 }, { amount: 200 }];
 * const total = calculateTotal(items);
 * console.log(total); // 300
 * ```
 */
export function calculateTotal(items: Array<{ amount: number }>): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Formats a date string to Indian format (DD/MM/YYYY)
 * 
 * @param date - Date string or Date object
 * @param format - Optional format string (default: 'DD/MM/YYYY')
 * @returns Formatted date string
 * @throws {Error} If date is invalid
 * 
 * @example
 * ```typescript
 * formatDate('2024-01-15'); // '15/01/2024'
 * formatDate(new Date(), 'YYYY-MM-DD'); // '2024-01-15'
 * ```
 */
export function formatDate(date: string | Date, format?: string): string {
    // Implementation
    return '';
}

/**
 * User data interface
 * 
 * @interface User
 * @property {string} id - Unique identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {boolean} isActive - Whether user is active
 */
export interface User {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

/**
 * Options for retry logic
 * 
 * @typedef {Object} RetryOptions
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {number} [initialDelay=1000] - Initial delay in milliseconds
 * @property {number} [maxDelay=10000] - Maximum delay in milliseconds
 * @property {(attempt: number, error: Error) => void} [onRetry] - Callback on retry
 */
export interface RetryOptions {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Async function with retry logic
 * 
 * @template T - Return type of the function
 * @param {() => Promise<T>} fn - Function to execute with retry
 * @param {RetryOptions} [options] - Retry configuration options
 * @returns {Promise<T>} Result of the function
 * @throws {Error} Last error if all retries fail
 * 
 * @example
 * ```typescript
 * const data = await withRetry(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options?: RetryOptions
): Promise<T> {
    // Implementation
    return fn();
}

/**
 * Class representing a rate limiter
 * 
 * @class RateLimiter
 * @classdesc Implements token bucket algorithm for rate limiting
 * 
 * @example
 * ```typescript
 * const limiter = new RateLimiter(10, 1000);
 * await limiter.throttle();
 * // Make API call
 * ```
 */
export class RateLimiter {
    /**
     * Creates a rate limiter instance
     * 
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} windowMs - Time window in milliseconds
     */
    constructor(
        private maxRequests: number,
        private windowMs: number
    ) { }

    /**
     * Throttles requests to stay within rate limits
     * 
     * @returns {Promise<void>} Resolves when request can proceed
     * 
     * @example
     * ```typescript
     * await limiter.throttle();
     * await fetch('/api/endpoint');
     * ```
     */
    async throttle(): Promise<void> {
        // Implementation
    }

    /**
     * Resets the rate limiter
     * 
     * @returns {void}
     */
    reset(): void {
        // Implementation
    }
}
