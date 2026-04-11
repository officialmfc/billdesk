/**
 * Validation Utilities
 * Common validation functions for forms and data validation
 */

// ============================================================================
// Basic Validators
// ============================================================================

/**
 * Validate email address
 * Supports standard email formats
 * @example isValidEmail('user@example.com') // true
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate Indian phone number
 * Supports 10-digit numbers and 12-digit numbers with country code (91)
 * @example isValidPhone('9876543210') // true
 * @example isValidPhone('919876543210') // true
 */
export function isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || (cleaned.length === 12 && cleaned.startsWith('91'));
}

/**
 * Validate international phone number
 * Supports various international formats
 * @example isValidInternationalPhone('+1-234-567-8900') // true
 */
export function isValidInternationalPhone(phone: string): boolean {
    if (!phone) return false;
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: any): boolean {
    const num = Number(value);
    return !isNaN(num) && num > 0;
}

/**
 * Validate non-negative number
 */
export function isNonNegativeNumber(value: any): boolean {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Validate date string (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;

    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove HTML tags
        .slice(0, 1000); // Limit length
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

/**
 * Validate required field
 */
export function isRequired(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
}

/**
 * Validate minimum length
 */
export function minLength(value: string, min: number): boolean {
    return value.length >= min;
}

/**
 * Validate maximum length
 */
export function maxLength(value: string, max: number): boolean {
    return value.length <= max;
}

/**
 * Validate number range
 */
export function inRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate alphanumeric string
 */
export function isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * Validate alphabetic string
 */
export function isAlphabetic(value: string): boolean {
    return /^[a-zA-Z\s]+$/.test(value);
}

/**
 * Validate numeric string
 */
export function isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
}

/**
 * Validate password strength
 * Returns: { valid: boolean, strength: 'weak' | 'medium' | 'strong', errors: string[] }
 * @example
 * const result = validatePassword('MyP@ssw0rd');
 * if (!result.valid) {
 *   console.log(result.errors);
 * }
 */
export function validatePassword(password: string): {
    valid: boolean;
    strength: 'weak' | 'medium' | 'strong';
    errors: string[];
} {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    // Determine strength
    if (errors.length === 0) {
        strength = 'strong';
    } else if (errors.length <= 2) {
        strength = 'medium';
    }

    return {
        valid: errors.length === 0,
        strength,
        errors,
    };
}

// ============================================================================
// Additional Common Validators
// ============================================================================

/**
 * Validate credit card number using Luhn algorithm
 * @example isValidCreditCard('4532015112830366') // true
 */
export function isValidCreditCard(cardNumber: string): boolean {
    if (!cardNumber) return false;

    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]!, 10);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

/**
 * Validate Indian PAN card number
 * Format: AAAAA9999A
 * @example isValidPAN('ABCDE1234F') // true
 */
export function isValidPAN(pan: string): boolean {
    if (!pan) return false;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan.toUpperCase());
}

/**
 * Validate Indian Aadhaar number
 * 12-digit number
 * @example isValidAadhaar('123456789012') // true
 */
export function isValidAadhaar(aadhaar: string): boolean {
    if (!aadhaar) return false;
    const cleaned = aadhaar.replace(/\D/g, '');
    return cleaned.length === 12;
}

/**
 * Validate Indian GST number
 * Format: 22AAAAA0000A1Z5
 * @example isValidGST('22AAAAA0000A1Z5') // true
 */
export function isValidGST(gst: string): boolean {
    if (!gst) return false;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
}

/**
 * Validate Indian IFSC code
 * Format: AAAA0BBBBBB
 * @example isValidIFSC('SBIN0001234') // true
 */
export function isValidIFSC(ifsc: string): boolean {
    if (!ifsc) return false;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    return ifscRegex.test(ifsc.toUpperCase());
}

/**
 * Validate postal code (supports multiple countries)
 * @example isValidPostalCode('110001', 'IN') // true
 */
export function isValidPostalCode(postalCode: string, country: 'IN' | 'US' | 'UK' = 'IN'): boolean {
    if (!postalCode) return false;

    const patterns: Record<string, RegExp> = {
        IN: /^[1-9][0-9]{5}$/,
        US: /^\d{5}(-\d{4})?$/,
        UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
    };

    return patterns[country]?.test(postalCode) || false;
}

/**
 * Validate username (alphanumeric with underscores, 3-20 chars)
 * @example isValidUsername('user_123') // true
 */
export function isValidUsername(username: string): boolean {
    if (!username) return false;
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
}

/**
 * Validate hex color code
 * @example isValidHexColor('#FF5733') // true
 */
export function isValidHexColor(color: string): boolean {
    if (!color) return false;
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
}

/**
 * Validate IP address (IPv4)
 * @example isValidIPv4('192.168.1.1') // true
 */
export function isValidIPv4(ip: string): boolean {
    if (!ip) return false;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every(part => {
        const num = parseInt(part, 10);
        return num >= 0 && num <= 255;
    });
}

/**
 * Validate MAC address
 * @example isValidMACAddress('00:1B:44:11:3A:B7') // true
 */
export function isValidMACAddress(mac: string): boolean {
    if (!mac) return false;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
}

/**
 * Validate file extension
 * @example isValidFileExtension('document.pdf', ['.pdf', '.doc']) // true
 */
export function isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    if (!filename) return false;
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.map(e => e.toLowerCase()).includes(ext);
}

/**
 * Validate file size (in bytes)
 * @example isValidFileSize(1024000, 2 * 1024 * 1024) // true (1MB < 2MB)
 */
export function isValidFileSize(sizeInBytes: number, maxSizeInBytes: number): boolean {
    return sizeInBytes > 0 && sizeInBytes <= maxSizeInBytes;
}

// ============================================================================
// Form Validation Helpers
// ============================================================================

/**
 * Validation result interface
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/**
 * Field validation result with field name
 */
export interface FieldValidationResult {
    field: string;
    valid: boolean;
    errors: string[];
}

/**
 * Form validation result with multiple fields
 */
export interface FormValidationResult {
    valid: boolean;
    errors: Record<string, string[]>;
}

/**
 * Validation rule type
 * Returns true if valid, or an error message string if invalid
 */
export type ValidationRule<T = any> = (value: T) => boolean | string;

/**
 * Create a validator function from multiple rules
 * @example
 * const validator = createValidator([
 *   ValidationRules.required(),
 *   ValidationRules.email()
 * ]);
 * const result = validator('user@example.com');
 */
export function createValidator<T = any>(
    rules: ValidationRule<T>[]
): (value: T) => ValidationResult {
    return (value: T) => {
        const errors: string[] = [];

        for (const rule of rules) {
            const result = rule(value);
            if (result === false) {
                errors.push('Validation failed');
            } else if (typeof result === 'string') {
                errors.push(result);
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    };
}

/**
 * Validate a single form field
 * @example
 * const result = validateField('email', 'user@example.com', [
 *   ValidationRules.required(),
 *   ValidationRules.email()
 * ]);
 */
export function validateField<T = any>(
    field: string,
    value: T,
    rules: ValidationRule<T>[]
): FieldValidationResult {
    const validator = createValidator(rules);
    const result = validator(value);

    return {
        field,
        ...result,
    };
}

/**
 * Validate multiple form fields
 * @example
 * const result = validateForm({
 *   email: { value: 'user@example.com', rules: [ValidationRules.required(), ValidationRules.email()] },
 *   phone: { value: '9876543210', rules: [ValidationRules.required(), ValidationRules.phone()] }
 * });
 */
export function validateForm<T extends Record<string, any>>(
    fields: Record<keyof T, { value: any; rules: ValidationRule[] }>
): FormValidationResult {
    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const [field, config] of Object.entries(fields)) {
        const result = validateField(field, config.value, config.rules);
        if (!result.valid) {
            errors[field] = result.errors;
            valid = false;
        }
    }

    return {
        valid,
        errors,
    };
}

/**
 * Get first error message from validation result
 */
export function getFirstError(result: ValidationResult | FieldValidationResult): string | null {
    return result.errors.length > 0 ? result.errors[0]! : null;
}

/**
 * Check if form has any errors
 */
export function hasErrors(result: FormValidationResult): boolean {
    return !result.valid;
}

/**
 * Get all error messages as a flat array
 */
export function getAllErrors(result: FormValidationResult): string[] {
    return Object.values(result.errors).flat();
}

// ============================================================================
// Validation Rule Builders
// ============================================================================

/**
 * Common validation rules for form fields
 * These are factory functions that return ValidationRule functions
 *
 * @example
 * const emailValidator = createValidator([
 *   ValidationRules.required(),
 *   ValidationRules.email()
 * ]);
 */
export const ValidationRules = {
    /**
     * Require a non-empty value
     */
    required: (message = 'This field is required'): ValidationRule => {
        return (value) => isRequired(value) || message;
    },

    /**
     * Validate email format
     */
    email: (message = 'Invalid email address'): ValidationRule => {
        return (value) => !value || isValidEmail(value) || message;
    },

    /**
     * Validate Indian phone number
     */
    phone: (message = 'Invalid phone number'): ValidationRule => {
        return (value) => !value || isValidPhone(value) || message;
    },

    /**
     * Validate international phone number
     */
    internationalPhone: (message = 'Invalid phone number'): ValidationRule => {
        return (value) => !value || isValidInternationalPhone(value) || message;
    },

    /**
     * Validate minimum string length
     */
    minLength: (min: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value) return true;
            return (
                minLength(value, min) ||
                message ||
                `Must be at least ${min} characters`
            );
        };
    },

    /**
     * Validate maximum string length
     */
    maxLength: (max: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value) return true;
            return (
                maxLength(value, max) ||
                message ||
                `Must be at most ${max} characters`
            );
        };
    },

    /**
     * Validate minimum numeric value
     */
    min: (min: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value && value !== 0) return true;
            const num = Number(value);
            return (
                num >= min ||
                message ||
                `Must be at least ${min}`
            );
        };
    },

    /**
     * Validate maximum numeric value
     */
    max: (max: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value && value !== 0) return true;
            const num = Number(value);
            return (
                num <= max ||
                message ||
                `Must be at most ${max}`
            );
        };
    },

    /**
     * Validate value is within a range
     */
    range: (min: number, max: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value && value !== 0) return true;
            const num = Number(value);
            return (
                inRange(num, min, max) ||
                message ||
                `Must be between ${min} and ${max}`
            );
        };
    },

    /**
     * Validate against a regex pattern
     */
    pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => {
        return (value) => !value || regex.test(value) || message;
    },

    /**
     * Validate URL format
     */
    url: (message = 'Invalid URL'): ValidationRule => {
        return (value) => !value || isValidURL(value) || message;
    },

    /**
     * Validate UUID format
     */
    uuid: (message = 'Invalid UUID'): ValidationRule => {
        return (value) => !value || isValidUUID(value) || message;
    },

    /**
     * Validate date format (YYYY-MM-DD)
     */
    date: (message = 'Invalid date format'): ValidationRule => {
        return (value) => !value || isValidDate(value) || message;
    },

    /**
     * Validate positive number
     */
    positive: (message = 'Must be a positive number'): ValidationRule => {
        return (value) => !value || isPositiveNumber(value) || message;
    },

    /**
     * Validate non-negative number
     */
    nonNegative: (message = 'Must be a non-negative number'): ValidationRule => {
        return (value) => !value || isNonNegativeNumber(value) || message;
    },

    /**
     * Validate alphanumeric string
     */
    alphanumeric: (message = 'Must contain only letters and numbers'): ValidationRule => {
        return (value) => !value || isAlphanumeric(value) || message;
    },

    /**
     * Validate alphabetic string
     */
    alphabetic: (message = 'Must contain only letters'): ValidationRule => {
        return (value) => !value || isAlphabetic(value) || message;
    },

    /**
     * Validate numeric string
     */
    numeric: (message = 'Must contain only numbers'): ValidationRule => {
        return (value) => !value || isNumeric(value) || message;
    },

    /**
     * Validate password strength
     */
    strongPassword: (message = 'Password does not meet security requirements'): ValidationRule => {
        return (value) => {
            if (!value) return true;
            const result = validatePassword(value);
            return result.valid || message;
        };
    },

    /**
     * Validate that two values match (e.g., password confirmation)
     */
    matches: (otherValue: any, message = 'Values do not match'): ValidationRule => {
        return (value) => value === otherValue || message;
    },

    /**
     * Validate value is one of allowed options
     */
    oneOf: (options: any[], message?: string): ValidationRule => {
        return (value) => {
            if (!value) return true;
            return (
                options.includes(value) ||
                message ||
                `Must be one of: ${options.join(', ')}`
            );
        };
    },

    /**
     * Validate array has minimum length
     */
    minItems: (min: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value) return true;
            if (!Array.isArray(value)) return 'Must be an array';
            return (
                value.length >= min ||
                message ||
                `Must have at least ${min} items`
            );
        };
    },

    /**
     * Validate array has maximum length
     */
    maxItems: (max: number, message?: string): ValidationRule => {
        return (value) => {
            if (!value) return true;
            if (!Array.isArray(value)) return 'Must be an array';
            return (
                value.length <= max ||
                message ||
                `Must have at most ${max} items`
            );
        };
    },

    /**
     * Custom validation function
     */
    custom: (fn: (value: any) => boolean, message: string): ValidationRule => {
        return (value) => fn(value) || message;
    },

    /**
     * Async validation (returns a promise)
     * Note: This should be used with async validation handlers
     */
    async: (fn: (value: any) => Promise<boolean>, message: string): ValidationRule => {
        return (value) => {
            // For sync validation, we can't handle async here
            // This is a placeholder that should be handled by async validation systems
            return true;
        };
    },
};
