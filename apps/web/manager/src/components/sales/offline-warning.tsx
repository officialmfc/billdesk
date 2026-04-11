'use client';

/**
 * Offline Warning Banner
 * Shows below navbar on sales pages when offline
 */

import { useState, useEffect, type ReactElement } from 'react';
import { WifiOff, AlertCircle, X } from 'lucide-react';

export function OfflineWarning() {
  const [isOnline, setIsOnline] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Initial status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false); // Reset dismiss when back online
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false); // Show warning when going offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show if online or dismissed
  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="bg-red-50 border-b border-red-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <WifiOff className="h-5 w-5 text-red-600 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-red-900">
                  You're offline
                </p>
              </div>
              <p className="text-xs text-red-700 mt-1">
                You can view data and fill forms, but submissions will be queued until you're back online.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-red-100 rounded-md transition-colors shrink-0"
            aria-label="Dismiss offline warning"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
