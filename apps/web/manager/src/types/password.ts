// Password-related types and interfaces

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
}

export interface PasswordChangeResponse {
    success: boolean;
    error?: string;
    message?: string;
}

export interface PasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordValidation {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
}

export interface PasswordStrength {
    score: number; // 0-4
    label: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    color: string;
}

export enum PasswordChangeError {
    INVALID_CURRENT_PASSWORD = 'Current password is incorrect',
    WEAK_PASSWORD = 'Password does not meet security requirements',
    PASSWORD_MISMATCH = 'Passwords do not match',
    NETWORK_ERROR = 'Network error. Please try again',
    RATE_LIMIT = 'Too many attempts. Please try again later',
    UNKNOWN_ERROR = 'An unexpected error occurred',
}
