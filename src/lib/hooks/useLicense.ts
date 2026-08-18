/**
 * Custom hook for license management
 * 
 * Handles license validation, storage, and access control
 */

import { useState, useCallback, useEffect } from 'react';
import { storage } from '../config/localStorage';
import { authenticateWithLicense, logoutUser } from '../supabase/auth';
import { isSupabaseConfigured } from '../supabase/client';
import { identifyUser, updateUserProperties, resetUserIdentity } from '../analytics/userIdentification';
import { trackEvent } from '../analytics/supabase';
import {
  validateLicenseKeyFormat,
  isNetworkError,
  retryWithBackoff,
  trackError,
  safeLocalStorage
} from '../utils/errorHandling';

export interface LicenseState {
  hasLicense: boolean;
  licenseKey: string | null;
  isValidating: boolean;
  error: string | null;
  tier: 'free' | 'premium';
}

export function useLicense() {
  const [state, setState] = useState<LicenseState>({
    hasLicense: storage.hasValidLicense(),
    licenseKey: storage.getLicenseKey(),
    isValidating: false,
    error: null,
    tier: storage.hasValidLicense() ? 'premium' : 'free',
  });

  /**
   * Validate and activate a license key
   */
  const activateLicense = useCallback(async (key: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isValidating: true, error: null }));

    // Track license entry attempt
    trackEvent('license_activated', { license_key_length: key.length });

    try {
      // Validate format first (before API call)
      const formatValidation = validateLicenseKeyFormat(key);
      if (!formatValidation.valid) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          error: formatValidation.error || 'Invalid license key format',
        }));
        
        trackError('validation', formatValidation.error || 'Invalid format', {
          key_length: key.length
        });
        trackEvent('license_invalid', { reason: 'invalid_format' });
        
        return false;
      }

      // Validate with API (with retry mechanism)
      const result = await retryWithBackoff(async () => {
        return await authenticateWithLicense(key);
      }, 2, 1000);

      if (result.success) {
        // Try to save to localStorage
        const saved = safeLocalStorage.setItem('framer_plugin_license_key', key);

        if (!saved) {
          setState(prev => ({
            ...prev,
            isValidating: false,
            error: 'Cannot save license. Please enable localStorage in your browser.',
          }));

          trackError('storage', 'Failed to save license key');
          return false;
        }

        // Save validation timestamp and online status
        const now = Date.now();
        storage.setLastValidationTimestamp(now);
        storage.setLastOnlineAt(now);

        // Save expiration date if provided
        if (result.expires_at) {
          const expiresAt = new Date(result.expires_at).getTime();
          storage.setLicenseExpiresAt(expiresAt);
        }

        setState({
          hasLicense: true,
          licenseKey: key,
          isValidating: false,
          error: null,
          tier: 'premium',
        });

        // Track successful validation
        trackEvent('license_valid', { license_key_length: key.length });

        // Identify user in analytics
        identifyUser(key);

        return true;
      } else {
        // Handle invalid/expired/revoked licenses
        const errorMsg = result.message || 'Invalid license key. Please check and try again';

        setState(prev => ({
          ...prev,
          isValidating: false,
          error: errorMsg,
        }));

        trackError('invalid_license', errorMsg, {
          reason: errorMsg.toLowerCase().includes('expired') ? 'expired' :
                  errorMsg.toLowerCase().includes('revoked') ? 'revoked' :
                  errorMsg.toLowerCase().includes('already in use') ? 'in_use' : 'invalid'
        });
        trackEvent('license_invalid', {
          reason: errorMsg.toLowerCase().includes('already in use') ? 'concurrent_use' : 'api_rejected'
        });

        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      
      // Check if it's a network error
      if (isNetworkError(error)) {
        setState(prev => ({
          ...prev,
          isValidating: false,
          error: 'Unable to validate license. Please check your connection.',
        }));
        
        trackError('network', 'License validation network error', {
          error: errorMessage
        });
      } else {
        setState(prev => ({
          ...prev,
          isValidating: false,
          error: 'Validation failed. Please try again.',
        }));
        
        trackError('api', errorMessage);
      }

      trackEvent('license_invalid', { error: errorMessage });

      return false;
    }
  }, []);

  /**
   * Remove current license
   */
  const removeLicense = useCallback(async () => {
    const currentLicenseKey = storage.getLicenseKey();

    // Clear active session in Supabase (if configured)
    if (currentLicenseKey) {
      try {
        await logoutUser(currentLicenseKey);
        console.log('[License] Session cleared in database');
      } catch (error) {
        console.error('[License] Failed to clear session:', error);
        // Continue with local logout even if Supabase fails
      }
    }

    // Clear local storage
    storage.removeLicenseKey();
    storage.clearLastValidationTimestamp();

    // Update state
    setState({
      hasLicense: false,
      licenseKey: null,
      isValidating: false,
      error: null,
      tier: 'free',
    });

    // Reset user identity in analytics
    resetUserIdentity();
  }, []);

  /**
   * Check if user has premium access
   */
  const hasPremiumAccess = useCallback((): boolean => {
    return state.tier === 'premium';
  }, [state.tier]);

  /**
   * Get current user tier
   */
  const getTier = useCallback((): 'free' | 'premium' => {
    return state.tier;
  }, [state.tier]);

  return {
    ...state,
    activateLicense,
    removeLicense,
    hasPremiumAccess,
    getTier,
  };
}

