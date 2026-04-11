import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { BookCopy } from "lucide-react-native";

import { DateNavigator } from "@/components/ui/DateNavigator";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, getTodayDateString, shiftDateString } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { ledgersRepository } from "@/repositories/ledgersRepository";

function buildRoute(pathname: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }
  return `${pathname}?${new URLSearchParams(params).toString()}`;
}

export default function SellerDayLedgerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateStr = typeof params.date === "string" ? params.date : getTodayDateString();
  const { data } = useRepositoryData(() => ledgersRepository.getSellerDayLedger(dateStr), [dateStr]);

  const setDate = (nextDate: string) => {
    router.setParams({ date: nextDate });
  };

  return (
    <ScreenLayout title="Seller Day" subtitle="Selected-date chalan sheet" showBack onBack={() => router.back()}>
      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDate(shiftDateString(dateStr, -1))}
        onNext={() => setDate(shiftDateString(dateStr, 1))}
        onSelectDate={setDate}
        onToday={() => setDate(getTodayDateString())}
      />

      {data ? (
        <SurfaceCard contentStyle={styles.stack}>
          <SheetTable
            columns={[
              { key: "name", label: "Name", width: 170 },
              { key: "chalan", label: "Chalan", width: 150 },
              { key: "amount", label: "Amount", width: 100, align: "right" },
              { key: "view", label: "View", width: 74, align: "center" },
            ]}
            rows={data}
            keyExtractor={(row) => row.sellerId}
            emptyTitle="No seller chalans"
            emptyDescription="No selected-date chalans were found for sellers."
            renderCell={(row, column) => {
              switch (column.key) {
                case "name":
                  return (
                    <Text variant="bodyMedium" style={styles.primaryText}>
                      {row.name}
                    </Text>
                  );
                case "chalan":
                  return <Text variant="bodySmall">{row.todayReference}</Text>;
                case "amount":
                  return <Text variant="bodySmall" style={styles.rightText}>{formatCurrency(row.todayAmount)}</Text>;
                case "view":
                  return (
                    <Button
                      compact
                      mode="text"
                      onPress={() =>
                        router.push(buildRoute("/ledgers/sellers/history", { userId: row.sellerId }) as never)
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
      ) : (
        <EmptyState
          title="No seller chalans"
          description="No selected-date chalans were found for sellers."
          icon={BookCopy}
        />
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
});
