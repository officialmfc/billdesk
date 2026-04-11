/**
 * Empty State Component
 * 
 * A component to display when there's no data or content to show.
 */
import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface EmptyStateProps {
    /** Title text */
    title: string;
    /** Description text */
    description?: string;
    /** Icon or illustration */
    icon?: ReactNode;
    /** Action button */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div className={clsx('mfc-empty-state', className)}>
            {icon && <div className="mfc-empty-state-icon">{icon}</div>}

            <h3 className="mfc-empty-state-title">{title}</h3>

            {description && (
                <p className="mfc-empty-state-description">{description}</p>
            )}

            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="mfc-empty-state-action"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
}
