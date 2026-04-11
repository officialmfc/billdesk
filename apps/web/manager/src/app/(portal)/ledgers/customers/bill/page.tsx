import { Suspense } from "react";

import { CustomerLedgerBillQueryPage } from "@/components/ledgers/route-query-pages";

export default function CustomerLedgerBillRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading bill detail...</div>}>
      <CustomerLedgerBillQueryPage />
    </Suspense>
  );
}
