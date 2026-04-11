export type AppKey = "manager" | "admin" | "user";
export type DeviceKey = "desktop" | "mobile";
export type PlatformKey = "android" | "ios" | "macos" | "windows";

export type PlatformOption = {
  key: PlatformKey;
  title: string;
  label: string;
  description: string;
  artifactLabel: string;
  badge: string;
  fallbackWebsite?: string;
};

export type ReleaseEntry = {
  app?: string;
  platform?: string;
  device?: string;
  version?: string;
  sha?: string;
  tag?: string;
  website?: {
    url?: string;
  };
  artifact?: {
    url?: string;
  };
};

export type ReleaseRegistry = {
  latest?: Partial<Record<AppKey, ReleaseEntry>>;
  apps?: Partial<Record<AppKey, ReleaseEntry | ReleaseEntry[] | Record<string, ReleaseEntry>>>;
};

export const registryUrl = "https://releases.mondalfishcenter.com/releases/registry.json";
export const logoSources = [
  "https://releases.mondalfishcenter.com/public/logo/logo.svg",
  "https://releases.mondalfishcenter.com/public/logo/logo.png",
  "https://releases.mondalfishcenter.com/public/logo/logo.jpg",
];

export const appCatalog: Record<
  AppKey,
  {
    key: AppKey;
    title: string;
    slug: string;
    device: DeviceKey;
    route: string;
    badge: string;
    description: string;
    website: string;
    platforms: PlatformOption[];
  }
> = {
  manager: {
    key: "manager",
    title: "Manager",
    slug: "manager",
    device: "desktop",
    route: "/manager/desktop",
    badge: "Web + Desktop",
    description: "Operations, users, quotes, payments, and workflow control.",
    website: "https://manager.bill.mondalfishcenter.com",
    platforms: [
      {
        key: "macos",
        title: "macOS",
        label: "macOS",
        description: "Native desktop build for Mac users.",
        artifactLabel: "Download macOS",
        badge: "Desktop",
      },
      {
        key: "windows",
        title: "Windows",
        label: "Windows",
        description: "Native desktop build for Windows users.",
        artifactLabel: "Download Windows",
        badge: "Desktop",
      },
    ],
  },
  admin: {
    key: "admin",
    title: "Admin",
    slug: "admin",
    device: "mobile",
    route: "/admin/mobile",
    badge: "Mobile",
    description: "Admin mobile access for approvals, account checks, and daily operations.",
    website: "https://auth.mondalfishcenter.com/login?app=admin&platform=mobile",
    platforms: [
      {
        key: "android",
        title: "Android",
        label: "Android",
        description: "Android build for phones and tablets.",
        artifactLabel: "Download Android",
        badge: "Mobile",
      },
      {
        key: "ios",
        title: "iOS",
        label: "iPhone / iPad",
        description: "iPhone and iPad build for Apple devices.",
        artifactLabel: "Download iOS",
        badge: "Mobile",
      },
    ],
  },
  user: {
    key: "user",
    title: "User",
    slug: "user",
    device: "mobile",
    route: "/user/mobile",
    badge: "Mobile",
    description: "Buyer and vendor access for bills, orders, statements, and notifications.",
    website: "https://auth.mondalfishcenter.com/login?app=user&platform=mobile",
    platforms: [
      {
        key: "android",
        title: "Android",
        label: "Android",
        description: "Android build for phones and tablets.",
        artifactLabel: "Download Android",
        badge: "Mobile",
      },
      {
        key: "ios",
        title: "iPhone / iPad",
        label: "iPhone / iPad",
        description: "iPhone and iPad build for Apple devices.",
        artifactLabel: "Download iOS",
        badge: "Mobile",
      },
    ],
  },
};

export function releaseTitle(app: AppKey, device: DeviceKey) {
  return `${appCatalog[app].title} ${device === "desktop" ? "Desktop" : "Mobile"}`;
}

export function platformTitle(app: AppKey, platform: PlatformKey) {
  const option = appCatalog[app].platforms.find((item) => item.key === platform);
  if (option) {
    return `${appCatalog[app].title} ${option.title}`;
  }

  return releaseTitle(app, appCatalog[app].device);
}

export function fallbackWebsite(app: AppKey) {
  return appCatalog[app].website;
}

export function findReleaseEntry(value: unknown): ReleaseEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (let index = value.length - 1; index >= 0; index -= 1) {
      const nested = findReleaseEntry(value[index]);
      if (nested) {
        return nested;
      }
    }

    return null;
  }

  const candidate = value as Record<string, unknown>;
  if (candidate.artifact || candidate.version) {
    return value as ReleaseEntry;
  }

  for (const nested of Object.values(candidate)) {
    const entry = findReleaseEntry(nested);
    if (entry) {
      return entry;
    }
  }

  return null;
}

export function resolveReleaseEntry(registry: ReleaseRegistry | null | undefined, app: AppKey) {
  const latestEntry = findReleaseEntry(registry?.latest?.[app]);
  if (latestEntry) {
    return latestEntry;
  }

  const appEntry = findReleaseEntry(registry?.apps?.[app]);
  if (appEntry) {
    return appEntry;
  }

  return null;
}

export function resolveWebsiteUrl(app: AppKey, entry?: ReleaseEntry | null) {
  return (
    entry?.website?.url ||
    (entry as { website_url?: string; websiteUrl?: string; app_url?: string; appUrl?: string } | null)?.website_url ||
    (entry as { website_url?: string; websiteUrl?: string; app_url?: string; appUrl?: string } | null)?.websiteUrl ||
    (entry as { website_url?: string; websiteUrl?: string; app_url?: string; appUrl?: string } | null)?.app_url ||
    (entry as { website_url?: string; websiteUrl?: string; app_url?: string; appUrl?: string } | null)?.appUrl ||
    fallbackWebsite(app)
  );
}

export function resolveDownloadUrl(entry?: ReleaseEntry | null) {
  return (
    entry?.artifact?.url ||
    (entry as { artifact_url?: string; download_url?: string; downloadUrl?: string; url?: string } | null)?.artifact_url ||
    (entry as { artifact_url?: string; download_url?: string; downloadUrl?: string; url?: string } | null)?.download_url ||
    (entry as { artifact_url?: string; download_url?: string; downloadUrl?: string; url?: string } | null)?.downloadUrl ||
    (entry as { artifact_url?: string; download_url?: string; downloadUrl?: string; url?: string } | null)?.url ||
    ""
  );
}
