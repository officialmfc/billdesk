/**
 * Bulk Operations Utilities
 * Perform operations on multiple items efficiently
 */

export interface BulkOperationResult<T> {
    success: T[];
    failed: Array<{ item: T; error: Error }>;
    total: number;
    successCount: number;
    failedCount: number;
}

/**
 * Execute bulk operation with error handling
 */
export async function bulkExecute<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    options: {
        continueOnError?: boolean;
        onProgress?: (completed: number, total: number) => void;
    } = {}
): Promise<BulkOperationResult<R>> {
    const { continueOnError = true, onProgress } = options;
    const success: R[] = [];
    const failed: Array<{ item: T; error: Error }> = [];

    for (let i = 0; i < items.length; i++) {
        try {
            const result = await operation(items[i]);
            success.push(result);
        } catch (error) {
            failed.push({ item: items[i], error: error as Error });
            if (!continueOnError) {
                throw error;
            }
        }

        onProgress?.(i + 1, items.length);
    }

    return {
        success,
        failed,
        total: items.length,
        successCount: success.length,
        failedCount: failed.length,
    };
}

/**
 * Bulk delete with confirmation
 */
export async function bulkDelete<T extends { id: string | number }>(
    items: T[],
    deleteOperation: (id: string | number) => Promise<void>,
    options: {
        onProgress?: (completed: number, total: number) => void;
    } = {}
): Promise<BulkOperationResult<string | number>> {
    return bulkExecute(
        items,
        async (item) => {
            await deleteOperation(item.id);
            return item.id;
        },
        options
    );
}

/**
 * Bulk update with validation
 */
export async function bulkUpdate<T extends { id: string | number }>(
    items: T[],
    updates: Partial<T>,
    updateOperation: (id: string | number, data: Partial<T>) => Promise<T>,
    options: {
        validate?: (item: T, updates: Partial<T>) => boolean;
        onProgress?: (completed: number, total: number) => void;
    } = {}
): Promise<BulkOperationResult<T>> {
    const { validate, onProgress } = options;

    return bulkExecute(
        items,
        async (item) => {
            if (validate && !validate(item, updates)) {
                throw new Error(`Validation failed for item ${item.id}`);
            }
            return updateOperation(item.id, updates);
        },
        { onProgress }
    );
}

/**
 * Bulk export to different formats
 */
export function bulkExportToCSV<T extends Record<string, any>>(
    items: T[],
    columns?: Array<keyof T>
): string {
    if (items.length === 0) return '';

    const cols = columns || (Object.keys(items[0]) as Array<keyof T>);
    const header = cols.join(',');
    const rows = items.map((item) =>
        cols.map((col) => {
            const value = item[col];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',')
    );

    return [header, ...rows].join('\n');
}

/**
 * Bulk import from CSV
 */
export function bulkImportFromCSV<T>(
    csv: string,
    mapper?: (row: Record<string, string>) => T
): T[] {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1);

    return rows.map((row) => {
        const values = row.split(',').map((v) => v.trim());
        const obj: Record<string, string> = {};

        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });

        return mapper ? mapper(obj) : (obj as T);
    });
}

/**
 * Bulk validation
 */
export function bulkValidate<T>(
    items: T[],
    validator: (item: T) => { valid: boolean; errors?: string[] }
): {
    valid: T[];
    invalid: Array<{ item: T; errors: string[] }>;
} {
    const valid: T[] = [];
    const invalid: Array<{ item: T; errors: string[] }> = [];

    items.forEach((item) => {
        const result = validator(item);
        if (result.valid) {
            valid.push(item);
        } else {
            invalid.push({ item, errors: result.errors || [] });
        }
    });

    return { valid, invalid };
}
