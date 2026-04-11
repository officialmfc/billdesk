/**
 * Date Utilities
 * Common date manipulation functions
 */
import { format, subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

/**
 * Get date range for common filters
 */
export function getDateRange(filter: string): { startDate: string; endDate: string } {
    const today = new Date();
    let startDate = '';
    let endDate = format(today, 'yyyy-MM-dd');

    switch (filter) {
        case 'today':
            startDate = endDate;
            break;
        case 'yesterday':
            startDate = format(subDays(today, 1), 'yyyy-MM-dd');
            endDate = startDate;
            break;
        case 'week':
        case 'last7days':
            startDate = format(subDays(today, 7), 'yyyy-MM-dd');
            break;
        case 'month':
        case 'thismonth':
            startDate = format(startOfMonth(today), 'yyyy-MM-dd');
            endDate = format(endOfMonth(today), 'yyyy-MM-dd');
            break;
        case 'lastmonth':
            const lastMonth = subDays(startOfMonth(today), 1);
            startDate = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
            endDate = format(endOfMonth(lastMonth), 'yyyy-MM-dd');
            break;
        default:
            startDate = '';
    }

    return { startDate, endDate };
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
    return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): string {
    return format(subDays(new Date(), days), 'yyyy-MM-dd');
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();

    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

/**
 * Get start and end of day timestamps
 */
export function getDayBounds(date: Date | string) {
    const d = typeof date === 'string' ? new Date(date) : date;

    return {
        start: startOfDay(d),
        end: endOfDay(d),
    };
}

/**
 * Format date for display in different formats
 */
export function formatDateDisplay(date: string | Date, formatType: 'short' | 'long' | 'full' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    switch (formatType) {
        case 'short':
            return format(d, 'dd MMM yyyy');
        case 'long':
            return format(d, 'dd MMMM yyyy');
        case 'full':
            return format(d, 'EEEE, dd MMMM yyyy');
        default:
            return format(d, 'dd MMM yyyy');
    }
}
