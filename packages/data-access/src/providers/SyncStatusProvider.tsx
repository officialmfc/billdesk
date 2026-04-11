/**
 * SyncStatusProvider
 * Manage synchronization status and queue
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';

export interface SyncStatus {
    status: 'idle' | 'syncing' | 'error' | 'success';
    progress: number; // 0-100
    currentTable?: string;
    totalTables: number;
    syncedTables: number;
    error?: string;
    lastSyncTime?: Date;
}

export interface SyncStatusContextValue {
    syncStatus: SyncStatus;
    startSync: (tables: string[]) => void;
    updateProgress: (progress: number, currentTable?: string) => void;
    completeSync: () => void;
    failSync: (error: string) => void;
    resetSync: () => void;
}

const SyncStatusContext = createContext<SyncStatusContextValue | null>(null);

export interface SyncStatusProviderProps {
    children: React.ReactNode;
}

const initialStatus: SyncStatus = {
    status: 'idle',
    progress: 0,
    totalTables: 0,
    syncedTables: 0,
};

export function SyncStatusProvider({ children }: SyncStatusProviderProps): React.ReactElement {
    const [syncStatus, setSyncStatus] = useState<SyncStatus>(initialStatus);

    const startSync = useCallback((tables: string[]) => {
        setSyncStatus({
            status: 'syncing',
            progress: 0,
            totalTables: tables.length,
            syncedTables: 0,
        });
    }, []);

    const updateProgress = useCallback((progress: number, currentTable?: string) => {
        setSyncStatus(prev => ({
            ...prev,
            progress: Math.min(100, Math.max(0, progress)),
            currentTable,
            syncedTables: Math.floor((progress / 100) * prev.totalTables),
        }));
    }, []);

    const completeSync = useCallback(() => {
        setSyncStatus(prev => ({
            ...prev,
            status: 'success',
            progress: 100,
            syncedTables: prev.totalTables,
            lastSyncTime: new Date(),
        }));

        // Reset to idle after 3 seconds
        setTimeout(() => {
            setSyncStatus(prev => ({
                ...initialStatus,
                lastSyncTime: prev.lastSyncTime,
            }));
        }, 3000);
    }, []);

    const failSync = useCallback((error: string) => {
        setSyncStatus(prev => ({
            ...prev,
            status: 'error',
            error,
        }));
    }, []);

    const resetSync = useCallback(() => {
        setSyncStatus(initialStatus);
    }, []);

    const value = useMemo<SyncStatusContextValue>(
        () => ({
            syncStatus,
            startSync,
            updateProgress,
            completeSync,
            failSync,
            resetSync,
        }),
        [syncStatus, startSync, updateProgress, completeSync, failSync, resetSync]
    );

    return (
        <SyncStatusContext.Provider value={value}>
            {children}
        </SyncStatusContext.Provider>
    );
}

export function useSyncStatus(): SyncStatusContextValue {
    const context = useContext(SyncStatusContext);
    if (!context) {
        throw new Error('useSyncStatus must be used within SyncStatusProvider');
    }
    return context;
}

/**
 * Selector hooks for optimized re-renders
 */
export function useIsSyncing(): boolean {
    const { syncStatus } = useSyncStatus();
    return syncStatus.status === 'syncing';
}

export function useSyncProgress(): number {
    const { syncStatus } = useSyncStatus();
    return syncStatus.progress;
}

export function useSyncError(): string | undefined {
    const { syncStatus } = useSyncStatus();
    return syncStatus.error;
}

export function useLastSyncTime(): Date | undefined {
    const { syncStatus } = useSyncStatus();
    return syncStatus.lastSyncTime;
}
