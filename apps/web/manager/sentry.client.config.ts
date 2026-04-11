/**
 * Sentry Client Configuration
 *
 * Configures Sentry for browser/client-side error tracking.
 *
 * Environment Behavior:
 * - Development: Sentry is completely disabled, errors logged to console
 * - Production: Sentry is enabled, errors captured to Sentry dashboard
 */

import * as Sentry from '@sentry/nextjs';
import {
    filterBreadcrumb,
    getSentryDSN,
    getSentryEnvironment,
    getTracesSampleRate,
    isSentryEnabled,
    sanitizeEvent,
} from './src/lib/sentry/sanitize';

// Check if Sentry should be enabled
if (!isSentryEnabled()) {
    console.log('[Sentry Client] Disabled in development mode');
} else {
    const dsn = getSentryDSN();

    if (!dsn) {
        console.warn('[Sentry Client] DSN not configured, Sentry will not be initialized');
    } else {
        Sentry.init({
            // Sentry DSN from environment variables
            dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://2b41a61cf9c4fea22eb353e76fe7976e@o4508792765947904.ingest.us.sentry.io/4508872813256704",

            // Tunnel Sentry requests to bypass ad-blockers
            tunnel: '/monitoring',

            // Environment name (production, staging, etc.)
            environment: getSentryEnvironment(),

            // Enable Sentry only in production
            enabled: true,

            // Traces sample rate (0.1 = 10% of transactions)
            // Lower rate to save quota
            tracesSampleRate: getTracesSampleRate(),

            // Session replay - disabled to save quota
            replaysSessionSampleRate: 0,
            replaysOnErrorSampleRate: 0,

            // Filter breadcrumbs to exclude console.log and console.info
            beforeBreadcrumb: filterBreadcrumb,

            // Sanitize events before sending to remove sensitive data
            beforeSend: sanitizeEvent as any,

            // Ignore specific errors that are not actionable
            ignoreErrors: [
                // Browser extensions
                'top.GLOBALS',
                'chrome-extension://',
                'moz-extension://',
                // Network errors that are expected
                'NetworkError',
                'Network request failed',
                // ResizeObserver errors (benign)
                'ResizeObserver loop limit exceeded',
                'ResizeObserver loop completed with undelivered notifications',
            ],

            // Deny URLs - don't capture errors from these sources
            denyUrls: [
                // Browser extensions
                /extensions\//i,
                /^chrome:\/\//i,
                /^moz-extension:\/\//i,
            ],

            // Release tracking (optional - set via build process)
            // release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

            // Debug mode (only in development)
            debug: false,
        });

        console.log('[Sentry Client] Initialized successfully');
    }
}
