import { ExpoConfig, ConfigContext } from 'expo/config';

const easProjectId =
  process.env.EXPO_EAS_PROJECT_ID_MANAGER ?? "9a6cd3fc-8163-4d5d-9fa5-f226556bff07";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'MFC Manager',
  slug: 'mfc-manager',
  version: '1.0.0',
  orientation: 'portrait',
  icon: '../../../assets/mfc_manager_logo.png',
  userInterfaceStyle: 'light',
  scheme: 'mfcmanager',
  splash: {
    image: '../../../assets/mfc_manager_logo.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.mfc.manager',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: '../../../assets/mfc_manager_logo.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.mfc.manager'
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: '../../../assets/mfc_manager_logo.png'
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-local-authentication',
      {
        faceIDPermission: 'Allow MFC Manager to use Face ID for quick unlock.'
      }
    ],
    "expo-dev-client",
  ],
  experiments: {
    typedRoutes: true
  },

  "owner": "mondalfishsupplier",

  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    powersyncUrl: process.env.EXPO_PUBLIC_POWERSYNC_URL,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
    eas: {
      "projectId": easProjectId
    }
  }
});
