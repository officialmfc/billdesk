/**
 * Permissions Utility
 *
 * Enforces role-based permissions throughout the application
 */

import { logger } from './logger';

export type UserRole = 'admin' | 'manager' | 'user';

export interface PermissionContext {
    role: UserRole;
    userId: string;
}

/**
 * Check if user can edit records
 * Managers can edit specific resources (handled in components), but generally restricted.
 * Admin has full edit access.
 */
export function canEdit(context: PermissionContext): boolean {
    return context.role === 'admin' || context.role === 'manager';
}

/**
 * Check if user can create records
 * All authenticated users can create
 */
export function canCreate(context: PermissionContext): boolean {
    return true; // All roles can create
}

/**
 * Check if user can delete records
 * Only admin can delete
 */
export function canDelete(context: PermissionContext): boolean {
    return context.role === 'admin';
}

/**
 * Check if user can view records
 * All authenticated users can view
 */
export function canView(context: PermissionContext): boolean {
    return true; // All roles can view
}

/**
 * Check if user can access admin routes
 * Only admin can access admin-specific routes
 */
export function canAccessAdminRoutes(context: PermissionContext): boolean {
    return context.role === 'admin';
}

/**
 * Get permission error message
 */
export function getPermissionErrorMessage(action: string, role: UserRole): string {
    if (role === 'manager') {
        return `Managers cannot ${action}. You can only view and create records.`;
    }

    return `You don't have permission to ${action}.`;
}

/**
 * Log unauthorized access attempt
 */
export function logUnauthorizedAccess(
    context: PermissionContext,
    action: string,
    resource: string
): void {
    const logData = {
        userId: context.userId,
        role: context.role,
        action,
        resource,
        timestamp: new Date().toISOString(),
    };

    logger.warn(logData, '[Permissions] Unauthorized access attempt');

    // Send to LogRocket in production
    if (process.env.NODE_ENV === 'production') {
        try {
            // Dynamic import to avoid issues in development
            import('@/lib/logrocket').then(({ trackEvent }) => {
                trackEvent('unauthorized_access', logData);
            });
        } catch (error) {
            logger.error(error, '[Permissions] Failed to log to LogRocket');
        }
    }
}

/**
 * Check permissions and throw error if not allowed
 */
export function requirePermission(
    context: PermissionContext,
    permission: 'edit' | 'delete' | 'create' | 'view' | 'adminRoutes',
    resource?: string
): void {
    let hasPermission = false;
    let action: string = permission;

    switch (permission) {
        case 'edit':
            hasPermission = canEdit(context);
            break;
        case 'delete':
            hasPermission = canDelete(context);
            break;
        case 'create':
            hasPermission = canCreate(context);
            break;
        case 'view':
            hasPermission = canView(context);
            break;
        case 'adminRoutes':
            hasPermission = canAccessAdminRoutes(context);
            action = 'access admin routes';
            break;
    }

    if (!hasPermission) {
        logUnauthorizedAccess(context, action, resource || 'unknown');
        throw new Error(getPermissionErrorMessage(action, context.role));
    }
}
