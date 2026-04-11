/**
 * Performance Monitor
 * Track and analyze performance metrics
 */

export interface PerformanceStats {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
}

export class PerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();

    /**
     * Start a timer for a labeled operation
     * Returns a function to end the timer
     */
    startTimer(label: string): () => void {
        const start = performance.now();

        return () => {
            const duration = performance.now() - start;
            this.recordMetric(label, duration);
        };
    }

    /**
     * Record a metric value
     */
    recordMetric(label: string, value: number): void {
        const existing = this.metrics.get(label) || [];
        existing.push(value);
        this.metrics.set(label, existing);

        console.debug(`⏱️  ${label}: ${value.toFixed(2)}ms`);
    }

    /**
     * Get statistics for a labeled metric
     */
    getStats(label: string): PerformanceStats | null {
        const times = this.metrics.get(label);
        if (!times || times.length === 0) return null;

        const sorted = [...times].sort((a, b) => a - b);
        const sum = times.reduce((a, b) => a + b, 0);

        return {
            count: times.length,
            min: sorted[0] ?? 0,
            max: sorted[sorted.length - 1] ?? 0,
            avg: sum / times.length,
            p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
            p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
            p99: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
        };
    }

    /**
     * Get all metrics
     */
    getAllMetrics(): Map<string, number[]> {
        return new Map(this.metrics);
    }

    /**
     * Print performance report
     */
    report(): void {
        console.debug('\n📊 Performance Report:');
        console.debug('='.repeat(60));

        for (const [label, _] of this.metrics) {
            const stats = this.getStats(label);
            if (stats) {
                console.debug(`\n${label}:`);
                console.debug(`  Count:   ${stats.count}`);
                console.debug(`  Average: ${stats.avg.toFixed(2)}ms`);
                console.debug(`  Median:  ${stats.p50.toFixed(2)}ms`);
                console.debug(`  P95:     ${stats.p95.toFixed(2)}ms`);
                console.debug(`  P99:     ${stats.p99.toFixed(2)}ms`);
                console.debug(`  Range:   ${stats.min.toFixed(2)}ms - ${stats.max.toFixed(2)}ms`);
            }
        }

        console.debug('\n' + '='.repeat(60));
    }

    /**
     * Clear all metrics
     */
    clear(): void {
        this.metrics.clear();
    }

    /**
     * Export metrics as JSON
     */
    export(): Record<string, PerformanceStats | null> {
        const result: Record<string, PerformanceStats | null> = {};

        for (const [label, _] of this.metrics) {
            result[label] = this.getStats(label);
        }

        return result;
    }

    /**
     * Get metrics in SyncMetrics format
     */
    getMetrics(): Array<{
        tableName: string;
        recordCount: number;
        duration: number;
        success: boolean;
        error?: string;
        startedAt: string;
        completedAt: string;
    }> {
        const metrics: Array<any> = [];

        for (const [label, times] of this.metrics) {
            if (label.startsWith('sync_')) {
                const tableName = label.replace('sync_', '');
                const stats = this.getStats(label);

                if (stats) {
                    metrics.push({
                        tableName,
                        recordCount: 0, // Would need to track separately
                        duration: stats.avg,
                        success: true,
                        startedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString(),
                    });
                }
            }
        }

        return metrics;
    }
}

/**
 * Global performance monitor instance
 */
export const perfMonitor = new PerformanceMonitor();
