/**
 * Form Component
 * 
 * A wrapper component that provides form context, validation, and submission handling.
 * Supports both controlled and uncontrolled forms with built-in error handling.
 */
import React, { FormEvent, ReactNode, createContext, useContext, useState } from 'react';
import { clsx } from 'clsx';

// ============================================================================
// TYPES
// ============================================================================

export interface FormContextValue {
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    setFieldError: (name: string, error: string) => void;
    setFieldTouched: (name: string) => void;
    clearFieldError: (name: string) => void;
}

export interface FormProps {
    /** Form content */
    children: ReactNode;
    /** Submit handler */
    onSubmit: (data: FormData) => void | Promise<void>;
    /** Validation function */
    validate?: (data: FormData) => Record<string, string> | Promise<Record<string, string>>;
    /** Additional CSS classes */
    className?: string;
    /** Form ID */
    id?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext() {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a Form component');
    }
    return context;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function Form({ children, onSubmit, validate, className, id }: FormProps) {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setFieldError = (name: string, error: string) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const setFieldTouched = (name: string) => {
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const clearFieldError = (name: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        // Run validation if provided
        if (validate) {
            const validationErrors = await validate(formData);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                return;
            }
        }

        // Clear errors and submit
        setErrors({});
        setIsSubmitting(true);

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
            setFieldError('_form', error instanceof Error ? error.message : 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contextValue: FormContextValue = {
        errors,
        touched,
        isSubmitting,
        setFieldError,
        setFieldTouched,
        clearFieldError,
    };

    return (
        <FormContext.Provider value={contextValue}>
            <form
                id={id}
                onSubmit={handleSubmit}
                className={clsx('mfc-form', className)}
                noValidate
            >
                {children}
                {errors._form && (
                    <div className="mfc-form-error" role="alert">
                        {errors._form}
                    </div>
                )}
            </form>
        </FormContext.Provider>
    );
}
