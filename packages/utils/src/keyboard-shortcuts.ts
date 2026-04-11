/**
 * Keyboard Shortcuts Manager
 * Handle keyboard shortcuts across the application
 */

export interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    description?: string;
    handler: (event: KeyboardEvent) => void;
}

export class KeyboardShortcuts {
    private shortcuts: Map<string, ShortcutConfig> = new Map();
    private enabled = true;

    constructor() {
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    /**
     * Register a keyboard shortcut
     */
    register(id: string, config: ShortcutConfig): void {
        this.shortcuts.set(id, config);
    }

    /**
     * Unregister a keyboard shortcut
     */
    unregister(id: string): void {
        this.shortcuts.delete(id);
    }

    /**
     * Start listening for keyboard events
     */
    start(): void {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Stop listening for keyboard events
     */
    stop(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    /**
     * Enable shortcuts
     */
    enable(): void {
        this.enabled = true;
    }

    /**
     * Disable shortcuts
     */
    disable(): void {
        this.enabled = false;
    }

    /**
     * Get all registered shortcuts
     */
    getAll(): Array<{ id: string; config: ShortcutConfig }> {
        return Array.from(this.shortcuts.entries()).map(([id, config]) => ({
            id,
            config,
        }));
    }

    /**
     * Handle keydown event
     */
    private handleKeyDown(event: KeyboardEvent): void {
        if (!this.enabled) return;

        // Don't trigger shortcuts when typing in inputs
        const target = event.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            return;
        }

        for (const [, config] of this.shortcuts) {
            if (this.matchesShortcut(event, config)) {
                event.preventDefault();
                config.handler(event);
                break;
            }
        }
    }

    /**
     * Check if event matches shortcut config
     */
    private matchesShortcut(event: KeyboardEvent, config: ShortcutConfig): boolean {
        const keyMatches = event.key.toLowerCase() === config.key.toLowerCase();
        const ctrlMatches = !!config.ctrl === (event.ctrlKey || event.metaKey);
        const shiftMatches = !!config.shift === event.shiftKey;
        const altMatches = !!config.alt === event.altKey;

        return keyMatches && ctrlMatches && shiftMatches && altMatches;
    }
}

/**
 * Common keyboard shortcuts
 */
export const commonShortcuts = {
    save: { key: 's', ctrl: true, description: 'Save' },
    search: { key: 'k', ctrl: true, description: 'Search' },
    newItem: { key: 'n', ctrl: true, description: 'New item' },
    delete: { key: 'Delete', description: 'Delete' },
    escape: { key: 'Escape', description: 'Cancel/Close' },
    refresh: { key: 'r', ctrl: true, description: 'Refresh' },
    help: { key: '?', shift: true, description: 'Show help' },
    undo: { key: 'z', ctrl: true, description: 'Undo' },
    redo: { key: 'z', ctrl: true, shift: true, description: 'Redo' },
    selectAll: { key: 'a', ctrl: true, description: 'Select all' },
};

/**
 * Format shortcut for display
 */
export function formatShortcut(config: Omit<ShortcutConfig, 'handler'>): string {
    const parts: string[] = [];

    if (config.ctrl) parts.push('Ctrl');
    if (config.shift) parts.push('Shift');
    if (config.alt) parts.push('Alt');
    if (config.meta) parts.push('Cmd');

    parts.push(config.key.toUpperCase());

    return parts.join('+');
}
