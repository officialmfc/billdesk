import type { AuthHubCloudflareEnv } from "./cloudflare";
import { canUseCloudflareAccessAdmin, getCloudflareAccessEmail } from "./cloudflare-access";

const ADMIN_SESSION_COOKIE_NAME = "mfc_auth_admin_session";
const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;

type AdminAuthMode = "access" | "password" | "dev" | null;

export type AdminSessionState = {
  accessEmail: string | null;
  authenticated: boolean;
  mode: AdminAuthMode;
  passwordConfigured: boolean;
};

function normalizeSecret(value: string | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseCookies(request: Request): Map<string, string> {
  const cookieHeader = request.headers.get("cookie");
  const cookies = new Map<string, string>();
  if (!cookieHeader) {
    return cookies;
  }

  for (const segment of cookieHeader.split(";")) {
    const [name, ...rest] = segment.split("=");
    const cookieName = name?.trim();
    if (!cookieName) {
      continue;
    }

    cookies.set(cookieName, rest.join("=").trim());
  }

  return cookies;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function hmacSignature(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createSessionToken(secret: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const nonce = crypto.randomUUID();
  const payload = `${expiresAt}.${nonce}`;
  const signature = await hmacSignature(secret, payload);
  return `${payload}.${signature}`;
}

async function verifySessionToken(secret: string, token: string): Promise<boolean> {
  const [expiresAtRaw, nonce, signature] = token.split(".");
  const expiresAt = Number.parseInt(expiresAtRaw ?? "", 10);

  if (!expiresAt || !nonce || !signature) {
    return false;
  }

  if (Math.floor(Date.now() / 1000) > expiresAt) {
    return false;
  }

  const expectedSignature = await hmacSignature(secret, `${expiresAt}.${nonce}`);
  return expectedSignature === signature;
}

export function getAdminPassword(env: Pick<AuthHubCloudflareEnv, "AUTH_ADMIN_PASSWORD">): string | null {
  return normalizeSecret(env.AUTH_ADMIN_PASSWORD);
}

export async function readAdminSessionState(
  request: Request,
  env: Pick<AuthHubCloudflareEnv, "AUTH_ADMIN_PASSWORD" | "NODE_ENV">
): Promise<AdminSessionState> {
  const accessEmail = getCloudflareAccessEmail(request);
  const password = getAdminPassword(env);
  const passwordConfigured = Boolean(password);

  if (accessEmail) {
    return {
      accessEmail,
      authenticated: true,
      mode: "access",
      passwordConfigured,
    };
  }

  if (canUseCloudflareAccessAdmin(request, env)) {
    return {
      accessEmail: null,
      authenticated: true,
      mode: "dev",
      passwordConfigured,
    };
  }

  if (!password) {
    return {
      accessEmail: null,
      authenticated: false,
      mode: null,
      passwordConfigured: false,
    };
  }

  const cookies = parseCookies(request);
  const token = cookies.get(ADMIN_SESSION_COOKIE_NAME) || "";
  if (token && (await verifySessionToken(password, token))) {
    return {
      accessEmail: null,
      authenticated: true,
      mode: "password",
      passwordConfigured,
    };
  }

  return {
    accessEmail: null,
    authenticated: false,
    mode: null,
    passwordConfigured,
  };
}

export async function createAdminSessionCookie(
  env: Pick<AuthHubCloudflareEnv, "AUTH_ADMIN_PASSWORD">,
  request: Request
): Promise<string | null> {
  const password = getAdminPassword(env);
  if (!password) {
    return null;
  }

  const token = await createSessionToken(password);
  const isSecure = new URL(request.url).protocol === "https:";
  const cookieParts = [
    `${ADMIN_SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${ADMIN_SESSION_TTL_SECONDS}`,
  ];

  if (isSecure) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

export function clearAdminSessionCookie(request: Request): string {
  const isSecure = new URL(request.url).protocol === "https:";
  const cookieParts = [
    `${ADMIN_SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  if (isSecure) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

export async function isAdminRequestAuthorized(
  request: Request,
  env: Pick<AuthHubCloudflareEnv, "AUTH_ADMIN_PASSWORD" | "NODE_ENV">
): Promise<boolean> {
  const state = await readAdminSessionState(request, env);
  return state.authenticated;
}
