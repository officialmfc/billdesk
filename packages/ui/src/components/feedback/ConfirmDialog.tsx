/**
 * Confirm Dialog Component
 * 
 * A confirmation dialog for destructive or important actions.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export interface ConfirmContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

    const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolvePromise(() => resolve);
        });
    }, []);

    const handleConfirm = useCallback(() => {
        resolvePromise?.(true);
        setIsOpen(false);
        setOptions(null);
        setResolvePromise(null);
    }, [resolvePromise]);

    const handleCancel = useCallback(() => {
        resolvePromise?.(false);
        setIsOpen(false);
        setOptions(null);
        setResolvePromise(null);
    }, [resolvePromise]);

    const value: ConfirmContextValue = {
        confirm,
    };

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            {isOpen && options && (
                <ConfirmDialog
                    options={options}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </ConfirmContext.Provider>
    );
}

// ============================================================================
// DIALOG COMPONENT
// ============================================================================

interface ConfirmDialogProps {
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
    const {
        title,
        message,
        confirmLabel = 'Confirm',
        cancelLabel = 'Cancel',
        variant = 'info',
    } = options;

    return (
        <div className="mfc-confirm-overlay" onClick={onCancel}>
            <div
                className={clsx('mfc-confirm-dialog', `mfc-confirm-dialog--${variant}`)}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-labelledby="confirm-title"
                aria-describedby="confirm-message"
            >
                <div className="mfc-confirm-header">
                    <h2 id="confirm-title" className="mfc-confirm-title">
                        {title}
                    </h2>
                </div>

                <div className="mfc-confirm-body">
                    <p id="confirm-message" className="mfc-confirm-message">
                        {message}
                    </p>
                </div>

                <div className="mfc-confirm-footer">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="mfc-confirm-button mfc-confirm-button--cancel"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={clsx(
                            'mfc-confirm-button',
                            'mfc-confirm-button--confirm',
                            `mfc-confirm-button--${variant}`
                        )}
                        autoFocus
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
