"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCreationDialog } from "@/components/users/UserCreationDialog";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@mfc/data-access";
import { useEffect, useMemo, useState } from "react";

interface User {
  address: string | null;
  auth_user_id: string | null;
  business_name: string | null;
  default_role: string;
  id: string;
  is_active: boolean;
  name: string;
  phone: string;
  updated_at: string;
  user_type: string;
}

type PendingRegistration = {
  id: string;
  status: string;
  supabase_record_id: string | null;
};

function authBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

async function getAuthHubToken(supabase: ReturnType<typeof createClient>): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token?.trim();
  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

async function fetchAuthHubJson<T>(
  supabase: ReturnType<typeof createClient>,
  path: string
): Promise<T> {
  const token = await getAuthHubToken(supabase);
  const response = await fetch(`${authBaseUrl()}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const payload = (await response.json()) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

export default function UsersPage(): React.ReactElement {
  const supabase = useMemo(() => createClient(), []);
  const [filter, setFilter] = useState<"all" | "vendor" | "business">("all");
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [inviteTarget, setInviteTarget] = useState<User | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const filters = useMemo(() => {
    if (filter === "all") return undefined;
    return { user_type: filter };
  }, [filter]);

  const { data: allUsers = [], loading } = useQuery<User>("users", {
    filters,
    orderBy: { field: "name", direction: "asc" },
  });

  const users = allUsers;

  const refreshPendingRegistrations = async () => {
    setPendingLoading(true);
    try {
      const { rows } = await fetchAuthHubJson<{ rows: PendingRegistration[] }>(
        supabase,
        "/api/requests"
      );
      setPendingRegistrations(rows ?? []);
    } catch (error) {
      console.warn("Could not load pending invites:", error);
      setPendingRegistrations([]);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    void refreshPendingRegistrations();
  }, [supabase]);

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

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "vendor":
        return "bg-blue-500";
      case "business":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "seller":
        return "bg-purple-500";
      case "buyer":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const openInviteForUser = (user: User) => {
    setInviteTarget(user);
    setInviteDialogOpen(true);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all users in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{users.length} users</Badge>
          <UserCreationDialog
            onSuccess={() => {
              void refreshPendingRegistrations();
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>All Users</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "vendor" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("vendor")}
              >
                Vendors
              </Button>
              <Button
                variant={filter === "business" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("business")}
              >
                Business
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No users found</div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="p-3">Name</th>
                    <th className="p-3">Business Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Access</th>
                    <th className="p-3">Last Updated</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const hasPendingInvite = pendingInviteIds.has(user.id);
                    const statusLabel = user.auth_user_id
                      ? "Linked"
                      : hasPendingInvite
                        ? "Invite pending"
                        : "Unlinked";

                    return (
                      <tr key={user.id} className="border-b last:border-b-0">
                        <td className="p-3 font-medium">{user.name}</td>
                        <td className="p-3">
                          {user.business_name || <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="p-3 font-mono text-sm">{user.phone}</td>
                        <td className="p-3">
                          <Badge className={getUserTypeColor(user.user_type)}>{user.user_type}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className={getRoleColor(user.default_role)}>
                            {user.default_role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={
                              user.auth_user_id
                                ? "bg-green-50"
                                : hasPendingInvite
                                  ? "bg-amber-50"
                                  : "bg-slate-50"
                            }
                          >
                            {statusLabel}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {new Date(user.updated_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-2">
                            {!user.auth_user_id && !hasPendingInvite ? (
                              <Button variant="outline" size="sm" onClick={() => openInviteForUser(user)}>
                                Invite
                              </Button>
                            ) : null}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log("View user:", user.id);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log("Edit user:", user.id);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Realtime Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>Realtime updates enabled</span>
            </div>
            <p className="text-muted-foreground">
              This page automatically updates when users are added, modified, or deleted in the
              database.
            </p>
          </div>
        </CardContent>
      </Card>

      {inviteTarget ? (
        <UserCreationDialog
          existingUserId={inviteTarget.id}
          existingUserLabel={
            inviteTarget.business_name
              ? `${inviteTarget.business_name} (${inviteTarget.name})`
              : inviteTarget.name
          }
          initialValues={{
            email: "",
            fullName: inviteTarget.name,
            businessName: inviteTarget.business_name || "",
            phone: inviteTarget.phone,
            userType: inviteTarget.user_type as "vendor" | "business",
            defaultRole: inviteTarget.default_role as "buyer" | "seller",
          }}
          inviteOnly
          lockedDefaultRole={inviteTarget.default_role as "buyer" | "seller"}
          lockedUserType={inviteTarget.user_type as "vendor" | "business"}
          dialogDescription={
            pendingLoading
              ? "Bind this invite to the selected user row."
              : "Bind this invite to the selected user row. Pending status will update from auth hub."
          }
          dialogTitle="Invite Existing User"
          initialAuthMode="with_invite"
          onOpenChange={(open) => {
            setInviteDialogOpen(open);
            if (!open) {
              setInviteTarget(null);
            }
          }}
          open={inviteDialogOpen}
          submitLabel="Create Invite"
          trigger={null}
          onSuccess={() => {
            setInviteTarget(null);
            void refreshPendingRegistrations();
          }}
        />
      ) : null}
    </div>
  );
}
