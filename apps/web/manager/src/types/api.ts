import type { UserProfile } from "./table"

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Login credentials
export interface LoginCredentials {
  email: string
  password: string
}

// Cached profile with timestamp for offline support
export interface CachedProfile {
  profile: UserProfile
  timestamp: number
}
