/**
 * Supabase Server Client
 * For use in Server Components and Server Actions
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function firstDefined(...values: Array<string | undefined>) {
    for (const value of values) {
        if (typeof value === 'string' && value.trim().length > 0) {
            return value;
        }
    }

    return undefined;
}

function normalizeSupabaseUrl(value: string | undefined) {
    if (!value) {
        return undefined;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return undefined;
    }

    if (/^https?:\/\//.test(trimmed)) {
        return trimmed;
    }

    if (/^[a-z0-9.-]+\.supabase\.co$/i.test(trimmed)) {
        return `https://${trimmed}`;
    }

    return undefined;
}

function decodeBase64Url(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padding);

    return Buffer.from(padded, 'base64').toString('utf8');
}

function inferSupabaseUrlFromAnonKey(anonKey: string | undefined) {
    if (!anonKey) {
        return undefined;
    }

    try {
        const [, payload] = anonKey.split('.');
        if (!payload) {
            return undefined;
        }

        const parsed = JSON.parse(decodeBase64Url(payload)) as { ref?: string };
        return parsed.ref ? `https://${parsed.ref}.supabase.co` : undefined;
    } catch {
        return undefined;
    }
}

function getSupabaseConfig() {
    const anonKey = firstDefined(
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        process.env.SUPABASE_ANON_KEY
    );

    const url = firstDefined(
        normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
        normalizeSupabaseUrl(process.env.EXPO_PUBLIC_SUPABASE_URL),
        normalizeSupabaseUrl(process.env.SUPABASE_URL),
        inferSupabaseUrlFromAnonKey(anonKey)
    );

    if (!url || !/^https?:\/\//.test(url)) {
        return {
            url: 'http://127.0.0.1:54321',
            anonKey: 'example-anon-key',
        };
    }

    if (!anonKey) {
        return {
            url,
            anonKey: 'example-anon-key',
        };
    }

    return { url, anonKey };
}

export async function createClient() {
    const cookieStore = await cookies();
    const { url, anonKey } = getSupabaseConfig();

    return createServerClient(
        url,
        anonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}
