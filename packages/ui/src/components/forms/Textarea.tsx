/**
 * Textarea Component
 * 
 * A form textarea component with character count and accessibility support.
 */
import React, { TextareaHTMLAttributes, useId, useState } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from './Form';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
    name: string;
    label?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    className?: string;
    showCharCount?: boolean;
    maxLength?: number;
    rows?: number;
}

export function Textarea({
    name,
    label,
    error: externalError,
    helperText,
    required,
    className,
    showCharCount = false,
    maxLength,
    rows = 4,
    onBlur,
    onChange,
    value,
    ...props
}: TextareaProps) {
    const formContext = useFormContext();
    const textareaId = useId();
    const errorId = useId();
    const helperId = useId();
    const [charCount, setCharCount] = useState(
        typeof value === 'string' ? value.length : 0
    );

    const error = externalError || formContext.errors[name];
    const hasError = Boolean(error);

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        formContext.setFieldTouched(name);
        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharCount(e.target.value.length);
        if (hasError) {
            formContext.clearFieldError(name);
        }
        onChange?.(e);
    };

    return (
        <div className={clsx('mfc-textarea-wrapper', className)}>
            {label && (
                <label htmlFor={textareaId} className="mfc-textarea-label">
                    {label}
                    {required && <span className="mfc-textarea-required" aria-label="required">*</span>}
                </label>
            )}

            <textarea
                {...props}
                id={textareaId}
                name={name}
                required={required}
                rows={rows}
                maxLength={maxLength}
                value={value}
                onBlur={handleBlur}
                onChange={handleChange}
                className={clsx(
                    'mfc-textarea',
                    {
                        'mfc-textarea--error': hasError,
                        'mfc-textarea--disabled': props.disabled,
                    }
                )}
                aria-invalid={hasError}
                aria-describedby={clsx({
                    [errorId]: hasError,
                    [helperId]: helperText && !hasError,
                })}
            />

            <div className="mfc-textarea-footer">
                {showCharCount && maxLength && (
                    <div className="mfc-textarea-char-count">
                        {charCount} / {maxLength}
                    </div>
                )}
            </div>

            {hasError && (
                <div id={errorId} className="mfc-textarea-error" role="alert">
                    {error}
                </div>
            )}

            {helperText && !hasError && (
                <div id={helperId} className="mfc-textarea-helper">
                    {helperText}
                </div>
            )}
        </div>
    );
}
