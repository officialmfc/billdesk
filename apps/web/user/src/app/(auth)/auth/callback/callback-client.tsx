"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useUserApp } from "@/components/providers/user-app-provider";
import { completeOAuthRedirect } from "@/lib/supabase";

function parseCurrentUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}

function sanitizeNextPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/bills";
  }

  return value;
}

export function OAuthCallbackClient(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading } = useUserApp();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing sign in...");

  const nextPath = useMemo(() => sanitizeNextPath(searchParams.get("next")), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const complete = async () => {
      try {
        const handled = await completeOAuthRedirect(parseCurrentUrl());
        if (!handled) {
          throw new Error("This callback does not contain a valid session.");
        }

        if (cancelled) {
          return;
        }

        setStatus("success");
        setMessage("Signed in. Opening your account...");
        window.setTimeout(() => {
          router.replace(nextPath);
        }, 250);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Could not complete sign in."
        );
      }
    };

    void complete();

    return () => {
      cancelled = true;
    };
  }, [nextPath, router, searchParams]);

  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="stack">
          <div className="loading__card">
            <div className="spinner spinner--large" />
            <h1 className="hero__title" style={{ fontSize: 28, textAlign: "center" }}>
              Signing you in
            </h1>
            <p className="muted" style={{ textAlign: "center" }}>
              {isLoading ? "Preparing your session..." : message}
            </p>
          </div>

          {status === "error" ? (
            <div className="auth-status auth-status--error">{message}</div>
          ) : status === "success" ? (
            <div className="auth-status auth-status--success">{message}</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
