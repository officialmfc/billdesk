import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Card, SegmentedButtons, Switch, Text, TextInput } from "react-native-paper";

import { useAppPreferences } from "@/contexts/AppPreferencesContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { updateMyProfile } from "@/lib/user-api";

export default function SettingsScreen() {
  const router = useRouter();
  const { sellerSectionEnabled, setSellerSectionEnabled } = useAppPreferences();
  const { logout, refreshProfile, user } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [defaultRole, setDefaultRole] = useState<"buyer" | "seller">(user?.defaultRole ?? "buyer");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setBusinessName(user?.businessName ?? "");
    setPhone(user?.phone ?? "");
    setDefaultRole(user?.defaultRole ?? "buyer");
  }, [user?.businessName, user?.defaultRole, user?.name, user?.phone]);

  const saveProfile = async () => {
    await updateMyProfile({
      businessName,
      defaultRole,
      name,
      phone,
    });
    await refreshProfile();
    setMessage("Profile updated.");
  };

  const changePassword = async () => {
    if (!newPassword.trim()) {
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw error;
    }
    setNewPassword("");
    setMessage("Password updated.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="headlineSmall" style={styles.title}>
            Settings
          </Text>
          <TextInput mode="outlined" label="Name" value={name} onChangeText={setName} />
          <TextInput
            mode="outlined"
            label="Business name"
            value={businessName}
            onChangeText={setBusinessName}
          />
          <TextInput mode="outlined" label="Phone" value={phone} onChangeText={setPhone} />
          <SegmentedButtons
            value={defaultRole}
            onValueChange={(value) => setDefaultRole(value as "buyer" | "seller")}
            buttons={[
              { value: "buyer", label: "Buyer" },
              { value: "seller", label: "Seller" },
            ]}
          />
          <Button mode="contained" onPress={() => void saveProfile()}>
            Save profile
          </Button>

          <Card mode="contained" style={styles.innerCard}>
            <Card.Content style={styles.innerCardContent}>
              <Text variant="titleMedium">Seller section</Text>
              <Text variant="bodySmall" style={styles.muted}>
                Keep seller navigation hidden until you want to use it.
              </Text>
              <Switch
                value={sellerSectionEnabled}
                onValueChange={(value) => void setSellerSectionEnabled(value)}
              />
              <Button mode="outlined" onPress={() => router.push("/seller")}>
                Open seller section
              </Button>
            </Card.Content>
          </Card>

          <TextInput
            mode="outlined"
            label="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Button mode="contained-tonal" onPress={() => void changePassword()}>
            Change password
          </Button>

          {message ? <Text variant="bodySmall">{message}</Text> : null}
          <Button mode="outlined" onPress={() => void logout()}>
            Log out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16 },
  card: { borderRadius: 20 },
  cardContent: { gap: 12 },
  title: { fontWeight: "700" },
  innerCard: { borderRadius: 16 },
  innerCardContent: { gap: 8 },
  muted: { color: "#64748b" },
});
