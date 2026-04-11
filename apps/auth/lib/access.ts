"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import type { AppSlug, AuthContext } from "@/lib/config";

type StaffRow = {
  full_name: string;
  is_active: boolean;
  role: string;
  id: string;
};

type UserRow = {
  auth_user_id: string | null;
  default_role: string;
  id: string;
  is_active: boolean;
  name: string;
  user_type: string;
};

export type AccessDecision =
  | {
      allowed: true;
      label: string;
    }
  | {
      allowed: false;
      reason: string;
    };

function getAppDeniedLabel(app: AppSlug): string {
  switch (app) {
    case "admin":
      return "Admin App";
    case "manager":
      return "Manager App";
    case "user":
      return "User App";
  }
}

function buildStaffDeniedMessage(app: AppSlug, role: string | null): string {
  if (!role) {
    return app === "admin"
      ? "This account does not have admin access."
      : "This account does not have manager access.";
  }

  if (app === "admin") {
    return "This account does not have admin access.";
  }

  return "This account does not have manager access.";
}

async function resolveStaffAccess(app: "admin" | "manager"): Promise<AccessDecision> {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return {
      allowed: false,
      reason: "You need to sign in before we can verify access.",
    };
  }

  const { data, error } = await supabase
    .from("mfc_staff")
    .select("id, full_name, role, is_active")
    .eq("id", session.user.id)
    .maybeSingle<StaffRow>();

  if (error) {
    return {
      allowed: false,
      reason: `Could not verify staff access for the ${getAppDeniedLabel(app)}. Try again.`,
    };
  }

  if (!data?.id) {
    return {
      allowed: false,
      reason: buildStaffDeniedMessage(app, null),
    };
  }

  if (!data.is_active) {
    return {
      allowed: false,
      reason: "This staff account is inactive.",
    };
  }

  if (app === "admin" && data.role !== "admin") {
    return {
      allowed: false,
      reason: "This account does not have admin access.",
    };
  }

  if (app === "manager" && data.role !== "manager") {
    return {
      allowed: false,
      reason: "This account does not have manager access.",
    };
  }

  return {
    allowed: true,
    label: `${data.full_name} (${data.role.replaceAll("_", " ")})`,
  };
}

async function resolveUserAccess(): Promise<AccessDecision> {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return {
      allowed: false,
      reason: "You need to sign in before we can verify access.",
    };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, auth_user_id, name, user_type, default_role, is_active")
    .eq("auth_user_id", session.user.id)
    .maybeSingle<UserRow>();

  if (error) {
    return {
      allowed: false,
      reason: "Could not verify user access. Try again.",
    };
  }

  if (!data?.id) {
    return {
      allowed: false,
      reason: "This account does not have a user profile.",
    };
  }

  if (!data.is_active) {
    return {
      allowed: false,
      reason: "This user account is inactive.",
    };
  }

  if (!data.user_type || !data.default_role) {
    return {
      allowed: false,
      reason: "This user profile is incomplete. Ask an admin to finish setup.",
    };
  }

  return {
    allowed: true,
    label: `${data.name} (${data.user_type}, ${data.default_role})`,
  };
}

export async function verifyAuthHubAccess(context: AuthContext): Promise<AccessDecision> {
  switch (context.app) {
    case "admin":
      return resolveStaffAccess("admin");
    case "manager":
      return resolveStaffAccess("manager");
    case "user":
      return resolveUserAccess();
  }
}
