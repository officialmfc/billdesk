"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CustomerLedgerBillPage } from "./CustomerLedgerBillPage";
import { CustomerLedgerDetailPage } from "./CustomerLedgerDetailPage";
import { CustomerLedgerHistoryPage } from "./CustomerLedgerHistoryPage";
import { SellerLedgerHistoryPage } from "./SellerLedgerHistoryPage";

function getParam(
  searchParams: ReturnType<typeof useSearchParams>
,
  key: string
): string {
  return searchParams?.get(key) || "";
}

export function CustomerLedgerDetailQueryPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  return <CustomerLedgerDetailPage userId={getParam(searchParams, "userId")} />;
}

export function CustomerLedgerHistoryQueryPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  return <CustomerLedgerHistoryPage userId={getParam(searchParams, "userId")} />;
}

export function CustomerLedgerBillQueryPage(): React.JSX.Element {
  const searchParams = useSearchParams();

  return (
    <CustomerLedgerBillPage
      billId={getParam(searchParams, "billId")}
      userId={getParam(searchParams, "userId")}
    />
  );
}

export function SellerLedgerHistoryQueryPage(): React.JSX.Element {
  const searchParams = useSearchParams();
  return <SellerLedgerHistoryPage userId={getParam(searchParams, "userId")} />;
}

export function LegacyCustomerDayRedirectQueryPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams?.toString();
    router.replace(query ? `/ledgers/customers/day?${query}` : "/ledgers/customers/day");
  }, [router, searchParams]);

  return <div className="py-10 text-center text-sm text-muted-foreground">Redirecting to customer ledger...</div>;
}
