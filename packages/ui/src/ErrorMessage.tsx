/**
 * ErrorMessage Component
 * Display user-friendly error messages with retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export interface ErrorMessageProps {
    title?: string;
    message: string;
    recoverable?: boolean;
    onRetry?: () => void;
    onDismiss?: () => void;
    variant?: 'inline' | 'banner' | 'card';
    className?: string;
}

export function ErrorMessage({
    title = 'Error',
    message,
    recoverable = false,
    onRetry,
    onDismiss,
    variant = 'inline',
    className = '',
}: ErrorMessageProps): React.ReactElement {
    const baseClasses = 'flex items-start gap-3 text-sm';

    const variantClasses = {
        inline: 'p-3 rounded-md bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800',
        banner: 'p-4 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border-b border-red-200 dark:border-red-800',
        card: 'p-4 rounded-lg bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 border border-red-200 dark:border-red-800 shadow-sm',
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} role="alert">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />

            <div className="flex-1 min-w-0">
                <div className="font-semibold mb-1">{title}</div>
                <div className="text-sm opacity-90">{message}</div>

                {(recoverable && onRetry) && (
                    <button
                        onClick={onRetry}
                        className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                )}
            </div>

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}

/**
 * ErrorBoundary Component
 * Catch React errors and display fallback UI
 */
interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.props.onError?.(error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <ErrorMessage
                        title="Something went wrong"
                        message={this.state.error?.message || 'An unexpected error occurred'}
                        recoverable={true}
                        onRetry={this.handleReset}
                        variant="card"
                        className="max-w-md"
                    />
                </div>
            );
        }

        return this.props.children;
    }
}
