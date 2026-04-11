"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  allowSelfSignup,
  buildInternalHref,
  getContextLabel,
  readContext,
  TURNSTILE_SITE_KEY,
} from "@/lib/config";
import {
  createBrowserSupabaseClient,
  getSessionTokens,
  getStoredSessionTokens,
} from "@/lib/supabase-client";
import { requestAuthHubHandoff } from "@/lib/handoff";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";
import { TurnstileWidget, type TurnstileWidgetHandle } from "@/components/turnstile";

function ButtonSpinner() {
  return <span className="auth-button__spinner" aria-hidden="true" />;
}

function SignupPageContent() {
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);
  const inviteToken = searchParams.get("invite")?.trim() || null;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(Boolean(inviteToken));
  const [inviteContext, setInviteContext] = useState<RegistrationInviteContext | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileWidgetHandle | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!inviteToken) {
      setInviteContext(null);
      setInviteLoading(false);
      return;
    }

    setInviteLoading(true);
    setError(null);

    void fetch(`${window.location.origin}/api/invites/context?${new URLSearchParams({
      invite: inviteToken,
    }).toString()}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          context?: RegistrationInviteContext | null;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Could not verify this invite link.");
        }

        return payload.context ?? null;
      })
      .then((resolvedInvite) => {
        if (cancelled) {
          return;
        }

        setInviteContext(resolvedInvite);
        if (!resolvedInvite) {
          setError("This invite link is invalid or has expired.");
          return;
        }

        setName((current) => current || resolvedInvite.full_name || "");
        setEmail((current) => current || resolvedInvite.email || "");
        setBusinessName((current) => current || resolvedInvite.business_name || "");
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not verify this invite link.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInviteLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [inviteToken]);

  if (!context) {
    return <AuthAccessDenied />;
  }

  const resetCaptcha = () => {
    captchaRef.current?.reset();
    setCaptchaToken(null);
  };

  const selfSignupAllowed = allowSelfSignup(context);
  const inviteMatchesContext =
    !inviteContext ||
    ((!inviteContext.requested_app || inviteContext.requested_app === context.app) &&
      (!inviteContext.requested_platform || inviteContext.requested_platform === context.platform));
  const inviteAccepted = Boolean(inviteContext && inviteMatchesContext);
  const isSelfRegistration = selfSignupAllowed && !inviteAccepted;
  const canSignup = selfSignupAllowed || inviteAccepted;
  const requireCaptcha = isSelfRegistration;
  const captchaRequired = Boolean(requireCaptcha);

  if (inviteToken && inviteLoading) {
    return (
      <AuthShell
        centered
        title={`Preparing ${getContextLabel(context)} sign up`}
        subtitle="Checking your invite before we continue."
      >
        <div className="auth-loader" />
      </AuthShell>
    );
  }

  if (inviteToken && !inviteAccepted) {
    return <AuthAccessDenied />;
  }

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSignup) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      if (captchaRequired && !captchaToken) {
        throw new Error("Complete the security check first.");
      }

      if (isSelfRegistration) {
        const response = await fetch("/api/register/self", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            fullName: name,
            phone,
            businessName,
            message: messageBody,
            requestedPlatform: context.platform,
            captchaToken,
          }),
        });

        const result = (await response.json()) as {
          error?: string;
          ok?: boolean;
          reused?: boolean;
        };

        if (!response.ok || !result.ok) {
          throw new Error(result.error || "Could not submit the registration request.");
        }

        setMessage(
          result.reused
            ? "Your registration request is already pending review. We will email you after approval."
            : "Registration request submitted. We will email you after approval."
        );
        setPhone("");
        setBusinessName("");
        setMessageBody("");
      } else {
        const registrationResponse = await fetch("/api/register/invite", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            fullName: name,
            inviteToken: inviteToken || "",
            password,
          }),
        });

        const registrationResult = (await registrationResponse.json()) as {
          error?: string;
          inviteContext?: RegistrationInviteContext | null;
          ok?: boolean;
        };

        if (!registrationResponse.ok || !registrationResult.ok) {
          throw new Error(registrationResult.error || "Could not create the invited account.");
        }

        setMessage("Account created. Signing you in...");

        const supabase = createBrowserSupabaseClient();
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: captchaRequired
            ? ({
                captchaToken: captchaToken ?? undefined,
              } as never)
            : undefined,
        });

        if (loginError) {
          throw loginError;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        const tokens = getSessionTokens(session) ?? getStoredSessionTokens();
        if (tokens) {
          const redirectUrl = await requestAuthHubHandoff(context, tokens);
          window.location.assign(redirectUrl);
          return;
        }

        setMessage("Account created. Check your email or sign in again to continue.");
      }
    } catch (reason) {
      const text =
        reason instanceof Error ? reason.message : "Could not create the account.";
      setError(text);
    } finally {
      resetCaptcha();
      setBusy(false);
    }
  };

  return (
    <AuthShell
      centered
      title={
        inviteAccepted
          ? `Set up your ${getContextLabel(context)} access`
          : `Request ${getContextLabel(context)} access`
      }
      subtitle={
        inviteAccepted
          ? "Finish your account setup to continue."
          : "Send your registration for review. You will set a password only after approval."
      }
    >
      {!canSignup ? (
        <>
          <AuthStatus tone="info">
            This app currently uses invite-only access.
          </AuthStatus>
          <div className="auth-links">
            <Link href={buildInternalHref("/login", context)}>Back to login</Link>
          </div>
        </>
      ) : (
        <>
          <form className="auth-form" onSubmit={handleSignup}>
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={inviteAccepted}
                required
              />
            </div>
            {isSelfRegistration ? (
              <>
                <div className="auth-field">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="business-name">Business name</label>
                  <input
                    id="business-name"
                    type="text"
                    autoComplete="organization"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    value={messageBody}
                    onChange={(event) => setMessageBody(event.target.value)}
                    rows={4}
                  />
                </div>
              </>
            ) : (
              <div className="auth-field auth-field--password">
                <label htmlFor="password">Password</label>
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
            )}
            <div className="auth-actions">
              <button className="auth-button" type="submit" disabled={busy}>
                <ButtonSpinner />
                <span>
                  {busy
                    ? isSelfRegistration
                      ? "Submitting request..."
                      : "Creating account..."
                    : isSelfRegistration
                      ? "Submit request"
                      : "Create account"}
                </span>
              </button>
            </div>
          </form>

          {isSelfRegistration ? (
            <TurnstileWidget
              ref={captchaRef}
              siteKey={TURNSTILE_SITE_KEY}
              onTokenChange={setCaptchaToken}
            />
          ) : null}

          {message ? <AuthStatus tone="info">{message}</AuthStatus> : null}
          {error ? <AuthStatus tone="error">{error}</AuthStatus> : null}

          <div className="auth-links">
            <Link href={buildInternalHref("/login", context)}>Back to login</Link>
          </div>
        </>
      )}
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <SignupPageContent />
    </Suspense>
  );
}
type RegistrationInviteContext = {
  approval_target: "user" | "staff";
  business_name: string | null;
  email: string;
  full_name: string | null;
  invite_expires_at: string | null;
  registration_id: string;
  registration_kind: "self_signup" | "user_invite" | "manager_invite";
  requested_app: string | null;
  requested_default_role: "buyer" | "seller" | null;
  requested_platform: string | null;
  requested_staff_role: "admin" | "manager" | "mfc_seller" | null;
  requested_user_type: "vendor" | "business" | null;
};
