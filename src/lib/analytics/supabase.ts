/**
 * Supabase Analytics Integration
 *
 * Simple, effective analytics using Supabase instead of third-party services
 */

import { supabase, isSupabaseConfigured } from '../supabase/client';
import { storage } from '../config/localStorage';

let isInitialized = false;

/**
 * Initialize analytics
 * Just checks if Supabase is configured
 */
export function initializeAnalytics(): void {
  if (isInitialized) {
    console.log('[Analytics] Already initialized');
    return;
  }

  if (!isSupabaseConfigured()) {
    console.warn('[Analytics] Supabase not configured - analytics disabled');
    return;
  }

  console.log('[Analytics] Initialized successfully');
  isInitialized = true;
}

/**
 * Track an analytics event
 *
 * @param eventName - Name of the event (e.g., 'license_activated')
 * @param properties - Optional event properties
 *
 * @example
 * trackEvent('button_clicked', { button_name: 'purchase' });
 */
export async function trackEvent(
  eventName: string,
  properties?: Record<string, any>
): Promise<void> {
  if (!isInitialized || !isSupabaseConfigured()) {
    // Silently fail if not configured
    return;
  }

  try {
    // Get license key to identify user
    const licenseKey = storage.getLicenseKey();

    const { error } = await supabase.functions.invoke('track-event', {
      body: {
        event_name: eventName,
        properties: {
          ...properties,
          license_key: licenseKey || undefined,
        },
      },
    });

    if (error) {
      console.error('[Analytics] Error tracking event:', eventName, error);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track event:', eventName, error);
  }
}

/**
 * Track an error
 *
 * @param errorType - Type/category of error
 * @param errorMessage - Error message
 * @param context - Additional context
 *
 * @example
 * trackError('api_error', 'Failed to validate license', { endpoint: '/validate' });
 */
export async function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, any>
): Promise<void> {
  await trackEvent('error', {
    error_type: errorType,
    error_message: errorMessage,
    ...context,
  });
}

/**
 * Analytics Event Names
 * Centralized event name constants for consistency
 */
export const AnalyticsEvents = {
  // App lifecycle
  APP_OPENED: 'app_opened',
  APP_CLOSED: 'app_closed',
  PLUGIN_OPENED: 'plugin_opened',
  SESSION_ENDED: 'session_ended',

  // Navigation
  SCREEN_VIEWED: 'screen_viewed',
  LOGIN_SCREEN_VIEWED: 'login_screen_viewed',

  // License & Authentication
  LICENSE_ACTIVATED: 'license_activated',
  LICENSE_VALIDATION_FAILED: 'license_validation_failed',
  LOGIN_ATTEMPT: 'login_attempt',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  SIGN_OUT_CLICKED: 'sign_out_clicked',

  // Subscription & Expiration
  LICENSE_EXPIRED_MODAL_SHOWN: 'license_expired_modal_shown',
  LICENSE_RENEWED: 'license_renewed_from_modal',
  OFFLINE_MODAL_SHOWN: 'offline_modal_shown',
  OFFLINE_RETRY: 'offline_retry_attempt',

  // Purchase Flow
  BUY_NOW_CLICKED: 'buy_now_clicked',
  PAYWALL_SHOWN: 'paywall_shown',
  LICENSE_INPUT_OPENED: 'license_input_opened',

  // Errors
  ERROR: 'error',
} as const;

/**
 * Track a screen view
 *
 * @param screenName - Name of the screen
 */
export function trackScreenView(screenName: string): void {
  trackEvent(AnalyticsEvents.SCREEN_VIEWED, { screen_name: screenName });
}

/**
 * Identify user (called on license activation)
 * With Supabase, user is automatically identified via license_key
 *
 * @param licenseKey - User's license key
 */
export function identifyUser(licenseKey: string): void {
  // User identification happens automatically via license_key
  // No need for separate identify call
  console.log('[Analytics] User identified via license key');
}

/**
 * Reset user identity (on logout)
 * With Supabase, we just stop sending license_key with events
 */
export function resetUser(): void {
  // User will be tracked as anonymous after logout
  // since getLicenseKey() will return null
  console.log('[Analytics] User reset - will track as anonymous');
}

/**
 * Check if analytics is initialized
 */
export function isAnalyticsInitialized(): boolean {
  return isInitialized;
}
