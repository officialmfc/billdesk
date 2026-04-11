import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";

import { OfflineReadOnlyBanner } from "@/components/ui/OfflineReadOnlyBanner";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { SelectModalField } from "@/components/forms/SelectModalField";
import { useAuth } from "@/contexts/AuthContext";
import { useLocalSecurity } from "@/contexts/LocalSecurityContext";
import { useSync } from "@/contexts/SyncContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { ErrorHandler } from "@/lib/error-handler";
import {
  DEFAULT_MOBILE_LANDING,
  getMobileLandingPreference,
  MOBILE_LANDING_OPTIONS,
  setMobileLandingPreference,
} from "@/lib/mobile-landing-preference";
import { appColors } from "@/lib/theme";
import { LocalSecuritySettingsCard } from "@/components/auth/LocalSecurityScreens";
import { useEffect, useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    lockNow,
    resetLocalSecurity,
    setBiometricEnabled,
    setTimeoutSeconds,
    snapshot,
  } = useLocalSecurity();
  const { isOnline } = useConnectivity();
  const { isSyncing, lastSyncTime, performFullSync } = useSync();
  const [landing, setLanding] = useState(DEFAULT_MOBILE_LANDING);

  useEffect(() => {
    let cancelled = false;

    const loadLanding = async () => {
      const nextLanding = await getMobileLandingPreference();
      if (!cancelled) {
        setLanding(nextLanding);
      }
    };

    void loadLanding();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ScreenLayout title="Settings" subtitle="App controls" showBack onBack={() => router.back()}>
      <OfflineReadOnlyBanner visible={!isOnline} />

      <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Application</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>
            Version {Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
          <SelectModalField
            label="Default landing page"
            placeholder="Select landing page"
            value={MOBILE_LANDING_OPTIONS.find((option) => option.value === landing)?.label}
            options={MOBILE_LANDING_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onSelect={async (option) => {
              try {
                await setMobileLandingPreference(option.value);
                setLanding(option.value);
                ErrorHandler.showSuccess(`Default landing set to ${option.label}.`);
              } catch (error) {
                ErrorHandler.handle(error, "Default landing page");
              }
            }}
          />
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Sync</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>
            Status: {isOnline ? "Online" : "Offline"} • Last sync{" "}
            {lastSyncTime ? lastSyncTime.toLocaleString("en-IN") : "not available"}
          </Text>
          <Button
            mode="contained"
            disabled={!isOnline || isSyncing}
            loading={isSyncing}
            onPress={() => performFullSync()}
          >
            Refresh synced data
          </Button>
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
          <Text variant="titleMedium">Theme</Text>
          <Text variant="bodyMedium" style={styles.mutedText}>
            Balanced light operational theme is enabled for v1. Theme switching can be added later
            without changing the local data layer.
          </Text>
      </SurfaceCard>

      <LocalSecuritySettingsCard
        snapshot={snapshot}
        onLockNow={lockNow}
        onTimeoutChange={async (nextTimeout) => {
          try {
            await setTimeoutSeconds(nextTimeout);
            ErrorHandler.showSuccess(`Local lock timeout set to ${nextTimeout}s.`);
          } catch (error) {
            ErrorHandler.handle(error, "Local security timeout");
          }
        }}
        onToggleBiometric={async (enabled) => {
          try {
            await setBiometricEnabled(enabled);
            ErrorHandler.showSuccess(enabled ? "Biometric unlock enabled." : "Biometric unlock disabled.");
          } catch (error) {
            ErrorHandler.handle(error, "Biometric unlock");
          }
        }}
        onReset={async () => {
          try {
            await resetLocalSecurity();
            ErrorHandler.showInfo("Set a new PIN or password to continue.");
          } catch (error) {
            ErrorHandler.handle(error, "Reset local security");
          }
        }}
      />

      <Button mode="outlined" textColor={appColors.danger} onPress={() => logout()}>
        Sign out
      </Button>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
});
