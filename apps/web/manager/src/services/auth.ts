/**
 * Authentication Service
 * Handles all auth-related operations with Supabase
 */
import { createClient } from "@mfc/supabase-config";
import type { ApiResponse } from "@/types/api";
import { LoginCredentials } from "@/types/credintials";
import { AuthError } from "@supabase/supabase-js";

export class AuthService {
  /**
   * Login with email and password
   * Profile validation happens in AuthContext after successful login
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      return {
        success: true,
        data: data.session,
        message: "Login successful",
      };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred during login",
      };
    }
  }

  /**
   * Login with Google OAuth
   * Redirects to Google for authentication
   */
  static async loginWithGoogle(): Promise<ApiResponse> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.formatAuthError(error),
        };
      }

      return {
        success: true,
        data,
      };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred during Google login",
      };
    }
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<ApiResponse> {
    try {
      // Prefer server-side logout to clear cookies used by middleware
      await fetch("/auth/logout", { method: "POST" });

      // Clear cached profile from sessionStorage (use the central key)
      if (typeof window !== "undefined") {
        const { authConfig } = await import("@mfc/supabase-config");
        sessionStorage.removeItem(authConfig.cacheKey);
      }

      return {
        success: true,
        message: "Logout successful",
      };
    } catch {
      return {
        success: false,
        error: "An unexpected error occurred during logout",
      };
    }
  }

  /**
   * Format Supabase auth errors into user-friendly messages
   */
  private static formatAuthError(error: AuthError): string {
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please try again.";
      case "Email not confirmed":
        return "Please verify your email address before logging in.";
      case "User not found":
        return "No account found with this email address.";
      case "Invalid email":
        return "Please enter a valid email address.";
      default:
        return error.message || "Authentication failed. Please try again.";
    }
  }
}
