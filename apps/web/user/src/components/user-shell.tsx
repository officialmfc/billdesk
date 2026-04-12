"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const { sellerSectionEnabled } = useUserApp();

  return (
    <div className="app-shell">
      <div className="mobile-shell">
        <main className="mobile-shell__content">{children}</main>

        <nav className="mobile-shell__nav" aria-label="Primary">
          {NAV_ITEMS.filter((item) => !("sellerOnly" in item) || sellerSectionEnabled).map((item) => (
            <Link
              key={item.href}
              className={`mobile-shell__nav-link ${
                isActivePath(pathname, item.href) ? "mobile-shell__nav-link--active" : ""
              }`}
              href={item.href}
              aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
            >
              <span className="mobile-shell__nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

      </div>
    </div>
  );
}
