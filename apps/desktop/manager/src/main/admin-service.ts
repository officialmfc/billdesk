import type {
  DesktopProductCreateInput,
  DesktopProductRecord,
  DesktopStockBatchCreateInput,
  DesktopStockBatchRecord,
  DesktopStockOverview,
  DesktopPendingRegistration,
  DesktopUserCreateInput,
  DesktopUserInvitationResult,
  DesktopUserRecord,
  SelectionOption,
} from "../shared/contracts";
import { getPowerSyncService } from "./powersync";
import { getSupabaseClient } from "./supabase";

type UserRow = {
  auth_user_id: string | null;
  business_name: string | null;
  default_role: "buyer" | "seller";
  id: string;
  is_active: number | boolean;
  name: string;
  phone: string | null;
  updated_at: string;
  user_type: "vendor" | "business";
};

type InvitationResult = {
  inviteToken?: string;
  invite_token: string;
  registrationId?: string;
  registration_id: string;
  requestedApp?: string;
  requested_app: string;
  requestedPlatform?: string;
  requested_platform: string;
  signupPath?: string;
  signup_path: string;
  supabaseRecordId?: string | null;
  supabase_record_id?: string | null;
};

function authHubBaseUrl(): string {
  return (
    process.env.MANAGER_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

async function getAuthHubToken(): Promise<string> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token?.trim();
  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

async function postAuthHubJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const token = await getAuthHubToken();
  const response = await fetch(`${authHubBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as { error?: string } & T;
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}

async function getAuthHubJson<T>(path: string): Promise<T> {
  const token = await getAuthHubToken();
  const response = await fetch(`${authHubBaseUrl()}${path}`, {
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

type ProductRow = {
  description: string | null;
  id: string;
  is_stock_tracked: number | boolean;
  name: string;
  updated_at: string;
};

type StaffRow = {
  full_name: string;
  id: string;
};

type StockBatchRow = {
  batch_code: string | null;
  cost_per_kg: number | null;
  current_weight_kg: number;
  id: string;
  initial_weight_kg: number;
  mfc_seller_id: string | null;
  mfc_seller_name: string | null;
  product_id: string;
  product_name: string | null;
  supplier_id: string | null;
  supplier_name: string | null;
  updated_at: string;
};

function asBoolean(value: number | boolean | null | undefined): boolean {
  return value === true || value === 1;
}

function formatUserLabel(user: Pick<UserRow, "name" | "business_name">): string {
  const businessName = user.business_name?.trim() ?? "";
  const name = user.name?.trim() ?? "";

  if (businessName && name && businessName !== name) {
    return `${businessName} (${name})`;
  }

  return businessName || name;
}

function toUserRecord(row: UserRow): DesktopUserRecord {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    name: row.name,
    businessName: row.business_name,
    phone: row.phone,
    userType: row.user_type,
    defaultRole: row.default_role,
    isActive: asBoolean(row.is_active),
    updatedAt: row.updated_at,
  };
}

function toProductRecord(row: ProductRow): DesktopProductRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isStockTracked: asBoolean(row.is_stock_tracked),
    updatedAt: row.updated_at,
  };
}

async function refreshReadModel(): Promise<void> {
  try {
    await getPowerSyncService().refresh();
  } catch (error) {
    console.warn("[desktop-manager] PowerSync refresh after admin write failed", error);
  }
}

export async function getUsersList(): Promise<DesktopUserRecord[]> {
  const rows = await getPowerSyncService().getAll<UserRow>(
    "SELECT id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at FROM users ORDER BY COALESCE(business_name, name)"
  );

  return rows.map(toUserRecord);
}

export async function createUser(input: DesktopUserCreateInput): Promise<DesktopUserRecord> {
  const supabase = getSupabaseClient();
  const { data: result, error } = await supabase.rpc("create_user_as_staff", {
    p_email: null,
    p_password: null,
    p_full_name: input.fullName.trim(),
    p_business_name: input.businessName?.trim() || "",
    p_phone: input.phone.trim(),
    p_user_type: input.userType,
    p_default_role: input.defaultRole,
    p_address: {},
    p_profile_photo_url: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: createdRow, error: fetchError } = await supabase
    .from("users")
    .select(
      "id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at"
    )
    .eq("id", result as string)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  await refreshReadModel();
  return toUserRecord(createdRow as UserRow);
}

export async function createUserInvitation(input: {
  email: string;
  fullName: string;
  businessName?: string | null;
  existingUserId?: string | null;
  phone?: string | null;
  userType: "vendor" | "business";
  defaultRole: "buyer" | "seller";
  requestedPlatform?: "web" | "desktop" | "mobile";
}): Promise<DesktopUserInvitationResult> {
  const data = await postAuthHubJson<InvitationResult>("/api/invites/user", {
    email: input.email.trim(),
    fullName: input.fullName.trim(),
    businessName: input.businessName?.trim() || null,
    existingUserId: input.existingUserId?.trim() || null,
    phone: input.phone?.trim() || null,
    userType: input.userType,
    defaultRole: input.defaultRole,
    requestedPlatform: input.requestedPlatform ?? "mobile",
  });

  await refreshReadModel();
  return {
    inviteToken: data.invite_token,
    registrationId: data.registration_id,
    requestedApp: data.requested_app,
    requestedPlatform: data.requested_platform,
    signupPath: data.signup_path,
    signupUrl: new URL(data.signup_path, authHubBaseUrl()).toString(),
    supabaseRecordId: data.supabase_record_id ?? data.supabaseRecordId ?? null,
  };
}

export async function listPendingRegistrations(): Promise<DesktopPendingRegistration[]> {
  const result = await getAuthHubJson<{ rows: Array<{
    id: string;
    kind: string;
    requested_app: string | null;
    requested_platform: string | null;
    status: string;
    supabase_record_id: string | null;
  }> }>("/api/requests");

  return (result.rows ?? []).map((row) => ({
    id: row.id,
    kind: row.kind,
    requestedApp: row.requested_app,
    requestedPlatform: row.requested_platform,
    status: row.status,
    supabaseRecordId: row.supabase_record_id,
  }));
}

export async function getProductsList(): Promise<DesktopProductRecord[]> {
  const rows = await getPowerSyncService().getAll<ProductRow>(
    "SELECT id, name, description, is_stock_tracked, updated_at FROM products ORDER BY name"
  );

  return rows.map(toProductRecord);
}

export async function createProducts(
  inputs: DesktopProductCreateInput[]
): Promise<DesktopProductRecord[]> {
  const payload = inputs
    .map((input) => ({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      is_stock_tracked: input.isStockTracked ?? true,
    }))
    .filter((input) => input.name);

  if (!payload.length) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id, name, description, is_stock_tracked, updated_at");

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();
  return (data ?? []).map((row) => toProductRecord(row as ProductRow));
}

export async function getStockOverview(): Promise<DesktopStockOverview> {
  const powerSync = getPowerSyncService();
  const [batches, products, sellers, suppliers] = await Promise.all([
    powerSync.getAll<StockBatchRow>(
      `SELECT
        sb.id,
        sb.batch_code,
        sb.product_id,
        p.name AS product_name,
        sb.supplier_id,
        COALESCE(supplier.business_name, supplier.name) AS supplier_name,
        sb.mfc_seller_id,
        staff.full_name AS mfc_seller_name,
        sb.initial_weight_kg,
        sb.current_weight_kg,
        sb.cost_per_kg,
        sb.updated_at
      FROM stock_batches sb
      LEFT JOIN products p ON p.id = sb.product_id
      LEFT JOIN users supplier ON supplier.id = sb.supplier_id
      LEFT JOIN mfc_staff staff ON staff.id = sb.mfc_seller_id
      ORDER BY sb.updated_at DESC, COALESCE(sb.batch_code, p.name, 'Stock batch') ASC`
    ),
    getProductsList(),
    powerSync.getAll<StaffRow>(
      "SELECT id, full_name FROM mfc_staff WHERE is_active = 1 AND role = 'mfc_seller' ORDER BY full_name"
    ),
    powerSync.getAll<UserRow>(
      "SELECT id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, updated_at FROM users WHERE is_active = 1 AND default_role = 'seller' ORDER BY COALESCE(business_name, name)"
    ),
  ]);

  return {
    batches: batches.map(
      (row): DesktopStockBatchRecord => ({
        id: row.id,
        batchCode: row.batch_code,
        productId: row.product_id,
        productName: row.product_name,
        supplierId: row.supplier_id,
        supplierName: row.supplier_name,
        mfcSellerId: row.mfc_seller_id,
        mfcSellerName: row.mfc_seller_name,
        initialWeightKg: Number(row.initial_weight_kg),
        currentWeightKg: Number(row.current_weight_kg),
        costPerKg: row.cost_per_kg !== null ? Number(row.cost_per_kg) : null,
        updatedAt: row.updated_at,
      })
    ),
    products,
    sellers: sellers.map(
      (staff): SelectionOption => ({
        value: staff.id,
        label: staff.full_name,
      })
    ),
    suppliers: suppliers.map(toUserRecord),
  };
}

export async function createStockBatches(
  inputs: DesktopStockBatchCreateInput[]
): Promise<{ count: number }> {
  const payload = inputs
    .map((input) => ({
      product_id: input.productId,
      product_name: input.productName?.trim() || null,
      mfc_seller_id: input.mfcSellerId,
      supplier_id: input.supplierId ?? null,
      initial_weight_kg: Number(input.initialWeightKg),
      cost_per_kg:
        input.costPerKg === null || input.costPerKg === undefined || Number.isNaN(Number(input.costPerKg))
          ? null
          : Number(input.costPerKg),
    }))
    .filter(
      (input) =>
        (input.product_id || input.product_name) &&
        input.mfc_seller_id &&
        Number(input.initial_weight_kg) > 0
    );

  if (!payload.length) {
    return { count: 0 };
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("create_stock_batches", {
    p_batches: payload,
  });

  if (error) {
    throw new Error(error.message);
  }

  await refreshReadModel();

  return {
    count: Number((data as { count?: number } | null)?.count ?? payload.length),
  };
}

export function toUserSelectionOption(user: DesktopUserRecord): SelectionOption {
  return {
    value: user.id,
    label: formatUserLabel({
      name: user.name,
      business_name: user.businessName,
    }),
    meta: user.phone,
  };
}
