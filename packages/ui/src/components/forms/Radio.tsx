/**
 * Radio Component
 * 
 * A form radio button group component with accessibility support.
 */
import React, { InputHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from './Form';

export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> {
    name: string;
    label?: string;
    options: RadioOption[];
    error?: string;
    helperText?: string;
    className?: string;
}

export function Radio({
    name,
    label,
    options,
    error: externalError,
    helperText,
    className,
    onBlur,
    onChange,
    ...props
}: RadioProps) {
    const formContext = useFormContext();
    const groupId = useId();
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
        <div className={clsx('mfc-radio-wrapper', className)}>
            {label && (
                <div className="mfc-radio-group-label" id={groupId}>
                    {label}
                    {props.required && <span className="mfc-radio-required" aria-label="required">*</span>}
                </div>
            )}

            <div
                role="radiogroup"
                aria-labelledby={label ? groupId : undefined}
                aria-invalid={hasError}
                aria-describedby={clsx({
                    [errorId]: hasError,
                    [helperId]: helperText && !hasError,
                })}
                className="mfc-radio-group"
            >
                {options.map((option) => {
                    const optionId = `${groupId}-${option.value}`;
                    return (
                        <div key={option.value} className="mfc-radio-option">
                            <input
                                {...props}
                                id={optionId}
                                name={name}
                                type="radio"
                                value={option.value}
                                disabled={option.disabled}
                                onBlur={handleBlur}
                                onChange={handleChange}
                                className={clsx('mfc-radio', {
                                    'mfc-radio--error': hasError,
                                })}
                            />
                            <label htmlFor={optionId} className="mfc-radio-label">
                                {option.label}
                            </label>
                        </div>
                    );
                })}
            </div>

            {hasError && (
                <div id={errorId} className="mfc-radio-error" role="alert">
                    {error}
                </div>
            )}

            {helperText && !hasError && (
                <div id={helperId} className="mfc-radio-helper">
                    {helperText}
                </div>
            )}
        </div>
    );
}
