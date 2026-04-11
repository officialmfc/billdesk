import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Text } from "react-native-paper";
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

export default function SellerLedgerHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string }>();
  const userId = typeof params.userId === "string" ? params.userId : "";
  const { data } = useRepositoryData(() => ledgersRepository.getSellerLedgerHistoryPage(userId), [userId]);

  return (
    <ScreenLayout
      title={data?.summary?.businessName || data?.summary?.name || "Seller History"}
      subtitle="Date-wise net payable and paid"
      showBack
      onBack={() => router.back()}
    >
      {!userId ? (
        <LedgerSearchPanel
          title="Find seller ledger"
          description="Search a seller to open payout history."
          placeholder="Search seller..."
          users={data?.searchUsers ?? []}
          emptyMessage="No seller ledgers matched."
          onSelect={(nextUserId) =>
            router.push(buildRoute("/ledgers/sellers/history", { userId: nextUserId }) as never)
          }
        />
      ) : (
        <SurfaceCard contentStyle={styles.stack}>
          <SheetTable
            columns={[
              { key: "date", label: "Date", width: 140 },
              { key: "net", label: "Net payable", width: 120, align: "right" },
              { key: "paid", label: "Paid", width: 110, align: "right" },
            ]}
            rows={data?.historyRows ?? []}
            keyExtractor={(row) => row.date}
            emptyTitle="No seller history"
            emptyDescription="No net payable or payout history was found for this seller."
            renderCell={(row, column) => {
              switch (column.key) {
                case "date":
                  return (
                    <Text variant="bodyMedium" style={styles.primaryText}>
                      {formatLongDate(row.date)}
                    </Text>
                  );
                case "net":
                  return (
                    <Text variant="bodySmall" style={styles.rightText}>
                      {formatCurrency(row.netPayable)}
                    </Text>
                  );
                case "paid":
                  return (
                    <Text variant="bodySmall" style={[styles.rightText, styles.successText]}>
                      {formatCurrency(row.paid)}
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
