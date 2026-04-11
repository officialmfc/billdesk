'use client';

/**
 * Offline Indicator Component
 * Shows online/offline status and data sync status
 */

import { useState, useEffect, type ReactElement } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { getOfflineDataManager, type SyncStatus } from '@/lib/offline-data-manager';

export function OfflineIndicator(): ReactElement {
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Get sync status
    const manager = getOfflineDataManager();
    const status = manager.getSyncStatus();
    setSyncStatus(status);

    // Update sync status periodically
    const interval = setInterval(() => {
      const status = manager.getSyncStatus();
      setSyncStatus(status);
    }, 10000); // Every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getTimeSinceSync = (): string => {
    if (!syncStatus?.lastSync) return 'Never';

    const now = Date.now();
    const diff = now - syncStatus.lastSync;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const isDataFresh = (): boolean => {
    if (!syncStatus?.lastSync) return false;
    const now = Date.now();
    const diff = now - syncStatus.lastSync;
    return diff < 6 * 60 * 60 * 1000; // 6 hours
  };

  if (isOnline && isDataFresh()) {
    // Everything is good - show minimal indicator
    return (
      <div
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg shadow-md border border-green-200">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Online</span>
        </div>

        {showDetails && (
          <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-4 min-w-[250px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last sync:</span>
                <span className="text-sm font-medium">{getTimeSinceSync()}</span>
              </div>
              {syncStatus?.isSyncing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span className="text-sm">Syncing...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show prominent indicator when offline or data is stale
  return (
    <div
      className="fixed bottom-4 right-4 z-50 cursor-pointer"
      onClick={() => setShowDetails(!showDetails)}
    >
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${
          isOnline
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}
      >
        {isOnline ? (
          <>
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">Data may be outdated</div>
              <div className="text-xs">Last sync: {getTimeSinceSync()}</div>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">You're offline</div>
              <div className="text-xs">Using cached data</div>
            </div>
          </>
        )}
      </div>

      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border p-4 min-w-[300px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection:</span>
              <span
                className={`text-sm font-medium flex items-center gap-1 ${
                  isOnline ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last sync:</span>
              <span className="text-sm font-medium">{getTimeSinceSync()}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data status:</span>
              <span
                className={`text-sm font-medium ${
                  isDataFresh() ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                {isDataFresh() ? 'Fresh' : 'Stale'}
              </span>
            </div>

            {syncStatus?.pendingChanges && syncStatus.pendingChanges > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending changes:</span>
                <span className="text-sm font-medium text-blue-600">
                  {syncStatus.pendingChanges}
                </span>
              </div>
            )}

            {syncStatus?.isSyncing && (
              <div className="flex items-center gap-2 text-blue-600 pt-2 border-t">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">Syncing data...</span>
              </div>
            )}

            {!isOnline && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">
                  💡 You can continue working offline. Changes will sync when you're back online.
                </p>
              </div>
            )}

            {isOnline && !isDataFresh() && (
              <div className="pt-2 border-t">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const manager = getOfflineDataManager();
                    await manager.syncAllData();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
