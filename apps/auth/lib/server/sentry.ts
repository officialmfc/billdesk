type SentryDsnParts = {
  host: string;
  pathPrefix: string;
  projectId: string;
  protocol: string;
  publicKey: string;
};

type AuthHubSentryPayload = {
  activeEnvironment?: string;
  app?: string;
  context?: unknown;
  errorClass?: string;
  errorMessage?: string;
  errorName?: string;
  errorType?: string;
  message?: string;
  stack?: string;
};

function parseSentryDsn(dsn: string): SentryDsnParts | null {
  try {
    const url = new URL(dsn);
    const segments = url.pathname.split("/").filter(Boolean);
    const projectId = segments.pop();
    const publicKey = url.username;

    if (!projectId || !publicKey) {
      return null;
    }

    return {
      host: url.host,
      pathPrefix: segments.length ? `/${segments.join("/")}` : "",
      projectId,
      protocol: url.protocol,
      publicKey,
    };
  } catch {
    return null;
  }
}

function createEventId(): string {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export async function captureAuthHubSentryError(
  dsn: string | null | undefined,
  payload: AuthHubSentryPayload
): Promise<void> {
  const trimmed = dsn?.trim();
  if (!trimmed) {
    return;
  }

  const parsed = parseSentryDsn(trimmed);
  if (!parsed) {
    return;
  }

  const eventId = createEventId();
  const endpoint =
    `${parsed.protocol}//${parsed.host}${parsed.pathPrefix}/api/${parsed.projectId}/envelope/` +
    `?sentry_key=${encodeURIComponent(parsed.publicKey)}` +
    `&sentry_version=7&sentry_client=${encodeURIComponent("mfc-auth-worker/1.0")}`;

  const event = {
    event_id: eventId,
    environment: payload.activeEnvironment || "workers",
    extra: {
      authHub: payload,
    },
    level: "error",
    message: payload.errorMessage || payload.message || "Auth hub error",
    platform: "javascript",
    tags: {
      app: payload.app || "auth-hub",
      errorType: payload.errorType || "unknown",
    },
    timestamp: Date.now() / 1000,
    exception: {
      values: [
        {
          type: payload.errorName || payload.errorClass || payload.errorType || "Error",
          value: payload.errorMessage || payload.message || "Auth hub error",
          stacktrace: payload.stack
            ? {
                frames: [
                  {
                    filename: "auth-hub",
                    function: "captureAuthHubError",
                    in_app: true,
                  },
                ],
              }
            : undefined,
        },
      ],
    },
  };

  const envelope =
    `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n` +
    `${JSON.stringify({ type: "event" })}\n` +
    `${JSON.stringify(event)}\n`;

  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
    },
    body: envelope,
  }).catch(() => undefined);
}
