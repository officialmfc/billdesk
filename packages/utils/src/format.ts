/**
 * Formatting Utilities
 * Reusable formatting functions for currency, dates, weights, etc.
 */

/**
 * Format number as Indian currency (₹)
 */
export function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '₹0.00';

    return `₹${num.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * Format date in Indian format (DD MMM YYYY)
 */
export function formatDate(date: string | Date): string {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date): string {
    if (!date) return 'N/A';

    try {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return String(date);
    }
}

/**
 * Format weight in kilograms
 */
export function formatWeight(weight: number | string): string {
    const num = typeof weight === 'string' ? parseFloat(weight) : weight;
    if (isNaN(num)) return '0.00 kg';

    return `${num.toFixed(2)} kg`;
}

/**
 * Format phone number (Indian format)
 */
export function formatPhone(phone: string): string {
    if (!phone) return 'N/A';

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Format as +91 XXXXX XXXXX
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }

    if (cleaned.length === 12 && cleaned.startsWith('91')) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with Indian numbering system (lakhs, crores)
 */
export function formatIndianNumber(num: number): string {
    return num.toLocaleString('en-IN');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format number with commas
 */
export function formatNumber(num: number, decimals: number = 0): string {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

/**
 * Format compact number (1K, 1M, 1B)
 */
export function formatCompactNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 100000) return `${(num / 1000).toFixed(1)}K`; // Thousands
    if (num < 10000000) return `${(num / 100000).toFixed(1)}L`; // Lakhs
    return `${(num / 10000000).toFixed(1)}Cr`; // Crores
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Convert to title case
 */
export function toTitleCase(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return num + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]!);
}

/**
 * Format list with commas and "and"
 */
export function formatList(items: string[]): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0]!;
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
