/**
 * Supabase Browser Client
 * Used in Client Components for client-side operations
 * Configured for PWA with 6-hour session persistence
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

export function createClient() {
    const globalScope = globalThis as GlobalSupabaseClient;

    if (typeof window !== 'undefined' && globalScope.__mfcManagerSupabaseBrowserClient) {
        return globalScope.__mfcManagerSupabaseBrowserClient;
    }

    const anonKey = firstDefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const supabaseUrl =
        normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
        inferSupabaseUrlFromAnonKey(anonKey);

    if (!supabaseUrl || !anonKey) {
        throw new Error('Missing browser Supabase configuration.');
    }

    const client = createSupabaseClient(
        supabaseUrl,
        anonKey,
        {
            auth: {
                // Store session in localStorage for PWA offline support
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
                storageKey: 'mfc-manager-auth',
                // Auto-refresh tokens before expiry
                autoRefreshToken: true,
                // Persist session across browser restarts
                persistSession: true,
                // Auth callback is handled explicitly by the app callback page.
                detectSessionInUrl: false,
                // Flow type for PKCE (more secure)
                flowType: 'pkce',
            },
            // Global options
            global: {
                headers: {
                    'x-app-name': 'mfc-manager',
                },
                fetch: (input, init) => {
                    if (typeof navigator !== 'undefined' && !navigator.onLine) {
                        // Return a rejected promise to prevent the browser from attempting the request
                        // and logging ERR_INTERNET_DISCONNECTED
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
