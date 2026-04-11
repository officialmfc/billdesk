/**
 * Conflict Resolver
 * 
 * Resolves conflicts between local and remote data using last-write-wins strategy
 */

import { ConflictError } from '../types';

interface ConflictResolution<T = any> {
    toLocal: T[];  // Records to apply to IndexedDB
    toRemote: T[]; // Records to apply to Supabase
    conflicts: Array<{
        local: T;
        remote: T;
        resolved: T;
        reason: string;
    }>;
}

export class ConflictResolver {
    private onConflict?: (conflict: any) => void;

    constructor(onConflict?: (conflict: any) => void) {
        this.onConflict = onConflict;
    }

    /**
     * Resolve conflicts between local and remote records
     * Uses last-write-wins strategy based on updated_at timestamps
     */
    async resolve<T extends { id: string; updated_at: string }>(
        localRecords: T[],
        remoteRecords: T[],
        table: string
    ): Promise<ConflictResolution<T>> {
        const toLocal: T[] = [];
        const toRemote: T[] = [];
        const conflicts: ConflictResolution<T>['conflicts'] = [];

        // Create maps for quick lookup
        const localMap = new Map(localRecords.map(r => [r.id, r]));
        const remoteMap = new Map(remoteRecords.map(r => [r.id, r]));

        // Process remote records
        for (const remote of remoteRecords) {
            const local = localMap.get(remote.id);

            if (!local) {
                // New record from remote, add to local
                toLocal.push(remote);
            } else {
                // Both exist, check for conflicts
                const conflict = this.detectConflict(local, remote);

                if (conflict) {
                    // Resolve using last-write-wins
                    const resolved = this.resolveConflict(local, remote, table);

                    conflicts.push({
                        local,
                        remote,
                        resolved,
                        reason: 'Last-write-wins based on updated_at timestamp',
                    });

                    // Apply resolved version
                    if (resolved === local) {
                        toRemote.push(local);
                    } else {
                        toLocal.push(remote);
                    }

                    // Notify about conflict
                    if (this.onConflict) {
                        this.onConflict({
                            table,
                            local,
                            remote,
                            resolved,
                        });
                    }
                } else if (this.isNewer(remote, local)) {
                    // Remote is newer, update local
                    toLocal.push(remote);
                }
                // If local is newer, it will be handled in the next loop
            }
        }

        // Process local records not in remote
        for (const local of localRecords) {
            const remote = remoteMap.get(local.id);

            if (!remote) {
                // New local record, push to remote
                toRemote.push(local);
            } else if (this.isNewer(local, remote)) {
                // Local is newer, push to remote
                toRemote.push(local);
            }
        }

        return {
            toLocal,
            toRemote,
            conflicts,
        };
    }

    /**
     * Detect if there's a conflict between local and remote records
     */
    private detectConflict<T extends { updated_at: string }>(
        local: T,
        remote: T
    ): boolean {
        // Check if both have been modified
        const localTime = new Date(local.updated_at).getTime();
        const remoteTime = new Date(remote.updated_at).getTime();

        // If timestamps are very close (within 1 second), check for data differences
        if (Math.abs(localTime - remoteTime) < 1000) {
            return this.hasDataDifferences(local, remote);
        }

        return false;
    }

    /**
     * Check if records have data differences
     */
    private hasDataDifferences<T>(local: T, remote: T): boolean {
        const localStr = JSON.stringify(this.normalizeRecord(local));
        const remoteStr = JSON.stringify(this.normalizeRecord(remote));
        return localStr !== remoteStr;
    }

    /**
     * Normalize record for comparison (remove metadata fields)
     */
    private normalizeRecord<T>(record: T): Partial<T> {
        const normalized = { ...record };
        // Remove metadata fields that shouldn't affect conflict detection
        delete (normalized as any).updated_at;
        delete (normalized as any).created_at;
        delete (normalized as any).created_by;
        delete (normalized as any).updated_by;
        return normalized;
    }

    /**
     * Resolve conflict using last-write-wins strategy
     */
    private resolveConflict<T extends { updated_at: string }>(
        local: T,
        remote: T,
        table: string
    ): T {
        const localTime = new Date(local.updated_at).getTime();
        const remoteTime = new Date(remote.updated_at).getTime();

        // Last-write-wins
        if (localTime > remoteTime) {
            console.log(`[Conflict] ${table}: Local wins (${local.updated_at} > ${remote.updated_at})`);
            return local;
        } else if (remoteTime > localTime) {
            console.log(`[Conflict] ${table}: Remote wins (${remote.updated_at} > ${local.updated_at})`);
            return remote;
        } else {
            // Same timestamp, prefer remote (server is source of truth)
            console.log(`[Conflict] ${table}: Same timestamp, preferring remote`);
            return remote;
        }
    }

    /**
     * Check if record A is newer than record B
     */
    private isNewer<T extends { updated_at: string }>(a: T, b: T): boolean {
        const aTime = new Date(a.updated_at).getTime();
        const bTime = new Date(b.updated_at).getTime();
        return aTime > bTime;
    }

    /**
     * Create a conflict error for user notification
     */
    createConflictError<T>(
        table: string,
        local: T,
        remote: T
    ): ConflictError {
        return new ConflictError(
            `Conflict detected in ${table}. Local and remote versions differ.`,
            local,
            remote
        );
    }
}
