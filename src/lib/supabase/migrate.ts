/**
 * Supabase Migration Utility
 * Migrates localStorage data to Supabase on first connection
 */

import { storage } from '../config/localStorage';
import { getUserByLicenseKey, createUser } from './auth';
import { syncUsageToSupabase } from './usage';
import { isSupabaseConfigured } from './client';

/**
 * Migration status
 */
interface MigrationStatus {
  success: boolean;
  message: string;
  migratedData?: {
    licenseKey?: string;
    totalChecks: number;
    freeCheckUsed: boolean;
  };
}

const MIGRATION_COMPLETE_KEY = 'supabase_migration_complete';

/**
 * Check if migration has already been completed
 */
export function isMigrationComplete(): boolean {
  return localStorage.getItem(MIGRATION_COMPLETE_KEY) === 'true';
}

/**
 * Mark migration as complete
 */
function markMigrationComplete(): void {
  localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
}

/**
 * Migrate localStorage data to Supabase
 * This is a one-time operation for existing users
 */
export async function migrateLocalStorageToSupabase(
  licenseKey: string
): Promise<MigrationStatus> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase not configured',
    };
  }

  if (isMigrationComplete()) {
    console.log('[Migration] Migration already completed, skipping');
    return {
      success: true,
      message: 'Migration already completed',
    };
  }

  console.log('[Migration] Starting localStorage migration to Supabase');

  try {
    // Get localStorage data
    const totalChecks = storage.getTotalChecks();
    const freeCheckUsed = storage.hasFreeCheckBeenUsed();

    console.log('[Migration] Local data:', { licenseKey, totalChecks, freeCheckUsed });

    // Check if user already exists in Supabase
    let user = await getUserByLicenseKey(licenseKey);

    if (!user) {
      console.log('[Migration] User not found, creating new user record');

      // User doesn't exist, Edge Function should have created it
      // But we'll verify by trying to fetch again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      user = await getUserByLicenseKey(licenseKey);

      if (!user) {
        return {
          success: false,
          message: 'User not found in database after license validation',
        };
      }
    }

    console.log('[Migration] User found in database:', user.id);

    // Sync usage data to Supabase
    const syncSuccess = await syncUsageToSupabase(user.id);

    if (!syncSuccess) {
      return {
        success: false,
        message: 'Failed to sync usage data to Supabase',
      };
    }

    // Mark migration as complete
    markMigrationComplete();

    console.log('[Migration] Migration completed successfully');

    return {
      success: true,
      message: 'Data migrated successfully',
      migratedData: {
        licenseKey,
        totalChecks,
        freeCheckUsed,
      },
    };
  } catch (err) {
    console.error('[Migration] Migration failed:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Migration failed',
    };
  }
}

/**
 * Reset migration status (for testing/debugging)
 */
export function resetMigrationStatus(): void {
  localStorage.removeItem(MIGRATION_COMPLETE_KEY);
  console.log('[Migration] Migration status reset');
}

/**
 * Get migration info
 */
export interface MigrationInfo {
  isComplete: boolean;
  hasLocalData: boolean;
  localDataSummary: {
    totalChecks: number;
    freeCheckUsed: boolean;
    hasLicenseKey: boolean;
  };
}

/**
 * Get current migration status and local data summary
 */
export function getMigrationInfo(): MigrationInfo {
  const totalChecks = storage.getTotalChecks();
  const freeCheckUsed = storage.hasFreeCheckBeenUsed();
  const hasLicenseKey = storage.hasValidLicense();

  return {
    isComplete: isMigrationComplete(),
    hasLocalData: totalChecks > 0 || freeCheckUsed || hasLicenseKey,
    localDataSummary: {
      totalChecks,
      freeCheckUsed,
      hasLicenseKey,
    },
  };
}
