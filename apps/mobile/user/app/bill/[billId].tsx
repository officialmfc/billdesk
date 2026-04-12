import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";

import { useAuth } from "@/contexts/AuthContext";
import { getUserBillDetail, syncCurrentUserData, type UserBillDetail } from "@/lib/user-api";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function BillDetailScreen() {
  const { billId } = useLocalSearchParams<{ billId?: string }>();
  const { user } = useAuth();
  const [bill, setBill] = useState<UserBillDetail | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      const authUserId = user?.id;
      if (!authUserId || !billId) {
        if (isMountedRef.current) {
          setBill(null);
        }
        return;
      }

      const nextBill = await getUserBillDetail(authUserId, billId);
      if (isMountedRef.current) {
        setBill(nextBill);
      }

      void syncCurrentUserData(authUserId)
        .then(async () => {
          if (!isMountedRef.current) {
            return;
          }

          const refreshedBill = await getUserBillDetail(authUserId, billId);
          if (isMountedRef.current) {
            setBill(refreshedBill);
          }
        })
        .catch((error) => {
          console.info("[UserMobile] bill refresh failed (non-blocking)", error);
        });
    };

    void load();
  }, [billId, user?.id]);

  if (!bill) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Bill not found</Text>
            <Text variant="bodySmall" style={styles.muted}>
              The selected bill could not be loaded on this device.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineMedium" style={styles.title}>
        {bill.billNumber}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        {bill.billDate} • {bill.status}
      </Text>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {bill.lines.map((line) => (
            <View key={line.id} style={styles.lineRow}>
              <View style={styles.lineMeta}>
                <Text variant="labelMedium" style={styles.serialNo}>
                  {line.serialNo}.
                </Text>
                <View style={styles.lineText}>
                  <Text variant="titleMedium">{line.description}</Text>
                  <Text variant="bodySmall" style={styles.muted}>
                    {line.weightKg.toFixed(2)} kg • {formatCurrency(line.pricePerKg)}
                  </Text>
                </View>
              </View>
              <Text variant="titleMedium">{formatCurrency(line.amount)}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.muted}>
              Weight
            </Text>
            <Text variant="bodyMedium">{bill.totalWeight.toFixed(2)} kg</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.muted}>
              Total
            </Text>
            <Text variant="bodyMedium">{formatCurrency(bill.totalAmount)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.muted}>
              Paid
            </Text>
            <Text variant="bodyMedium" style={styles.success}>
              {formatCurrency(bill.amountPaid)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text variant="titleMedium" style={styles.muted}>
              Due
            </Text>
            <Text variant="titleMedium" style={styles.due}>
              {formatCurrency(bill.dueAmount)}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  title: { fontWeight: "700" },
  subtitle: { color: "#64748b" },
  card: { borderRadius: 20 },
  cardContent: { gap: 12 },
  lineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  lineMeta: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
  },
  lineText: { flex: 1, gap: 2 },
  serialNo: { color: "#64748b", width: 20 },
  muted: { color: "#64748b" },
  summaryContent: { gap: 8 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  success: { color: "#15803d", fontWeight: "600" },
  due: { color: "#dc2626", fontWeight: "700" },
});
