/**
 * Drawer Component
 * 
 * A slide-out panel component, useful for mobile navigation and side panels.
 */
import React, { ReactNode, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface DrawerProps {
    /** Whether the drawer is open */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Drawer title */
    title?: string;
    /** Drawer content */
    children: ReactNode;
    /** Drawer position */
    position?: 'left' | 'right' | 'top' | 'bottom';
    /** Whether clicking overlay closes drawer */
    closeOnOverlayClick?: boolean;
    /** Whether pressing Escape closes drawer */
    closeOnEscape?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Drawer({
    isOpen,
    onClose,
    title,
    children,
    position = 'right',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className,
}: DrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Handle escape key
    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    // Focus management
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            drawerRef.current?.focus();
        } else {
            previousActiveElement.current?.focus();
        }
    }, [isOpen]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className={clsx('mfc-drawer-overlay', {
                'mfc-drawer-overlay--open': isOpen,
            })}
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                ref={drawerRef}
                className={clsx(
                    'mfc-drawer',
                    `mfc-drawer--${position}`,
                    {
                        'mfc-drawer--open': isOpen,
                    },
                    className
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'drawer-title' : undefined}
                tabIndex={-1}
            >
                <div className="mfc-drawer-header">
                    {title && (
                        <h2 id="drawer-title" className="mfc-drawer-title">
                            {title}
                        </h2>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="mfc-drawer-close"
                        aria-label="Close drawer"
                    >
                        ×
                    </button>
                </div>

                <div className="mfc-drawer-body">{children}</div>
            </div>
        </div>
    );
}

// ============================================================================
// DRAWER HOOK
// ============================================================================

export function useDrawer(initialState = false) {
    const [isOpen, setIsOpen] = React.useState(initialState);

    const open = React.useCallback(() => setIsOpen(true), []);
    const close = React.useCallback(() => setIsOpen(false), []);
    const toggle = React.useCallback(() => setIsOpen(prev => !prev), []);

    return {
        isOpen,
        open,
        close,
        toggle,
    };
}
