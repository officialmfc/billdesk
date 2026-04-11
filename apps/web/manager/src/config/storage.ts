/**
 * Storage Configuration
 * Centralized storage keys for browser-side storage
 * All keys prefixed with 'mfc_billing_' to avoid conflicts
 */

export const storageKeys = {
  // Auth session cache (sessionStorage)
  authSession: 'mfc_billing_session_cache',

  // User profile cache (sessionStorage)
  userProfile: 'mfc_billing_user_profile',

  // App settings (localStorage)
  settings: 'mfc_billing_settings',

  //theme setting
  theam: '  mfc_billdesk_theam',
  // Landing page preference (localStorage)
  landingPreference: 'mfc_billdesk_manager_landingpreference',

  // IndexedDB database name
  indexedDB: 'mfc_billdesk',

  // Add more keys as needed
  // Example: theme: 'mfc_billing_theme',
} as const

export type StorageKey = typeof storageKeys[keyof typeof storageKeys]
