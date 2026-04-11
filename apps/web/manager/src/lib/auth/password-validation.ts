// Password validation utilities

import type {
    PasswordValidation,
    PasswordStrength,
} from '@/types/password';

/**
 * Validate password against security requirements
 */
export function validatePassword(password: string): PasswordValidation {
    return {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
}

/**
 * Check if password meets all requirements
 */
export function isPasswordValid(password: string): boolean {
    const validation = validatePassword(password);
    return (
        validation.minLength &&
        validation.hasUpperCase &&
        validation.hasLowerCase &&
        validation.hasNumber
        // Special char is optional but recommended
    );
}

/**
 * Check if passwords match
 */
export function doPasswordsMatch(
    password: string,
    confirmPassword: string
): boolean {
    return password === confirmPassword && password.length > 0;
}

/**
 * Calculate password strength score
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
    const validation = validatePassword(password);
    let score = 0;

    // Base requirements
    if (validation.minLength) score++;
    if (validation.hasUpperCase) score++;
    if (validation.hasLowerCase) score++;
    if (validation.hasNumber) score++;
    if (validation.hasSpecialChar) score++;

    // Additional length bonus
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Normalize score to 0-4
    const normalizedScore = Math.min(Math.floor(score / 2), 4);

    const strengthMap: Record<
        number,
        { label: PasswordStrength['label']; color: string }
    > = {
        0: { label: 'weak', color: 'text-red-500' },
        1: { label: 'fair', color: 'text-orange-500' },
        2: { label: 'good', color: 'text-yellow-500' },
        3: { label: 'strong', color: 'text-green-500' },
        4: { label: 'very-strong', color: 'text-emerald-500' },
    };

    const strength = strengthMap[normalizedScore] || strengthMap[0]!;
    return {
        score: normalizedScore,
        label: strength.label,
        color: strength.color,
    };
}

/**
 * Get validation error messages
 */
export function getPasswordValidationErrors(
    password: string
): string[] {
    const validation = validatePassword(password);
    const errors: string[] = [];

    if (!validation.minLength) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!validation.hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!validation.hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!validation.hasNumber) {
        errors.push('Password must contain at least one number');
    }

    return errors;
}

/**
 * Get password strength description
 */
export function getPasswordStrengthDescription(
    strength: PasswordStrength
): string {
    const descriptions: Record<PasswordStrength['label'], string> = {
        weak: 'Your password is weak. Consider adding more characters and variety.',
        fair: 'Your password is fair. Add more characters for better security.',
        good: 'Your password is good. Consider adding special characters.',
        strong: 'Your password is strong!',
        'very-strong': 'Excellent! Your password is very strong.',
    };

    return descriptions[strength.label];
}
