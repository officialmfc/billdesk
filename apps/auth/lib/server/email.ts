import { getAuthHubEnv } from "@/lib/server/cloudflare";

const DEFAULT_AUTH_BASE_URL = "https://auth.mondalfishcenter.com";
const DEFAULT_LOGO_URL = "https://releases.mondalfishcenter.com/public/logo/logo.jpg";

type ZeptoMailRecipient = {
  email_address: {
    address: string;
    name?: string;
  };
};

type ZeptoMailMessage = {
  from: {
    address: string;
    name?: string;
  };
  to: ZeptoMailRecipient[];
  subject: string;
  htmlbody: string;
  textbody?: string;
};

type ZeptoMailResponseError = Error & {
  zeptoMailStatus?: number;
  zeptoMailStatusText?: string;
  zeptoMailResponseBody?: string;
  zeptoMailResponseHeaders?: Record<string, string>;
  zeptoMailApiUrl?: string;
  zeptoMailFromEmail?: string;
  zeptoMailFromName?: string;
};

export type ZeptoMailErrorDetails = {
  apiUrl?: string;
  fromEmail?: string;
  fromName?: string;
  message: string;
  responseBody?: string;
  responseHeaders?: Record<string, string>;
  status?: number;
  statusText?: string;
};

type EmailLinkInput = {
  redirectTo: string;
  tokenHash: string;
  actionType: string;
  token?: string | null;
  tokenNew?: string | null;
  tokenHashNew?: string | null;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildEmailLink(input: EmailLinkInput): string {
  const url = new URL(input.redirectTo);
  const tokenHash = input.tokenHashNew || input.tokenHash;
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", input.actionType);

  if (input.token) {
    url.searchParams.set("token", input.token);
  }

  if (input.tokenNew) {
    url.searchParams.set("token_new", input.tokenNew);
  }

  return url.toString();
}

function collectResponseHeaders(response: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [key, value] of response.headers.entries()) {
    const lowered = key.toLowerCase();
    if (
      lowered.startsWith("x-") ||
      lowered === "content-type" ||
      lowered === "content-length" ||
      lowered === "date" ||
      lowered === "server"
    ) {
      headers[key] = value;
    }
  }

  return headers;
}

function makeZeptoMailError(params: {
  response: Response;
  apiUrl: string;
  fromEmail: string;
  fromName: string;
  responseBody: string;
}): ZeptoMailResponseError {
  const body = params.responseBody.trim();
  const responseHeaders = collectResponseHeaders(params.response);
  const headerText = Object.keys(responseHeaders).length
    ? ` headers=${JSON.stringify(responseHeaders)}`
    : "";
  const details = [
    `status=${params.response.status}`,
    `statusText=${params.response.statusText || "n/a"}`,
    `apiUrl=${params.apiUrl}`,
    `from=${params.fromName} <${params.fromEmail}>`,
    body ? `body=${body}` : null,
    headerText ? headerText.trim() : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const error = new Error(`ZeptoMail send failed: ${details}`) as ZeptoMailResponseError;
  error.zeptoMailStatus = params.response.status;
  error.zeptoMailStatusText = params.response.statusText;
  error.zeptoMailResponseBody = body || undefined;
  error.zeptoMailResponseHeaders = responseHeaders;
  error.zeptoMailApiUrl = params.apiUrl;
  error.zeptoMailFromEmail = params.fromEmail;
  error.zeptoMailFromName = params.fromName;
  return error;
}

export function getZeptoMailErrorDetails(error: unknown): ZeptoMailErrorDetails | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const record = error as Partial<ZeptoMailResponseError> & { message?: unknown };
  const message =
    typeof record.message === "string" && record.message.trim().length > 0
      ? record.message
      : null;

  if (
    message &&
    !record.zeptoMailStatus &&
    !record.zeptoMailStatusText &&
    !record.zeptoMailResponseBody &&
    !record.zeptoMailResponseHeaders &&
    !record.zeptoMailApiUrl &&
    !record.zeptoMailFromEmail &&
    !record.zeptoMailFromName
  ) {
    return null;
  }

  return {
    apiUrl: record.zeptoMailApiUrl,
    fromEmail: record.zeptoMailFromEmail,
    fromName: record.zeptoMailFromName,
    message: message || "ZeptoMail send failed.",
    responseBody: record.zeptoMailResponseBody,
    responseHeaders: record.zeptoMailResponseHeaders,
    status: record.zeptoMailStatus,
    statusText: record.zeptoMailStatusText,
  };
}

function renderEmailShell(params: {
  actionLabel: string;
  body: string;
  buttonLabel?: string;
  buttonUrl?: string;
  footer?: string;
  logoUrl?: string;
}): { html: string; text: string } {
  const button = params.buttonLabel && params.buttonUrl
    ? `
      <p style="margin: 28px 0 14px;text-align:center;">
        <a href="${escapeHtml(params.buttonUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:700;">
          ${escapeHtml(params.buttonLabel)}
        </a>
      </p>`
    : "";

  const rawLink = params.buttonUrl
    ? `
      <div style="border-top:1px solid #e2e8f0;margin-top:18px;padding-top:18px;">
        <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 10px;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="margin:0;font-size:13px;line-height:1.6;word-break:break-all;">
          <a href="${escapeHtml(params.buttonUrl)}" style="color:#1d4ed8;text-decoration:underline;">${escapeHtml(params.buttonUrl)}</a>
        </p>
      </div>`
    : "";

  const footer = params.footer
    ? `<p style="color:#6b7280;font-size:13px;line-height:1.6;margin:18px 0 0;">${escapeHtml(params.footer)}</p>`
    : "";

  const copyright =
    `<p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:18px 0 0;text-align:center;">© 2026 Mondal Fish Center. All rights reserved.</p>`;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f5f7fb;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(15,23,42,.08);">
        <div style="padding:28px 32px 20px;text-align:center;background:linear-gradient(180deg,#f8fbff 0%,#fff 100%);">
          <img src="${escapeHtml(params.logoUrl || DEFAULT_LOGO_URL)}" alt="Mondal Fish Center" width="92" height="92" style="display:block;margin:0 auto 16px;border-radius:20px;object-fit:cover;" />
          <div style="display:inline-block;padding:6px 12px;border-radius:999px;background:#e0f2fe;color:#075985;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;">
            MFC Auth
          </div>
          <div style="font-size:28px;line-height:1.2;color:#111827;font-weight:800;margin:18px 0 10px;letter-spacing:-.03em;">
            ${escapeHtml(params.actionLabel)}
          </div>
          <div style="font-size:16px;line-height:1.7;color:#475569;">
            ${params.body}
          </div>
        </div>

        <div style="padding:0 32px 28px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:20px 20px 16px;margin-top:8px;">
            ${button}
            ${rawLink}
            ${footer}
            ${copyright}
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    html,
    text: `${params.actionLabel}\n\n${params.body.replace(/<[^>]*>/g, "")}${
      params.buttonUrl ? `\n\n${params.buttonLabel || "Open link"}: ${params.buttonUrl}` : ""
    }${params.footer ? `\n\n${params.footer}` : ""}\n\n© 2026 Mondal Fish Center. All rights reserved.`,
  };
}

export async function sendZeptoMailMessage(params: {
  subject: string;
  toEmail: string;
  toName?: string | null;
  html: string;
  text?: string;
}): Promise<void> {
  const env = await getAuthHubEnv();
  const apiKey = env.ZEPTOMAIL_API_KEY?.trim() || "";
  const apiUrl = env.ZEPTOMAIL_API_URL?.trim() || "https://api.zeptomail.in/v1.1/email";
  const fromEmail = env.ZEPTOMAIL_FROM_EMAIL?.trim() || "";
  const fromName = env.ZEPTOMAIL_FROM_NAME?.trim() || "MFC Auth";

  if (!apiKey || !fromEmail) {
    throw new Error("Missing ZeptoMail configuration.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: params.toEmail,
            name: params.toName || params.toEmail,
          },
        },
      ],
      subject: params.subject,
      htmlbody: params.html,
      textbody: params.text,
    } satisfies ZeptoMailMessage),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw makeZeptoMailError({
      response,
      apiUrl,
      fromEmail,
      fromName,
      responseBody: errorText,
    });
  }
}

export async function sendRegistrationInviteEmail(params: {
  email: string;
  fullName: string;
  signupPath: string;
  appLabel: string;
}): Promise<void> {
  const env = await getAuthHubEnv();
  const authBaseUrl =
    env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    DEFAULT_AUTH_BASE_URL;
  const signupUrl = new URL(params.signupPath, authBaseUrl).toString();
  const body = renderEmailShell({
    actionLabel: `Invite to ${params.appLabel}`,
    body: `<p>${escapeHtml(params.fullName)}, you have been invited to join ${escapeHtml(params.appLabel)}.</p><p>Use the button below to verify your email and continue setup.</p>`,
    buttonLabel: "Continue setup",
    buttonUrl: signupUrl,
    footer: "If you did not expect this invitation, you can ignore this email.",
    logoUrl: DEFAULT_LOGO_URL,
  });

  await sendZeptoMailMessage({
    subject: `Your ${params.appLabel} invitation`,
    toEmail: params.email,
    toName: params.fullName,
    html: body.html,
    text: body.text,
  });
}

export async function sendSelfRegistrationApprovedEmail(params: {
  email: string;
  fullName: string;
  signupPath: string;
}): Promise<void> {
  const env = await getAuthHubEnv();
  const authBaseUrl =
    env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    DEFAULT_AUTH_BASE_URL;
  const signupUrl = new URL(params.signupPath, authBaseUrl).toString();
  const body = renderEmailShell({
    actionLabel: "Registration approved",
    body: `<p>${escapeHtml(params.fullName)}, your registration has been approved.</p><p>Open the button below to finish setting up your account.</p>`,
    buttonLabel: "Finish signup",
    buttonUrl: signupUrl,
    footer: "If you did not request this, you can ignore this email.",
    logoUrl: DEFAULT_LOGO_URL,
  });

  await sendZeptoMailMessage({
    subject: "Your registration was approved",
    toEmail: params.email,
    toName: params.fullName,
    html: body.html,
    text: body.text,
  });
}

function buildSupabaseEmailLink(params: EmailLinkInput): string {
  return buildEmailLink(params);
}

export async function sendSupabaseAuthEmail(params: {
  actionType: string;
  email: string;
  redirectTo: string;
  siteUrl?: string | null;
  token: string;
  tokenHash: string;
  tokenNew?: string | null;
  tokenHashNew?: string | null;
}): Promise<void> {
  const actionLabel = {
    signup: "Confirm sign up",
    invite: "Accept invite",
    magiclink: "Magic link sign in",
    recovery: "Reset password",
    email_change: "Change email address",
    email_change_current: "Confirm current email",
    email_change_new: "Confirm new email",
    reauthentication: "Re-authentication",
  }[params.actionType] || "Authenticate";

  const actionUrl = buildSupabaseEmailLink({
    redirectTo: params.redirectTo,
    tokenHash: params.tokenHash,
    actionType: params.actionType,
    token: params.token,
    tokenNew: params.tokenNew,
    tokenHashNew: params.tokenHashNew,
  });

  const isCodeFlow = params.actionType === "reauthentication";
  const body = renderEmailShell({
    actionLabel,
    body: isCodeFlow
      ? `<p>Use this code to continue:</p><div style="margin:18px 0 0;text-align:center;"><span style="display:inline-block;padding:14px 22px;border-radius:16px;background:#0f172a;color:#fff;font-size:28px;font-weight:800;letter-spacing:0.18em;">${escapeHtml(params.token)}</span></div>`
      : `<p>Use the button below to continue.</p>`,
    buttonLabel: isCodeFlow ? undefined : "Open link",
    buttonUrl: isCodeFlow ? undefined : actionUrl,
    footer: "If you did not request this email, you can safely ignore it.",
    logoUrl: DEFAULT_LOGO_URL,
  });

  await sendZeptoMailMessage({
    subject: actionLabel,
    toEmail: params.email,
    html: body.html,
    text: body.text,
  });
}
