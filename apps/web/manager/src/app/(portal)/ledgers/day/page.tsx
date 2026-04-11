import { Suspense } from "react";

import { LegacyCustomerDayRedirectQueryPage } from "@/components/ledgers/route-query-pages";

export default function DayLedgerRoute(): React.ReactElement {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-muted-foreground">Redirecting...</div>}>
      <LegacyCustomerDayRedirectQueryPage />
    </Suspense>
  );
}
