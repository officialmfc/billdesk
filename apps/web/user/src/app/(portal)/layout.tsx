"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { UserShell } from "@/components/user-shell";
import { useUserApp } from "@/components/providers/user-app-provider";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useUserApp();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname || "/bills")}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <main className="loading">
        <section className="panel auth-card">
          <div className="loading__card">
            <div className="spinner spinner--large" />
            <p className="muted">Loading your account...</p>
          </div>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="loading">
        <section className="panel auth-card">
          <div className="loading__card">
            <div className="spinner spinner--large" />
            <p className="muted">Redirecting to sign in...</p>
          </div>
        </section>
      </main>
    );
  }

  return <UserShell>{children}</UserShell>;
}
