/**
 * Virtual Scrolling Implementation
 * Efficiently render large lists by only rendering visible items
 */

export interface VirtualScrollConfig {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
    totalItems: number;
}

export interface VirtualScrollResult {
    startIndex: number;
    endIndex: number;
    offsetY: number;
    visibleItems: number;
    totalHeight: number;
}

/**
 * Calculate visible range for virtual scrolling
 */
export function calculateVirtualScroll(
    scrollTop: number,
    config: VirtualScrollConfig
): VirtualScrollResult {
    const { itemHeight, containerHeight, overscan = 3, totalItems } = config;

    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(totalItems - 1, startIndex + visibleCount + overscan * 2);

    // Calculate offset for positioning
    const offsetY = startIndex * itemHeight;
    const totalHeight = totalItems * itemHeight;

    return {
        startIndex,
        endIndex,
        offsetY,
        visibleItems: endIndex - startIndex + 1,
        totalHeight,
    };
}

/**
 * Virtual scroll hook for React
 */
export class VirtualScroller<T> {
    private items: T[];
    private config: VirtualScrollConfig;
    private scrollTop = 0;

    constructor(items: T[], config: Omit<VirtualScrollConfig, 'totalItems'>) {
        this.items = items;
        this.config = {
            ...config,
            totalItems: items.length,
        };
    }

    /**
     * Update scroll position
     */
    setScrollTop(scrollTop: number): VirtualScrollResult {
        this.scrollTop = scrollTop;
        return this.getVisibleRange();
    }

    /**
     * Get visible items
     */
    getVisibleItems(): T[] {
        const range = this.getVisibleRange();
        return this.items.slice(range.startIndex, range.endIndex + 1);
    }

    /**
     * Get visible range
     */
    getVisibleRange(): VirtualScrollResult {
        return calculateVirtualScroll(this.scrollTop, {
            ...this.config,
            totalItems: this.items.length,
        });
    }

    /**
     * Update items
     */
    setItems(items: T[]): void {
        this.items = items;
        this.config.totalItems = items.length;
    }

    /**
     * Get total height
     */
    getTotalHeight(): number {
        return this.items.length * this.config.itemHeight;
    }

    /**
     * Scroll to index
     */
    scrollToIndex(index: number): number {
        const clampedIndex = Math.max(0, Math.min(index, this.items.length - 1));
        return clampedIndex * this.config.itemHeight;
    }
}

/**
 * Virtual grid calculator for 2D scrolling
 */
export interface VirtualGridConfig {
    itemWidth: number;
    itemHeight: number;
    containerWidth: number;
    containerHeight: number;
    columns: number;
    totalItems: number;
    gap?: number;
}

export interface VirtualGridResult {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
    offsetY: number;
    totalHeight: number;
    visibleItems: Array<{ row: number; col: number; index: number }>;
}

/**
 * Calculate visible range for virtual grid
 */
export function calculateVirtualGrid(
    scrollTop: number,
    config: VirtualGridConfig
): VirtualGridResult {
    const { itemHeight, containerHeight, columns, totalItems, gap = 0 } = config;

    const rowHeight = itemHeight + gap;
    const totalRows = Math.ceil(totalItems / columns);

    // Calculate visible rows
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight));
    const visibleRows = Math.ceil(containerHeight / rowHeight) + 1;
    const endRow = Math.min(totalRows - 1, startRow + visibleRows);

    // Calculate visible items
    const visibleItems: Array<{ row: number; col: number; index: number }> = [];
    for (let row = startRow; row <= endRow; row++) {
        for (let col = 0; col < columns; col++) {
            const index = row * columns + col;
            if (index < totalItems) {
                visibleItems.push({ row, col, index });
            }
        }
    }

    return {
        startRow,
        endRow,
        startCol: 0,
        endCol: columns - 1,
        offsetY: startRow * rowHeight,
        totalHeight: totalRows * rowHeight,
        visibleItems,
    };
}
