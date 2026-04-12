import type { UserProfile } from "@/lib/user-api";

const AUTH_BOOTSTRAP_CACHE_PREFIX = "mfc-user-web-auth-bootstrap:";
const memoryStore = new Map<string, string>();

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
};

export type UserAuthBootstrapAccess = {
  has_user_profile: boolean;
  is_admin: boolean;
  is_manager: boolean;
  staff_id: string | null;
  user_id: string | null;
};

export type UserAuthBootstrapAccount = {
  app: string;
  auth_user_id: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
  business_name: string | null;
  created_at: string;
  email: string;
  full_name: string;
  id: string;
  last_login_at: string | null;
  last_login_device_id: string | null;
  last_login_ip: string | null;
  metadata_json: string;
  platform: string | null;
  role: string;
  source: string;
  status: string;
  updated_at: string;
};

export type UserAuthBootstrapDevice = {
  app: string;
  auth_user_id: string;
  created_at: string;
  device_id: string;
  device_label: string;
  id: string;
  last_seen_at: string;
  lease_expires_at: string;
  platform: string;
  revoked_at: string | null;
  revoked_reason: string | null;
  status: string;
  updated_at: string;
};

export type UserAuthBootstrapProfile = UserProfile;

export type UserAuthBootstrapSnapshot = {
  access: UserAuthBootstrapAccess;
  account: UserAuthBootstrapAccount | null;
  accounts: UserAuthBootstrapAccount[];
  devices: UserAuthBootstrapDevice[];
  fetched_at: string;
  ok: true;
  profile: UserAuthBootstrapProfile | null;
  snapshot_version: number;
  source: string;
};

function getAuthBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

function hasWindowStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStorage(): StorageAdapter {
  if (hasWindowStorage()) {
    return {
      getItem: async (key) => window.localStorage.getItem(key),
      setItem: async (key, value) => {
        window.localStorage.setItem(key, value);
      },
    };
  }

  return {
    getItem: async (key) => memoryStore.get(key) ?? null,
    setItem: async (key, value) => {
      memoryStore.set(key, value);
    },
  };
}

function cacheKey(authUserId: string): string {
  return `${AUTH_BOOTSTRAP_CACHE_PREFIX}${authUserId}`;
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeProfile(payload: unknown): UserAuthBootstrapProfile | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as Partial<UserAuthBootstrapProfile> & {
    address?: unknown;
    defaultRole?: unknown;
    userType?: unknown;
  };

  if (
    typeof candidate.id !== "string" ||
    typeof candidate.name !== "string" ||
    (candidate.businessName !== undefined && candidate.businessName !== null && typeof candidate.businessName !== "string") ||
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

function normalizeSnapshot(payload: unknown): UserAuthBootstrapSnapshot | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const candidate = payload as Partial<UserAuthBootstrapSnapshot> & {
    account?: unknown;
    accounts?: unknown;
    access?: unknown;
    devices?: unknown;
    profile?: unknown;
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
    access: candidate.access as UserAuthBootstrapAccess,
    account:
      candidate.account && typeof candidate.account === "object" && !Array.isArray(candidate.account)
        ? (candidate.account as UserAuthBootstrapAccount)
        : null,
    accounts: Array.isArray(candidate.accounts)
      ? (candidate.accounts.filter(
          (entry): entry is UserAuthBootstrapAccount =>
            Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
        ) as UserAuthBootstrapAccount[])
      : [],
    devices: Array.isArray(candidate.devices)
      ? (candidate.devices.filter(
          (entry): entry is UserAuthBootstrapDevice =>
            Boolean(entry) && typeof entry === "object" && !Array.isArray(entry)
        ) as UserAuthBootstrapDevice[])
      : [],
    fetched_at: candidate.fetched_at,
    ok: true,
    profile: normalizeProfile(candidate.profile),
    snapshot_version: candidate.snapshot_version,
    source: candidate.source,
  };
}

export async function readCachedAuthBootstrapSnapshot(
  authUserId: string
): Promise<UserAuthBootstrapSnapshot | null> {
  const storage = getStorage();
  const value = await storage.getItem(cacheKey(authUserId));
  return normalizeSnapshot(parseJson<UserAuthBootstrapSnapshot>(value));
}

export async function writeCachedAuthBootstrapSnapshot(
  authUserId: string,
  snapshot: UserAuthBootstrapSnapshot
): Promise<void> {
  const storage = getStorage();
  await storage.setItem(cacheKey(authUserId), JSON.stringify(snapshot));
}

export async function fetchAuthBootstrapSnapshot(
  accessToken: string
): Promise<UserAuthBootstrapSnapshot> {
  const response = await fetch(`${getAuthBaseUrl()}/api/bootstrap`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as
    | UserAuthBootstrapSnapshot
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      (payload as { error?: string }).error || "Could not load auth bootstrap state."
    );
  }

  const snapshot = normalizeSnapshot(payload);
  if (!snapshot) {
    throw new Error("The auth bootstrap response was incomplete.");
  }

  return snapshot;
}
