import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatCurrency, formatShortDate } from "@/lib/formatters";
import { appColors, appSpacing } from "@/lib/theme";
import type { BuyerPurchaseCard } from "@/repositories/types";

type Props = {
  actionLabel?: string;
  card: BuyerPurchaseCard;
  onPrintPress?: () => void;
  onActionPress?: () => void;
};

export function BuyerPurchaseDailyCard({ actionLabel, card, onActionPress, onPrintPress }: Props) {
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
        <View style={styles.copy}>
          <Text variant="titleMedium">{card.businessName || card.name}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            {card.businessName ? card.name : "Buyer account"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.billBadge}>
            <Text variant="bodySmall" style={styles.billBadgeLabel}>
              Bill
            </Text>
            <Text variant="bodySmall">{card.billLabel}</Text>
          </View>
          <View style={[styles.statusBadge, card.paymentStatus === "paid" ? styles.statusPaid : card.paymentStatus === "partial" ? styles.statusPartial : styles.statusDue]}>
            <Text variant="labelSmall" style={[styles.statusText, card.paymentStatus === "paid" ? styles.statusPaidText : card.paymentStatus === "partial" ? styles.statusPartialText : styles.statusDueText]}>
              {card.paymentStatus === "partial" ? "Partial" : card.paymentStatus}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.billRow}>
        {card.billEntries.map((bill) => (
          <View key={`${bill.billNumber}-${bill.billDate}`} style={styles.billChip}>
            <Text variant="bodySmall">{bill.billNumber}</Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {formatShortDate(bill.billDate)}
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
            Product
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
            <Text variant="bodySmall" style={[styles.serialText, styles.serialCell]}>
              {item.serialNo}
            </Text>
            <Text variant="bodyMedium" style={styles.productCell} numberOfLines={1}>
              {item.label}
            </Text>
            <Text variant="bodySmall" style={[styles.weightText, styles.weightCell]}>
              {item.weight.toFixed(2)} kg
            </Text>
            <Text variant="bodySmall" style={[styles.rateText, styles.rateCell]}>
              {formatCurrency(item.pricePerKg)}
            </Text>
            <Text variant="bodyMedium" style={[styles.amountText, styles.amountCell]}>
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
          <Text variant="bodySmall" style={[styles.weightText, styles.weightCell]}>
            {card.totalWeight.toFixed(2)} kg
          </Text>
          <Text variant="bodySmall" style={styles.rateCell}>
            {" "}
          </Text>
          <Text variant="bodyMedium" style={[styles.amountText, styles.amountCell]}>
            {formatCurrency(card.totalPurchase)}
          </Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        {metrics.length ? (
          <View style={styles.summaryRow}>
            {metrics.map((metric) => (
              <View key={metric.label} style={styles.summaryCard}>
                <Text variant="labelSmall" style={styles.summaryLabel}>
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
        ) : (
          <View />
        )}

        <View style={styles.footerActions}>
          {onPrintPress ? (
            <Button compact icon="printer" mode="text" onPress={onPrintPress}>
              Print
            </Button>
          ) : null}
          {remainingDue <= 0 ? (
            <View style={styles.paidStamp}>
              <Text variant="labelSmall" style={styles.paidStampText}>
                All paid
              </Text>
            </View>
          ) : actionLabel && onActionPress ? (
            <Button mode="outlined" compact onPress={onActionPress}>
              {actionLabel}
            </Button>
          ) : null}
        </View>
      </View>
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
  purchaseValue: {
    color: appColors.primaryStrong,
    fontWeight: "700",
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  billBadge: {
    alignItems: "center",
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  billBadgeLabel: {
    color: appColors.mutedForeground,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
  },
  statusPartial: {
    backgroundColor: "#fef3c7",
  },
  statusDue: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    textTransform: "uppercase",
  },
  statusPaidText: {
    color: appColors.success,
  },
  statusPartialText: {
    color: appColors.warning,
  },
  statusDueText: {
    color: appColors.danger,
  },
  billRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  billChip: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  totalRow: {
    backgroundColor: appColors.secondarySurface,
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
  serialText: {
    color: appColors.mutedForeground,
    fontWeight: "700",
  },
  weightText: {
    color: appColors.foreground,
    textAlign: "right",
  },
  rateText: {
    color: appColors.foreground,
    textAlign: "right",
  },
  amountText: {
    color: appColors.foreground,
    fontWeight: "700",
    textAlign: "right",
  },
  totalLabel: {
    fontWeight: "700",
  },
  footerRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  footerActions: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexGrow: 1,
    gap: 2,
    minWidth: 92,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  summaryLabel: {
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
  paidStamp: {
    alignSelf: "flex-end",
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  paidStampText: {
    color: appColors.success,
    textTransform: "uppercase",
  },
});
