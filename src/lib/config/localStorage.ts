/**
 * LocalStorage Keys Configuration
 * 
 * Centralizes all localStorage keys used in the application.
 */

export const STORAGE_KEYS = {
  // License management
  LICENSE_KEY: 'framer_plugin_license_key',
  LICENSE_LAST_VALIDATED: 'framer_plugin_license_last_validated',
  LICENSE_EXPIRES_AT: 'framer_plugin_license_expires_at',
  LAST_ONLINE_AT: 'framer_plugin_last_online_at',

  // User preferences
  THEME_PREFERENCE: 'framer_plugin_theme',
  LAST_AUDIT_RESULTS: 'framer_plugin_last_audit',
} as const;

/**
 * Initialize localStorage keys with default values
 */
export function initializeLocalStorage(): void {
  try {
    // Test if localStorage is available
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
  } catch (error) {
    // localStorage is not available
    // Gracefully continue - app will work in memory only
  }
}

/**
 * Helper functions for localStorage operations
 */
export const storage = {
  // License key management
  getLicenseKey(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.LICENSE_KEY);
    } catch (error) {
      // Error reading license key
      return null;
    }
  },
  
  setLicenseKey(key: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, key);
    } catch (error) {
      // Error saving license key
      throw new Error('Cannot save license. Please enable localStorage.');
    }
  },
  
  removeLicenseKey(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LICENSE_KEY);
    } catch (error) {
      // Error removing license key
    }
  },
  
  hasValidLicense(): boolean {
    try {
      const key = this.getLicenseKey();
      return key !== null && key.length > 0;
    } catch (error) {
      // Error checking license
      return false;
    }
  },

  // License validation timestamp management
  getLastValidationTimestamp(): number | null {
    try {
      const value = localStorage.getItem(STORAGE_KEYS.LICENSE_LAST_VALIDATED);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      // Error reading validation timestamp
      return null;
    }
  },
  
  setLastValidationTimestamp(timestamp: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LICENSE_LAST_VALIDATED, String(timestamp));
    } catch (error) {
      // Error saving validation timestamp
    }
  },
  
  clearLastValidationTimestamp(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LICENSE_LAST_VALIDATED);
    } catch (error) {
      // Error clearing validation timestamp
    }
  },
  
  shouldRevalidateLicense(): boolean {
    try {
      const lastValidated = this.getLastValidationTimestamp();
      if (!lastValidated) return true;

      // Revalidate every 1 hour (3600000 ms)
      const oneHour = 60 * 60 * 1000;
      const now = Date.now();

      return (now - lastValidated) > oneHour;
    } catch (error) {
      // Error checking revalidation need
      return true; // Revalidate on error to be safe
    }
  },

  // License expiry tracking (for offline validation)
  getLicenseExpiresAt(): number | null {
    try {
      const value = localStorage.getItem(STORAGE_KEYS.LICENSE_EXPIRES_AT);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      return null;
    }
  },

  setLicenseExpiresAt(timestamp: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LICENSE_EXPIRES_AT, String(timestamp));
    } catch (error) {
      // Error saving expiry timestamp
    }
  },

  clearLicenseExpiresAt(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LICENSE_EXPIRES_AT);
    } catch (error) {
      // Error clearing expiry timestamp
    }
  },

  isLicenseExpired(): boolean {
    try {
      const expiresAt = this.getLicenseExpiresAt();
      if (!expiresAt) return false; // No expiry date = lifetime license

      return Date.now() > expiresAt;
    } catch (error) {
      return false;
    }
  },

  // Offline tracking
  getLastOnlineAt(): number | null {
    try {
      const value = localStorage.getItem(STORAGE_KEYS.LAST_ONLINE_AT);
      return value ? parseInt(value, 10) : null;
    } catch (error) {
      return null;
    }
  },

  setLastOnlineAt(timestamp: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ONLINE_AT, String(timestamp));
    } catch (error) {
      // Error saving online timestamp
    }
  },

  getDaysOffline(): number {
    try {
      const lastOnline = this.getLastOnlineAt();
      if (!lastOnline) return 0;

      const now = Date.now();
      const msPerDay = 24 * 60 * 60 * 1000;

      return Math.floor((now - lastOnline) / msPerDay);
    } catch (error) {
      return 0;
    }
  },

  isOfflineTooLong(maxDays: number = 7): boolean {
    try {
      return this.getDaysOffline() > maxDays;
    } catch (error) {
      return false;
    }
  },
};

