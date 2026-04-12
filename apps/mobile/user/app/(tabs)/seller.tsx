import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, SegmentedButtons, Text } from "react-native-paper";

import { DateNavigator } from "@/components/DateNavigator";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentDateIST,
  getUserHistory,
  getUserTodayData,
  syncCurrentUserData,
  type UserHistoryRow,
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

export default function SellerScreen() {
  const { user } = useAuth();
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [data, setData] = useState<UserTodayData | null>(null);
  const [historyRows, setHistoryRows] = useState<UserHistoryRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [mode, setMode] = useState<"day" | "history">("day");
  const isMountedRef = useRef(true);

  const load = async (refreshRemote = true) => {
    const authUserId = user?.id;
    if (!authUserId) {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
      return;
    }

    if (isMountedRef.current) {
      setRefreshing(true);
    }
    try {
      const [nextData, nextHistoryRows] = await Promise.all([
        getUserTodayData(authUserId, dateStr),
        getUserHistory(authUserId),
      ]);
      if (isMountedRef.current) {
        setData(nextData);
        setHistoryRows(nextHistoryRows);
      }
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }

    if (!refreshRemote) {
      return;
    }

    void syncCurrentUserData(authUserId)
      .then(async () => {
        if (!isMountedRef.current) {
          return;
        }

        const [nextData, nextHistoryRows] = await Promise.all([
          getUserTodayData(authUserId, dateStr),
          getUserHistory(authUserId),
        ]);
        if (isMountedRef.current) {
          setData(nextData);
          setHistoryRows(nextHistoryRows);
        }
      })
      .catch((error) => {
        console.info("[UserMobile] seller refresh failed (non-blocking)", error);
      });
  };

  useEffect(() => {
    void load(true);
  }, [dateStr, user?.id]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const sellerHistoryRows = useMemo(
    () => historyRows.filter((row) => row.kind === "chalan" || row.kind === "payout"),
    [historyRows]
  );

  const dayPayable = useMemo(
    () => (data?.sellerChalans ?? []).reduce((sum, chalan) => sum + chalan.netPayable, 0),
    [data?.sellerChalans]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Seller
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Hidden section for your seller-side chalans and payouts
      </Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(value) => setMode(value as "day" | "history")}
        buttons={[
          { value: "day", label: "Day" },
          { value: "history", label: "History" },
        ]}
      />

      {mode === "day" ? (
        <>
          <DateNavigator
            dateStr={dateStr}
            onPrevious={() => setDateStr((current) => shiftDay(current, -1))}
            onNext={() => setDateStr((current) => shiftDay(current, 1))}
            onSelectDate={setDateStr}
            onToday={() => setDateStr(getCurrentDateIST())}
          />

          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text variant="labelLarge" style={styles.label}>
                Day payable
              </Text>
              <Text variant="titleLarge" style={styles.value}>
                {formatCurrency(dayPayable)}
              </Text>
            </Card.Content>
          </Card>

          {(data?.sellerChalans.length ?? 0) === 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">No chalans on this date</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  Switch the date to view another seller day sheet.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            data?.sellerChalans.map((chalan) => (
              <Card key={chalan.id} style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flexOne}>
                      <Text variant="titleMedium">{chalan.chalanNumber}</Text>
                      <Text variant="bodySmall" style={styles.muted}>
                        {chalan.chalanDate} • {chalan.status}
                      </Text>
                    </View>
                    <Text variant="titleMedium">{formatCurrency(chalan.netPayable)}</Text>
                  </View>
                  {chalan.items.map((item) => (
                    <Text key={item.id} variant="bodyMedium">
                      {item.description} • {item.weightKg} kg • {formatCurrency(item.amount)}
                    </Text>
                  ))}
                  <Text variant="bodySmall" style={styles.success}>
                    Paid {formatCurrency(chalan.amountPaid)}
                  </Text>
                </Card.Content>
              </Card>
            ))
          )}
        </>
      ) : sellerHistoryRows.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">No seller history</Text>
          </Card.Content>
        </Card>
      ) : (
        sellerHistoryRows.map((row) => (
          <Card key={`${row.kind}-${row.reference}-${row.date}`} style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleMedium">{row.reference}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {row.date} • {row.kind}
              </Text>
              <Text variant="bodyLarge">{formatCurrency(row.amount)}</Text>
            </Card.Content>
          </Card>
        ))
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
  card: { borderRadius: 20 },
  cardContent: { gap: 8 },
  rowBetween: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  flexOne: { flex: 1 },
  label: { color: "#64748b" },
  value: { fontWeight: "700" },
  muted: { color: "#64748b" },
  success: { color: "#15803d", fontWeight: "600" },
});
