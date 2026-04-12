import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, Linking, type AppStateStatus } from "react-native";
import { captureAppException, fetchAuthHubBootstrapSnapshot } from "@mfc/auth";
import type { Session } from "@supabase/supabase-js";

import {
  clearPersistedSupabaseSession,
  completeOAuthRedirect,
  openHostedUserLogin,
  touchHostedUserDeviceLease,
  supabase,
} from "@/lib/supabase";
import {
  clearUserAppCache,
  syncCurrentUserData,
  type UserProfile,
} from "@/lib/user-api";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  user: UserProfile | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_SESSION_TIMEOUT_MS = 10_000;
const AUTH_BOOTSTRAP_TIMEOUT_MS = 4_000;

function authLog(message: string, extra?: unknown): void {
  if (extra === undefined) {
    console.info(`[UserAuth] ${message}`);
    return;
  }

  console.info(`[UserAuth] ${message}`, extra);
}

function authError(message: string, error: unknown): void {
  void captureAppException(error, {
    app: "user-mobile",
    context: "auth",
    message,
  });
  console.error(`[UserAuth] ${message}`, error);
}

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

function getMetadataRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function buildFallbackUserProfileFromSession(session: {
  user: { email?: string | null; id: string; user_metadata?: Record<string, unknown> | null };
}): UserProfile | null {
  const metadata = session.user.user_metadata ?? {};
  const userType = getMetadataText(metadata.user_type) || getMetadataText(metadata.requested_user_type);
  const defaultRole =
    getMetadataText(metadata.default_role) || getMetadataText(metadata.requested_default_role);

  if (userType !== "business" && userType !== "vendor") {
    return null;
  }

  if (defaultRole !== "buyer" && defaultRole !== "seller") {
    return null;
  }

  return {
    address: getMetadataRecord(metadata.address),
    businessName: getMetadataText(metadata.business_name) || null,
    defaultRole,
    id: session.user.id,
    name: getMetadataText(metadata.full_name) || getMetadataText(metadata.name) || session.user.email || "User",
    phone: getMetadataText(metadata.phone) || null,
    userType,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restoreGenerationRef = useRef(0);
  const lastSuccessfulSessionTokenRef = useRef<string | null>(null);
  const authUserIdRef = useRef<string | null>(null);
  const restoreSession = async (sessionHint?: Session | null) => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;

    try {
      if (sessionHint?.access_token && lastSuccessfulSessionTokenRef.current === sessionHint.access_token) {
        authLog("duplicate auth state ignored for hydrated session");
        setIsLoading(false);
        return;
      }

      if (sessionHint) {
        const optimisticProfile = buildFallbackUserProfileFromSession(sessionHint);
        if (optimisticProfile) {
          setUser(optimisticProfile);
          setIsLoading(false);
          authLog("session metadata fallback profile loaded", {
            userId: optimisticProfile.id,
            userType: optimisticProfile.userType,
            role: optimisticProfile.defaultRole,
          });
        }
      }

      authLog("restoring session");
      const session =
        sessionHint ??
        (
          await withTimeout(
            supabase.auth.getSession(),
            USER_SESSION_TIMEOUT_MS,
            "supabase.auth.getSession"
          )
        ).data.session;

      if (!isCurrent()) {
        return;
      }

      if (!session) {
        lastSuccessfulSessionTokenRef.current = null;
        authUserIdRef.current = null;
        setUser(null);
        authLog("no session found");
        return;
      }

      void touchHostedUserDeviceLease(session.access_token).catch((error) => {
        authLog("device lease touch failed (non-blocking)", error);
      });

      if (!isCurrent()) {
        return;
      }

      authUserIdRef.current = session.user.id;
      let snapshotProfile: UserProfile | null = null;
      try {
        const bootstrap = await withTimeout(
          fetchAuthHubBootstrapSnapshot(session.access_token),
          AUTH_BOOTSTRAP_TIMEOUT_MS,
          "auth bootstrap"
        );
        snapshotProfile = bootstrap.profile;
        if (snapshotProfile) {
          authLog("auth bootstrap profile loaded", {
            userId: snapshotProfile.id,
            userType: snapshotProfile.userType,
            role: snapshotProfile.defaultRole,
          });
        }
      } catch (error) {
        if (!isCurrent()) {
          throw error;
        }
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          authError("auth bootstrap failed", error);
        } else {
          authLog("auth bootstrap timed out; continuing with session metadata");
        }
      }

      if (!isCurrent()) {
        return;
      }

      const fallbackProfile = buildFallbackUserProfileFromSession(session);
      const nextProfile = snapshotProfile ?? fallbackProfile;

      if (!nextProfile) {
        throw new Error("Unable to verify your user profile right now.");
      }

      setUser(nextProfile);
      lastSuccessfulSessionTokenRef.current = session.access_token;

      void syncCurrentUserData(session.user.id).catch((error) => {
        authLog("sync current user data failed (non-blocking)", error);
      });
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("timed out")) {
        authLog("restore session timed out; keeping optimistic state");
        return;
      }

      authError("restore session failed", error);
      await supabase.auth.signOut({ scope: "local" });
      await clearPersistedSupabaseSession();
      await clearUserAppCache();
      lastSuccessfulSessionTokenRef.current = null;
      authUserIdRef.current = null;
      setUser(null);
    } finally {
      if (isCurrent()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let cancelled = false;
    let bootstrapping = true;
    let sessionHandledByAuthListener = false;

    void supabase.auth.startAutoRefresh();

    const appStateSubscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        void supabase.auth.startAutoRefresh();
        void restoreSession();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        authLog(`auth state changed: ${session ? "session-present" : "session-empty"}`);

        if (bootstrapping && !session) {
          authLog("auth state change ignored during bootstrap");
          return;
        }

        if (!session) {
          setUser(null);
          authLog("session cleared");
          return;
        }

        sessionHandledByAuthListener = true;
        await restoreSession(session);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    });

    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      authLog("incoming url event", url);
      void handleIncomingUrl(url);
    });

    void (async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        authLog("initial url", initialUrl ?? "none");

        const handledInitialUrl = initialUrl ? await handleIncomingUrl(initialUrl) : false;
        if (handledInitialUrl) {
          authLog("initial url handled by hosted auth");
        }

        if (!handledInitialUrl) {
          await restoreSession();
        }
      } catch (error) {
        authError("bootstrap failed", error);
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        await clearPersistedSupabaseSession().catch(() => undefined);
        await clearUserAppCache().catch(() => undefined);
        setUser(null);
      } finally {
        bootstrapping = false;
        if (!cancelled && !sessionHandledByAuthListener) {
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
      authLog("completing oauth redirect", { url });
      const handled = await completeOAuthRedirect(url);
      if (!handled) {
        authLog("incoming url ignored");
        return false;
      }

      authLog("oauth redirect completed");
      return true;
    } catch (error) {
      authError("incoming url handling failed", error);
      await supabase.auth.signOut({ scope: "local" });
      await clearPersistedSupabaseSession();
      await clearUserAppCache();
      setUser(null);
      return false;
    }
  };

  const handleInitialUrl = async (): Promise<void> => {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleIncomingUrl(initialUrl);
      }
    } catch {
      // Ignore initial deep-link failures during startup.
    }
  };

  const refreshProfile = async () => {
    const authUserId = authUserIdRef.current;
    if (!authUserId) {
      return;
    }

    try {
      const { data: { session } } = await withTimeout(
        supabase.auth.getSession(),
        USER_SESSION_TIMEOUT_MS,
        "supabase.auth.getSession"
      );

      if (!session?.access_token) {
        return;
      }

      const bootstrap = await withTimeout(
        fetchAuthHubBootstrapSnapshot(session.access_token),
        AUTH_BOOTSTRAP_TIMEOUT_MS,
        "auth bootstrap"
      );

      if (bootstrap.profile) {
        setUser(bootstrap.profile);
      }
    } catch (error) {
      authLog("refresh profile failed", error);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      void password;
      await openHostedUserLogin(email);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await openHostedUserLogin();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut({ scope: "local" });
      await clearPersistedSupabaseSession();
      await clearUserAppCache();
      setUser(null);
      lastSuccessfulSessionTokenRef.current = null;
      authUserIdRef.current = null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        loginWithGoogle,
        logout,
        refreshProfile,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
