import { Suspense } from "react";

import { LoginClient } from "./login-client";

function LoadingShell(): React.JSX.Element {
  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="loading__card">
          <div className="spinner spinner--large" />
          <p className="muted">Loading sign in...</p>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingShell />}>
      <LoginClient />
    </Suspense>
  );
}
