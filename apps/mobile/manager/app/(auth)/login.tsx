import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";
import { WifiOff } from "lucide-react-native";

import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { useAuth } from "@/contexts/AuthContext";
import { useConnectivity } from "@/hooks/useConnectivity";
import { openHostedManagerLogin, openHostedManagerPasswordReset } from "@/lib/supabase";
import { appColors, appRadii, appSpacing } from "@/lib/theme";

export default function LoginScreen() {
  const { isLoading } = useAuth();
  const { isOnline } = useConnectivity();

  const handleHostedLogin = async () => {
    if (!isOnline) {
      return;
    }

    try {
      await openHostedManagerLogin();
    } catch (error) {
      console.error("Hosted login failed:", error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      await openHostedManagerPasswordReset();
    } catch (error) {
      console.error("Password reset open failed:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <SurfaceCard style={styles.card} contentStyle={styles.cardContent}>
            <View style={styles.header}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerCopy}>
                <Text variant="headlineMedium" style={styles.title}>
                  Manager
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Shared secure sign-in opens in your browser and returns to the app.
                </Text>
              </View>

              {!isOnline ? (
                <View style={styles.offlineBanner}>
                  <WifiOff color={appColors.danger} size={16} />
                  <Text variant="bodySmall" style={styles.offlineText}>
                    You are offline. Connect to internet to sign in.
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={handleHostedLogin}
                disabled={isLoading || !isOnline}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
              >
                Continue to secure sign in
              </Button>

              <Button
                mode="text"
                onPress={handlePasswordReset}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
              >
                Reset password
              </Button>

              <Text variant="bodySmall" style={styles.helperText}>
                Manager access only
              </Text>
            </View>
          </SurfaceCard>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.secondarySurface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: appSpacing.lg,
  },
  content: {
    alignSelf: "center",
    maxWidth: 480,
    width: "100%",
  },
  card: {
    borderRadius: appRadii.xl,
  },
  cardContent: {
    gap: appSpacing.lg,
    padding: appSpacing.lg,
  },
  header: {
    alignItems: "center",
    gap: appSpacing.sm,
  },
  logo: {
    height: 80,
    width: 80,
  },
  headerCopy: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    color: appColors.foreground,
    fontWeight: "800",
  },
  subtitle: {
    color: appColors.mutedForeground,
    textAlign: "center",
  },
  offlineBanner: {
    alignItems: "center",
    backgroundColor: appColors.dangerSoft,
    borderRadius: appRadii.md,
    flexDirection: "row",
    gap: appSpacing.xs,
    paddingHorizontal: appSpacing.sm,
    paddingVertical: appSpacing.xs,
  },
  offlineText: {
    color: appColors.danger,
    flexShrink: 1,
  },
  actions: {
    gap: appSpacing.sm,
  },
  primaryButton: {
    marginTop: appSpacing.xs,
  },
  buttonContent: {
    minHeight: 48,
  },
  helperText: {
    color: appColors.mutedForeground,
    textAlign: "center",
  },
});
