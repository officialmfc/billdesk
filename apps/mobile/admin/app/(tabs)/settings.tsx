import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { useAuth } from "@/contexts/AuthContext";

export default function SettingsScreen() {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Settings
          </Text>
          <Text variant="bodyMedium">Name: {user?.fullName ?? "Unknown"}</Text>
          <Text variant="bodyMedium">Email: {user?.email ?? "Unknown"}</Text>
          <Button mode="contained-tonal" onPress={() => void logout()}>
            Log out
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  card: {
    borderRadius: 20,
  },
  content: {
    gap: 12,
  },
  title: {
    fontWeight: "700",
  },
});
