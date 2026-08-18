/**
 * Session Tracking
 *
 * Tracks user sessions (start, end, duration)
 */

import { trackEvent, AnalyticsEvents } from './supabase';
import { storage } from '../config/localStorage';

const SESSION_START_KEY = 'session_start_time';

/**
 * Start a new analytics session
 * Called when the plugin opens
 */
export function startSession(): void {
  try {
    // Store session start time
    const startTime = Date.now();
    sessionStorage.setItem(SESSION_START_KEY, String(startTime));

    // Get user tier
    const hasLicense = storage.hasValidLicense();
    const tier = hasLicense ? 'premium' : 'free';

    // Track session start
    trackEvent(AnalyticsEvents.PLUGIN_OPENED, {
      tier,
      timestamp: new Date().toISOString(),
    });

    console.log('[Session] Session started');
  } catch (error) {
    console.error('[Session] Error starting session:', error);
  }
}

/**
 * End the current analytics session
 * Called when the plugin closes or becomes hidden
 */
export function endSession(): void {
  try {
    const startTimeStr = sessionStorage.getItem(SESSION_START_KEY);

    if (!startTimeStr) {
      // No active session
      return;
    }

    const startTime = parseInt(startTimeStr, 10);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Get user tier
    const hasLicense = storage.hasValidLicense();
    const tier = hasLicense ? 'premium' : 'free';

    // Track session end with duration
    trackEvent(AnalyticsEvents.SESSION_ENDED, {
      session_duration: duration,
      tier,
      timestamp: new Date().toISOString(),
    });

    // Clear session start time
    sessionStorage.removeItem(SESSION_START_KEY);

    console.log('[Session] Session ended. Duration:', duration, 'ms');
  } catch (error) {
    console.error('[Session] Error ending session:', error);
  }
}

/**
 * Get current session duration in milliseconds
 * Returns null if no active session
 */
export function getSessionDuration(): number | null {
  try {
    const startTimeStr = sessionStorage.getItem(SESSION_START_KEY);

    if (!startTimeStr) {
      return null;
    }

    const startTime = parseInt(startTimeStr, 10);
    return Date.now() - startTime;
  } catch (error) {
    console.error('[Session] Error getting session duration:', error);
    return null;
  }
}

/**
 * Check if session is active
 */
export function hasActiveSession(): boolean {
  return sessionStorage.getItem(SESSION_START_KEY) !== null;
}

