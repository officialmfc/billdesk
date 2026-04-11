/**
 * Offline Data Manager
 * Ensures all data is accessible offline for 6 hours
 * Syncs with Supabase when online
 */

import { db } from '@mfc/database';
import { logger } from './logger';
import { createClient } from './supabase/client';

const DATA_SYNC_INTERVAL = 5 * 60 * 1000; // Sync every 5 minutes when online
const DATA_EXPIRY_TIME = 6 * 60 * 60 * 1000; // 6 hours
const LAST_SYNC_KEY = 'mfc-last-data-sync';
const SYNC_STATUS_KEY = 'mfc-sync-status';

export interface SyncStatus {
  lastSync: number;
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
}

export class OfflineDataManager {
  private syncInterval: NodeJS.Timeout | null = null;
  private onStatusChange?: (status: SyncStatus) => void;

  constructor(onStatusChange?: (status: SyncStatus) => void) {
    this.onStatusChange = onStatusChange;
  }

  /**
   * Start offline data management
   */
  async start(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Initial sync
    await this.syncAllData();

    // Setup periodic sync
    this.startPeriodicSync();

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  /**
   * Stop offline data management
   */
  stop(): void {
    if (typeof window === 'undefined') return;

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  /**
   * Sync all data from Supabase to IndexedDB
   */
  async syncAllData(): Promise<void> {
    if (!navigator.onLine) {
      return;
    }

    this.updateStatus({ isSyncing: true });

    try {
      const supabase = createClient();

      // Sync users
      const { data: users } = await supabase
        .from('mfc_users')
        .select('*')
        .eq('is_active', true);

      if (users) {
        await db.users.bulkPut(users);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'users' }
        }));
      }

      // Sync staff
      const { data: staff } = await supabase
        .from('mfc_staff')
        .select('*')
        .eq('is_active', true);

      if (staff) {
        await db.mfc_staff.bulkPut(staff);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'mfcStaff' }
        }));
      }

      // Sync products
      const { data: products } = await supabase
        .from('mfc_products')
        .select('*');

      if (products) {
        await db.products.bulkPut(products);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'products' }
        }));
      }

      // Sync stock batches
      const { data: stockBatches } = await supabase
        .from('mfc_stock_batches')
        .select('*')
        .gt('current_weight_kg', 0);

      if (stockBatches) {
        await db.stock_batches.bulkPut(stockBatches);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'stockBatches' }
        }));
      }

      // Sync recent sales (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sales } = await supabase
        .from('mfc_sale_transactions')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (sales) {
        await db.sale_transactions.bulkPut(sales);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'saleTransactions' }
        }));
      }

      // Sync recent bills (last 30 days)
      const { data: bills } = await supabase
        .from('mfc_daily_bills')
        .select('*')
        .gte('bill_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (bills) {
        await db.daily_bills.bulkPut(bills);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'dailyBills' }
        }));
      }

      // Sync recent chalans (last 30 days)
      const { data: chalans } = await supabase
        .from('mfc_chalans')
        .select('*')
        .gte('chalan_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (chalans) {
        await db.chalans.bulkPut(chalans);
        window.dispatchEvent(new CustomEvent('indexeddb-updated', {
          detail: { table: 'chalans' }
        }));
      }

      // Update last sync timestamp
      localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());

      this.updateStatus({ isSyncing: false, lastSync: Date.now() });
    } catch (error) {
      logger.error(error, '❌ Data sync failed');
      this.updateStatus({ isSyncing: false });
    }
  }

  /**
   * Check if data is fresh (< 6 hours old)
   */
  isDataFresh(): boolean {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (!lastSync) return false;

    const lastSyncTime = parseInt(lastSync, 10);
    const now = Date.now();

    return now - lastSyncTime < DATA_EXPIRY_TIME;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    const statusStr = localStorage.getItem(SYNC_STATUS_KEY);

    const status: SyncStatus = statusStr
      ? JSON.parse(statusStr)
      : {
        lastSync: lastSync ? parseInt(lastSync, 10) : 0,
        isOnline: navigator.onLine,
        isSyncing: false,
        pendingChanges: 0,
      };

    return status;
  }

  /**
   * Update sync status
   */
  private updateStatus(updates: Partial<SyncStatus>): void {
    const current = this.getSyncStatus();
    const updated = { ...current, ...updates, isOnline: navigator.onLine };

    localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(updated));

    if (this.onStatusChange) {
      this.onStatusChange(updated);
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await this.syncAllData();
      }
    }, DATA_SYNC_INTERVAL);
  }

  /**
   * Handle online event
   */
  private handleOnline = async (): Promise<void> => {
    this.updateStatus({ isOnline: true });
    await this.syncAllData();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.updateStatus({ isOnline: false });
  };

  /**
   * Queue a change for sync when online
   */
  async queueChange(
    table: string,
    operation: 'create' | 'update' | 'delete',
    data: Record<string, unknown>
  ): Promise<void> {
    // Store in IndexedDB sync queue
    const change = {
      id: crypto.randomUUID(),
      table,
      operation,
      data,
      timestamp: Date.now(),
    };

    // Add to sync queue (you can create a separate table for this)
    // Update pending changes count
    const status = this.getSyncStatus();
    this.updateStatus({ pendingChanges: status.pendingChanges + 1 });
  }

  /**
   * Process queued changes when online
   */
  async processQueue(): Promise<void> {
    if (!navigator.onLine) return;

    // Process queued changes here
    // This would sync local changes back to Supabase

    this.updateStatus({ pendingChanges: 0 });
  }
}

// Singleton instance
let offlineDataManager: OfflineDataManager | null = null;

export function getOfflineDataManager(): OfflineDataManager {
  if (!offlineDataManager) {
    offlineDataManager = new OfflineDataManager();
  }
  return offlineDataManager;
}

export function startOfflineDataManager(
  onStatusChange?: (status: SyncStatus) => void
): void {
  const manager = new OfflineDataManager(onStatusChange);
  manager.start();
  offlineDataManager = manager;
}

export function stopOfflineDataManager(): void {
  if (offlineDataManager) {
    offlineDataManager.stop();
    offlineDataManager = null;
  }
}
