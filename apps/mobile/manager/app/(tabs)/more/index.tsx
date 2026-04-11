import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import {
  Bug,
  FileCheck,
  LayoutDashboard,
  LogOut,
  Palette,
  ShoppingBag,
  PackagePlus,
  RefreshCw,
  Settings,
  Users,
  Wifi,
} from "lucide-react-native";

import { MenuListItem } from "@/components/ui/MenuListItem";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { useSync } from "@/contexts/SyncContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { appColors } from "@/lib/theme";

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOnline } = useConnectivity();
  const { isSyncing, isRealtimeSubscribed, lastSyncTime, performFullSync, realtimeEvents } = useSync();
  const initials = (user?.display_name ?? "Manager")
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScreenLayout title="More" subtitle="Account and tools">
      <View style={styles.content}>
        <SurfaceCard contentStyle={styles.accountCard}>
          <View style={styles.accountHeader}>
            <View style={styles.avatar}>
              <Text variant="titleLarge" style={styles.avatarText}>
                {initials}
              </Text>
            </View>
            <View style={styles.accountCopy}>
              <Text variant="titleMedium" style={styles.accountName}>
                {user?.display_name ?? "Manager"}
              </Text>
              <Text variant="bodySmall" style={styles.accountMeta}>
                {user?.user_role?.replaceAll("_", " ") ?? "manager"}
              </Text>
              <Text variant="bodySmall" style={styles.accountMeta}>
                {isOnline ? "Online" : "Offline"} • Last sync{" "}
                {lastSyncTime ? lastSyncTime.toLocaleString("en-IN") : "not available"}
              </Text>
            </View>
          </View>

          <View style={styles.accountActions}>
            <Button
              mode="contained-tonal"
              icon={() => <RefreshCw size={16} color={appColors.primary} />}
              loading={isSyncing}
              disabled={!isOnline || isSyncing}
              onPress={() => performFullSync()}
              style={styles.accountButton}
            >
              Refresh data
            </Button>
            <Button
              mode="outlined"
              icon={() => <Settings size={16} color={appColors.primary} />}
              onPress={() => router.push("/more/settings")}
              style={styles.accountButton}
            >
              Settings
            </Button>
            <Button
              mode="outlined"
              icon={() => <LogOut size={16} color={appColors.danger} />}
              textColor={appColors.danger}
              onPress={() => logout()}
              style={styles.accountButton}
            >
              Log out
            </Button>
          </View>
        </SurfaceCard>

        <SectionHeader title="Explore" description="Core management areas that are fully available on mobile." />
        <SurfaceCard contentStyle={styles.group}>
          <MenuListItem
            title="Dashboard"
            description="Fallback hub with every manager section and shortcut"
            icon={LayoutDashboard}
            onPress={() => router.push("/dashboard")}
          />
          <View style={styles.divider} />
          <MenuListItem
            title="Quotes"
            description="Pending and confirmed quote flows"
            icon={FileCheck}
            onPress={() => router.push("/more/quotes")}
          />
        </SurfaceCard>

        <SectionHeader title="People" description="Customers, sellers, and directory maintenance." />
        <SurfaceCard contentStyle={styles.group}>
          <MenuListItem
            title="Users"
            description="Create customers and review staff directory"
            icon={Users}
            onPress={() => router.push("/more/users")}
          />
        </SurfaceCard>

        <SectionHeader title="Catalog" description="Products and stock batches used by sales and quotes." />
        <SurfaceCard contentStyle={styles.group}>
          <MenuListItem
            title="Products"
            description="Sale items available to quotes and stock"
            icon={ShoppingBag}
            onPress={() => router.push("/more/products")}
          />
          <View style={styles.divider} />
          <MenuListItem
            title="Stock"
            description="Batch stock, weights, and new purchase intake"
            icon={PackagePlus}
            onPress={() => router.push("/more/stock")}
          />
        </SurfaceCard>

        <SectionHeader title="App" description="Sync tools, diagnostics, and account controls." />
        <SurfaceCard contentStyle={styles.group}>
          <MenuListItem
            title="Realtime events"
            description={
              isRealtimeSubscribed
                ? `${realtimeEvents.length} recent updates and live connection status`
                : "Connection state and recent sync activity"
            }
            icon={Wifi}
            onPress={() => router.push("/more/realtime")}
          />
          <View style={styles.divider} />
          <MenuListItem
            title="Theme"
            description="Balanced light operational theme is enabled for v1"
            icon={Palette}
            disabled
          />
          <View style={styles.divider} />
          <MenuListItem
            title="Debug"
            description="SQLite counts and realtime status"
            icon={Bug}
            onPress={() => router.push("/more/debug")}
          />
        </SurfaceCard>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 24,
  },
  accountCard: {
    gap: 16,
  },
  accountHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: appColors.primarySoft,
    borderRadius: 24,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  avatarText: {
    color: appColors.primary,
    fontWeight: "700",
  },
  accountCopy: {
    flex: 1,
    gap: 4,
  },
  accountName: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  accountMeta: {
    color: appColors.mutedForeground,
  },
  accountActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  accountButton: {
    flexBasis: "31%",
    flexGrow: 1,
  },
  group: {
    gap: 0,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appColors.border,
    marginVertical: 2,
  },
});
