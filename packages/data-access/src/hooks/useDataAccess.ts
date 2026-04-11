/**
 * useDataAccess Hook
 * 
 * Access the DataAccessClient instance from context
 */

import { useContext, createContext } from 'react';
import type { DataAccessClient } from '../client';

export const DataAccessContext = createContext<DataAccessClient | null>(null);

export function useDataAccess(): DataAccessClient {
    const context = useContext(DataAccessContext);

    if (!context) {
        throw new Error(
            'useDataAccess must be used within a DataAccessProvider. ' +
            'Wrap your app with <DataAccessProvider> at the root level.'
        );
    }

    return context;
}
