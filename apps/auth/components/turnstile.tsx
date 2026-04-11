"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

import { AuthStatus } from "./auth-shell";

export type TurnstileWidgetHandle = {
  reset: () => void;
  getToken: () => string | null;
};

type TurnstileWidgetProps = {
  siteKey: string | null;
  onTokenChange: (token: string | null) => void;
};

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
  getResponse: (widgetId?: string) => string | null;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "mfc-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Turnstile failed to load.")),
        { once: true }
      );
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load."));
    document.head.appendChild(script);
  });
}

export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, TurnstileWidgetProps>(
  function TurnstileWidget({ siteKey, onTokenChange }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.reset(widgetIdRef.current);
        }
        onTokenChange(null);
      },
      getToken: () => {
        if (!widgetIdRef.current || !window.turnstile) {
          return null;
        }
        return window.turnstile.getResponse(widgetIdRef.current) || null;
      },
    }));

    useEffect(() => {
      let cancelled = false;

      async function renderWidget() {
        if (!siteKey) {
          setLoadError("Turnstile site key is missing.");
          return;
        }

        if (!containerRef.current) {
          return;
        }

        try {
          setLoadError(null);
          await loadTurnstileScript();

          if (cancelled || !containerRef.current || !window.turnstile) {
            return;
          }

          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          }

          containerRef.current.innerHTML = "";
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: "light",
            callback: (token: string) => {
              onTokenChange(token);
            },
            "expired-callback": () => {
              onTokenChange(null);
            },
            "error-callback": () => {
              onTokenChange(null);
            },
          });
        } catch (error) {
          if (!cancelled) {
            setLoadError(error instanceof Error ? error.message : "Turnstile could not load.");
          }
        }
      }

      void renderWidget();

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [onTokenChange, siteKey]);

    if (!siteKey) {
      return (
        <AuthStatus tone="error">
          Turnstile is not configured. Add <code>NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> to enable this form.
        </AuthStatus>
      );
    }

    return (
      <div className="auth-captcha">
        <div ref={containerRef} />
        {loadError ? <AuthStatus tone="error">{loadError}</AuthStatus> : null}
      </div>
    );
  }
);
