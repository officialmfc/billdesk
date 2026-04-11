import {
  allowSelfSignup,
  buildInternalHref,
  getContextLabel,
  getRequiredAccountLabel,
  readContext,
  type AuthContext,
} from "@/lib/config";
import type { AuthHubCloudflareEnv } from "@/lib/server/cloudflare";
import {
  createAuthFlow,
  getAuthFlow,
  type AuthFlowAction,
  type AuthFlowRow,
} from "@/lib/server/flows";

export type AuthPageName =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "confirm"
  | "callback"
  | "handoff"
  | "account"
  | "unauthorized";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function getPublicConfig(
  env: AuthHubCloudflareEnv,
  page: AuthPageName,
  context: AuthContext | null,
  extras: Record<string, unknown> = {}
) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim() || "";
  const supabaseAnonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || env.SUPABASE_ANON_KEY?.trim() || "";
  const sentryDsn =
    env.NEXT_PUBLIC_SENTRY_DSN?.trim() || env.SENTRY_DSN?.trim() || "";
  const turnstileSiteKey =
    env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || env.TURNSTILE_SITE_KEY?.trim() || "";

  return {
    page,
    context,
    authBaseUrl:
      env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
      "https://auth.mondalfishcenter.com",
    logoUrl: "/logo/mfclogo.svg",
    sentryDsn,
    supabaseAnonKey,
    supabaseUrl,
    turnstileSiteKey,
    ...extras,
  };
}

function pageShell(params: {
  body: string;
  context: AuthContext | null;
  env: AuthHubCloudflareEnv;
  page: AuthPageName;
  subtitle?: string;
  title: string;
  extras?: Record<string, unknown>;
}): string {
  const publicConfig = JSON.stringify(
    getPublicConfig(params.env, params.page, params.context, params.extras)
  );
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
      .password-field input { padding-right: 92px; }
      .auth-captcha-shell {
        display: grid;
        gap: 8px;
        margin: 10px 0 2px;
      }
      .auth-captcha-shell #turnstile-widget {
        min-height: 68px;
      }
      .auth-captcha-hint {
        margin: 0;
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
      .button__spinner {
        display: none;
        width: 14px;
        height: 14px;
        border-radius: 999px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        animation: spin 0.8s linear infinite;
        flex: 0 0 auto;
      }
      .button__label {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .button__icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        flex: 0 0 auto;
        overflow: hidden;
      }
      .button__icon svg {
        display: block;
        width: 18px;
        height: 18px;
      }
      .button[disabled] .button__spinner {
        display: inline-block;
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

function renderTurnstileBlock(): string {
  return `
    <div class="auth-captcha-shell">
      <p class="small auth-captcha-hint">Security check</p>
      <div id="turnstile-widget"></div>
    </div>
    <input type="hidden" data-turnstile-token value="" />
  `;
}

function renderGoogleIcon(): string {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.6 12.27c0-.71-.06-1.39-.16-2.05H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.36Z"></path>
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.62-2.4l-3.23-2.5c-.9.6-2.05.97-3.39.97-2.6 0-4.8-1.76-5.59-4.12H2.06v2.58A10 10 0 0 0 12 22Z"></path>
      <path fill="#FBBC05" d="M6.41 13.95a6 6 0 0 1 0-3.9V7.47H2.06a10 10 0 0 0 0 9.06l4.35-2.58Z"></path>
      <path fill="#EA4335" d="M12 5.02c1.46 0 2.77.5 3.8 1.48l2.85-2.85A9.56 9.56 0 0 0 12 2a10 10 0 0 0-9.94 7.47l4.35 2.58C7.2 6.78 9.4 5.02 12 5.02Z"></path>
    </svg>
  `;
}

function renderButtonLabel(label: string): string {
  return `<span class="button__label" data-button-label data-default-label="${escapeHtml(label)}">${escapeHtml(label)}</span>`;
}

function renderSpinner(): string {
  return `<span class="button__spinner" aria-hidden="true"></span>`;
}

function buildContextFromUrl(url: URL): AuthContext | null {
  return readContext(url.searchParams);
}

function getDeviceConfigFromUrl(url: URL): { deviceId?: string; deviceLabel?: string } {
  const deviceId = url.searchParams.get("device_id")?.trim() || "";
  const deviceLabel = url.searchParams.get("device_label")?.trim() || "";

  return {
    deviceId: deviceId || undefined,
    deviceLabel: deviceLabel || undefined,
  };
}

function buildAuthLink(path: string, context: AuthContext | null, flow: AuthFlowRow | null): string {
  const params = new URLSearchParams();

  if (flow) {
    params.set("flow", flow.id);
  }

  if (context) {
    params.set("app", context.app);
    params.set("platform", context.platform);

    if (context.next) {
      params.set("next", context.next);
    }

    if (context.returnTo) {
      params.set("return_to", context.returnTo);
    }
  }

  if (params.size === 0) {
    params.set("app", "manager");
    params.set("platform", "web");
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function renderUnauthorizedPage(env: AuthHubCloudflareEnv, context: AuthContext | null): Response {
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

function renderLoginPage(
  env: AuthHubCloudflareEnv,
  context: AuthContext,
  flow: AuthFlowRow | null,
  extras: { deviceId?: string; deviceLabel?: string; emailSeed?: string | null } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "login",
      context,
      extras: {
        flowId: flow?.id ?? "",
        deviceId: extras.deviceId,
        deviceLabel: extras.deviceLabel,
        emailSeed: extras.emailSeed || flow?.email_seed || "",
      },
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
          <div class="actions">
            <button class="button" type="submit">
              ${renderSpinner()}
              ${renderButtonLabel("Log in")}
            </button>
            <button class="button secondary" id="request-magic-link" type="button">
              ${renderSpinner()}
              ${renderButtonLabel("Request magic link")}
            </button>
            <button class="button secondary" id="google-login" type="button">
              <span class="button__icon" aria-hidden="true">${renderGoogleIcon()}</span>
              ${renderSpinner()}
              ${renderButtonLabel("Continue with Google")}
            </button>
          </div>
        </form>
        <div class="divider"><span>or</span></div>
        <div class="links">
          <a href="${buildAuthLink("/forgot-password", context, flow)}">Forgot password?</a>
          ${allowSelfSignup(context) ? `<a href="${buildAuthLink("/signup", context, flow)}">Create account</a>` : `<a href="${buildAuthLink("/unauthorized", context, flow)}">Invite only</a>`}
        </div>
      `,
    })
  );
}

function renderSignupPage(
  env: AuthHubCloudflareEnv,
  context: AuthContext,
  flow: AuthFlowRow | null,
  inviteToken: string | null,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  const effectiveInviteToken = inviteToken || flow?.invite_token || "";
  const inviteMode = Boolean(effectiveInviteToken);
  return html(
    pageShell({
      env,
      page: "signup",
      context,
      extras: {
        flowId: flow?.id ?? "",
        inviteToken: effectiveInviteToken,
        deviceId: extras.deviceId,
        deviceLabel: extras.deviceLabel,
      },
      title: inviteMode
        ? `Set up your ${getContextLabel(context)} access`
        : `Request ${getContextLabel(context)} access`,
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
          ${inviteMode ? "" : renderTurnstileBlock()}
          <div class="actions">
            <button class="button" type="submit">
              ${renderSpinner()}
              ${renderButtonLabel(inviteMode ? "Create account" : "Submit request")}
            </button>
          </div>
        </form>
        <p id="invite-status" class="small"></p>
        <div class="links">
          <a href="${buildAuthLink("/login", context, flow)}">Back to login</a>
        </div>
      `,
    })
  );
}

function renderForgotPasswordPage(
  env: AuthHubCloudflareEnv,
  context: AuthContext,
  flow: AuthFlowRow | null,
  extras: { deviceId?: string; deviceLabel?: string; emailSeed?: string | null } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "forgot-password",
      context,
      extras: {
        flowId: flow?.id ?? "",
        deviceId: extras.deviceId,
        deviceLabel: extras.deviceLabel,
        emailSeed: extras.emailSeed || flow?.email_seed || "",
      },
      title: "Reset password",
      subtitle: "We will send a reset link to your email.",
      body: `
        <form id="forgot-form">
          <div class="field">
            <label for="forgot-email">Email</label>
            <input id="forgot-email" name="email" type="email" autocomplete="email" required />
          </div>
          <div class="actions">
            <button class="button" type="submit">
              ${renderSpinner()}
              ${renderButtonLabel("Send reset link")}
            </button>
          </div>
        </form>
        <div class="links">
          <a href="${buildAuthLink("/login", context, flow)}">Back to login</a>
        </div>
      `,
    })
  );
}

function renderResetPasswordPage(
  env: AuthHubCloudflareEnv,
  context: AuthContext,
  flow: AuthFlowRow | null,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "reset-password",
      context,
      extras: {
        flowId: flow?.id ?? "",
        deviceId: extras.deviceId,
        deviceLabel: extras.deviceLabel,
      },
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
          <div class="actions">
            <button class="button" type="button" data-open-handoff>
              ${renderSpinner()}
              ${renderButtonLabel("Update password")}
            </button>
          </div>
        </form>
        <div class="links">
          <a href="${buildAuthLink("/login", context, flow)}">Back to login</a>
        </div>
      `,
    })
  );
}

function renderSimpleStatusPage(
  env: AuthHubCloudflareEnv,
  context: AuthContext,
  page: AuthPageName,
  flow: AuthFlowRow | null,
  title: string,
  subtitle: string,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page,
      context,
      extras: {
        flowId: flow?.id ?? "",
        deviceId: extras.deviceId,
        deviceLabel: extras.deviceLabel,
      },
      title,
      subtitle,
      body: `<div class="loader"></div><p class="small" style="text-align:center;margin-top:14px;">Please wait while your session is prepared.</p>`,
    })
  );
}

function renderAccountPage(
  env: AuthHubCloudflareEnv,
  context: AuthContext | null,
  extras: { deviceId?: string; deviceLabel?: string } = {}
): Response {
  return html(
    pageShell({
      env,
      page: "account",
      context,
      extras,
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

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function flowActionForPage(page: AuthPageName): AuthFlowAction | null {
  switch (page) {
    case "login":
      return "login";
    case "signup":
      return "signup";
    case "forgot-password":
      return "forgot_password";
    case "reset-password":
      return "reset_password";
    case "confirm":
      return "confirm";
    case "callback":
      return "callback";
    case "handoff":
      return "handoff";
    default:
      return null;
  }
}

async function resolvePageFlow(params: {
  action: AuthFlowAction | null;
  context: AuthContext | null;
  deviceId?: string;
  deviceLabel?: string;
  emailSeed?: string | null;
  inviteToken?: string | null;
  url: URL;
}): Promise<AuthFlowRow | null> {
  const flowId = params.url.searchParams.get("flow")?.trim() || "";
  if (flowId) {
    return await getAuthFlow(flowId);
  }

  if (!params.action || !params.context) {
    return null;
  }

  return createAuthFlow({
    action: params.action,
    context: params.context,
    deviceId: params.deviceId,
    deviceLabel: params.deviceLabel,
    emailSeed: params.emailSeed,
    inviteToken: params.inviteToken,
  });
}

export async function routeAuthPage(
  env: AuthHubCloudflareEnv,
  url: URL
): Promise<Response> {
  const existingFlowId = url.searchParams.get("flow")?.trim() || "";
  const existingFlow = existingFlowId ? await getAuthFlow(existingFlowId) : null;
  const context =
    buildContextFromUrl(url) ||
    (existingFlow
      ? {
          app: existingFlow.app,
          platform: existingFlow.platform,
          next: existingFlow.next_path || undefined,
          returnTo: existingFlow.return_to || undefined,
        }
      : null);
  const page = normalizePath(url.pathname) as `/${string}`;
  const deviceConfig = getDeviceConfigFromUrl(url);
  const emailSeed = url.searchParams.get("email")?.trim() || null;
  const inviteToken = url.searchParams.get("invite")?.trim() || null;

  if (!context && page !== "/" && page !== "/account" && page !== "/unauthorized") {
    return renderUnauthorizedPage(env, null);
  }

  switch (page) {
    case "/":
      return renderAccountPage(env, context, deviceConfig);
    case "/login": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("login"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        emailSeed,
        url,
      });
      return renderLoginPage(env, context!, flow, { ...deviceConfig, emailSeed });
    }
    case "/signup": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("signup"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        inviteToken,
        emailSeed,
        url,
      });
      return renderSignupPage(env, context!, flow, inviteToken, deviceConfig);
    }
    case "/forgot-password": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("forgot-password"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        emailSeed,
        url,
      });
      return renderForgotPasswordPage(env, context!, flow, { ...deviceConfig, emailSeed });
    }
    case "/reset-password": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("reset-password"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        url,
      });
      return renderResetPasswordPage(env, context!, flow, deviceConfig);
    }
    case "/confirm": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("confirm"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        url,
      });
      return renderSimpleStatusPage(
        env,
        context!,
        "confirm",
        flow,
        "Confirm sign up",
        "Please wait while we verify your email.",
        deviceConfig
      );
    }
    case "/callback": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("callback"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        url,
      });
      return renderSimpleStatusPage(
        env,
        context!,
        "callback",
        flow,
        "Signing in",
        "Your session is being prepared.",
        deviceConfig
      );
    }
    case "/handoff": {
      const flow = await resolvePageFlow({
        action: flowActionForPage("handoff"),
        context,
        deviceId: deviceConfig.deviceId,
        deviceLabel: deviceConfig.deviceLabel,
        url,
      });
      return renderSimpleStatusPage(
        env,
        context!,
        "handoff",
        flow,
        "Opening app",
        "Your session is ready.",
        deviceConfig
      );
    }
    case "/account":
      return renderAccountPage(env, context, deviceConfig);
    case "/unauthorized":
      return renderUnauthorizedPage(env, context);
    default:
      return renderUnauthorizedPage(env, context);
  }
}
