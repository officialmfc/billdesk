/**
 * @mfc/types - Shared TypeScript types for MFC BillDesk
 *
 * This package provides all shared type definitions used across
 * the monorepo, including database tables, auth, sync, and API types.
 */

// Database types
export type {
    Admin, BusinessCollection, BusinessSell, Chalan, ChalanPaid, Collection, ISODate, Nullable, Numeric, Purchase, TimestampTZ, UUID, User, UserRole, VendorCollection, VendorSell
} from './database';

// Auth types
export type {
    AuthConfig, CachedProfile, LoginCredentials, UserProfile
} from './auth';

// Sync types
export type {
    AppSettings, SyncMetadata,
    SyncSettings
} from './sync';

// API types
export type { ApiResponse } from './api';
