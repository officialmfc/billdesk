import React from "react";

type SentryInitOptions = {
  appName: string;
  dsn?: string | null;
  environment?: string | null;
  release?: string | null;
  tags?: Record<string, string | null | undefined>;
};

type ErrorUtilsLike = {
  getGlobalHandler?: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
  setGlobalHandler?: (handler: (error: unknown, isFatal?: boolean) => void) => void;
};

type NormalizedSentryConfig = {
  appName: string;
  dsn: string;
  environment: string;
  release?: string;
  tags: Record<string, string>;
};

let currentConfig: NormalizedSentryConfig | null = null;
let globalHandlerBound = false;

function createEventId(): string {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function parseSentryDsn(dsn: string) {
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

function getNormalizedConfig(options?: SentryInitOptions): NormalizedSentryConfig | null {
  const dsn = options?.dsn?.trim() || currentConfig?.dsn || "";
  if (!dsn) {
    return null;
  }

  const mergedTags = {
    ...currentConfig?.tags,
    ...options?.tags,
  };
  const tags = Object.fromEntries(
    Object.entries(mergedTags).filter(([, value]) => typeof value === "string" && value.length > 0)
  ) as Record<string, string>;

  return {
    appName: options?.appName || currentConfig?.appName || "mobile-app",
    dsn,
    environment: options?.environment?.trim() || currentConfig?.environment || "production",
    release: options?.release?.trim() || currentConfig?.release,
    tags,
  };
}

export async function captureAppException(
  error: unknown,
  context: Record<string, unknown> = {}
): Promise<void> {
  const config = getNormalizedConfig();
  if (!config) {
    return;
  }

  const parsed = parseSentryDsn(config.dsn);
  if (!parsed) {
    return;
  }

  const normalizedError =
    error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unexpected mobile error.");
  const eventId = createEventId();
  const endpoint =
    `${parsed.protocol}//${parsed.host}${parsed.pathPrefix}/api/${parsed.projectId}/envelope/` +
    `?sentry_key=${encodeURIComponent(parsed.publicKey)}` +
    `&sentry_version=7&sentry_client=${encodeURIComponent("mfc-mobile/1.0")}`;

  const event = {
    environment: config.environment,
    event_id: eventId,
    extra: {
      context,
    },
    level: "error",
    message: normalizedError.message || "Unexpected mobile error.",
    platform: "javascript",
    release: config.release,
    tags: {
      app: config.appName,
      ...config.tags,
    },
    timestamp: Date.now() / 1000,
    exception: {
      values: [
        {
          type: normalizedError.name || "Error",
          value: normalizedError.message || "Unexpected mobile error.",
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

export function initializeAppSentry(options: SentryInitOptions): void {
  const config = getNormalizedConfig(options);
  if (!config) {
    return;
  }

  currentConfig = config;

  if (globalHandlerBound) {
    return;
  }

  const errorUtils = (globalThis as unknown as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  const previousHandler = errorUtils?.getGlobalHandler?.();

  if (!errorUtils?.setGlobalHandler) {
    return;
  }

  errorUtils.setGlobalHandler((error, isFatal) => {
    void captureAppException(error, {
      isFatal: Boolean(isFatal),
      mechanism: "react-native-global-handler",
    });

    previousHandler?.(error, isFatal);
  });

  globalHandlerBound = true;
}

type AppSentryBoundaryProps = {
  children: React.ReactNode;
  context?: Record<string, unknown>;
};

export class AppSentryBoundary extends React.Component<AppSentryBoundaryProps> {
  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    void captureAppException(error, {
      componentStack: info.componentStack,
      mechanism: "react-error-boundary",
      ...this.props.context,
    });
  }

  override render(): React.ReactNode {
    return this.props.children;
  }
}
