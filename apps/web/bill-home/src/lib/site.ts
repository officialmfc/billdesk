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
};

export const registryUrl = "https://releases.mondalfishcenter.com/releases/registry.json";
export const latestUrl = "https://releases.mondalfishcenter.com/releases/latest.json";
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
