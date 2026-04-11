import Image from "next/image";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  kicker?: string;
  target?: string;
  centered?: boolean;
  wide?: boolean;
  afterHeader?: ReactNode;
  footer?: ReactNode;
};

export function AuthShell({
  children,
  title,
  subtitle,
  kicker,
  target,
  centered = false,
  wide = false,
  afterHeader,
  footer,
}: AuthShellProps) {
  return (
    <main className={`auth-page${wide ? " auth-page--wide" : ""}`}>
      <div className={`auth-shell${wide ? " auth-shell--wide" : ""}`}>
        <section className="auth-panel">
          <div className="auth-panel__inner">
            <div className={centered ? "auth-center" : undefined}>
              <div className="auth-mark" aria-hidden="true">
                <Image
                  src="/logo/mfclogo.svg"
                  alt=""
                  width={60}
                  height={60}
                  className="auth-mark__image"
                  priority
                />
              </div>
              {kicker ? <div className="auth-kicker">{kicker}</div> : null}
              <h1 className="auth-title">{title}</h1>
              {subtitle ? <p className="auth-subtitle">{subtitle}</p> : null}
              {target ? (
                <div className="auth-target">
                  <span className="auth-target__dot" />
                  {target}
                </div>
              ) : null}
              {afterHeader}
            </div>

            {children}
            {footer}
          </div>
        </section>
      </div>
    </main>
  );
}

type AuthStatusProps = {
  tone: "info" | "error";
  children: ReactNode;
};

export function AuthStatus({ tone, children }: AuthStatusProps) {
  return (
    <div className={`auth-status auth-status--${tone}`}>
      {children}
    </div>
  );
}

type AuthAccessDeniedProps = {
  title?: string;
  message?: string;
};

export function AuthAccessDenied({
  title = "Access denied",
  message = "This page only works when the requested app and platform are provided.",
}: AuthAccessDeniedProps) {
  return (
    <AuthShell centered kicker="Denied" title={title} subtitle={message}>
      <AuthStatus tone="error">
        Open this page from one of the MFC apps to continue.
      </AuthStatus>
    </AuthShell>
  );
}
