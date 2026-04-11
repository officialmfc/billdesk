/**
 * Audit Trail System
 * Track all changes for compliance and debugging
 */

export interface AuditEntry {
    id: string;
    timestamp: string;
    userId: string;
    userName?: string;
    action: 'create' | 'update' | 'delete' | 'view' | 'export';
    resource: string;
    resourceId: string;
    changes?: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}

export class AuditTrail {
    private entries: AuditEntry[] = [];
    private maxEntries: number;
    private storageKey = 'audit_trail';

    constructor(maxEntries = 1000) {
        this.maxEntries = maxEntries;
        this.loadFromStorage();
    }

    /**
     * Log an audit entry
     */
    log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): void {
        const auditEntry: AuditEntry = {
            ...entry,
            id: this.generateId(),
            timestamp: new Date().toISOString(),
        };

        this.entries.unshift(auditEntry);

        // Keep only max entries
        if (this.entries.length > this.maxEntries) {
            this.entries = this.entries.slice(0, this.maxEntries);
        }

        this.saveToStorage();
    }

    /**
     * Log a create action
     */
    logCreate(
        userId: string,
        resource: string,
        resourceId: string,
        data: Record<string, any>
    ): void {
        this.log({
            userId,
            action: 'create',
            resource,
            resourceId,
            metadata: { data },
        });
    }

    /**
     * Log an update action
     */
    logUpdate(
        userId: string,
        resource: string,
        resourceId: string,
        changes: AuditEntry['changes']
    ): void {
        this.log({
            userId,
            action: 'update',
            resource,
            resourceId,
            changes,
        });
    }

    /**
     * Log a delete action
     */
    logDelete(userId: string, resource: string, resourceId: string): void {
        this.log({
            userId,
            action: 'delete',
            resource,
            resourceId,
        });
    }

    /**
     * Get all entries
     */
    getAll(): AuditEntry[] {
        return [...this.entries];
    }

    /**
     * Get entries by user
     */
    getByUser(userId: string): AuditEntry[] {
        return this.entries.filter((entry) => entry.userId === userId);
    }

    /**
     * Get entries by resource
     */
    getByResource(resource: string, resourceId?: string): AuditEntry[] {
        return this.entries.filter(
            (entry) =>
                entry.resource === resource &&
                (!resourceId || entry.resourceId === resourceId)
        );
    }

    /**
     * Get entries by action
     */
    getByAction(action: AuditEntry['action']): AuditEntry[] {
        return this.entries.filter((entry) => entry.action === action);
    }

    /**
     * Get entries in date range
     */
    getByDateRange(startDate: Date, endDate: Date): AuditEntry[] {
        return this.entries.filter((entry) => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= startDate && entryDate <= endDate;
        });
    }

    /**
     * Search entries
     */
    search(query: string): AuditEntry[] {
        const lowerQuery = query.toLowerCase();
        return this.entries.filter(
            (entry) =>
                entry.resource.toLowerCase().includes(lowerQuery) ||
                entry.resourceId.toLowerCase().includes(lowerQuery) ||
                entry.userName?.toLowerCase().includes(lowerQuery) ||
                entry.action.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Export to JSON
     */
    exportToJSON(): string {
        return JSON.stringify(this.entries, null, 2);
    }

    /**
     * Export to CSV
     */
    exportToCSV(): string {
        const headers = [
            'ID',
            'Timestamp',
            'User ID',
            'User Name',
            'Action',
            'Resource',
            'Resource ID',
            'Changes',
        ];

        const rows = this.entries.map((entry) => [
            entry.id,
            entry.timestamp,
            entry.userId,
            entry.userName || '',
            entry.action,
            entry.resource,
            entry.resourceId,
            entry.changes ? JSON.stringify(entry.changes) : '',
        ]);

        return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    }

    /**
     * Clear all entries
     */
    clear(): void {
        this.entries = [];
        this.saveToStorage();
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save to localStorage
     */
    private saveToStorage(): void {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
        } catch (error) {
            console.error('Failed to save audit trail:', error);
        }
    }

    /**
     * Load from localStorage
     */
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.entries = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load audit trail:', error);
        }
    }
}

/**
 * Global audit trail instance
 */
export const auditTrail = new AuditTrail();
