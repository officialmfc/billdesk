import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Constants from "expo-constants";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DefaultTheme, PaperProvider, Text } from "react-native-paper";
import { AppSentryBoundary, initializeAppSentry } from "@mfc/auth";

import { AppPreferencesProvider } from "@/contexts/AppPreferencesContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

initializeAppSentry({
  appName: "user-mobile",
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
        router.replace("/(tabs)/bills");
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
          Loading MFC User...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="bill/[billId]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppSentryBoundary context={{ app: "user-mobile" }}>
        <PaperProvider theme={DefaultTheme}>
          <AppPreferencesProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </AppPreferencesProvider>
        </PaperProvider>
      </AppSentryBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
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
