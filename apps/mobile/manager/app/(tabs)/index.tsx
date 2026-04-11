import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Appbar, ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { Banknote, BookCopy, CalendarDays, Menu, ShoppingCart } from "lucide-react-native";

import { ActionCard } from "@/components/ui/ActionCard";
import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { useSync } from "@/contexts/SyncContext";
import { dashboardRepository } from "@/repositories/dashboardRepository";
import { formatCurrency, getTodayDateString } from "@/lib/formatters";
import { appColors } from "@/lib/theme";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOnline } = useConnectivity();
  const { isSyncing, lastSyncTime, performFullSync } = useSync();
  const today = getTodayDateString();
  const managerId = user?.user_id ?? null;

  const { data, loading, error, reload } = useRepositoryData(
    () => dashboardRepository.getHomeSnapshot(today, managerId),
    [today, managerId]
  );

  return (
    <ScreenLayout
      title="Dashboard"
      subtitle="Fallback hub"
      rightAction={
        <Appbar.Action icon="refresh" disabled={isSyncing} onPress={() => performFullSync()} />
      }
    >
      <OfflineReadOnlyBanner visible={!isOnline} />

      {loading && !data ? (
        <View style={styles.centerState}>
          <ActivityIndicator animating size="large" />
          <Text variant="bodyMedium" style={styles.mutedText}>
            Loading local dashboard...
          </Text>
        </View>
      ) : null}

      {error && !data ? (
        <Card style={styles.errorCard}>
          <Card.Content style={styles.cardStack}>
            <Text variant="titleMedium">Dashboard unavailable</Text>
            <Text variant="bodyMedium" style={styles.mutedText}>
              {error.message}
            </Text>
            <Button mode="contained" onPress={() => reload()}>
              Retry
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {data ? (
        <>
          <View style={styles.hero}>
            <Text variant="labelMedium" style={styles.eyebrow}>
              Fallback Hub
            </Text>
            <Text variant="headlineSmall" style={styles.heroTitle}>
              Manager Sections
            </Text>
            <Text variant="bodyMedium" style={styles.heroDescription}>
              Use this page when you need a quick map of sales, bill & chalan, ledgers, payments, and more.
            </Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.half}>
              <SummaryCard
                title="Auction Sales"
                value={formatCurrency(data.auctionSales)}
                note={`${data.auctionBills} auction bills by you`}
                icon={ShoppingCart}
              />
            </View>
            <View style={styles.half}>
              <SummaryCard
                title="Collections"
                value={formatCurrency(data.todayCollections)}
                note={`${data.todayCollectionEntries} entries by you`}
                tone={appColors.success}
                icon={Banknote}
              />
            </View>
            <View style={styles.full}>
              <SummaryCard
                title="MFC Sales"
                value={formatCurrency(data.mfcSales)}
                note={`${data.mfcBills} stock and MFC bills by you`}
                tone={appColors.primaryStrong}
                icon={BookCopy}
              />
            </View>
          </View>

          <Button
            mode="contained"
            disabled={!isOnline}
            onPress={() => router.push("/sale-type" as never)}
            style={styles.primaryAction}
          >
            New Sale
          </Button>

          <View style={styles.grid}>
            <View style={styles.half}>
              <ActionCard
                title="Sales"
                description="Open all four sale entry flows"
                meta={`${data.todayBills} bills entered today`}
                icon={ShoppingCart}
                disabled={!isOnline}
                onPress={() => router.push("/sales")}
              />
            </View>
            <View style={styles.half}>
              <ActionCard
                title="Bill & Chalan"
                description="Due register, chalans, buyer sheets, and verification"
                meta={`${data.todayChalans} chalans created by you`}
                icon={CalendarDays}
                onPress={() => router.push("/operations")}
              />
            </View>
            <View style={styles.half}>
              <ActionCard
                title="Payments"
                description={`${data.todayCollectionEntries} collections entered`}
                meta="Collections and payouts"
                icon={Banknote}
                onPress={() => router.push("/payments")}
              />
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.half}>
              <ActionCard
                title="Ledgers"
                description="Review customer and seller balances"
                meta="Customer and seller history"
                icon={BookCopy}
                onPress={() => router.push("/ledgers")}
              />
            </View>
            <View style={styles.half}>
              <ActionCard
                title="More"
                description="Quotes, settings, diagnostics, and remaining tools"
                meta="Open the rest of the manager app"
                icon={Menu}
                onPress={() => router.push("/more")}
              />
            </View>
          </View>

          <Card style={styles.focusCard}>
            <Card.Content style={styles.cardStack}>
              <Text variant="titleMedium">Your Activity</Text>
              <Text variant="bodyMedium" style={styles.mutedText}>
                Total billed {formatCurrency(data.auctionSales + data.mfcSales)} across{" "}
                {data.todayBills} bills. Commission {formatCurrency(data.todayCommission)} across{" "}
                {data.todayChalans} chalans created by you.
              </Text>
              <Text variant="bodySmall" style={styles.mutedText}>
                {isOnline ? "Online" : "Offline"} • Last sync{" "}
                {lastSyncTime ? lastSyncTime.toLocaleTimeString("en-IN") : "not available"}
              </Text>
            </Card.Content>
          </Card>
        </>
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
  },
  hero: {
    gap: 4,
  },
  eyebrow: {
    color: appColors.primary,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  heroDescription: {
    color: appColors.mutedForeground,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  errorCard: {
    borderRadius: 20,
  },
  cardStack: {
    gap: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  half: {
    width: "48.2%",
  },
  full: {
    width: "100%",
  },
  primaryAction: {
    alignSelf: "flex-start",
  },
  focusCard: {
    borderRadius: 20,
  },
});
