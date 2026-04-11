// Password change service with Supabase Auth integration

import { logger } from "@/lib/logger";
import { createClient } from '@/lib/supabase/client';
import type {
    PasswordChangeRequest,
    PasswordChangeResponse,
} from '@/types/password';
import { PasswordChangeError } from '@/types/password';

/**
 * Update user password using Supabase Auth
 */
export async function updatePassword(
    request: PasswordChangeRequest
): Promise<PasswordChangeResponse> {
    try {
        const supabase = createClient();

        // First, verify the current password by attempting to sign in
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
            return {
                success: false,
                error: 'User not authenticated',
            };
        }

        // Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: request.currentPassword,
        });

        if (signInError) {
            return {
                success: false,
                error: PasswordChangeError.INVALID_CURRENT_PASSWORD,
            };
        }

        // Update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: request.newPassword,
        });

        if (updateError) {
            // Handle specific Supabase errors
            if (updateError.message.includes('rate limit')) {
                return {
                    success: false,
                    error: PasswordChangeError.RATE_LIMIT,
                };
            }

            if (updateError.message.includes('weak')) {
                return {
                    success: false,
                    error: PasswordChangeError.WEAK_PASSWORD,
                };
            }

            return {
                success: false,
                error: updateError.message || PasswordChangeError.UNKNOWN_ERROR,
            };
        }

        return {
            success: true,
            message:
                'Password changed successfully! A confirmation email has been sent.',
        };
    } catch (error) {
        logger.error(error, 'Password change error');

        if (error instanceof Error) {
            // Network errors
            if (
                error.message.includes('fetch') ||
                error.message.includes('network')
            ) {
                return {
                    success: false,
                    error: PasswordChangeError.NETWORK_ERROR,
                };
            }

            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: PasswordChangeError.UNKNOWN_ERROR,
        };
    }
}

/**
 * Check if user is authenticated
 */
export async function isUserAuthenticated(): Promise<boolean> {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return !!user;
    } catch {
        return false;
    }
}

/**
 * Get current user email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
    try {
        const supabase = createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user?.email || null;
    } catch {
        return null;
    }
}
