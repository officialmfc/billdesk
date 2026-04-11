import { Suspense } from "react";

import { SellerDayLedgerPage } from "@/components/ledgers/SellerDayLedgerPage";

export default function SellerDayLedgerRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading seller day ledger...</div>}>
      <SellerDayLedgerPage />
    </Suspense>
  );
}
