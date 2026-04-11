/**
 * Input Component
 * 
 * A form input component with built-in validation, error states, and accessibility.
 */
import React, { InputHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from './Form';

// ============================================================================
// TYPES
// ============================================================================

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    /** Input name (required for form handling) */
    name: string;
    /** Input label */
    label?: string;
    /** Error message (overrides form context error) */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Input variant */
    variant?: 'default' | 'filled' | 'outlined';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Input({
    name,
    label,
    error: externalError,
    helperText,
    required,
    className,
    variant = 'default',
    onBlur,
    onChange,
    ...props
}: InputProps) {
    const formContext = useFormContext();
    const inputId = useId();
    const errorId = useId();
    const helperId = useId();

    const error = externalError || formContext.errors[name];
    const hasError = Boolean(error);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        formContext.setFieldTouched(name);
        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (hasError) {
            formContext.clearFieldError(name);
        }
        onChange?.(e);
    };

    return (
        <div className={clsx('mfc-input-wrapper', className)}>
            {label && (
                <label htmlFor={inputId} className="mfc-input-label">
                    {label}
                    {required && <span className="mfc-input-required" aria-label="required">*</span>}
                </label>
            )}

            <input
                {...props}
                id={inputId}
                name={name}
                required={required}
                onBlur={handleBlur}
                onChange={handleChange}
                className={clsx(
                    'mfc-input',
                    `mfc-input--${variant}`,
                    {
                        'mfc-input--error': hasError,
                        'mfc-input--disabled': props.disabled,
                    }
                )}
                aria-invalid={hasError}
                aria-describedby={clsx({
                    [errorId]: hasError,
                    [helperId]: helperText && !hasError,
                })}
            />

            {hasError && (
                <div id={errorId} className="mfc-input-error" role="alert">
                    {error}
                </div>
            )}

            {helperText && !hasError && (
                <div id={helperId} className="mfc-input-helper">
                    {helperText}
                </div>
            )}
        </div>
    );
}
