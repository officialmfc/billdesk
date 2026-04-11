/**
 * Sync-related type definitions
 */

// Sync metadata for tracking last sync time per table
export interface SyncMetadata {
    table_name: string;
    last_sync: string;
    status: 'idle' | 'syncing' | 'error';
    error_message?: string;
}

// Sync settings for controlling auto-upload behavior
export interface SyncSettings {
    autoUpload: boolean; // Master toggle for auto upload
    autoUploadSales: boolean; // Auto upload sales forms
    autoUploadUsers: boolean; // Auto upload user forms
    autoUploadCollections: boolean; // Auto upload collection forms
}

// App settings stored in IndexedDB
export interface AppSettings {
    key: string;
    value: any;
}
