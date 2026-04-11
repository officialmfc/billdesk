import { Suspense } from "react";

import { CustomerLedgerDetailPrintPage } from "@/components/print/PrintPages";

export default function CustomerLedgerDetailPrintRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading print preview...</div>}>
      <CustomerLedgerDetailPrintPage />
    </Suspense>
  );
}
