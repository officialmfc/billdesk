import {
  allowSelfSignup,
  buildInternalHref,
  getContextLabel,
  getRequiredAccountLabel,
  readContext,
  type AppSlug,
  type AuthContext,
} from "@/lib/config";
import { buildHandoffHref } from "@/lib/handoff";
import { createAuthHandoff, exchangeAuthHandoff } from "@/lib/server/handoff";
import { captureAuthHubError } from "@/lib/server/logger";
import { CORS_HEADERS, withCorsHeaders } from "@/lib/server/cors";
import {
  approveSelfRegistration,
  assertAccessForApp,
  assertInvitePermission,
  createManagerInvite,
  createUserInvite,
  listPendingRegistrations,
  rejectRegistration,
  resolveActorFromBearer,
  getInviteContextByToken,
  registerInviteAccount,
} from "@/lib/server/registration-workflow";
import {
  claimDeviceLease,
  listActiveDeviceLeases,
  revokeAllDeviceLeases,
  revokeDeviceLease,
  touchDeviceLease,
} from "@/lib/server/device-leases";
import { setAuthHubEnv, type AuthHubCloudflareEnv } from "@/lib/server/cloudflare";
import { submitSelfRegistration } from "@/lib/server/self-registration";
import { getZeptoMailErrorDetails } from "@/lib/server/email";
import {
  ensureDeviceLeaseSchema,
} from "@/lib/server/device-leases";
import {
  ensureControlPlaneSchema,
  getAuthAccountDirectoryRowsByEmail,
  getAuthAccountDirectoryRowsByAuthUserId,
  listAuthRateLimitEntries,
  resetAuthRateLimitEntries,
} from "@/lib/server/auth-control-plane";
import { ensureAuthFlowSchema, resolveAuthFlowInput } from "@/lib/server/flows";
import {
  canUseCloudflareAccessAdmin,
  getCloudflareAccessEmail,
} from "@/lib/server/cloudflare-access";
import {
  policyPreflightAuthGate,
  policySendSupabaseAuthEmail,
} from "@/lib/server/policy-client";
import { routeAuthPage as routeSharedAuthPage } from "@/lib/ui-pages";

type PageName =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "confirm"
  | "callback"
  | "handoff"
  | "account"
  | "unauthorized";

type WorkerEnv = AuthHubCloudflareEnv;

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...withCorsHeaders(JSON_HEADERS),
      ...headers,
    },
  });
}

function html(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

function textResponse(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function isAdminApiPath(pathname: string): boolean {
  return pathname === "/admin/api" || pathname.startsWith("/admin/api/");
}

function normalizeAdminLookupApp(app: string | null | undefined): AppSlug | null {
  const normalized = app?.trim() || "";
  if (normalized === "manager" || normalized === "admin" || normalized === "user") {
    return normalized;
  }

  return null;
}

async function requireAdminAccess(request: Request, env: WorkerEnv): Promise<string | null> {
  if (!canUseCloudflareAccessAdmin(request, env)) {
    throw new Error("Cloudflare Access authentication is required.");
  }

  return getCloudflareAccessEmail(request);
}

function uniqueAccountValues(
  accounts: Array<{
    email: string;
    last_login_device_id: string | null;
    last_login_ip: string | null;
  }>,
  devices: Array<{ device_id: string }>
): string[] {
  const values = new Set<string>();

  for (const account of accounts) {
    if (account.email.trim()) {
      values.add(account.email.trim().toLowerCase());
    }

    if (typeof account.last_login_device_id === "string" && account.last_login_device_id.trim()) {
      values.add(account.last_login_device_id.trim().toLowerCase());
    }

    if (typeof account.last_login_ip === "string" && account.last_login_ip.trim()) {
      values.add(account.last_login_ip.trim().toLowerCase());
    }
  }

  for (const device of devices) {
    if (device.device_id.trim()) {
      values.add(device.device_id.trim().toLowerCase());
    }
  }

  return [...values];
}

async function loadAdminAccountState(params: {
  app?: AppSlug | null;
  email: string;
}): Promise<{
  accounts: Awaited<ReturnType<typeof getAuthAccountDirectoryRowsByEmail>>;
  devices: Awaited<ReturnType<typeof listActiveDeviceLeases>>;
  rateLimits: Awaited<ReturnType<typeof listAuthRateLimitEntries>>;
  relatedValues: string[];
}> {
  const accounts = await getAuthAccountDirectoryRowsByEmail({
    app: params.app ?? null,
    email: params.email,
  });
  const authUserIds = [
    ...new Set(
      accounts
        .map((account) => account.auth_user_id)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    ),
  ];
  const devices = (
    await Promise.all(authUserIds.map(async (authUserId) => await listActiveDeviceLeases(authUserId)))
  ).flat();
  const relatedValues = uniqueAccountValues(
    accounts.map((account) => ({
      email: account.email,
      last_login_device_id: account.last_login_device_id,
      last_login_ip: account.last_login_ip,
    })),
    devices
  );
  const rateLimits = await listAuthRateLimitEntries({
    values: relatedValues,
  });

  return {
    accounts,
    devices,
    rateLimits,
    relatedValues,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPublicConfig(env: WorkerEnv, page: PageName, context: AuthContext | null, extras: Record<string, unknown> = {}) {
  const supabaseUrl =
    env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    env.SUPABASE_URL?.trim() ||
    "";
  const supabaseAnonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    env.SUPABASE_ANON_KEY?.trim() ||
    "";
  const turnstileSiteKey =
    env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    env.TURNSTILE_SITE_KEY?.trim() ||
    "";
  return {
    page,
    context,
    authBaseUrl:
      env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
      "https://auth.mondalfishcenter.com",
    logoUrl: "/logo/mfclogo.svg",
    supabaseAnonKey,
    supabaseUrl,
    turnstileSiteKey,
    ...extras,
  };
}

function pageShell(params: {
  body: string;
  context: AuthContext | null;
  env: WorkerEnv;
  page: PageName;
  subtitle?: string;
  title: string;
  extras?: Record<string, unknown>;
}): string {
  const publicConfig = JSON.stringify(getPublicConfig(params.env, params.page, params.context, params.extras));
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(params.title)}</title>
    <link rel="icon" href="/icons/favicon.ico" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #eef3ff 0%, #f8fafc 100%);
        color: #0f172a;
      }
      .page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .card {
        width: min(100%, 460px);
        background: rgba(255,255,255,0.96);
        border: 1px solid rgba(148,163,184,0.18);
        border-radius: 28px;
        box-shadow: 0 20px 80px rgba(15, 23, 42, 0.08);
        padding: 28px;
      }
      .brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        margin-bottom: 22px;
        text-align: center;
      }
      .brand img { width: 92px; height: 92px; object-fit: contain; }
      .title { margin: 0; font-size: 30px; line-height: 1.1; letter-spacing: -0.03em; }
      .subtitle { margin: 0; color: #475569; line-height: 1.6; }
      .field { display: grid; gap: 8px; margin-bottom: 14px; }
      .field label { font-size: 14px; font-weight: 600; color: #334155; }
      .field input, .field textarea, .field select, .field button:not(.password-toggle) {
        width: 100%;
        box-sizing: border-box;
        border-radius: 16px;
        border: 1px solid #dbe2ee;
        background: #fff;
        padding: 14px 16px;
        font: inherit;
        outline: none;
      }
      .field textarea { resize: vertical; min-height: 120px; }
      .password-field {
        position: relative;
        display: block;
      }
      .password-toggle {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: auto;
        min-width: 68px;
        max-width: 96px;
        border: 0;
        border-radius: 10px;
        background: #eef2ff;
        color: #1d4ed8;
        padding: 8px 12px;
        font: inherit;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }
      .password-field input {
        padding-right: 92px;
      }
      .device-list {
        display: grid;
        gap: 12px;
        margin-top: 18px;
      }
      .device-card {
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 16px;
        background: #f8fafc;
      }
      .device-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: flex-start;
      }
      .device-row strong {
        display: block;
        margin-bottom: 4px;
      }
      .device-row small {
        color: #64748b;
        display: block;
        line-height: 1.5;
      }
      .device-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 14px;
      }
      .button.link {
        color: #1d4ed8;
        background: #fff;
        border: 1px solid #cbd5e1;
      }
      .button.danger {
        color: #b91c1c;
        background: #fef2f2;
        border: 1px solid #fecaca;
      }
      .row { display: flex; gap: 12px; }
      .row > * { flex: 1; }
      .actions { display: grid; gap: 12px; margin-top: 18px; }
      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        border: 0;
        border-radius: 16px;
        padding: 14px 16px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        color: #fff;
        background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
      }
      .button.secondary {
        color: #0f172a;
        background: #fff;
        border: 1px solid #dbe2ee;
      }
      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        margin-top: 16px;
        font-size: 14px;
      }
      .links a { color: #2563eb; text-decoration: none; font-weight: 600; }
      .status {
        margin-top: 16px;
        padding: 12px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.5;
        background: #eff6ff;
        color: #1d4ed8;
      }
      .status[data-tone="error"] { background: #fef2f2; color: #b91c1c; }
      .status[data-tone="success"] { background: #ecfdf5; color: #047857; }
      .status[hidden] { display: none; }
      .muted { color: #64748b; font-size: 14px; line-height: 1.6; }
      .divider {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: 12px;
        align-items: center;
        color: #94a3b8;
        margin: 18px 0;
        font-size: 14px;
      }
      .divider::before, .divider::after { content: ""; height: 1px; background: #e2e8f0; }
      .loader {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 4px solid #dbeafe;
        border-top-color: #2563eb;
        margin: 16px auto 0;
        animation: spin 0.9s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .hidden { display: none !important; }
      .small { font-size: 13px; color: #64748b; line-height: 1.5; }
      .pill {
        display: inline-flex;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 13px;
        font-weight: 700;
      }
      .top-note {
        margin-bottom: 14px;
        color: #334155;
      }
    </style>
  </head>
  <body data-page="${escapeHtml(params.page)}">
    <main class="page">
      <section class="card">
        <div class="brand">
          <img src="/logo/mfclogo.svg" alt="MFC" />
          <div>
            <h1 class="title">${escapeHtml(params.title)}</h1>
            ${params.subtitle ? `<p class="subtitle">${escapeHtml(params.subtitle)}</p>` : ""}
          </div>
        </div>
        ${params.body}
        <div class="status" data-status hidden></div>
        <script>
          window.__AUTH_HUB__ = ${publicConfig};
        </script>
        <script type="module" src="/auth-client.js"></script>
      </section>
    </main>
  </body>
</html>`;
}

function buildContextFromUrl(url: URL): AuthContext | null {
  const context = readContext(url.searchParams);
  return context;
}

function getDeviceConfigFromUrl(url: URL): { deviceId?: string; deviceLabel?: string } {
  const deviceId = url.searchParams.get("device_id")?.trim() || "";
  const deviceLabel = url.searchParams.get("device_label")?.trim() || "";

  return {
    deviceId: deviceId || undefined,
    deviceLabel: deviceLabel || undefined,
  };
}

function renderAccessDenied(env: WorkerEnv, context: AuthContext | null, reason = "Access denied.") {
  return html(
    pageShell({
      env,
      page: "unauthorized",
      context,
      title: "Access denied",
      subtitle: reason,
      body: `
        <p class="top-note">This access request cannot continue.</p>
        <div class="actions">
          <a class="button" href="${context ? buildInternalHref("/login", context) : "/login?app=manager&platform=web"}">Back to login</a>
        </div>
      `,
    }),
    403
  );
}

function renderLoginPage(
  env: WorkerEnv,
  context: AuthContext,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "login",
      context,
      extras,
      title: `Log in to ${getContextLabel(context)}`,
      subtitle: `Sign in with your ${getRequiredAccountLabel(context).toLowerCase()}.`,
      body: `
        <form id="login-form">
          <div class="field">
            <label for="login-email">Email</label>
            <input id="login-email" name="email" type="email" autocomplete="email" required />
          </div>
          <div class="field">
            <label for="login-password">Password</label>
            <div class="password-field">
              <input id="login-password" name="password" type="password" autocomplete="current-password" required />
              <button class="password-toggle" type="button" data-password-toggle="login-password" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
          <div id="turnstile-widget"></div>
          <input type="hidden" data-turnstile-token value="" />
          <div class="actions">
            <button class="button" type="submit">Log in</button>
            <button class="button secondary" id="request-magic-link" type="button">Request magic link</button>
            <button class="button secondary" id="google-login" type="button">Continue with Google</button>
          </div>
        </form>
        <div class="divider"><span>or</span></div>
        <div class="links">
          <a href="${buildInternalHref("/forgot-password", context)}">Forgot password?</a>
          ${allowSelfSignup(context) ? `<a href="${buildInternalHref("/signup", context)}">Create account</a>` : `<a href="${buildInternalHref("/unauthorized", context)}">Invite only</a>`}
        </div>
      `,
    })
  );
}

function renderSignupPage(
  env: WorkerEnv,
  context: AuthContext,
  inviteToken: string | null,
  extras: { deviceId?: string; deviceLabel?: string } = {}
) {
  const inviteMode = Boolean(inviteToken);
  return html(
    pageShell({
      env,
      page: "signup",
      context,
      extras: { inviteToken: inviteToken || "", ...extras },
      title: inviteMode ? `Set up your ${getContextLabel(context)} access` : `Request ${getContextLabel(context)} access`,
      subtitle: inviteMode
        ? "Verify your email and create a password to continue."
        : "Send your registration for review. You will set a password after approval.",
      body: `
        <form id="signup-form">
          <div class="field">
            <label for="signup-name">Full name</label>
            <input id="signup-name" name="name" type="text" autocomplete="name" required />
          </div>
          <div class="field">
            <label for="signup-email">Email</label>
            <input id="signup-email" name="email" type="email" autocomplete="email" required ${inviteMode ? "readonly" : ""} />
          </div>
          <div id="invite-fields" class="${inviteMode ? "" : "hidden"}">
          <div class="field">
            <label for="signup-password">Password</label>
            <div class="password-field">
              <input id="signup-password" name="password" type="password" autocomplete="new-password" ${inviteMode ? "required" : ""} />
              <button class="password-toggle" type="button" data-password-toggle="signup-password" aria-label="Show password" aria-pressed="false">Show</button>
              </div>
            </div>
          </div>
          <div id="self-signup-fields" class="${inviteMode ? "hidden" : ""}">
            <div class="row">
              <div class="field">
                <label for="signup-phone">Phone</label>
                <input id="signup-phone" name="phone" type="tel" autocomplete="tel" />
              </div>
              <div class="field">
                <label for="signup-business">Business name</label>
                <input id="signup-business" name="businessName" type="text" autocomplete="organization" />
              </div>
            </div>
            <div class="field">
              <label for="signup-message">Message</label>
              <textarea id="signup-message" name="message" rows="4"></textarea>
            </div>
          </div>
          ${inviteMode ? "" : `<div id="turnstile-widget"></div><input type="hidden" data-turnstile-token value="" />`}
          <div class="actions">
            <button class="button" type="submit">${inviteMode ? "Create account" : "Submit request"}</button>
          </div>
        </form>
        <p id="invite-status" class="small"></p>
        <div class="links">
          <a href="${buildInternalHref("/login", context)}">Back to login</a>
        </div>
      `,
    })
  );
}

function renderForgotPasswordPage(
  env: WorkerEnv,
  context: AuthContext,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "forgot-password",
      context,
      extras,
      title: "Reset password",
      subtitle: "We will send a reset link to your email.",
      body: `
        <form id="forgot-form">
          <div class="field">
            <label for="forgot-email">Email</label>
            <input id="forgot-email" name="email" type="email" autocomplete="email" required />
          </div>
          <div id="turnstile-widget"></div>
          <input type="hidden" data-turnstile-token value="" />
          <div class="actions">
            <button class="button" type="submit">Send reset link</button>
          </div>
        </form>
        <div class="links">
          <a href="${buildInternalHref("/login", context)}">Back to login</a>
        </div>
      `,
    })
  );
}

function renderResetPasswordPage(
  env: WorkerEnv,
  context: AuthContext,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "reset-password",
      context,
      extras,
      title: "Set new password",
      subtitle: "Confirm the reset link and choose a new password.",
      body: `
        <form id="reset-form">
          <div class="field">
            <label for="reset-password">New password</label>
            <div class="password-field">
              <input id="reset-password" name="password" type="password" autocomplete="new-password" required />
              <button class="password-toggle" type="button" data-password-toggle="reset-password" aria-label="Show password" aria-pressed="false">Show</button>
            </div>
          </div>
          <div id="turnstile-widget"></div>
          <input type="hidden" data-turnstile-token value="" />
          <div class="actions">
            <button class="button" type="button" data-open-handoff>Update password</button>
          </div>
        </form>
        <div class="links">
          <a href="${buildInternalHref("/login", context)}">Back to login</a>
        </div>
      `,
    })
  );
}

function renderSimpleStatusPage(
  env: WorkerEnv,
  context: AuthContext,
  page: PageName,
  title: string,
  subtitle: string,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page,
      context,
      extras,
      title,
      subtitle,
      body: `<div class="loader"></div><p class="small" style="text-align:center;margin-top:14px;">Please wait while your session is prepared.</p>`,
    })
  );
}

function renderAccountPage(env: WorkerEnv, context: AuthContext | null): Response {
  return html(
    pageShell({
      env,
      page: "account",
      context,
      title: "Account center",
      subtitle: context
        ? `Review your current session and active devices for ${getContextLabel(context)}.`
        : "Review your current session, active devices, and security settings.",
      body: `
        <form id="account-form">
          <div class="top-note">Signed-in sessions and active devices for this account.</div>
          <div class="device-card">
            <div class="device-row">
              <div>
                <strong data-account-email>Loading account...</strong>
                <small data-account-session>Status: checking session</small>
                <small data-account-role>Role: checking account</small>
                <small data-account-status>Account: checking</small>
              </div>
            </div>
          </div>
          <div class="device-list" data-device-list></div>
          <div class="actions">
            <button class="button" type="button" data-account-refresh>Refresh devices</button>
            <button class="button secondary" type="button" data-account-password-reset>Change password</button>
            <button class="button secondary" type="button" data-account-logout-all>Logout all devices</button>
            <button class="button danger" type="button" data-account-logout>Logout</button>
          </div>
        </form>
      `,
    })
  );
}

function renderUnauthorizedPage(env: WorkerEnv, context: AuthContext | null): Response {
  return html(
    pageShell({
      env,
      page: "unauthorized",
      context,
      title: "Access denied",
      subtitle: "This app will not continue without the required account type.",
      body: `
        <p class="top-note">The requested app is restricted to specific accounts.</p>
        <div class="actions">
          <a class="button" href="/login?app=manager&platform=web">Back to login</a>
        </div>
      `,
    }),
    403
  );
}

function isPathMatch(pathname: string, path: string): boolean {
  return pathname === path || pathname === `${path}/`;
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

async function readJsonBody<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

async function readFormBody(request: Request): Promise<Record<string, string>> {
  const formData = await request.formData();
  const body: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    body[key] = typeof value === "string" ? value : value.name;
  }
  return body;
}

async function hasTable(env: WorkerEnv, tableName: string): Promise<boolean> {
  const row = await env.auth_d1_binding
    .prepare(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1`
    )
    .bind(tableName)
    .first<{ name: string }>();
  return Boolean(row);
}

function getRequestIp(request: Request): string | null {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null
  );
}

async function handleHealth(env: WorkerEnv): Promise<Response> {
  await ensureControlPlaneSchema();
  await ensureDeviceLeaseSchema();
  await ensureAuthFlowSchema();
  const [hasRegistrationRequests, hasAuthHandoffs, hasDeviceLeases, hasAccountDirectory, hasAuditEvents, hasAuthFlows] = await Promise.all([
    hasTable(env, "registration_requests"),
    hasTable(env, "auth_handoffs"),
    hasTable(env, "auth_device_leases"),
    hasTable(env, "auth_account_directory"),
    hasTable(env, "auth_audit_events"),
    hasTable(env, "auth_flows"),
  ]);

  const supabaseUrl = env.SUPABASE_URL?.trim() || env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publicSupabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim() || "";
  const publicSupabaseAnonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || env.SUPABASE_ANON_KEY?.trim() || "";
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const presentD1Tables = [
    hasRegistrationRequests ? "registration_requests" : null,
    hasAuthHandoffs ? "auth_handoffs" : null,
    hasDeviceLeases ? "auth_device_leases" : null,
    hasAccountDirectory ? "auth_account_directory" : null,
    hasAuditEvents ? "auth_audit_events" : null,
    hasAuthFlows ? "auth_flows" : null,
  ].filter(Boolean) as string[];

  return json({
    ok: true,
    service: "auth-hub",
    activeEnvironment:
      env.AUTH_ENVIRONMENT?.trim() ||
      (env.CF_PAGES_BRANCH ? `pages:${env.CF_PAGES_BRANCH}` : env.CF_PAGES ? "pages" : "workers"),
    databaseReady: Boolean(env.auth_d1_binding),
    d1SchemaReady:
      hasRegistrationRequests &&
      hasAuthHandoffs &&
      hasDeviceLeases &&
      hasAccountDirectory &&
      hasAuditEvents &&
      hasAuthFlows,
    presentD1Tables,
    missingD1Tables: [
      !hasRegistrationRequests ? "registration_requests" : null,
      !hasAuthHandoffs ? "auth_handoffs" : null,
      !hasDeviceLeases ? "auth_device_leases" : null,
      !hasAccountDirectory ? "auth_account_directory" : null,
      !hasAuditEvents ? "auth_audit_events" : null,
      !hasAuthFlows ? "auth_flows" : null,
    ].filter(Boolean),
    supabaseAdminReady: Boolean(supabaseUrl && serviceRoleKey),
    hasSupabaseUrl: Boolean(supabaseUrl),
    hasSupabaseServiceRoleKey: Boolean(serviceRoleKey),
    hasPublicSupabaseUrl: Boolean(publicSupabaseUrl),
    hasPublicSupabaseAnonKey: Boolean(publicSupabaseAnonKey),
    missingKeys: [
      !supabaseUrl ? "SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL" : null,
      !serviceRoleKey ? "SUPABASE_SERVICE_ROLE_KEY" : null,
      !publicSupabaseUrl ? "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL" : null,
      !publicSupabaseAnonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY" : null,
    ].filter(Boolean),
  });
}

async function handleAuthHandoff(request: Request, env: WorkerEnv): Promise<Response> {
  let app: AppSlug | undefined;
  let platform: AuthContext["platform"] | undefined;
  let hasAccessToken = false;
  let hasRefreshToken = false;
  let deviceId: string | undefined;
  let deviceLabel: string | undefined;
  let flowId: string | undefined;
  try {
    setAuthHubEnv(env);
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const body = (await readJsonBody<{
      accessToken?: string;
      app?: AppSlug;
      deviceId?: string;
      deviceLabel?: string;
      flowId?: string;
      next?: string;
      platform?: AuthContext["platform"];
      refreshToken?: string;
      returnTo?: string;
    }>(request)) as {
      accessToken?: string;
      app?: AppSlug;
      deviceId?: string;
      deviceLabel?: string;
      flowId?: string;
      next?: string;
      platform?: AuthContext["platform"];
      refreshToken?: string;
      returnTo?: string;
    };
    const accessToken = body.accessToken?.trim() ?? "";
    const refreshToken = body.refreshToken?.trim() ?? "";

    hasAccessToken = Boolean(accessToken);
    hasRefreshToken = Boolean(refreshToken);
    flowId = body.flowId?.trim() || undefined;
    deviceId = body.deviceId?.trim() || undefined;
    deviceLabel = body.deviceLabel?.trim() || undefined;

    if (!hasAccessToken || !hasRefreshToken) {
      throw new Error("Missing session tokens.");
    }

    if (accessToken !== actor.accessToken.trim()) {
      throw new Error("Session token mismatch.");
    }

    const resolvedFlow = await resolveAuthFlowInput({
      flowId,
      context:
        body.app && body.platform
          ? {
              app: body.app,
              platform: body.platform,
              next: body.next?.trim() || undefined,
              returnTo: body.returnTo?.trim() || undefined,
            }
          : null,
      deviceId: body.deviceId?.trim() || null,
      deviceLabel: body.deviceLabel?.trim() || null,
    });

    const resolvedContext = resolvedFlow.context;
    if (!resolvedContext) {
      throw new Error("Auth handoff context is incomplete.");
    }

    app = resolvedContext.app;
    platform = resolvedContext.platform;

    if (app !== "manager" && app !== "admin" && app !== "user") {
      throw new Error("Invalid app target.");
    }

    if (platform !== "web" && platform !== "desktop" && platform !== "mobile") {
      throw new Error("Invalid platform target.");
    }

    const result = await createAuthHandoff({
      accessToken,
      authUserId: actor.authUserId,
      deviceId: resolvedFlow.deviceId || undefined,
      deviceLabel: resolvedFlow.deviceLabel || undefined,
      flowId,
      refreshToken,
      context: resolvedContext,
    });

    return json(
      {
        ok: true,
        handoff_id: result.handoffId,
        redirect_url: result.redirectUrl,
      },
      200
    );
  } catch (error) {
    await captureAuthHubError(error, {
      route: "POST /api/auth/handoff",
      app,
      platform,
      flowId,
      hasAccessToken,
      hasRefreshToken,
    }).catch(() => undefined);
    if (error && typeof error === "object" && (error as { deviceLeaseConflict?: boolean }).deviceLeaseConflict) {
      const manageUrl = new URL(
        buildInternalHref("/account", app && platform ? { app, platform } : { app: "manager", platform: "web" }),
        "https://auth.mondalfishcenter.com"
      );
      if (deviceId) {
        manageUrl.searchParams.set("device_id", deviceId);
      }
      if (deviceLabel) {
        manageUrl.searchParams.set("device_label", deviceLabel);
      }
      return json(
        {
          error: error instanceof Error ? error.message : "This device slot is already in use.",
          device_conflict: true,
          manage_url: manageUrl.toString(),
          active_device: (error as { activeDeviceLease?: unknown }).activeDeviceLease ?? null,
        },
        409
      );
    }
    console.error("[AuthHub] /api/auth/handoff failed", {
      app,
      platform,
      hasAccessToken,
      hasRefreshToken,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return json(
      { error: error instanceof Error ? error.message : "Could not create handoff." },
      400
    );
  }
}

async function handleAuthPreflight(request: Request): Promise<Response> {
  type AuthPreflightBody = {
    action?: "login_password" | "magic_link" | "password_reset" | "invite_signup" | "self_registration";
    app?: AuthContext["app"];
    deviceId?: string;
    deviceLabel?: string;
    email?: string;
    flowId?: string;
    fullName?: string;
    metadata?: Record<string, unknown>;
    platform?: AuthContext["platform"];
  };

  let body: AuthPreflightBody | null = null;
  try {
    body = (await readJsonBody<AuthPreflightBody>(request)) as AuthPreflightBody;

    const resolvedFlow = await resolveAuthFlowInput({
      flowId: body.flowId?.trim() || null,
      context:
        body.app && body.platform
          ? {
              app: body.app,
              platform: body.platform,
            }
          : body.app
            ? {
                app: body.app,
                platform: "web",
              }
            : null,
      deviceId: body.deviceId,
      deviceLabel: body.deviceLabel,
      email: body.email,
    });

    const email = resolvedFlow.email || "";
    const resolvedContext = resolvedFlow.context;
    const missingFields = [
      !body.action ? "action" : null,
      !resolvedContext?.app ? "app" : null,
      !email ? "email" : null,
    ].filter(Boolean);

    if (missingFields.length > 0) {
      throw new Error(`Preflight request is incomplete: missing ${missingFields.join(", ")}.`);
    }

    const action = body.action as NonNullable<AuthPreflightBody["action"]>;
    const app = resolvedContext?.app as NonNullable<AuthPreflightBody["app"]>;

    const result = await policyPreflightAuthGate({
      action,
      app,
      email,
      fullName: body.fullName,
      deviceId: resolvedFlow.deviceId,
      deviceLabel: resolvedFlow.deviceLabel,
      ipAddress: getRequestIp(request),
      metadata: body.metadata,
      platform: resolvedContext?.platform,
    });

    return json({ ok: true, ...result });
  } catch (error) {
    await captureAuthHubError(error, {
      route: "POST /api/auth/preflight",
      action: body?.action ?? "unknown",
      app: body?.app ?? null,
      platform: body?.platform ?? null,
      hasEmail: Boolean(body?.email?.trim()),
    }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not complete auth preflight." },
      400
    );
  }
}

async function handleDevicesLease(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const body = (await readJsonBody<{
      app?: AuthContext["app"];
      deviceId?: string;
      deviceLabel?: string;
      mode?: "claim" | "touch";
      platform?: AuthContext["platform"];
    }>(request)) as {
      app?: AuthContext["app"];
      deviceId?: string;
      deviceLabel?: string;
      mode?: "claim" | "touch";
      platform?: AuthContext["platform"];
    };

    if (!body.app || !body.platform || !body.deviceId) {
      throw new Error("Device lease request is incomplete.");
    }

    const result =
      body.mode === "claim"
        ? await claimDeviceLease({
            authUserId: actor.authUserId,
            app: body.app,
            deviceId: body.deviceId,
            deviceLabel: body.deviceLabel,
            platform: body.platform,
          })
        : await touchDeviceLease({
            authUserId: actor.authUserId,
            app: body.app,
            deviceId: body.deviceId,
            deviceLabel: body.deviceLabel,
            platform: body.platform,
          });

    if (!result.ok) {
      return json(
        {
          error: result.status === "missing"
            ? "This device lease is no longer active."
            : "This device is no longer active.",
          active_device: result.activeLease,
        },
        409
      );
    }

    return json({ ok: true, lease: result.activeLease });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/devices/lease" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not update device lease." },
      400
    );
  }
}

async function handleDevicesMe(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const devices = await listActiveDeviceLeases(actor.authUserId);
    return json({ ok: true, devices });
  } catch (error) {
    await captureAuthHubError(error, { route: "GET /api/devices" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not load devices." },
      400
    );
  }
}

async function handleDevicesRevoke(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const body = (await readJsonBody<{
      deviceId?: string;
    }>(request)) as {
      deviceId?: string;
    };

    if (!body.deviceId?.trim()) {
      throw new Error("Device id is required.");
    }

    const revoked = await revokeDeviceLease({
      authUserId: actor.authUserId,
      deviceId: body.deviceId.trim(),
    });

    return json({ ok: true, revoked });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/devices/revoke" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not revoke device." },
      400
    );
  }
}

async function handleDevicesRevokeAll(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const revoked = await revokeAllDeviceLeases(actor.authUserId);
    return json({ ok: true, revoked });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/devices/revoke-all" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not revoke devices." },
      400
    );
  }
}

async function handleAccountMe(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    const accounts = await getAuthAccountDirectoryRowsByAuthUserId(actor.authUserId);
    const devices = await listActiveDeviceLeases(actor.authUserId);
    return json({
      ok: true,
      access: actor.access,
      account: accounts[0] || null,
      accounts,
      devices,
    });
  } catch (error) {
    await captureAuthHubError(error, { route: "GET /api/account" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not load account." },
      400
    );
  }
}

async function handleAdminAccountSearch(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    const accessEmail = await requireAdminAccess(request, env);
    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim() || "";
    const app = normalizeAdminLookupApp(url.searchParams.get("app"));

    if (!email) {
      throw new Error("Email is required.");
    }

    const { accounts, devices, rateLimits, relatedValues } = await loadAdminAccountState({
      app,
      email,
    });

    return json({
      ok: true,
      access_email: accessEmail,
      query: {
        app,
        email,
      },
      accounts,
      devices,
      rate_limits: rateLimits,
      related_values: relatedValues,
    });
  } catch (error) {
    await captureAuthHubError(error, { route: "GET /admin/api/account" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not load account." },
      400
    );
  }
}

async function handleAdminRevokeDevice(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    await requireAdminAccess(request, env);
    const body = (await readJsonBody<{
      app?: AppSlug | null;
      deviceId?: string;
      email?: string;
    }>(request)) as {
      app?: AppSlug | null;
      deviceId?: string;
      email?: string;
    };
    const email = body.email?.trim() || "";
    const deviceId = body.deviceId?.trim() || "";
    const app = normalizeAdminLookupApp(body.app || undefined);

    if (!email) {
      throw new Error("Email is required.");
    }

    if (!deviceId) {
      throw new Error("Device id is required.");
    }

    const { accounts } = await loadAdminAccountState({
      app,
      email,
    });
    const authUserIds = [
      ...new Set(
        accounts
          .map((account) => account.auth_user_id)
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      ),
    ];

    let revoked = null;
    for (const authUserId of authUserIds) {
      revoked = await revokeDeviceLease({
        authUserId,
        deviceId,
      });

      if (revoked) {
        break;
      }
    }

    return json({ ok: true, revoked });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /admin/api/devices/revoke" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not revoke device." },
      400
    );
  }
}

async function handleAdminRevokeAllDevices(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    await requireAdminAccess(request, env);
    const body = (await readJsonBody<{
      app?: AppSlug | null;
      email?: string;
    }>(request)) as {
      app?: AppSlug | null;
      email?: string;
    };
    const email = body.email?.trim() || "";
    const app = normalizeAdminLookupApp(body.app || undefined);

    if (!email) {
      throw new Error("Email is required.");
    }

    const { accounts } = await loadAdminAccountState({
      app,
      email,
    });
    const authUserIds = [
      ...new Set(
        accounts
          .map((account) => account.auth_user_id)
          .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      ),
    ];

    const revoked = (
      await Promise.all(
        authUserIds.map(async (authUserId) => ({
          authUserId,
          devices: await revokeAllDeviceLeases(authUserId),
        }))
      )
    ).flatMap((entry) => entry.devices);

    return json({ ok: true, revoked });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /admin/api/devices/revoke-all" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not revoke devices." },
      400
    );
  }
}

async function handleAdminRateLimits(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    await requireAdminAccess(request, env);
    const url = new URL(request.url);
    const email = url.searchParams.get("email")?.trim() || "";
    const app = normalizeAdminLookupApp(url.searchParams.get("app"));

    if (!email) {
      throw new Error("Email is required.");
    }

    const { accounts, devices, rateLimits, relatedValues } = await loadAdminAccountState({
      app,
      email,
    });

    return json({
      ok: true,
      accounts,
      devices,
      rate_limits: rateLimits,
      query: { app, email },
      related_values: relatedValues,
    });
  } catch (error) {
    await captureAuthHubError(error, { route: "GET /admin/api/rate-limits" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not load rate limits." },
      400
    );
  }
}

async function handleAdminRateLimitReset(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    await requireAdminAccess(request, env);
    const body = (await readJsonBody<{
      app?: AppSlug | null;
      email?: string;
    }>(request)) as {
      app?: AppSlug | null;
      email?: string;
    };
    const email = body.email?.trim() || "";
    const app = normalizeAdminLookupApp(body.app || undefined);

    if (!email) {
      throw new Error("Email is required.");
    }

    const { accounts, devices, relatedValues } = await loadAdminAccountState({
      app,
      email,
    });
    const resetCount = await resetAuthRateLimitEntries({
      values: relatedValues,
    });

    return json({
      ok: true,
      accounts,
      devices,
      reset_count: resetCount,
      related_values: relatedValues,
    });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /admin/api/rate-limits/reset" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not reset rate limits." },
      400
    );
  }
}

async function handleAuthExchange(request: Request): Promise<Response> {
  try {
    const body = (await readJsonBody<{
      handoff?: string;
      handoffId?: string;
    }>(request)) as {
      handoff?: string;
      handoffId?: string;
    };
    const handoffId = body.handoffId?.trim() || body.handoff?.trim() || "";
    const result = await exchangeAuthHandoff(handoffId);
    return json(
      {
        ok: true,
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        expires_at: result.expiresAt,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      },
      200,
      {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        Vary: "Origin",
      }
    );
  } catch (error) {
    await captureAuthHubError(error, {
      route: "POST /api/auth/exchange",
    }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not exchange handoff." },
      400,
      {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
        Vary: "Origin",
      }
    );
  }
}

async function handleSelfRegister(request: Request): Promise<Response> {
  try {
    const body = (await readJsonBody<{
      businessName?: string;
      captchaToken?: string | null;
      email?: string;
      flowId?: string;
      fullName?: string;
      message?: string;
      phone?: string;
      requestedPlatform?: "web" | "mobile";
    }>(request)) as {
      businessName?: string;
      captchaToken?: string | null;
      email?: string;
      flowId?: string;
      fullName?: string;
      message?: string;
      phone?: string;
      requestedPlatform?: "web" | "mobile";
    };

    const resolvedFlow = await resolveAuthFlowInput({
      flowId: body.flowId?.trim() || null,
      context: {
        app: "user",
        platform: body.requestedPlatform || "mobile",
      },
      email: body.email?.trim() || "",
    });

    const requestedPlatform =
      resolvedFlow.context?.platform === "web" || resolvedFlow.context?.platform === "mobile"
        ? resolvedFlow.context.platform
        : body.requestedPlatform || "mobile";
    const resolvedEmail = resolvedFlow.email || body.email?.trim() || "";
    const preflight = await policyPreflightAuthGate({
      action: "self_registration",
      app: "user",
      email: resolvedEmail,
      fullName: body.fullName?.trim() || "",
      deviceId: resolvedFlow.deviceId,
      deviceLabel: resolvedFlow.deviceLabel,
      ipAddress: getRequestIp(request),
      metadata: {
        business_name: body.businessName?.trim() || null,
        message: body.message?.trim() || null,
        requested_platform: requestedPlatform,
      },
      platform: requestedPlatform,
    });

    if (!preflight.allowed) {
      return json(
        {
          error: preflight.reason,
          account: preflight.account,
        },
        403
      );
    }

    const result = await submitSelfRegistration({
      email: resolvedEmail,
      fullName: body.fullName?.trim() || "",
      phone: body.phone?.trim() || undefined,
      businessName: body.businessName?.trim() || undefined,
      message: body.message?.trim() || undefined,
      requestedPlatform,
    });

    return json({ ok: true, ...result });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/register/self" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not submit registration." },
      400
    );
  }
}

async function handleRegisterInvite(request: Request): Promise<Response> {
  try {
    const body = (await readJsonBody<{
      email?: string;
      flowId?: string;
      fullName?: string;
      inviteToken?: string;
      password?: string;
    }>(request)) as {
      email?: string;
      flowId?: string;
      fullName?: string;
      inviteToken?: string;
      password?: string;
    };

    const resolvedFlow = await resolveAuthFlowInput({
      flowId: body.flowId?.trim() || null,
      email: body.email?.trim() || "",
      inviteToken: body.inviteToken?.trim() || null,
    });

    const effectiveInviteToken = resolvedFlow.inviteToken || body.inviteToken?.trim() || "";
    const inviteContext = effectiveInviteToken
      ? await getInviteContextByToken(effectiveInviteToken)
      : null;

    if (inviteContext) {
      const preflight = await policyPreflightAuthGate({
        action: "invite_signup",
        app: (inviteContext.requested_app as AuthContext["app"]) || "user",
        email: resolvedFlow.email || body.email?.trim() || inviteContext.email,
        fullName: body.fullName?.trim() || inviteContext.full_name || inviteContext.email,
        deviceId: resolvedFlow.deviceId,
        deviceLabel: resolvedFlow.deviceLabel,
        ipAddress: getRequestIp(request),
        metadata: {
          invite_token: effectiveInviteToken,
          requested_app: inviteContext.requested_app,
          requested_platform: inviteContext.requested_platform,
        },
        platform: (inviteContext.requested_platform as AuthContext["platform"] | undefined) || undefined,
      });

      if (!preflight.allowed) {
        return json(
          {
            error: preflight.reason,
            account: preflight.account,
          },
          403
        );
      }
    }

    const result = await registerInviteAccount({
      inviteToken: effectiveInviteToken,
      email: resolvedFlow.email || body.email?.trim() || "",
      fullName: body.fullName?.trim() || "",
      password: body.password?.trim() || "",
    });

    return json({
      ok: true,
      authUserId: result.authUserId,
      inviteContext: result.inviteContext,
    });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/register/invite" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not create invited account." },
      400
    );
  }
}

async function handleInvitesContext(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const invite = url.searchParams.get("invite")?.trim() || "";
    if (!invite) {
      return json({ error: "Missing invite token." }, 400);
    }
    const context = await getInviteContextByToken(invite);
    if (!context) {
      return json({ error: "This invite link is invalid or has expired." }, 404);
    }
    return json({ ok: true, context });
  } catch (error) {
    await captureAuthHubError(error, { route: "GET /api/invites/context" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not load invite." },
      400
    );
  }
}

async function handleInvitesManager(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    await assertInvitePermission(actor, "manager_invite");
    const body = (await readJsonBody<{ email?: string; fullName?: string; requestedPlatform?: string }>(request)) as {
      email?: string;
      fullName?: string;
      requestedPlatform?: string;
    };
    const invite = await createManagerInvite({
      actorAuthUserId: actor.authUserId,
      email: body.email?.trim() || "",
      fullName: body.fullName?.trim() || "",
      requestedPlatform: body.requestedPlatform?.trim() || "desktop",
    });
    return json({ ok: true, ...invite });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/invites/manager" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not create invite." },
      400
    );
  }
}

async function handleInvitesUser(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    await assertInvitePermission(actor, "user_invite");
    const body = (await readJsonBody<{
      businessName?: string;
      defaultRole?: string;
      email?: string;
      fullName?: string;
      phone?: string;
      requestedPlatform?: string;
      requestedUserType?: string;
    }>(request)) as {
      businessName?: string;
      defaultRole?: string;
      email?: string;
      fullName?: string;
      phone?: string;
      requestedPlatform?: string;
      requestedUserType?: string;
    };
    const invite = await createUserInvite({
      actorAuthUserId: actor.authUserId,
      email: body.email?.trim() || "",
      fullName: body.fullName?.trim() || "",
      businessName: body.businessName?.trim() || null,
      phone: body.phone?.trim() || null,
      requestedPlatform: body.requestedPlatform?.trim() || "mobile",
      requestedDefaultRole: body.defaultRole?.trim() || "buyer",
      requestedUserType: body.requestedUserType?.trim() || "vendor",
    });
    return json({ ok: true, ...invite });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/invites/user" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not create invite." },
      400
    );
  }
}

async function handleRequests(request: Request): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    if (!actor.access.is_admin && !actor.access.is_manager) {
      throw new Error("Access denied.");
    }
    const rows = await listPendingRegistrations();
    return json({ ok: true, rows });
  } catch (error) {
    await captureAuthHubError(error, { route: "GET /api/requests" }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not load requests." },
      400
    );
  }
}

async function handleRequestApprove(request: Request, id: string): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    if (!actor.access.is_admin && !actor.access.is_manager) {
      throw new Error("Access denied.");
    }
    const result = await approveSelfRegistration({
      actorAuthUserId: actor.authUserId,
      requestId: id,
    });
    return json({ ok: true, ...result });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/requests/:id/approve", requestId: id }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not approve request." },
      400
    );
  }
}

async function handleRequestReject(request: Request, id: string): Promise<Response> {
  try {
    const actor = await resolveActorFromBearer(request.headers.get("authorization"));
    if (!actor.access.is_admin && !actor.access.is_manager) {
      throw new Error("Access denied.");
    }
    const body = await request.json().catch(() => ({} as { reason?: string }));
    await rejectRegistration({
      actorAuthUserId: actor.authUserId,
      requestId: id,
      reason: (body as { reason?: string })?.reason?.trim() || null,
    });
    return json({ ok: true });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/requests/:id/reject", requestId: id }).catch(() => undefined);
    return json(
      { error: error instanceof Error ? error.message : "Could not reject request." },
      400
    );
  }
}

async function handleSupabaseSendEmail(request: Request, env: WorkerEnv): Promise<Response> {
  try {
    setAuthHubEnv(env);
    const hookSecret = env.SUPABASE_SEND_EMAIL_HOOK_SECRET?.trim() || env.SEND_EMAIL_HOOK_SECRET?.trim();

    if (!hookSecret) {
      throw new Error("Missing send email hook secret.");
    }

    const { Webhook } = await import("standardwebhooks");
    const payload = await request.text();
    const headers = Object.fromEntries(request.headers);
    const webhook = new Webhook(hookSecret.replace(/^v1,whsec_/, ""));
    const verified = webhook.verify(payload, headers) as {
      email_data: {
        email_action_type: string;
        redirect_to: string;
        site_url: string;
        token: string;
        token_hash: string;
        token_hash_new?: string;
        token_new?: string;
      };
      user: {
        email: string;
      };
    };

    await policySendSupabaseAuthEmail({
      actionType: verified.email_data.email_action_type,
      email: verified.user.email,
      redirectTo: verified.email_data.redirect_to,
      siteUrl: verified.email_data.site_url,
      token: verified.email_data.token,
      tokenHash: verified.email_data.token_hash,
      tokenHashNew: verified.email_data.token_hash_new,
      tokenNew: verified.email_data.token_new,
    });

    return json({ ok: true });
  } catch (error) {
    await captureAuthHubError(error, { route: "POST /api/hooks/supabase/send-email" }).catch(() => undefined);
    const mailError = getZeptoMailErrorDetails(error);
    return json(
      {
        error: error instanceof Error ? error.message : "Could not send auth email.",
        mailError,
      },
      mailError ? 502 : 400
    );
  }
}

async function routePage(env: WorkerEnv, url: URL, request: Request): Promise<Response> {
  return routeSharedAuthPage(env, url, request);
}

function shouldServeAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/logo/") ||
    pathname === "/auth-client.js" ||
    pathname === "/admin-client.js"
  );
}

const worker = {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    setAuthHubEnv(env);
    const url = new URL(request.url);
    const pathname = normalizePath(url.pathname);

    try {
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: CORS_HEADERS,
        });
      }

      if (pathname === "/api/health") {
        return await handleHealth(env);
      }

      if (isAdminApiPath(pathname)) {
        if (pathname === "/admin/api/account" && request.method === "GET") {
          return await handleAdminAccountSearch(request, env);
        }

        if (pathname === "/admin/api/devices/revoke" && request.method === "POST") {
          return await handleAdminRevokeDevice(request, env);
        }

        if (pathname === "/admin/api/devices/revoke-all" && request.method === "POST") {
          return await handleAdminRevokeAllDevices(request, env);
        }

        if (pathname === "/admin/api/rate-limits" && request.method === "GET") {
          return await handleAdminRateLimits(request, env);
        }

        if (pathname === "/admin/api/rate-limits/reset" && request.method === "POST") {
          return await handleAdminRateLimitReset(request, env);
        }
      }

      if (pathname === "/api/auth/preflight" && request.method === "POST") {
        return await handleAuthPreflight(request);
      }

      if (pathname === "/api/auth/handoff" && request.method === "POST") {
        return await handleAuthHandoff(request, env);
      }

      if (pathname === "/api/auth/exchange" && request.method === "POST") {
        return await handleAuthExchange(request);
      }

      if (pathname === "/api/devices" && request.method === "GET") {
        return await handleDevicesMe(request);
      }

      if (pathname === "/api/devices/lease" && request.method === "POST") {
        return await handleDevicesLease(request);
      }

      if (pathname === "/api/devices/revoke" && request.method === "POST") {
        return await handleDevicesRevoke(request);
      }

      if (pathname === "/api/devices/revoke-all" && request.method === "POST") {
        return await handleDevicesRevokeAll(request);
      }

      if (pathname === "/api/account" && request.method === "GET") {
        return await handleAccountMe(request);
      }

      if (pathname === "/api/register/self" && request.method === "POST") {
        return await handleSelfRegister(request);
      }

      if (pathname === "/api/register/invite" && request.method === "POST") {
        return await handleRegisterInvite(request);
      }

      if (pathname === "/api/invites/context" && request.method === "GET") {
        return await handleInvitesContext(request);
      }

      if (pathname === "/api/invites/manager" && request.method === "POST") {
        return await handleInvitesManager(request);
      }

      if (pathname === "/api/invites/user" && request.method === "POST") {
        return await handleInvitesUser(request);
      }

      if (pathname === "/api/requests" && request.method === "GET") {
        return await handleRequests(request);
      }

      const approveMatch = pathname.match(/^\/api\/requests\/([^/]+)\/approve$/);
      if (approveMatch && request.method === "POST" && approveMatch[1]) {
        return await handleRequestApprove(request, approveMatch[1]);
      }

      const rejectMatch = pathname.match(/^\/api\/requests\/([^/]+)\/reject$/);
      if (rejectMatch && request.method === "POST" && rejectMatch[1]) {
        return await handleRequestReject(request, rejectMatch[1]);
      }

      if (pathname === "/api/hooks/supabase/send-email" && request.method === "POST") {
        return await handleSupabaseSendEmail(request, env);
      }

      if (shouldServeAsset(pathname) && env.ASSETS) {
        return await env.ASSETS.fetch(request);
      }

      if (request.method === "GET") {
        return await routePage(env, url, request);
      }

      return textResponse("Not found", 404);
    } catch (error) {
      await captureAuthHubError(error, { route: "worker.fetch", pathname }).catch(() => undefined);
      console.error("[AuthHub] request failed", {
        pathname,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return json(
        { error: error instanceof Error ? error.message : "Unexpected auth hub failure." },
        500
      );
    }
  },
};

export default worker;
