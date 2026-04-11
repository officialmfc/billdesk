import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { appColors, appSpacing } from "@/lib/theme";
import type { CustomerAccountRow, SellerAccountRow } from "@/repositories/types";

type Props = {
  actionLabel: string;
  account: CustomerAccountRow | SellerAccountRow;
  onActionPress: () => void;
};

export function PaymentAccountCard({ actionLabel, account, onActionPress }: Props) {
  return (
    <SurfaceCard contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.copy}>
          <Text variant="titleMedium">{account.businessName || account.name}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            {account.latestDueDate ? `Latest due ${formatShortDate(account.latestDueDate)}` : "No recent due"}
          </Text>
        </View>
        <Text variant="titleMedium" style={styles.dueValue}>
          {formatCurrency(account.totalDue)}
        </Text>
      </View>

      <View style={styles.metricRow}>
        {account.recentDueEntries.map((entry) => (
          <View key={`${entry.reference}-${entry.date}`} style={styles.metricCard}>
            <Text variant="labelSmall" style={styles.metricLabel}>
              {formatShortDate(entry.date)}
            </Text>
            <Text variant="titleSmall" style={styles.dueValue}>
              {formatCurrency(entry.amount)}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {entry.reference}
            </Text>
          </View>
        ))}
        {account.lastPaymentDate ? (
          <View style={styles.metricCard}>
            <Text variant="labelSmall" style={styles.metricLabel}>
              Last Payment
            </Text>
            <Text variant="titleSmall" style={styles.successValue}>
              {formatShortDate(account.lastPaymentDate)}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {account.openItemCount} open items
            </Text>
          </View>
        ) : null}
      </View>

      <Button mode="outlined" onPress={onActionPress}>
        {actionLabel}
      </Button>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: appSpacing.md,
  },
  headerRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  dueValue: {
    color: appColors.danger,
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "48%",
    flexGrow: 1,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    color: appColors.mutedForeground,
    textTransform: "uppercase",
  },
  successValue: {
    color: appColors.success,
  },
});
