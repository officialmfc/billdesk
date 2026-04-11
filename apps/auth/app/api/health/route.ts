import { NextResponse } from "next/server";
import { getAuthHubEnv } from "@/lib/server/cloudflare";
import { ensureDeviceLeaseSchema } from "@/lib/server/device-leases";
import { ensureControlPlaneSchema } from "@/lib/server/auth-control-plane";

function inferActiveEnvironment(
  env: Awaited<ReturnType<typeof getAuthHubEnv>>,
): string {
  if (env.AUTH_ENVIRONMENT?.trim()) {
    return env.AUTH_ENVIRONMENT.trim();
  }

  if (env.CF_PAGES?.trim() === "1") {
    const branch = env.CF_PAGES_BRANCH?.trim();
    if (branch) {
      return `pages:${branch}`;
    }

    return "pages";
  }

  if (env.CF_PAGES_URL?.trim()) {
    return `workers:${env.CF_PAGES_URL.trim()}`;
  }

  return "workers";
}

export async function GET() {
  const env = await getAuthHubEnv();
  await ensureControlPlaneSchema();
  await ensureDeviceLeaseSchema();

  const databaseReady = Boolean(env.auth_d1_binding);
  const hasSupabaseUrl = Boolean(
    env.SUPABASE_URL?.trim() || env.NEXT_PUBLIC_SUPABASE_URL?.trim(),
  );
  const hasSupabaseServiceRoleKey = Boolean(env.SUPABASE_SERVICE_ROLE_KEY?.trim());
  const missingKeys = [
    !databaseReady ? "auth_d1_binding" : null,
    !hasSupabaseUrl ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL" : null,
    !hasSupabaseServiceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
  ].filter(Boolean);
  const requiredD1Tables = [
    "registration_requests",
    "auth_handoffs",
    "auth_device_leases",
    "auth_account_directory",
    "auth_audit_events",
  ] as const;
  const tableChecks = await Promise.all(
    requiredD1Tables.map(async (tableName) => {
      const row = await env.auth_d1_binding
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name = ?
            LIMIT 1
          `
        )
        .bind(tableName)
        .first<{ name: string }>();

      return { tableName, found: Boolean(row?.name) };
    })
  );
  const presentD1Tables = tableChecks
    .filter((check) => check.found)
    .map((check) => check.tableName);
  const missingD1Tables = requiredD1Tables.filter((table) => !presentD1Tables.includes(table));

  return NextResponse.json({
    ok: true,
    service: "auth-hub",
    activeEnvironment: inferActiveEnvironment(env),
    databaseReady,
    d1SchemaReady: missingD1Tables.length === 0,
    presentD1Tables: Array.from(presentD1Tables),
    missingD1Tables,
    supabaseAdminReady: hasSupabaseUrl && hasSupabaseServiceRoleKey,
    hasSupabaseUrl,
    hasSupabaseServiceRoleKey,
    missingKeys,
  });
}
