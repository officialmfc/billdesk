import { Suspense } from "react";

import { CustomerDayLedgerPrintPage } from "@/components/print/PrintPages";

export default function CustomerDayLedgerPrintRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading print preview...</div>}>
      <CustomerDayLedgerPrintPage />
    </Suspense>
  );
}
