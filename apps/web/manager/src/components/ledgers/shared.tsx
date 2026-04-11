"use client";

import { UserAutocomplete } from "@/components/sales/auction-sale/UserAutocomplete";
import type { LedgerSearchUser } from "@mfc/manager-workflows";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseLoader } from "@/hooks/useSupabaseLoader";
import { emptyWebLedgersReadModel } from "@/lib/ledger-view-model";
import { loadWebLedgersReadModel } from "@/lib/web-remote-read-model";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export function formatLedgerCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export function formatLedgerDate(value: string): string {
  return format(new Date(`${value}T00:00:00`), "dd MMM yyyy");
}

export function LedgerMetric({
  label,
  tone = "default",
  value,
}: {
  label: string;
  tone?: "default" | "danger" | "success";
  value: string;
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "success"
        ? "text-green-600"
        : "text-foreground";

  return (
    <Card>
      <CardContent className="space-y-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className={`text-xl font-semibold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export function useLedgerReadModel() {
  const loader = useCallback(
    (supabase: Parameters<typeof loadWebLedgersReadModel>[0]) => loadWebLedgersReadModel(supabase),
    []
  );

  return useSupabaseLoader(loader, {
    initialData: emptyWebLedgersReadModel,
  });
}

export function LedgerNav() {
  const pathname = usePathname();
  const items = [
    { href: "/ledgers/customers/day", label: "Customers", matchPrefix: "/ledgers/customers" },
    { href: "/ledgers/sellers/day", label: "Sellers", matchPrefix: "/ledgers/sellers" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.matchPrefix);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-accent"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function LedgerSubnav({
  items,
}: {
  items: Array<{ href: string; label: string; matchPrefixes?: string[] }>;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.matchPrefixes ?? []).some(
            (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
          );
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-sm font-medium transition-colors",
              active
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function CustomerLedgerSubnav(): React.JSX.Element {
  return (
    <LedgerSubnav
      items={[
        { href: "/ledgers/customers/day", label: "Day" },
        {
          href: "/ledgers/customers/detail",
          label: "Detail",
          matchPrefixes: ["/ledgers/customers/detail", "/ledgers/customers/bill"],
        },
        { href: "/ledgers/customers/history", label: "History" },
      ]}
    />
  );
}

export function SellerLedgerSubnav(): React.JSX.Element {
  return (
    <LedgerSubnav
      items={[
        { href: "/ledgers/sellers/day", label: "Day" },
        { href: "/ledgers/sellers/history", label: "History" },
      ]}
    />
  );
}

export function LedgerUserSearchCard({
  candidateUsers,
  description,
  emptyMessage,
  placeholder,
  targetPath,
  title,
}: {
  candidateUsers?: LedgerSearchUser[];
  description: string;
  emptyMessage?: string;
  placeholder: string;
  targetPath: string;
  title: string;
}): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {emptyMessage ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : null}
        <div className="max-w-md">
          <UserAutocomplete
            value={query}
            onChange={(name, userId) => {
              setQuery(name);

              if (userId) {
                router.push(`${targetPath}?userId=${encodeURIComponent(userId)}`);
              }
            }}
            placeholder={placeholder}
            staticSuggestions={candidateUsers}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function LedgerPageFlowNav({
  next,
  previous,
}: {
  next?: { href: string; label: string };
  previous?: { href: string; label: string };
}): React.JSX.Element | null {
  if (!previous && !next) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      {previous ? (
        <Link
          href={previous.href}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>{previous.label}</span>
        </Link>
      ) : (
        <span />
      )}

      {next ? (
        <Link
          href={next.href}
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>{next.label}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
