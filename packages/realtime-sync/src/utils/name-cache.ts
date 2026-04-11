/**
 * Name Cache
 * Caches user and product names to avoid redundant database queries
 */

export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    expiresAt: number;
}

export interface NameCacheOptions {
    /**
     * Time-to-live in milliseconds
     * @default 300000 (5 minutes)
     */
    ttl?: number;

    /**
     * Maximum cache size (number of entries)
     * @default 1000
     */
    maxSize?: number;
}

export class NameCache {
    private cache: Map<string, CacheEntry<string>>;
    private ttl: number;
    private maxSize: number;

    constructor(options: NameCacheOptions = {}) {
        this.cache = new Map();
        this.ttl = options.ttl ?? 300000; // 5 minutes default
        this.maxSize = options.maxSize ?? 1000;
    }

    /**
     * Get a value from the cache
     * @param key - Cache key
     * @returns Cached value or undefined if not found or expired
     */
    get(key: string): string | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    /**
     * Set a value in the cache
     * @param key - Cache key
     * @param value - Value to cache
     */
    set(key: string, value: string): void {
        // Check if cache is full
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            // Remove oldest entry (first entry in Map)
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        const now = Date.now();
        this.cache.set(key, {
            value,
            timestamp: now,
            expiresAt: now + this.ttl,
        });
    }

    /**
     * Check if a key exists in the cache and is not expired
     * @param key - Cache key
     * @returns True if key exists and is not expired
     */
    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    /**
     * Delete a specific key from the cache
     * @param key - Cache key
     */
    delete(key: string): void {
        this.cache.delete(key);
    }

    /**
     * Clear all entries from the cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache size
     * @returns Number of entries in cache
     */
    size(): number {
        return this.cache.size;
    }

    /**
     * Remove expired entries from the cache
     * @returns Number of entries removed
     */
    cleanup(): number {
        const now = Date.now();
        let removed = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
                removed++;
            }
        }

        return removed;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        maxSize: number;
        ttl: number;
        oldestEntry: number | null;
        newestEntry: number | null;
    } {
        let oldestTimestamp: number | null = null;
        let newestTimestamp: number | null = null;

        for (const entry of this.cache.values()) {
            if (oldestTimestamp === null || entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
            }
            if (newestTimestamp === null || entry.timestamp > newestTimestamp) {
                newestTimestamp = entry.timestamp;
            }
        }

        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl,
            oldestEntry: oldestTimestamp,
            newestEntry: newestTimestamp,
        };
    }
}

/**
 * Create a name cache with default options
 */
export function createNameCache(options?: NameCacheOptions): NameCache {
    return new NameCache(options);
}

/**
 * Helper function to generate cache keys
 */
export const CacheKeys = {
    /**
     * Generate cache key for user name
     */
    userName: (userId: string) => `user:${userId}:name`,

    /**
     * Generate cache key for product name
     */
    productName: (productId: string) => `product:${productId}:name`,

    /**
     * Generate cache key for staff name
     */
    staffName: (staffId: string) => `staff:${staffId}:name`,

    /**
     * Generate cache key for supplier name
     */
    supplierName: (supplierId: string) => `supplier:${supplierId}:name`,

    /**
     * Generate cache key for buyer name
     */
    buyerName: (buyerId: string) => `buyer:${buyerId}:name`,

    /**
     * Generate cache key for seller name
     */
    sellerName: (sellerId: string) => `seller:${sellerId}:name`,
};
