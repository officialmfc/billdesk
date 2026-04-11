"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  DEFAULT_LANDING,
  getLandingPreference,
  setLandingPreference,
} from "@/lib/landing-preference";
import { createClient } from "@/lib/supabase/client";
import { loadCachedProfile } from "@mfc/auth";
import { WifiOff } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const AUTH_BASE_URL =
  (process.env.NEXT_PUBLIC_AUTH_BASE_URL || "https://auth.mondalfishcenter.com").replace(/\/+$/, "");

function redirectToLanding(path: string): void {
  window.location.replace(path);
}

function getSessionRole(session: { user?: { user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } } | null): string {
  const metadata = session?.user?.user_metadata ?? {};
  const appMetadata = session?.user?.app_metadata ?? {};
  const candidates = [
    metadata.role,
    metadata.requested_staff_role,
    metadata.requested_default_role,
    appMetadata.role,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return "";
}

function LoginPageContent(): React.ReactElement {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [redirectingToAuthHub, setRedirectingToAuthHub] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const urlError = searchParams.get("error");
  const redirectPath = searchParams.get("redirect") || getLandingPreference();
  const authHubLoginUrl = `${AUTH_BASE_URL}/login?${new URLSearchParams({
    app: "manager",
    platform: "web",
    ...(redirectPath ? { next: redirectPath } : {}),
  }).toString()}`;
  const authHubResetUrl = `${AUTH_BASE_URL}/forgot-password?${new URLSearchParams({
    app: "manager",
    platform: "web",
    ...(redirectPath ? { next: redirectPath } : {}),
  }).toString()}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    const getErrorMessage = (errorCode: string | null): string | null => {
      if (!errorCode) return null;

      switch (errorCode) {
        case "unauthorized":
          return "Your account is not authorized to access this application.";
        case "session_expired":
          return "Your session has expired. Please log in again.";
        case "offline":
          return "You are offline. Please connect to the internet to log in.";
        default:
          return "An unexpected error occurred. Please try again later.";
      }
    };

    if (urlError) {
      const message = getErrorMessage(urlError);
      if (message) {
        showToast("error", message);
      }
    }
  }, [showToast, urlError]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!mounted) return;

        const sessionActive = localStorage.getItem("mfc-session-active");
        const sessionTimestamp = localStorage.getItem("mfc-last-activity");

        if (sessionActive && sessionTimestamp) {
          const lastActivity = parseInt(sessionTimestamp, 10);
          const now = Date.now();
          const sixHours = 6 * 60 * 60 * 1000;

          if (now - lastActivity < sixHours) {
            if (navigator.onLine) {
              const supabase = createClient();
              const {
                data: { session },
              } = await supabase.auth.getSession();

              if (!session) {
                localStorage.removeItem("mfc-session-active");
                localStorage.removeItem("mfc-last-activity");
                return;
              }
            }

            setRedirectingToAuthHub(true);
            redirectToLanding(redirectPath || getLandingPreference());
            return;
          }

          localStorage.removeItem("mfc-session-active");
          localStorage.removeItem("mfc-last-activity");
        }

        if (navigator.onLine) {
          const supabase = createClient();
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const cachedProfile = await loadCachedProfile("mfc_profile_cache");
            const sessionRole = getSessionRole(session);

            if (
              (cachedProfile &&
                cachedProfile.is_active &&
                (cachedProfile.user_role === "manager" || cachedProfile.user_role === "admin")) ||
              sessionRole === "manager" ||
              sessionRole === "admin"
            ) {
              if (!localStorage.getItem("mfc_default_landing")) {
                setLandingPreference(DEFAULT_LANDING);
              }
              setRedirectingToAuthHub(true);
              redirectToLanding(redirectPath || getLandingPreference());
              return;
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, [mounted, redirectPath, router]);

  useEffect(() => {
    if (!mounted || isLoading || !isOnline || redirectingToAuthHub) {
      return;
    }

    setRedirectingToAuthHub(true);
    window.location.replace(authHubLoginUrl);
  }, [authHubLoginUrl, isLoading, isOnline, mounted, redirectingToAuthHub]);

  const openHostedLogin = () => {
    if (!isOnline) {
      showToast("error", "You are offline. Please connect to the internet to log in.");
      return;
    }

    setRedirectingToAuthHub(true);
    window.location.replace(authHubLoginUrl);
  };

  const openHostedPasswordReset = () => {
    window.location.assign(authHubResetUrl);
  };

  if (isLoading || redirectingToAuthHub) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-muted/40 p-6">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <Card className="w-full max-w-lg p-4">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-muted-foreground">
              {redirectingToAuthHub ? "Opening secure sign in..." : "Checking authentication..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-lg p-4">
        <CardHeader className="space-y-2 flex flex-col items-center text-center">
          <Image
            src="/logo/mfclogo.svg"
            alt="Billing Logo"
            width={96}
            height={96}
            className="rounded-md"
            style={{ width: "auto", height: "96px" }}
          />
          <div>
            <CardTitle className="text-3xl font-extrabold">Manager</CardTitle>
            <CardDescription className="text-muted-foreground">
              Shared secure sign-in opens in your browser and returns here when complete.
            </CardDescription>
          </div>

          {!isOnline ? (
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              <WifiOff className="h-4 w-4" />
              <span>You are offline. Connect to internet to sign in.</span>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" disabled={!isOnline} onClick={openHostedLogin}>
            Continue to secure sign in
          </Button>
          <Button className="w-full" variant="outline" onClick={openHostedPasswordReset}>
            Reset password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage(): React.ReactElement {
  return <LoginPageContent />;
}
