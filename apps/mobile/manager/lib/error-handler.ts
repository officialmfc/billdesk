import { captureAppException } from "@mfc/auth";
import Toast from 'react-native-toast-message';

export class ErrorHandler {
  /**
   * Handle errors and display user-friendly messages
   */
  static handle(error: Error | unknown, context: string): void {
    void captureAppException(error, {
      app: "manager-mobile",
      context,
    });

    // Log error for debugging
    console.error(`[${context}]`, error);
    
    // Determine error type and user message
    const userMessage = this.getUserMessage(error);
    
    // Display toast notification
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: userMessage,
      visibilityTime: 4000,
      position: 'top',
    });
  }

  /**
   * Convert error to user-friendly message
   */
  private static getUserMessage(error: Error | unknown): string {
    if (!(error instanceof Error)) {
      return 'An unexpected error occurred.';
    }

    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('timeout')) {
      return 'Request timed out. Please check your connection.';
    }
    if (message.includes('network request failed') || message.includes('fetch failed')) {
      return 'No internet connection. Please try again when online.';
    }
    if (message.includes('failed to fetch')) {
      return 'Unable to connect to server. Please check your connection.';
    }
    
    // Authentication errors
    if (message.includes('not authorized') || message.includes('unauthorized')) {
      return "You don't have permission to perform this action.";
    }
    if (message.includes('invalid credentials') || message.includes('invalid login')) {
      return 'Invalid email or password.';
    }
    if (message.includes('inactive') || message.includes('not active')) {
      return 'Your account is inactive. Please contact an administrator.';
    }
    if (message.includes('session expired') || message.includes('token expired')) {
      return 'Your session has expired. Please log in again.';
    }
    
    // Validation errors
    if (message.includes('required')) {
      return 'Please fill in all required fields.';
    }
    if (message.includes('invalid')) {
      return 'Please check your input and try again.';
    }
    
    // Server errors
    if (message.includes('500') || message.includes('internal server error')) {
      return 'Server error. Please try again later.';
    }
    if (message.includes('503') || message.includes('service unavailable')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    // Return original error message if no match
    return error.message || 'An unexpected error occurred.';
  }

  /**
   * Show success message
   */
  static showSuccess(message: string): void {
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    });
  }

  /**
   * Show info message
   */
  static showInfo(message: string): void {
    Toast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    });
  }

  /**
   * Show warning message
   */
  static showWarning(message: string): void {
    Toast.show({
      type: 'error', // Using error type for warnings as react-native-toast-message doesn't have warning
      text1: 'Warning',
      text2: message,
      visibilityTime: 3000,
      position: 'top',
    });
  }
}
