'use client';

/**
 * Hook to manage offline data
 * Automatically syncs data when online
 * Provides offline data access
 */

import { useEffect, useState } from 'react';
import { startOfflineDataManager, stopOfflineDataManager, type SyncStatus } from '@/lib/offline-data-manager';

export function useOfflineData() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Start offline data manager
    startOfflineDataManager((status) => {
      setSyncStatus(status);
    });

    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      stopOfflineDataManager();
    };
  }, []);

  return {
    syncStatus,
    isInitialized,
    isOnline: syncStatus?.isOnline ?? navigator.onLine,
    isSyncing: syncStatus?.isSyncing ?? false,
    lastSync: syncStatus?.lastSync ?? 0,
    pendingChanges: syncStatus?.pendingChanges ?? 0,
  };
}
