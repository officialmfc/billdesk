// File: packages/auth/src/AuthContext.tsx
// Optimized AuthContext with offline support and cached profile

"use client";

import { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

// Timeout configuration
const RPC_TIMEOUT_MS = 12000;

// Secure local storage keys
const PROFILE_CACHE_KEY = "mfc_profile_cache";
const PROFILE_HASH_KEY = "mfc_profile_hash";

// Timeout utility function
function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

// This is the type for the user *profile*, not the auth user
// It's the result of our RPC call
type UserProfile = {
  user_id: string;
  user_role: string;
  is_active: boolean;
  display_name: string;
};

export type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<string | null>;
};

// This context assumes you are passing in a Supabase client
// as a prop, as seen in your `AuthProviderWrapper.tsx`
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Simple hash function for integrity check
async function hashProfile(profile: UserProfile): Promise<string> {
  const data = JSON.stringify(profile);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Secure profile cache functions
function saveProfileToCache(profile: UserProfile, hash: string): void {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
    localStorage.setItem(PROFILE_HASH_KEY, hash);
  } catch (error) {
    console.warn("Failed to cache profile:", error);
  }
}

async function loadProfileFromCache(): Promise<UserProfile | null> {
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    const storedHash = localStorage.getItem(PROFILE_HASH_KEY);

    if (!cached || !storedHash) return null;

    const profile = JSON.parse(cached) as UserProfile;
    const computedHash = await hashProfile(profile);

    // Verify integrity - if hash doesn't match, cache was tampered with
    if (computedHash !== storedHash) {
      console.warn("🚨 Profile cache integrity check failed - clearing cache");
      clearProfileCache();
      return null;
    }

    return profile;
  } catch (error) {
    console.warn("Failed to load cached profile:", error);
    return null;
  }
}

function clearProfileCache(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
    localStorage.removeItem(PROFILE_HASH_KEY);
  } catch (error) {
    console.warn("Failed to clear profile cache:", error);
  }
}

function getMetadataText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildFallbackProfileFromSession(session: Session): UserProfile | null {
  const metadata = session.user.user_metadata as Record<string, unknown> | null | undefined;
  const role =
    getMetadataText(metadata?.role) ||
    getMetadataText(metadata?.requested_staff_role) ||
    getMetadataText(metadata?.requested_default_role);

  if (role !== "admin" && role !== "manager") {
    return null;
  }

  const displayName =
    getMetadataText(metadata?.full_name) ||
    getMetadataText(metadata?.name) ||
    getMetadataText(session.user.email) ||
    "User";

  return {
    user_id: session.user.id,
    user_role: role,
    is_active: true,
    display_name: displayName,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({
  supabase,
  children,
}: {
  supabase: SupabaseClient;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Helper function to get profile AND set state (with caching)
  const getProfileAndSetState = async (
    session: Session | null,
    forceRefresh: boolean = false
  ): Promise<string | null> => {
    if (!session) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      clearProfileCache();
      return null;
    }

    // Try to use cached profile if not forcing refresh
    if (!forceRefresh) {
      const cachedProfile = await loadProfileFromCache();
      if (cachedProfile) {
        console.debug("📦 Using cached profile (offline mode)");
        setUser(session.user);
        setSession(session);
        setProfile(cachedProfile);
        setError(null);
        return null;
      }
    }

    // Only fetch from server if online or forced refresh
    if (!navigator.onLine && !forceRefresh) {
      console.warn("⚠️ Offline and no cached profile available");
      const errorMsg = "You are offline. Please connect to the internet to log in.";
      setError(errorMsg);
      return errorMsg;
    }

    const fallbackProfile = buildFallbackProfileFromSession(session);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        // Fetch profile from server
        const result = await withTimeout(
          (async () => {
            const { data, error } = await supabase.rpc("get_current_manager_info");
            return { data, error };
          })(),
          RPC_TIMEOUT_MS,
          "get_current_manager_info"
        );
        const { data: profileResult, error: rpcError } = result;

        if (rpcError) {
          throw rpcError;
        }

        // Check if profile is valid (manager role + active)
        if (!profileResult || !profileResult.is_valid) {
          console.warn("🚫 Access denied - Not a valid manager");
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          clearProfileCache();
          const errorMsg = "Access Denied: This portal is only for active managers.";
          setError(errorMsg);
          return errorMsg;
        }

        const staffProfile = profileResult.profile;

        // Convert to UserProfile format for compatibility
        const userProfile: UserProfile = {
          user_id: staffProfile.id,
          user_role: staffProfile.role,
          is_active: staffProfile.is_active,
          display_name: staffProfile.full_name,
        };

        // Cache the profile with integrity hash
        const profileHash = await hashProfile(userProfile);
        saveProfileToCache(userProfile, profileHash);

        // SUCCESS!
        console.debug("✅ Manager profile loaded:", userProfile.display_name);
        setUser(session.user);
        setSession(session);
        setProfile(userProfile);
        setError(null);
        return null;
      } catch (error) {
        console.error(`❌ Profile fetch attempt ${attempt + 1} failed:`, error);
        if (attempt === 0) {
          await sleep(400);
          continue;
        }
      }
    }

    // Try cached profile as fallback
    const cachedProfile = await loadProfileFromCache();
    if (cachedProfile) {
      console.debug("📦 Using cached profile as fallback");
      setUser(session.user);
      setSession(session);
      setProfile(cachedProfile);
      setError(null);
      return null;
    }

    if (fallbackProfile) {
      console.warn("⚠️ Using session metadata fallback for manager profile");
      const profileHash = await hashProfile(fallbackProfile);
      saveProfileToCache(fallbackProfile, profileHash);
      setUser(session.user);
      setSession(session);
      setProfile(fallbackProfile);
      setError(null);
      return null;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);

    const errorMsg = "Unable to verify your manager profile right now. Please try again.";
    setError(errorMsg);
    return errorMsg;
  };

  // This function performs the 2-step login
  const signIn = async (
    email: string,
    pass: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    // Step 1: Authenticate with Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

    if (authError) {
      console.error("❌ Auth Error:", authError.message);
      setError(authError.message);
      setLoading(false);
      return authError.message;
    }

    if (authData.session) {
      // Step 2: Authorize and set state
      const profileError = await getProfileAndSetState(authData.session);
      setLoading(false);
      return profileError;
    }

    setLoading(false);
    const errorMsg = "An unknown error occurred.";
    setError(errorMsg);
    return errorMsg;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setError(null);
    clearProfileCache();

    // Clear session flags
    localStorage.removeItem("mfc-session-active");
    localStorage.removeItem("mfc-last-activity");
  };

  // On app load, check for an existing session
  useEffect(() => {
    let mounted = true;
    let isInitialLoad = true;

    const fetchSession = async () => {
      if (!mounted) return;
      setLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session) {
          await getProfileAndSetState(session);
        }
      } catch (error) {
        console.error("❌ Session recovery failed:", error);
        if (mounted) {
          setError("Failed to recover session. Please log in again.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
          isInitialLoad = false;
        }
      }
    };

    fetchSession();

    // Listen for auth changes (e.g., magic link, token refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.debug(`🔐 Auth event: ${event}`);

        // Skip SIGNED_IN events during initial load - fetchSession handles it
        // This prevents duplicate RPC calls that can cause timeouts
        if (event === "SIGNED_IN" && isInitialLoad) {
          console.debug("⏭️  Skipping SIGNED_IN during initial load");
          return;
        }

        // For SIGNED_IN events after initial load, use cached profile (no fetch)
        if (event === "SIGNED_IN") {
          console.debug("✅ SIGNED_IN event - using cached profile");
          try {
            await getProfileAndSetState(session, false); // Use cache
          } catch (error) {
            console.error(`❌ SIGNED_IN profile error:`, error);
          }
          return;
        }

        // For TOKEN_REFRESHED, just update session without fetching profile
        if (event === "TOKEN_REFRESHED") {
          console.debug("🔄 Token refreshed - keeping existing profile");
          if (session) {
            setSession(session);
            setUser(session.user);
          }
          return;
        }

        // For SIGNED_OUT, clear everything
        if (event === "SIGNED_OUT") {
          console.debug("👋 Signed out - clearing state");
          setUser(null);
          setSession(null);
          setProfile(null);
          setError(null);
          clearProfileCache();
          localStorage.removeItem("mfc-session-active");
          localStorage.removeItem("mfc-last-activity");
          return;
        }

        // For other events, use cached profile
        console.debug(`⏳ ${event} event - using cached profile`);
        try {
          await getProfileAndSetState(session, false); // Use cache
        } catch (error) {
          console.error(`❌ Auth state change error (${event}):`, error);
        }
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]); // Re-run if supabase client changes

  // Navigation is handled by ProtectedRoute component
  // This prevents conflicts and race conditions

  return (
    <AuthContext.Provider
      value={{ supabase, session, user, profile, loading, error, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
