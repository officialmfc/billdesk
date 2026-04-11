import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar, Text } from "react-native-paper";
import { ReceiptText } from "lucide-react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { printCustomerBillSheet } from "@/lib/mobile-print";
import { appColors } from "@/lib/theme";
import { ledgersRepository } from "@/repositories/ledgersRepository";

export default function CustomerBillScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; billId?: string }>();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const billId = typeof params.billId === "string" ? params.billId : "";
  const { data } = useRepositoryData(() => ledgersRepository.getCustomerBillPage(userId, billId), [userId, billId]);

  const bill = data?.bill;

  return (
    <ScreenLayout
      title={bill?.businessName || bill?.name || "Customer Bill"}
      subtitle="Bill lines, paid amount, and due"
      showBack
      onBack={() => router.back()}
      rightAction={
        bill ? <Appbar.Action icon="printer" onPress={() => void printCustomerBillSheet(bill)} /> : undefined
      }
    >
      {bill ? (
        <>
          <SurfaceCard contentStyle={styles.stack}>
            <Text variant="titleMedium">{bill.billNumber}</Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {formatLongDate(bill.date)}
            </Text>
          </SurfaceCard>

          <SurfaceCard contentStyle={styles.stack}>
            <SheetTable
              columns={[
                { key: "sl", label: "Sl", width: 48, align: "center" },
                { key: "item", label: "Item", width: 150 },
                { key: "weight", label: "Weight", width: 86, align: "right" },
                { key: "rate", label: "Rate", width: 86, align: "right" },
                { key: "amount", label: "Amount", width: 96, align: "right" },
              ]}
              rows={bill.lines}
              keyExtractor={(row) => row.id}
              renderCell={(row, column) => {
                switch (column.key) {
                  case "sl":
                    return <Text variant="bodySmall">{row.serialNo}</Text>;
                  case "item":
                    return (
                      <Text variant="bodyMedium" style={styles.primaryText}>
                        {row.productLabel}
                      </Text>
                    );
                  case "weight":
                    return <Text variant="bodySmall" style={styles.rightText}>{row.weightKg.toFixed(2)} kg</Text>;
                  case "rate":
                    return <Text variant="bodySmall" style={styles.rightText}>{formatCurrency(row.rate)}</Text>;
                  case "amount":
                    return (
                      <Text variant="bodySmall" style={[styles.rightText, styles.primaryText]}>
                        {formatCurrency(row.amount)}
                      </Text>
                    );
                  default:
                    return null;
                }
              }}
            />
          </SurfaceCard>

          <SurfaceCard contentStyle={styles.stack}>
            <View style={styles.rowBetween}>
              <Text variant="bodyMedium">Weight</Text>
              <Text variant="titleSmall">{bill.totalWeight.toFixed(2)} kg</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text variant="bodyMedium">Bill amount</Text>
              <Text variant="titleSmall">{formatCurrency(bill.totalAmount)}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text variant="bodyMedium">Paid</Text>
              <Text variant="titleSmall" style={styles.successText}>
                {formatCurrency(bill.amountPaid)}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text variant="bodyMedium">Due</Text>
              <Text variant="titleMedium" style={styles.dangerText}>
                {formatCurrency(bill.dueAmount)}
              </Text>
            </View>
          </SurfaceCard>
        </>
      ) : (
        <EmptyState
          title="Bill not found"
          description="Open a customer bill from the detail ledger to continue."
          icon={ReceiptText}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  rightText: {
    textAlign: "right",
  },
  successText: {
    color: appColors.success,
    fontWeight: "700",
  },
  dangerText: {
    color: appColors.danger,
    fontWeight: "700",
  },
});
