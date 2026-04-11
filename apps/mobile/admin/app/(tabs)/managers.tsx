import { useEffect, useMemo, useState } from "react";
import { RefreshControl, ScrollView, Share, StyleSheet, View } from "react-native";
import { Button, Card, Chip, Text, TextInput } from "react-native-paper";

import {
  createManagerInvitation,
  getAdminManagerBreakdown,
  getCurrentDateIST,
  type AdminManagerBreakdownRow,
  type ManagerInvitationResult,
} from "@/lib/admin-api";
import { buildHostedAdminAuthUrl } from "@/lib/supabase";
import { DateNavigator, shiftDate } from "@/components/DateNavigator";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ManagersScreen() {
  const [dateStr, setDateStr] = useState(getCurrentDateIST());
  const [rows, setRows] = useState<AdminManagerBreakdownRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [invitePlatform, setInvitePlatform] = useState<"web" | "desktop" | "mobile">("desktop");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteResult, setInviteResult] = useState<ManagerInvitationResult | null>(null);

  const inviteUrl = useMemo(() => {
    if (!inviteResult) {
      return null;
    }

    return buildHostedAdminAuthUrl(inviteResult.signupPath || inviteResult.signup_path);
  }, [inviteResult]);

  const load = async () => {
    setRefreshing(true);
    try {
      setRows(await getAdminManagerBreakdown(dateStr));
    } finally {
      setRefreshing(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      return;
    }

    setInviteBusy(true);
    try {
      const result = await createManagerInvitation(inviteEmail.trim(), inviteName.trim(), invitePlatform);
      setInviteResult(result);
      setInviteEmail("");
      setInviteName("");
    } finally {
      setInviteBusy(false);
    }
  };

  const shareInvite = async () => {
    if (!inviteUrl) {
      return;
    }

    await Share.share({
      message: `Join the MFC manager team: ${inviteUrl}`,
      title: "MFC Manager Invitation",
    });
  };

  useEffect(() => {
    void load();
  }, [dateStr]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load()} />}
    >
      <Text variant="headlineMedium" style={styles.title}>
        Managers
      </Text>

      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            Invite manager
          </Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>
            Generate a hosted auth link for a manager and share it by email or chat.
          </Text>
          <TextInput
            mode="outlined"
            label="Full name"
            value={inviteName}
            onChangeText={setInviteName}
          />
          <TextInput
            mode="outlined"
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={inviteEmail}
            onChangeText={setInviteEmail}
          />
          <View style={styles.platformRow}>
            {(["desktop", "web", "mobile"] as const).map((platform) => (
              <Chip
                key={platform}
                selected={invitePlatform === platform}
                onPress={() => setInvitePlatform(platform)}
              >
                {platform}
              </Chip>
            ))}
          </View>
          <Button mode="contained" loading={inviteBusy} disabled={inviteBusy} onPress={() => void sendInvite()}>
            Create invite
          </Button>
          {inviteUrl ? (
            <View style={styles.inviteResult}>
              <Text variant="bodySmall" style={styles.inviteLabel}>
                Invite link
              </Text>
              <Text selectable variant="bodyMedium" style={styles.inviteUrl}>
                {inviteUrl}
              </Text>
              <Button mode="outlined" onPress={() => void shareInvite()}>
                Share invite
              </Button>
            </View>
          ) : null}
        </Card.Content>
      </Card>

      <DateNavigator
        dateStr={dateStr}
        onPrevious={() => setDateStr((current) => shiftDate(current, -1))}
        onNext={() => setDateStr((current) => shiftDate(current, 1))}
        onSelectDate={setDateStr}
        onToday={() => setDateStr(getCurrentDateIST())}
      />

      {rows.map((row) => (
        <Card key={`${row.manager_id ?? "na"}-${row.manager_name}`} style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <Text variant="titleMedium" style={styles.managerName}>
              {row.manager_name}
            </Text>
            <Text variant="bodyMedium">Sales {formatCurrency(row.sales_total)}</Text>
            <Text variant="bodyMedium">Collection {formatCurrency(row.collection_total)}</Text>
            <Text variant="bodyMedium">Spend {formatCurrency(row.spend_total)}</Text>
            <Text variant="bodyMedium">Payable {formatCurrency(row.payable_total)}</Text>
            <Text variant="bodyMedium">
              Chalans {row.chalan_count} • Bills {row.bill_count}
            </Text>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 12 },
  title: { fontWeight: "700" },
  card: { borderRadius: 20 },
  cardContent: { gap: 12 },
  cardTitle: { fontWeight: "700" },
  cardSubtitle: { color: "#64748b" },
  managerName: { fontWeight: "700" },
  platformRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  inviteResult: {
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  inviteLabel: {
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  inviteUrl: {
    color: "#0f172a",
  },
});
