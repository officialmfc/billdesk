import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

import { getAdminInsightSnapshot, getCurrentDateIST, type AdminInsightSnapshot } from "@/lib/admin-api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function TodayScreen() {
  const [data, setData] = useState<AdminInsightSnapshot | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      setData(await getAdminInsightSnapshot(getCurrentDateIST()));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Today
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Snapshot for {data?.selected_date ?? getCurrentDateIST()}
      </Text>

      <View style={styles.grid}>
        {[
          ["Sales", formatCurrency(data?.total_sales ?? 0)],
          ["Collection", formatCurrency(data?.total_collection ?? 0)],
          ["Spend", formatCurrency(data?.total_spend ?? 0)],
          ["Chalans", String(data?.total_chalans ?? 0)],
          ["Payable", formatCurrency(data?.total_payable ?? 0)],
          ["Bills", String(data?.total_bills ?? 0)],
        ].map(([label, value]) => (
          <Card key={label} style={styles.card}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.label}>
                {label}
              </Text>
              <Text variant="titleLarge" style={styles.value}>
                {value}
              </Text>
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  title: { fontWeight: "700" },
  subtitle: { color: "#64748b" },
  grid: { gap: 12 },
  card: { borderRadius: 20 },
  label: { color: "#64748b" },
  value: { fontWeight: "700" },
});
