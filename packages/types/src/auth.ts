/**
 * Authentication type definitions
 */

// Staff roles from mfc_staff table
export type StaffRole = 'admin' | 'manager' | 'mfc_seller';

// User roles from users table
export type UserRole = 'buyer' | 'seller';

// Combined role type for authentication
export type AuthRole = StaffRole | UserRole;

// User profile returned from get_current_manager_info() RPC function
// Works for both mfc_staff (managers/admins) and users (buyers/sellers)
export interface UserProfile {
    user_id: string; // Maps to id in mfc_staff or users table
    user_role: AuthRole; // Can be: admin, manager, mfc_seller, buyer, seller
    is_active: boolean;
    display_name: string;
}

// Auth configuration
export interface AuthConfig {
    allowedRoles: string[];
    loginPage: string;
    cacheKey: string;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Cached profile with timestamp for offline support
export interface CachedProfile {
    profile: UserProfile;
    timestamp: number;
}
