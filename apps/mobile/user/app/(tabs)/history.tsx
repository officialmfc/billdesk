import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

import { useAuth } from "@/contexts/AuthContext";
import { getUserHistory, syncCurrentUserData, type UserHistoryRow } from "@/lib/user-api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HistoryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<UserHistoryRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (refreshRemote = true) => {
    if (!user?.id) {
      return;
    }
    setRefreshing(true);
    try {
      setRows(await getUserHistory(user.id));

      if (refreshRemote) {
        try {
          await syncCurrentUserData();
          setRows(await getUserHistory(user.id));
        } catch {
          // Keep the cached history visible when refresh fails.
        }
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load(true);
  }, [user?.id]);

  const filteredRows = useMemo(
    () => rows.filter((row) => row.kind === "bill" || row.kind === "payment"),
    [rows]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
    >
      <Text variant="headlineMedium" style={styles.title}>
        History
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Purchase and payment history. Tap a bill row to open the bill detail.
      </Text>

      {filteredRows.map((row) => (
        <Card
          key={`${row.kind}-${row.reference}-${row.date}`}
          style={styles.card}
          onPress={
            row.billId
              ? () => {
                  router.push(`/bill/${row.billId}`);
                }
              : undefined
          }
        >
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium">{row.reference}</Text>
            <Text variant="bodySmall" style={styles.muted}>
              {row.date} • {row.kind}
            </Text>
            <Text variant="bodyLarge">{formatCurrency(row.amount)}</Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  title: { fontWeight: "700" },
  subtitle: { color: "#64748b" },
  card: { borderRadius: 20 },
  cardContent: { gap: 6 },
  muted: { color: "#64748b" },
});
