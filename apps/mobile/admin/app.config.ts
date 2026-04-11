import type { ExpoConfig, ConfigContext } from "expo/config";

const easProjectId =
  process.env.EXPO_EAS_PROJECT_ID_ADMIN ??
  "f298db62-007f-435a-9f87-df56f3ec5fe6";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MFC Admin",
  slug: "mfc-admin",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/mfc_admin_logo.png",
  userInterfaceStyle: "light",
  scheme: "mfcadmin",
  splash: {
    image: "./assets/mfc_admin_logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mfc.admin",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/mfc_admin_logo.png",
      backgroundColor: "#ffffff",
    },
    package: "com.mfc.admin",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/mfc_admin_logo.png",
  },
  plugins: ["expo-router", "expo-secure-store", "expo-dev-client"],
  experiments: {
    typedRoutes: true,
  },
  owner: "mondalfishsupplier",
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
    eas: easProjectId
      ? {
          projectId: easProjectId,
        }
      : undefined,
  },
});
