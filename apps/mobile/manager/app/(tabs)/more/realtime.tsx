import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Activity, Trash2, Wifi, WifiOff } from "lucide-react-native";
import { Button, Text } from "react-native-paper";

import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { StatusChip } from "@/components/ui/StatusChip";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useSync } from "@/contexts/SyncContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { appColors } from "@/lib/theme";

export default function RealtimeScreen() {
  const router = useRouter();
  const { isOnline } = useConnectivity();
  const {
    clearRealtimeEvents,
    isRealtimeSubscribed,
    isSyncing,
    lastSyncTime,
    performFullSync,
    realtimeEvents,
    syncError,
    syncStatus,
  } = useSync();

  return (
    <ScreenLayout title="Realtime events" subtitle="Live sync activity" showBack onBack={() => router.back()}>
      <SurfaceCard contentStyle={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryCopy}>
            <Text variant="titleMedium">Connection</Text>
            <Text variant="bodySmall" style={styles.mutedText}>
              {isRealtimeSubscribed
                ? "PowerSync is connected and applying read-model updates on this device."
                : syncError
                  ? "PowerSync is disconnected because the last sync attempt failed."
                  : "PowerSync is not currently connected on this device."}
            </Text>
          </View>
          <StatusChip
            label={
              isRealtimeSubscribed
                ? "Live"
                : syncStatus === "error"
                  ? "Error"
                  : isOnline
                    ? "Connecting"
                    : "Offline"
            }
            tone={
              isRealtimeSubscribed
                ? "success"
                : syncStatus === "error"
                  ? "danger"
                  : isOnline
                    ? "warning"
                    : "danger"
            }
          />
        </View>

        {syncError ? (
          <Text variant="bodySmall" style={styles.errorText}>
            {syncError}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          <Text variant="bodySmall" style={styles.mutedText}>
            Recent events: {realtimeEvents.length}
          </Text>
          <Text variant="bodySmall" style={styles.mutedText}>
            Last sync: {lastSyncTime ? lastSyncTime.toLocaleString("en-IN") : "not available"}
          </Text>
        </View>

        <Button
          mode="contained"
          loading={isSyncing}
          disabled={isSyncing || !isOnline}
          onPress={() => void performFullSync()}
        >
          Retry connection
        </Button>

        <Button
          mode="outlined"
          icon={() => <Trash2 size={16} color={appColors.mutedForeground} />}
          disabled={realtimeEvents.length === 0}
          onPress={() => clearRealtimeEvents()}
        >
          Clear events
        </Button>
      </SurfaceCard>

      {realtimeEvents.length === 0 ? (
        <EmptyState
          title="No realtime events yet"
          description="When records change on the server, the recent update stream will appear here."
          icon={Activity}
        />
      ) : (
        <View style={styles.eventsList}>
          {realtimeEvents.map((event) => (
            <SurfaceCard key={event.id} contentStyle={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTitleWrap}>
                  <Text variant="titleSmall" style={styles.eventTitle}>
                    {formatOperation(event.operation)} • {event.table}
                  </Text>
                  <Text variant="bodySmall" style={styles.mutedText}>
                    {formatTimestamp(event.timestamp)}
                  </Text>
                </View>
                <StatusChip
                  label={formatStatus(event.status)}
                  tone={event.status === "applied" ? "success" : event.status === "deleted" ? "warning" : "danger"}
                />
              </View>

              <View style={styles.row}>
                {isRealtimeSubscribed ? (
                  <Wifi size={16} color={appColors.primary} />
                ) : (
                  <WifiOff size={16} color={appColors.mutedForeground} />
                )}
                <Text variant="bodySmall" style={styles.mutedText}>
                  Record ID: {event.recordId || "not available"}
                </Text>
              </View>

              {event.detail ? (
                <Text variant="bodySmall" style={styles.detailText}>
                  {event.detail}
                </Text>
              ) : null}
            </SurfaceCard>
          ))}
        </View>
      )}
    </ScreenLayout>
  );
}

function formatOperation(operation: string): string {
  if (!operation) {
    return "Update";
  }

  return operation.charAt(0).toUpperCase() + operation.slice(1).toLowerCase();
}

function formatStatus(status: string): string {
  switch (status) {
    case "applied":
      return "Applied";
    case "deleted":
      return "Deleted";
    case "invalid":
      return "Invalid";
    case "error":
      return "Error";
    default:
      return status;
  }
}

function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: 12,
  },
  summaryHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    gap: 4,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    gap: 10,
  },
  eventHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  eventTitleWrap: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  detailText: {
    color: appColors.foreground,
  },
  errorText: {
    color: appColors.danger,
  },
});
