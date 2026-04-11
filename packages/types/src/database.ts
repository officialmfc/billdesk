/**
 * Database table type definitions
 */

// Custom types
export type UUID = string;

// Shared primitives
export type Numeric = string; // keep as string to avoid precision loss
export type ISODate = string; // e.g., '2025-10-23'
export type TimestampTZ = string; // ISO timestamp string
export type Nullable<T> = T | null;

// Database enums
export type UserRole = 'user' | 'business';

// Admin table structure
export interface Admin {
    id: string;
    auth_user_id: string;
    first_name: string | null;
    last_name: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    admin_role: 'admin' | 'manager';
}

// User/Customer table structure
export interface User {
    id: string;
    auth_user_id: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    business_name: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user_role: UserRole;
    full_name: string | null; // Generated column
    address_line1: string | null;
    address_line2: string | null;
    landmark: string | null;
    city: string | null;
    district: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
    is_deleted?: boolean;
}

// Chalan table structure
export interface Chalan {
    id: string;
    chalan_number: number;
    seller_id: string;
    date: string;
    commission_percentage: number;
    total_amount: number;
    commission_amount: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    notes?: string | null;
    is_deleted?: boolean;
}

// Vendor Sell table structure
export interface VendorSell {
    id: string;
    chalan_id: string;
    sl_no: number;
    product_description: string | null;
    buyer_id: string | null;
    buyer_name: string | null;
    weight: number;
    rate: number;
    amount: number;
    date: string; // YYYY-MM-DD format
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
}

// Vendor Collection table structure
export interface VendorCollection {
    id: string;
    user_id: string;
    collected_by: string;
    collected_by_name?: string;
    amount: number;
    collection_date: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
}

// Business Sell table structure
export interface BusinessSell {
    id: string;
    buyer_id: string;
    buyer_name: string | null;
    date: string;
    product_description: string | null;
    weight: number;
    rate: number;
    amount: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    chalan_id: string | null;
    sl_no: number;
    is_deleted?: boolean;
}

// Business Collection table structure
export interface BusinessCollection {
    id: string;
    user_id: string;
    collection_date: string;
    amount: number;
    collected_by: string;
    collected_by_name?: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
}

// Chalan Paid table structure
export interface ChalanPaid {
    id: string;
    chalan_id: string;
    paid_amount: number;
    paid_at: string;
    paid_by: string | null;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
}

// Union types for polymorphic relationships
export type Purchase = VendorSell | BusinessSell;
export type Collection = VendorCollection | BusinessCollection;
