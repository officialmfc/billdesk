"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

const DESKTOP_PROTOCOL_URL = "mfcmanager://oauth-callback";

function buildDesktopCallbackUrl(searchParams: URLSearchParams): string {
  const url = new URL(DESKTOP_PROTOCOL_URL);

  for (const [key, value] of searchParams.entries()) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export default function DesktopCallbackPage(): React.ReactElement {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"redirecting" | "fallback">("redirecting");

  const callbackUrl = useMemo(
    () => buildDesktopCallbackUrl(searchParams),
    [searchParams]
  );

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      window.location.replace(callbackUrl);
    }, 150);

    const fallbackTimer = window.setTimeout(() => {
      setStatus("fallback");
    }, 1600);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearTimeout(fallbackTimer);
    };
  }, [callbackUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {status === "redirecting" ? "Opening MFC Manager" : "Open MFC Manager"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {status === "redirecting"
            ? "Completing sign-in in the desktop app..."
            : "If the desktop app did not open automatically, use the button below."}
        </p>
        <a
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
          href={callbackUrl}
        >
          Continue In Desktop App
        </a>
      </div>
    </div>
  );
}
