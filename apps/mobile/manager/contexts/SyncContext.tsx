import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncEngine } from '@/lib/sync-engine';
import type { RealtimeActivityEvent } from '@/lib/sync-engine';
import { ErrorHandler } from '@/lib/error-handler';
import { useAuth } from './AuthContext';

interface SyncContextValue {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError: string | null;
  revision: number;
  isRealtimeSubscribed: boolean;
  realtimeEvents: RealtimeActivityEvent[];
  performFullSync: () => Promise<void>;
  performDeltaSync: (table: string, recordId: string) => Promise<void>;
  clearRealtimeEvents: () => void;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [hasPerformedInitialSync, setHasPerformedInitialSync] = useState(false);
  const [isRealtimeSubscribed, setIsRealtimeSubscribed] = useState(
    syncEngine.getSyncStatus().isSubscribed
  );
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeActivityEvent[]>(
    syncEngine.getSyncStatus().recentEvents
  );
  const [revision, setRevision] = useState(syncEngine.getSyncStatus().revision);

  useEffect(() => {
    // Perform initial sync when user logs in
    if (isAuthenticated && user && !hasPerformedInitialSync) {
      performInitialSync();
    }

    // Subscribe to realtime updates when authenticated
    if (isAuthenticated && user) {
      syncEngine.subscribeToRealtimeUpdates(user.user_id);
    }

    // Cleanup on unmount or logout
    return () => {
      if (!isAuthenticated) {
        syncEngine.unsubscribeFromRealtimeUpdates();
        setHasPerformedInitialSync(false);
      }
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const updateRealtimeState = () => {
      const nextStatus = syncEngine.getSyncStatus();
      setIsRealtimeSubscribed(nextStatus.isSubscribed);
      setRealtimeEvents(nextStatus.recentEvents);
      setRevision(nextStatus.revision);
      setLastSyncTime(nextStatus.lastFullSyncAt ? new Date(nextStatus.lastFullSyncAt) : null);

      if (nextStatus.lastError) {
        setSyncStatus("error");
        setSyncError(nextStatus.lastError);
      } else if (nextStatus.isConnecting) {
        setSyncStatus("syncing");
      } else {
        setSyncStatus("idle");
      }
    };

    updateRealtimeState();
    const unsubscribe = syncEngine.subscribe(updateRealtimeState);

    return unsubscribe;
  }, []);

  /**
   * Perform initial full sync on login
   */
  const performInitialSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('syncing');
      setSyncError(null);

      await syncEngine.pullAll();

      setLastSyncTime(new Date());
      setSyncStatus('idle');
      setHasPerformedInitialSync(true);
      setRevision(syncEngine.getSyncStatus().revision);
    } catch (error) {
      console.error('[SyncContext] Initial sync failed:', error);
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      ErrorHandler.handle(error, 'Initial Sync');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Perform full sync manually
   */
  const performFullSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('syncing');
      setSyncError(null);

      await syncEngine.pullAll();

      setLastSyncTime(new Date());
      setSyncStatus('idle');
      setRevision(syncEngine.getSyncStatus().revision);

      ErrorHandler.showSuccess('Sync completed successfully');
    } catch (error) {
      console.error('[SyncContext] Full sync failed:', error);
      setSyncStatus('error');
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      ErrorHandler.handle(error, 'Full Sync');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Perform delta sync for a single record
   */
  const performDeltaSync = async (table: string, recordId: string) => {
    try {
      await syncEngine.pullChanges(table, recordId);
      setLastSyncTime(new Date());
      setRevision(syncEngine.getSyncStatus().revision);
    } catch (error) {
      console.error('[SyncContext] Delta sync failed:', error);
      // Don't show error to user for delta sync failures
    }
  };

  const value: SyncContextValue = {
    isSyncing,
    lastSyncTime,
    syncStatus,
    syncError,
    revision,
    isRealtimeSubscribed,
    realtimeEvents,
    performFullSync,
    performDeltaSync,
    clearRealtimeEvents: () => syncEngine.clearRealtimeEvents(),
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

/**
 * Hook to use sync context
 */
export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
