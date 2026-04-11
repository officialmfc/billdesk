"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useUserApp } from "@/components/providers/user-app-provider";

const NAV_ITEMS = [
  { href: "/bills", label: "Bills" },
  { href: "/history", label: "History" },
  { href: "/seller", label: "Seller", sellerOnly: true },
  { href: "/settings", label: "Settings" },
] as const;

function isActivePath(pathname: string | null, href: string): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function UserShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, profile, sellerSectionEnabled } = useUserApp();

  return (
    <div className="app-shell">
      <div className="page page--wide">
        <header className="site-top">
          <div className="site-top__brand">
            <div className="brand-mark" aria-hidden="true">
              M
            </div>
            <div>
              <p className="site-top__title">MFC User</p>
              <p className="site-top__desc">
                {profile?.businessName || profile?.name || "Bills, history, seller, and settings"}
              </p>
            </div>
          </div>

          <button
            className="button button--secondary"
            type="button"
            onClick={() => void logout().then(() => router.replace("/auth/login"))}
          >
            Log out
          </button>
        </header>

        <nav className="nav">
          {NAV_ITEMS.filter(
            (item) => !("sellerOnly" in item) || sellerSectionEnabled
          ).map((item) => (
            <Link
              key={item.href}
              className={`nav-link ${isActivePath(pathname, item.href) ? "nav-link--active" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main style={{ padding: "16px 0 28px" }}>{children}</main>
      </div>
    </div>
  );
}
