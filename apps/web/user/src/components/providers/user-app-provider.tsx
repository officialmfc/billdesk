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

function authLog(message: string, extra?: unknown): void {
  if (extra === undefined) {
    console.info(`[UserWebAuth] ${message}`);
    return;
  }

  console.info(`[UserWebAuth] ${message}`, extra);
}

function getText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function buildFallbackUserProfileFromSession(session: Session): UserProfile | null {
  const metadata = session.user.user_metadata ?? {};
  const userType = getText(metadata.user_type) || getText(metadata.requested_user_type);
  const defaultRole =
    getText(metadata.default_role) || getText(metadata.requested_default_role);

  if (userType !== "business" && userType !== "vendor") {
    return null;
  }

  if (defaultRole !== "buyer" && defaultRole !== "seller") {
    return null;
  }

  return {
    address: getRecord(metadata.address),
    businessName: getText(metadata.business_name) || null,
    defaultRole,
    id: session.user.id,
    name: getText(metadata.full_name) || getText(metadata.name) || session.user.email || "User",
    phone: getText(metadata.phone) || null,
    userType,
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const [sellerSectionEnabled, setSellerSectionEnabledState] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem(SELLER_SECTION_KEY) === "true";
  });
  const restoreGenerationRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SELLER_SECTION_KEY, sellerSectionEnabled ? "true" : "false");
  }, [sellerSectionEnabled]);

  const restoreSession = async (sessionHint?: Session | null) => {
    const restoreId = ++restoreGenerationRef.current;
    const isCurrent = () => restoreId === restoreGenerationRef.current;

    try {
      if (sessionHint) {
        const optimisticProfile = buildFallbackUserProfileFromSession(sessionHint);
        if (optimisticProfile) {
          setProfile(optimisticProfile);
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
        setProfile(null);
        authLog("no session found");
        return;
      }

      const fallbackProfile = buildFallbackUserProfileFromSession(session);

      try {
        authLog("touching hosted user web device lease");
        await withTimeout(
          touchHostedUserWebDeviceLease(),
          USER_SESSION_TIMEOUT_MS,
          "touchHostedUserWebDeviceLease"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          throw error;
        }
        authLog("device lease touch timed out; continuing with profile fallback");
      }

      let cachedProfile: UserProfile | null = null;
      try {
        cachedProfile = await withTimeout(
          getCurrentUserProfile(),
          USER_SESSION_TIMEOUT_MS,
          "getCurrentUserProfile"
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes("timed out")) {
          throw error;
        }
        authLog("getCurrentUserProfile timed out; continuing with session fallback");
      }

      if (cachedProfile && isCurrent()) {
        setProfile(cachedProfile);
        authLog("cached profile loaded", {
          userId: cachedProfile.id,
          userType: cachedProfile.userType,
          role: cachedProfile.defaultRole,
        });
      } else if (fallbackProfile && isCurrent()) {
        setProfile(fallbackProfile);
        authLog("session metadata fallback profile loaded", {
          userId: fallbackProfile.id,
          userType: fallbackProfile.userType,
          role: fallbackProfile.defaultRole,
        });
      }

      if (!isCurrent()) {
        return;
      }

      const runBackgroundSync = () => {
        void (async () => {
          try {
            authLog("syncing current user data");
            await withTimeout(syncCurrentUserData(), USER_SESSION_TIMEOUT_MS, "syncCurrentUserData");
            const freshProfile = await withTimeout(
              getCurrentUserProfile(),
              USER_SESSION_TIMEOUT_MS,
              "getCurrentUserProfile"
            );

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
              console.error("[UserWebAuth] sync current user data failed", error);
            }
          }
        })();
      };

      if (cachedProfile || fallbackProfile) {
        setIsLoading(false);
        runBackgroundSync();
        return;
      }

      try {
        await withTimeout(syncCurrentUserData(), USER_SESSION_TIMEOUT_MS, "syncCurrentUserData");
        const freshProfile = await withTimeout(
          getCurrentUserProfile(),
          USER_SESSION_TIMEOUT_MS,
          "getCurrentUserProfile"
        );

        if (freshProfile && isCurrent()) {
          setProfile(freshProfile);
          authLog("fresh profile loaded", {
            userId: freshProfile.id,
            userType: freshProfile.userType,
            role: freshProfile.defaultRole,
          });
        }
      } catch (error) {
        if (!isCurrent()) {
          return;
        }
        throw error;
      }
    } catch (error) {
      if (!isCurrent()) {
        return;
      }

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
          setProfile(null);
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
    await withTimeout(syncCurrentUserData(), USER_SESSION_TIMEOUT_MS, "syncCurrentUserData");
    const nextProfile = await withTimeout(
      getCurrentUserProfile(),
      USER_SESSION_TIMEOUT_MS,
      "getCurrentUserProfile"
    );
    setProfile(nextProfile);
  };

  const logout = async () => {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    await clearPersistedSupabaseSession().catch(() => undefined);
    await clearUserAppCache().catch(() => undefined);
    setProfile(null);
  };

  const value = useMemo<UserAppContextValue>(
    () => ({
      isAuthenticated: Boolean(profile),
      isLoading,
      profile,
      refreshProfile,
      sellerSectionEnabled,
      setSellerSectionEnabled,
      logout,
    }),
    [isLoading, logout, profile, refreshProfile, sellerSectionEnabled]
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
