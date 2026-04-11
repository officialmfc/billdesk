/**
 * useMutation Hook
 * 
 * Create, update, or delete data with optimistic updates
 */

import { useState, useCallback } from 'react';
import type { MutationOptions, UseMutationResult } from '../types';
import { useDataAccess } from './useDataAccess';

export function useMutation<T = any>(table: string): UseMutationResult<T> {
    const dal = useDataAccess();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = useCallback(
        async (
            data: Partial<T>,
            options: Partial<MutationOptions<T>> = {}
        ): Promise<T | T[]> => {
            setLoading(true);
            setError(null);

            try {
                const mutationOptions: MutationOptions<T> = {
                    operation: options.operation || 'insert',
                    data,
                    ...options,
                };

                const result = await dal.mutate<T>(table, mutationOptions);
                return result;
            } catch (err) {
                setError(err as Error);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [dal, table]
    );

    return {
        mutate,
        loading,
        error,
    };
}
