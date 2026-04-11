import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, PaperProvider, Text } from "react-native-paper";
import { AppSentryBoundary, initializeAppSentry } from "@mfc/auth";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LocalSecurityProvider, useLocalSecurity } from "@/contexts/LocalSecurityContext";
import {
  LocalSecurityLoadingOverlay,
  LocalSecurityLockScreen,
  LocalSecuritySetupScreen,
} from "@/components/auth/LocalSecurityScreens";

initializeAppSentry({
  appName: "admin-mobile",
  dsn: Constants.expoConfig?.extra?.sentryDsn as string | undefined,
  environment: __DEV__ ? "development" : "production",
  release: Constants.expoConfig?.version,
});

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationState = useRootNavigationState();
  const segments = useSegments();
  const router = useRouter();
  const rootSegment = segments[0];
  const inAuthGroup = rootSegment === "(auth)";
  const atRoot = !rootSegment;

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    let cancelled = false;

    const syncRoute = async () => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace("/(auth)/login");
        return;
      }

      if (isAuthenticated && (inAuthGroup || atRoot) && !cancelled) {
        router.replace("/(tabs)/today");
      }
    };

    void syncRoute();

    return () => {
      cancelled = true;
    };
  }, [atRoot, inAuthGroup, isAuthenticated, isLoading, navigationState?.key, router]);

  if (!navigationState?.key || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating size="large" />
        <Text variant="bodyMedium" style={styles.loadingText}>
          Loading MFC Admin...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

function LocalSecurityGate() {
  const { isAuthenticated } = useAuth();
  const {
    isLoading,
    isLocked,
    requiresSetup,
    saveSetup,
    snapshot,
    unlockWithBiometric,
    unlockWithSecret,
  } = useLocalSecurity();
  const [busy, setBusy] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <LocalSecurityLoadingOverlay />;
  }

  if (requiresSetup) {
    return (
      <LocalSecuritySetupScreen
        loading={busy}
        snapshot={snapshot}
        onSubmit={async (params) => {
          try {
            setBusy(true);
            await saveSetup(params);
          } finally {
            setBusy(false);
          }
        }}
      />
    );
  }

  if (!isLocked) {
    return null;
  }

  return (
    <LocalSecurityLockScreen
      loading={busy}
      snapshot={snapshot}
      onUnlock={async (secret) => {
        try {
          setBusy(true);
          return await unlockWithSecret(secret);
        } finally {
          setBusy(false);
        }
      }}
      onUnlockBiometric={
        snapshot.biometricEnabled
          ? async () => {
              try {
                setBusy(true);
                return await unlockWithBiometric();
              } finally {
                setBusy(false);
              }
            }
          : undefined
      }
    />
  );
}

function RootShell() {
  const { registerInteraction } = useLocalSecurity();

  return (
    <View
      style={styles.root}
      onStartShouldSetResponderCapture={() => {
        registerInteraction();
        return false;
      }}
    >
      <RootLayoutNav />
      <LocalSecurityGate />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppSentryBoundary context={{ app: "admin-mobile" }}>
        <PaperProvider theme={DefaultTheme}>
          <AuthProvider>
            <LocalSecurityProvider>
              <RootShell />
            </LocalSecurityProvider>
          </AuthProvider>
        </PaperProvider>
      </AppSentryBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    gap: 12,
  },
  loadingText: {
    color: "#64748b",
  },
});
