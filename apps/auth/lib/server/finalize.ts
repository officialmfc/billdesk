import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { policyUpsertAuthAccountDirectory } from "@/lib/server/policy-client";

export async function finalizeManagerRegistration(params: {
  actorStaffId?: string | null;
  authUserId: string;
  email: string;
  fullName: string;
  payload?: Record<string, unknown>;
}): Promise<string> {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("finalize_manager_registration", {
    p_actor_staff_id: params.actorStaffId ?? null,
    p_auth_user_id: params.authUserId,
    p_email: params.email,
    p_full_name: params.fullName,
    p_payload: params.payload ?? {},
  });

  if (error) {
    throw error;
  }

  await policyUpsertAuthAccountDirectory({
    app: "manager",
    authUserId: params.authUserId,
    email: params.email,
    fullName: params.fullName,
    role: "manager",
    source: "finalize_manager_registration",
    status: "active",
    metadata: params.payload ?? {},
    platform: null,
  });

  return String(data);
}

export async function finalizeUserRegistration(params: {
  actorStaffId?: string | null;
  authUserId: string;
  email: string;
  fullName: string;
  payload?: Record<string, unknown>;
}): Promise<string> {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("finalize_user_registration", {
    p_actor_staff_id: params.actorStaffId ?? null,
    p_auth_user_id: params.authUserId,
    p_email: params.email,
    p_full_name: params.fullName,
    p_payload: params.payload ?? {},
  });

  if (error) {
    throw error;
  }

  await policyUpsertAuthAccountDirectory({
    app: "user",
    authUserId: params.authUserId,
    email: params.email,
    fullName: params.fullName,
    role: String((params.payload?.requested_default_role as string | undefined) || "user"),
    source: "finalize_user_registration",
    status: "active",
    metadata: params.payload ?? {},
    platform: null,
  });

  return String(data);
}
