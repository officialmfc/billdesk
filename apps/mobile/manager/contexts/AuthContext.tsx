import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Linking, type AppStateStatus } from 'react-native';
import { captureAppException, fetchAuthHubBootstrapSnapshot } from '@mfc/auth';
import type { Session } from "@supabase/supabase-js";
import {
  clearPersistedSupabaseSession,
  completeOAuthRedirect,
  openHostedManagerLogin,
  touchHostedManagerDeviceLease,
  supabase,
} from '@/lib/supabase';
import { StaffProfile } from '@/lib/rpc-service';
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
const AUTH_BOOTSTRAP_TIMEOUT_MS = 4_000;

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
  const lastSuccessfulSessionTokenRef = useRef<string | null>(null);
  const restoreSession = async (sessionHint?: Session | null): Promise<void> => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;

    try {
      if (sessionHint?.access_token && lastSuccessfulSessionTokenRef.current === sessionHint.access_token) {
        console.info("[ManagerAuth] duplicate auth state ignored for hydrated session");
        setIsLoading(false);
        return;
      }

      if (sessionHint) {
        const optimisticProfile = buildFallbackManagerProfileFromSession(sessionHint);
        if (optimisticProfile) {
          setUser(optimisticProfile);
          setIsLoading(false);
        }
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
        lastSuccessfulSessionTokenRef.current = null;
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

      void touchHostedManagerDeviceLease(session.access_token).catch((error) => {
        console.info("[ManagerAuth] device lease touch failed (non-blocking)", error);
      });

      if (!isCurrent()) {
        return;
      }

      try {
        const bootstrap = await withTimeout(
          fetchAuthHubBootstrapSnapshot(session.access_token),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          "auth bootstrap"
        );

        const staffProfile = bootstrap.staff_profile;
        if (staffProfile?.is_active && staffProfile.role === "manager") {
          const profile: StaffProfile = {
            user_id: staffProfile.user_id,
            user_role: "manager",
            is_active: true,
            display_name: staffProfile.display_name,
            full_name: staffProfile.full_name,
          };

          console.info("[ManagerAuth] auth bootstrap profile loaded", {
            managerId: profile.user_id,
            role: profile.user_role,
          });
          setUser(profile);
          lastSuccessfulSessionTokenRef.current = session.access_token;
          return;
        }

        if (staffProfile && staffProfile.role !== "manager") {
          throw new Error("Unauthorized: This mobile app is available to manager accounts only");
        }

        if (staffProfile && !staffProfile.is_active) {
          throw new Error('Your account is inactive. Please contact an administrator.');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          if (message.includes("Unauthorized") || message.includes("inactive")) {
            throw error;
          }
          console.info("[ManagerAuth] auth bootstrap failed", error);
        } else {
          console.info("[ManagerAuth] auth bootstrap timed out; continuing with fallback");
        }
      }

      if (!isCurrent()) {
        return;
      }

      const profile = fallbackProfile;

      if (!profile) {
        throw new Error("Unable to verify your manager profile right now.");
      }

      setUser(profile);
      lastSuccessfulSessionTokenRef.current = session.access_token;
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
      lastSuccessfulSessionTokenRef.current = null;
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
      lastSuccessfulSessionTokenRef.current = null;
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
