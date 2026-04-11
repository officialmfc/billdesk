/**
 * Autocomplete Component
 * 
 * A unified autocomplete component for all autocomplete needs with search,
 * keyboard navigation, and accessibility support.
 */
import React, { useState, useRef, useEffect, useId, KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import { useFormContext } from './Form';

// ============================================================================
// TYPES
// ============================================================================

export interface AutocompleteOption<T = any> {
    value: string;
    label: string;
    data?: T;
}

export interface AutocompleteProps<T = any> {
    /** Input name (required for form handling) */
    name: string;
    /** Input label */
    label?: string;
    /** Options to display */
    options: AutocompleteOption<T>[];
    /** Selected value */
    value?: string;
    /** Change handler */
    onChange: (value: string, option: AutocompleteOption<T> | null) => void;
    /** Error message (overrides form context error) */
    error?: string;
    /** Helper text */
    helperText?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Loading state */
    loading?: boolean;
    /** Minimum characters before showing suggestions */
    minChars?: number;
    /** Additional CSS classes */
    className?: string;
    /** Allow custom values not in options */
    allowCustom?: boolean;
    /** Debounce delay in ms */
    debounceMs?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Autocomplete<T = any>({
    name,
    label,
    options,
    value,
    onChange,
    error: externalError,
    helperText,
    required,
    placeholder = 'Type to search...',
    loading = false,
    minChars = 1,
    className,
    allowCustom = false,
    debounceMs = 300,
}: AutocompleteProps<T>) {
    const formContext = useFormContext();
    const inputId = useId();
    const listId = useId();
    const errorId = useId();
    const helperId = useId();

    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    const error = externalError || formContext.errors[name];
    const hasError = Boolean(error);

    // Filter options based on input
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.value.toLowerCase().includes(inputValue.toLowerCase())
    );

    const showDropdown = isOpen && inputValue.length >= minChars && (filteredOptions.length > 0 || loading);

    useEffect(() => {
        // Set input value from selected value
        const selectedOption = options.find(opt => opt.value === value);
        if (selectedOption) {
            setInputValue(selectedOption.label);
        }
    }, [value, options]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        setIsOpen(true);
        setHighlightedIndex(-1);

        // Clear selection if input is cleared
        if (!newValue) {
            onChange('', null);
        }

        // Debounce for external search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            if (hasError) {
                formContext.clearFieldError(name);
            }
        }, debounceMs);
    };

    const handleOptionSelect = (option: AutocompleteOption<T>) => {
        setInputValue(option.label);
        onChange(option.value, option);
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleOptionSelect(filteredOptions[highlightedIndex]);
                } else if (allowCustom && inputValue) {
                    onChange(inputValue, null);
                    setIsOpen(false);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleBlur = () => {
        formContext.setFieldTouched(name);
        // Delay to allow option click to register
        setTimeout(() => {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }, 200);
    };

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
            highlightedElement?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex]);

    return (
        <div className={clsx('mfc-autocomplete-wrapper', className)}>
            {label && (
                <label htmlFor={inputId} className="mfc-autocomplete-label">
                    {label}
                    {required && <span className="mfc-autocomplete-required" aria-label="required">*</span>}
                </label>
            )}

            <div className="mfc-autocomplete-input-wrapper">
                <input
                    ref={inputRef}
                    id={inputId}
                    name={name}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    autoComplete="off"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-controls={listId}
                    aria-expanded={showDropdown}
                    aria-activedescendant={
                        highlightedIndex >= 0 ? `${listId}-option-${highlightedIndex}` : undefined
                    }
                    aria-invalid={hasError}
                    aria-describedby={clsx({
                        [errorId]: hasError,
                        [helperId]: helperText && !hasError,
                    })}
                    className={clsx(
                        'mfc-autocomplete-input',
                        {
                            'mfc-autocomplete-input--error': hasError,
                            'mfc-autocomplete-input--open': showDropdown,
                        }
                    )}
                />

                {loading && (
                    <div className="mfc-autocomplete-loading" aria-label="Loading">
                        ...
                    </div>
                )}
            </div>

            {showDropdown && (
                <ul
                    ref={listRef}
                    id={listId}
                    role="listbox"
                    className="mfc-autocomplete-list"
                >
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.value}
                            id={`${listId}-option-${index}`}
                            role="option"
                            aria-selected={highlightedIndex === index}
                            className={clsx('mfc-autocomplete-option', {
                                'mfc-autocomplete-option--highlighted': highlightedIndex === index,
                            })}
                            onMouseDown={() => handleOptionSelect(option)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}

            {hasError && (
                <div id={errorId} className="mfc-autocomplete-error" role="alert">
                    {error}
                </div>
            )}

            {helperText && !hasError && (
                <div id={helperId} className="mfc-autocomplete-helper">
                    {helperText}
                </div>
            )}
        </div>
    );
}
