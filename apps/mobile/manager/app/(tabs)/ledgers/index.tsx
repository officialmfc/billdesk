import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { LedgerSearchPanel } from "@/components/ledgers/LedgerSearchPanel";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { getTodayDateString } from "@/lib/formatters";
import { appColors } from "@/lib/theme";
import { ledgersRepository } from "@/repositories/ledgersRepository";

function buildRoute(pathname: string, params?: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return pathname;
  }

  const search = new URLSearchParams(params).toString();
  return `${pathname}?${search}`;
}

export default function LedgersDeskScreen() {
  const router = useRouter();
  const today = getTodayDateString();
  const { data: customerSearchUsers } = useRepositoryData(
    () => ledgersRepository.getLedgerSearchUsers("customer"),
    []
  );
  const { data: sellerSearchUsers } = useRepositoryData(
    () => ledgersRepository.getLedgerSearchUsers("seller"),
    []
  );

  return (
    <ScreenLayout title="Ledgers" subtitle="Customer and seller day sheets, detail, and history">
      <SurfaceCard contentStyle={styles.stack}>
        <View style={styles.copy}>
          <Text variant="titleMedium">Customer Ledger</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            Day sheet, purchase detail, and bill/payment history.
          </Text>
        </View>
        <View style={styles.buttonGrid}>
          <Button
            mode="contained-tonal"
            onPress={() => router.push(buildRoute("/ledgers/customers/day", { date: today }) as never)}
          >
            Customer Day
          </Button>
          <Button mode="outlined" onPress={() => router.push("/ledgers/customers/detail" as never)}>
            Customer Detail
          </Button>
          <Button mode="outlined" onPress={() => router.push("/ledgers/customers/history" as never)}>
            Customer History
          </Button>
        </View>
      </SurfaceCard>

      <LedgerSearchPanel
        title="Find customer ledger"
        description="Search a customer to open detail or history without leaving the ledger section."
        placeholder="Search customer..."
        users={customerSearchUsers ?? []}
        emptyMessage="No customer ledger candidates matched."
        onSelect={(userId) =>
          router.push(buildRoute("/ledgers/customers/detail", { userId }) as never)
        }
      />

      <SurfaceCard contentStyle={styles.stack}>
        <View style={styles.copy}>
          <Text variant="titleMedium">Seller Ledger</Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            Seller day sheet plus payout history.
          </Text>
        </View>
        <View style={styles.buttonGrid}>
          <Button
            mode="contained-tonal"
            onPress={() => router.push(buildRoute("/ledgers/sellers/day", { date: today }) as never)}
          >
            Seller Day
          </Button>
          <Button mode="outlined" onPress={() => router.push("/ledgers/sellers/history" as never)}>
            Seller History
          </Button>
        </View>
      </SurfaceCard>

      <LedgerSearchPanel
        title="Find seller ledger"
        description="Search a seller to open payout history."
        placeholder="Search seller..."
        users={sellerSearchUsers ?? []}
        emptyMessage="No seller ledger candidates matched."
        onSelect={(userId) =>
          router.push(buildRoute("/ledgers/sellers/history", { userId }) as never)
        }
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  copy: {
    gap: 4,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
