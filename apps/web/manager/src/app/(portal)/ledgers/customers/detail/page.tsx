import { Suspense } from "react";

import { CustomerLedgerDetailQueryPage } from "@/components/ledgers/route-query-pages";

export default function CustomerLedgerDetailRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading customer ledger...</div>}>
      <CustomerLedgerDetailQueryPage />
    </Suspense>
  );
}
