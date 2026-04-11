import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Linking, type AppStateStatus } from 'react-native';
import { captureAppException } from '@mfc/auth';
import type { Session } from "@supabase/supabase-js";
import {
  clearPersistedSupabaseSession,
  completeOAuthRedirect,
  openHostedManagerLogin,
  touchHostedManagerDeviceLease,
  supabase,
} from '@/lib/supabase';
import { rpcService, StaffProfile } from '@/lib/rpc-service';
import { ErrorHandler } from '@/lib/error-handler';
import { syncEngine } from '@/lib/sync-engine';

interface AuthContextValue {
  user: StaffProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const MANAGER_SESSION_TIMEOUT_MS = 10_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

function getMetadataText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildFallbackManagerProfileFromSession(session: {
  user: { email?: string | null; id: string; user_metadata?: Record<string, unknown> | null };
}): StaffProfile | null {
  const metadata = session.user.user_metadata ?? {};
  const role =
    getMetadataText(metadata.role) ||
    getMetadataText(metadata.requested_staff_role) ||
    getMetadataText(metadata.requested_default_role);

  if (role !== "manager") {
    return null;
  }

  const displayName =
    getMetadataText(metadata.full_name) ||
    getMetadataText(metadata.name) ||
    session.user.email ||
    "Manager";

  return {
    user_id: session.user.id,
    user_role: "manager",
    is_active: true,
    display_name: displayName,
    full_name: displayName,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restoreGenerationRef = useRef(0);
  const restoreSession = async (sessionHint?: Session | null): Promise<void> => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;

    try {
      if (sessionHint) {
        const optimisticProfile = buildFallbackManagerProfileFromSession(sessionHint);
        if (optimisticProfile) {
          setUser(optimisticProfile);
        }
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      const session =
        sessionHint ??
        (
          await withTimeout(
            supabase.auth.getSession(),
            MANAGER_SESSION_TIMEOUT_MS,
            "supabase.auth.getSession"
          )
        ).data.session;

      if (!isCurrent()) {
        return;
      }

      if (!session) {
        setUser(null);
        void syncEngine.disconnectAndClear().catch((error) => {
          void captureAppException(error, {
            app: "manager-mobile",
            context: "sync_cleanup",
            phase: "session_missing",
          });
          console.error("Sync cleanup failed:", error);
        });
        return;
      }

      const fallbackProfile = buildFallbackManagerProfileFromSession(session);

      try {
        await withTimeout(
          touchHostedManagerDeviceLease(),
          MANAGER_SESSION_TIMEOUT_MS,
          "touchHostedManagerDeviceLease"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          throw error;
        }
        console.info("[ManagerAuth] device lease touch timed out; continuing with fallback");
      }

      if (!isCurrent()) {
        return;
      }

      let profile: StaffProfile | null = null;
      try {
        profile = await withTimeout(
          loadProfileFromCurrentSession(),
          MANAGER_SESSION_TIMEOUT_MS,
          "get_current_manager_info"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          throw error;
        }
        console.info("[ManagerAuth] profile lookup timed out; continuing with fallback");
      }

      if (!profile && fallbackProfile) {
        profile = fallbackProfile;
      }

      if (!isCurrent()) {
        return;
      }

      if (!profile) {
        throw new Error("Unable to verify your manager profile right now.");
      }

      setUser(profile);
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      void captureAppException(error, {
        app: "manager-mobile",
        context: "auth",
        phase: "restore_session",
      });
      ErrorHandler.handle(error, "Session restore");
      await syncEngine.disconnectAndClear().catch((syncError) => {
        void captureAppException(syncError, {
          app: "manager-mobile",
          context: "sync_cleanup",
          phase: "restore_session",
        });
        console.error("Sync cleanup failed:", syncError);
      });
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      await clearPersistedSupabaseSession().catch(() => undefined);
      setUser(null);
    } finally {
      if (isCurrent()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const appStateSubscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void supabase.auth.startAutoRefresh();
        void restoreSession();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session) {
        setUser(null);
        void syncEngine.disconnectAndClear().catch((error) => {
          void captureAppException(error, {
            app: "manager-mobile",
            context: "sync_cleanup",
            phase: "auth_state_change",
          });
          console.error("Sync cleanup failed:", error);
        });
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      await restoreSession(session);
    });

    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      void handleIncomingUrl(url);
    });

    void (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        const handledInitialUrl = initialUrl ? await handleIncomingUrl(initialUrl) : false;
        if (handledInitialUrl) {
          console.info("[ManagerAuth] initial url handled by hosted auth");
        }

        if (!handledInitialUrl) {
          await restoreSession();
        }
      } catch (error) {
        if (!cancelled) {
          void captureAppException(error, {
            app: "manager-mobile",
            context: "auth",
            phase: "bootstrap",
          });
          console.error("Session bootstrap failed:", error);
          await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
          await clearPersistedSupabaseSession().catch(() => undefined);
          setUser(null);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
        authListener.subscription.unsubscribe();
        linkSubscription.remove();
        appStateSubscription.remove();
      };
  }, []);

  const loadProfileFromCurrentSession = async (): Promise<StaffProfile | null> => {
    const profile = await rpcService.getCurrentUserInfo();

    if (!profile) {
      return null;
    }

    if (!profile.is_active) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new Error('Your account is inactive. Please contact an administrator.');
    }

    if (profile.user_role !== 'manager') {
      await supabase.auth.signOut({ scope: 'local' });
      throw new Error('Unauthorized: This mobile app is available to manager accounts only');
    }

    return profile;
  };

  const handleIncomingUrl = async (url: string): Promise<boolean> => {
    try {
      console.info("[ManagerAuth] completing oauth redirect", { url });
      const handled = await completeOAuthRedirect(url);
      if (!handled) {
        console.info("[ManagerAuth] incoming url ignored");
        return false;
      }

      return true;
    } catch (error) {
      ErrorHandler.handle(error, "Google login");
      return false;
    }
  };

  /**
   * Login with email and password (2-step authentication)
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      void password;
      await openHostedManagerLogin(email);
    } catch (error) {
      ErrorHandler.handle(error, 'Login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      await openHostedManagerLogin();
    } catch (error) {
      ErrorHandler.handle(error, 'Google login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout and clear local data
   */
  const logout = async () => {
    let cleanupError: unknown = null;

    try {
      setIsLoading(true);
      await syncEngine.disconnectAndClear();
    } catch (error) {
      cleanupError = error;
    }

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      cleanupError = cleanupError ?? error;
    }

    try {
      await clearPersistedSupabaseSession();
    } catch (error) {
      cleanupError = cleanupError ?? error;
    } finally {
      setUser(null);
      setIsLoading(false);
    }

    if (cleanupError) {
      ErrorHandler.showWarning('Logged out locally. Some cleanup steps failed.');
      console.error('Logout cleanup error:', cleanupError);
      return;
    }

    ErrorHandler.showInfo('Logged out successfully');
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
