import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { FileText } from "lucide-react-native";

import { LedgerSearchPanel } from "@/components/ledgers/LedgerSearchPanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { ledgersRepository } from "@/repositories/ledgersRepository";

function buildRoute(pathname: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }
  return `${pathname}?${new URLSearchParams(params).toString()}`;
}

export default function CustomerLedgerHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const { data } = useRepositoryData(() => ledgersRepository.getCustomerLedgerHistoryPage(userId), [userId]);

  return (
    <ScreenLayout
      title={data?.summary?.businessName || data?.summary?.name || "Customer History"}
      subtitle="Date-wise billed and payment totals"
      showBack
      onBack={() => router.back()}
      rightAction={
        userId ? (
          <Button compact mode="text" onPress={() => router.push(buildRoute("/ledgers/customers/detail", { userId }) as never)}>
            Detail
          </Button>
        ) : null
      }
    >
      {!userId ? (
        <LedgerSearchPanel
          title="Find customer ledger"
          description="Search a customer to open bill and payment history."
          placeholder="Search customer..."
          users={data?.searchUsers ?? []}
          emptyMessage="No customer ledgers matched."
          onSelect={(nextUserId) =>
            router.push(buildRoute("/ledgers/customers/history", { userId: nextUserId }) as never)
          }
        />
      ) : (
        <SurfaceCard contentStyle={styles.stack}>
          <SheetTable
            columns={[
              { key: "date", label: "Date", width: 140 },
              { key: "bill", label: "Bill", width: 110, align: "right" },
              { key: "payment", label: "Payment", width: 120, align: "right" },
            ]}
            rows={data?.historyRows ?? []}
            keyExtractor={(row) => row.date}
            emptyTitle="No customer history"
            emptyDescription="No bill or payment history was found for this customer."
            renderCell={(row, column) => {
              switch (column.key) {
                case "date":
                  return (
                    <Text variant="bodyMedium" style={styles.primaryText}>
                      {formatLongDate(row.date)}
                    </Text>
                  );
                case "bill":
                  return (
                    <Text variant="bodySmall" style={styles.rightText}>
                      {formatCurrency(row.billed)}
                    </Text>
                  );
                case "payment":
                  return (
                    <Text variant="bodySmall" style={[styles.rightText, styles.successText]}>
                      {formatCurrency(row.payment)}
                    </Text>
                  );
                default:
                  return null;
              }
            }}
          />
        </SurfaceCard>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
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
});
