import { Suspense } from "react";

import { OAuthCallbackClient } from "./callback-client";

function LoadingShell(): React.JSX.Element {
  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="loading__card">
          <div className="spinner spinner--large" />
          <p className="muted">Completing sign in...</p>
        </div>
      </section>
    </main>
  );
}

export default function OAuthCallbackPage(): React.JSX.Element {
  return (
    <Suspense fallback={<LoadingShell />}>
      <OAuthCallbackClient />
    </Suspense>
  );
}
