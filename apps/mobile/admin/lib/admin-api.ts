import { supabase } from "@/lib/supabase";

export type AdminInsightSnapshot = {
  selected_date: string;
  total_sales: number;
  total_collection: number;
  total_spend: number;
  total_chalans: number;
  total_payable: number;
  total_bills: number;
};

export type AdminManagerBreakdownRow = {
  manager_id: string | null;
  manager_name: string;
  sales_total: number;
  collection_total: number;
  spend_total: number;
  chalan_count: number;
  bill_count: number;
  payable_total: number;
};

export type ManagerInvitationResult = {
  invite_token: string;
  registration_id: string;
  requested_app: string;
  requested_platform: string;
  signup_path: string;
  signupPath?: string;
};

function authHubBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

async function getAuthHubToken(): Promise<string> {
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

function ensureNumber(value: unknown): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

export function getCurrentDateIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function getAdminInsightSnapshot(dateStr: string): Promise<AdminInsightSnapshot> {
  const { data, error } = await supabase.rpc("get_admin_insight_snapshot", {
    p_date: dateStr,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  return {
    selected_date: row?.selected_date ?? dateStr,
    total_sales: ensureNumber(row?.total_sales),
    total_collection: ensureNumber(row?.total_collection),
    total_spend: ensureNumber(row?.total_spend),
    total_chalans: ensureNumber(row?.total_chalans),
    total_payable: ensureNumber(row?.total_payable),
    total_bills: ensureNumber(row?.total_bills),
  };
}

export async function getAdminManagerBreakdown(
  dateStr: string
): Promise<AdminManagerBreakdownRow[]> {
  const { data, error } = await supabase.rpc("get_admin_manager_breakdown", {
    p_date: dateStr,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    manager_id: (row.manager_id as string | null | undefined) ?? null,
    manager_name: (row.manager_name as string | undefined) ?? "Unknown",
    sales_total: ensureNumber(row.sales_total),
    collection_total: ensureNumber(row.collection_total),
    spend_total: ensureNumber(row.spend_total),
    chalan_count: ensureNumber(row.chalan_count),
    bill_count: ensureNumber(row.bill_count),
    payable_total: ensureNumber(row.payable_total),
  }));
}

export async function getAdminRecentDays(days = 7): Promise<AdminInsightSnapshot[]> {
  const { data, error } = await supabase.rpc("get_admin_recent_days", {
    p_days: days,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    selected_date: (row.snapshot_date as string | undefined) ?? getCurrentDateIST(),
    total_sales: ensureNumber(row.total_sales),
    total_collection: ensureNumber(row.total_collection),
    total_spend: ensureNumber(row.total_spend),
    total_chalans: ensureNumber(row.total_chalans),
    total_payable: ensureNumber(row.total_payable),
    total_bills: ensureNumber(row.total_bills),
  }));
}

export async function createManagerInvitation(
  email: string,
  fullName: string,
  requestedPlatform: "web" | "desktop" | "mobile" = "desktop"
): Promise<ManagerInvitationResult> {
  const result = await postAuthHubJson<ManagerInvitationResult>("/api/invites/manager", {
    email,
    fullName,
    requestedPlatform,
  });

  return result;
}
