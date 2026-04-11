'use client';

import React from 'react';
import { useRealtimeSync as useSync } from "@mfc/realtime-sync/react";
import { Cloud, CloudOff, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SyncIndicator(): React.JSX.Element {
  const {
    isAutoSync,
    setIsAutoSync,
    isSyncing,
    lastSyncTime,
    syncError,
    syncNow,
  } = useSync();

  const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          data-testid="sync-indicator"
        >
          {isSyncing ? (
            <RefreshCw
              className="h-4 w-4 animate-spin"
              data-testid="syncing-icon"
            />
          ) : isOnline ? (
            <Cloud className="h-4 w-4" data-testid="online-icon" />
          ) : (
            <CloudOff className="h-4 w-4" data-testid="offline-icon" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Sync Status</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-3 space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connection</span>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Online</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm" data-testid="offline-indicator">
                    Offline
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-sync" className="text-sm">
              Auto Sync
            </Label>
            <Switch
              id="auto-sync"
              checked={isAutoSync}
              onCheckedChange={setIsAutoSync}
            />
          </div>

          {/* Last Sync */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sync</span>
            <span className="text-sm">{formatLastSync(lastSyncTime)}</span>
          </div>

          {/* Sync Error */}
          {syncError && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-red-50 border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-red-900">Sync Error</p>
                <p className="text-xs text-red-700 wrap-break-word">
                  {syncError}
                </p>
              </div>
            </div>
          )}


        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={syncNow}
            disabled={isSyncing || !isOnline}
            data-testid="sync-button"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
