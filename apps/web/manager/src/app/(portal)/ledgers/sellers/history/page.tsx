import { Suspense } from "react";

import { SellerLedgerHistoryQueryPage } from "@/components/ledgers/route-query-pages";

export default function SellerLedgerHistoryRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading seller history...</div>}>
      <SellerLedgerHistoryQueryPage />
    </Suspense>
  );
}
