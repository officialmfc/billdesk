/**
 * Cache Manager
 * 
 * Provides in-memory caching with TTL support for query results.
 * Helps reduce database queries and improve performance.
 */

import type { CacheEntry, ICacheManager } from './types';

const DEFAULT_TTL = 30000; // 30 seconds

export class CacheManager implements ICacheManager {
    private cache: Map<string, CacheEntry<any>>;
    private version: number;

    constructor() {
        this.cache = new Map();
        this.version = 1;
    }

    /**
     * Get cached data by key
     * Returns null if not found or expired
     */
    async get<T>(key: string): Promise<T | null> {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Check version mismatch
        if (entry.version !== this.version) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cached data with optional TTL
     * @param key Cache key
     * @param data Data to cache
     * @param ttl Time to live in milliseconds (default: 30s)
     */
    async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
        const entry: CacheEntry<T> = {
            key,
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + ttl,
            version: this.version,
        };

        this.cache.set(key, entry);
    }

    /**
     * Invalidate cache entries matching a pattern
     * Supports wildcards: 'products:*' invalidates all product caches
     */
    async invalidate(pattern: string): Promise<void> {
        const regex = new RegExp(
            '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        );

        const keysToDelete: string[] = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
    }

    /**
     * Clear all cache entries
     */
    async clear(): Promise<void> {
        this.cache.clear();
    }

    /**
     * Increment cache version to invalidate all entries
     * More efficient than clearing when you want to invalidate everything
     */
    incrementVersion(): void {
        this.version++;
    }

    /**
     * Get cache statistics
     */
    getStats(): {
        size: number;
        version: number;
        entries: Array<{ key: string; expiresIn: number }>;
    } {
        const now = Date.now();
        const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
            key,
            expiresIn: Math.max(0, entry.expiresAt - now),
        }));

        return {
            size: this.cache.size,
            version: this.version,
            entries,
        };
    }

    /**
     * Clean up expired entries
     * Call periodically to prevent memory leaks
     */
    cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
    }
}

/**
 * Generate cache key from table and options
 */
export function generateCacheKey(
    table: string,
    options?: Record<string, any>
): string {
    if (!options || Object.keys(options).length === 0) {
        return `${table}:all`;
    }

    // Sort keys for consistent cache keys
    const sortedOptions = Object.keys(options)
        .sort()
        .reduce((acc, key) => {
            acc[key] = options[key];
            return acc;
        }, {} as Record<string, any>);

    const optionsStr = JSON.stringify(sortedOptions);
    return `${table}:${optionsStr}`;
}
