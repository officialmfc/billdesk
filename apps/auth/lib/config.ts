export type AppSlug = "manager" | "admin" | "user";
export type Platform = "web" | "desktop" | "mobile";

export type AuthContext = {
  app: AppSlug;
  platform: Platform;
  next?: string;
  returnTo?: string;
};

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
  process.env.TURNSTILE_SITE_KEY?.trim() ||
  null;

type SearchParamReader = {
  get: (name: string) => string | null;
};

type Destination = {
  label: string;
  value: string;
};

const MANAGER_WEB_URL =
  process.env.NEXT_PUBLIC_MANAGER_WEB_URL?.trim() ||
  "https://manager.bill.mondalfishcenter.com";

const DESTINATIONS: Record<AppSlug, Partial<Record<Platform, Destination>>> = {
  manager: {
    web: {
      label: "Manager Web",
      value: `${MANAGER_WEB_URL.replace(/\/+$/, "")}/auth/callback/`,
    },
    desktop: {
      label: "Manager Desktop",
      value: `${MANAGER_WEB_URL.replace(/\/+$/, "")}/auth/desktop-callback/`,
    },
    mobile: {
      label: "Manager Mobile",
      value: "mfcmanager://oauth-callback",
    },
  },
  admin: {
    mobile: {
      label: "Admin Mobile",
      value: "mfcadmin://oauth-callback",
    },
  },
  user: {
    mobile: {
      label: "User Mobile",
      value: "mfcuser://oauth-callback",
    },
  },
};

export function isAppSlug(value: string | null): value is AppSlug {
  return value === "manager" || value === "admin" || value === "user";
}

export function isPlatform(value: string | null): value is Platform {
  return value === "web" || value === "desktop" || value === "mobile";
}

export function sanitizeNextPath(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed || !trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return undefined;
  }

  return trimmed;
}

function isOauthCallbackPath(pathname: string): boolean {
  return /\/(?:--\/)?oauth-callback\/?$/i.test(pathname);
}

function isAllowedMobileReturnTo(app: AppSlug, value: string): boolean {
  const scheme = app === "manager" ? "mfcmanager" : app === "admin" ? "mfcadmin" : "mfcuser";

  try {
    const url = new URL(value);

    if (url.protocol === `${scheme}:`) {
      const callbackPath = `${url.hostname}${url.pathname}`.replace(/^\/+/, "");
      return callbackPath === "oauth-callback" || callbackPath === "oauth-callback/";
    }

    if (url.protocol === `exp+${scheme}:` && url.hostname === "expo-development-client") {
      const nested = url.searchParams.get("url");
      return nested ? isAllowedMobileReturnTo(app, nested) : false;
    }

    if (/^https?:$/.test(url.protocol)) {
      return isOauthCallbackPath(url.pathname);
    }
  } catch {
    return false;
  }

  return false;
}

export function sanitizeReturnTo(
  app: AppSlug,
  platform: Platform,
  value: string | null
): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (platform !== "mobile") {
    return undefined;
  }

  return isAllowedMobileReturnTo(app, trimmed) ? trimmed : undefined;
}

export function readContext(params: SearchParamReader): AuthContext | null {
  const app = params.get("app");
  const platform = params.get("platform");

  if (!isAppSlug(app) || !isPlatform(platform)) {
    return null;
  }

  return {
    app,
    platform,
    next: sanitizeNextPath(params.get("next")),
    returnTo: sanitizeReturnTo(app, platform, params.get("return_to")),
  };
}

export function buildContextQuery(context: AuthContext): string {
  const params = new URLSearchParams({
    app: context.app,
    platform: context.platform,
  });

  if (context.next) {
    params.set("next", context.next);
  }

  if (context.returnTo) {
    params.set("return_to", context.returnTo);
  }

  return params.toString();
}

export function buildInternalHref(path: string, context: AuthContext): string {
  const query = buildContextQuery(context);
  return query ? `${path}?${query}` : path;
}

export function getDestination(context: AuthContext): Destination | null {
  return DESTINATIONS[context.app][context.platform] ?? null;
}

export function getContextLabel(context: AuthContext): string {
  return getDestination(context)?.label ?? "Requested app";
}

export function getRequiredAccountLabel(context: AuthContext): string {
  switch (context.app) {
    case "admin":
      return "Admin accounts only";
    case "manager":
      return "Manager accounts only";
    case "user":
      return "User accounts only";
  }
}

export function allowSelfSignup(context: AuthContext): boolean {
  return context.app === "user";
}
