import { useLiveQuery as dexieUseLiveQuery } from 'dexie-react-hooks';
import { db } from '@mfc/database';

/**
 * Hook to reactively query IndexedDB
 * Automatically re-renders when data changes
 * 
 * @example
 * const users = useLiveQuery(() => db.users.toArray(), []);
 * const user = useLiveQuery(() => db.users.get(userId), [userId]);
 */
export { dexieUseLiveQuery as useLiveQuery };

/**
 * Hook to get all users reactively
 */
export function useUsers() {
    return dexieUseLiveQuery(() => db.users.toArray(), []);
}

/**
 * Hook to get a single user reactively
 */
export function useUser(userId: string | undefined) {
    return dexieUseLiveQuery(
        () => (userId ? db.users.get(userId) : undefined),
        [userId]
    );
}

/**
 * Hook to get all chalans reactively
 */
export function useChalans() {
    return dexieUseLiveQuery(() => db.chalans.toArray(), []);
}

/**
 * Hook to get vendor sells reactively
 */
export function useVendorSells() {
    return dexieUseLiveQuery(() => db.sale_transactions.toArray(), []);
}

/**
 * Hook to get vendor collections reactively
 */
export function useVendorCollections() {
    return dexieUseLiveQuery(() => db.customer_payments.toArray(), []);
}

/**
 * Hook to get business sells reactively
 */
export function useBusinessSells() {
    return dexieUseLiveQuery(() => db.daily_bills.toArray(), []);
}

/**
 * Hook to get business collections reactively
 */
export function useBusinessCollections() {
    return dexieUseLiveQuery(() => db.seller_payments.toArray(), []);
}
