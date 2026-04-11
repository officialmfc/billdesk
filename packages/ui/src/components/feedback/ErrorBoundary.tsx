/**
 * Error Boundary Component
 * 
 * A React error boundary for catching and handling component errors.
 */
import React, { Component, ReactNode, ErrorInfo } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorBoundaryProps {
    /** Children to render */
    children: ReactNode;
    /** Custom fallback UI */
    fallback?: (error: Error, reset: () => void) => ReactNode;
    /** Error handler callback */
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    /** Whether to log errors to console */
    logErrors?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const { onError, logErrors = true } = this.props;

        if (logErrors) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        onError?.(error, errorInfo);
    }

    resetError = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        const { hasError, error } = this.state;
        const { children, fallback } = this.props;

        if (hasError && error) {
            if (fallback) {
                return fallback(error, this.resetError);
            }

            return <DefaultErrorFallback error={error} reset={this.resetError} />;
        }

        return children;
    }
}

// ============================================================================
// DEFAULT FALLBACK
// ============================================================================

interface DefaultErrorFallbackProps {
    error: Error;
    reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
    return (
        <div className="mfc-error-boundary" role="alert">
            <div className="mfc-error-boundary-content">
                <h2 className="mfc-error-boundary-title">Something went wrong</h2>
                <p className="mfc-error-boundary-message">
                    {error.message || 'An unexpected error occurred'}
                </p>
                <details className="mfc-error-boundary-details">
                    <summary>Error details</summary>
                    <pre className="mfc-error-boundary-stack">{error.stack}</pre>
                </details>
                <button
                    type="button"
                    onClick={reset}
                    className="mfc-error-boundary-reset"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// HOOK VERSION
// ============================================================================

/**
 * Hook-based error boundary wrapper
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   return (
 *     <ErrorBoundaryWrapper>
 *       <ComponentThatMightError />
 *     </ErrorBoundaryWrapper>
 *   );
 * }
 * ```
 */
export function ErrorBoundaryWrapper({
    children,
    ...props
}: Omit<ErrorBoundaryProps, 'children'> & { children: ReactNode }) {
    return <ErrorBoundary {...props}>{children}</ErrorBoundary>;
}
