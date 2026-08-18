/**
 * User Identification for Analytics
 *
 * With Supabase analytics, users are automatically identified via license_key
 * This module provides helper functions for consistency with the old API
 */

import { trackEvent } from './supabase';
import { storage } from '../config/localStorage';

/**
 * Identify user (called on license activation)
 * With Supabase, users are automatically identified via license_key in events
 *
 * @param licenseKey - User's license key
 */
export function identifyUser(licenseKey: string): void {
  // User identification happens automatically in Supabase analytics
  // via the license_key sent with events
  console.log('[Analytics] User identified via license key');

  // Track license activation event
  trackEvent('license_activated', {
    tier: 'premium',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Update user properties
 * With Supabase, user properties are tracked via event properties
 * This is a no-op for API compatibility
 */
export function updateUserProperties(): void {
  // No-op: User properties are automatically tracked via events in Supabase
  console.log('[Analytics] User properties tracked via events');
}

/**
 * Reset user identity (on logout)
 * With Supabase, user becomes anonymous when license is removed
 */
export function resetUserIdentity(): void {
  // User will be tracked as anonymous after logout
  // since getLicenseKey() will return null
  console.log('[Analytics] User reset - will track as anonymous');

  // Track sign out event
  trackEvent('sign_out', {
    timestamp: new Date().toISOString(),
  });
}

