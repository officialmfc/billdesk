/**
 * Type definitions for MFC Sales & Billing
 */

//Custom types
export type UUID = string;

// Shared primitives
export type Numeric = string;            // keep as string to avoid precision loss
export type ISODate = string;            // e.g., '2025-10-23'
export type TimestampTZ = string;        // ISO timestamp string
export type Nullable<T> = T | null;

// Database enums
export type UserRole = 'user' | 'business';

export interface UserProfile {
  user_id: string
  user_role: 'admin' | 'manager' | UserRole
  is_active: boolean
  display_name: string
}

export interface ProfileTable {
  id: string
  full_name: string
  email: string
  phone: string
  user_id: string // Maps to id in users table
  user_role: UserRole // Can be user or business
  gstin?: string
  profile_photo_url?: string
  created_at: string
  updated_at: string
}

// Admin table structure
export interface Admin {
  id: string
  auth_user_id: string
  first_name: string | null
  last_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  admin_role: 'admin' | 'manager'
}

// User/Customer table structure
export interface User {
  id: string
  auth_user_id: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  business_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  user_role: UserRole
  full_name: string | null // Generated column
  address_line1: string | null
  address_line2: string | null
  landmark: string | null
  city: string | null
  district: string | null
  state: string | null
  pincode: string | null
  country: string | null
}


