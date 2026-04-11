import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="stack">
          <div className="row">
            <div className="brand-mark">M</div>
            <div>
              <p className="hero__eyebrow">MFC User</p>
              <h1 className="hero__title" style={{ fontSize: 28 }}>
                Page not found
              </h1>
            </div>
          </div>
          <p className="hero__subtitle">
            The page you requested does not exist.
          </p>
          <Link className="button" href="/bills">
            Go to Bills
          </Link>
        </div>
      </section>
    </main>
  );
}
