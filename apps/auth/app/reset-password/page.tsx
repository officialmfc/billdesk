"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buildInternalHref, readContext } from "@/lib/config";
import { verifyAuthHubAccess } from "@/lib/access";
import {
  createBrowserSupabaseClient,
  getSessionTokens,
  getStoredSessionTokens,
} from "@/lib/supabase-client";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";

function ButtonSpinner() {
  return <span className="auth-button__spinner" aria-hidden="true" />;
}

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    "Checking recovery link..."
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const prepareRecovery = async () => {
      try {
        if (!context) {
          return;
        }

        const supabase = createBrowserSupabaseClient();
        const type = searchParams.get("type");
        const tokenHash = searchParams.get("token_hash");
        const code = searchParams.get("code");

        if (tokenHash && type === "recovery") {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });

          if (verifyError) {
            throw verifyError;
          }
        } else if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          throw new Error("Recovery link is invalid or has expired.");
        }

        if (!cancelled) {
          setReady(true);
          setMessage("Choose a new password for your account.");
        }
      } catch (reason) {
        if (!cancelled) {
          await createBrowserSupabaseClient().auth.signOut({ scope: "local" }).catch(() => undefined);
          const text =
            reason instanceof Error
              ? reason.message
              : "Recovery link could not be verified.";
          setError(text);
          setMessage(null);
        }
      }
    };

    prepareRecovery();

    return () => {
      cancelled = true;
    };
  }, [context, searchParams]);

  if (!context) {
    return <AuthAccessDenied />;
  }

  const updatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
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
      }

      await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
      router.replace(buildInternalHref("/login", context));
    } catch (reason) {
      const text =
        reason instanceof Error ? reason.message : "Could not update the password.";
      setError(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      centered
      title="Choose a new password"
      subtitle="Set a fresh password to finish recovery."
    >
      {message ? <AuthStatus tone="info">{message}</AuthStatus> : null}
      {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}

      {ready ? (
        <form className="auth-form" onSubmit={updatePassword}>
          <div className="auth-field auth-field--password">
            <label htmlFor="password">New password</label>
            <div className="auth-password-input">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div className="auth-actions">
          <button className="auth-button" type="submit" disabled={busy}>
              <ButtonSpinner />
              <span>{busy ? "Saving..." : "Update password"}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="auth-loader" />
      )}

      <div className="auth-links">
        <Link href={buildInternalHref("/login", context)}>Back to login</Link>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
