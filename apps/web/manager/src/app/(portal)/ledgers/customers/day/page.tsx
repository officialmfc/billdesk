import { Suspense } from "react";

import { CustomerDayLedgerPage } from "@/components/ledgers/CustomerDayLedgerPage";

export default function CustomerDayLedgerRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading customer day ledger...</div>}>
      <CustomerDayLedgerPage />
    </Suspense>
  );
}
