import { Suspense } from "react";

import { ChalanPrintPage } from "@/components/print/PrintPages";

export default function ChalanPrintRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Loading print preview...</div>}>
      <ChalanPrintPage />
    </Suspense>
  );
}
