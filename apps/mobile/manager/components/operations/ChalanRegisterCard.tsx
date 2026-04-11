import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { StatusChip } from "@/components/ui/StatusChip";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { appColors, appSpacing } from "@/lib/theme";
import type { ChalanVerificationCard } from "@/repositories/types";

type Props = {
  card: ChalanVerificationCard;
  showBuyerNames: boolean;
  actionLabel?: string;
  actionDisabled?: boolean;
  onPrintPress?: () => void;
  onActionPress?: () => void;
};

function getStatusTone(status: string): "default" | "success" | "warning" | "danger" {
  if (status === "paid") {
    return "success";
  }

  if (status === "partially_paid") {
    return "warning";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "default";
}

export function ChalanRegisterCard({
  card,
  showBuyerNames,
  actionLabel,
  actionDisabled = false,
  onPrintPress,
  onActionPress,
}: Props) {
  const totalWeight = card.rows.reduce((sum, row) => sum + row.weight, 0);
  const totalAmount = card.rows.reduce((sum, row) => sum + row.amount, 0);
  const statusLabel = card.chalan.status.replaceAll("_", " ");

  return (
    <SurfaceCard contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text variant="titleMedium">{card.sellerName}</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            {card.chalan.chalan_number} • {formatLongDate(card.chalan.chalan_date)}
          </Text>
        </View>
        <StatusChip label={statusLabel} tone={getStatusTone(card.chalan.status)} />
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text variant="labelSmall" style={[styles.headerCell, styles.serialCell]}>
            Sl
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.primaryCell]}>
            {showBuyerNames ? "Buyer" : "Item"}
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.numberCell]}>
            Weight
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.numberCell]}>
            Rate
          </Text>
          <Text variant="labelSmall" style={[styles.headerCell, styles.amountCell]}>
            Amount
          </Text>
        </View>

        {card.rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text variant="bodySmall" style={styles.mutedText}>
              No sale lines were synced for this chalan.
            </Text>
          </View>
        ) : (
          card.rows.map((row, index) => (
            <View
              key={row.id}
              style={[styles.tableRow, index === card.rows.length - 1 ? styles.tableRowLast : null]}
            >
              <Text variant="bodySmall" style={[styles.serialValue, styles.serialCell]}>
                {row.serialNo}
              </Text>
              <View style={styles.primaryCell}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {showBuyerNames ? row.buyerName : row.label}
                </Text>
                <Text variant="bodySmall" style={styles.mutedText} numberOfLines={1}>
                  {showBuyerNames ? `${row.billNumber} • ${row.label}` : row.billNumber}
                </Text>
              </View>
              <Text variant="bodySmall" style={[styles.numberText, styles.numberCell]}>
                {row.weight.toFixed(2)} kg
              </Text>
              <Text variant="bodySmall" style={[styles.numberText, styles.numberCell]}>
                {formatCurrency(row.pricePerKg)}
              </Text>
              <Text variant="bodyMedium" style={[styles.amountText, styles.amountCell]}>
                {formatCurrency(row.amount)}
              </Text>
            </View>
          ))
        )}

        {card.rows.length ? (
          <View style={[styles.tableRow, styles.totalRow]}>
            <View style={styles.serialCell} />
            <Text variant="bodyMedium" style={[styles.totalLabel, styles.primaryCell]}>
              Total
            </Text>
            <Text variant="bodySmall" style={[styles.numberText, styles.numberCell]}>
              {totalWeight.toFixed(2)} kg
            </Text>
            <View style={styles.numberCell} />
            <Text variant="bodyMedium" style={[styles.amountText, styles.amountCell]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Deduction
          </Text>
          <Text variant="titleSmall" style={styles.deductionValue}>
            {formatCurrency(card.deductionAmount)}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Net Payable
          </Text>
          <Text variant="titleSmall">{formatCurrency(card.totals.netPayable)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Paid
          </Text>
          <Text variant="titleSmall" style={styles.paidValue}>
            {formatCurrency(card.totals.paid)}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text variant="labelSmall" style={styles.metricLabel}>
            Due
          </Text>
          <Text variant="titleSmall" style={styles.dueValue}>
            {formatCurrency(card.dueAmount)}
          </Text>
        </View>
      </View>

      <View style={styles.footerActions}>
        {onPrintPress ? (
          <Button compact icon="printer" mode="text" onPress={onPrintPress}>
            Print
          </Button>
        ) : null}
        {actionLabel && onActionPress && card.showRecordPayout ? (
          <Button mode="outlined" disabled={actionDisabled} onPress={onActionPress}>
            {actionLabel}
          </Button>
        ) : null}
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
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  mutedText: {
    color: appColors.mutedForeground,
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
  emptyRow: {
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  serialCell: {
    width: 28,
  },
  serialValue: {
    color: appColors.mutedForeground,
    fontWeight: "700",
  },
  primaryCell: {
    flex: 1.7,
    gap: 2,
  },
  numberCell: {
    flex: 1,
  },
  amountCell: {
    flex: 1.15,
  },
  numberText: {
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
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  footerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end",
  },
  metricCard: {
    backgroundColor: appColors.secondarySurface,
    borderColor: appColors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: "48.5%",
    flexGrow: 1,
    gap: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  metricLabel: {
    color: appColors.mutedForeground,
    textTransform: "uppercase",
  },
  paidValue: {
    color: appColors.success,
  },
  dueValue: {
    color: appColors.danger,
  },
  deductionValue: {
    color: appColors.warning,
  },
});
