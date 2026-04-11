/**
 * Supabase Browser Client
 * For use in Client Components
 */

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

type GlobalSupabaseClient = typeof globalThis & {
    __mfcManagerSupabaseBrowserClient?: SupabaseClient;
};

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

    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        const binary = window.atob(padded);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

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
    const anonKey = firstDefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const url =
        normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
        inferSupabaseUrlFromAnonKey(anonKey);

    // Static export can evaluate client helpers during prerender.
    // Keep build-time evaluation harmless, but never send browsers to localhost.
    if (typeof window === 'undefined') {
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

    if (!url || !/^https?:\/\//.test(url)) {
        throw new Error(
            'Missing Supabase config in browser: NEXT_PUBLIC_SUPABASE_URL must be defined at build time.'
        );
    }

    if (!anonKey) {
        throw new Error(
            'Missing Supabase anon key in browser: NEXT_PUBLIC_SUPABASE_ANON_KEY must be defined at build time.'
        );
    }

    return { url, anonKey };
}

export function createClient() {
    const globalScope = globalThis as GlobalSupabaseClient;

    if (typeof window !== 'undefined' && globalScope.__mfcManagerSupabaseBrowserClient) {
        return globalScope.__mfcManagerSupabaseBrowserClient;
    }

    const { url, anonKey } = getSupabaseConfig();

    const client = createSupabaseClient(
        url,
        anonKey,
        {
            auth: {
                flowType: 'pkce',
                autoRefreshToken: typeof window !== 'undefined',
                persistSession: true,
                detectSessionInUrl: false,
                storageKey: 'mfc-manager-auth',
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            },
            global: {
                fetch: (input, init) => {
                    if (typeof navigator !== 'undefined' && !navigator.onLine) {
                        return Promise.reject(new TypeError('Network request failed (Offline)'));
                    }
                    return fetch(input, init);
                },
            },
        }
    );

    if (typeof window !== 'undefined') {
        globalScope.__mfcManagerSupabaseBrowserClient = client;
    }

    return client;
}
