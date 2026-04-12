export type AuthHubBootstrapAccess = {
  has_user_profile: boolean;
  is_admin: boolean;
  is_manager: boolean;
  staff_id: string | null;
  user_id: string | null;
};

export type AuthHubBootstrapUserProfile = {
  address: Record<string, unknown> | null;
  businessName: string | null;
  defaultRole: "buyer" | "seller";
  id: string;
  name: string;
  phone: string | null;
  userType: "business" | "vendor";
};

export type AuthHubBootstrapStaffProfile = {
  display_name: string;
  full_name: string;
  is_active: boolean;
  role: "admin" | "manager" | "mfc_seller" | string;
  user_id: string;
};

export type AuthHubBootstrapSnapshot = {
  access: AuthHubBootstrapAccess;
  account: Record<string, unknown> | null;
  accounts: Record<string, unknown>[];
  devices: Record<string, unknown>[];
  fetched_at: string;
  ok: true;
  profile: AuthHubBootstrapUserProfile | null;
  snapshot_version: number;
  source: string;
  staff_profile: AuthHubBootstrapStaffProfile | null;
};

function getAuthBaseUrl(authBaseUrl?: string): string {
  return (
    authBaseUrl?.trim().replace(/\/+$/, "") ||
    process.env.EXPO_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

function normalizeUserProfile(payload: unknown): AuthHubBootstrapUserProfile | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as Partial<AuthHubBootstrapUserProfile> & {
    address?: unknown;
    defaultRole?: unknown;
    userType?: unknown;
  };

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    (candidate.businessName !== undefined &&
      candidate.businessName !== null &&
      typeof candidate.businessName !== "string") ||
    (candidate.phone !== undefined && candidate.phone !== null && typeof candidate.phone !== "string") ||
    (candidate.defaultRole !== "buyer" && candidate.defaultRole !== "seller") ||
    (candidate.userType !== "business" && candidate.userType !== "vendor")
  ) {
    return null;
  }

  const address =
    candidate.address && typeof candidate.address === "object" && !Array.isArray(candidate.address)
      ? (candidate.address as Record<string, unknown>)
      : null;

  return {
    address,
    businessName: candidate.businessName ?? null,
    defaultRole: candidate.defaultRole,
    id: candidate.id,
    name: candidate.name,
    phone: candidate.phone ?? null,
    userType: candidate.userType,
  };
}

function normalizeStaffProfile(payload: unknown): AuthHubBootstrapStaffProfile | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as Partial<AuthHubBootstrapStaffProfile>;
  if (
    typeof candidate.user_id !== "string" ||
    typeof candidate.full_name !== "string" ||
    typeof candidate.display_name !== "string" ||
    typeof candidate.is_active !== "boolean" ||
    typeof candidate.role !== "string"
  ) {
    return null;
  }

  return {
    display_name: candidate.display_name,
    full_name: candidate.full_name,
    is_active: candidate.is_active,
    role: candidate.role,
    user_id: candidate.user_id,
  };
}

function normalizeSnapshot(payload: unknown): AuthHubBootstrapSnapshot | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as Partial<AuthHubBootstrapSnapshot> & {
    account?: unknown;
    accounts?: unknown;
    access?: unknown;
    devices?: unknown;
    profile?: unknown;
    staff_profile?: unknown;
  };

  if (
    candidate.ok !== true ||
    typeof candidate.snapshot_version !== "number" ||
    typeof candidate.source !== "string" ||
    typeof candidate.fetched_at !== "string" ||
    !candidate.access ||
    !candidate.accounts ||
    !candidate.devices
  ) {
    return null;
  }

  return {
    access: candidate.access as AuthHubBootstrapAccess,
    account:
      candidate.account && typeof candidate.account === "object" && !Array.isArray(candidate.account)
        ? (candidate.account as Record<string, unknown>)
        : null,
    accounts: Array.isArray(candidate.accounts)
      ? candidate.accounts.filter((entry) => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) as Record<
          string,
          unknown
        >[]
      : [],
    devices: Array.isArray(candidate.devices)
      ? candidate.devices.filter((entry) => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)) as Record<
          string,
          unknown
        >[]
      : [],
    fetched_at: candidate.fetched_at,
    ok: true,
    profile: normalizeUserProfile(candidate.profile),
    snapshot_version: candidate.snapshot_version,
    source: candidate.source,
    staff_profile: normalizeStaffProfile(candidate.staff_profile),
  };
}

export async function fetchAuthHubBootstrapSnapshot(
  accessToken: string,
  authBaseUrl?: string
): Promise<AuthHubBootstrapSnapshot> {
  const response = await fetch(`${getAuthBaseUrl(authBaseUrl)}/api/bootstrap`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as
    | AuthHubBootstrapSnapshot
    | { error?: string };

  if (!response.ok) {
    throw new Error((payload as { error?: string }).error || "Could not load auth bootstrap state.");
  }

  const snapshot = normalizeSnapshot(payload);
  if (!snapshot) {
    throw new Error("The auth bootstrap response was incomplete.");
  }

  return snapshot;
}
