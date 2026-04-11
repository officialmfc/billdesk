/**
 * useLogRocket Hook
 * Convenient hook for tracking events and errors in production
 */
import { useCallback } from 'react';
import { trackEvent, getSessionURL } from '@/lib/logrocket';

export function useLogRocket() {
    const track = useCallback(
        (
            eventName: string,
            properties?: Record<string, string | number | boolean>
        ) => {
            if (process.env.NODE_ENV === 'production') {
                trackEvent(eventName, properties);
            }
        },
        []
    );

    const captureError = useCallback(
        (error: Error, context?: Record<string, string | number | boolean>) => {
            if (process.env.NODE_ENV === 'production') {
                trackEvent('error', {
                    message: error.message,
                    stack: error.stack || '',
                    ...context,
                });
            }
            console.error('[Error]', error, context);
        },
        []
    );

    const getSession = useCallback(async () => {
        if (process.env.NODE_ENV === 'production') {
            return await getSessionURL();
        }
        return null;
    }, []);

    return {
        track,
        captureError,
        getSession,
    };
}
