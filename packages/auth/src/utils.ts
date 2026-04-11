/**
 * Authentication utility functions with encryption
 */
import type { UserProfile } from '@mfc/types';

const ENCRYPTION_KEY = 'mfc-profile-key-v1';

/**
 * Simple XOR encryption for profile data
 */
function encryptData(data: string, key: string): string {
    const encoder = new TextEncoder();
    const textBytes = encoder.encode(data);
    const keyBytes = encoder.encode(key);

    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
        encrypted[i] = (textBytes[i] ?? 0) ^ (keyBytes[i % keyBytes.length] ?? 0);
    }

    return btoa(String.fromCharCode(...encrypted));
}

/**
 * Simple XOR decryption for profile data
 */
function decryptData(encrypted: string, key: string): string {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key);

    const encryptedBytes = Uint8Array.from(atob(encrypted), (c) =>
        c.charCodeAt(0)
    );

    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
        decrypted[i] = (encryptedBytes[i] ?? 0) ^ (keyBytes[i % keyBytes.length] ?? 0);
    }

    return new TextDecoder().decode(decrypted);
}

/**
 * Generate checksum for data integrity
 */
async function generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cache profile to localStorage with encryption
 * Only stores minimal, non-sensitive data
 * Valid for 6 hours
 */
export async function cacheProfile(profile: UserProfile, cacheKey: string): Promise<void> {
    try {
        // Only cache minimal data needed for offline display
        const minimalCache = {
            user_id: profile.user_id,
            display_name: profile.display_name,
            user_role: profile.user_role,
            is_active: profile.is_active,
            timestamp: Date.now(),
        };

        const jsonData = JSON.stringify(minimalCache);
        const checksum = await generateChecksum(jsonData);
        const encrypted = encryptData(jsonData, ENCRYPTION_KEY);

        const secureCache = {
            data: encrypted,
            checksum,
            version: 1,
        };

        localStorage.setItem(cacheKey, JSON.stringify(secureCache));
        console.log("💾 Profile cached securely for offline use");
    } catch (error) {
        console.error('Error caching profile:', error);
    }
}

/**
 * Load profile from localStorage cache with decryption
 * Returns null if expired, invalid, or tampered
 */
export async function loadCachedProfile(cacheKey: string): Promise<UserProfile | null> {
    try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const secureCache = JSON.parse(cached);
        
        // Decrypt data
        const decrypted = decryptData(secureCache.data, ENCRYPTION_KEY);
        
        // Verify checksum
        const expectedChecksum = await generateChecksum(decrypted);
        if (expectedChecksum !== secureCache.checksum) {
            console.error('🚨 Profile checksum mismatch - possible tampering detected');
            localStorage.removeItem(cacheKey);
            return null;
        }

        const { user_id, display_name, user_role, is_active, timestamp } = JSON.parse(decrypted);

        // Check if cache is still valid (6 hours)
        const SESSION_CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
        if (Date.now() - timestamp > SESSION_CACHE_DURATION) {
            console.log("⏰ Cached profile expired (6 hours)");
            localStorage.removeItem(cacheKey);
            return null;
        }

        console.log("💾 Using cached profile (offline mode)");

        // Return cached data
        return {
            user_id,
            display_name,
            user_role,
            is_active,
        };
    } catch (error) {
        console.error('Error loading cached profile:', error);
        // Clear corrupted cache
        localStorage.removeItem(cacheKey);
        return null;
    }
}

/**
 * Validate user profile (active status and role)
 */
export function validateProfile(
    profile: UserProfile,
    allowedRoles: string[]
): boolean {
    if (!profile.is_active) {
        console.warn('User account is inactive');
        return false;
    }

    if (!allowedRoles.includes(profile.user_role)) {
        console.warn(`User role '${profile.user_role}' is not authorized`);
        return false;
    }

    return true;
}
