/**
 * Sync Queue
 * 
 * Manages offline operations queue with retry logic and persistence
 */

import type { MFCBillDeskDB } from '@mfc/database';
import type { SyncQueueItem } from '../types';

export class SyncQueue {
    private indexedDB: MFCBillDeskDB;
    private queueTable = 'sync_queue';

    constructor(indexedDB: MFCBillDeskDB) {
        this.indexedDB = indexedDB;
        this.ensureQueueTable();
    }

    /**
     * Ensure sync queue table exists in IndexedDB
     */
    private async ensureQueueTable(): Promise<void> {
        // Check if table exists, if not, add it dynamically
        if (!(this.indexedDB as any)[this.queueTable]) {
            // Add the table to the schema
            this.indexedDB.version(this.indexedDB.verno + 1).stores({
                sync_queue: 'id, table, status, timestamp, retries',
            });
        }
    }

    /**
     * Enqueue an operation for sync
     */
    async enqueue(
        item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>
    ): Promise<string> {
        const queueItem: SyncQueueItem = {
            id: this.generateId(),
            ...item,
            timestamp: Date.now(),
            retries: 0,
            status: 'pending',
        };

        const table = (this.indexedDB as any)[this.queueTable];
        await table.add(queueItem);

        return queueItem.id;
    }

    /**
     * Dequeue next pending item
     */
    async dequeue(): Promise<SyncQueueItem | null> {
        const table = (this.indexedDB as any)[this.queueTable];

        const item = await table
            .where('status')
            .equals('pending')
            .first();

        return item || null;
    }

    /**
     * Get all pending items
     */
    async getAll(): Promise<SyncQueueItem[]> {
        const table = (this.indexedDB as any)[this.queueTable];

        return await table
            .where('status')
            .equals('pending')
            .sortBy('timestamp');
    }

    /**
     * Get items by status
     */
    async getByStatus(status: SyncQueueItem['status']): Promise<SyncQueueItem[]> {
        const table = (this.indexedDB as any)[this.queueTable];

        return await table
            .where('status')
            .equals(status)
            .sortBy('timestamp');
    }

    /**
     * Mark item as syncing
     */
    async markSyncing(id: string): Promise<void> {
        const table = (this.indexedDB as any)[this.queueTable];
        await table.update(id, { status: 'syncing' });
    }

    /**
     * Mark item as completed
     */
    async markCompleted(id: string): Promise<void> {
        const table = (this.indexedDB as any)[this.queueTable];
        await table.update(id, { status: 'completed' });
    }

    /**
     * Mark item as failed with retry logic
     */
    async markFailed(id: string, error: string): Promise<void> {
        const table = (this.indexedDB as any)[this.queueTable];
        const item = await table.get(id);

        if (!item) return;

        const retries = item.retries + 1;
        const maxRetries = 3;

        if (retries >= maxRetries) {
            // Max retries reached, mark as failed permanently
            await table.update(id, {
                status: 'failed',
                retries,
                error,
            });
        } else {
            // Retry with exponential backoff
            const backoffMs = Math.pow(2, retries) * 1000; // 2s, 4s, 8s

            await table.update(id, {
                status: 'pending',
                retries,
                error,
                timestamp: Date.now() + backoffMs, // Schedule for later
            });
        }
    }

    /**
     * Retry a failed item
     */
    async retry(id: string): Promise<void> {
        const table = (this.indexedDB as any)[this.queueTable];
        await table.update(id, {
            status: 'pending',
            retries: 0,
            error: undefined,
            timestamp: Date.now(),
        });
    }

    /**
     * Clear completed items
     */
    async clearCompleted(): Promise<number> {
        const table = (this.indexedDB as any)[this.queueTable];
        const completed = await this.getByStatus('completed');

        for (const item of completed) {
            await table.delete(item.id);
        }

        return completed.length;
    }

    /**
     * Clear all items
     */
    async clear(): Promise<void> {
        const table = (this.indexedDB as any)[this.queueTable];
        await table.clear();
    }

    /**
     * Get queue statistics
     */
    async getStats(): Promise<{
        pending: number;
        syncing: number;
        completed: number;
        failed: number;
        total: number;
    }> {
        const table = (this.indexedDB as any)[this.queueTable];

        const [pending, syncing, completed, failed] = await Promise.all([
            table.where('status').equals('pending').count(),
            table.where('status').equals('syncing').count(),
            table.where('status').equals('completed').count(),
            table.where('status').equals('failed').count(),
        ]);

        return {
            pending,
            syncing,
            completed,
            failed,
            total: pending + syncing + completed + failed,
        };
    }

    /**
     * Generate unique ID for queue item
     */
    private generateId(): string {
        return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
