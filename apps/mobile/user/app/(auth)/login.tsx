import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Text } from "react-native-paper";

import { useAuth } from "@/contexts/AuthContext";
import { openHostedUserLogin, openHostedUserPasswordReset } from "@/lib/supabase";

export default function LoginScreen() {
  const { isLoading } = useAuth();

  const handleHostedLogin = async () => {
    await openHostedUserLogin();
  };

  const handlePasswordReset = async () => {
    await openHostedUserPasswordReset();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Image
                source={require("../../assets/mfc_user_logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerCopy}>
                <Text variant="headlineMedium" style={styles.title}>
                  User
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Shared secure sign-in opens in your browser and returns to the app.
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <Button
                mode="contained"
                onPress={() => void handleHostedLogin()}
                loading={isLoading}
                disabled={isLoading}
                style={styles.primaryButton}
                contentStyle={styles.buttonContent}
              >
                Continue to secure sign in
              </Button>

              <Button
                mode="text"
                onPress={() => void handlePasswordReset()}
                disabled={isLoading}
                contentStyle={styles.buttonContent}
              >
                Reset password
              </Button>

              <Text variant="bodySmall" style={styles.helperText}>
                Existing user access
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  content: {
    alignSelf: "center",
    maxWidth: 480,
    width: "100%",
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe4f0",
    borderRadius: 28,
    borderWidth: 1,
    elevation: 3,
    gap: 20,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  header: {
    alignItems: "center",
    gap: 10,
  },
  logo: {
    height: 88,
    width: 88,
  },
  headerCopy: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    color: "#0f172a",
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
    textAlign: "center",
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    borderRadius: 16,
    marginTop: 4,
  },
  buttonContent: {
    minHeight: 46,
  },
  helperText: {
    color: "#64748b",
    textAlign: "center",
  },
});
