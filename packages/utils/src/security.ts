/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
    if (typeof document === 'undefined') {
        return escapeHtml(html);
    }
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

/**
 * Escape special characters for safe HTML rendering
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };
    return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize user input for database queries
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize URL
 */
export function sanitizeUrl(url: string): string {
    try {
        const parsed = new URL(url);
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.toString();
    } catch {
        return '';
    }
}

/**
 * Generate CSRF token
 */
export function generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string, storedToken: string): boolean {
    if (!token || !storedToken) return false;
    return token === storedToken;
}

/**
 * Rate limit checker (client-side)
 */
export class ClientRateLimiter {
    private attempts: Map<string, number[]> = new Map();

    constructor(
        private maxAttempts: number = 5,
        private windowMs: number = 60000
    ) { }

    check(key: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];

        // Remove old attempts
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);

        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }

        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }

    reset(key: string): void {
        this.attempts.delete(key);
    }
}

/**
 * Content Security Policy headers
 */
export const securityHeaders = {
    'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
    ].join('; '),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
