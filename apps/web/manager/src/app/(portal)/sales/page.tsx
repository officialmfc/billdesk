"use client";

import { managerSalesHubSubtitle } from "@mfc/manager-ui";
import { useRouter } from "next/navigation";

import { SalesFlowActionList } from "@/components/sales/SalesFlowActionList";

export default function SalesPage(): React.ReactElement {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-3 py-2">
      <div className="space-y-1 px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales</h1>
          <p className="text-sm text-muted-foreground">{managerSalesHubSubtitle}</p>
        </div>
      </div>
      <SalesFlowActionList
        onSelectFlow={(href) => router.push(href)}
        showOperationsFooter
        onOpenOperations={() => router.push("/operations")}
      />
    </div>
  );
}
