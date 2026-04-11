"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { requestAuthHubHandoff } from "@/lib/handoff";
import {
  allowSelfSignup,
  buildInternalHref,
  getContextLabel,
  getRequiredAccountLabel,
  readContext,
} from "@/lib/config";
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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        fill="#4285F4"
        d="M21.6 12.27c0-.71-.06-1.39-.16-2.05H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.36Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.89 6.62-2.4l-3.23-2.5c-.9.6-2.05.97-3.39.97-2.6 0-4.8-1.76-5.59-4.12H2.06v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.41 13.95a6 6 0 0 1 0-3.9V7.47H2.06a10 10 0 0 0 0 9.06l4.35-2.58Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.02c1.46 0 2.77.5 3.8 1.48l2.85-2.85A9.56 9.56 0 0 0 12 2a10 10 0 0 0-9.94 7.47l4.35 2.58C7.2 6.78 9.4 5.02 12 5.02Z"
      />
    </svg>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"password" | "google" | "magic-link" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!context) {
    return <AuthAccessDenied />;
  }

  const redirectToApp = async () => {
    const accessDecision = await verifyAuthHubAccess(context);
    if (!accessDecision.allowed) {
      throw new Error(accessDecision.reason);
    }

    const supabase = createBrowserSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const tokens = getSessionTokens(session) ?? getStoredSessionTokens();
    if (!tokens) {
      throw new Error("No authenticated session is available to hand off.");
    }

    const redirectUrl = await requestAuthHubHandoff(context, tokens);
    window.location.assign(redirectUrl);
  };

  const signInWithPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy("password");
    setMessage(null);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      setMessage("Authenticated. Handing the session to your app...");
      await redirectToApp();
    } catch (reason) {
      await createBrowserSupabaseClient().auth.signOut({ scope: "local" }).catch(() => undefined);
      const text =
        reason instanceof Error ? reason.message : "Could not sign in. Try again.";
      setError(text);
    } finally {
      setBusy(null);
    }
  };

  const signInWithGoogle = async () => {
    setBusy("google");
    setMessage(null);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/confirm/?${new URLSearchParams({
        app: context.app,
        platform: context.platform,
        ...(context.next ? { next: context.next } : {}),
        ...(context.returnTo ? { return_to: context.returnTo } : {}),
      }).toString()}`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            prompt: "select_account",
          },
        } as never,
      });

      if (oauthError) {
        throw oauthError;
      }

      if (!data?.url) {
        throw new Error("Google sign-in did not start.");
      }

      window.location.assign(data.url);
    } catch (reason) {
      const text =
        reason instanceof Error
          ? reason.message
          : "Could not start Google sign-in.";
      setError(text);
      setBusy(null);
    }
  };

  const requestMagicLink = async () => {
    setBusy("magic-link");
    setMessage(null);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const redirectTo = `${window.location.origin}/callback/?${new URLSearchParams({
        app: context.app,
        platform: context.platform,
        ...(context.next ? { next: context.next } : {}),
        ...(context.returnTo ? { return_to: context.returnTo } : {}),
      }).toString()}`;

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false,
        },
      });

      if (otpError) {
        throw otpError;
      }

      setMessage("Magic link sent. Check your email to continue.");
    } catch (reason) {
      const text =
        reason instanceof Error
          ? reason.message
          : "Could not send a magic link.";
      setError(text);
    } finally {
      setBusy(null);
    }
  };

  return (
    <AuthShell
      centered
      title={`Log in to ${getContextLabel(context)}`}
      subtitle="Enter your email and password to continue."
      target={getRequiredAccountLabel(context)}
    >
      <form className="auth-form auth-form--facebook" onSubmit={signInWithPassword}>
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

        <div className="auth-field auth-field--password">
          <label htmlFor="password">Password</label>
          <div className="auth-password-input">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
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
          <button className="auth-button" type="submit" disabled={busy !== null}>
            <ButtonSpinner />
            <span>
              {busy === "password" ? "Logging in..." : "Log in"}
            </span>
          </button>
          <button
            className="auth-button--secondary"
            type="button"
            onClick={requestMagicLink}
            disabled={busy !== null}
          >
            <ButtonSpinner />
            <span>
              {busy === "magic-link" ? "Sending..." : "Request magic link"}
            </span>
          </button>
        </div>
      </form>

      <div className="auth-links">
        <Link href={buildInternalHref("/forgot-password", context)}>
          Forgot password?
        </Link>
      </div>

      <div className="auth-divider">or</div>

      <div className="auth-actions">
        <button
          className="auth-button--secondary"
          type="button"
          onClick={signInWithGoogle}
          disabled={busy !== null}
        >
          <span className="auth-button__provider" aria-hidden="true">
            <GoogleIcon />
          </span>
          <ButtonSpinner />
          <span>
            {busy === "google" ? "Opening Google..." : "Continue with Google"}
          </span>
        </button>
      </div>

      {message ? <AuthStatus tone="info">{message}</AuthStatus> : null}
      {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}

      <div className="auth-links">
        {allowSelfSignup(context) ? (
          <Link href={buildInternalHref("/signup", context)}>Create account</Link>
        ) : (
          <Link href={buildInternalHref("/unauthorized", context)}>
            Invite only
          </Link>
        )}
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <LoginPageContent />
    </Suspense>
  );
}
