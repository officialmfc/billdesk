import type { AuthContext } from "@/lib/config";
import { getDestination } from "@/lib/config";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

type BrowserDeviceContext = {
  deviceId?: string;
  deviceLabel?: string;
};

function buildExplicitReturnToHrefWithParams(
  returnTo: string,
  params: Record<string, string>,
  next?: string
): string {
  const url = new URL(returnTo);

  if (url.protocol.startsWith("exp+") && url.hostname === "expo-development-client") {
    const nested = url.searchParams.get("url");
    if (!nested) {
      throw new Error("The mobile return URL is missing its nested callback.");
    }

    const nestedUrl = new URL(nested);
    for (const [key, value] of Object.entries(params)) {
      nestedUrl.searchParams.set(key, value);
    }
    if (next) {
      nestedUrl.searchParams.set("next", next);
    }
    url.searchParams.set("url", nestedUrl.toString());
    return url.toString();
  }

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  if (next) {
    url.searchParams.set("next", next);
  }
  return url.toString();
}

function normalizeMobileReturnToHref(context: AuthContext, returnTo: string): string {
  if (context.platform !== "mobile") {
    return returnTo;
  }

  const destination = getDestination(context);
  if (!destination) {
    return returnTo;
  }

  try {
    const url = new URL(returnTo);
    if (url.protocol.startsWith("exp+") && url.hostname === "expo-development-client") {
      return returnTo;
    }

    if (url.protocol === "http:" || url.protocol === "https:") {
      return returnTo;
    }

    const canonical = new URL(destination.value);
    canonical.search = url.search;
    canonical.hash = url.hash;
    return canonical.toString();
  } catch {
    return returnTo;
  }
}

function buildHandoffParams(handoffId: string): Record<string, string> {
  return { handoff: handoffId };
}

export function buildHandoffHref(context: AuthContext, handoffId: string): string {
  const params = buildHandoffParams(handoffId);

  if (context.returnTo) {
    return buildExplicitReturnToHrefWithParams(
      normalizeMobileReturnToHref(context, context.returnTo),
      params,
      context.next
    );
  }

  const destination = getDestination(context);

  if (!destination) {
    throw new Error("No destination is configured for this app and platform.");
  }

  if (/^https?:\/\//.test(destination.value)) {
    const url = new URL(destination.value);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
    if (context.next) {
      url.searchParams.set("next", context.next);
    }
    return url.toString();
  }

  const url = new URL(destination.value);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  if (context.next) {
    url.searchParams.set("next", context.next);
  }
  return url.toString();
}

export async function requestAuthHubHandoff(
  context: AuthContext,
  tokens: SessionTokens
): Promise<string> {
  const deviceContext = getBrowserDeviceContext();
  const response = await fetch("/api/auth/handoff", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accessToken: tokens.accessToken,
      app: context.app,
      deviceId: deviceContext.deviceId,
      deviceLabel: deviceContext.deviceLabel,
      next: context.next,
      platform: context.platform,
      refreshToken: tokens.refreshToken,
      returnTo: context.returnTo,
    }),
  });

  const responseText = await response.text();
  let payload: {
    error?: string;
    redirect_url?: string;
  } = {};

  if (responseText.trim().length > 0) {
    try {
      payload = JSON.parse(responseText) as {
        error?: string;
        redirect_url?: string;
      };
    } catch {
      payload = {
        error: responseText.slice(0, 500),
      };
    }
  }

  if (!response.ok) {
    throw new Error(
      payload.error ||
        `Could not create a session handoff (${response.status}).`,
    );
  }

  if (!payload.redirect_url) {
    throw new Error("The handoff response was incomplete.");
  }

  return payload.redirect_url;
}

function getBrowserDeviceContext(): BrowserDeviceContext {
  if (typeof window === "undefined") {
    return {};
  }

  const storageKey = "mfc-auth-device-id";
  const labelKey = "mfc-auth-device-label";

  let deviceId = window.localStorage.getItem(storageKey) || "";
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    window.localStorage.setItem(storageKey, deviceId);
  }

  let deviceLabel = window.localStorage.getItem(labelKey) || "";
  if (!deviceLabel) {
    const browserNavigator = navigator as Navigator & {
      userAgentData?: { platform?: string };
    };
    const platform =
      browserNavigator.userAgentData?.platform ||
      browserNavigator.platform ||
      "Browser";
    deviceLabel = `${platform} browser`;
    window.localStorage.setItem(labelKey, deviceLabel);
  }

  return {
    deviceId,
    deviceLabel,
  };
}
