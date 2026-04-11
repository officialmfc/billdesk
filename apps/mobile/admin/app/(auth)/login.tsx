import { Image, KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { useAuth } from "@/contexts/AuthContext";
import {
  openHostedAdminLogin,
  openHostedAdminPasswordReset,
} from "@/lib/supabase";

export default function LoginScreen() {
  const { isLoading } = useAuth();

  const handleHostedLogin = async () => {
    await openHostedAdminLogin();
  };

  const handlePasswordReset = async () => {
    await openHostedAdminPasswordReset();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <Image
              source={require("../../assets/mfc_admin_logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="headlineMedium" style={styles.title}>
              Admin
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Shared secure sign-in opens in your browser and returns to the app.
            </Text>
          </View>

          <Button mode="contained" onPress={() => void handleHostedLogin()} disabled={isLoading}>
            Continue to secure sign in
          </Button>
          <Button mode="text" onPress={() => void handlePasswordReset()} disabled={isLoading}>
            Reset password
          </Button>
          <Text variant="bodySmall" style={styles.helperText}>
            Admin access only
          </Text>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  card: {
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
  },
  cardContent: {
    gap: 16,
  },
  header: {
    alignItems: "center",
    gap: 8,
  },
  logo: {
    height: 88,
    width: 88,
  },
  title: {
    fontWeight: "700",
  },
  subtitle: {
    color: "#64748b",
    textAlign: "center",
  },
  helperText: {
    color: "#64748b",
    textAlign: "center",
  },
});
