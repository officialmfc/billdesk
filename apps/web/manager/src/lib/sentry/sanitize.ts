/**
 * Sentry Data Sanitization Utilities
 *
 * Provides functions to sanitize sensitive data before sending to Sentry.
 * Used across all Sentry configurations (client, server, edge).
 */

import type { Breadcrumb, Event } from '@sentry/nextjs';

/**
 * Sensitive field names to remove from data
 */
const SENSITIVE_FIELDS = [
    'password',
    'newPassword',
    'oldPassword',
    'confirmPassword',
    'access_token',
    'refresh_token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'api_key',
    'secret',
    'token',
    'authorization',
    'cookie',
];

/**
 * Sensitive header names to remove
 */
const SENSITIVE_HEADERS = [
    'authorization',
    'cookie',
    'x-api-key',
    'x-auth-token',
    'api-key',
];

/**
 * Sanitize HTTP headers by removing sensitive values
 */
export function sanitizeHeaders(
    headers: Record<string, any> | undefined
): Record<string, any> | undefined {
    if (!headers) return headers;

    const sanitized = { ...headers };

    // Remove sensitive headers
    for (const key of Object.keys(sanitized)) {
        const lowerKey = key.toLowerCase();
        if (SENSITIVE_HEADERS.includes(lowerKey)) {
            sanitized[key] = '[REDACTED]';
        }
    }

    return sanitized;
}

/**
 * Recursively sanitize data by removing sensitive fields
 */
export function sanitizeData(
    data: any,
    depth: number = 0
): any {
    // Prevent infinite recursion
    if (depth > 10) return '[MAX_DEPTH]';

    if (data === null || data === undefined) {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map((item) => sanitizeData(item, depth + 1));
    }

    // Handle objects
    if (typeof data === 'object') {
        const sanitized: Record<string, any> = {};

        for (const [key, value] of Object.entries(data)) {
            const lowerKey = key.toLowerCase();

            // Remove sensitive fields
            if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
                sanitized[key] = '[REDACTED]';
            } else {
                sanitized[key] = sanitizeData(value, depth + 1);
            }
        }

        return sanitized;
    }

    // Return primitive values as-is
    return data;
}

/**
 * Filter breadcrumbs to exclude console.log and console.info
 * Only keep console.error and console.warn to save quota
 */
export function filterBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
    // Filter out console.log and console.info
    if (breadcrumb.category === 'console') {
        if (breadcrumb.level === 'log' || breadcrumb.level === 'info') {
            return null; // Don't capture
        }
    }

    // Keep all other breadcrumbs (console.error, console.warn, etc.)
    return breadcrumb;
}

/**
 * Sanitize Sentry event before sending
 * Removes sensitive data from requests, responses, and extra data
 */
export function sanitizeEvent(event: Event): Event | null {
    // Sanitize request data
    if (event.request) {
        if (event.request.headers) {
            event.request.headers = sanitizeHeaders(event.request.headers);
        }
        if (event.request.data) {
            event.request.data = sanitizeData(event.request.data);
        }
        if (event.request.cookies) {
            event.request.cookies = {};
        }
    }

    // Sanitize extra data
    if (event.extra) {
        event.extra = sanitizeData(event.extra);
    }

    // Sanitize contexts
    if (event.contexts) {
        for (const [key, context] of Object.entries(event.contexts)) {
            if (context && typeof context === 'object') {
                event.contexts[key] = sanitizeData(context);
            }
        }
    }

    return event;
}

/**
 * Check if Sentry should be enabled based on environment
 */
export function isSentryEnabled(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Get Sentry DSN from environment variables
 */
export function getSentryDSN(): string | undefined {
    return process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
}

/**
 * Get Sentry environment name
 */
export function getSentryEnvironment(): string {
    return (
        process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ||
        process.env.NODE_ENV ||
        'development'
    );
}

/**
 * Get traces sample rate from environment or default
 */
export function getTracesSampleRate(): number {
    const rate = process.env.SENTRY_TRACES_SAMPLE_RATE;
    return rate ? parseFloat(rate) : 0.1;
}
