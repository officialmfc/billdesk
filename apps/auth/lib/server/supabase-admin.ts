import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getAuthHubEnv } from "@/lib/server/cloudflare";

function describeSupabaseAdminEnv(env: Awaited<ReturnType<typeof getAuthHubEnv>>) {
  const supabaseUrl = env.SUPABASE_URL?.trim() || env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  return {
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasSupabaseServiceRoleKey: Boolean(serviceRoleKey),
    hasRuntimeSupabaseUrl: Boolean(env.SUPABASE_URL?.trim()),
    hasPublicSupabaseUrl: Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
  };
}

export async function createSupabaseAdminClient(): Promise<SupabaseClient> {
  const env = await getAuthHubEnv();
  const supabaseUrl =
    env.SUPABASE_URL?.trim() || env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    const details = describeSupabaseAdminEnv(env);
    console.error("[AuthHub] Missing server-side Supabase admin configuration", details);
    throw new Error(
      `Missing server-side Supabase admin configuration: ${JSON.stringify(details)}`,
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
