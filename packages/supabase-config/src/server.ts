/**
 * Supabase Server Client
 * Used in Server Components, Server Actions, and Route Handlers
 */
import { createServerClient } from '@supabase/ssr';
import type { cookies as CookiesType } from 'next/headers';

export async function createClient(cookies: Awaited<ReturnType<typeof CookiesType>>) {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookies.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookies.set(name, value, options)
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
