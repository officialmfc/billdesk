"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@mfc/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Wrapper
 * Ensures user is authenticated before showing content
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement | null {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle redirects in useEffect to avoid render-time navigation
  useEffect(() => {
    // Don't check on auth pages
    if (pathname?.startsWith("/auth")) {
      return;
    }

    // Wait for loading to complete
    if (loading) {
      return;
    }

    // Redirect if not authenticated
    if (!session || !profile) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
    }
  }, [session, profile, loading, pathname, router]);

  // Don't check on auth pages
  if (pathname?.startsWith("/auth")) {
    return <>{children}</>;
  }

  // Show loading state while AuthContext is loading
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

  // Show loading while redirecting
  if (!session || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show content if authenticated
  return <>{children}</>;
}
