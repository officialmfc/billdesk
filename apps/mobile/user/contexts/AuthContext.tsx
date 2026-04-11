import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, Linking, type AppStateStatus } from "react-native";
import { captureAppException } from "@mfc/auth";
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
  getCurrentUserProfile,
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
  const restoreSession = async (sessionHint?: Session | null) => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;
    let cachedProfile: UserProfile | null = null;

    try {
      if (sessionHint) {
        const optimisticProfile = buildFallbackUserProfileFromSession(sessionHint);
        if (optimisticProfile) {
          setUser(optimisticProfile);
          authLog("session metadata fallback profile loaded", {
            userId: optimisticProfile.id,
            userType: optimisticProfile.userType,
            role: optimisticProfile.defaultRole,
          });
        }
        setIsLoading(false);
      } else {
        setIsLoading(true);
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
        setUser(null);
        authLog("no session found");
        return;
      }

      const fallbackProfile = buildFallbackUserProfileFromSession(session);

      try {
        authLog("touching hosted user device lease");
        await withTimeout(
          touchHostedUserDeviceLease(),
          USER_SESSION_TIMEOUT_MS,
          "touchHostedUserDeviceLease"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          throw error;
        }
        authLog("device lease touch timed out; continuing with profile fallback");
      }

      if (!isCurrent()) {
        return;
      }

      cachedProfile = await withTimeout(
        getCurrentUserProfile(),
        USER_SESSION_TIMEOUT_MS,
        "getCurrentUserProfile"
      );
      if (cachedProfile) {
        setUser(cachedProfile);
        authLog("cached profile loaded", {
          userId: cachedProfile.id,
          userType: cachedProfile.userType,
          role: cachedProfile.defaultRole,
        });
      } else if (fallbackProfile) {
        cachedProfile = fallbackProfile;
        setUser(fallbackProfile);
        authLog("session metadata fallback profile loaded", {
          userId: fallbackProfile.id,
          userType: fallbackProfile.userType,
          role: fallbackProfile.defaultRole,
        });
      }

      if (!isCurrent()) {
        return;
      }

      try {
        authLog("syncing current user data");
        await withTimeout(syncCurrentUserData(), USER_SESSION_TIMEOUT_MS, "syncCurrentUserData");
        const freshProfile = await withTimeout(
          getCurrentUserProfile(),
          USER_SESSION_TIMEOUT_MS,
          "getCurrentUserProfile"
        );
        if (freshProfile && isCurrent()) {
          authLog("fresh profile loaded", {
            userId: freshProfile.id,
            userType: freshProfile.userType,
            role: freshProfile.defaultRole,
          });
          setUser(freshProfile);
        }
      } catch (error) {
        if (!cachedProfile || !isCurrent()) {
          throw error;
        }
        authError("sync current user data failed", error);
      }
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      authError("restore session failed", error);
      await supabase.auth.signOut({ scope: "local" });
      await clearPersistedSupabaseSession();
      await clearUserAppCache();
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
        if (!cancelled) {
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

  const handleIncomingUrl = async (url: string): Promise<void> => {
    try {
      authLog("completing oauth redirect", { url });
      const handled = await completeOAuthRedirect(url);
      if (!handled) {
        authLog("incoming url ignored");
        return;
      }

      authLog("oauth redirect completed");
    } catch (error) {
      authError("incoming url handling failed", error);
      await supabase.auth.signOut({ scope: "local" });
      await clearPersistedSupabaseSession();
      await clearUserAppCache();
      setUser(null);
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
    try {
      await withTimeout(syncCurrentUserData(), USER_SESSION_TIMEOUT_MS, "syncCurrentUserData");
    } finally {
      setUser(
        await withTimeout(getCurrentUserProfile(), USER_SESSION_TIMEOUT_MS, "getCurrentUserProfile")
      );
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
