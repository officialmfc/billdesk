"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  buildInternalHref,
  getContextLabel,
  readContext,
} from "@/lib/config";
import { verifyAuthHubAccess } from "@/lib/access";
import {
  createBrowserSupabaseClient,
} from "@/lib/supabase-client";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";

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

function CallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const [phase, setPhase] = useState<"loading" | "success" | "error" | "denied">("loading");
  const [message, setMessage] = useState("Completing sign-in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        if (!context) {
          return;
        }

        const authError =
          searchParams.get("error_description") || searchParams.get("error");
        if (authError) {
          throw new Error(decodeURIComponent(authError));
        }

        const supabase = createBrowserSupabaseClient();
        const params = parseAuthParamsFromLocation();
        const code = params.code ?? searchParams.get("code");
        const accessToken = params.access_token ?? searchParams.get("access_token");
        const refreshToken = params.refresh_token ?? searchParams.get("refresh_token");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        } else if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) {
            throw sessionError;
          }
        } else {
          throw new Error("The auth provider did not return a session.");
        }

        const accessDecision = await verifyAuthHubAccess(context);
        if (!accessDecision.allowed) {
          await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
          if (!cancelled) {
            setPhase("denied");
            setError(accessDecision.reason);
            setMessage("");
          }
          return;
        }

        if (!cancelled) {
          setPhase("success");
          setMessage("Sign-in complete. Preparing your app handoff...");
          router.replace(buildInternalHref("/handoff", context));
        }
      } catch (reason) {
        if (!cancelled) {
          await createBrowserSupabaseClient().auth.signOut({ scope: "local" }).catch(() => undefined);
          setPhase("error");
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not complete sign-in."
          );
          setMessage("");
        }
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [context, router, searchParams]);

  if (!context) {
    return <AuthAccessDenied />;
  }

  if (phase === "denied") {
    return <AuthAccessDenied message={error || "This account cannot access the requested app."} />;
  }

  if (phase === "error") {
    return (
      <AuthShell
        centered
        title={`Signing in to ${getContextLabel(context)}`}
        subtitle="Please wait while your session is prepared."
      >
        <AuthStatus tone="error">{error || "Could not complete sign-in."}</AuthStatus>
        <div className="auth-links auth-links--centered">
          <Link href={buildInternalHref("/login", context)}>Back to login</Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      centered
      title={`Signing in to ${getContextLabel(context)}`}
      subtitle="Please wait while your session is prepared."
    >
      {phase === "loading" ? <div className="auth-loader" /> : null}
      {message ? <AuthStatus tone="info">{message}</AuthStatus> : null}
      <div className="auth-links auth-links--centered">
        <Link href={buildInternalHref("/login", context)}>Back to login</Link>
      </div>
    </AuthShell>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <CallbackPageContent />
    </Suspense>
  );
}
