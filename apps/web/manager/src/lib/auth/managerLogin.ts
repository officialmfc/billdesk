/**
 * Manager-Only Login Function
 * Enforces strict role-based access control for Manager App
 *
 * Security Features:
 * - Validates user credentials via Supabase Auth
 * - Fetches user role via secure RPC function
 * - Only allows 'manager' role to access
 * - Immediately signs out unauthorized users
 * - Comprehensive error handling
 */

import { logger } from '@/lib/logger';
import type { SupabaseClient } from '@supabase/supabase-js';

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
 * Manager-Only Login Function
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
    // Step 1: Authenticate with Supabase
    logger.info('🔐 Attempting authentication...');

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.error(authError, '❌ Authentication failed');

      // Return user-friendly error messages
      if (authError.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Invalid email or password. Please try again.',
        };
      }

      if (authError.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address before logging in.',
        };
      }

      return {
        success: false,
        error: authError.message || 'Authentication failed. Please try again.',
      };
    }

    if (!authData.user || !authData.session) {
      logger.error('❌ No user or session returned');
      return {
        success: false,
        error: 'Authentication failed. No user data received.',
      };
    }

    logger.info('✅ Authentication successful');

    // Step 2: Fetch user profile and role via RPC
    // get_current_manager_info() returns TABLE, so we get first result
    logger.info('🔍 Fetching user profile and role...');

    const { data: profileData, error: profileError } = await supabase
      .rpc('get_current_manager_info')
      .maybeSingle();

    if (profileError) {
      logger.error(profileError, '❌ Failed to fetch user profile');

      // Sign out the user since we can't verify their role
      await supabase.auth.signOut();

      return {
        success: false,
        error: 'Failed to fetch user profile. Please try again.',
      };
    }

    if (!profileData) {
      logger.error('❌ No profile data returned');

      // Sign out the user
      await supabase.auth.signOut();

      return {
        success: false,
        error: 'User profile not found. Please contact support.',
      };
    }

    const profile = profileData as UserProfile;
    logger.info({
      role: profile.user_role,
      isActive: profile.is_active,
      displayName: profile.display_name,
    });

    // Step 3: Check if user is active
    if (!profile.is_active) {
      logger.warn('⚠️  User account is inactive');

      // Sign out the inactive user
      await supabase.auth.signOut();

      return {
        success: false,
        error: 'Your account is inactive. Please contact an administrator.',
      };
    }

    // Step 4: CRITICAL - Enforce Manager-Only Access
    if (profile.user_role !== 'manager') {
      logger.warn({ role: profile.user_role }, '🚫 Access denied - User role is not "manager"');

      // Immediately sign out unauthorized user
      await supabase.auth.signOut();

      // Return specific error message based on role
      const roleMessages: Record<string, string> = {
        admin: 'Access Denied: This is the Manager App. Admins should use the Admin Portal.',
        mfc_seller: 'Access Denied: This is the Manager App. MFC Sellers should use the Seller Portal.',
        buyer: 'Access Denied: This is the Manager App. Buyers should use the Customer Portal.',
        seller: 'Access Denied: This is the Manager App. Sellers should use the Vendor Portal.',
      };

      const errorMessage = roleMessages[profile.user_role] ||
        'Access Denied: You are not authorized to access the Manager App.';

      return {
        success: false,
        error: errorMessage,
      };
    }

    // Step 5: Success - User is a Manager
    logger.info('✅ Manager access granted');

    return {
      success: true,
      user: {
        id: profile.user_id,
        email: authData.user.email || '',
        role: profile.user_role,
        displayName: profile.display_name,
        isActive: profile.is_active,
      },
    };

  } catch (error) {
    logger.error(error, '❌ Unexpected error during login');

    // Attempt to sign out in case of unexpected errors
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      logger.error(signOutError, 'Failed to sign out after error');
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during login.',
    };
  }
}
