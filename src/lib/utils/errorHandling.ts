/**
 * Error Handling Utilities
 */

import { trackError as supabaseTrackError } from '../analytics/supabase';

/**
 * Track error with Supabase analytics
 */
export function trackError(
  type: 'network' | 'invalid_license' | 'storage' | 'validation' | 'api' | 'unknown',
  errorMessage: string,
  additionalData?: Record<string, any>
): void {
  try {
    supabaseTrackError(type, errorMessage, additionalData);
  } catch (error) {
    // Failed to track error
    console.error('[ErrorHandling] Failed to track error:', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    trackError('storage', 'localStorage is not available or disabled');
    return false;
  }
}

/**
 * Safe localStorage operations
 */
export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (!isLocalStorageAvailable()) return null;
      return localStorage.getItem(key);
    } catch (error) {
      trackError('storage', `Failed to get item: ${key}`, { error: String(error) });
      return null;
    }
  },

  setItem(key: string, value: string): boolean {
    try {
      if (!isLocalStorageAvailable()) {
        trackError('storage', 'Cannot set item - localStorage unavailable', { key });
        return false;
      }
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      trackError('storage', `Failed to set item: ${key}`, { error: String(error) });
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (!isLocalStorageAvailable()) return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      trackError('storage', `Failed to remove item: ${key}`, { error: String(error) });
      return false;
    }
  }
};

/**
 * Validate license key format
 */
export function validateLicenseKeyFormat(key: string): { valid: boolean; error?: string } {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'License key is required' };
  }

  const trimmed = key.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'License key cannot be empty' };
  }

  if (trimmed.length < 10) {
    return { valid: false, error: 'License key is too short' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'License key is too long' };
  }

  // Check for invalid characters (basic validation)
  if (!/^[a-zA-Z0-9\-_]+$/.test(trimmed)) {
    return { valid: false, error: 'License key contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('Failed to fetch') ||
    error?.code === 'ECONNREFUSED' ||
    error?.code === 'ENOTFOUND' ||
    !navigator.onLine
  );
}

/**
 * Retry wrapper for async functions
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}


