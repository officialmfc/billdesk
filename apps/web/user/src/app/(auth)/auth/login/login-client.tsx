"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useUserApp } from "@/components/providers/user-app-provider";
import {
  openHostedUserLogin,
  openHostedUserPasswordReset,
} from "@/lib/supabase";

function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}

export function LoginClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, profile } = useUserApp();
  const [busy, setBusy] = useState<"login" | "reset" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const redirectPath = useMemo(() => {
    const value = searchParams.get("redirect") || searchParams.get("next");
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
      return "/bills";
    }
    return value;
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isLoading, redirectPath, router]);

  const handleHostedLogin = async () => {
    setBusy("login");
    setMessage("Opening secure sign in...");
    try {
      await openHostedUserLogin(undefined, redirectPath);
    } finally {
      setBusy(null);
    }
  };

  const handlePasswordReset = async () => {
    setBusy("reset");
    setMessage("Opening password reset...");
    try {
      await openHostedUserPasswordReset(undefined, redirectPath);
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) {
    return (
      <main className="auth-page">
        <section className="panel auth-card">
          <div className="loading__card">
            <div className="spinner spinner--large" />
            <p className="muted">Checking your session...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="stack">
          <div className="row">
            <div className="auth-logo" aria-hidden="true">
              <span style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>
                M
              </span>
            </div>
            <div>
              <p className="hero__eyebrow">MFC User</p>
              <h1 className="hero__title" style={{ fontSize: 30 }}>
                User Web
              </h1>
              <p className="hero__subtitle" style={{ marginTop: 6 }}>
                Secure sign-in opens in the auth hub and returns here.
              </p>
            </div>
          </div>

          <div className="card panel panel--soft">
            <div className="card__body">
              <div className="stack stack--tight">
                <p className="muted">
                  Signed in already? We will take you back to{" "}
                  <strong>{profile?.businessName || profile?.name || "your bills"}</strong>.
                </p>

                <button
                  className="button"
                  type="button"
                  onClick={() => void handleHostedLogin()}
                  disabled={Boolean(busy)}
                >
                  {busy === "login" ? (
                    <>
                      <Spinner />
                      <span>Opening...</span>
                    </>
                  ) : (
                    "Continue to secure sign in"
                  )}
                </button>

                <button
                  className="button button--secondary"
                  type="button"
                  onClick={() => void handlePasswordReset()}
                  disabled={Boolean(busy)}
                >
                  {busy === "reset" ? (
                    <>
                      <Spinner />
                      <span>Opening...</span>
                    </>
                  ) : (
                    "Reset password"
                  )}
                </button>
              </div>
            </div>
          </div>

          {message ? <div className="auth-status auth-status--info">{message}</div> : null}
        </div>
      </section>
    </main>
  );
}
