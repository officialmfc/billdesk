import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { FileText } from "lucide-react-native";

import { LedgerSearchPanel } from "@/components/ledgers/LedgerSearchPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { printCustomerLedgerDetailSheet } from "@/lib/mobile-print";
import { appColors } from "@/lib/theme";
import { ledgersRepository } from "@/repositories/ledgersRepository";

function buildRoute(pathname: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }
  return `${pathname}?${new URLSearchParams(params).toString()}`;
}

export default function CustomerLedgerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const { data } = useRepositoryData(() => ledgersRepository.getCustomerLedgerDetailPage(userId), [userId]);

  return (
    <ScreenLayout
      title={data?.summary?.businessName || data?.summary?.name || "Customer Detail"}
      subtitle="Date-wise amount, paid, due, and bill detail"
      showBack
      onBack={() => router.back()}
      rightAction={
        userId ? (
          <View style={styles.headerActions}>
            <Button compact mode="text" onPress={() => router.push(buildRoute("/ledgers/customers/history", { userId }) as never)}>
              History
            </Button>
            <Appbar.Action
              icon="printer"
              onPress={() =>
                void printCustomerLedgerDetailSheet(
                  data?.summary?.businessName || data?.summary?.name || "Customer Ledger",
                  data?.purchaseRows ?? []
                )
              }
            />
          </View>
        ) : null
      }
    >
      {!userId ? (
        <LedgerSearchPanel
          title="Find customer ledger"
          description="Search a customer to open day-wise bill detail."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="No customer ledgers matched."
          onSelect={(nextUserId) =>
            router.push(buildRoute("/ledgers/customers/detail", { userId: nextUserId }) as never)
          }
        />
      ) : !data?.summary && !(data?.purchaseRows.length ?? 0) ? (
        <EmptyState
          title="Customer not found"
          description="The selected customer ledger could not be loaded."
          icon={FileText}
        />
      ) : (
        <>
          <SurfaceCard contentStyle={styles.summaryRow}>
            <View style={styles.copy}>
              <Text variant="titleMedium">{data?.summary?.businessName || data?.summary?.name}</Text>
              <Text variant="bodySmall" style={styles.mutedText}>
                Current due {formatCurrency(data?.summary?.currentDue ?? 0)}
              </Text>
            </View>
          </SurfaceCard>

          <SurfaceCard contentStyle={styles.stack}>
            <SheetTable
              columns={[
                { key: "date", label: "Date", width: 120 },
                { key: "amount", label: "Amount", width: 96, align: "right" },
                { key: "paid", label: "Paid", width: 96, align: "right" },
                { key: "due", label: "Due", width: 96, align: "right" },
                { key: "detail", label: "Detail", width: 76, align: "center" },
              ]}
              rows={data?.purchaseRows ?? []}
              keyExtractor={(row) => row.id}
              emptyTitle="No purchase history"
              emptyDescription="No bills were found for this customer."
              renderCell={(row, column) => {
                switch (column.key) {
                  case "date":
                    return (
                      <View style={styles.copy}>
                        <Text variant="bodyMedium" style={styles.primaryText}>
                          {formatLongDate(row.date)}
                        </Text>
                        <Text variant="bodySmall" style={styles.mutedText}>
                          {row.billNumber}
                        </Text>
                      </View>
                    );
                  case "amount":
                    return <Text variant="bodySmall" style={styles.rightText}>{formatCurrency(row.totalAmount)}</Text>;
                  case "paid":
                    return (
                      <Text variant="bodySmall" style={[styles.rightText, styles.successText]}>
                        {formatCurrency(row.paidAmount)}
                      </Text>
                    );
                  case "due":
                    return (
                      <Text variant="bodySmall" style={[styles.rightText, styles.dangerText]}>
                        {formatCurrency(row.dueAmount)}
                      </Text>
                    );
                  case "detail":
                    return (
                      <Button
                        compact
                        mode="text"
                        onPress={() =>
                          router.push(buildRoute("/ledgers/customers/bill", { billId: row.id, userId }) as never)
                        }
                      >
                        View
                      </Button>
                    );
                  default:
                    return null;
                }
              }}
            />
          </SurfaceCard>
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  primaryText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  mutedText: {
    color: appColors.mutedForeground,
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
