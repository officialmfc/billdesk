"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";

import {
  clearPersistedSupabaseSession,
  supabase,
  touchHostedUserWebDeviceLease,
} from "@/lib/supabase";
import {
  fetchAuthBootstrapSnapshot,
  readCachedAuthBootstrapSnapshot,
  writeCachedAuthBootstrapSnapshot,
  type UserAuthBootstrapSnapshot,
} from "@/lib/auth-bootstrap";
import {
  clearUserAppCache,
  getCurrentUserProfile,
  syncCurrentUserData,
  type UserProfile,
} from "@/lib/user-api";

type UserAppContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  sellerSectionEnabled: boolean;
  setSellerSectionEnabled: (value: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const SELLER_SECTION_KEY = "mfc-user-web-seller-enabled";
const USER_SESSION_TIMEOUT_MS = 10_000;

const UserAppContext = createContext<UserAppContextValue | undefined>(undefined);
const SESSION_READ_TIMEOUT_MS = 3_000;

function authLog(message: string, extra?: unknown): void {
  if (extra === undefined) {
    console.info(`[UserWebAuth] ${message}`);
    return;
  }

  console.info(`[UserWebAuth] ${message}`, extra);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

export function UserAppProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authBootstrap, setAuthBootstrap] = useState<UserAuthBootstrapSnapshot | null>(null);
  const [sellerSectionEnabled, setSellerSectionEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SELLER_SECTION_KEY) === "true";
  });
  const restoreGenerationRef = useRef(0);
  const lastSuccessfulSessionTokenRef = useRef<string | null>(null);
  const authUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SELLER_SECTION_KEY, sellerSectionEnabled ? "true" : "false");
  }, [sellerSectionEnabled]);

  useEffect(() => {
    if (!authBootstrap) {
      return;
    }

    authLog("auth bootstrap snapshot ready", {
      account: authBootstrap.account?.email,
      version: authBootstrap.snapshot_version,
    });
  }, [authBootstrap]);

  const restoreSession = async (sessionHint?: Session | null) => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;

    try {
      const session =
        sessionHint ??
        (
          await withTimeout(
            supabase.auth.getSession(),
            SESSION_READ_TIMEOUT_MS,
            "supabase.auth.getSession"
          )
        ).data.session;

      if (!isCurrent()) {
        return;
      }

      if (!session) {
        authUserIdRef.current = null;
        lastSuccessfulSessionTokenRef.current = null;
        setIsAuthenticated(false);
        setAuthBootstrap(null);
        setProfile(null);
        authLog("no session found");
        return;
      }

      const sessionToken = session.access_token;
      const authUserId = session.user.id;
      authUserIdRef.current = authUserId;
      setIsAuthenticated(true);
      if (sessionToken && lastSuccessfulSessionTokenRef.current === sessionToken) {
        authLog("session already hydrated; skipping duplicate restore");
        setIsLoading(false);
        return;
      }

      const cachedBootstrap = await readCachedAuthBootstrapSnapshot(authUserId);
      if (cachedBootstrap && isCurrent()) {
        setAuthBootstrap(cachedBootstrap);
        if (cachedBootstrap.profile) {
          setProfile(cachedBootstrap.profile);
        }
        authLog("cached auth bootstrap loaded", {
          account: cachedBootstrap.account?.email,
          access: cachedBootstrap.access,
        });
      }

      const cachedProfile = await getCurrentUserProfile(authUserId);
      if (cachedProfile && isCurrent()) {
        setProfile(cachedProfile);
        authLog("cached profile loaded", {
          userId: cachedProfile.id,
          userType: cachedProfile.userType,
          role: cachedProfile.defaultRole,
        });
      }

      // Fire-and-forget — lease was already claimed during handoff; this is just a keepalive
      void touchHostedUserWebDeviceLease(sessionToken).catch((error) => {
        authLog("device lease touch failed (non-blocking)", error);
      });

      setIsLoading(false);

      void (async () => {
        try {
          const snapshot = await withTimeout(
            fetchAuthBootstrapSnapshot(sessionToken),
            2500,
            "auth bootstrap"
          );

          if (!isCurrent()) {
            return;
          }

          setAuthBootstrap(snapshot);
          if (snapshot.profile) {
            setProfile(snapshot.profile);
          }
          await writeCachedAuthBootstrapSnapshot(authUserId, snapshot);
          authLog("auth bootstrap loaded", {
            account: snapshot.account?.email,
            access: snapshot.access,
          });
        } catch (error) {
          if (isCurrent()) {
            authLog(
              "auth bootstrap fallback to cached state",
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      })();

      void (async () => {
        try {
          authLog("syncing current user data");
          await withTimeout(
            syncCurrentUserData(authUserId),
            USER_SESSION_TIMEOUT_MS,
            "syncCurrentUserData"
          );
          if (!isCurrent()) {
            return;
          }

          const freshProfile = await getCurrentUserProfile(authUserId);
          if (freshProfile && isCurrent()) {
            setProfile(freshProfile);
            authLog("fresh profile loaded", {
              userId: freshProfile.id,
              userType: freshProfile.userType,
              role: freshProfile.defaultRole,
            });
          }
        } catch (error) {
          if (isCurrent()) {
            authLog(
              "sync failed, using cached data",
              error instanceof Error ? error.message : String(error)
            );
          }
        }
      })();

      lastSuccessfulSessionTokenRef.current = sessionToken;
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

      lastSuccessfulSessionTokenRef.current = null;
      authUserIdRef.current = null;
      setIsAuthenticated(false);
      setAuthBootstrap(null);
      console.error("[UserWebAuth] restore session failed", error);
      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      await clearPersistedSupabaseSession().catch(() => undefined);
      await clearUserAppCache().catch(() => undefined);
      setProfile(null);
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

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        authLog(`auth state changed: ${session ? "session-present" : "session-empty"}`);

        if (bootstrapping && !session) {
          authLog("auth state change ignored during bootstrap");
          return;
        }

        if (!session) {
          lastSuccessfulSessionTokenRef.current = null;
          authUserIdRef.current = null;
          setIsAuthenticated(false);
          setAuthBootstrap(null);
          setProfile(null);
          setIsLoading(false);
          authLog("session cleared");
          return;
        }

        if (
          session.access_token &&
          lastSuccessfulSessionTokenRef.current === session.access_token
        ) {
          authLog("duplicate auth state ignored for hydrated session");
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        await restoreSession(session);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    });

    void (async () => {
      try {
        await restoreSession();
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
    };
  }, []);

  const setSellerSectionEnabled = async (value: boolean) => {
    setSellerSectionEnabledState(value);
  };

  const refreshProfile = async () => {
    const authUserId = authUserIdRef.current;
    const sessionToken = lastSuccessfulSessionTokenRef.current;

    if (!authUserId || !sessionToken) {
      return;
    }

    try {
      const snapshot = await withTimeout(
        fetchAuthBootstrapSnapshot(sessionToken),
        2500,
        "auth bootstrap"
      );

      setAuthBootstrap(snapshot);
      if (snapshot.profile) {
        setProfile(snapshot.profile);
      }
      await writeCachedAuthBootstrapSnapshot(authUserId, snapshot);
    } catch (error) {
      authLog("refresh profile failed", error instanceof Error ? error.message : String(error));
    }

    void syncCurrentUserData(authUserId).catch((error) => {
      authLog("refresh sync failed (non-blocking)", error);
    });
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    await clearPersistedSupabaseSession().catch(() => undefined);
    await clearUserAppCache().catch(() => undefined);
    lastSuccessfulSessionTokenRef.current = null;
    authUserIdRef.current = null;
    setIsAuthenticated(false);
    setAuthBootstrap(null);
    setProfile(null);
  };

  const value = useMemo<UserAppContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      profile,
      refreshProfile,
      sellerSectionEnabled,
      setSellerSectionEnabled,
      logout,
    }),
    [isAuthenticated, isLoading, logout, profile, refreshProfile, sellerSectionEnabled]
  );

  return <UserAppContext.Provider value={value}>{children}</UserAppContext.Provider>;
}

export function useUserApp(): UserAppContextValue {
  const context = useContext(UserAppContext);
  if (!context) {
    throw new Error("useUserApp must be used within a UserAppProvider");
  }
  return context;
}
