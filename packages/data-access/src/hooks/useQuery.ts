/**
 * useQuery Hook
 * 
 * Fetch data with automatic caching and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { QueryOptions, UseQueryResult } from '../types';
import { useDataAccess } from './useDataAccess';

export function useQuery<T = any>(
    table: string,
    options: QueryOptions<T> = {}
): UseQueryResult<T> {
    const dal = useDataAccess();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

    // Serialize options for dependency tracking (excluding functions)
    const optionsKey = JSON.stringify(options, (key, value) => {
        // Exclude function values from serialization
        if (typeof value === 'function') {
            return undefined;
        }
        return value;
    });

    const refetch = useCallback(async () => {
        // Don't refetch if query is disabled
        if (options.enabled === false) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await dal.query<T>(table, options);
            setData(result);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [dal, table, optionsKey, options.enabled]);

    useEffect(() => {
        console.log(`[useQuery] Setting up subscription for ${table}`, options);

        // Check if query is enabled
        if (options.enabled === false) {
            console.log(`[useQuery] Query disabled for ${table}`);
            setData([]);
            setLoading(false);
            return;
        }

        // Cleanup previous subscription
        if (subscriptionRef.current) {
            subscriptionRef.current.unsubscribe();
        }

        // Subscribe to data changes
        subscriptionRef.current = dal.subscribe<T>(table, {
            ...options,
            onData: (newData) => {
                console.log(`[useQuery] Received data for ${table}:`, newData.length, 'records');
                setData(newData);
                setLoading(false);
            },
            onError: (err) => {
                console.error(`[useQuery] Error for ${table}:`, err);
                setError(err);
                setLoading(false);
            },
            onLoading: setLoading,
        });

        // Cleanup on unmount
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                subscriptionRef.current = null;
            }
        };
    }, [dal, table, optionsKey]);

    return {
        data,
        loading,
        error,
        refetch,
    };
}
