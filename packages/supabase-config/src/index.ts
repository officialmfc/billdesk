/**
 * @mfc/supabase-config - Supabase client configuration
 * 
 * This package provides Supabase client creation functions and
 * authentication configuration for the MFC BillDesk monorepo.
 */

export { createClient } from './client';
export { createClient as createServerClient } from './server';
export { authConfig, type AllowedRole } from './config';
