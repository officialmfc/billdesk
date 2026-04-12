import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, Linking, type AppStateStatus } from "react-native";
import { captureAppException } from "@mfc/auth";
import type { Session } from "@supabase/supabase-js";

import {
  clearPersistedSupabaseSession,
  completeOAuthRedirect,
  openHostedAdminLogin,
  touchHostedAdminDeviceLease,
  supabase,
} from "@/lib/supabase";

export type AdminProfile = {
  email: string | null;
  fullName: string;
  id: string;
  isActive: boolean;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  user: AdminProfile | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const ADMIN_SESSION_TIMEOUT_MS = 10_000;

function authLog(message: string, extra?: unknown): void {
  if (extra === undefined) {
    console.info(`[AdminAuth] ${message}`);
    return;
  }

  console.info(`[AdminAuth] ${message}`, extra);
}

function authError(message: string, error: unknown): void {
  void captureAppException(error, {
    app: "admin-mobile",
    context: "auth",
    message,
  });
  console.error(`[AdminAuth] ${message}`, error);
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

function buildFallbackAdminProfileFromSession(session: {
  user: { email?: string | null; id: string; user_metadata?: Record<string, unknown> | null };
}): AdminProfile | null {
  const metadata = session.user.user_metadata ?? {};
  const role =
    getMetadataText(metadata.role) ||
    getMetadataText(metadata.requested_staff_role) ||
    getMetadataText(metadata.requested_default_role);

  if (role !== "admin") {
    return null;
  }

  const fullName =
    getMetadataText(metadata.full_name) ||
    getMetadataText(metadata.name) ||
    session.user.email ||
    "Admin";

  return {
    email: session.user.email ?? null,
    fullName,
    id: session.user.id,
    isActive: true,
  };
}

async function getAdminProfile(email: string | null): Promise<AdminProfile | null> {
  const { data, error } = await withTimeout(
    (async () => await supabase.rpc("get_current_admin_profile"))(),
    ADMIN_SESSION_TIMEOUT_MS,
    "get_current_admin_profile"
  );

  if (error) {
    authError("get_current_admin_profile failed", error);
    return null;
  }

  const profile = (data as { profile?: { full_name?: string; id?: string; is_active?: boolean } | null } | null)
    ?.profile;

  if (!profile?.id || !profile.full_name) {
    return null;
  }

  return {
    email,
    fullName: profile.full_name,
    id: profile.id,
    isActive: Boolean(profile.is_active),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const restoreGenerationRef = useRef(0);
  const restoreSession = async (sessionHint?: Session | null): Promise<void> => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;

    try {
      if (sessionHint) {
        const optimisticProfile = buildFallbackAdminProfileFromSession(sessionHint);
        if (optimisticProfile) {
          setUser(optimisticProfile);
          setIsLoading(false);
        }
      }

      authLog("restoring session");
      const session =
        sessionHint ??
        (
          await withTimeout(
            supabase.auth.getSession(),
            ADMIN_SESSION_TIMEOUT_MS,
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

      const fallbackProfile = buildFallbackAdminProfileFromSession(session);

      void touchHostedAdminDeviceLease(session.access_token).catch((error) => {
        authLog("device lease touch failed (non-blocking)", error);
      });

      if (!isCurrent()) {
        return;
      }

      let profile: AdminProfile | null = null;
      try {
        profile = await getAdminProfile(session.user.email ?? null);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          throw error;
        }
        authLog("getAdminProfile timed out; continuing with session fallback");
      }
      if (!profile && fallbackProfile) {
        authLog("using session metadata fallback for admin profile");
        profile = fallbackProfile;
      }

      if (!isCurrent()) {
        return;
      }

      if (!profile?.isActive) {
        authLog("profile missing or inactive, clearing session");
        await supabase.auth.signOut({ scope: "local" });
        await clearPersistedSupabaseSession();
        setUser(null);
        return;
      }

      authLog("session restored", { adminId: profile.id, email: profile.email });
      setUser(profile);
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      authError("restore session failed", error);
      await supabase.auth.signOut({ scope: "local" });
      await clearPersistedSupabaseSession();
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
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      await clearPersistedSupabaseSession().catch(() => undefined);
      setUser(null);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      void password;
      await openHostedAdminLogin(email);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await openHostedAdminLogin();
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
