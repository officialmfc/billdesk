import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Text } from "react-native-paper";

import { DateNavigator } from "@/components/DateNavigator";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentDateIST,
  getUserTodayData,
  syncCurrentUserData,
  type UserTodayData,
} from "@/lib/user-api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

function shiftDay(dateStr: string, amount: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  date.setUTCDate(date.getUTCDate() + amount);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function BillsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [data, setData] = useState<UserTodayData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refreshRemote = true) => {
    if (!user?.id) {
      return;
    }

    setRefreshing(true);
    try {
      setData(await getUserTodayData(user.id, dateStr));

      if (refreshRemote) {
        try {
          await syncCurrentUserData();
          setData(await getUserTodayData(user.id, dateStr));
        } catch {
          // Keep cached day data visible.
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, [dateStr, user?.id]);

  const dayTotal = useMemo(
    () => (data?.buyerBills ?? []).reduce((sum, bill) => sum + bill.totalAmount, 0),
    [data?.buyerBills]
  );
  const dayDue = useMemo(
    () =>
      (data?.buyerBills ?? []).reduce(
        (sum, bill) => sum + Math.max(bill.totalAmount - bill.amountPaid, 0),
        0
      ),
    [data?.buyerBills]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Bills
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {user?.businessName || user?.name || "Your account"}
      </Text>

      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDay(current, -1))}
        onNext={() => setDateStr((current) => shiftDay(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getCurrentDateIST())}
      />

      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <View>
            <Text variant="labelLarge" style={styles.label}>
              Day total
            </Text>
            <Text variant="titleLarge" style={styles.value}>
              {formatCurrency(dayTotal)}
            </Text>
          </View>
          <View>
            <Text variant="labelLarge" style={styles.label}>
              Day due
            </Text>
            <Text variant="titleLarge" style={styles.dueValue}>
              {formatCurrency(dayDue)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {(data?.buyerBills.length ?? 0) === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">No bills on this date</Text>
            <Text variant="bodySmall" style={styles.muted}>
              Switch the date to view another day’s bill sheet.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        data?.buyerBills.map((bill) => {
          const dueAmount = Math.max(bill.totalAmount - bill.amountPaid, 0);

          return (
            <Card key={bill.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.rowBetween}>
                  <View style={styles.flexOne}>
                    <Text variant="titleMedium">{bill.billNumber}</Text>
                    <Text variant="bodySmall" style={styles.muted}>
                      {bill.billDate} • {bill.status}
                    </Text>
                  </View>
                  <View style={styles.amountColumn}>
                    <Text variant="titleMedium">{formatCurrency(bill.totalAmount)}</Text>
                    <Text variant="bodySmall" style={styles.dueLine}>
                      Due {formatCurrency(dueAmount)}
                    </Text>
                  </View>
                </View>

                {bill.items.map((item) => (
                  <Text key={item.id} variant="bodyMedium">
                    {item.description} • {item.weightKg} kg • {formatCurrency(item.amount)}
                  </Text>
                ))}

                <Button mode="outlined" onPress={() => router.push(`/bill/${bill.id}`)}>
                  View bill
                </Button>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  title: { fontWeight: "700" },
  subtitle: { color: "#64748b" },
  summaryCard: { borderRadius: 20 },
  summaryContent: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  label: { color: "#64748b" },
  value: { fontWeight: "700" },
  dueValue: { color: "#dc2626", fontWeight: "700" },
  card: { borderRadius: 20 },
  cardContent: { gap: 10 },
  rowBetween: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  flexOne: { flex: 1 },
  amountColumn: { alignItems: "flex-end" },
  muted: { color: "#64748b" },
  dueLine: { color: "#dc2626", fontWeight: "600" },
});
