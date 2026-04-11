/**
 * usePermissions Hook
 *
 * React hook for checking permissions in components
 */
'use client';

import {
    canAccessAdminRoutes,
    canCreate,
    canDelete,
    canEdit,
    canView,
    type PermissionContext,
    type UserRole,
} from '@/lib/permissions';
import { useAuth } from '@mfc/auth';
import { createClient } from '@mfc/supabase-config';
import { useEffect, useState } from 'react';

export function usePermissions() {
    const { user } = useAuth();
    const [dbRole, setDbRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchRole() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Try to get role from mfc_staff table first (Source of Truth)
                const { data, error } = await supabase
                    .rpc('get_my_staff_role');

                if (!error && data) {
                    setDbRole(data as UserRole);
                } else {
                    // Fallback to metadata if RPC fails or returns null
                    setDbRole((user.user_metadata?.role || 'user') as UserRole);
                }
            } catch (e) {
                console.error('Error fetching staff role:', e);
                setDbRole((user.user_metadata?.role || 'user') as UserRole);
            } finally {
                setLoading(false);
            }
        }

        fetchRole();
    }, [user, supabase]);

    // Use dbRole if available, otherwise fallback to metadata (or 'user')
    const effectiveRole = dbRole || (user?.user_metadata?.role as UserRole) || 'user';

    // Create permission context from user and effective role
    const context: PermissionContext | null = user
        ? {
            role: effectiveRole,
            userId: user.id,
        }
        : null;

    return {
        canEdit: context ? canEdit(context) : false,
        canCreate: context ? canCreate(context) : false,
        canDelete: context ? canDelete(context) : false,
        canView: context ? canView(context) : false,
        canAccessAdminRoutes: context ? canAccessAdminRoutes(context) : false,
        role: context?.role || null,
        userId: context?.userId || null,
        loading,
    };
}
