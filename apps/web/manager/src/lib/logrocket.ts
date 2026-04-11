/**
 * LogRocket Configuration
 * Production logging and session replay
 */
import LogRocket from 'logrocket';
import { logger } from './logger';

let isInitialized = false;

/**
 * Initialize LogRocket for production logging
 * Only runs in production environment
 */
export function initLogRocket() {
    // Only initialize in production and if not already initialized
    const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
    if (
        isProduction &&
        !isInitialized &&
        typeof window !== 'undefined'
    ) {
        try {
            LogRocket.init('h5j4lv/mfc-bill-desk', {
                // Console integration
                console: {
                    shouldAggregateConsoleErrors: true,
                },
                // Network configuration
                network: {
                    requestSanitizer: (request) => {
                        // Sanitize sensitive headers
                        if (request.headers) {
                            if (request.headers['Authorization']) {
                                request.headers['Authorization'] = '[REDACTED]';
                            }
                            if (request.headers['authorization']) {
                                request.headers['authorization'] = '[REDACTED]';
                            }
                        }
                        return request;
                    },
                    responseSanitizer: (response) => {
                        // Sanitize sensitive response data
                        if (response.body) {
                            try {
                                const body =
                                    typeof response.body === 'string'
                                        ? JSON.parse(response.body)
                                        : response.body;

                                // Remove sensitive fields
                                if (body.access_token) body.access_token = '[REDACTED]';
                                if (body.refresh_token) body.refresh_token = '[REDACTED]';
                                if (body.password) body.password = '[REDACTED]';

                                response.body = JSON.stringify(body);
                            } catch {
                                // If parsing fails, leave as is
                            }
                        }
                        return response;
                    },
                },
                // DOM configuration
                dom: {
                    inputSanitizer: true, // Automatically sanitize input fields
                },
            });

            isInitialized = true;
        } catch (error) {
            logger.error(error, '[LogRocket] Initialization failed');
        }
    }
}

/**
 * Identify user in LogRocket
 */
export function identifyUser(
    userId: string,
    traits?: Record<string, string | number | boolean>
) {
    if (isInitialized) {
        try {
            LogRocket.identify(userId, traits);
        } catch (error) {
            logger.error(error, '[LogRocket] User identification failed');
        }
    }
}

/**
 * Track custom events
 */
export function trackEvent(
    eventName: string,
    properties?: Record<string, string | number | boolean>
) {
    if (isInitialized) {
        try {
            LogRocket.track(eventName, properties);
        } catch (error) {
            logger.error(error, '[LogRocket] Event tracking failed');
        }
    }
}

/**
 * Get session URL for support
 */
export function getSessionURL(): Promise<string | null> {
    if (isInitialized) {
        return new Promise((resolve) => {
            LogRocket.getSessionURL((sessionURL) => {
                resolve(sessionURL);
            });
        });
    }
    return Promise.resolve(null);
}

export default LogRocket;
