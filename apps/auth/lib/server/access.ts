import type { AppSlug } from "@/lib/config";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import {
  deriveAuthDirectoryAccessContext,
  getAuthAccountDirectoryRowsByAuthUserId,
} from "@/lib/server/auth-control-plane";

export type AuthServerAccessContext = {
  has_user_profile: boolean;
  is_admin: boolean;
  is_manager: boolean;
  staff_id: string | null;
  user_id: string | null;
};

export async function getAuthServerAccessContext(
  authUserId: string
): Promise<AuthServerAccessContext> {
  const directoryRows = await getAuthAccountDirectoryRowsByAuthUserId(authUserId).catch(
    () => []
  );

  if (directoryRows.length > 0) {
    const derived = deriveAuthDirectoryAccessContext(directoryRows);
    if (derived.has_user_profile || derived.is_admin || derived.is_manager) {
      return derived;
    }
  }

  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("get_access_context", {
    p_auth_user_id: authUserId,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    has_user_profile: Boolean(row?.has_user_profile),
    is_admin: Boolean(row?.is_admin),
    is_manager: Boolean(row?.is_manager),
    staff_id: row?.staff_id ?? null,
    user_id: row?.user_id ?? null,
  };
}

export function canAccessRequestedApp(
  access: AuthServerAccessContext,
  app: AppSlug
): boolean {
  switch (app) {
    case "admin":
      return access.is_admin;
    case "manager":
      return access.is_manager;
    case "user":
      return access.has_user_profile;
  }
}
