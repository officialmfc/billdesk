/**
 * Session Manager
 * Handles session persistence and 6-hour inactivity timeout
 */

const SESSION_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const STORAGE_KEY_LAST_ACTIVITY = 'mfc-last-activity';
const STORAGE_KEY_SESSION_START = 'mfc-session-start';

export class SessionManager {
  private activityCheckInterval: ReturnType<typeof setInterval> | null = null;
  private onSessionExpired?: () => void;

  constructor(onSessionExpired?: () => void) {
    this.onSessionExpired = onSessionExpired;
  }

  /**
   * Initialize session tracking
   */
  start(): void {
    if (typeof window === 'undefined') return;

    // Record session start
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_SESSION_START, now.toString());
    this.updateActivity();

    // Listen for user activity
    this.setupActivityListeners();

    // Start periodic check
    this.startActivityCheck();
  }

  /**
   * Stop session tracking
   */
  stop(): void {
    if (typeof window === 'undefined') return;

    this.removeActivityListeners();

    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
      this.activityCheckInterval = null;
    }
  }

  /**
   * Update last activity timestamp
   */
  updateActivity(): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVITY, now.toString());
  }

  /**
   * Check if session is still valid
   */
  isSessionValid(): boolean {
    if (typeof window === 'undefined') return true;

    const lastActivity = localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY);
    if (!lastActivity) return false;

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;

    return timeSinceActivity < SESSION_TIMEOUT;
  }

  /**
   * Get time remaining until session expires
   */
  getTimeRemaining(): number {
    if (typeof window === 'undefined') return SESSION_TIMEOUT;

    const lastActivity = localStorage.getItem(STORAGE_KEY_LAST_ACTIVITY);
    if (!lastActivity) return 0;

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;
    const remaining = SESSION_TIMEOUT - timeSinceActivity;

    return Math.max(0, remaining);
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(STORAGE_KEY_LAST_ACTIVITY);
    localStorage.removeItem(STORAGE_KEY_SESSION_START);
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

    this.activityCheckInterval = setInterval(() => {
      if (!this.isSessionValid()) {
        console.warn('⏰ Session expired due to inactivity (6 hours)');
        this.stop();
        this.onSessionExpired?.();
      }
    }, ACTIVITY_CHECK_INTERVAL);
  }
}
