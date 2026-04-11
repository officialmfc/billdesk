/**
 * Authentication and Authorization Utilities
 * Based on mfc_staff table with roles: admin, manager, mfc_seller
 */

import { createClient } from '@/lib/supabase/server';

export type StaffRole = 'admin' | 'manager' | 'mfc_seller';

export interface StaffUser {
    id: string;
    full_name: string;
    role: StaffRole;
    is_active: boolean;
    is_default_admin: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Get current authenticated staff user
 */
export async function getCurrentStaff(): Promise<StaffUser | null> {
    const supabase = await createClient();

    // Get auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    // Get staff record
    const { data: staff, error: staffError } = await supabase
        .from('mfc_staff')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .single();

    if (staffError || !staff) {
        return null;
    }

    return staff as StaffUser;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: StaffRole[]): Promise<boolean> {
    const staff = await getCurrentStaff();

    if (!staff) {
        return false;
    }

    return requiredRoles.includes(staff.role);
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
    return hasRole(['admin']);
}

/**
 * Check if user is manager or admin
 */
export async function isManager(): Promise<boolean> {
    return hasRole(['admin', 'manager']);
}

/**
 * Check if user is seller
 */
export async function isSeller(): Promise<boolean> {
    return hasRole(['mfc_seller']);
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<StaffUser> {
    const staff = await getCurrentStaff();

    if (!staff) {
        throw new Error('Authentication required');
    }

    return staff;
}

/**
 * Require specific role - throws if user doesn't have role
 */
export async function requireRole(requiredRoles: StaffRole[]): Promise<StaffUser> {
    const staff = await requireAuth();

    if (!requiredRoles.includes(staff.role)) {
        throw new Error(`Unauthorized. Required roles: ${requiredRoles.join(', ')}`);
    }

    return staff;
}

/**
 * Require manager or admin access
 */
export async function requireManager(): Promise<StaffUser> {
    return requireRole(['admin', 'manager']);
}

/**
 * Require admin access
 */
export async function requireAdmin(): Promise<StaffUser> {
    return requireRole(['admin']);
}
