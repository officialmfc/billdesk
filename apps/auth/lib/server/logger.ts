import { getAuthHubEnv } from "@/lib/server/cloudflare";
import { captureAuthHubSentryError } from "@/lib/server/sentry";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mlgovbek";

function truncate(value: string, maxLength = 5000): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function inferActiveEnvironment(env: Awaited<ReturnType<typeof getAuthHubEnv>>): string {
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

function describeError(error: unknown): {
  errorClass?: string;
  errorMessage: string;
  errorName?: string;
  errorType: string;
  zeptoMailApiUrl?: string;
  zeptoMailFromEmail?: string;
  zeptoMailFromName?: string;
  zeptoMailResponseBody?: string;
  zeptoMailResponseHeaders?: Record<string, string>;
  zeptoMailStatus?: number;
  zeptoMailStatusText?: string;
  zeptoMailTemplateKey?: string;
  handoffAuthUserId?: string;
  handoffApp?: string;
  handoffPlatform?: string;
  handoffStage?: string;
  stack?: string;
} {
  if (error instanceof Error) {
    const anyError = error as Error & {
      handoffAuthUserId?: string;
      handoffApp?: string;
      handoffPlatform?: string;
      handoffStage?: string;
      zeptoMailApiUrl?: string;
      zeptoMailFromEmail?: string;
      zeptoMailFromName?: string;
      zeptoMailResponseBody?: string;
      zeptoMailResponseHeaders?: Record<string, string>;
      zeptoMailStatus?: number;
      zeptoMailStatusText?: string;
      zeptoMailTemplateKey?: string;
    };

    return {
      errorClass: anyError.constructor?.name,
      errorMessage: anyError.message || "Unknown error",
      errorName: anyError.name,
      errorType: "Error",
      zeptoMailApiUrl: anyError.zeptoMailApiUrl,
      zeptoMailFromEmail: anyError.zeptoMailFromEmail,
      zeptoMailFromName: anyError.zeptoMailFromName,
      zeptoMailResponseBody: anyError.zeptoMailResponseBody,
      zeptoMailResponseHeaders: anyError.zeptoMailResponseHeaders,
      zeptoMailStatus: anyError.zeptoMailStatus,
      zeptoMailStatusText: anyError.zeptoMailStatusText,
      zeptoMailTemplateKey: anyError.zeptoMailTemplateKey,
      handoffAuthUserId: anyError.handoffAuthUserId,
      handoffApp: anyError.handoffApp,
      handoffPlatform: anyError.handoffPlatform,
      handoffStage: anyError.handoffStage,
      stack: anyError.stack ? truncate(anyError.stack, 15000) : undefined,
    };
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof record.error === "string"
          ? record.error
          : "Unknown error";

    return {
      errorClass: typeof record.constructor?.name === "string" ? record.constructor.name : undefined,
      errorMessage: message,
      errorName: typeof record.name === "string" ? record.name : undefined,
      errorType: "object",
      zeptoMailApiUrl: typeof record.zeptoMailApiUrl === "string" ? record.zeptoMailApiUrl : undefined,
      zeptoMailFromEmail:
        typeof record.zeptoMailFromEmail === "string" ? record.zeptoMailFromEmail : undefined,
      zeptoMailFromName:
        typeof record.zeptoMailFromName === "string" ? record.zeptoMailFromName : undefined,
      zeptoMailResponseBody:
        typeof record.zeptoMailResponseBody === "string" ? record.zeptoMailResponseBody : undefined,
      zeptoMailResponseHeaders:
        record.zeptoMailResponseHeaders && typeof record.zeptoMailResponseHeaders === "object"
          ? (record.zeptoMailResponseHeaders as Record<string, string>)
          : undefined,
      zeptoMailStatus:
        typeof record.zeptoMailStatus === "number" ? record.zeptoMailStatus : undefined,
      zeptoMailStatusText:
        typeof record.zeptoMailStatusText === "string" ? record.zeptoMailStatusText : undefined,
      zeptoMailTemplateKey:
        typeof record.zeptoMailTemplateKey === "string" ? record.zeptoMailTemplateKey : undefined,
      handoffAuthUserId: typeof record.handoffAuthUserId === "string" ? record.handoffAuthUserId : undefined,
      handoffApp: typeof record.handoffApp === "string" ? record.handoffApp : undefined,
      handoffPlatform:
        typeof record.handoffPlatform === "string" ? record.handoffPlatform : undefined,
      handoffStage: typeof record.handoffStage === "string" ? record.handoffStage : undefined,
    };
  }

  return {
    errorMessage: typeof error === "string" ? error : "Unknown error",
    errorType: typeof error,
  };
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (depth > 8) {
    return "[MAX_DEPTH]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (value && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      const lowered = key.toLowerCase();
      if (
        lowered.includes("password") ||
        lowered.includes("token") ||
        lowered.includes("authorization") ||
        lowered.includes("cookie")
      ) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeValue(nestedValue, depth + 1);
      }
    }
    return sanitized;
  }

  return value;
}

function buildLogPayload(
  error: unknown,
  context: Record<string, unknown>,
  runtimeEnv?: Partial<Awaited<ReturnType<typeof getAuthHubEnv>>>
) {
  const env = runtimeEnv ?? ((globalThis?.process?.env ?? {}) as Partial<Awaited<ReturnType<typeof getAuthHubEnv>>>);
  const errorDetails = describeError(error);

  return {
    app: "auth-hub",
    activeEnvironment: inferActiveEnvironment(env as Awaited<ReturnType<typeof getAuthHubEnv>>),
    message: errorDetails.errorMessage,
    errorClass: errorDetails.errorClass,
    errorMessage: errorDetails.errorMessage,
    errorName: errorDetails.errorName,
    errorType: errorDetails.errorType,
    zeptoMailApiUrl: errorDetails.zeptoMailApiUrl,
    zeptoMailFromEmail: errorDetails.zeptoMailFromEmail,
    zeptoMailFromName: errorDetails.zeptoMailFromName,
    zeptoMailResponseBody: errorDetails.zeptoMailResponseBody,
    zeptoMailResponseHeaders: errorDetails.zeptoMailResponseHeaders,
    zeptoMailStatus: errorDetails.zeptoMailStatus,
    zeptoMailStatusText: errorDetails.zeptoMailStatusText,
    zeptoMailTemplateKey: errorDetails.zeptoMailTemplateKey,
    handoffAuthUserId: errorDetails.handoffAuthUserId,
    handoffApp: errorDetails.handoffApp,
    handoffPlatform: errorDetails.handoffPlatform,
    handoffStage: errorDetails.handoffStage,
    stack: errorDetails.stack,
    context: sanitizeValue(context),
  };
}

export async function captureAuthHubError(
  error: unknown,
  context: Record<string, unknown> = {}
): Promise<void> {
  const env = await getAuthHubEnv().catch(() => null);
  const payload = buildLogPayload(error, {
    ...context,
    workerHasD1: Boolean(env?.auth_d1_binding),
    workerHasSupabaseUrl: Boolean(
      env?.SUPABASE_URL?.trim() || env?.NEXT_PUBLIC_SUPABASE_URL?.trim()
    ),
    workerHasServiceRole: Boolean(env?.SUPABASE_SERVICE_ROLE_KEY?.trim()),
  }, env ?? undefined);

  await captureAuthHubSentryError(
    env?.SENTRY_DSN?.trim() || env?.NEXT_PUBLIC_SENTRY_DSN?.trim(),
    payload
  ).catch(() => undefined);

  const response = await fetch(FORMSPREE_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: safeStringify(payload),
  }).catch(() => null);

  if (response && !response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[AuthHub] Formspree logging failed", {
      status: response.status,
      body: truncate(text, 2000),
    });
  }
}
