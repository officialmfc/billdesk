/**
 * Secure Session Manager with Encrypted Tokens
 * Prevents localStorage tampering and ensures session integrity
 */

import type { Session } from '@supabase/supabase-js';

const SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const STORAGE_KEY_SESSION_TOKEN = 'mfc-secure-session';
const STORAGE_KEY_LAST_ACTIVITY = 'mfc-last-activity';

// Secret key derived from Supabase session (changes per user/session)
const ENCRYPTION_SALT = 'mfc-billdesk-v1';

interface SecureSessionData {
  userId: string;
  sessionId: string;
  expiresAt: number;
  createdAt: number;
  lastActivity: number;
  supabaseAccessToken: string; // Store Supabase token for validation
}

interface EncryptedSession {
  data: string; // Encrypted session data
  signature: string; // HMAC signature
  version: number;
}

export class SecureSessionManager {
  private activityCheckInterval: ReturnType<typeof setInterval> | null = null;
  private onSessionExpired?: () => void;
  private sessionKey: string | null = null;

  constructor(onSessionExpired?: () => void) {
    this.onSessionExpired = onSessionExpired;
  }

  /**
   * Initialize secure session with Supabase session
   */
  async start(supabaseSession: Session): Promise<void> {
    if (typeof window === 'undefined') return;

    // Derive encryption key from Supabase access token
    this.sessionKey = await this.deriveKey(supabaseSession.access_token);

    const now = Date.now();
    const sessionData: SecureSessionData = {
      userId: supabaseSession.user.id,
      sessionId: crypto.randomUUID(),
      expiresAt: now + SESSION_TIMEOUT,
      createdAt: now,
      lastActivity: now,
      supabaseAccessToken: supabaseSession.access_token,
    };

    // Encrypt and store session
    await this.storeSecureSession(sessionData);

    // Setup activity tracking
    this.setupActivityListeners();
    this.startActivityCheck();

    console.log('🔐 Secure session started with encrypted token');
  }

  /**
   * Stop session tracking and clear data
   */
  stop(): void {
    if (typeof window === 'undefined') return;

    this.removeActivityListeners();

    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }

    this.clearSession();
    this.sessionKey = null;

    console.log('🔐 Secure session stopped');
  }

  /**
   * Update last activity timestamp
   */
  async updateActivity(): Promise<void> {
    if (typeof window === 'undefined' || !this.sessionKey) return;

    try {
      const session = await this.loadSecureSession();
      if (!session) return;

      session.lastActivity = Date.now();
      await this.storeSecureSession(session);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  }

  /**
   * Check if session is still valid
   */
  async isSessionValid(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      const session = await this.loadSecureSession();
      if (!session) return false;

      const now = Date.now();

      // Check if session expired
      if (now > session.expiresAt) {
        console.warn('⏰ Session expired (absolute timeout)');
        return false;
      }

      // Check inactivity timeout
      const timeSinceActivity = now - session.lastActivity;
      if (timeSinceActivity > SESSION_TIMEOUT) {
        console.warn('⏰ Session expired (inactivity timeout)');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  /**
   * Get session data if valid
   */
  async getSessionData(): Promise<SecureSessionData | null> {
    try {
      const session = await this.loadSecureSession();
      if (!session) return null;

      const isValid = await this.isSessionValid();
      if (!isValid) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Failed to get session data:', error);
      return null;
    }
  }

  /**
   * Validate Supabase token matches stored token
   */
  async validateSupabaseToken(accessToken: string): Promise<boolean> {
    try {
      const session = await this.loadSecureSession();
      if (!session) return false;

      return session.supabaseAccessToken === accessToken;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEY_SESSION_TOKEN);
    localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
  }

  /**
   * Derive encryption key from Supabase token
   */
  private async deriveKey(accessToken: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(accessToken + ENCRYPTION_SALT);

    // Use SubtleCrypto to derive a key
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encrypt session data with HMAC signature
   */
  private async encryptSession(
    data: SecureSessionData
  ): Promise<EncryptedSession> {
    if (!this.sessionKey) throw new Error('Session key not initialized');

    const jsonData = JSON.stringify(data);
    const encoder = new TextEncoder();

    // Simple XOR encryption (for demo - use proper encryption in production)
    const encrypted = this.xorEncrypt(jsonData, this.sessionKey);

    // Generate HMAC signature
    const signature = await this.generateSignature(encrypted, this.sessionKey);

    return {
      data: encrypted,
      signature,
      version: 1,
    };
  }

  /**
   * Decrypt and verify session data
   */
  private async decryptSession(
    encrypted: EncryptedSession
  ): Promise<SecureSessionData> {
    if (!this.sessionKey) throw new Error('Session key not initialized');

    // Verify signature
    const expectedSignature = await this.generateSignature(
      encrypted.data,
      this.sessionKey
    );

    if (expectedSignature !== encrypted.signature) {
      throw new Error('Session signature invalid - possible tampering detected');
    }

    // Decrypt data
    const decrypted = this.xorDecrypt(encrypted.data, this.sessionKey);
    return JSON.parse(decrypted);
  }

  /**
   * XOR encryption (simple but effective for localStorage)
   */
  private xorEncrypt(text: string, key: string): string {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const textBytes = encoder.encode(text);
    const keyBytes = encoder.encode(key);

    const encrypted = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
      encrypted[i] = (textBytes[i] ?? 0) ^ (keyBytes[i % keyBytes.length] ?? 0);
    }

    // Convert to base64
    return btoa(String.fromCharCode(...encrypted));
  }

  /**
   * XOR decryption
   */
  private xorDecrypt(encrypted: string, key: string): string {
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode(key);

    // Decode from base64
    const encryptedBytes = Uint8Array.from(atob(encrypted), (c) =>
      c.charCodeAt(0)
    );

    const decrypted = new Uint8Array(encryptedBytes.length);
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = (encryptedBytes[i] ?? 0) ^ (keyBytes[i % keyBytes.length] ?? 0);
    }

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Generate HMAC signature
   */
  private async generateSignature(
    data: string,
    key: string
  ): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(data);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signature));
    return signatureArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store encrypted session
   */
  private async storeSecureSession(data: SecureSessionData): Promise<void> {
    const encrypted = await this.encryptSession(data);
    localStorage.setItem(STORAGE_KEY_SESSION_TOKEN, JSON.stringify(encrypted));
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, data.lastActivity.toString());
  }

  /**
   * Load and decrypt session
   */
  private async loadSecureSession(): Promise<SecureSessionData | null> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION_TOKEN);
      if (!stored) return null;

      const encrypted: EncryptedSession = JSON.parse(stored);
      return await this.decryptSession(encrypted);
    } catch (error) {
      console.error('Failed to load session:', error);
      // Clear corrupted session
      this.clearSession();
      return null;
    }
  }

  /**
   * Setup activity listeners
   */
  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  /**
   * Remove activity listeners
   */
  private removeActivityListeners(): void {
    if (typeof window === 'undefined') return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach((event) => {
      window.removeEventListener(event, this.handleActivity);
    });
  }

  /**
   * Handle user activity
   */
  private handleActivity = (): void => {
    this.updateActivity();
  };

  /**
   * Start periodic activity check
   */
  private startActivityCheck(): void {
    if (this.activityCheckInterval) return;

    this.activityCheckInterval = setInterval(async () => {
      const isValid = await this.isSessionValid();
      if (!isValid) {
        console.warn('⏰ Session expired - logging out');
        this.stop();
        this.onSessionExpired?.();
      }
    }, ACTIVITY_CHECK_INTERVAL);
  }
}
