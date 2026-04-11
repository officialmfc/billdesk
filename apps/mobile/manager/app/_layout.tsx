import { useEffect, useState } from 'react';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import Constants from "expo-constants";
import { PaperProvider } from 'react-native-paper';
import { Text } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { AppSentryBoundary, initializeAppSentry } from "@mfc/auth";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocalSecurityProvider, useLocalSecurity } from '@/contexts/LocalSecurityContext';
import { SyncProvider } from '@/contexts/SyncContext';
import {
  LocalSecurityLoadingOverlay,
  LocalSecurityLockScreen,
  LocalSecuritySetupScreen,
} from '@/components/auth/LocalSecurityScreens';
import { ErrorHandler } from '@/lib/error-handler';
import { getMobileLandingPreference } from '@/lib/mobile-landing-preference';
import { appTheme } from '@/lib/theme';

initializeAppSentry({
  appName: "manager-mobile",
  dsn: Constants.expoConfig?.extra?.sentryDsn as string | undefined,
  environment: __DEV__ ? "development" : "production",
  release: Constants.expoConfig?.version,
});

async function hideAndroidSystemBars(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    const NavigationBar = require('expo-navigation-bar') as typeof import('expo-navigation-bar');
    await NavigationBar.setBehaviorAsync('overlay-swipe');
    await NavigationBar.setVisibilityAsync('hidden');
  } catch {
    // Ignore if the host device does not support immersive nav control.
  }
}

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigationState = useRootNavigationState();
  const segments = useSegments();
  const router = useRouter();
  const rootSegment = segments[0];
  const inAuthGroup = rootSegment === '(auth)';
  const atRoot = !rootSegment;

  useEffect(() => {
    if (!navigationState?.key || isLoading) return;

    let cancelled = false;

    const syncRoute = async () => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
        return;
      }

      if (isAuthenticated && (inAuthGroup || atRoot)) {
        const landing = await getMobileLandingPreference();
        if (!cancelled) {
          router.replace(landing as never);
        }
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
          Loading MFC Manager...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(sales)" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
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
            ErrorHandler.showSuccess("Local unlock saved.");
          } catch (error) {
            ErrorHandler.handle(error, "Local security setup");
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
          } catch (error) {
            ErrorHandler.handle(error, "Unlock");
            return {
              lockoutRemainingSeconds: snapshot.lockoutRemainingSeconds,
              reason: "invalid" as const,
              success: false,
            };
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
              } catch (error) {
                ErrorHandler.handle(error, "Biometric unlock");
                return false;
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
        void hideAndroidSystemBars();
        return false;
      }}
    >
      <RootLayoutNav />
      <Toast />
      <LocalSecurityGate />
    </View>
  );
}

function AppBody() {
  return (
    <LocalSecurityProvider>
      <SyncProvider>
        <RootShell />
      </SyncProvider>
    </LocalSecurityProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void hideAndroidSystemBars();
  }, []);

  return (
    <SafeAreaProvider>
      <AppSentryBoundary context={{ app: "manager-mobile" }}>
        <PaperProvider theme={appTheme}>
          <AuthProvider>
            <AppBody />
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  loadingText: {
    color: '#64748b',
  },
});
