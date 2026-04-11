import type { AuthHubCloudflareEnv } from "@/lib/server/cloudflare";

const ACCESS_EMAIL_HEADERS = [
  "cf-access-authenticated-user-email",
  "x-auth-request-email",
  "cf-connecting-email",
] as const;

function normalizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim().toLowerCase();
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

export function getCloudflareAccessEmail(request: Request): string | null {
  for (const headerName of ACCESS_EMAIL_HEADERS) {
    const email = normalizeEmail(request.headers.get(headerName));
    if (email) {
      return email;
    }
  }

  return null;
}

export function canUseCloudflareAccessAdmin(
  request: Request,
  env?: Pick<AuthHubCloudflareEnv, "NODE_ENV">
): boolean {
  const nodeEnv = env?.NODE_ENV?.trim().toLowerCase() || "production";
  const host = new URL(request.url).hostname.toLowerCase();
  const isLocalHost = host === "localhost" || host === "127.0.0.1" || host === "::1";

  if (nodeEnv !== "production" || isLocalHost) {
    return true;
  }

  return Boolean(getCloudflareAccessEmail(request));
}
