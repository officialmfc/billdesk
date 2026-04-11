/**
 * Date utilities for IST (Indian Standard Time) timezone handling
 */

/**
 * Get current date in IST timezone formatted as YYYY-MM-DD
 * IST is UTC+5:30
 */
export function getCurrentDateIST(): string {
    const now = new Date();

    // Convert to IST by adding 5 hours 30 minutes to UTC
    const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
    const istTime = new Date(now.getTime() + istOffset);

    // Format as YYYY-MM-DD
    return istTime.toISOString().split('T')[0] ?? '';
}

/**
 * Get current Date object in IST timezone
 */
export function getCurrentDateObjectIST(): Date {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    return new Date(now.getTime() + istOffset);
}

/**
 * Convert a Date object to IST date string (YYYY-MM-DD)
 */
export function toISTDateString(date: Date): string {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(date.getTime() + istOffset);
    return istTime.toISOString().split('T')[0] ?? '';
}

/**
 * Get IST timezone offset string (+05:30)
 */
export function getISTOffset(): string {
    return '+05:30';
}
