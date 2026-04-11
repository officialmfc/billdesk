type D1PreparedStatementLike = {
  all: <T = unknown>() => Promise<{ results: T[] }>;
  run: () => Promise<unknown>;
  bind: (...values: unknown[]) => {
    all: <T = unknown>() => Promise<{ results: T[] }>;
    first: <T = unknown>() => Promise<T | null>;
    run: () => Promise<unknown>;
  };
};

type KVNamespaceLike = {
  get: (key: string, options?: { type?: "json" | "text" }) => Promise<unknown>;
  list?: (options?: {
    cursor?: string;
    limit?: number;
    prefix?: string;
  }) => Promise<{
    cursor?: string;
    keys?: Array<{
      name: string;
    }>;
    list_complete?: boolean;
  }>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  delete?: (key: string) => Promise<void>;
};

export type D1DatabaseLike = {
  prepare: (query: string) => D1PreparedStatementLike;
};

export type AuthHubCloudflareEnv = {
  auth_d1_binding: D1DatabaseLike;
  auth_rate_limit_kv?: KVNamespaceLike;
  AUTH_CORE?: {
    fetch: (request: Request) => Promise<Response>;
  };
  AUTH_POLICY?: {
    fetch: (request: Request) => Promise<Response>;
  };
  AUTH_ENVIRONMENT?: string;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  NEXT_PUBLIC_AUTH_BASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  SUPABASE_SEND_EMAIL_HOOK_SECRET?: string;
  SEND_EMAIL_HOOK_SECRET?: string;
  AUTH_RATE_LIMIT_KV?: KVNamespaceLike;
  SENTRY_DSN?: string;
  ZEPTOMAIL_API_KEY?: string;
  ZEPTOMAIL_API_URL?: string;
  ZEPTOMAIL_FROM_EMAIL?: string;
  ZEPTOMAIL_FROM_NAME?: string;
  CF_PAGES?: string;
  CF_PAGES_BRANCH?: string;
  CF_PAGES_COMMIT_SHA?: string;
  CF_PAGES_URL?: string;
  NODE_ENV?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __AUTH_HUB_ENV__: AuthHubCloudflareEnv | undefined;
}

export function setAuthHubEnv(env: AuthHubCloudflareEnv): void {
  globalThis.__AUTH_HUB_ENV__ = env;
}

export async function getAuthHubEnv(): Promise<AuthHubCloudflareEnv> {
  const env = globalThis.__AUTH_HUB_ENV__;
  if (!env) {
    throw new Error("Auth hub runtime environment is not available.");
  }

  return env;
}
