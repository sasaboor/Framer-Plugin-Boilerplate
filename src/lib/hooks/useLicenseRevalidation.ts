/**
 * License Revalidation Hook
 * 
 * Periodically validates the license key with Polar.sh to ensure it's still active.
 * Removes expired or revoked licenses automatically.
 */

import { useEffect, useCallback, useRef } from 'react';
import { storage } from '../config/localStorage';
import { validateLicenseKey } from '../payments/polar';
import { trackEvent } from '../analytics/supabase';

interface RevalidationOptions {
  onLicenseInvalid?: () => void;
  onLicenseExpired?: () => void;
  onOfflineTooLong?: () => void;
  checkInterval?: number; // in milliseconds
  checkOnMount?: boolean;
}

/**
 * Hook for periodic license revalidation
 * 
 * @param options Configuration options
 * @returns Object with revalidation functions
 */
export function useLicenseRevalidation(options: RevalidationOptions = {}) {
  const {
    onLicenseInvalid,
    onLicenseExpired,
    onOfflineTooLong,
    checkInterval = 60 * 60 * 1000, // Default: 1 hour
    checkOnMount = true,
  } = options;

  const isValidatingRef = useRef(false);
  const hasCheckedOnMountRef = useRef(false);

  /**
   * Perform license revalidation
   */
  const revalidateLicense = useCallback(async () => {
    // Prevent concurrent validations
    if (isValidatingRef.current) {
      return;
    }

    const licenseKey = storage.getLicenseKey();

    // No license to validate
    if (!licenseKey) {
      return;
    }

    // Check if client-side license has expired (based on stored expires_at)
    if (storage.isLicenseExpired()) {
      console.log('[Revalidation] License expired (client-side check)');

      trackEvent('license_expired_client_check', {
        expires_at: storage.getLicenseExpiresAt(),
      });

      // Clear license and trigger expiration callback
      storage.removeLicenseKey();
      storage.clearLastValidationTimestamp();
      storage.clearLicenseExpiresAt();

      if (onLicenseExpired) {
        onLicenseExpired();
      }

      window.dispatchEvent(new Event('auth-state-changed'));
      return;
    }

    // Check if user has been offline too long (>7 days)
    if (storage.isOfflineTooLong(7)) {
      console.log('[Revalidation] User offline too long:', storage.getDaysOffline(), 'days');

      trackEvent('offline_too_long', {
        days_offline: storage.getDaysOffline(),
      });

      // Trigger offline callback (will show OfflineBlockModal)
      if (onOfflineTooLong) {
        onOfflineTooLong();
      }
      return;
    }

    // Check if revalidation is needed based on timestamp
    if (!storage.shouldRevalidateLicense()) {
      return;
    }

    isValidatingRef.current = true;

    try {
      const result = await validateLicenseKey(licenseKey);

      if (result.valid) {
        // License is still valid, update timestamps
        const now = Date.now();
        storage.setLastValidationTimestamp(now);
        storage.setLastOnlineAt(now);

        // Store expires_at if provided
        if (result.expires_at) {
          const expiresAt = new Date(result.expires_at).getTime();
          storage.setLicenseExpiresAt(expiresAt);
        }

        trackEvent('license_revalidated', {
          status: 'valid',
          expires_at: result.expires_at || null,
        });
      } else {
        // License is no longer valid

        // Track the failure reason
        trackEvent('license_revalidation_failed', {
          status: result.status || 'invalid',
          reason: result.message,
        });

        // Remove the invalid license
        storage.removeLicenseKey();
        storage.clearLastValidationTimestamp();
        storage.clearLicenseExpiresAt();

        // Trigger appropriate callback
        if (result.status === 'expired' && onLicenseExpired) {
          onLicenseExpired();
        } else if (onLicenseInvalid) {
          onLicenseInvalid();
        }

        // Dispatch event to trigger auth state change
        window.dispatchEvent(new Event('auth-state-changed'));
      }
    } catch (error) {
      // License revalidation error (probably offline)

      trackEvent('license_revalidation_error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Don't remove license on error to avoid disrupting user
      // They can continue using until next successful validation
      // But we DON'T update last_online_at since validation failed
    } finally {
      isValidatingRef.current = false;
    }
  }, [onLicenseInvalid, onLicenseExpired, onOfflineTooLong]);

  /**
   * Check license on mount if enabled
   */
  useEffect(() => {
    if (checkOnMount && !hasCheckedOnMountRef.current) {
      hasCheckedOnMountRef.current = true;
      
      // Small delay to avoid blocking initial render
      const timeoutId = setTimeout(() => {
        revalidateLicense();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [checkOnMount, revalidateLicense]);

  /**
   * Set up periodic revalidation interval
   */
  useEffect(() => {
    // Only set up interval if there's a license
    const licenseKey = storage.getLicenseKey();
    if (!licenseKey) {
      return;
    }

    const intervalId = setInterval(() => {
      revalidateLicense();
    }, checkInterval);

    return () => clearInterval(intervalId);
  }, [checkInterval, revalidateLicense]);

  return {
    revalidateLicense,
  };
}

