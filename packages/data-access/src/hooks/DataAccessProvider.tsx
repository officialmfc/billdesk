/**
 * DataAccessProvider Component
 *
 * Provides DataAccessClient to the entire app via React Context
 */

import { ReactNode, useEffect, useMemo } from 'react';
import { DataAccessClient } from '../client';
import type { DataAccessConfig } from '../types';
import { DataAccessContext } from './useDataAccess';

interface DataAccessProviderProps extends DataAccessConfig {
    children: ReactNode;
}

export function DataAccessProvider({
    children,
    supabase,
    indexedDB,
    defaultCacheTTL,
    enableSync,
    enableRealtime,
}: DataAccessProviderProps) {
    const client = useMemo(() => {
        console.debug('[DataAccessProvider] Creating client with:', {
            hasSupabase: !!supabase,
            hasIndexedDB: !!indexedDB,
            indexedDBTables: indexedDB ? Object.keys(indexedDB).filter(k => !k.startsWith('_')) : [],
        });
        return new DataAccessClient({
            supabase,
            indexedDB,
            defaultCacheTTL,
            enableSync,
            enableRealtime,
        });
    }, [supabase, indexedDB, defaultCacheTTL, enableSync, enableRealtime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            client.cleanup();
        };
    }, [client]);

    // Periodic cache cleanup (every 5 minutes)
    useEffect(() => {
        const interval = setInterval(() => {
            client.cache.cleanup();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [client]);

    return (
        <DataAccessContext.Provider value={client}>
            {children}
        </DataAccessContext.Provider>
    );
}
