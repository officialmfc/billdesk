/**
 * Checkbox Component
 * 
 * A form checkbox component with accessibility support.
 */
import React, { InputHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from './Form';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
    name: string;
    label: string;
    error?: string;
    helperText?: string;
    className?: string;
}

export function Checkbox({
    name,
    label,
    error: externalError,
    helperText,
    className,
    onBlur,
    onChange,
    ...props
}: CheckboxProps) {
    const formContext = useFormContext();
    const checkboxId = useId();
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
        <div className={clsx('mfc-checkbox-wrapper', className)}>
            <div className="mfc-checkbox-control">
                <input
                    {...props}
                    id={checkboxId}
                    name={name}
                    type="checkbox"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className={clsx('mfc-checkbox', {
                        'mfc-checkbox--error': hasError,
                    })}
                    aria-invalid={hasError}
                    aria-describedby={clsx({
                        [errorId]: hasError,
                        [helperId]: helperText && !hasError,
                    })}
                />
                <label htmlFor={checkboxId} className="mfc-checkbox-label">
                    {label}
                </label>
            </div>

            {hasError && (
                <div id={errorId} className="mfc-checkbox-error" role="alert">
                    {error}
                </div>
            )}

            {helperText && !hasError && (
                <div id={helperId} className="mfc-checkbox-helper">
                    {helperText}
                </div>
            )}
        </div>
    );
}
