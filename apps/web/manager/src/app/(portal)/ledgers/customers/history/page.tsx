import { Suspense } from "react";

import { CustomerLedgerHistoryQueryPage } from "@/components/ledgers/route-query-pages";

export default function CustomerLedgerHistoryRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading customer history...</div>}>
      <CustomerLedgerHistoryQueryPage />
    </Suspense>
  );
}
