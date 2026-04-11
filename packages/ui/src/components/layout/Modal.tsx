/**
 * Modal Component
 * 
 * An accessible modal dialog component with focus management.
 */
import React, { ReactNode, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface ModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Close handler */
    onClose: () => void;
    /** Modal title */
    title?: string;
    /** Modal content */
    children: ReactNode;
    /** Modal footer content */
    footer?: ReactNode;
    /** Modal size */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Whether clicking overlay closes modal */
    closeOnOverlayClick?: boolean;
    /** Whether pressing Escape closes modal */
    closeOnEscape?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    className,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
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
            modalRef.current?.focus();
        } else {
            previousActiveElement.current?.focus();
        }
    }, [isOpen]);

    // Prevent body scroll when modal is open
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
            className="mfc-modal-overlay"
            onClick={handleOverlayClick}
            role="presentation"
        >
            <div
                ref={modalRef}
                className={clsx('mfc-modal', `mfc-modal--${size}`, className)}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                tabIndex={-1}
            >
                <div className="mfc-modal-header">
                    {title && (
                        <h2 id="modal-title" className="mfc-modal-title">
                            {title}
                        </h2>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="mfc-modal-close"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <div className="mfc-modal-body">{children}</div>

                {footer && <div className="mfc-modal-footer">{footer}</div>}
            </div>
        </div>
    );
}

// ============================================================================
// MODAL HOOK
// ============================================================================

export function useModal(initialState = false) {
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
