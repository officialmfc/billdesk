import { useRouter } from "expo-router";
import { managerSalesHubSubtitle } from "@mfc/manager-ui";

import { SaleFlowActionList } from "@/components/sales/SaleFlowActionList";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useConnectivity } from "@/hooks/useConnectivity";

export default function SalesHubScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();

  return (
    <ScreenLayout title="Sales" subtitle={managerSalesHubSubtitle}>
      <OfflineReadOnlyBanner visible={!isOnline} />
      <SaleFlowActionList
        isOnline={isOnline}
        onSelectFlow={(href) => router.push(href as never)}
        showOperationsFooter
        onOpenOperations={() => router.push("/operations")}
      />
    </ScreenLayout>
  );
}
