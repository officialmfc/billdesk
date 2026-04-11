import type { ExpoConfig, ConfigContext } from "expo/config";

const easProjectId =
  process.env.EXPO_EAS_PROJECT_ID_USER ?? "928d8d46-3ab9-49e8-bb97-1709a6d13a4a";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MFC User",
  slug: "mfc-user",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/mfc_user_logo.png",
  userInterfaceStyle: "light",
  scheme: "mfcuser",
  splash: {
    image: "./assets/mfc_user_logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.mfc.user",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/mfc_user_logo.png",
      backgroundColor: "#ffffff",
    },
    package: "com.mfc.user",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/mfc_user_logo.png",
  },
  plugins: ["expo-router", "expo-secure-store", "expo-dev-client"],
  experiments: {
    typedRoutes: true,
  },
  owner: "mondalfishsupplier",
  extra: {
    supabaseUrl:
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    sentryDsn:
      process.env.EXPO_PUBLIC_SENTRY_DSN ??
      process.env.SENTRY_DSN,
    eas: {
      projectId: easProjectId,
    },
  },
});
