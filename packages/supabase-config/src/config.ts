/**
 * Authentication Configuration
 * Centralized config for auth-related settings
 */
import type { AuthConfig } from '@mfc/types';

export const authConfig: AuthConfig = {
    allowedRoles: ['admin', 'manager'],
    loginPage: '/auth/login',
    cacheKey: 'mfc_auth_profile',
};

export type AllowedRole = (typeof authConfig.allowedRoles)[number];
