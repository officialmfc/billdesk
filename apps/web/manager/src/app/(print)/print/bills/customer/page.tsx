import { Suspense } from "react";

import { CustomerBillPrintPage } from "@/components/print/PrintPages";

export default function CustomerBillPrintRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading print preview...</div>}>
      <CustomerBillPrintPage />
    </Suspense>
  );
}
