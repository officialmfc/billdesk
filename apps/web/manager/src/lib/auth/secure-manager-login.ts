/**
 * 🔐 SECURE MANAGER LOGIN - Production Ready
 *
 * This function implements strict role-based authentication for the Manager App.
 * Only users with 'manager' or 'admin' role in mfc_staff table can access.
 *
 * @example
 * ```typescript
 * import { loginAsManager } from './secure-manager-login';
 *
 * const result = await loginAsManager(supabase, email, password);
 *
 * if (result.success) {
 *   console.log('Welcome', result.user.displayName);
 *   router.push('/dashboard');
 * } else {
 *   showError(result.error);
 * }
 * ```
 */

import { logger } from "@/lib/logger";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface LoginResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    role: string;
    displayName: string;
    isActive: boolean;
  };
}

export interface UserProfile {
  user_id: string;
  user_role: string;
  is_active: boolean;
  display_name: string;
}

/**
 * Secure Manager-Only Login Function
 *
 * Security Features:
 * ✅ Uses secure RPC function (bypasses RLS with SECURITY DEFINER)
 * ✅ Enforces strict manager/admin-only access
 * ✅ Validates user active status
 * ✅ Automatically signs out unauthorized users
 * ✅ Comprehensive error handling with user-friendly messages
 * ✅ Console logging for debugging
 *
 * @param supabase - Supabase client instance
 * @param email - User's email address
 * @param password - User's password
 * @returns LoginResult with success status and user data or error message
 */
export async function loginAsManager(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // ========================================
    // STEP 1: Authenticate with Supabase Auth
    // ========================================
    logger.info("🔐 Attempting authentication...");

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      logger.error(authError, "❌ Authentication failed");

      // Return user-friendly error messages
      if (authError.message.includes("Invalid login credentials")) {
        return {
          success: false,
          error: "Invalid email or password. Please try again.",
        };
      }

      if (authError.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: "Please verify your email address before logging in.",
        };
      }

      return {
        success: false,
        error: authError.message || "Authentication failed. Please try again.",
      };
    }

    if (!authData.user || !authData.session) {
      logger.error("❌ No user or session returned");
      return {
        success: false,
        error: "Authentication failed. No user data received.",
      };
    }

    logger.info("✅ Authentication successful");

    // ========================================
    // STEP 2: Fetch user profile via SECURE RPC
    // ========================================
    // CRITICAL: Use RPC function instead of direct table query
    // This bypasses RLS policies with SECURITY DEFINER privilege
    // get_current_manager_info() returns TABLE, so we get first result
    logger.info("🔍 Fetching user profile and role via RPC...");

    const { data: profileData, error: profileError } = await supabase
      .rpc("get_current_manager_info")
      .maybeSingle();

    if (profileError) {
      logger.error(profileError, "❌ Failed to fetch user profile");

      // Sign out the user since we can't verify their role
      await supabase.auth.signOut();

      return {
        success: false,
        error: "Failed to fetch user profile. Please try again.",
      };
    }

    if (!profileData) {
      logger.error("❌ No profile data returned");

      // Sign out the user
      await supabase.auth.signOut();

      return {
        success: false,
        error: "User profile not found. Please contact support.",
      };
    }

    const profile = profileData as UserProfile;
    logger.info({
      role: profile.user_role,
      isActive: profile.is_active,
      displayName: profile.display_name,
    });

    // ========================================
    // STEP 3: Validate user is active
    // ========================================
    if (!profile.is_active) {
      logger.warn("⚠️  User account is inactive");

      // Sign out the inactive user
      await supabase.auth.signOut();

      return {
        success: false,
        error: "Your account is inactive. Please contact an administrator.",
      };
    }

    // ========================================
    // STEP 4: CRITICAL - Enforce Manager/Admin-Only Access
    // ========================================
    // Only 'manager' and 'admin' roles are allowed
    // All other roles (mfc_seller, buyer, seller, etc.) are rejected
    if (profile.user_role !== "manager" && profile.user_role !== "admin") {
      logger.warn({ role: profile.user_role },
        "🚫 Access denied - User role is not manager/admin"
      );

      // Immediately sign out unauthorized user
      await supabase.auth.signOut();

      // Return specific error message based on role
      const roleMessages: Record<string, string> = {
        admin:
          "Access Denied: This is the Manager App. Admins should use the Admin Portal.",
        mfc_seller:
          "Access Denied: This is the Manager App. MFC Sellers should use the Seller Portal.",
        buyer: "Access Denied: This portal is for staff members only.",
        seller: "Access Denied: This portal is for staff members only.",
        vendor: "Access Denied: This portal is for staff members only.",
        business: "Access Denied: This portal is for staff members only.",
      };

      const errorMessage =
        roleMessages[profile.user_role] ||
        "Access Denied: You are not authorized to access the Manager App.";

      return {
        success: false,
        error: errorMessage,
      };
    }

    // ========================================
    // STEP 5: Success - User is authorized
    // ========================================
    logger.info("✅ Manager/Admin access granted");

    return {
      success: true,
      user: {
        id: profile.user_id,
        email: authData.user.email || "",
        role: profile.user_role,
        displayName: profile.display_name,
        isActive: profile.is_active,
      },
    };
  } catch (error) {
    logger.error(error, "❌ Unexpected error during login");

    // Attempt to sign out in case of unexpected errors
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      logger.error(signOutError, "Failed to sign out after error");
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
    };
  }
}

// ========================================
// USAGE EXAMPLE IN REACT COMPONENT
// ========================================

/**
 * Example usage in a Next.js login page
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useState } from 'react';
 * import { useRouter } from 'next/navigation';
 * import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
 * import { logger } from "@/lib/logger";
 * import { loginAsManager } from './secure-manager-login';
 *
 * export default function LoginPage() {
 *   const [email, setEmail] = useState('');
 *   const [password, setPassword] = useState('');
 *   const [isLoading, setIsLoading] = useState(false);
 *   const router = useRouter();
 *   const supabase = createClient();
 *
 *   const handleSubmit = async (e: React.FormEvent) => {
 *     e.preventDefault();
 *     setIsLoading(true);
 *
 *     const result = await loginAsManager(supabase, email, password);
 *
 *     if (result.success) {
 *       // Success - user is authorized
 *       console.log('Welcome', result.user.displayName);
 *
 *       // Cache session info
 *       localStorage.setItem('mfc-session-active', 'true');
 *       localStorage.setItem('mfc-last-activity', Date.now().toString());
 *
 *       // Redirect to dashboard
 *       router.push('/dashboard');
 *     } else {
 *       // Error - show message to user
 *       alert(result.error);
 *       setIsLoading(false);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         type="email"
 *         value={email}
 *         onChange={e => setEmail(e.target.value)}
 *         required
 *       />
 *       <input
 *         type="password"
 *         value={password}
 *         onChange={e => setPassword(e.target.value)}
 *         required
 *       />
 *       <button type="submit" disabled={isLoading}>
 *         {isLoading ? 'Signing in...' : 'Sign In'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */

// ========================================
// DATABASE FUNCTION REFERENCE
// ========================================

/**
 * PostgreSQL RPC Function: get_current_manager_info()
 *
 * This function is defined in public_schema_clean.sql:
 *
 * ```sql
 * CREATE FUNCTION public.get_current_manager_info()
 * RETURNS TABLE(
 *   user_id uuid,
 *   user_role text,
 *   is_active boolean,
 *   display_name text
 * )
 * LANGUAGE plpgsql
 * SECURITY DEFINER  -- Bypasses RLS!
 * AS $$
 * DECLARE v_auth_id uuid;
 * BEGIN
 *   v_auth_id := auth.uid();
 *   IF v_auth_id IS NULL THEN RETURN; END IF;
 *
 *   -- First, check if this is a staff member
 *   RETURN QUERY
 *   SELECT
 *     mfc_staff.id AS user_id,
 *     mfc_staff.role::text AS user_role,
 *     mfc_staff.is_active,
 *     mfc_staff.full_name AS display_name
 *   FROM public.mfc_staff
 *   WHERE mfc_staff.id = v_auth_id;
 *
 *   IF FOUND THEN RETURN; END IF;
 *
 *   -- Otherwise, check if this is a regular user
 *   RETURN QUERY
 *   SELECT
 *     users.id AS user_id,
 *     users.default_role AS user_role,
 *     users.is_active,
 *     COALESCE(users.name, users.business_name) AS display_name
 *   FROM public.users
 *   WHERE users.auth_user_id = v_auth_id;
 * END;
 * $$;
 * ```
 *
 * Key features:
 * - SECURITY DEFINER: Runs with owner privileges, bypassing RLS
 * - Checks mfc_staff first (for managers/admins/sellers)
 * - Falls back to users table (for buyers/sellers)
 * - Returns null if user not found in either table
 */

// ========================================
// TESTING CHECKLIST
// ========================================

/**
 * Test Cases:
 *
 * ✅ Test 1: Valid Manager Login
 *    - Email: manager@example.com
 *    - Role: manager
 *    - Expected: Success, redirect to dashboard
 *
 * ✅ Test 2: Valid Admin Login
 *    - Email: admin@example.com
 *    - Role: admin
 *    - Expected: Success, redirect to dashboard
 *
 * ❌ Test 3: MFC Seller Attempt
 *    - Email: seller@example.com
 *    - Role: mfc_seller
 *    - Expected: Error "MFC Sellers should use Seller Portal"
 *
 * ❌ Test 4: Buyer Attempt
 *    - Email: buyer@example.com
 *    - Role: buyer
 *    - Expected: Error "This portal is for staff members only"
 *
 * ❌ Test 5: Inactive Manager
 *    - Email: inactive@example.com
 *    - Role: manager, is_active: false
 *    - Expected: Error "Your account is inactive"
 *
 * ❌ Test 6: Invalid Credentials
 *    - Email: wrong@example.com
 *    - Password: wrongpassword
 *    - Expected: Error "Invalid email or password"
 */

// ========================================
// TROUBLESHOOTING
// ========================================

/**
 * Common Issues:
 *
 * 1. "Failed to fetch user profile"
 *    - Verify RPC function exists in database
 *    - Check database connection
 *    - Verify user is authenticated (session exists)
 *
 * 2. "User profile not found"
 *    - Verify user exists in mfc_staff table
 *    - Check user ID matches auth.uid()
 *    - Verify mfc_staff.id = auth user ID
 *
 * 3. "Access denied" for valid manager
 *    - Check user_role field in mfc_staff
 *    - Verify role is exactly 'manager' or 'admin'
 *    - Check for typos or extra spaces
 *
 * 4. "Account is inactive"
 *    - Check is_active flag in mfc_staff
 *    - Update: UPDATE mfc_staff SET is_active = true WHERE id = '...'
 *
 * 5. RPC function not found
 *    - Re-run database migrations: pnpm db:push
 *    - Check function exists: SELECT * FROM pg_proc WHERE proname = 'get_current_manager_info'
 */
