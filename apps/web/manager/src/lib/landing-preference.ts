/**
 * Landing Preference Utility
 * Manages user's preferred landing page after login
 */

import { getManagerSaleFlowDefinition } from "@mfc/manager-ui";

const LANDING_PREFERENCE_KEY = 'mfc_default_landing';
export const DEFAULT_LANDING = '/ledgers/customers/day';

/**
 * Get the user's landing preference from localStorage
 * @returns The landing page path
 */
export function getLandingPreference(): string {
    if (typeof window === 'undefined') {
        return DEFAULT_LANDING;
    }

    return localStorage.getItem(LANDING_PREFERENCE_KEY) || DEFAULT_LANDING;
}

/**
 * Set the user's landing preference in localStorage
 * @param path - The landing page path to save
 */
export function setLandingPreference(path: string): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(LANDING_PREFERENCE_KEY, path);
}

/**
 * Reset the landing preference to default
 */
export function resetLandingPreference(): void {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem(LANDING_PREFERENCE_KEY, DEFAULT_LANDING);
}

/**
 * Available landing page options
 */
export const LANDING_OPTIONS = [
    { value: DEFAULT_LANDING, label: 'Customer Ledger Day' },
    { value: '/ledgers/sellers/day', label: 'Seller Ledger Day' },
    { value: '/dashboard', label: 'Dashboard' },
    {
      value: getManagerSaleFlowDefinition('auction').desktopHref,
      label: getManagerSaleFlowDefinition('auction').entryTitle,
    },
    {
      value: getManagerSaleFlowDefinition('batch').desktopHref,
      label: getManagerSaleFlowDefinition('batch').entryTitle,
    },
    { value: '/payments', label: 'Payments' },
    { value: '/products', label: 'Products' },
    { value: '/stock', label: 'Stock' },
] as const;
