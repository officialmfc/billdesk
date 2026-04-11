/**
 * Select Component
 * 
 * A form select component with search functionality and accessibility support.
 */
import React, { SelectHTMLAttributes, useId, useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from './Form';

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
    /** Select name (required for form handling) */
    name: string;
    /** Select label */
    label?: string;
    /** Options to display */
    options: SelectOption[];
    /** Error message (overrides form context error) */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Enable search functionality */
    searchable?: boolean;
    /** Additional CSS classes */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Select({
    name,
    label,
    options,
    error: externalError,
    helperText,
    required,
    placeholder = 'Select an option',
    searchable = false,
    className,
    onBlur,
    onChange,
    ...props
}: SelectProps) {
    const formContext = useFormContext();
    const selectId = useId();
    const errorId = useId();
    const helperId = useId();
    const [searchTerm, setSearchTerm] = useState('');

    const error = externalError || formContext.errors[name];
    const hasError = Boolean(error);

    const filteredOptions = useMemo(() => {
        if (!searchable || !searchTerm) return options;

        const term = searchTerm.toLowerCase();
        return options.filter(option =>
            option.label.toLowerCase().includes(term) ||
            option.value.toLowerCase().includes(term)
        );
    }, [options, searchTerm, searchable]);

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
        formContext.setFieldTouched(name);
        onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (hasError) {
            formContext.clearFieldError(name);
        }
        onChange?.(e);
    };

    return (
        <div className={clsx('mfc-select-wrapper', className)}>
            {label && (
                <label htmlFor={selectId} className="mfc-select-label">
                    {label}
                    {required && <span className="mfc-select-required" aria-label="required">*</span>}
                </label>
            )}

            {searchable && (
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mfc-select-search"
                    aria-label="Search options"
                />
            )}

            <select
                {...props}
                id={selectId}
                name={name}
                required={required}
                onBlur={handleBlur}
                onChange={handleChange}
                className={clsx(
                    'mfc-select',
                    {
                        'mfc-select--error': hasError,
                        'mfc-select--disabled': props.disabled,
                    }
                )}
                aria-invalid={hasError}
                aria-describedby={clsx({
                    [errorId]: hasError,
                    [helperId]: helperText && !hasError,
                })}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {filteredOptions.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {hasError && (
                <div id={errorId} className="mfc-select-error" role="alert">
                    {error}
                </div>
            )}

            {helperText && !hasError && (
                <div id={helperId} className="mfc-select-helper">
                    {helperText}
                </div>
            )}
        </div>
    );
}
