"use client";

import type { LocalMfcStaff, LocalUser } from "@mfc/database";
import { db } from "@mfc/database";

import { createClient } from "@/lib/supabase/client";
import { cacheMfcStaffInDexie, cacheUsersInDexie } from "@/lib/web-dexie-cache";

const MAX_SUGGESTIONS = 10;
const REMOTE_FILL_THRESHOLD = 4;

function normalizeSearchTerm(term: string): string {
  return term.trim().toLowerCase();
}

function dedupeById<T extends { id: string }>(rows: T[]): T[] {
  const seen = new Map<string, T>();

  for (const row of rows) {
    seen.set(row.id, row);
  }

  return Array.from(seen.values());
}

function scoreMatch(term: string, values: Array<string | null | undefined>): number {
  const normalized = values
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  if (normalized.some((value) => value === term)) {
    return 5;
  }

  if (normalized.some((value) => value.startsWith(term))) {
    return 4;
  }

  if (normalized.some((value) => value.includes(term))) {
    return 3;
  }

  return 0;
}

function sortUsers(rows: LocalUser[], term: string): LocalUser[] {
  return [...rows].sort((left, right) => {
    const rightScore = scoreMatch(term, [right.business_name, right.name, right.phone]);
    const leftScore = scoreMatch(term, [left.business_name, left.name, left.phone]);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return (left.business_name || left.name).localeCompare(right.business_name || right.name);
  });
}

function sortStaff(rows: LocalMfcStaff[], term: string): LocalMfcStaff[] {
  return [...rows].sort((left, right) => {
    const rightScore = scoreMatch(term, [right.full_name]);
    const leftScore = scoreMatch(term, [left.full_name]);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return left.full_name.localeCompare(right.full_name);
  });
}

function filterUsers(rows: LocalUser[], term: string, userType?: string): LocalUser[] {
  return rows.filter((user) => {
    if (!user.is_active) {
      return false;
    }

    if (userType && user.user_type !== userType) {
      return false;
    }

    return scoreMatch(term, [user.business_name, user.name, user.phone]) > 0;
  });
}

async function searchUsersLocally(term: string, userType?: string): Promise<LocalUser[]> {
  const [nameMatches, businessMatches, phoneMatches] = await Promise.all([
    db.users.where("name").startsWithIgnoreCase(term).limit(MAX_SUGGESTIONS).toArray(),
    db.users.where("business_name").startsWithIgnoreCase(term).limit(MAX_SUGGESTIONS).toArray(),
    db.users.where("phone").startsWithIgnoreCase(term).limit(MAX_SUGGESTIONS).toArray(),
  ]);

  return sortUsers(filterUsers(dedupeById([...nameMatches, ...businessMatches, ...phoneMatches]), term, userType), term);
}

async function searchUsersRemotely(term: string, userType?: string): Promise<LocalUser[]> {
  const supabase = createClient();
  let query = supabase
    .from("users")
    .select("id, auth_user_id, name, business_name, phone, user_type, default_role, is_active, address, updated_at")
    .eq("is_active", true)
    .or(`name.ilike.%${term}%,business_name.ilike.%${term}%,phone.ilike.%${term}%`)
    .limit(MAX_SUGGESTIONS);

  if (userType) {
    query = query.eq("user_type", userType);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return sortUsers((data ?? []) as LocalUser[], term);
}

async function searchMfcSellersLocally(term: string): Promise<LocalMfcStaff[]> {
  const staff = await db.mfc_staff
    .where("full_name")
    .startsWithIgnoreCase(term)
    .limit(MAX_SUGGESTIONS)
    .toArray();

  return sortStaff(
    staff.filter((person) => person.is_active && person.role === "mfc_seller"),
    term
  );
}

async function searchMfcSellersRemotely(term: string): Promise<LocalMfcStaff[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("mfc_staff")
    .select("id, full_name, role, is_active, is_default_admin, updated_at")
    .eq("is_active", true)
    .eq("role", "mfc_seller")
    .ilike("full_name", `%${term}%`)
    .limit(MAX_SUGGESTIONS);

  if (error) {
    throw error;
  }

  return sortStaff((data ?? []) as LocalMfcStaff[], term);
}

export async function searchManagerUsers(termInput: string, userType?: string): Promise<LocalUser[]> {
  const term = normalizeSearchTerm(termInput);
  if (!term) {
    return [];
  }

  const localRows = await searchUsersLocally(term, userType);
  if (localRows.length >= REMOTE_FILL_THRESHOLD || typeof navigator !== "undefined" && !navigator.onLine) {
    return localRows.slice(0, MAX_SUGGESTIONS);
  }

  try {
    const remoteRows = await searchUsersRemotely(term, userType);
    await cacheUsersInDexie(remoteRows);
    return sortUsers(dedupeById([...localRows, ...remoteRows]), term).slice(0, MAX_SUGGESTIONS);
  } catch {
    return localRows.slice(0, MAX_SUGGESTIONS);
  }
}

export async function searchManagerMfcSellers(termInput: string): Promise<LocalMfcStaff[]> {
  const term = normalizeSearchTerm(termInput);
  if (!term) {
    return [];
  }

  const localRows = await searchMfcSellersLocally(term);
  if (localRows.length >= REMOTE_FILL_THRESHOLD || typeof navigator !== "undefined" && !navigator.onLine) {
    return localRows.slice(0, MAX_SUGGESTIONS);
  }

  try {
    const remoteRows = await searchMfcSellersRemotely(term);
    await cacheMfcStaffInDexie(remoteRows);
    return sortStaff(dedupeById([...localRows, ...remoteRows]), term).slice(0, MAX_SUGGESTIONS);
  } catch {
    return localRows.slice(0, MAX_SUGGESTIONS);
  }
}
