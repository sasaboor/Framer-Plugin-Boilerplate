/**
 * Supabase Authentication Service
 * Handles license-based authentication and user management
 */

import { supabase, isSupabaseConfigured } from './client';
import type { User, InsertUser, UpdateUser } from './types';
import { USER_TIERS } from './constants';

/**
 * License validation result
 */
export interface LicenseValidationResult {
  success: boolean;
  user?: User;
  tier: 'free' | 'premium';
  message?: string;
}

/**
 * Authenticate user with license key
 * Calls Edge Function to validate license with Polar.sh
 * Creates or updates user record in Supabase
 */
export async function authenticateWithLicense(
  licenseKey: string
): Promise<LicenseValidationResult> {
  if (!isSupabaseConfigured()) {
    console.warn('[Auth] Supabase not configured, falling back to local validation');
    return {
      success: false,
      tier: 'free',
      message: 'Supabase not configured',
    };
  }

  try {
    // Call Edge Function to validate license with Polar.sh
    const { data, error } = await supabase.functions.invoke('validate-license', {
      body: { license_key: licenseKey },
    });

    if (error) {
      console.error('[Auth] License validation failed:', error);
      return {
        success: false,
        tier: 'free',
        message: error.message || 'License validation failed',
      };
    }

    if (!data || !data.valid) {
      return {
        success: false,
        tier: 'free',
        message: data?.message || 'Invalid license key',
      };
    }

    return {
      success: true,
      user: data.user,
      tier: data.user.tier,
      message: 'License validated successfully',
    };
  } catch (err) {
    console.error('[Auth] License validation error:', err);
    return {
      success: false,
      tier: 'free',
      message: 'An error occurred during validation',
    };
  }
}

/**
 * Get user profile by license key
 */
export async function getUserByLicenseKey(licenseKey: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('license_key', licenseKey)
      .single();

    if (error) {
      console.error('[Auth] Error fetching user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Auth] Error in getUserByLicenseKey:', err);
    return null;
  }
}

/**
 * Get user profile by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Auth] Error fetching user by ID:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Auth] Error in getUserById:', err);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: InsertUser): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('[Auth] Error creating user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Auth] Error in createUser:', err);
    return null;
  }
}

/**
 * Update user data
 */
export async function updateUser(userId: string, updates: UpdateUser): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Auth] Error updating user:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[Auth] Error in updateUser:', err);
    return null;
  }
}

/**
 * Get current user tier (from Supabase or fallback to localStorage)
 */
export async function getCurrentTier(licenseKey: string | null): Promise<'free' | 'premium'> {
  if (!licenseKey) {
    return USER_TIERS.FREE;
  }

  if (!isSupabaseConfigured()) {
    // Fallback to local validation if Supabase not configured
    return licenseKey ? USER_TIERS.PREMIUM : USER_TIERS.FREE;
  }

  try {
    const user = await getUserByLicenseKey(licenseKey);
    return user?.tier || USER_TIERS.FREE;
  } catch (err) {
    console.error('[Auth] Error getting tier:', err);
    return USER_TIERS.FREE;
  }
}

/**
 * Check if user has premium access
 */
export async function hasPremiumAccess(licenseKey: string | null): Promise<boolean> {
  if (!licenseKey) {
    return false;
  }

  const tier = await getCurrentTier(licenseKey);
  return tier === USER_TIERS.PREMIUM;
}

/**
 * Sync offline license data to Supabase
 * Called when coming back online or on first Supabase connection
 */
export async function syncOfflineData(licenseKey: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    // Call Edge Function to sync offline usage data
    const { data, error } = await supabase.functions.invoke('sync-usage', {
      body: { license_key: licenseKey },
    });

    if (error) {
      console.error('[Auth] Offline sync failed:', error);
      return false;
    }

    return data?.success || false;
  } catch (err) {
    console.error('[Auth] Error in syncOfflineData:', err);
    return false;
  }
}

/**
 * Logout user and clear active session in database
 * This allows another user to log in with the same license key
 */
export async function logoutUser(licenseKey: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    console.warn('[Auth] Supabase not configured, skipping logout sync');
    return true; // Return true so local logout still works
  }

  try {
    // Call logout Edge Function to clear active session
    const { data, error } = await supabase.functions.invoke('logout', {
      body: { license_key: licenseKey },
    });

    if (error) {
      console.error('[Auth] Logout failed:', error);
      return false;
    }

    console.log('[Auth] Logout successful:', data?.message);
    return data?.success || false;
  } catch (err) {
    console.error('[Auth] Error in logoutUser:', err);
    return false;
  }
}
