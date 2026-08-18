import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  trackError,
  isLocalStorageAvailable,
  safeLocalStorage,
  validateLicenseKeyFormat,
  isNetworkError,
  retryWithBackoff,
} from './errorHandling';
import * as supabaseAnalytics from '../analytics/supabase';

// Mock the analytics module
vi.mock('../analytics/supabase', () => ({
  trackError: vi.fn(),
}));

describe('errorHandling utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('trackError', () => {
    it('should track error with Supabase analytics', () => {
      trackError('network', 'Connection failed', { code: 500 });

      expect(supabaseAnalytics.trackError).toHaveBeenCalledWith(
        'network',
        'Connection failed',
        { code: 500 }
      );
    });

    it('should handle tracking failures gracefully', () => {
      vi.mocked(supabaseAnalytics.trackError).mockImplementation(() => {
        throw new Error('Analytics unavailable');
      });

      // Should not throw
      expect(() => trackError('api', 'Error')).not.toThrow();
    });
  });

  describe('isLocalStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(isLocalStorageAvailable()).toBe(false);

      setItemSpy.mockRestore();
    });
  });

  describe('safeLocalStorage', () => {
    describe('getItem', () => {
      it('should get item from localStorage', () => {
        localStorage.setItem('test-key', 'test-value');

        expect(safeLocalStorage.getItem('test-key')).toBe('test-value');
      });

      it('should return null if item does not exist', () => {
        expect(safeLocalStorage.getItem('non-existent')).toBeNull();
      });

      it('should return null if localStorage is unavailable', () => {
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
        getItemSpy.mockImplementation(() => {
          throw new Error('localStorage disabled');
        });

        expect(safeLocalStorage.getItem('test')).toBeNull();

        getItemSpy.mockRestore();
      });
    });

    describe('setItem', () => {
      it('should set item in localStorage', () => {
        const result = safeLocalStorage.setItem('test-key', 'test-value');

        expect(result).toBe(true);
        expect(localStorage.getItem('test-key')).toBe('test-value');
      });

      it('should return false if localStorage is unavailable', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
        setItemSpy.mockImplementation(() => {
          throw new Error('QuotaExceededError');
        });

        expect(safeLocalStorage.setItem('test', 'value')).toBe(false);

        setItemSpy.mockRestore();
      });
    });

    describe('removeItem', () => {
      it('should remove item from localStorage', () => {
        localStorage.setItem('test-key', 'test-value');

        const result = safeLocalStorage.removeItem('test-key');

        expect(result).toBe(true);
        expect(localStorage.getItem('test-key')).toBeNull();
      });

      it('should return false if localStorage is unavailable', () => {
        const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
        removeItemSpy.mockImplementation(() => {
          throw new Error('localStorage disabled');
        });

        expect(safeLocalStorage.removeItem('test')).toBe(false);

        removeItemSpy.mockRestore();
      });
    });
  });

  describe('validateLicenseKeyFormat', () => {
    it('should validate correct license key format', () => {
      const result = validateLicenseKeyFormat('valid-license-key-123');

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty string', () => {
      const result = validateLicenseKeyFormat('');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('License key is required');
    });

    it('should reject whitespace-only string', () => {
      const result = validateLicenseKeyFormat('   ');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('License key cannot be empty');
    });

    it('should reject keys that are too short', () => {
      const result = validateLicenseKeyFormat('short');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('License key is too short');
    });

    it('should reject keys that are too long', () => {
      const longKey = 'a'.repeat(201);
      const result = validateLicenseKeyFormat(longKey);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('License key is too long');
    });

    it('should reject keys with invalid characters', () => {
      const result = validateLicenseKeyFormat('invalid@license#key!');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('License key contains invalid characters');
    });

    it('should reject non-string values', () => {
      const result = validateLicenseKeyFormat(null as any);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('License key is required');
    });

    it('should accept keys with hyphens and underscores', () => {
      const result = validateLicenseKeyFormat('valid_license-key_123');

      expect(result.valid).toBe(true);
    });
  });

  describe('isNetworkError', () => {
    it('should detect fetch errors', () => {
      const error = new Error('Failed to fetch');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should detect network errors', () => {
      const error = new Error('network timeout');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should detect connection refused errors', () => {
      const error = { code: 'ECONNREFUSED' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('should detect DNS errors', () => {
      const error = { code: 'ENOTFOUND' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new Error('Validation failed');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should handle null/undefined errors', () => {
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValue('success');

      const result = await retryWithBackoff(fn, 2, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw error after max retries', async () => {
      const error = new Error('Persistent failure');
      const fn = vi.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('Persistent failure');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await retryWithBackoff(fn, 2, 100);
      const endTime = Date.now();

      // Should take at least 100ms (first retry) + 200ms (second retry) = 300ms
      // Using a buffer for test timing reliability
      expect(endTime - startTime).toBeGreaterThanOrEqual(250);
    });

    it('should work with custom retry count', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryWithBackoff(fn, 0, 10)).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(1); // No retries
    });
  });
});
