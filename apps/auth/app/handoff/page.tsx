"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  buildInternalHref,
  getContextLabel,
  readContext,
} from "@/lib/config";
import {
  createBrowserSupabaseClient,
  getSessionTokens,
  getStoredSessionTokens,
} from "@/lib/supabase-client";
import { requestAuthHubHandoff } from "@/lib/handoff";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";

function HandoffPageContent() {
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const [message, setMessage] = useState("Preparing your redirect...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const performHandoff = async () => {
      try {
        if (!context) {
          return;
        }

        const supabase = createBrowserSupabaseClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const tokens = getSessionTokens(session) ?? getStoredSessionTokens();
        if (!tokens) {
          throw new Error("No authenticated session is available to hand off.");
        }

        const href = await requestAuthHubHandoff(context, tokens);

        if (!cancelled) {
          setMessage(`Redirecting to ${getContextLabel(context)}...`);
          window.location.assign(href);
        }
      } catch (reason) {
        if (!cancelled) {
          await createBrowserSupabaseClient().auth.signOut({ scope: "local" }).catch(() => undefined);
          setError(
            reason instanceof Error
              ? reason.message
              : "Could not redirect to the destination app."
          );
          setMessage("");
        }
      }
    };

    performHandoff();

    return () => {
      cancelled = true;
    };
  }, [context]);

  if (!context) {
    return <AuthAccessDenied />;
  }

  return (
    <AuthShell
      centered
      title={`Opening ${getContextLabel(context)}`}
      subtitle="Your session is ready."
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

export default function HandoffPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <HandoffPageContent />
    </Suspense>
  );
}
