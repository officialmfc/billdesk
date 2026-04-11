import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { FileCheck, FileText, Home, PlusCircle } from "lucide-react-native";
import {
  managerSaleFlowDefinitions,
  managerSalesHubOperationsPrompt,
  type ManagerSaleFlowKey,
} from "@mfc/manager-ui";

import { ActionCard } from "@/components/ui/ActionCard";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { appColors } from "@/lib/theme";

type Props = {
  isOnline: boolean;
  onSelectFlow: (href: string) => void;
  showOperationsFooter?: boolean;
  onOpenOperations?: () => void;
};

const iconByFlow: Record<ManagerSaleFlowKey, typeof FileText> = {
  auction: FileText,
  direct: Home,
  batch: FileCheck,
  floor: PlusCircle,
};

export function SaleFlowActionList({
  isOnline,
  onSelectFlow,
  showOperationsFooter = false,
  onOpenOperations,
}: Props) {
  return (
    <View style={styles.stack}>
      {managerSaleFlowDefinitions.map((flow) => {
        const Icon = iconByFlow[flow.key];

        return (
          <ActionCard
            key={flow.key}
            title={flow.hubTitle}
            description={flow.hubDescription}
            meta={flow.hubMeta}
            icon={Icon}
            disabled={!isOnline}
            onPress={() => onSelectFlow(flow.mobileHref)}
          />
        );
      })}

      {showOperationsFooter ? (
        <SurfaceCard contentStyle={styles.footerCard}>
          <Text variant="titleMedium">Need operational context first?</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>
            {managerSalesHubOperationsPrompt}
          </Text>
          <Button mode="outlined" onPress={onOpenOperations}>
            Open Bill & Chalan
          </Button>
        </SurfaceCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  footerCard: {
    gap: 12,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
