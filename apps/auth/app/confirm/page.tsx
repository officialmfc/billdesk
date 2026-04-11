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
  getSessionTokens,
  getStoredSessionTokens,
} from "@/lib/supabase-client";
import { requestAuthHubHandoff } from "@/lib/handoff";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";

type VerifyType =
  | "signup"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change";

function isVerifyType(value: string | null): value is VerifyType {
  return (
    value === "signup" ||
    value === "recovery" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "email_change"
  );
}

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const [message, setMessage] = useState("Verifying your email link...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleConfirmation = async () => {
      try {
        if (!context) {
          return;
        }

        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (type === "recovery") {
          router.replace(buildInternalHref("/reset-password", context));
          return;
        }

        if (!tokenHash || !isVerifyType(type)) {
          throw new Error("The confirmation link is invalid or incomplete.");
        }

        const supabase = createBrowserSupabaseClient();
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (verifyError) {
          throw verifyError;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const tokens = getSessionTokens(session) ?? getStoredSessionTokens();
        if (tokens) {
          const accessDecision = await verifyAuthHubAccess(context);
          if (!accessDecision.allowed) {
            await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
            throw new Error(accessDecision.reason);
          }

          const redirectUrl = await requestAuthHubHandoff(context, tokens);
          window.location.assign(redirectUrl);
          return;
        }

        if (!cancelled) {
          setMessage("Email confirmed. Redirecting you back to sign in...");
          setTimeout(() => {
            router.replace(buildInternalHref("/login", context));
          }, 1200);
        }
      } catch (reason) {
        if (!cancelled) {
          await createBrowserSupabaseClient().auth.signOut({ scope: "local" }).catch(() => undefined);
          setError(
            reason instanceof Error
              ? reason.message
              : "The confirmation link could not be verified."
          );
          setMessage("");
        }
      }
    };

    handleConfirmation();

    return () => {
      cancelled = true;
    };
  }, [context, router, searchParams]);

  if (!context) {
    return <AuthAccessDenied />;
  }

  return (
    <AuthShell
      centered
      title={`Verifying ${getContextLabel(context)}`}
      subtitle="Please wait while we validate your email."
    >
      <div className="auth-loader" />
      {message ? <AuthStatus tone="info">{message}</AuthStatus> : null}
      {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}
      <div className="auth-links auth-links--centered">
        <Link href={buildInternalHref("/login", context)}>Back to login</Link>
      </div>
    </AuthShell>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <ConfirmPageContent />
    </Suspense>
  );
}
