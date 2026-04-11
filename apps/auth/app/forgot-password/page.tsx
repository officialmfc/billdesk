"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { buildInternalHref, readContext } from "@/lib/config";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";

function ButtonSpinner() {
  return <span className="auth-button__spinner" aria-hidden="true" />;
}

function ForgotPasswordPageContent() {
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!context) {
    return <AuthAccessDenied />;
  }

  const handleResetRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/reset-password/?${new URLSearchParams({
        app: context.app,
        platform: context.platform,
        ...(context.next ? { next: context.next } : {}),
        ...(context.returnTo ? { return_to: context.returnTo } : {}),
      }).toString()}`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo,
        }
      );

      if (resetError) {
        throw resetError;
      }

      setMessage("Password reset email sent. Use the link in your inbox to continue.");
    } catch (reason) {
      const text =
        reason instanceof Error
          ? reason.message
          : "Could not send the reset email.";
      setError(text);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      centered
      title="Reset your password"
      subtitle="We’ll send a recovery link to your email."
    >
      <form className="auth-form" onSubmit={handleResetRequest}>
        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="auth-actions">
          <button className="auth-button" type="submit" disabled={busy}>
            <ButtonSpinner />
            <span>{busy ? "Sending..." : "Send reset link"}</span>
          </button>
        </div>
      </form>

      {message ? <AuthStatus tone="info">{message}</AuthStatus> : null}
      {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}

      <div className="auth-links">
        <Link href={buildInternalHref("/login", context)}>Back to login</Link>
      </div>
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <ForgotPasswordPageContent />
    </Suspense>
  );
}
