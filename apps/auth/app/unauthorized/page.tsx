"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  buildInternalHref,
  getContextLabel,
  readContext,
} from "@/lib/config";
import { AuthAccessDenied, AuthShell, AuthStatus } from "@/components/auth-shell";

function UnauthorizedPageContent() {
  const searchParams = useSearchParams();
  const context = useMemo(() => readContext(searchParams), [searchParams]);

  if (!context) {
    return <AuthAccessDenied />;
  }

  return (
    <AuthShell
      centered
      title={`This account cannot open ${getContextLabel(context)}`}
      subtitle="Use a different account or ask an admin for access."
    >
      <AuthStatus tone="error">
        The app accepted your sign-in, but did not find an active profile or
        allowed role for this account.
      </AuthStatus>
      <div className="auth-links auth-links--centered">
        <Link href={buildInternalHref("/login", context)}>Try another account</Link>
      </div>
    </AuthShell>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<main className="auth-page" />}>
      <UnauthorizedPageContent />
    </Suspense>
  );
}
