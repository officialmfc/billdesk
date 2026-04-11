import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, Chip, Text } from "react-native-paper";

import { DateNavigator } from "@/components/ui/DateNavigator";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable, type SheetTableColumn } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { formatCurrency, getTodayDateString, shiftDateString } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { ledgersRepository } from "@/repositories/ledgersRepository";
import { printCustomerDayLedgerSheet } from "@/lib/mobile-print";
import type { DayCustomerLedgerRow } from "@mfc/manager-workflows";
import { BookCopy } from "lucide-react-native";

function buildRoute(pathname: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }
  return `${pathname}?${new URLSearchParams(params).toString()}`;
}

const purchasedColumns: Array<SheetTableColumn<string>> = [
  { key: "name", label: "Name", width: 150 },
  { key: "old", label: "Old", width: 110, align: "right" },
  { key: "today", label: "Today", width: 92, align: "right" },
  { key: "total", label: "Total", width: 96, align: "right" },
  { key: "payment", label: "Payment", width: 98, align: "right" },
  { key: "plus", label: "+", width: 54, align: "center" },
  { key: "view", label: "View", width: 74, align: "center" },
] as const;

const dueOnlyColumns: Array<SheetTableColumn<string>> = [
  { key: "name", label: "Name", width: 150 },
  { key: "old", label: "Old", width: 120, align: "right" },
  { key: "total", label: "Total", width: 96, align: "right" },
  { key: "payment", label: "Payment", width: 98, align: "right" },
  { key: "plus", label: "+", width: 54, align: "center" },
  { key: "view", label: "View", width: 74, align: "center" },
] as const;

function OldDueCell({ row }: { row: DayCustomerLedgerRow }) {
  if (!row.olderDues.length) {
    return (
      <Text variant="bodySmall" style={styles.placeholderText}>
        -
      </Text>
    );
  }

  return (
    <View style={styles.chipsCell}>
      {row.olderDues.map((entry) => (
        <Chip compact key={`${row.customerId}-${entry.reference}`} style={styles.chip}>
          {formatCurrency(entry.amount)}
        </Chip>
      ))}
    </View>
  );
}

export default function CustomerDayLedgerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const dateStr = typeof params.date === "string" ? params.date : getTodayDateString();
  const { data } = useRepositoryData(() => ledgersRepository.getCustomerDayLedger(dateStr), [dateStr]);

  const setDate = (nextDate: string) => {
    router.setParams({ date: nextDate });
  };

  return (
    <ScreenLayout
      title="Customer Day"
      subtitle="Purchased today and due-only customer sheet"
      showBack
      onBack={() => router.back()}
      rightAction={
        data ? (
          <Appbar.Action icon="printer" onPress={() => void printCustomerDayLedgerSheet(dateStr, data)} />
        ) : undefined
      }
    >
      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDate(shiftDateString(dateStr, -1))}
        onNext={() => setDate(shiftDateString(dateStr, 1))}
        onSelectDate={setDate}
        onToday={() => setDate(getTodayDateString())}
      />

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Purchased Today</Text>
        {data ? (
          <SheetTable
            columns={purchasedColumns}
            rows={data.purchasedToday}
            keyExtractor={(row) => row.customerId}
            emptyTitle="No purchases today"
            emptyDescription="No customer purchases were recorded for this date."
            renderCell={(row, column) => {
              switch (column.key) {
                case "name":
                  return (
                    <Text variant="bodyMedium" style={styles.primaryCellText}>
                      {row.displayName}
                    </Text>
                  );
                case "old":
                  return <OldDueCell row={row} />;
                case "today":
                  return (
                    <Text variant="bodySmall" style={styles.rightText}>
                      {row.todayAmount > 0 ? formatCurrency(row.todayAmount) : "-"}
                    </Text>
                  );
                case "total":
                  return (
                    <Text variant="bodySmall" style={[styles.rightText, styles.dangerText]}>
                      {row.outstandingAtClose > 0 ? formatCurrency(row.outstandingAtClose) : "-"}
                    </Text>
                  );
                case "payment":
                  return (
                    <Text variant="bodySmall" style={[styles.rightText, styles.successText]}>
                      {row.paymentToday > 0 ? formatCurrency(row.paymentToday) : "-"}
                    </Text>
                  );
                case "plus":
                  return row.outstandingAtClose > 0 ? (
                    <Button
                      compact
                      mode="outlined"
                      onPress={() =>
                        router.push(buildRoute("/payment", { customerId: row.customerId }) as never)
                      }
                    >
                      +
                    </Button>
                  ) : (
                    <Text variant="bodySmall" style={styles.placeholderText}>
                      -
                    </Text>
                  );
                case "view":
                  return (
                    <Button
                      compact
                      mode="text"
                      onPress={() =>
                        router.push(buildRoute("/ledgers/customers/detail", { userId: row.customerId }) as never)
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
        ) : (
          <EmptyState title="Loading..." description="Loading customer ledger..." icon={BookCopy} />
        )}
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Due, No Purchase Today</Text>
        {data ? (
          <SheetTable
            columns={dueOnlyColumns}
            rows={data.dueOnly}
            keyExtractor={(row) => row.customerId}
            emptyTitle="No carry-forward due"
            emptyDescription="No older customer due is waiting below this date."
            renderCell={(row, column) => {
              switch (column.key) {
                case "name":
                  return (
                    <Text variant="bodyMedium" style={styles.primaryCellText}>
                      {row.displayName}
                    </Text>
                  );
                case "old":
                  return <OldDueCell row={row} />;
                case "total":
                  return (
                    <Text variant="bodySmall" style={[styles.rightText, styles.dangerText]}>
                      {row.outstandingAtClose > 0 ? formatCurrency(row.outstandingAtClose) : "-"}
                    </Text>
                  );
                case "payment":
                  return (
                    <Text variant="bodySmall" style={[styles.rightText, styles.successText]}>
                      {row.paymentToday > 0 ? formatCurrency(row.paymentToday) : "-"}
                    </Text>
                  );
                case "plus":
                  return row.outstandingAtClose > 0 ? (
                    <Button
                      compact
                      mode="outlined"
                      onPress={() =>
                        router.push(buildRoute("/payment", { customerId: row.customerId }) as never)
                      }
                    >
                      +
                    </Button>
                  ) : (
                    <Text variant="bodySmall" style={styles.placeholderText}>
                      -
                    </Text>
                  );
                case "view":
                  return (
                    <Button
                      compact
                      mode="text"
                      onPress={() =>
                        router.push(buildRoute("/ledgers/customers/detail", { userId: row.customerId }) as never)
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
        ) : (
          <EmptyState title="Loading..." description="Loading customer ledger..." icon={BookCopy} />
        )}
      </SurfaceCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  chipsCell: {
    flexDirection: "column",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    alignSelf: "flex-end",
    backgroundColor: appColors.secondarySurface,
  },
  dangerText: {
    color: appColors.danger,
    fontWeight: "700",
  },
  successText: {
    color: appColors.success,
    fontWeight: "700",
  },
  primaryCellText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  rightText: {
    textAlign: "right",
  },
  placeholderText: {
    color: appColors.mutedForeground,
  },
});
