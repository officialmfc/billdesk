"use client";

/**
 * Session-Aware Sync Wrapper
 *
 * Waits for auth to complete before initializing the RealtimeSyncProvider.
 * No need to re-verify - AuthContext already verified the session.
 * Sync happens in background - UI shows immediately with cached data.
 */

import { logger } from "@/lib/logger";
import { enforceWebLocalCacheScope } from "@/lib/web-local-cache-scope";
import { useAuth } from "@mfc/auth";
import { db } from "@mfc/database";
import {
  createWebManagerTodayStrategy,
  useRealtimeSync,
} from "@mfc/realtime-sync";
import { RealtimeSyncProvider } from "@mfc/realtime-sync/react";
import { createClient } from "@mfc/supabase-config";
import { useEffect, useMemo, useState, type ReactNode } from "react";

interface SessionAwareSyncProps {
  children: ReactNode;
}

/**
 * Wrapper component that waits for auth before starting sync
 */
export function SessionAwareSync({ children }: SessionAwareSyncProps) {
  const { session, profile, loading, error } = useAuth();
  const [cacheReady, setCacheReady] = useState(false);

  // Memoize Supabase client and strategy
  const supabase = useMemo(() => createClient(), []);
  const strategy = useMemo(
    () => createWebManagerTodayStrategy(supabase, db),
    [supabase]
  );

  useEffect(() => {
    if (loading || !session || !profile) {
      setCacheReady(false);
      return;
    }

    let cancelled = false;

    const prepareLocalScope = async () => {
      try {
        await enforceWebLocalCacheScope();
      } finally {
        if (!cancelled) {
          setCacheReady(true);
        }
      }
    };

    void prepareLocalScope();

    return () => {
      cancelled = true;
    };
  }, [loading, profile, session]);

  // Show loading state ONLY while auth is loading
  // Once auth is done, show UI immediately (don't wait for sync)
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if authentication failed
  if (error && !loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold">Authentication Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/auth/login")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no session (shouldn't happen due to ProtectedRoute)
  if (!session || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold">Authentication Required</h2>
          <p className="text-sm text-muted-foreground">
            Please log in to continue
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!cacheReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Preparing local cache...</p>
        </div>
      </div>
    );
  }

  // Session is ready - initialize sync and show UI immediately
  // Sync happens in background, UI shows cached data first
  // autoSync=true means sync will start automatically but won't block UI
  return (
    <RealtimeSyncProvider
      supabaseClient={supabase}
      database={db}
      strategy={strategy}
      autoSync={true}
      logger={logger}
    >
      <WebLocalScopeCoordinator />
      {children}
    </RealtimeSyncProvider>
  );
}

function WebLocalScopeCoordinator() {
  const { syncNow } = useRealtimeSync();

  useEffect(() => {
    const runScopeEnforcement = async () => {
      const result = await enforceWebLocalCacheScope();
      if (result.didRollOver) {
        await syncNow();
      }
    };

    void runScopeEnforcement();

    const intervalId = window.setInterval(() => {
      void runScopeEnforcement();
    }, 60_000);

    const handleIndexedDbUpdated = (event: Event) => {
      const table = (event as CustomEvent<{ table?: string }>).detail?.table;

      if (table === "stock_batches" || table === "sale_transactions") {
        void enforceWebLocalCacheScope();
      }
    };

    window.addEventListener("indexeddb-updated", handleIndexedDbUpdated);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("indexeddb-updated", handleIndexedDbUpdated);
    };
  }, [syncNow]);

  return null;
}
