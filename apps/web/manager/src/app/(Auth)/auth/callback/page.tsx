"use client";

/**
 * OAuth Callback Page
 * Handles OAuth redirects from providers (Google, etc.)
 * SSG-compatible - works with static export
 */

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_LANDING, getLandingPreference } from "@/lib/landing-preference";

function parseAuthParamsFromLocation(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;

  if (hash) {
    for (const [key, value] of new URLSearchParams(hash).entries()) {
      params.set(key, value);
    }
  }

  return Object.fromEntries(params.entries());
}

function authHubBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

function sanitizeNextPath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

function redirectToLanding(path: string): void {
  window.location.replace(path);
}

function CallbackContent(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const hasHandledCallback = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      if (hasHandledCallback.current) {
        return;
      }

      hasHandledCallback.current = true;

      try {
        const supabase = createClient();
        const params = parseAuthParamsFromLocation();
        const error = params.error ?? searchParams.get("error");
        const errorDescription =
          params.error_description ?? searchParams.get("error_description");
        const code = params.code ?? searchParams.get("code");
        const accessToken = params.access_token;
        const refreshToken = params.refresh_token;
        const handoffId = params.handoff ?? searchParams.get("handoff");
        const requestedNext = sanitizeNextPath(params.next ?? searchParams.get("next"));

        // Handle OAuth errors
        if (error) {
          console.error("OAuth error:", error, errorDescription);
          const errorMessage =
            errorDescription ||
            "Authentication failed. Please try again or use email/password login.";
          setStatus("error");
          setMessage(errorMessage);
          showToast("error", errorMessage);
          setTimeout(() => {
            router.push("/auth/login?error=oauth_failed");
          }, 2000);
          return;
        }

        let session = null;

        if (handoffId) {
          const response = await fetch(`${authHubBaseUrl()}/api/auth/exchange`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ handoffId }),
          });

          const payload = (await response.json()) as {
            access_token?: string;
            error?: string;
            refresh_token?: string;
          };

          if (!response.ok) {
            throw new Error(payload.error || "Failed to exchange the login handoff.");
          }

          if (!payload.access_token || !payload.refresh_token) {
            throw new Error("The login handoff response was incomplete.");
          }

          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: payload.access_token,
            refresh_token: payload.refresh_token,
          });

          if (sessionError) {
            console.error("Session exchange error:", sessionError);
            const errorMessage =
              "Failed to complete authentication. Please try again.";
            setStatus("error");
            setMessage(errorMessage);
            showToast("error", errorMessage);
            setTimeout(() => {
              router.push("/auth/login?error=session_exchange_failed");
            }, 2000);
            return;
          }

          session = data.session;
        } else if (code) {
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

          if (sessionError) {
            console.error("Session exchange error:", sessionError);
            const errorMessage =
              "Failed to complete authentication. Please try again.";
            setStatus("error");
            setMessage(errorMessage);
            showToast("error", errorMessage);
            setTimeout(() => {
              router.push("/auth/login?error=session_exchange_failed");
            }, 2000);
            return;
          }

          session = data.session;
        } else if (accessToken && refreshToken) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session exchange error:", sessionError);
            const errorMessage =
              "Failed to complete authentication. Please try again.";
            setStatus("error");
            setMessage(errorMessage);
            showToast("error", errorMessage);
            setTimeout(() => {
              router.push("/auth/login?error=session_exchange_failed");
            }, 2000);
            return;
          }

          session = data.session;
        }

        if (session) {
          if (!session.user) {
            const errorMessage = "No user returned from authentication.";
            setStatus("error");
            setMessage(errorMessage);
            showToast("error", errorMessage);
            setTimeout(() => {
              router.push("/auth/login?error=no_user");
            }, 2000);
            return;
          }

          localStorage.setItem("mfc-session-active", "true");
          localStorage.setItem("mfc-last-activity", Date.now().toString());

          if (!localStorage.getItem("mfc_default_landing")) {
            localStorage.setItem("mfc_default_landing", DEFAULT_LANDING);
          }

          setStatus("success");
          setMessage("Authentication complete. Redirecting...");
          showToast("success", "Authentication complete. Redirecting...");

          const landingPage = requestedNext ?? getLandingPreference();
          setTimeout(() => {
            redirectToLanding(landingPage);
          }, 1000);
        } else {
          const errorMessage = "No authentication session was received.";
          setStatus("error");
          setMessage(errorMessage);
          showToast("error", errorMessage);
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Callback error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        setStatus("error");
        setMessage(errorMessage);
        showToast("error", errorMessage);
        setTimeout(() => {
          router.push("/auth/login?error=unexpected");
        }, 2000);
      }
    };

    handleCallback();
  }, [router, searchParams, showToast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center text-center">
          <div
            className={`h-16 w-16 rounded-full flex items-center justify-center ${status === "loading"
              ? "bg-blue-100"
              : status === "success"
                ? "bg-green-100"
                : "bg-red-100"
              }`}
          >
            {status === "loading" && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            )}
            {status === "success" && (
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {status === "error" && (
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              {status === "loading"
                ? "Authenticating"
                : status === "success"
                  ? "Success"
                  : "Error"}
            </CardTitle>
            <CardDescription className="mt-2">{message}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {status === "loading" && (
            <p className="text-sm text-muted-foreground text-center">
              Please wait while we complete your authentication...
            </p>
          )}
          {status === "success" && (
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to dashboard...
            </p>
          )}
          {status === "error" && (
            <p className="text-sm text-muted-foreground text-center">
              Redirecting to login page...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CallbackPage() {
  return <CallbackContent />;
}
