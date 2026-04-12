import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Share, StyleSheet, View } from "react-native";
import { Button, Chip, Dialog, Portal, Text } from "react-native-paper";

import { SearchField } from "@/components/ui/SearchField";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SheetTable } from "@/components/ui/SheetTable";
import { SurfaceCard } from "@/components/ui/SurfaceCard";
import { PaperTextInput } from "@/components/ui/PaperTextInput";
import { useRepositoryData } from "@/hooks/useRepositoryData";
import { useSync } from "@/contexts/SyncContext";
import { ErrorHandler } from "@/lib/error-handler";
import { formatLongDate } from "@/lib/formatters";
import { rpcService } from "@/lib/rpc-service";
import { appColors } from "@/lib/theme";
import { buildHostedManagerAuthUrl } from "@/lib/supabase";
import { adminRepository } from "@/repositories/adminRepository";
import { type InvitationResult } from "@/lib/rpc-service";
import type { ManagedUserRow } from "@/repositories/types";

type AuthMode = "with_invite" | "without_auth";
type UserType = "business" | "vendor";
type DefaultRole = "buyer" | "seller";

type PendingRegistration = {
  id: string;
  status: string;
  supabase_record_id: string | null;
};

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

function createExistingInviteDraft(user?: {
  businessName?: string | null;
  name?: string;
  phone?: string | null;
}) {
  return {
    businessName: user?.businessName ?? "",
    email: "",
    fullName: user?.name ?? "",
    phone: user?.phone ?? "",
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
  const [inviteResult, setInviteResult] = useState<InvitationResult | null>(null);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [inviteTarget, setInviteTarget] = useState<ManagedUserRow | null>(null);
  const [inviteDialogVisible, setInviteDialogVisible] = useState(false);
  const [inviteDraft, setInviteDraft] = useState(createExistingInviteDraft);
  const [inviteDialogLoading, setInviteDialogLoading] = useState(false);
  const [inviteDialogResult, setInviteDialogResult] = useState<InvitationResult | null>(null);
  const { data, reload } = useRepositoryData(() => adminRepository.getUsers(search), [search]);

  const directoryRows = useMemo(() => data?.users ?? [], [data?.users]);
  const staffRows = useMemo(() => data?.staff ?? [], [data?.staff]);
  const inviteUrl = useMemo(() => {
    if (!inviteResult) {
      return null;
    }

    return buildHostedManagerAuthUrl(inviteResult.signup_path);
  }, [inviteResult]);

  const inviteDialogUrl = useMemo(() => {
    if (!inviteDialogResult) {
      return null;
    }

    return buildHostedManagerAuthUrl(inviteDialogResult.signup_path);
  }, [inviteDialogResult]);

  const pendingInviteIds = useMemo(
    () =>
      new Set(
        pendingRegistrations
          .filter((row) => row.status === "invited" || row.status === "opened" || row.status === "approved_activation")
          .map((row) => row.supabase_record_id)
          .filter((value): value is string => Boolean(value))
      ),
    [pendingRegistrations]
  );

  const reloadPendingRegistrations = async () => {
    setPendingLoading(true);
    try {
      const rows = await rpcService.listPendingRegistrations();
      setPendingRegistrations(
        rows.map((row) => ({
          id: row.id,
          status: row.status,
          supabase_record_id: row.supabase_record_id,
        }))
      );
    } catch (error) {
      console.warn("Could not load pending invites:", error);
      setPendingRegistrations([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    void reloadPendingRegistrations();
  }, []);

  const openInviteForUser = (user: ManagedUserRow) => {
    setInviteTarget(user);
    setInviteDialogVisible(true);
    setInviteDraft(createExistingInviteDraft(user));
    setInviteDialogResult(null);
  };

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
          p_requested_platform: "mobile",
        });

        setInviteResult(result);
        setDraft(createUserDraft());
        await reloadPendingRegistrations();
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
        await reloadPendingRegistrations();
        setDraft(createUserDraft());
        ErrorHandler.showSuccess("User created.");
      }
    } catch (error) {
      ErrorHandler.handle(error, "Create user");
    } finally {
      setCreating(false);
    }
  };

  const shareInvite = async (url: string | null, title = "MFC User Invitation") => {
    if (!url) {
      return;
    }

    await Share.share({
      title,
      message: `Join MFC: ${url}`,
    });
  };

  const handleExistingInvite = async () => {
    if (!inviteTarget) {
      return;
    }

    if (inviteDraft.fullName.trim().length < 2 || inviteDraft.phone.trim().length < 10) {
      ErrorHandler.showWarning("Contact name and phone are required.");
      return;
    }

    if (inviteTarget.userType === "business" && inviteDraft.businessName.trim().length < 2) {
      ErrorHandler.showWarning("Business name is required for business users.");
      return;
    }

    if (!inviteDraft.email.trim()) {
      ErrorHandler.showWarning("Email is required to create an invite.");
      return;
    }

    try {
      setInviteDialogLoading(true);
      const result = await rpcService.createUserInvitation({
        p_email: inviteDraft.email.trim(),
        p_full_name: inviteDraft.fullName.trim(),
        p_business_name: inviteDraft.businessName.trim() || null,
        p_existing_user_id: inviteTarget.id,
        p_phone: inviteDraft.phone.trim() || null,
        p_user_type: inviteTarget.userType,
        p_default_role: inviteTarget.defaultRole,
        p_requested_platform: "mobile",
      });

      setInviteDialogResult(result);
      await Promise.all([reload(), reloadPendingRegistrations()]);
      ErrorHandler.showSuccess("Invite created.");
    } catch (error) {
      ErrorHandler.handle(error, "Create invite");
    } finally {
      setInviteDialogLoading(false);
    }
  };

  const closeInviteDialog = () => {
    setInviteDialogVisible(false);
    setInviteTarget(null);
    setInviteDraft(createExistingInviteDraft());
    setInviteDialogResult(null);
  };

  const getUserAccessState = (user: ManagedUserRow) => {
    if (user.authUserId) {
      return {
        label: "Linked",
        tone: "success" as const,
      };
    }

    if (pendingInviteIds.has(user.id)) {
      return {
        label: "Invite pending",
        tone: "warning" as const,
      };
    }

    if (pendingLoading) {
      return {
        label: "Checking",
        tone: "muted" as const,
      };
    }

    return {
      label: "Unlinked",
      tone: "muted" as const,
    };
  };

  const getStatusBadgeStyles = (tone: "success" | "warning" | "muted") => {
    switch (tone) {
      case "success":
        return [styles.statusBadge, styles.statusBadgeSuccess, styles.statusText, styles.statusTextSuccess] as const;
      case "warning":
        return [styles.statusBadge, styles.statusBadgeWarning, styles.statusText, styles.statusTextWarning] as const;
      default:
        return [styles.statusBadge, styles.statusBadgeMuted, styles.statusText, styles.statusTextMuted] as const;
    }
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
            <Text variant="bodySmall" style={styles.mutedText}>
              User invites open in the mobile app.
            </Text>
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
            <Button mode="outlined" onPress={() => void shareInvite(inviteUrl)}>
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
            { key: "access", label: "Access", width: 120, align: "center" },
            { key: "phone", label: "Phone", width: 120, align: "right" },
            { key: "invite", label: "Invite", width: 100, align: "center" },
          ]}
          rows={directoryRows}
          keyExtractor={(row) => row.id}
          emptyTitle="No users"
          emptyDescription="No synced users matched this search."
          renderCell={(row, column) => {
            const access = getUserAccessState(row);

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
              case "access":
                const [badgeStyle, badgeToneStyle, textStyle, textToneStyle] = getStatusBadgeStyles(access.tone);
                return (
                  <View style={[badgeStyle, badgeToneStyle]}>
                    <Text variant="labelSmall" style={[textStyle, textToneStyle]}>
                      {access.label}
                    </Text>
                  </View>
                );
              case "phone":
                return (
                  <Text variant="bodySmall" style={styles.rightText}>
                    {row.phone || "-"}
                  </Text>
                );
              case "invite":
                return !row.authUserId && !pendingInviteIds.has(row.id) && !pendingLoading ? (
                  <Button compact mode="text" onPress={() => openInviteForUser(row)} style={styles.tableActionButton}>
                    Invite
                  </Button>
                ) : (
                  <Text variant="bodySmall" style={styles.centerText}>
                    -
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

      <Portal>
        <Dialog visible={inviteDialogVisible} onDismiss={closeInviteDialog}>
          <Dialog.Title>Invite Existing User</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            {inviteTarget ? (
              <View style={styles.selectedUserCard}>
                <Text variant="titleSmall" style={styles.primaryCellText}>
                  {inviteTarget.businessName ? `${inviteTarget.businessName} (${inviteTarget.name})` : inviteTarget.name}
                </Text>
                <Text variant="bodySmall" style={styles.mutedText}>
                  {inviteTarget.phone || "No phone"}
                </Text>
              </View>
            ) : null}
            <PaperTextInput
              mode="outlined"
              label="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={inviteDraft.email}
              onChangeText={(value) => setInviteDraft((current) => ({ ...current, email: value }))}
            />
            <Text variant="bodySmall" style={styles.mutedText}>
              This invite will open in the mobile app.
            </Text>
            <PaperTextInput
              mode="outlined"
              label="Contact name"
              value={inviteDraft.fullName}
              onChangeText={(value) => setInviteDraft((current) => ({ ...current, fullName: value }))}
            />
            <PaperTextInput
              mode="outlined"
              label={inviteTarget?.userType === "business" ? "Business name" : "Vendor / seller name"}
              value={inviteDraft.businessName}
              onChangeText={(value) => setInviteDraft((current) => ({ ...current, businessName: value }))}
            />
            <PaperTextInput
              mode="outlined"
              label="Phone"
              keyboardType="phone-pad"
              value={inviteDraft.phone}
              onChangeText={(value) => setInviteDraft((current) => ({ ...current, phone: value }))}
            />
            <View style={styles.choiceRow}>
              <Chip compact selected>
                {inviteTarget?.userType || "user"}
              </Chip>
              <Chip compact selected>
                {inviteTarget?.defaultRole || "buyer"}
              </Chip>
            </View>
            {inviteDialogUrl ? (
              <View style={styles.inviteBox}>
                <Text variant="bodySmall" style={styles.mutedText}>
                  Invite link
                </Text>
                <Text selectable variant="bodyMedium" style={styles.primaryCellText}>
                  {inviteDialogUrl}
                </Text>
                <Button mode="outlined" onPress={() => void shareInvite(inviteDialogUrl, "MFC Existing User Invitation")}>
                  Share invite
                </Button>
              </View>
            ) : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeInviteDialog}>Cancel</Button>
            <Button loading={inviteDialogLoading} disabled={inviteDialogLoading} onPress={() => void handleExistingInvite()}>
              Create invite
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  statusBadgeWarning: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeMuted: {
    backgroundColor: "#e2e8f0",
  },
  statusText: {
    fontWeight: "700",
  },
  statusTextSuccess: {
    color: "#166534",
  },
  statusTextWarning: {
    color: "#92400e",
  },
  statusTextMuted: {
    color: "#475569",
  },
  tableActionButton: {
    minWidth: 0,
  },
  dialogContent: {
    gap: 12,
  },
  selectedUserCard: {
    gap: 4,
    borderColor: appColors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
