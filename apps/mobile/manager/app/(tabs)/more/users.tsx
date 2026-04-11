import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Share, StyleSheet, View } from "react-native";
import { Button, Chip, Text } from "react-native-paper";

import { SearchField } from "@/components/ui/SearchField";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { SelectModalField } from "@/components/forms/SelectModalField";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { formatLongDate } from "@/lib/formatters";
import { rpcService } from "@/lib/rpc-service";
import { appColors } from "@/lib/theme";
import { buildHostedManagerAuthUrl } from "@/lib/supabase";
import { adminRepository } from "@/repositories/adminRepository";
import { type InvitationResult } from "@/lib/rpc-service";

type AuthMode = "with_invite" | "without_auth";
type UserType = "business" | "vendor";
type DefaultRole = "buyer" | "seller";
type InvitePlatform = "web" | "desktop" | "mobile";

const userTypeOptions = [
  { value: "business", label: "Business" },
  { value: "vendor", label: "Vendor" },
] as const;

const roleOptions = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
] as const;

function createUserDraft() {
  return {
    businessName: "",
    email: "",
    fullName: "",
    phone: "",
  };
}

export default function UsersScreen() {
  const router = useRouter();
  const { performFullSync } = useSync();
  const [search, setSearch] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("without_auth");
  const [userType, setUserType] = useState<UserType>("business");
  const [defaultRole, setDefaultRole] = useState<DefaultRole>("buyer");
  const [draft, setDraft] = useState(createUserDraft);
  const [creating, setCreating] = useState(false);
  const [invitePlatform, setInvitePlatform] = useState<InvitePlatform>("mobile");
  const [inviteResult, setInviteResult] = useState<InvitationResult | null>(null);
  const { data, reload } = useRepositoryData(() => adminRepository.getUsers(search), [search]);

  const directoryRows = useMemo(() => data?.users ?? [], [data?.users]);
  const staffRows = useMemo(() => data?.staff ?? [], [data?.staff]);
  const inviteUrl = useMemo(() => {
    if (!inviteResult) {
      return null;
    }

    return buildHostedManagerAuthUrl(inviteResult.signup_path);
  }, [inviteResult]);

  const handleCreate = async () => {
    if (draft.fullName.trim().length < 2 || draft.phone.trim().length < 10) {
      ErrorHandler.showWarning("Contact name and phone are required.");
      return;
    }

    if (userType === "business" && draft.businessName.trim().length < 2) {
      ErrorHandler.showWarning("Business name is required for business users.");
      return;
    }

    if (authMode === "with_invite" && !draft.email.trim()) {
      ErrorHandler.showWarning("Email is required to create an invite.");
      return;
    }

    try {
      setCreating(true);
      if (authMode === "with_invite") {
        const result = await rpcService.createUserInvitation({
          p_email: draft.email.trim(),
          p_full_name: draft.fullName.trim(),
          p_business_name: draft.businessName.trim() || null,
          p_phone: draft.phone.trim() || null,
          p_user_type: userType,
          p_default_role: defaultRole,
          p_requested_platform: invitePlatform,
        });

        setInviteResult(result);
        setDraft(createUserDraft());
        ErrorHandler.showSuccess("Invite created.");
      } else {
        setInviteResult(null);
        await rpcService.createUserAsStaff({
          p_business_name: draft.businessName.trim() || draft.fullName.trim(),
          p_default_role: defaultRole,
          p_full_name: draft.fullName.trim(),
          p_phone: draft.phone.trim(),
          p_user_type: userType,
        });
        await performFullSync();
        await reload();
        setDraft(createUserDraft());
        ErrorHandler.showSuccess("User created.");
      }
    } catch (error) {
      ErrorHandler.handle(error, "Create user");
    } finally {
      setCreating(false);
    }
  };

  const shareInvite = async () => {
    if (!inviteUrl) {
      return;
    }

    await Share.share({
      title: "MFC User Invitation",
      message: `Join MFC: ${inviteUrl}`,
    });
  };

  return (
    <ScreenLayout title="Users" subtitle="Customers, vendors, and team directory" showBack onBack={() => router.back()}>
      <SearchField placeholder="Search users, business, phone..." value={search} onChangeText={setSearch} />

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Create User</Text>
        <View style={styles.choiceRow}>
          <Chip
            selected={authMode === "without_auth"}
            onPress={() => {
              setAuthMode("without_auth");
              setInviteResult(null);
            }}
          >
            Without login
          </Chip>
          <Chip
            selected={authMode === "with_invite"}
            onPress={() => {
              setAuthMode("with_invite");
              setInviteResult(null);
            }}
          >
            With invite
          </Chip>
        </View>
        <View style={styles.choiceRow}>
          {userTypeOptions.map((option) => (
            <Chip
              key={option.value}
              selected={userType === option.value}
              onPress={() => setUserType(option.value)}
            >
              {option.label}
            </Chip>
          ))}
          {roleOptions.map((option) => (
            <Chip
              key={option.value}
              selected={defaultRole === option.value}
              onPress={() => setDefaultRole(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </View>
        <PaperTextInput
          mode="outlined"
          label={userType === "business" ? "Business name" : "Vendor / seller name"}
          value={draft.businessName}
          onChangeText={(value) => setDraft((current) => ({ ...current, businessName: value }))}
        />
        <PaperTextInput
          mode="outlined"
          label="Contact name"
          value={draft.fullName}
          onChangeText={(value) => setDraft((current) => ({ ...current, fullName: value }))}
        />
        <PaperTextInput
          mode="outlined"
          label="Phone"
          keyboardType="phone-pad"
          value={draft.phone}
          onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))}
        />
        {authMode === "with_invite" ? (
          <>
            <PaperTextInput
              mode="outlined"
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={draft.email}
              onChangeText={(value) => setDraft((current) => ({ ...current, email: value }))}
            />
            <View style={styles.choiceRow}>
              {(["mobile", "desktop", "web"] as const).map((platform) => (
                <Chip
                  key={platform}
                  selected={invitePlatform === platform}
                  onPress={() => setInvitePlatform(platform)}
                >
                  {platform}
                </Chip>
              ))}
            </View>
          </>
        ) : null}
        <Button mode="contained" loading={creating} disabled={creating} onPress={() => void handleCreate()}>
          {authMode === "with_invite" ? "Create invite" : "Create user"}
        </Button>
        {inviteUrl ? (
          <View style={styles.inviteBox}>
            <Text variant="bodySmall" style={styles.mutedText}>
              Invite link
            </Text>
            <Text selectable variant="bodyMedium" style={styles.primaryCellText}>
              {inviteUrl}
            </Text>
            <Button mode="outlined" onPress={() => void shareInvite()}>
              Share invite
            </Button>
          </View>
        ) : null}
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Directory</Text>
        <SheetTable
          columns={[
            { key: "name", label: "Name", width: 180 },
            { key: "role", label: "Role", width: 90, align: "center" },
            { key: "auth", label: "Auth", width: 80, align: "center" },
            { key: "phone", label: "Phone", width: 120, align: "right" },
          ]}
          rows={directoryRows}
          keyExtractor={(row) => row.id}
          emptyTitle="No users"
          emptyDescription="No synced users matched this search."
          renderCell={(row, column) => {
            switch (column.key) {
              case "name":
                return (
                  <View style={styles.cellCopy}>
                    <Text variant="bodyMedium" style={styles.primaryCellText}>
                      {row.displayName}
                    </Text>
                    <Text variant="bodySmall" style={styles.mutedText}>
                      {row.name}
                    </Text>
                  </View>
                );
              case "role":
                return (
                  <Text variant="bodySmall" style={styles.centerText}>
                    {row.defaultRole}
                  </Text>
                );
              case "auth":
                return (
                  <Text variant="bodySmall" style={styles.centerText}>
                    {row.authUserId ? "Yes" : "No"}
                  </Text>
                );
              case "phone":
                return (
                  <Text variant="bodySmall" style={styles.rightText}>
                    {row.phone || "-"}
                  </Text>
                );
              default:
                return null;
            }
          }}
        />
      </SurfaceCard>

      <SurfaceCard contentStyle={styles.stack}>
        <Text variant="titleMedium">Team</Text>
        <SheetTable
          columns={[
            { key: "name", label: "Name", width: 190 },
            { key: "role", label: "Role", width: 110, align: "center" },
            { key: "updated", label: "Updated", width: 120, align: "right" },
          ]}
          rows={staffRows}
          keyExtractor={(row) => row.id}
          emptyTitle="No staff"
          emptyDescription="No staff matched this search."
          renderCell={(row, column) => {
            switch (column.key) {
              case "name":
                return (
                  <Text variant="bodyMedium" style={styles.primaryCellText}>
                    {row.displayName}
                  </Text>
                );
              case "role":
                return (
                  <Text variant="bodySmall" style={styles.centerText}>
                    {row.role.replaceAll("_", " ")}
                  </Text>
                );
              case "updated":
                return (
                  <Text variant="bodySmall" style={styles.rightText}>
                    {formatLongDate(row.updatedAt.slice(0, 10))}
                  </Text>
                );
              default:
                return null;
            }
          }}
        />
      </SurfaceCard>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 12,
  },
  choiceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cellCopy: {
    gap: 2,
  },
  primaryCellText: {
    color: appColors.foreground,
    fontWeight: "700",
  },
  centerText: {
    textAlign: "center",
    textTransform: "capitalize",
  },
  rightText: {
    textAlign: "right",
  },
  mutedText: {
    color: appColors.mutedForeground,
  },
  inviteBox: {
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
});
