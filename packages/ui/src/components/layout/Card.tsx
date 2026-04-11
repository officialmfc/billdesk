/**
 * Card Component
 * 
 * A container component for grouping related content.
 */
import React, { ReactNode } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface CardProps {
    /** Card content */
    children: ReactNode;
    /** Card title */
    title?: string;
    /** Card subtitle */
    subtitle?: string;
    /** Card footer content */
    footer?: ReactNode;
    /** Card variant */
    variant?: 'default' | 'outlined' | 'elevated';
    /** Whether the card is clickable */
    clickable?: boolean;
    /** Click handler */
    onClick?: () => void;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Card({
    children,
    title,
    subtitle,
    footer,
    variant = 'default',
    clickable = false,
    onClick,
    className,
}: CardProps) {
    const Component = clickable || onClick ? 'button' : 'div';

    return (
        <Component
            className={clsx(
                'mfc-card',
                `mfc-card--${variant}`,
                {
                    'mfc-card--clickable': clickable || onClick,
                },
                className
            )}
            onClick={onClick}
            type={Component === 'button' ? 'button' : undefined}
        >
            {(title || subtitle) && (
                <div className="mfc-card-header">
                    {title && <h3 className="mfc-card-title">{title}</h3>}
                    {subtitle && <p className="mfc-card-subtitle">{subtitle}</p>}
                </div>
            )}

            <div className="mfc-card-body">{children}</div>

            {footer && <div className="mfc-card-footer">{footer}</div>}
        </Component>
    );
}

// ============================================================================
// CARD SECTION
// ============================================================================

export interface CardSectionProps {
    children: ReactNode;
    title?: string;
    className?: string;
}

export function CardSection({ children, title, className }: CardSectionProps) {
    return (
        <div className={clsx('mfc-card-section', className)}>
            {title && <h4 className="mfc-card-section-title">{title}</h4>}
            <div className="mfc-card-section-content">{children}</div>
        </div>
    );
}
