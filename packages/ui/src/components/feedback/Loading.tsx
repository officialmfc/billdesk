/**
 * Loading Components
 * 
 * Loading spinner and skeleton components for different loading states.
 */
import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// SPINNER
// ============================================================================

export interface SpinnerProps {
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg';
    /** Additional CSS classes */
    className?: string;
    /** Accessible label */
    label?: string;
}

export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
    return (
        <div
            className={clsx('mfc-spinner', `mfc-spinner--${size}`, className)}
            role="status"
            aria-label={label}
        >
            <div className="mfc-spinner-circle" />
            <span className="mfc-spinner-sr-only">{label}</span>
        </div>
    );
}

// ============================================================================
// LOADING OVERLAY
// ============================================================================

export interface LoadingOverlayProps {
    /** Whether the overlay is visible */
    visible: boolean;
    /** Loading message */
    message?: string;
    /** Additional CSS classes */
    className?: string;
}

export function LoadingOverlay({ visible, message, className }: LoadingOverlayProps) {
    if (!visible) return null;

    return (
        <div className={clsx('mfc-loading-overlay', className)}>
            <div className="mfc-loading-overlay-content">
                <Spinner size="lg" />
                {message && <div className="mfc-loading-overlay-message">{message}</div>}
            </div>
        </div>
    );
}

// ============================================================================
// SKELETON
// ============================================================================

export interface SkeletonProps {
    /** Width of the skeleton */
    width?: string | number;
    /** Height of the skeleton */
    height?: string | number;
    /** Shape of the skeleton */
    variant?: 'text' | 'circular' | 'rectangular';
    /** Additional CSS classes */
    className?: string;
}

export function Skeleton({
    width,
    height,
    variant = 'text',
    className,
}: SkeletonProps) {
    return (
        <div
            className={clsx('mfc-skeleton', `mfc-skeleton--${variant}`, className)}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
            }}
            aria-hidden="true"
        />
    );
}

// ============================================================================
// SKELETON GROUP
// ============================================================================

export interface SkeletonGroupProps {
    /** Number of skeleton items */
    count?: number;
    /** Additional CSS classes */
    className?: string;
    /** Skeleton variant */
    variant?: 'text' | 'circular' | 'rectangular';
}

export function SkeletonGroup({ count = 3, className, variant = 'text' }: SkeletonGroupProps) {
    return (
        <div className={clsx('mfc-skeleton-group', className)}>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} variant={variant} />
            ))}
        </div>
    );
}

// ============================================================================
// LOADING STATE
// ============================================================================

export interface LoadingStateProps {
    /** Whether data is loading */
    loading: boolean;
    /** Error if any */
    error?: Error | null;
    /** Children to render when loaded */
    children: React.ReactNode;
    /** Custom loading component */
    loadingComponent?: React.ReactNode;
    /** Custom error component */
    errorComponent?: React.ReactNode;
}

export function LoadingState({
    loading,
    error,
    children,
    loadingComponent,
    errorComponent,
}: LoadingStateProps) {
    if (loading) {
        return <>{loadingComponent || <Spinner />}</>;
    }

    if (error) {
        return <>{errorComponent || <div className="mfc-error">Error: {error.message}</div>}</>;
    }

    return <>{children}</>;
}
