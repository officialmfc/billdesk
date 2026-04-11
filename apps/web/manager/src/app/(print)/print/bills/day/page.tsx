import { Suspense } from "react";

import { BuyerPurchasePrintPage } from "@/components/print/PrintPages";

export default function BuyerPurchasePrintRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading print preview...</div>}>
      <BuyerPurchasePrintPage />
    </Suspense>
  );
}
