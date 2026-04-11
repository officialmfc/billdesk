import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useSync } from "@/contexts/SyncContext";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { syncEngine } from "@/lib/sync-engine";
import { appColors } from "@/lib/theme";

export default function DebugScreen() {
  const router = useRouter();
  const {
    isSyncing,
    lastSyncTime,
    performFullSync,
    isRealtimeSubscribed,
    syncError,
    syncStatus,
  } = useSync();
  const { data } = useRepositoryData(() => syncEngine.getTableCounts(), []);
  const tableCounts = data ?? [];
  const engineStatus = syncEngine.getSyncStatus();
  const totalRecords = tableCounts.reduce((sum, row) => sum + row.count, 0);

  return (
    <ScreenLayout title="Debug" subtitle="Local database state" showBack onBack={() => router.back()}>
      <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Summary</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>
            {totalRecords} local records across {tableCounts.length} synced tables
          </Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            Last sync: {lastSyncTime?.toLocaleString("en-IN") ?? "not available"}
          </Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            PowerSync connected: {isRealtimeSubscribed ? "yes" : "no"}
          </Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            PowerSync state: {syncStatus}
          </Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            Last full pull: {engineStatus.lastFullSyncAt ?? "not available"}
          </Text>
          {syncError ? (
            <Text variant="bodySmall" style={styles.errorText}>
              Error: {syncError}
            </Text>
          ) : null}
          <Button mode="contained" loading={isSyncing} disabled={isSyncing} onPress={() => performFullSync()}>
            Refresh sync
          </Button>
      </SurfaceCard>

      {tableCounts.map((row) => (
        <SurfaceCard key={row.tableName} contentStyle={styles.rowBetween}>
            <Text variant="bodyLarge">{row.tableName}</Text>
            <Text variant="titleMedium">{row.count}</Text>
        </SurfaceCard>
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  errorText: {
    color: appColors.danger,
  },
});
