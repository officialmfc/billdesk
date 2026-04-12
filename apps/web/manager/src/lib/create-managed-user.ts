"use client";

import { cacheUsersInDexie } from "@/lib/web-dexie-cache";
import type { LocalUser } from "@mfc/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ManagedUserType = "vendor" | "business";
export type ManagedDefaultRole = "buyer" | "seller";

export interface CreateManagedUserInput {
  fullName: string;
  businessName?: string;
  phone: string;
  userType: ManagedUserType;
  defaultRole: ManagedDefaultRole;
}

export interface CreateManagedUserInvitationInput {
  businessName?: string;
  defaultRole: ManagedDefaultRole;
  email: string;
  fullName: string;
  existingUserId?: string | null;
  phone?: string;
  requestedPlatform?: "web" | "desktop" | "mobile";
  userType: ManagedUserType;
}

export interface ManagedUserInvitationResult {
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
}

function authHubBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "https://auth.mondalfishcenter.com"
  );
}

async function getAuthHubToken(supabase: SupabaseClient): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token?.trim();
  if (!token) {
    throw new Error("Please sign in again.");
  }

  return token;
}

async function postAuthHubJson<T>(
  supabase: SupabaseClient,
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const token = await getAuthHubToken(supabase);
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

export async function createManagedUser(
  supabase: SupabaseClient,
  input: CreateManagedUserInput
): Promise<LocalUser> {
  const { data: result, error } = await supabase.rpc("create_user_as_staff", {
    p_email: null,
    p_password: null,
    p_full_name: input.fullName,
    p_business_name: input.businessName || "",
    p_phone: input.phone,
    p_user_type: input.userType,
    p_default_role: input.defaultRole,
    p_address: {},
    p_profile_photo_url: null,
  });

  if (error) {
    throw error;
  }

  let createdUser: LocalUser = {
    id: result as string,
    auth_user_id: null,
    name: input.fullName,
    business_name: input.businessName || null,
    phone: input.phone,
    user_type: input.userType,
    default_role: input.defaultRole,
    is_active: true,
    address: {},
    updated_at: new Date().toISOString(),
  };

  const { data: createdRow, error: fetchError } = await supabase
    .from("users")
    .select("id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, address, updated_at")
    .eq("id", result as string)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (createdRow) {
    createdUser = createdRow as LocalUser;
  }

  await cacheUsersInDexie([createdUser]);
  return createdUser;
}

export async function createManagedUserInvitation(
  supabase: SupabaseClient,
  input: CreateManagedUserInvitationInput
): Promise<ManagedUserInvitationResult> {
  const result = await postAuthHubJson<ManagedUserInvitationResult>(supabase, "/api/invites/user", {
    email: input.email.trim(),
    fullName: input.fullName.trim(),
    businessName: input.businessName?.trim() || null,
    existingUserId: input.existingUserId?.trim() || null,
    phone: input.phone?.trim() || null,
    userType: input.userType,
    defaultRole: input.defaultRole,
    requestedPlatform: input.requestedPlatform ?? "mobile",
  });

  return result;
}
