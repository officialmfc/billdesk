import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { appColors, appSpacing } from "@/lib/theme";
import type { BuyerPurchaseCard } from "@/repositories/types";

type Props = {
  card: BuyerPurchaseCard;
};

export function BuyerPurchaseCardView({ card }: Props) {
  const previousDue = Math.max(card.totalDueTillDate + card.datePayment - card.totalPurchase, 0);
  const grossDue = previousDue + card.totalPurchase;
  const hasOldDue = previousDue > 0;
  const remainingDue = card.totalDueTillDate;
  const metrics = [
    hasOldDue
      ? { label: "Old due", tone: "warning" as const, value: previousDue }
      : null,
    hasOldDue
      ? { label: "Total due", tone: "danger" as const, value: grossDue }
      : null,
    { label: "Payment (today)", tone: "success" as const, value: card.datePayment },
    remainingDue > 0
      ? { label: "Remaining", tone: "danger" as const, value: remainingDue }
      : null,
  ].filter(
    (
      metric
    ): metric is { label: string; tone: "danger" | "success" | "warning"; value: number } =>
      metric !== null
  );

  return (
    <SurfaceCard contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text variant="titleMedium">{card.businessName || card.name}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            {card.businessName ? card.name : "Buyer account"}
          </Text>
        </View>
        <Text variant="titleMedium">{formatCurrency(card.totalPurchase)}</Text>
      </View>

      <View style={styles.billWrap}>
        {card.billEntries.map((entry) => (
          <View key={`${entry.billNumber}-${entry.billDate}`} style={styles.billChip}>
            <Text variant="labelMedium" style={styles.billText}>
              {entry.billNumber}
            </Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {formatShortDate(entry.billDate)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text variant="labelSmall" style={[styles.headerCell, styles.serialCell]}>
            Sl
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.productCell]}>
            Item
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.weightCell]}>
            Weight
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.rateCell]}>
            Rate
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.amountCell]}>
            Amount
          </Text>
        </View>

        {card.items.map((item, index) => (
          <View
            key={item.id}
            style={[styles.tableRow, index === card.items.length - 1 ? styles.tableRowLast : null]}
          >
            <Text variant="bodySmall" style={[styles.serialValue, styles.serialCell]}>
              {item.serialNo}
            </Text>
            <Text variant="bodyMedium" style={styles.productCell} numberOfLines={1}>
              {item.label}
            </Text>
            <Text variant="bodySmall" style={[styles.weightValue, styles.weightCell]}>
              {item.weight.toFixed(2)} kg
            </Text>
            <Text variant="bodySmall" style={[styles.rateValue, styles.rateCell]}>
              {formatCurrency(item.pricePerKg)}
            </Text>
            <Text variant="bodyMedium" style={[styles.amountValue, styles.amountCell]}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
        <View style={[styles.tableRow, styles.totalRow]}>
          <Text variant="bodySmall" style={styles.serialCell}>
            {" "}
          </Text>
          <Text variant="bodyMedium" style={[styles.productCell, styles.totalLabel]}>
            Total
          </Text>
          <Text variant="bodySmall" style={[styles.weightValue, styles.weightCell]}>
            {card.totalWeight.toFixed(2)} kg
          </Text>
          <Text variant="bodySmall" style={styles.rateCell}>
            {" "}
          </Text>
          <Text variant="bodyMedium" style={[styles.amountValue, styles.amountCell]}>
            {formatCurrency(card.totalPurchase)}
          </Text>
        </View>
      </View>

      {metrics.length ? (
        <View style={styles.footerGrid}>
          {metrics.map((metric) => (
            <View key={metric.label} style={styles.footerMetric}>
              <Text variant="labelSmall" style={styles.footerLabel}>
                {metric.label}
              </Text>
              <Text
                variant="titleSmall"
                style={
                  metric.tone === "danger"
                    ? styles.dueValue
                    : metric.tone === "success"
                      ? styles.paymentValue
                      : styles.warningValue
                }
              >
                {formatCurrency(metric.value)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  billWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  billChip: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 999,
    borderWidth: 1,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  billText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  table: {
    borderColor: appColors.border,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: appColors.secondarySurface,
    borderBottomColor: appColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerCell: {
    color: appColors.mutedForeground,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  tableRow: {
    borderBottomColor: appColors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  productCell: {
    flex: 1.45,
  },
  serialCell: {
    flex: 0.42,
  },
  weightCell: {
    flex: 0.88,
  },
  rateCell: {
    flex: 0.84,
  },
  amountCell: {
    flex: 0.98,
  },
  serialValue: {
    color: appColors.mutedForeground,
    fontWeight: "700",
  },
  weightValue: {
    color: appColors.mutedForeground,
    textAlign: "right",
  },
  rateValue: {
    color: appColors.mutedForeground,
    textAlign: "right",
  },
  amountValue: {
    color: appColors.foreground,
    fontWeight: "700",
    textAlign: "right",
  },
  totalRow: {
    backgroundColor: appColors.secondarySurface,
  },
  totalLabel: {
    fontWeight: "700",
  },
  footerGrid: {
    flexDirection: "row",
    gap: 10,
  },
  footerMetric: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerLabel: {
    color: appColors.mutedForeground,
    textTransform: "uppercase",
  },
  dueValue: {
    color: appColors.danger,
  },
  warningValue: {
    color: appColors.warning,
  },
  paymentValue: {
    color: appColors.success,
  },
});
